import { useEffect, useState } from "react"
import { supabase } from "../../../services/supabase"
import "./Attendance.css"

function Attendance({ batchName, goBack }) {

  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("batch", batchName)

    if (error) {
      console.error(error)
    } else {
      setStudents(data)
    }
  }

  const toggleAttendance = (name) => {

    setAttendance(prev => ({
      ...prev,
      [name]: !prev[name]
    }))

  }

  const saveAttendance = async () => {

    const today = new Date().toISOString().split("T")[0]

    const records = students.map(student => ({
      student_name: student.name,
      batch: batchName,
      date: today,
      status: attendance[student.name] ? "Present" : "Absent"
    }))

    const { error } = await supabase
      .from("attendance")
      .insert(records)

    if (error) {
      alert("Error saving attendance")
    } else {
      setShowMessage(true)
    }

  }

  return (
    <div className="attendance-page">

      <h2>Attendance - {batchName}</h2>

      {students.map(student => (

        <div key={student.id} className="attendance-row">

          <span>{student.name}</span>

          <input
            type="checkbox"
            checked={attendance[student.name] || false}
            onChange={() => toggleAttendance(student.name)}
          />

        </div>

      ))}

      <div className="attendance-actions">

        <button onClick={saveAttendance} className="save-attendance">
          Save Attendance
        </button>

        <button onClick={goBack} className="back-btn">
          Back
        </button>

      </div>

      {showMessage && (
        <div className="attendance-modal-overlay">

          <div className="attendance-modal">

            <h3>Attendance Saved Successfully</h3>

            <button
              onClick={() => {
                setShowMessage(false)
                goBack()
              }}
              className="modal-ok-btn"
            >
              OK
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default Attendance