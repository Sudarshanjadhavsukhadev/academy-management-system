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

  const activateStudent = async (studentId) => {
    const { error } = await supabase
      .from("students")
      .update({ status: "Active" })
      .eq("id", studentId)

    if (error) {
      alert("Failed to activate student")
      console.log(error)
    } else {
      fetchInactiveStudents()
      alert("Student Activated Successfully")
    }
  }

  const deleteStudent = async (studentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this student?"
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId)

    if (error) {
      alert("Failed to delete student")
      console.log(error)
    } else {
      fetchInactiveStudents()
      alert("Student Deleted Successfully")
    }
  }

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
              <th>Actions</th>
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

                <td>
                  <button
                    className="activate-btn"
                    onClick={() => activateStudent(student.id)}
                  >
                    Activate
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteStudent(student.id)}
                  >
                    Delete
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