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
import { useEffect, useState } from "react"
import { supabase } from "../../../services/supabase"
import "./TrainerDashboard.css"

const TrainerDashboard = () => {
  const [trainer, setTrainer] = useState(null)
  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
  const [view, setView] = useState("dashboard")
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [attendance, setAttendance] = useState({})
  const [batchSearch, setBatchSearch] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [attendanceDate, setAttendanceDate] = useState("")
  const [systemMessage, setSystemMessage] = useState(null)
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
      .in("batch", batchList)

    setStudents(studentData || [])
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

    if (existing && existing.length > 0) {
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

    const { error } = await supabase
      .from("attendance")
      .insert(records)

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

      showSystemMessage("Attendance Saved Successfully", "success")

      setAttendance({})
      setAttendanceDate("")
    }

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

    setSystemMessage(null)   // ⭐ reset first

    setTimeout(() => {

      setSystemMessage({ text, type })

      setTimeout(() => {
        setSystemMessage(null)
      }, 3000)

    }, 50)

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
    const batchStudents = students.filter(
      s => s.batch === selectedBatch
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

          <h1>{selectedBatch}</h1>
          <p>Total Students: {batchStudents.length}</p>
        </div>

        <div className="attendance-grid">
          {batchStudents.map((student) => {
            const isPresent = attendance[student.id]

            return (
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
            )
          })}
        </div>
        <div className="calendar-actions">
          <button className="calendar-confirm"
            onClick={() => setShowCalendar(true)}
          >
            Save Attendance
          </button>
        </div>
        {showCalendar && (
          <div className="calendar-overlay">

            <div className="calendar-popup">

              <h2>Select Attendance Date</h2>

              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />

              <div style={{ marginTop: 20 }}>

                <button
                  className="save-btn"
                  onClick={() => {
                    saveAttendance(attendanceDate)
                    setShowCalendar(false)
                  }}
                >
                  Confirm
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
      </div>
    )
  }

  return (
    <div className="trainer-dashboard">

      {/* 🔥 HERO SECTION */}
      <div className="hero-section">
        <div>
          <h1>Welcome Back, {trainer.name} 👋</h1>
          <p>{trainer.branch} • {trainer.course}</p>
        </div>

      </div>

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
          const count = students.filter(s => s.batch === batch).length

          return (
            <div
              key={batch}
              className="single-batch-card"
              onClick={() => {
                setSelectedBatch(batch)
                setView("batch")
              }}
            >
              <h2>{batch}</h2>
              <p>{count} Students</p>
            </div>
          )
        })}
      </div>
      {systemMessage && (
        <div className={`system-message ${systemMessage.type}`}>
          {systemMessage.text}
        </div>
      )}



    </div>
  )

}

export default TrainerDashboard
