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
    email: "",
    phone: "",
    course: "",
    batch: "",
    branch: "",
    trainer_id: "",

    join_date: "",
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


  const handleAddStudent = async () => {

    const { branch, ...rest } = formData

    const studentData = {
      ...rest,
      branch: selectedBranch.name
    }


    let error

    // duplicate check
    const { data: existingStudent } = await supabase
      .from("students")
      .select("*")
      .eq("name", studentData.name)
      .eq("branch", studentData.branch)

    if (!editingStudentId && existingStudent.length > 0) {
      alert("Student already exists in this branch!")
      return
    }

    if (editingStudentId) {
      const result = await supabase
        .from("students")
        .update(studentData)
        .eq("id", editingStudentId)

      error = result.error
    } else {
      const result = await supabase
        .from("students")
        .insert([studentData])

      error = result.error
    }

    if (error) {
      console.error(error)
      alert("Operation failed")
    } else {
      setShowAddModal(false)
      setEditingStudentId(null)

      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        batch: "",
        branch: "",
        trainer_id: "",
        join_date: "",
        status: "Active",
      })
      setCustomCourse("")
      fetchStudents(selectedBranch.name)
      fetchBranchOverview(selectedBranch.name)

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
      {/* 🔹 STEP 2: Select Branch (BookMyShow style – first screen) */}
      {!selectedBranch && (
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Select Branch</h2>

            <button
              onClick={() => setShowBranchModal(true)}
              style={{
                padding: "8px 14px",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              + Add Branch
            </button>
          </div>


          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  setSelectedBranch(branch)
                  fetchStudents(branch.name)
                  fetchBranchOverview(branch.name)
                  fetchTrainers(branch.name)   // ✅ ADD THIS
                }}


                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  background: "#fff",
                }}
              >
                {branch.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedBranch && (
        <div className="branch-content">
          {/* 🔥 CHANGE BRANCH BUTTON */}
          <button
            onClick={() => {
              setSelectedBranch(null)
              setStudents([])
            }}
            className="change-branch-btn"
          >
            ← Change Branch
          </button>

          {/* 🔥 BRANCH OVERVIEW (NOW FULL WIDTH) */}
          <div className="branch-overview">
            <h2>Branch Overview - {selectedBranch.name}</h2>

            <div className="overview-cards">
              <div className="card">
                <h4>Total Students</h4>
                <p>{totalStudents}</p>
              </div>

              <div className="card">
                <h4>Total Trainers</h4>
                <p>{branchTrainers.length}</p>
              </div>

              <div className="card">
                <h4>Courses</h4>
                <p>
                  {[...new Set(branchTrainers.map(t => t.course))].join(", ")}
                </p>
              </div>
            </div>

            <div className="batch-stats">
              <h4>Batch Strength</h4>
              {batchStats.map((b) => (
                <p key={b.batch}>
                  {b.batch} → {b.count} Students
                </p>
              ))}
            </div>
          </div>

          <div className="students-header">


            <h1>Students</h1>
            {/* 🔥 Branch Overview */}



            <div className="controls">
              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button
                className="add-btn"
                onClick={() => setShowAddModal(true)}
              >
                + Add Student
              </button>


              <button
                className="delete-btn"
                disabled={selected.length === 0}
                onClick={deleteSelected}
              >
                Delete Selected
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Trainer</th>
                  <th>Batch</th>

                  <th>Branch</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(student.id)}
                        onChange={() => toggleSelect(student.id)}
                      />
                    </td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>{student.course}</td>
                    <td>{student.trainers?.name || "-"}</td>

                    <td>{student.batch}</td>
                    <td>{student.branch}</td>
                    <td>{student.join_date}</td>
                    <td>
                      <span
                        className={`status ${student.status === "Active" ? "active" : "inactive"
                          }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="row-edit"
                        onClick={() => {
                          setFormData({
                            name: student.name,
                            email: student.email,
                            phone: student.phone,
                            course: student.course,
                            batch: student.batch,
                            branch: student.branch,
                            trainer_id: student.trainer_id || "",
                            join_date: student.join_date,
                            status: student.status,
                          })

                          setEditingStudentId(student.id)
                          setShowAddModal(true)
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="row-delete"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this student?")) {
                            deleteStudent(student.id)
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="10" className="no-data">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ADD STUDENT MODAL */}
          {showAddModal && (
            <div className="modal-backdrop">
              <div className="modal">
                <h2>{editingStudentId ? "Edit Student" : "Add Student"}</h2>


                <input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />

                <input
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />

                <input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />

                <select
                  value={formData.course}
                  onChange={(e) => {
                    setFormData({ ...formData, course: e.target.value })
                  }}
                >
                  <option value="">Select Course</option>

                  {courseOptions.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}

                  <option value="custom">Custom</option>
                </select>

                {formData.course === "custom" && (
                  <input
                    placeholder="Enter Custom Course"
                    value={customCourse}
                    onChange={(e) => {
                      setCustomCourse(e.target.value)
                      setFormData({ ...formData, course: e.target.value })
                    }}
                  />
                )}

                <input
                  placeholder="Batch"
                  value={formData.batch}
                  onChange={(e) =>
                    setFormData({ ...formData, batch: e.target.value })
                  }
                />



                <select
                  value={formData.trainer_id}
                  onChange={(e) =>
                    setFormData({ ...formData, trainer_id: e.target.value })
                  }
                >
                  <option value="">Select Trainer</option>

                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={formData.join_date}
                  onChange={(e) =>
                    setFormData({ ...formData, join_date: e.target.value })
                  }
                />

                <div className="modal-actions">
                  <button onClick={handleAddStudent}>
                    {editingStudentId ? "Update" : "Save"}
                  </button>


                  <button onClick={() => setShowAddModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
      {showBranchModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Add New Branch</h2>

            <input
              placeholder="Branch Name"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={handleAddBranch}>Save</button>
              <button onClick={() => setShowBranchModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Students
