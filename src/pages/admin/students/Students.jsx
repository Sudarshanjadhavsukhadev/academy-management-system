import { useEffect, useState } from "react"
import { supabase } from "../../../services/supabase"
import Cropper from "react-easy-crop"

import "./Students.css"

function Students() {
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropModal, setShowCropModal] = useState(false)
  // 👇 ADD THESE LINES
  const [showAddModal, setShowAddModal] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    activity: "",
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
      setBatches(data)
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

    if (!formData.profile_photo) {
      alert("Please upload profile photo first")
      return
    }

    console.log("Submitting:", formData)

    const { error } = await supabase
      .from("students")
      .insert([formData])

    if (error) {
      alert("Registration failed")
      console.error(error)
    } else {
      alert("Student Registered Successfully!")
      fetchStudents(formData.branch)
      setFormData({
        name: "",
        activity: "",
        branch: "",
        batch: "",
        join_date: "",
        "Whatsapp Number": "",
        fees: "",
        dob: "",
        reference: "",
        profile_photo: "",   // IMPORTANT
        status: "Active",
      })
    }
  }






  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.activity?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="students-page">
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
          value={formData.activity}
          onChange={(e) =>
            setFormData({ ...formData, activity: e.target.value })
          }
        >
          <option value="">Select Activity</option>
          <option>Karate</option>
          <option>Kickboxing</option>
          <option>Dance</option>
        </select>

        <select
          value={formData.branch}
          onChange={(e) => {
            const branch = e.target.value
            setFormData({ ...formData, branch })
            fetchBatches(branch)   // 👈 this loads batches
          }}
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.name}>
              {branch.name}
            </option>
          ))}
        </select>

        <select
          value={formData.batch}
          onChange={(e) =>
            setFormData({ ...formData, batch: e.target.value })
          }
        >
          <option value="">Select Batch</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.name}>
              {batch.name}
            </option>
          ))}
        </select>

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

        <input
          type="number"
          placeholder="Fees Amount"
          value={formData.fees}
          onChange={(e) =>
            setFormData({ ...formData, fees: e.target.value })
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
