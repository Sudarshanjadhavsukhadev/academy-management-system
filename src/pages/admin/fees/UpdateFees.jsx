import { useEffect, useState } from "react"
import { supabase } from "../../../services/supabase"
import "./UpdateFees.css"

function UpdateFees() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState("")
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")

    if (error) {
      console.error(error)
      return
    }

    const today = new Date()

    const updatedStudents = await Promise.all(
      data.map(async (student) => {

        if (student.next_due_date) {
          const due = new Date(student.next_due_date)

          if (today > due && student.fees_status === "Paid") {

            // Update DB also
            await supabase
              .from("students")
              .update({ fees_status: "Pending" })
              .eq("id", student.id)

            student.fees_status = "Pending"
          }
        }

        return student
      })
    )

    setStudents(updatedStudents)
  }

  const handlePaymentSave = async () => {
    if (!paymentAmount || !paymentDate)
      return alert("Enter amount and select date")

    const selectedDate = new Date(paymentDate)

    const nextMonth = new Date(selectedDate)
    nextMonth.setMonth(selectedDate.getMonth() + 1)

    const { error } = await supabase
      .from("students")
      .update({
        fees: Number(paymentAmount),
        fees_status: "Paid",
        last_payment_date: selectedDate.toISOString(),
        next_due_date: nextMonth.toISOString(),
      })
      .eq("id", selectedStudent.id)

    if (!error) {

      // 🔔 Save notification
      await supabase
        .from("notifications")
        .insert({
          message: ` ${selectedStudent.name} paid ₹${paymentAmount}`
        })

      setSelectedStudent(null)
      setPaymentAmount("")
      setPaymentDate("")
      fetchStudents()
    }
  }
  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(search.toLowerCase())
  )
  const getDaysLeft = (nextDueDate) => {
    if (!nextDueDate) return null

    const today = new Date()
    const due = new Date(nextDueDate)

    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }
  return (
    <div className="update-fees-page">
      <h2>Update Fees Status</h2>

      <input
        type="text"
        placeholder="Search student by name..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="students-grid">
        {filteredStudents.length === 0 && (
          <p className="no-data">No students found</p>
        )}
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="student-card"
            onClick={() => setSelectedStudent(student)}
          >
            <img
              src={
                student.profile_photo ||
                "https://via.placeholder.com/80"
              }
              alt="profile"
            />

            <div className="student-info">
              <h4>{student.name}</h4>
              <p>Joining: {student.join_date}</p>

              <p className="fees">
                Fees: ₹{student.fees || 0}
              </p>
              {student.next_due_date && (
                <>
                  <p>
                    Next Due:{" "}
                    {new Date(student.next_due_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <p
                    className={
                      getDaysLeft(student.next_due_date) < 0
                        ? "overdue"
                        : "countdown"
                    }
                  >
                    {getDaysLeft(student.next_due_date) < 0
                      ? `Overdue by ${Math.abs(getDaysLeft(student.next_due_date))} days`
                      : `${getDaysLeft(student.next_due_date)} days left`}
                  </p>
                </>
              )}
              <span
                className={
                  student.fees_status === "Paid"
                    ? "status paid"
                    : "status pending"
                }
              >
                {student.fees_status || "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {selectedStudent && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <h3>{selectedStudent.name}</h3>

            <input
              type="number"
              placeholder="Enter last fees paid"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            <button onClick={handlePaymentSave}>
              Save Payment
            </button>

            <button
              className="cancel-btn"
              onClick={() => setSelectedStudent(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateFees