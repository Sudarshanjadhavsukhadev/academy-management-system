import { useEffect, useState } from "react"
import { supabase } from "../../../services/supabase"

import "./Students.css"

function Students() {
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")

  // 👇 ADD THESE LINES
  const [showAddModal, setShowAddModal] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    activity: "",
    branch: "",
    batch: "",
    join_date: "",
    whatsapp: "",
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



  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "dtjygwjwd")

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dtjygwjwd/image/upload",
        {
          method: "POST",
          body: data,
        }
      )

      const result = await res.json()

      if (result.secure_url) {
        setFormData((prev) => ({
          ...prev,
          profile_photo: result.secure_url,
        }))
      }
    } catch (error) {
      console.error("Image upload failed:", error)
    }
  }

  const handleAddStudent = async () => {

    console.log("Submitting:", formData)
    
    const { error } = await supabase
      .from("students")
      .insert([formData])

    if (error) {
      alert("Registration failed")
      console.error(error)
    } else {
      alert("Student Registered Successfully!")

      setFormData({
        name: "",
        activity: "",
        branch: "",
        batch: "",
        join_date: "",
        whatsapp: "",
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
      s.course?.toLowerCase().includes(search.toLowerCase()) ||
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
          onChange={(e) =>
            setFormData({ ...formData, branch: e.target.value })
          }
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.name}>
              {branch.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Batch"
          value={formData.batch}
          onChange={(e) =>
            setFormData({ ...formData, batch: e.target.value })
          }
        />

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
          value={formData.whatsapp}
          onChange={(e) =>
            setFormData({ ...formData, whatsapp: e.target.value })
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
    </div>
  )
}

export default Students
