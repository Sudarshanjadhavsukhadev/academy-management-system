import { useEffect, useState } from "react"
import * as XLSX from "xlsx"
import { supabase } from "../../../services/supabase"

function Revenue() {

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  )
  const [manualRevenue, setManualRevenue] = useState([])
  const fetchRevenue = async () => {

    setLoading(true)

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("last_payment_date", { ascending: false })

    const { data: manualData } = await supabase
      .from("manual_revenue")
      .select("*")
      .order("payment_date", { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setStudents(data || [])
      setManualRevenue(manualData || [])
    }

    setLoading(false)

  }

  useEffect(() => {

    fetchRevenue()

    const handler = () => {
      fetchRevenue()
    }

    window.addEventListener("paymentUpdated", handler)

    return () => {
      window.removeEventListener("paymentUpdated", handler)
    }

  }, [])

  const filteredStudents = students.filter(student => {

    if (!student.last_payment_date) return false

    const paymentMonth =
      new Date(student.last_payment_date).getMonth() + 1

    return paymentMonth === Number(selectedMonth)

  })

  const downloadExcel = () => {

    const rows = filteredStudents.map((student, index) => ({
      "Invoice No": `INV-${index + 1}`,
      "Student Name": student.name || "-",
      "Join Date": student.join_date || "-",
      "Last Paid": student.last_payment_date || "-",
      "Fees": `₹${student.fees || 0}`,
      "Batch": student.batch || "-",
      "Branch": student.branch || "-"
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 28 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 45 },
      { wch: 35 }
    ]

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Revenue Report"
    )

    XLSX.writeFile(
      workbook,
      `Revenue_Report_Month_${selectedMonth}.xlsx`
    )

  }

  return (
    <div
      style={{
        padding: "25px",
        background: "#f5f7fb",
        minHeight: "100vh"
      }}
    >

      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px"
        }}
      >

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "700"
            }}
          >
            Revenue Dashboard
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: "5px"
            }}
          >
            Real-time revenue invoice report
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center"
          }}
        >

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px"
            }}
          >

            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>

          </select>

          <button
            onClick={downloadExcel}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px"
            }}
          >
            Download Excel
          </button>

        </div>

      </div>

      {/* SUMMARY CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "18px",
          marginBottom: "25px"
        }}
      >

        <div style={cardStyle}>
          <h3>Total Paid Students</h3>

          <p style={numberStyle}>
            ₹{
              filteredStudents
                .reduce(
                  (sum, s) =>
                    sum +
                    (
                      Number(s.fees || 0) *
                      Number(s.advance_months || 1)
                    ),
                  0
                )
            }
          </p>
        </div>

        <div style={cardStyle}>
          <h3>Total Revenue</h3>

          <p style={numberStyle}>
            ₹{

              filteredStudents.reduce(
                (sum, s) =>
                  sum + Number(s.fees || 0),
                0
              )

              +

              manualRevenue
                .filter(r => {

                  if (!r.payment_date) return false

                  const paymentMonth =
                    new Date(r.payment_date).getMonth() + 1

                  return paymentMonth === Number(selectedMonth)

                })
                .reduce(
                  (sum, r) =>
                    sum + Number(r.amount || 0),
                  0
                )

            }
          </p>
        </div>

      </div>

      {/* TABLE */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
        }}
      >

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >

          <thead>

            <tr
              style={{
                background: "#eef2ff"
              }}
            >

              <th style={thStyle}>Invoice</th>
              <th style={thStyle}>Student Name</th>
              <th style={thStyle}>Join Date</th>
              <th style={thStyle}>Last Paid</th>
              <th style={thStyle}>Fees</th>
              <th style={thStyle}>Batch</th>
              <th style={thStyle}>Branch</th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: "30px",
                    textAlign: "center"
                  }}
                >
                  Loading Revenue...
                </td>
              </tr>

            ) : students.filter(s => s.last_payment_date).length === 0 ? (

              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: "30px",
                    textAlign: "center"
                  }}
                >
                  No Revenue Data Found
                </td>
              </tr>

            ) : (

              filteredStudents.map((student, index) => (

                <tr
                  key={student.id}
                  style={{
                    borderBottom: "1px solid #eee"
                  }}
                >

                  <td style={tdStyle}>
                    INV-{index + 1}
                  </td>

                  <td style={tdStyle}>
                    {student.name || "-"}
                  </td>

                  <td style={tdStyle}>
                    {student.join_date || "-"}
                  </td>

                  <td style={tdStyle}>
                    {student.last_payment_date || "-"}
                  </td>

                  <td style={tdStyle}>
                    ₹{student.fees || 0}
                  </td>

                  <td style={tdStyle}>
                    {student.batch || "-"}
                  </td>

                  <td style={tdStyle}>
                    {student.branch || "-"}
                  </td>

                </tr>

              ))

            )}
            {manualRevenue
              .filter(r => {

                if (!r.payment_date) return false

                const paymentMonth =
                  new Date(r.payment_date).getMonth() + 1

                return paymentMonth === Number(selectedMonth)

              })
              .map((item, index) => (

                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #eee",
                    background: "#f9fafb"
                  }}
                >

                  <td style={tdStyle}>
                    MANUAL-{index + 1}
                  </td>

                  <td style={tdStyle}>
                    Manual Revenue
                  </td>

                  <td style={tdStyle}>
                    -
                  </td>

                  <td style={tdStyle}>
                    {item.payment_date}
                  </td>

                  <td style={tdStyle}>
                    ₹{item.amount}
                  </td>

                  <td style={tdStyle}>
                    Manual Entry
                  </td>

                  <td style={tdStyle}>
                    Admin
                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
}

const numberStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#4f46e5",
  marginTop: "10px"
}

const thStyle = {
  padding: "16px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "700",
  color: "#374151"
}

const tdStyle = {
  padding: "14px",
  fontSize: "14px",
  color: "#111827"
}

export default Revenue