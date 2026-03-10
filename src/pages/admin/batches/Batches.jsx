import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Pie, Line } from "react-chartjs-2"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

import { supabase } from "../../../services/supabase"
import { useEffect, useState } from "react"



import "./Batches.css"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

function Batches({ searchStudent }) {
  const [batches, setBatches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState("")
  const [branches, setBranches] = useState([])

  const [search, setSearch] = useState("")

  const [selectedBatch, setSelectedBatch] = useState(null)
  const [showPopup, setShowPopup] = useState(true)
  const [popupStep, setPopupStep] = useState(1)
  const [showMenu, setShowMenu] = useState(false)
  const [showAddBranchPopup, setShowAddBranchPopup] = useState(false)
  const [branchName, setBranchName] = useState("")
  const [showAddBatchPopup, setShowAddBatchPopup] = useState(false)
  const [batchName, setBatchName] = useState("")
  const [batchCourse, setBatchCourse] = useState("")
  const [batchBranch, setBatchBranch] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [trainers, setTrainers] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedTrainer, setSelectedTrainer] = useState("")
  const [batchTrainer, setBatchTrainer] = useState("")
  const [batchTime, setBatchTime] = useState("")
  const [studentStrength, setStudentStrength] = useState(0)
  const [batchDays, setBatchDays] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [batchStudents, setBatchStudents] = useState([])
  const [viewStudent, setViewStudent] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [paymentStudent, setPaymentStudent] = useState(null)
  const [paymentDate, setPaymentDate] = useState(new Date())
  const [attendance, setAttendance] = useState({})
  const [attendanceStats, setAttendanceStats] = useState([])
  const [studentAttendanceChart, setStudentAttendanceChart] = useState(null)
  const [studentAttendanceDates, setStudentAttendanceDates] = useState([])
  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error(error)
    } else {
      setBranches(data)
    }
  }
  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from("trainers")
      .select("*")

    if (error) {
      console.error(error)
    } else {
      setTrainers(data)
    }
  }


  const fetchStudentStrength = async (batchName) => {
    const { count, error } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("batch", batchName)

    if (error) {
      console.error(error)
    } else {
      setStudentStrength(count)
    }
  }
  const fetchBatchStudents = async (batchName) => {

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("batch", batchName)

    if (error) {
      console.error(error)
      return
    }

    const today = new Date()

    for (let student of data) {

      if (!student.join_date) continue

      const joinDate = new Date(student.join_date)

      // next due date based on join date day
      const nextDue = new Date(today.getFullYear(), today.getMonth(), joinDate.getDate())

      // if today's date passed the due date and payment exists
      if (today >= nextDue && student.paid_on) {

        await supabase
          .from("students")
          .update({ paid_on: null })
          .eq("id", student.id)

        student.paid_on = null
      }
    }

    setBatchStudents(data)
  }
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")

    console.log("Courses Data:", data)   // 👈 ADD THIS LINE

    if (error) {
      console.error(error)
    } else {
      setCourses(data)
    }
  }
  const addBranch = async () => {
    if (!branchName.trim()) {
      alert("Please enter branch name")
      return
    }

    const { error } = await supabase
      .from("branches")
      .insert([{ name: branchName }])

    if (error) {
      console.error(error)
    } else {
      setBranchName("")
      setShowAddBranchPopup(false)
      fetchBranches() // refresh branch list
    }
  }
  const deleteBranch = async (id) => {
    const confirmDelete = window.confirm("Delete this branch?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
    } else {
      fetchBranches()
    }
  }
  const addBatch = async () => {
    if (!batchName || !batchCourse || !batchBranch) {
      alert("Please fill all fields")
      return
    }

    const { error } = await supabase
      .from("batches")
      .insert([
        {
          name: batchName,
          course: batchCourse,
          branch: batchBranch,
          trainer: batchTrainer,
          timing: batchTime,
          days: batchDays.join(", ")
        }
      ])

    if (error) {
      console.error(error)
    } else {
      setBatchName("")
      setBatchCourse("")
      setBatchBranch("")
      setBatchTrainer("")
      setBatchTime("")
      setShowAddBatchPopup(false)
      fetchBatches(batchBranch)
    }
  }
  const updateBatch = async () => {

    const { error } = await supabase
      .from("batches")
      .update({
        name: batchName,
        course: batchCourse,
        branch: batchBranch,
        trainer: batchTrainer,
        timing: batchTime,
        days: batchDays.join(", ")
      })
      .eq("id", selectedBatch.id)

    if (error) {
      console.error(error)
    } else {

      alert("Batch Updated")

      setIsEditing(false)

      fetchBatches(batchBranch)

      setSelectedBatch({
        ...selectedBatch,
        name: batchName,
        course: batchCourse,
        branch: batchBranch,
        trainer: batchTrainer,
        timing: batchTime,
        days: batchDays.join(", ")
      })
    }

  }
  const deleteBatch = async (id) => {
    const confirmDelete = window.confirm("Delete this batch?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("batches")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
    } else {
      fetchBatches(batchBranch || selectedBranch)
    }
  }
  const assignTrainer = async () => {
    if (!selectedTrainer || !selectedBatch) {
      alert("Select trainer")
      return
    }

    const { error } = await supabase
      .from("batches")
      .update({ trainer: selectedTrainer })
      .eq("id", selectedBatch.id)

    if (error) {
      console.error(error)
    } else {

      setSelectedBatch({
        ...selectedBatch,
        trainer: selectedTrainer
      })

      fetchBatches(selectedBranch)

      alert("Trainer Assigned")
    }
  }
  useEffect(() => {
    fetchBranches()
    fetchTrainers()
    fetchCourses()
  }, [])
  useEffect(() => {
    setSelectedTrainer("")
  }, [selectedBatch])
  useEffect(() => {
    if (selectedBatch) {
      fetchStudentStrength(selectedBatch.name)
      fetchBatchStudents(selectedBatch.name)
    }
  }, [selectedBatch])

  useEffect(() => {

    if (!searchStudent) return

    setShowPopup(false)   // 🔥 hide branch popup
    setSelectedBranch(searchStudent.branch)

    fetchBatches(searchStudent.branch)

  }, [searchStudent])

  useEffect(() => {

    if (!searchStudent || batches.length === 0) return

    const studentBatch = batches.find(
      batch => batch.name === searchStudent.batch
    )

    if (studentBatch) {
      setSelectedBatch(studentBatch)
      setActiveTab("students")
    }

  }, [batches])
  const fetchBatches = async (branch) => {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("branch", branch)
      .order("id", { ascending: true })

    if (error) {
      console.error(error)
    } else {
      setBatches(data)
    }
  }
  const toggleDay = (day) => {

    if (batchDays.includes(day)) {
      setBatchDays(batchDays.filter(d => d !== day))
    } else {
      setBatchDays([...batchDays, day])
    }

  }

  const toggleStudentStatus = async (student) => {

    const newStatus = student.status === "active" ? "disabled" : "active"

    const updateData = {
      status: newStatus
    }

    // If re-activating student → update join date
    if (newStatus === "active") {
      updateData.join_date = new Date().toISOString().split("T")[0]
    }

    const { error } = await supabase
      .from("students")
      .update(updateData)
      .eq("id", student.id)

    if (error) {
      console.error(error)
    } else {
      fetchBatchStudents(selectedBatch.name)
    }

  }

  const markAttendance = (id, status) => {

    setAttendance(prev => ({
      ...prev,
      [id]: status
    }))

  }
  const fetchAttendanceStats = async () => {

    const { data, error } = await supabase
      .from("attendance")
      .select("*")

    if (error) {
      console.error(error)
      return
    }

    const monthly = {}

    data.forEach((record) => {

      const month = new Date(record.date).toLocaleString("default", { month: "short" })

      if (!monthly[month]) {
        monthly[month] = 0
      }

      if (record.status === "Present") {
        monthly[month] += 1
      }

    })

    const labels = Object.keys(monthly)
    const values = Object.values(monthly)

    setAttendanceStats({
      labels,
      datasets: [
        {
          label: "Monthly Attendance",
          data: values,
          backgroundColor: "#6366f1"
        }
      ]
    })
  }
  useEffect(() => {
    fetchAttendanceStats()
  }, [])

  const fetchStudentAttendanceCalendar = async (studentId) => {

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", studentId)

    if (error) {
      console.error(error)
      return
    }

    const formatted = data.map((record) => ({
      date: new Date(record.date),
      status: record.status
    }))

    setStudentAttendanceDates(formatted)
  }
  const saveAttendance = async () => {

    const today = new Date().toISOString().split("T")[0]

    const records = batchStudents.map(student => ({
      student_id: student.id,
      student_name: student.name,
      batch: selectedBatch.name,
      date: today,
      status: attendance[student.id] === "present" ? "Present" : "Absent"
    }))

    const { error } = await supabase
      .from("attendance")
      .insert(records)

    if (error) {
      console.error(error)
      alert("Error saving attendance")
    } else {
      alert("Attendance saved successfully")
    }

  }



  const filteredBatches = batches

  return (
    <div className="batches-page">

      {/* HEADER */}
      <div className="batches-header">
        <h1>Batches</h1>


      </div>

      {/* BATCH PILLS */}
      {selectedBranch && !showPopup && (
        <div className="batch-section">
          <h2>Select Batch</h2>

          <div className="batch-list">
            {filteredBatches.map((batch) => (
              <button
                key={batch.id}
                className={`batch-pill ${selectedBatch?.id === batch.id ? "active-batch" : ""
                  }`}
                onClick={() => setSelectedBatch(batch)}
              >
                {batch.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BATCH DETAILS */}
      {selectedBatch && (
        <div className="batch-details-card">

          <div className="batch-top-row">

            <div className="batch-actions">
              <button
                className={activeTab === "details" ? "tab-btn active-tab" : "tab-btn"}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>

              <button
                className={activeTab === "students" ? "tab-btn active-tab" : "tab-btn"}
                onClick={() => setActiveTab("students")}
              >
                Students
              </button>

              <button
                className={activeTab === "attendance" ? "tab-btn active-tab" : "tab-btn"}
                onClick={() => setActiveTab("attendance")}
              >
                Attendance
              </button>

              <button
                className={activeTab === "trainer" ? "tab-btn active-tab" : "tab-btn"}
                onClick={() => setActiveTab("trainer")}
              >
                Assign Trainer
              </button>
              <button
                onClick={() => {
                  setIsEditing(true)
                  setBatchName(selectedBatch.name)
                  setBatchCourse(selectedBatch.course)
                  setBatchBranch(selectedBatch.branch)
                  setBatchTrainer(selectedBatch.trainer)
                  setBatchTime(selectedBatch.timing)
                  setBatchDays(selectedBatch.days?.split(", ") || [])
                }}
              >
                Edit
              </button>
            </div>

            <div className="batch-meta">
              <span><strong>Trainer:</strong> {selectedBatch.trainer}</span>
              <span><strong>Students:</strong> {studentStrength}</span>
            </div>

          </div>
          {activeTab === "details" && (
            <>
              <div className="batch-title-row">

                <h3 className="batch-name">{selectedBatch.name}</h3>

                <div className="batch-time-days">
                  <span><strong>Time:</strong> {selectedBatch.timing}</span>
                  <span><strong>Days:</strong> {selectedBatch.days}</span>
                </div>

              </div>
            </>
          )}

          {activeTab === "trainer" && (
            <div>

              <h3>Assign Trainer</h3>

              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                style={{ padding: "10px", marginTop: "10px" }}
              >
                <option value="">Select Trainer</option>

                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.name}>
                    {trainer.name}
                  </option>
                ))}
              </select>

              <div style={{ marginTop: "15px" }}>
                <button onClick={assignTrainer}>
                  Assign Trainer
                </button>
              </div>

            </div>
          )}
          {activeTab === "students" && (
            <div className="students-list">

              <h3>Students Enrolled</h3>

              {batchStudents.length === 0 ? (
                <p>No students in this batch</p>
              ) : (
                <table className="students-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Joining Date</th>
                      <th>Fees Assigned</th>
                      <th>Paid On</th>
                      <th>Action</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {batchStudents.map((student) => (
                      <tr
                        key={student.id}
                        className={student.status === "disabled" ? "disabled-row" : ""}
                      >

                        <td>{student.name}</td>

                        <td>{student.join_date || "-"}</td>

                        <td>{student.fees || "-"}</td>

                        <td>
                          <input
                            type="text"
                            value={student.paid_on || ""}
                            placeholder="dd-mm-yyyy"
                            className="date-input"
                            readOnly
                            onClick={() => {
                              setPaymentStudent(student)
                              setPaymentDate(new Date())
                            }}
                          />
                        </td>

                        <td className="action-buttons">

                          <button
                            className="view-btn"
                            onClick={() => {
                              setViewStudent(student)
                              fetchStudentAttendanceCalendar(student.id)
                            }}
                          >
                            View
                          </button>

                          <button
                            className="edit-btn"
                            onClick={() => setEditingStudent(student)}
                          >
                            Edit
                          </button>

                        </td>
                        <td>

                          <button
                            className={student.status === "active" ? "active-btn" : "disable-btn"}
                            onClick={() => toggleStudentStatus(student)}
                          >
                            {student.status === "active" ? "Active" : "Disabled"}
                          </button>

                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              )}

            </div>
          )}
          {activeTab === "attendance" && (
            <div className="students-list">

              <h3>Attendance</h3>

              {batchStudents.length === 0 ? (
                <p>No students in this batch</p>
              ) : (
                <>
                  <table className="students-table attendance-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Present</th>
                        <th>Absent</th>
                      </tr>
                    </thead>

                    <tbody>
                      {batchStudents
                        .filter(student => student.status === "active")
                        .map((student) => (
                          <tr
                            key={student.id}
                            className={
                              searchStudent?.id === student.id
                                ? "highlight-student"
                                : attendance[student.id] === "present"
                                  ? "present-row"
                                  : attendance[student.id] === "absent"
                                    ? "absent-row"
                                    : ""
                            }
                          >

                            <td>{student.name}</td>

                            <td>
                              <button
                                className="active-btn"
                                onClick={() => markAttendance(student.id, "present")}
                              >
                                Present
                              </button>
                            </td>

                            <td>
                              <button
                                className="disable-btn"
                                onClick={() => markAttendance(student.id, "absent")}
                              >
                                Absent
                              </button>
                            </td>

                          </tr>
                        ))}
                    </tbody>

                  </table>


                  <div style={{ marginTop: "20px" }}>
                    <button
                      className="add-btn"
                      onClick={saveAttendance}
                    >
                      Save Attendance
                    </button>
                  </div>



                </>



              )}

            </div>
          )}
        </div>
      )
      }

      {/* BRANCH SELECT POPUP */}
      {
        showPopup && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <button
                className="close-popup"
                onClick={() => setShowPopup(false)}
              >
                ✕
              </button>

              {popupStep === 1 && (
                <>
                  <h2>Please Select Branch</h2>
                  <p>Select a branch to view batches</p>

                  <div className="popup-branch-list">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        className="popup-branch-btn"
                        onClick={() => {
                          setSelectedBranch(branch.name)
                          fetchBatches(branch.name)
                          setPopupStep(2)
                        }}
                      >
                        {branch.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {popupStep === 2 && (
                <>
                  <h2>Select Batch</h2>

                  <div className="popup-branch-list">
                    {filteredBatches.map((batch) => (
                      <button
                        key={batch.id}
                        className="popup-branch-btn"
                        onClick={() => {
                          setSelectedBatch(batch)
                          setShowPopup(false)
                        }}
                      >
                        {batch.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        )
      }

      {viewStudent && (
        <div className="branch-popup-overlay">
          <div className="student-profile-popup">

            {/* LEFT SIDE */}
            <div className="student-info">

              <h2>Student Profile</h2>

              <img
                src={viewStudent.profile_photo}
                alt="student"
                className="student-photo"
              />

              <div className="student-details-grid">

                <p><strong>Name:</strong> {viewStudent.name}</p>
                <p><strong>Activity:</strong> {viewStudent.activity}</p>

                <p><strong>Branch:</strong> {viewStudent.branch}</p>
                <p><strong>Batch:</strong> {viewStudent.batch}</p>

                <p><strong>Joining Date:</strong> {viewStudent.join_date}</p>
                <p><strong>WhatsApp:</strong> {viewStudent["Whatsapp Number"]}</p>

                <p><strong>Fees:</strong> ₹{viewStudent.fees}</p>
                <p><strong>Date of Birth:</strong> {viewStudent.dob}</p>

                <p><strong>Reference:</strong> {viewStudent.reference}</p>
                <p><strong>Status:</strong> {viewStudent.status}</p>

              </div>
              <button
                className="popup-close-btn"
                onClick={() => setViewStudent(null)}
              >
                ✕
              </button>

            </div>

            {/* RIGHT SIDE */}
            <div className="student-chart">

              <h3>Attendance Chart</h3>

              <Calendar
                tileClassName={({ date }) => {

                  const record = studentAttendanceDates.find(
                    (d) => d.date.toDateString() === date.toDateString()
                  )

                  if (!record) return null

                  if (record.status === "Present") return "present-day"

                  if (record.status === "Absent") return "absent-day"

                }}
              />

            </div>

          </div>
        </div>
      )}
      {/* ADD BRANCH POPUP */}
      {
        showAddBranchPopup && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <h2>Add Branch</h2>

              <input
                type="text"
                placeholder="Enter branch name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                style={{
                  padding: "10px",
                  width: "220px",
                  marginTop: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />

              <div style={{ marginTop: "20px" }}>
                <button onClick={addBranch}>Save</button>

                <button
                  style={{ marginLeft: "10px", background: "#e5e7eb", color: "#111" }}
                  onClick={() => setShowAddBranchPopup(false)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )
      }

      {/* ADD BATCH POPUP */}
      {
        showAddBatchPopup && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <h2>Add Batch</h2>
              <h3 style={{ marginTop: "20px" }}>Existing Batches</h3>

              <div className="existing-batches">

                {batches.map((batch) => (
                  <div key={batch.id} className="existing-batch-item">

                    <span>{batch.name}</span>

                    <button
                      className="delete-batch-btn"
                      onClick={() => deleteBatch(batch.id)}
                    >
                      Delete
                    </button>

                  </div>
                ))}

              </div>

              <div className="batch-form-row">

                <input
                  type="text"
                  placeholder="Batch Name"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="batch-input"
                />

                <select
                  value={batchCourse}
                  onChange={(e) => setBatchCourse(e.target.value)}
                  className="batch-input"
                >
                  <option value="">Select Activity</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>

                <select
                  value={batchBranch}
                  onChange={(e) => setBatchBranch(e.target.value)}
                  className="batch-input"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                <select
                  value={batchTrainer}
                  onChange={(e) => setBatchTrainer(e.target.value)}
                  className="batch-input"
                >
                  <option value="">Select Trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.name}>
                      {trainer.name}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={batchTime}
                  onChange={(e) => setBatchTime(e.target.value)}
                  className="batch-input"
                />
                <div className="days-container">

                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                    <label key={day} className="day-option">

                      <input
                        type="checkbox"
                        checked={batchDays.includes(day)}
                        onChange={() => toggleDay(day)}
                      />

                      {day}

                    </label>
                  ))}

                </div>

              </div>


              <div style={{ marginTop: "20px" }}>
                <button onClick={addBatch}>Save</button>

                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => setShowAddBatchPopup(false)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )
      }
      {
        isEditing && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <h2>Edit Batch</h2>

              <div className="batch-form-row">

                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="batch-input"
                />

                <select
                  value={batchCourse}
                  onChange={(e) => setBatchCourse(e.target.value)}
                  className="batch-input"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>

                <select
                  value={batchBranch}
                  onChange={(e) => setBatchBranch(e.target.value)}
                  className="batch-input"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                <select
                  value={batchTrainer}
                  onChange={(e) => setBatchTrainer(e.target.value)}
                  className="batch-input"
                >
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.name}>
                      {trainer.name}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={batchTime}
                  onChange={(e) => setBatchTime(e.target.value)}
                  className="batch-input"
                />

              </div>

              <div className="days-container">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <label key={day} className="day-option">
                    <input
                      type="checkbox"
                      checked={batchDays.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>

              <div style={{ marginTop: "20px" }}>
                <button onClick={updateBatch}>Update</button>

                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )
      }
      {paymentStudent && (
        <div className="branch-popup-overlay">
          <div className="branch-popup">

            <h3>Select Payment Date</h3>

            <div className="payment-calendar">
              <Calendar
                value={paymentDate}
                onChange={(date) => setPaymentDate(date)}
                showNeighboringMonth={false}
              />
            </div>

            <div style={{ marginTop: "15px" }}>
              <button
                onClick={async () => {

                  const formattedDate =
                    paymentDate.toISOString().split("T")[0]

                  const { error } = await supabase
                    .from("students")
                    .update({ paid_on: formattedDate })
                    .eq("id", paymentStudent.id)

                  if (error) {
                    console.error(error)
                  } else {

                    fetchBatchStudents(selectedBatch.name)

                    setPaymentStudent(null)
                  }
                }}
              >
                Save
              </button>

              <button
                style={{ marginLeft: "10px" }}
                onClick={() => setPaymentStudent(null)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div >
  )
}
export default Batches
