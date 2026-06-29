import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js"

import { Bar } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)
import TrainerHeader from "../../../components/trainer/TrainerHeader"

import { useEffect, useState, useRef } from "react"
import { supabase } from "../../../services/supabase"
import "./TrainerDashboard.css"
import CameraPopup from "../../../components/trainer/CameraPopup";

const TrainerDashboard = () => {
  const [trainer, setTrainer] = useState(null)
  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
  const [view, setView] = useState("dashboard")
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [attendance, setAttendance] = useState({})
  const [batchTab, setBatchTab] = useState("attendance")
  const [trainerStatus, setTrainerStatus] = useState(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [signInTime, setSignInTime] = useState("")
  const [signOutTime, setSignOutTime] = useState("")
  const [showCamera, setShowCamera] = useState(false)
  const [cameraMode, setCameraMode] = useState("signin");
  const [capturedImage, setCapturedImage] = useState(null)
  const [batchSearch, setBatchSearch] = useState("")
  const [attendanceSearch, setAttendanceSearch] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [attendanceDate, setAttendanceDate] = useState("")
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState("")
  const [systemMessage, setSystemMessage] = useState(null)
  const [isEditingAttendance, setIsEditingAttendance] = useState(false)
  const [showEditAttendancePopup, setShowEditAttendancePopup] = useState(false)
  const inactivityTimer = useRef(null)
  const resetInactivityTimer = () => {



    clearTimeout(inactivityTimer.current)



    inactivityTimer.current = setTimeout(async () => {



      alert("Session expired due to inactivity.")



      await supabase.auth.signOut()



      window.location.href = "/trainer/login"



    }, 15 * 60 * 1000) // 15 minutes



  }

  const fetchTrainerData = async () => {

    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user

    if (!user) return

    // ✅ get trainer
    const { data: trainerData } = await supabase
      .from("trainers")
      .select("*")
      .eq("user_id", user.id)
      .single()


    if (!trainerData) return

    // 🔥 VERY IMPORTANT PROTECTION
    if (trainerData.status !== "Active") {
      alert("Wait for admin approval")
      return
    }

    setTrainer(trainerData)

    // ✅ get assigned batches
    const { data: batchData } = await supabase
      .from("trainer_batches")
      .select("*")
      .eq("trainer_id", trainerData.user_id)


    const batchList = batchData?.map(b => b.batch_name) || []

    setBatches(batchList)

    // 🔥 VERY IMPORTANT SAFETY
    if (batchList.length === 0) {
      setStudents([])
      return
    }

    // ✅ get students
    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .ilike("status", "active")

    const { data: feeData } = await supabase
      .from("student_fees")
      .select("*")

    const studentsWithFees = (studentData || []).map(student => {

      const matchedFees = feeData.filter(
        fee => String(fee.student_id) === String(student.id)
      )

      const latestFee = matchedFees.sort(
        (a, b) =>
          new Date(b.payment_date) - new Date(a.payment_date)
      )[0]

      return {
        ...student,
        latestFee,
        last_payment_date:
          latestFee?.payment_date ||
          student.last_payment_date ||
          null
      }

    })

    setStudents(studentsWithFees)
  }
  useEffect(() => {

    fetchTrainerData()

    const batchChannel = supabase
      .channel("trainer-batch-listener")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trainer_batches",
        },
        () => {
          console.log("Batch Updated → Auto Refresh")
          fetchTrainerData()
        }
      )
      .subscribe()

    const trainerChannel = supabase
      .channel("trainer-status-listener")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trainers",
        },
        async (payload) => {

          const { data: authData } = await supabase.auth.getUser()
          const user = authData?.user

          if (!user) return

          if (payload.new.user_id === user.id) {

            if (payload.new.status !== "Active") {

              alert("Your account has been disabled by admin")

              await supabase.auth.signOut()

              window.location.href = "/trainer/login"

            }

          }

        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(batchChannel)
      supabase.removeChannel(trainerChannel)
    }

  }, [])

  useEffect(() => {

    resetInactivityTimer()

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll"
    ]

    events.forEach(event =>
      window.addEventListener(event, resetInactivityTimer)
    )

    return () => {

      clearTimeout(inactivityTimer.current)

      events.forEach(event =>
        window.removeEventListener(event, resetInactivityTimer)
      )

    }

  }, [])

  const handleAttendanceClick = (studentId) => {
    setAttendance(prev => {
      const current = prev[studentId]

      // Cycle: undefined → present → absent → undefined
      if (current === undefined) {
        return { ...prev, [studentId]: true }
      }

      if (current === true) {
        return { ...prev, [studentId]: false }
      }

      if (current === false) {
        const updated = { ...prev }
        delete updated[studentId]   // remove value completely
        return updated
      }

      return prev
    })
  }


  const saveAttendance = async (selectedDate) => {

    const dateToSave =
      selectedDate || new Date().toISOString().split("T")[0]

    // ⭐ VERY IMPORTANT CHECK
    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("batch", selectedBatch)
      .eq("date", dateToSave)

    if (existing && existing.length > 0 && !isEditingAttendance) {
      showSystemMessage("Attendance already marked for this date", "warning")
      return
    }

    const records = Object.keys(attendance).map(studentId => {

      const student = students.find(s => s.id == studentId)

      return {
        student_id: studentId,
        student_name: student?.name || "",
        batch: selectedBatch,
        date: dateToSave,
        status: attendance[studentId] === true ? "Present" : "Absent"
      }

    })

    let error;

    if (isEditingAttendance) {

      await supabase
        .from("attendance")
        .delete()
        .eq("batch", selectedBatch)
        .eq("date", dateToSave);

      ({ error } = await supabase
        .from("attendance")
        .insert(records));

    } else {

      ({ error } = await supabase
        .from("attendance")
        .insert(records));

    }

    if (error) {
      console.log(error)
      showSystemMessage("❌ Failed to save attendance", "warning")
      return
    }

    if (!error) {

      const { error: notifError } = await supabase
        .from("notifications")
        .insert([
          {
            message: `📋 ${trainer.name} marked attendance for ${selectedBatch}`
          }
        ])

      if (notifError) {
        console.log("Notification insert failed", notifError)
      }

      showSystemMessage("Attendance Saved Successfully ✅", "success")

      setAttendance({})
      setIsEditingAttendance(false);
      setAttendanceDate("")
      setSelectedAttendanceDate("")

      // Go back to dashboard after 1 second
      setTimeout(() => {
        setView("dashboard")
      }, 1000)
    }

  }

  const handleSignIn = async () => {

    const now = new Date()

    setCameraMode("signin");

    setShowCamera(true)

  }

  const handleSignOut = async () => {
    setCameraMode("signout");
    setShowCamera(true);

  }
  const chartData = {
    labels: batches,
    datasets: [
      {
        label: "Students per Batch",
        data: batches.map(batch =>
          students.filter(s => s.batch === batch).length
        ),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderRadius: 8,
      },
    ],
  }

  const filteredBatches = batches.filter(batch =>
    batch.toLowerCase().includes(batchSearch.toLowerCase())
  )
  const showSystemMessage = (text, type = "success") => {

    setSystemMessage({ text, type })

    setTimeout(() => {
      setSystemMessage(null)
    }, 2000)

  }

  if (!trainer) return <p>Loading...</p>
  if (view === "profile" && trainer) {
    return (
      <div className="trainer-dashboard">

        <div className="hero-section">
          <button onClick={() => setView("dashboard")}>
            ← Back
          </button>
          <h1>Edit Profile</h1>
        </div>

        <div className="profile-form">
          <input
            type="text"
            value={trainer.name}
            onChange={(e) =>
              setTrainer({ ...trainer, name: e.target.value })
            }
            placeholder="Name"
          />

          <input
            type="email"
            value={trainer.email}
            onChange={(e) =>
              setTrainer({ ...trainer, email: e.target.value })
            }
            placeholder="Email"
          />

          <input
            type="text"
            value={trainer.mobile}
            onChange={(e) =>
              setTrainer({ ...trainer, mobile: e.target.value })
            }
            placeholder="Phone"
          />

          <button
            className="save-btn"
            onClick={async () => {
              const { error } = await supabase
                .from("trainers")
                .update({
                  name: trainer.name,
                  email: trainer.email,
                  mobile: trainer.mobile
                })
                .eq("id", trainer.id)

              if (!error) {
                setView("dashboard")
              }
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    )
  }
  if (view === "batch" && selectedBatch) {
    console.log("Selected Batch:", selectedBatch)

    students.forEach(s => {
      console.log(s.name, s.batch_list)
    })

    const batchStudents = students.filter(
      s => s.batch_list?.includes(selectedBatch)
    )
    const filteredAttendanceStudents = batchStudents.filter(student =>
      student.name
        .toLowerCase()
        .includes(attendanceSearch.toLowerCase())
    )
    return (
      <div className="trainer-dashboard">

        <div className="hero-section">
          <button
            onClick={() => setView("dashboard")}
            style={{ marginBottom: "10px" }}
          >
            ← Back
          </button>

          <h1>Batch Details</h1>

          <p
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "white",
              marginTop: "12px",
              wordBreak: "break-word"
            }}
          >
            {selectedBatch}
          </p>
          <p>Total Students: {batchStudents.length}</p>

        </div>

        <div className="batch-tabs">

          <button
            className={batchTab === "trainer" ? "active-tab" : ""}
            onClick={() => setBatchTab("trainer")}
          >
            Trainer Status
          </button>

          <button
            className={batchTab === "attendance" ? "active-tab" : ""}
            onClick={() => setBatchTab("attendance")}
          >
            Attendance
          </button>

          <button
            className={batchTab === "students" ? "active-tab" : ""}
            onClick={() => setBatchTab("students")}
          >
            Student Details
          </button>

        </div>

        {batchTab === "attendance" && (
          <>
            <div className="attendance-search">

              <input
                type="text"
                placeholder=" Search Student..."
                value={attendanceSearch}
                onChange={(e) =>
                  setAttendanceSearch(e.target.value)
                }
              />

            </div>

            <div className="attendance-grid">

              {filteredAttendanceStudents.map((student) => (

                <div
                  key={student.id}
                  className={`seat-card
          ${attendance[student.id] === true ? "present" : ""}
          ${attendance[student.id] === false ? "absent" : ""}
          `}
                  onClick={() => handleAttendanceClick(student.id)}
                >

                  <span>{student.name}</span>

                </div>

              ))}

            </div>

            <div className="calendar-actions">

              <button
                className="calendar-confirm"
                onClick={() => saveAttendance(selectedAttendanceDate)}
              >
                Save Attendance
              </button>

            </div>

          </>
        )}

        {batchTab === "trainer" && (

          <div className="trainer-status-card">

            <h2>Trainer Status</h2>

            <div className="status-row">
              <span>Batch</span>
              <b>{selectedBatch}</b>
            </div>

            <div className="status-row">
              <span>Date</span>
              <b>{new Date().toLocaleDateString()}</b>
            </div>

            <div className="status-row">
              <span>Current Time</span>
              <b>{new Date().toLocaleTimeString()}</b>
            </div>

            <div className="status-row">
              <span>Status</span>
              <b
                style={{
                  color: isSignedIn ? "green" : "#ef4444"
                }}
              >

                {isSignedIn ? "Signed In" : "Not Signed In"}

              </b>
            </div>

            {signInTime && (

              <div className="status-row">

                <span>Sign In Time</span>

                <b>{signInTime}</b>

              </div>

            )}
            {signOutTime && (

              <div className="status-row">

                <span>Sign Out Time</span>

                <b>{signOutTime}</b>

              </div>

            )}

            <div className="trainer-action-buttons">

              <button
                className="signin-btn"
                onClick={handleSignIn}
                disabled={isSignedIn}
              >

                {isSignedIn ? "Signed In" : "Sign In"}

              </button>

              <button
                className="signout-btn"
                disabled={!isSignedIn}
                onClick={handleSignOut}
              >

                Sign Out

              </button>

            </div>

          </div>

        )}

        {batchTab === "students" && (

          <div className="excel-table-container">

            <table className="excel-table">

              <thead>
                <tr>
                  <th className="col-sr">Sr.</th>
                  <th className="col-name">Name</th>
                  <th className="col-date">Join Date</th>
                  <th className="col-fees">Fees</th>

                  <th className="col-status">Status</th>
                </tr>
              </thead>

              <tbody>

                {batchStudents.map((student, index) => (

                  <tr key={student.id}>

                    <td>{index + 1}</td>

                    <td>{student.name}</td>

                    <td>{student.join_date || "-"}</td>

                    <td>₹{student.fees || "-"}</td>



                    <td>
                      {
                        student.latestFee
                          ? "Paid"
                          : "Pending"
                      }
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}
        {showCamera && (

          <CameraPopup
            onClose={() => setShowCamera(false)}

            onCapture={(img) => {

              const now = new Date();

              setCapturedImage(img);

              if (cameraMode === "signin") {

                setSignInTime(now.toLocaleTimeString());

                setIsSignedIn(true);

              } else {

                setSignOutTime(now.toLocaleTimeString());

                setIsSignedIn(false);

              }

              setShowCamera(false);

            }}

          />

        )}
      </div>
    )
  }

  return (
    <div className="trainer-dashboard">

      {/* 🔥 HERO SECTION */}


      {/* 🔎 Search Bar */}
      <div className="batch-search">
        <input
          type="text"
          placeholder="Search batch..."
          value={batchSearch}
          onChange={(e) => setBatchSearch(e.target.value)}
        />
      </div>

      <div className="single-batch-container">
        {filteredBatches.map((batch) => {
          const count = students.filter(
            s => s.batch_list?.includes(batch)
          ).length

          return (
            <div
              key={batch}
              className="single-batch-card"
              onClick={() => {
                setSelectedBatch(batch)
                setShowCalendar(true)

                setAttendanceDate("")
                setSelectedAttendanceDate("")
              }}
            >
              <h2>{batch}</h2>
              <p>{count} Students</p>
            </div>
          )
        })}
      </div>

      {showCalendar && (
        <div className="calendar-overlay">
          <div className="calendar-popup">

            <h2>Select Attendance Date</h2>

            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => {
                setAttendanceDate(e.target.value)
                setSelectedAttendanceDate(e.target.value)
              }}
            />

            <div style={{ marginTop: 20 }}>
              <button
                className="save-btn"
                onClick={async () => {

                  if (!attendanceDate) {
                    showSystemMessage("Please select attendance date", "warning")
                    return
                  }

                  const { data: existing } = await supabase
                    .from("attendance")
                    .select("id")
                    .eq("batch", selectedBatch)
                    .eq("date", attendanceDate)
                    .limit(1)

                  if (existing && existing.length > 0) {

                    setShowEditAttendancePopup(true)
                    return

                    // Load existing attendance
                    const { data: oldAttendance } = await supabase
                      .from("attendance")
                      .select("*")
                      .eq("batch", selectedBatch)
                      .eq("date", attendanceDate)

                    const attendanceMap = {}

                    oldAttendance.forEach(record => {
                      attendanceMap[record.student_id] =
                        record.status === "Present"
                    })

                    setAttendance(attendanceMap)

                    setIsEditingAttendance(true)

                    setShowCalendar(false)

                    setView("batch")

                    return
                  }
                  setSelectedAttendanceDate(attendanceDate)
                  setShowCalendar(false)
                  setView("batch")
                }}
              >
                Continue
              </button>

              <button
                style={{ marginLeft: 10 }}
                onClick={() => setShowCalendar(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
      {showEditAttendancePopup && (
        <div className="calendar-overlay">
          <div className="calendar-popup">

            <h2>Attendance Already Exists</h2>

            <p
              style={{
                marginTop: 20,
                textAlign: "center",
                fontSize: 17
              }}
            >
              Attendance for
              <br />
              <b>{attendanceDate}</b>
              <br /><br />
              Do you want to edit it?
            </p>

            <div
              style={{
                marginTop: 30,
                display: "flex",
                justifyContent: "center",
                gap: 15
              }}
            >

              <button
                className="save-btn"
                onClick={async () => {

                  const { data: oldAttendance } = await supabase
                    .from("attendance")
                    .select("*")
                    .eq("batch", selectedBatch)
                    .eq("date", attendanceDate)

                  const attendanceMap = {}

                  oldAttendance.forEach(record => {
                    attendanceMap[record.student_id] =
                      record.status === "Present"
                  })

                  setAttendance(attendanceMap)

                  setIsEditingAttendance(true)

                  setShowEditAttendancePopup(false)

                  setShowCalendar(false)

                  setView("batch")

                }}
              >
                Edit Attendance
              </button>

              <button
                onClick={() => {
                  setShowEditAttendancePopup(false)
                  setShowCalendar(false)
                }}
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}


      {systemMessage && (
        <div className={`system-message ${systemMessage.type}`}>
          {systemMessage.text}
        </div>
      )}



    </div>
  )

}

export default TrainerDashboard
