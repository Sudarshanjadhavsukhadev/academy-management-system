import { useEffect, useState } from "react"
import { supabase } from "../../../services/supabase"
import Cropper from "react-easy-crop"

import "./Students.css"

function Students({ goDashboard }) {
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropModal, setShowCropModal] = useState(false)
  // 👇 ADD THESE LINES
  const [systemMessage, setSystemMessage] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activities, setActivities] = useState([])
  const [activityBatches, setActivityBatches] = useState({})
  const [batchFees, setBatchFees] = useState({})
  const [selectedBranches, setSelectedBranches] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    activity: [],
    branch: "",
    batch: "",
    join_date: "",
    "Whatsapp Number": "",
    fees: "",
    dob: "",
    reference: "",
    profile_photo: "",   // ✅ ADD THIS LINE
    status: "Active",
  })
  // ✅ Course Options
  const courseOptions = ["Karate", "KickBoxing", "Dance"]
  const [customCourse, setCustomCourse] = useState("")
  const [editingStudentId, setEditingStudentId] = useState(null)

  // 🔥 Branch Overview States
  const [branchTrainers, setBranchTrainers] = useState([])
  const [batchStats, setBatchStats] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [trainers, setTrainers] = useState([])
  const [batches, setBatches] = useState([])
  // 🔹 Attendance system – step 2 (branch)
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState(null)

  const [showBranchModal, setShowBranchModal] = useState(false)
  const [newBranchName, setNewBranchName] = useState("")

  useEffect(() => {
    fetchBranches()
    fetchActivities()   // ⭐ ADD THIS
  }, [])

  // 🔹 Fetch branches
  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("*")


    if (error) {
      console.error(error)
    } else {
      setBranches(data)
    }
  }
  const fetchTrainers = async (branchName) => {
    const { data, error } = await supabase
      .from("trainers")
      .select("*")
      .eq("branch", branchName)

    if (!error) {
      setTrainers(data)
    }
  }
  const fetchBatches = async (branchName) => {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("branch", branchName)

    if (error) {
      console.error(error)
    } else {
      setBatches((prev) => {
        // Keep old batches and add only new unique ones
        const combined = [...prev, ...(data || [])]

        const uniqueBatches = combined.filter(
          (batch, index, self) =>
            index === self.findIndex((b) => b.id === batch.id)
        )

        return uniqueBatches
      })
    }
  }

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")

    if (!error) {
      setActivities(data)
    }
  }

  // 🔥 Fetch branch overview (trainers + batch stats)
  const fetchBranchOverview = async (branchName) => {

    // 1️⃣ Get trainers of this branch
    const { data: trainersData } = await supabase
      .from("trainers")
      .select("*")
      .eq("branch", branchName)

    setBranchTrainers(trainersData || [])

    // 2️⃣ Get students of this branch
    const { data: studentsData } = await supabase
      .from("students")
      .select("*")
      .eq("branch", branchName)

    setTotalStudents(studentsData?.length || 0)

    // 3️⃣ Count students per batch
    const batchCountMap = {}

    studentsData?.forEach((student) => {
      const batch = student.batch
      batchCountMap[batch] = (batchCountMap[batch] || 0) + 1
    })

    const formattedStats = Object.entries(batchCountMap).map(
      ([batch, count]) => ({
        batch,
        count,
      })
    )

    setBatchStats(formattedStats)
  }
  const showMessage = (msg) => {
    setSystemMessage(msg)

    setTimeout(() => {
      setSystemMessage("")
    }, 3000)
  }

  const handleAddBranch = async () => {
    if (!newBranchName.trim()) {
      alert("Enter branch name")
      return
    }

    const { data, error } = await supabase
      .from("branches")
      .insert([{ name: newBranchName }])
      .select()

    if (error) {
      alert("Failed to add branch")
      console.error(error)
    } else {
      setNewBranchName("")
      setShowBranchModal(false)
      fetchBranches()

      // 🔥 auto select newly created branch
      if (data && data.length > 0) {
        setSelectedBranch(data[0])
        fetchStudents(data[0].name)
      }
    }
  }


  const fetchStudents = async (branchName = null) => {
    let query = supabase
      .from("students")
      .select(`
      *,
      trainers (
        id,
        name
      )
    `)
      .order("join_date", { ascending: false })

    if (branchName) {
      query = query.eq("branch", branchName)
    }

    const { data, error } = await query

    if (error) console.error(error)
    else setStudents(data)
  }



  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const deleteStudent = async (id) => {
    await supabase.from("students").delete().eq("id", id)
    fetchStudents(selectedBranch.name)
  }


  const deleteSelected = async () => {
    await supabase.from("students").delete().in("id", selected)
    setSelected([])
    fetchStudents(selectedBranch.name)
  }



  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      setImageSrc(reader.result)
      setShowCropModal(true)
    }

    reader.readAsDataURL(file)
  }
  const onCropComplete = (croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }
  const getCroppedImg = async (imageSrc, crop) => {

    const image = new Image()
    image.src = imageSrc

    await new Promise((resolve) => {
      image.onload = resolve
    })

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, "image/jpeg")
    })
  }
  const uploadCroppedImage = async () => {

    setUploading(true)

    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)

    const formDataUpload = new FormData()
    formDataUpload.append("file", croppedBlob)
    formDataUpload.append("upload_preset", "dtjyggwjd")

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dtjyggwjd/image/upload",
      {
        method: "POST",
        body: formDataUpload
      }
    )

    const data = await res.json()

    if (data.secure_url) {
      setFormData((prev) => ({
        ...prev,
        profile_photo: data.secure_url
      }))
    }

    setUploading(false)
    setShowCropModal(false)
  }
  const handleAddStudent = async () => {
    console.log("Submitting:", formData)

    // Get all selected batch names
    const selectedBatchList = Object.values(activityBatches)

    // First batch becomes the primary batch
    const primaryBatch = selectedBatchList[0] || ""

    const { error } = await supabase
      .from("students")
      .insert([
        {
          ...formData,

          // Primary batch (used for backward compatibility)
          batch: primaryBatch,

          // All selected batches
          batch_list: selectedBatchList,

          // Store fees for each batch
          batch_fees: batchFees,

          // Default fee = first selected batch fee
          fees:
            batchFees[primaryBatch] ||
            formData.fees ||
            0
        }
      ])

    if (error) {
      showMessage("Registration Failed")
      console.error(error)
      return
    }

    showMessage("Student Registered Successfully ✅")

    // Refresh students for the first selected branch
    fetchStudents(formData.branch)

    // Reset temporary states
    setActivityBatches({})
    setBatchFees({})
    setSelectedBranches([])
    setBatches([])

    // Reset form
    setFormData({
      name: "",
      activity: [],
      branch: "",
      batch: "",
      join_date: "",
      "Whatsapp Number": "",
      fees: "",
      dob: "",
      reference: "",
      profile_photo: "",
      status: "Active",
    })

    // Go to dashboard after success
    setTimeout(() => {
      goDashboard()
    }, 800)
  }





  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.activity?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase())
  )
  const handleActivitySelect = (value) => {
    if (!value) return

    if (!formData.activity.includes(value)) {
      setFormData({
        ...formData,
        activity: [...formData.activity, value],
      })
    }
  }

  return (
    <div className="students-page">
      {systemMessage && (
        <div className="system-message">
          {systemMessage}
        </div>
      )}
      <div className="registration-card">



        <h2>Student Registration</h2>

        <input
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        <select
          onChange={(e) => {
            handleActivitySelect(e.target.value)
            e.target.value = ""
          }}
        >
          <option value="">Select Activity</option>

          {activities.map((activity) => (
            <option key={activity.id} value={activity.name}>
              {activity.name}
            </option>
          ))}
        </select>
        <div className="selected-activities">
          {formData.activity.map((act) => (
            <div key={act} className="activity-chip">
              {act}
              <span
                onClick={() =>
                  setFormData({
                    ...formData,
                    activity: formData.activity.filter((a) => a !== act),
                  })
                }
              >
                ❌
              </span>
            </div>
          ))}
        </div>

        <select
          onChange={(e) => {
            const branch = e.target.value
            if (!branch) return

            if (!selectedBranches.includes(branch)) {
              const updatedBranches = [...selectedBranches, branch]
              setSelectedBranches(updatedBranches)

              // Keep first selected branch in formData.branch
              setFormData({
                ...formData,
                branch: updatedBranches[0]
              })

              // Load batches from the most recently selected branch
              fetchBatches(branch)
            }

            e.target.value = ""
          }}
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.name}>
              {branch.name}
            </option>
          ))}
        </select>

        <div className="selected-activities">
          {selectedBranches.map((branch) => (
            <div key={branch} className="activity-chip">
              {branch}
              <span
                onClick={() => {
                  const updatedBranches = selectedBranches.filter(
                    (b) => b !== branch
                  )

                  // Update selected branches
                  setSelectedBranches(updatedBranches)

                  // Update formData.branch
                  setFormData({
                    ...formData,
                    branch: updatedBranches[0] || ""
                  })

                  // Clear all currently loaded batches
                  setBatches([])

                  // Reload batches for all remaining selected branches
                  updatedBranches.forEach((branchName) => {
                    fetchBatches(branchName)
                  })
                }}
              >
                ❌
              </span>
            </div>
          ))}
        </div>



        {formData.activity.map((act) => (
          <div key={act} style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Select Batch for {act}
            </label>

            <select
              value=""
              onChange={(e) => {
                const selectedBatch = e.target.value
                if (!selectedBatch) return

                setActivityBatches((prev) => ({
                  ...prev,
                  [act]: selectedBatch,
                }))

                // Reset dropdown after selection
                e.target.value = ""
              }}
            >
              <option value="">Select Batch for {act}</option>

              {batches
                .filter((batch) =>
                  batch.name?.toLowerCase().includes(act.toLowerCase())
                )
                .map((batch) => (
                  <option key={batch.id} value={batch.name}>
                    {batch.name}
                  </option>
                ))}
            </select>

            {/* Show selected batch as chip */}
            {activityBatches[act] && (
              <div
                className="activity-chip"
                style={{ marginTop: "10px", display: "inline-flex" }}
              >
                {activityBatches[act]}
                <span
                  onClick={() =>
                    setActivityBatches((prev) => {
                      const updated = { ...prev }
                      delete updated[act]
                      return updated
                    })
                  }
                >
                  ❌
                </span>
              </div>
            )}

            {activityBatches[act] && (
              <input
                type="number"
                placeholder={`Enter monthly fee for ${act}`}
                value={batchFees[activityBatches[act]] || ""}
                onChange={(e) =>
                  setBatchFees((prev) => ({
                    ...prev,
                    [activityBatches[act]]: Number(e.target.value)
                  }))
                }
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />
            )}
          </div>
        ))}

        <label>Joining Date</label>
        <input
          type="date"
          value={formData.join_date}
          onChange={(e) =>
            setFormData({ ...formData, join_date: e.target.value })
          }
        />

        <input
          placeholder="WhatsApp Number"
          value={formData["Whatsapp Number"]}
          onChange={(e) =>
            setFormData({ ...formData, ["Whatsapp Number"]: e.target.value })
          }
        />



        <label>Birth Date</label>
        <input
          type="date"
          value={formData.dob}
          onChange={(e) =>
            setFormData({ ...formData, dob: e.target.value })
          }
        />


        <label className="upload-label">
          Upload Profile Picture of Student
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
        />
        <select
          value={formData.reference}
          onChange={(e) =>
            setFormData({ ...formData, reference: e.target.value })
          }
        >
          <option value="">How did you hear about us?</option>
          <option>Instagram</option>
          <option>Facebook</option>
          <option>Google</option>
          <option>Friend Referral</option>
          <option>Walk-in</option>
        </select>

        <button className="register-btn" onClick={handleAddStudent}>
          Register Student
        </button>
      </div>
      {showCropModal && (

        <div className="crop-modal">

          <div className="crop-container">

            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />

          </div>

          <button onClick={uploadCroppedImage}>
            {uploading ? "Uploading..." : "Crop & Upload"}
          </button>

        </div>

      )}
    </div>
  )
}

export default Students
