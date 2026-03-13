import { useState, useEffect } from "react"
import { supabase } from "../../../services/supabase"
import Cropper from "react-easy-crop"


import "./Settings.css"

function Settings() {


  const [admin, setAdmin] = useState({
    email: "",
    password: "",
  })

  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const [adminPhoto, setAdminPhoto] = useState("")

  const [verifiedPassword, setVerifiedPassword] = useState(false)


  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropModal, setShowCropModal] = useState(false)

  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPasswordPopup, setShowPasswordPopup] = useState(false)
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [passwordEmail, setPasswordEmail] = useState("")
  const [currentEmail, setCurrentEmail] = useState("")
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn")
    window.location.href = "/admin/login"
  }
  const sendVerificationLink = async (email) => {

    if (email !== admin.email) {
      alert("Please enter your logged in email")
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin + "/admin/settings"
      }
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Verification link sent to your email. Click the link in email to continue.")
    }

  }


  const updateEmail = async () => {

    if (!newEmail) {
      alert("Please enter new email")
      return
    }

    const { error } = await supabase.auth.updateUser({
      email: newEmail
    })

    if (!error) {

      alert("Email updated successfully. Please login again.")

      await supabase.auth.signOut()

      window.location.href = "/admin/login"

    }
  }
  const updatePassword = async () => {

    // 🔒 password validation
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (!error) {

      alert("Password updated successfully")

      await supabase.auth.signOut()

      window.location.href = "/admin/login"

    }

  }
  const updateCredentials = async () => {

    const updates = {}

    if (newEmail) updates.email = newEmail
    if (newPassword) updates.password = newPassword

    const { error } = await supabase.auth.updateUser(updates)

    if (!error) {
      alert("Credentials updated successfully")
    }

  }
  const uploadAdminPhoto = async () => {

    if (!profileImage) {
      alert("Please select image")
      return
    }

    // Upload to Cloudinary
    const formDataUpload = new FormData()
    formDataUpload.append("file", profileImage)
    formDataUpload.append("upload_preset", "dtjyggwjd")

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dtjyggwjd/image/upload",
      {
        method: "POST",
        body: formDataUpload
      }
    )

    const data = await res.json()

    if (!data.secure_url) {
      alert("Image upload failed")
      return
    }

    setAdminPhoto(data.secure_url)

    // 🔥 Get logged in user
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user.id

    // 🔥 Check if profile exists
    await supabase
      .from("profiles")
      .upsert({
        id: userId,
        profile_photo: data.secure_url
      })

    alert("Profile picture updated successfully")
    setShowProfilePopup(false)
    setAdminPhoto(data.secure_url)


  }

  useEffect(() => {
    loadAdminData()
  }, [])
  const loadAdminData = async () => {

    const { data: userData } = await supabase.auth.getUser()

    if (userData?.user) {

      // set real email
      setAdmin({
        email: userData.user.email,
        password: ""
      })

      const userId = userData.user.id

      // load profile photo
      const { data } = await supabase
        .from("profiles")
        .select("profile_photo")
        .eq("id", userId)
        .maybeSingle()

      if (data?.profile_photo) {
        setAdminPhoto(data.profile_photo)
      }

    }

  }
  const handleCropSave = async () => {

    const image = new Image()
    image.src = previewImage

    await new Promise((resolve) => (image.onload = resolve))

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = croppedAreaPixels.width
    canvas.height = croppedAreaPixels.height

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    )

    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], "cropped.jpg", {
        type: "image/jpeg",
      })

      setProfileImage(croppedFile)
      setShowCropModal(false)
      setShowProfilePopup(true)
    })
  }
  return (
    <div className="settings-page">
      <div className="resume-settings">

        {/* LEFT SIDE PROFILE */}
        <div className="resume-left">

          <img
            src={adminPhoto || "https://i.pravatar.cc/150"}
            className="resume-photo"
          />

          <h2>Admin</h2>
          <p>{admin.email}</p>

          <button
            className="primary-btn"
            onClick={() => setShowProfilePopup(true)}
          >
            Change Photo
          </button>

        </div>

        {/* RIGHT SIDE SETTINGS */}
        <div className="resume-right">

          {/* EMAIL SECTION */}
          <div className="resume-card">
            <h3>Email Settings</h3>

            <p>Current Email</p>
            <input value={admin.email} disabled />

            <button
              className="save-btn"
              onClick={() => setShowEmailPopup(true)}
            >
              Update Email
            </button>
          </div>

          {/* PASSWORD SECTION */}
          <div className="resume-card">
            <h3>Password</h3>

            <p>Update your account password</p>

            <button
              className="save-btn"
              onClick={() => setShowPasswordPopup(true)}
            >
              Change Password
            </button>
          </div>

          {/* SYSTEM */}
          <div className="resume-card danger">
            <h3>System</h3>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

        </div>

      </div>
      {showEmailPopup && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Update Email</h3>

            <input
              placeholder="Enter your current email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
            />

            <button
              onClick={() => sendVerificationLink(currentEmail)}
              className="save-btn"
            >
              Send Verification Link
            </button>

            <input
              placeholder="Enter new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <button
              onClick={updateEmail}
              className="save-btn"
            >
              Update Email
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowEmailPopup(false)}
            >
              Cancel
            </button>

          </div>
        </div>
      )}
      {showPasswordPopup && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Update Password</h3>

            <input
              placeholder="Enter Your Email"
              value={passwordEmail}
              onChange={(e) => setPasswordEmail(e.target.value)}
            />

            <button
              onClick={() => sendOTP(passwordEmail)}
              className="save-btn"
            >
              Send OTP
            </button>

            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={verifyOTPPassword}
              className="save-btn"
            >
              Verify OTP
            </button>

            {verifiedPassword && (
              <>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <button
                  onClick={updatePassword}
                  className="save-btn"
                >
                  Update Password
                </button>
              </>
            )}

            <button
              className="cancel-btn"
              onClick={() => setShowPasswordPopup(false)}
            >
              Cancel
            </button>

          </div>
        </div>
      )}
      {showProfilePopup && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Change Profile Photo</h3>

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  setPreviewImage(URL.createObjectURL(file))
                  setShowCropModal(true)
                }
              }}
            />

            <button
              className="save-btn"
              onClick={uploadAdminPhoto}
            >
              Upload Photo
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowProfilePopup(false)}
            >
              Cancel
            </button>

          </div>
        </div>
      )}
      {showCropModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 400, height: 450 }}>

            <h3>Crop Image</h3>

            <div style={{ position: "relative", width: "100%", height: 300 }}>
              <Cropper
                image={previewImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
            />

            <button
              className="save-btn"
              onClick={handleCropSave}
            >
              Save Crop
            </button>

            <button
              className="cancel-btn"
              onClick={() => setShowCropModal(false)}
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
