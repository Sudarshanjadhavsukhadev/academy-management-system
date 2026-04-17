import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"

function InactiveStudents() {
  const [students, setStudents] = useState([])

  const fetchInactiveStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("status", "disabled")   // 🔥 ONLY INACTIVE

    if (error) {
      console.log(error)
    } else {
      setStudents(data)
    }
  }

  useEffect(() => {
    fetchInactiveStudents()
  }, [])

  return (
    <div style={{ padding: "20px" }}>

      <h2>Inactive Students (All Branches)</h2>

      {students.length === 0 ? (
        <p>No inactive students</p>
      ) : (
        <table className="students-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Branch</th>
              <th>Batch</th>
              <th>Joining Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="disabled-row">

                <td>{student.name}</td>
                <td>{student.branch}</td>
                <td>{student.batch}</td>
                <td>{student.join_date}</td>

                <td>
                  <button className="disable-btn">
                    Disabled
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      )}

    </div>
  )
}

export default InactiveStudents