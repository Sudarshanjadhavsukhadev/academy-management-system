
import "./Reports.css"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Pie } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

function Reports() {
  /* ===== SUMMARY DATA ===== */
  const summary = [
    { title: "Total Revenue", value: "₹8,20,000" },
    { title: "Total Students", value: "420" },
    { title: "Trainer Payout", value: "₹2,90,000" },
    { title: "Net Profit", value: "₹5,30,000" },
  ]

  /* ===== CHART DATA ===== */
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

  const profitSplit = {
    labels: ["Student Fees", "Trainer Salary"],
    datasets: [
      {
        data: [820000, 290000],
        backgroundColor: ["#22c55e", "#ef4444"],
      },
    ],
  }

  /* ===== TABLE DATA ===== */
  const reportData = [
    {
      id: 1,
      month: "January",
      revenue: "₹1,20,000",
      salary: "₹50,000",
      profit: "₹70,000",
    },
    {
      id: 2,
      month: "February",
      revenue: "₹1,80,000",
      salary: "₹60,000",
      profit: "₹1,20,000",
    },
    {
      id: 3,
      month: "March",
      revenue: "₹1,50,000",
      salary: "₹55,000",
      profit: "₹95,000",
    },
  ]

  return (
    
      <div className="reports-page">
        {/* HEADER */}
        <div className="reports-header">
          <h1>Reports</h1>

          <div className="controls">
            <button className="add-btn">Export PDF</button>
            <button className="delete-btn">Export Excel</button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="summary-grid">
          {summary.map((item, index) => (
            <div className="summary-card" key={index}>
              <p>{item.title}</p>
              <h2>{item.value}</h2>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="reports-charts">
          <div className="chart-box">
            <h3>Monthly Revenue</h3>
            <Bar data={monthlyRevenue} />
          </div>

          <div className="chart-box">
            <h3>Fees vs Salary</h3>
            <Pie data={profitSplit} />
          </div>
        </div>

        {/* TABLE */}
        <div className="table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Trainer Salary</th>
                <th>Profit</th>
              </tr>
            </thead>

            <tbody>
              {reportData.map((r) => (
                <tr key={r.id}>
                  <td>{r.month}</td>
                  <td>{r.revenue}</td>
                  <td>{r.salary}</td>
                  <td className="profit">{r.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    
  )
}

export default Reports
