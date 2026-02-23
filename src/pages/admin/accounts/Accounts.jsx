import { useState } from "react"

import "./Accounts.css"

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

function Accounts() {
  const [records, setRecords] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      type: "Student",
      course: "Full Stack Development",
      amount: 30000,
      paymentType: "Fees",
      status: "Paid",
      date: "2026-01-10",
    },
    {
      id: 2,
      name: "Anjali Verma",
      type: "Student",
      course: "Data Analytics",
      amount: 15000,
      paymentType: "Fees",
      status: "Pending",
      date: "2026-01-15",
    },
    {
      id: 3,
      name: "Suresh Patil",
      type: "Trainer",
      course: "Full Stack Development",
      amount: 50000,
      paymentType: "Salary",
      status: "Paid",
      date: "2026-01-31",
    },
  ])

  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)

  const [newRecord, setNewRecord] = useState({
    name: "",
    type: "Student",
    course: "",
    amount: "",
    paymentType: "",
    status: "Paid",
    date: "",
  })

  /* ================= CHART DATA ================= */

  const monthlyRevenue = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue (₹)",
        data: [120000, 180000, 150000, 220000, 300000, 350000],
        backgroundColor: "#4f46e5",
      },
    ],
  }

  const paymentStatus = {
    labels: ["Paid", "Pending"],
    datasets: [
      {
        data: [
          records.filter((r) => r.status === "Paid").length,
          records.filter((r) => r.status === "Pending").length,
        ],
        backgroundColor: ["#22c55e", "#ef4444"],
      },
    ],
  }

  const feesVsSalary = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Student Fees",
        data: [150000, 200000, 180000, 250000, 320000, 380000],
        borderColor: "#22c55e",
        tension: 0.4,
      },
      {
        label: "Trainer Salary",
        data: [50000, 60000, 55000, 70000, 80000, 90000],
        borderColor: "#ef4444",
        tension: 0.4,
      },
    ],
  }

  /* ================= FUNCTIONS ================= */

  const addRecord = () => {
    setRecords([...records, { id: Date.now(), ...newRecord }])
    setShowModal(false)
    setNewRecord({
      name: "",
      type: "Student",
      course: "",
      amount: "",
      paymentType: "",
      status: "Paid",
      date: "",
    })
  }

  const filteredRecords = records.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.course.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
   
      <div className="accounts-page">
        {/* HEADER */}
        <div className="accounts-header">
          <h1>Accounts</h1>

          <div className="controls">
            <input
              placeholder="Search name / course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="add-btn" onClick={() => setShowModal(true)}>
              + Add Entry
            </button>
          </div>
        </div>

        {/* ===== CHARTS ===== */}
        <div className="accounts-charts">
          <div className="chart-box">
            <h3>Monthly Revenue</h3>
            <Bar data={monthlyRevenue} />
          </div>

          <div className="chart-box">
            <h3>Payment Status</h3>
            <Pie data={paymentStatus} />
          </div>

          <div className="chart-box full">
            <h3>Fees vs Salary</h3>
            <Line data={feesVsSalary} />
          </div>
        </div>

        {/* ===== TABLE ===== */}
        <div className="table-wrapper">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.type}</td>
                  <td>{r.course}</td>
                  <td>₹{r.amount}</td>
                  <td>{r.paymentType}</td>
                  <td>
                    <span
                      className={`status ${
                        r.status === "Paid" ? "active" : "inactive"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{r.date}</td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-data">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===== ADD ENTRY MODAL ===== */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Add Account Entry</h2>

              <div className="modal-form">
                <input
                  placeholder="Name"
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, name: e.target.value })
                  }
                />

                <select
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, type: e.target.value })
                  }
                >
                  <option>Student</option>
                  <option>Trainer</option>
                </select>

                <input
                  placeholder="Course"
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, course: e.target.value })
                  }
                />

                <input
                  placeholder="Amount"
                  type="number"
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, amount: e.target.value })
                  }
                />

                <input
                  placeholder="Payment Type (Fees / Salary)"
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      paymentType: e.target.value,
                    })
                  }
                />

                <select
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, status: e.target.value })
                  }
                >
                  <option>Paid</option>
                  <option>Pending</option>
                </select>

                <input
                  type="date"
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, date: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button className="cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="save" onClick={addRecord}>
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
   
  )
}

export default Accounts
