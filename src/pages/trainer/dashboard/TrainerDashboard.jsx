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
  useEffect(() => {
    const fetchTrainerData = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user

      if (!user) {
        console.error("Trainer not logged in")
        return
      }

      // ✅ Fetch from trainers table
      const { data: trainerData, error: trainerError } = await supabase
        .from("trainers")
        .select("*")
        .eq("email", user.email)
        .single()

      if (trainerError) {
        console.error(trainerError)
        return
      }

      setTrainer(trainerData)
      // ✅ Fetch trainer batches from relation table
      const { data: batchData, error: batchError } = await supabase
        .from("trainer_batches")
        .select("batch_name")
        .eq("trainer_id", trainerData.user_id)

      if (batchError) {
        console.error(batchError)
      } else {
        const batchList = batchData.map(b => b.batch_name)
        setBatches(batchList)
      }
      // ✅ If you want batches from column (comma separated)

      // ✅ Fetch students assigned to trainer batches
      if (trainerData) {
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("trainer_id", trainerData.user_id)

        if (studentError) {
          console.error(studentError)
        } else {
          setStudents(studentData)
        }
      }

    }

    fetchTrainerData()
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





    </div>
  )

}

export default TrainerDashboard
