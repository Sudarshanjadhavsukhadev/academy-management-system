import { useState, useEffect } from "react"
import { supabase } from "../../../services/supabase"
import "./AttendanceReport.css"

function AttendanceReport() {

  const [attendance, setAttendance] = useState([])
  const [batch, setBatch] = useState("")
  const [month, setMonth] = useState("")
  const [batches, setBatches] = useState([])

  useEffect(() => {
    fetchAttendance()
    fetchBatches()
  }, [])

  const fetchAttendance = async () => {

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("date", { ascending: false })

    if (!error) {
      setAttendance(data)
    }

  }

  const fetchBatches = async () => {

    const { data, error } = await supabase
      .from("batches")
      .select("name, timing")

    if (!error) {
      setBatches(data)
    }

  }
  const batchMap = Object.fromEntries(
    batches.map(b => [b.name, b.timing])
  )

  const filtered = attendance.filter(a => {

    const recordMonth = new Date(a.date).getMonth() + 1

    return (
      (!batch || a.batch === batch) &&
      (!month || recordMonth === Number(month))
    )

  })

  return (
    <div className="attendance-report">

      <h2>Monthly Attendance Report</h2>

      <div className="filters">

        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        >

          <option value="">All Batches</option>

          {batches.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}

        </select>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">All Months</option>
          <option value="1">Jan</option>
          <option value="2">Feb</option>
          <option value="3">Mar</option>
          <option value="4">Apr</option>
          <option value="5">May</option>
          <option value="6">Jun</option>
          <option value="7">Jul</option>
          <option value="8">Aug</option>
          <option value="9">Sep</option>
          <option value="10">Oct</option>
          <option value="11">Nov</option>
          <option value="12">Dec</option>
        </select>

      </div>

      <table className="attendance-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Batch</th>
            <th>Time</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {filtered.map((row) => (
            <tr key={row.id}>
              <td>{row.student_name}</td>
              <td>{row.batch}</td>
              <td>{batchMap[row.batch] || "-"}</td>
              <td>{new Date(row.date).toLocaleDateString()}</td>
              <td>{row.status}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  )
}

export default AttendanceReport