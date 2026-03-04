
import "./Reports.css"
import { supabase } from "../../../services/supabase"
import { useEffect, useState } from "react"

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
  const [summary, setSummary] = useState([])
  const [monthlyRevenue, setMonthlyRevenue] = useState({})
  const [profitSplit, setProfitSplit] = useState({})
  const [reportData, setReportData] = useState([])
  const [marketingData, setMarketingData] = useState({})

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {


    const { data: students } = await supabase
      .from("students")
      .select("*")

    const totalStudents = students?.length || 0

    const totalRevenue = (students || []).reduce((sum, s) => {
      return sum + (Number(s.fees) || 0)
    }, 0)

    const { data: trainers } = await supabase
      .from("trainers")
      .select("*")

    const trainerSalary = (trainers || []).reduce((sum, t) => {
      return sum + (Number(t.salary) || 0)
    }, 0)

    const netProfit = totalRevenue - trainerSalary

    setSummary([
      { title: "Total Revenue", value: `₹${totalRevenue}` },
      { title: "Total Students", value: totalStudents },
      { title: "Trainer Payout", value: `₹${trainerSalary}` },
      { title: "Net Profit", value: `₹${netProfit}` },
    ])

    const monthlyMap = {}

    students.forEach((s) => {
      const month = new Date(s.join_date).toLocaleString("default", {
        month: "short",
      })

      monthlyMap[month] = (monthlyMap[month] || 0) + Number(s.fees)
    })

    const labels = Object.keys(monthlyMap)
    const values = Object.values(monthlyMap)

    setMonthlyRevenue({
      labels,
      datasets: [
        {
          label: "Revenue (₹)",
          data: values,
          backgroundColor: "#4f46e5",
        },
      ],
    })

    const paidStudents = students.filter(
      (s) => s.fees_status?.toLowerCase() === "paid"
    )

    const unpaidStudents = students.filter(
      (s) => s.fees_status?.toLowerCase() !== "paid"
    )

    const paidTotal = paidStudents.reduce((sum, s) => {
      return sum + (Number(s.fees) || 0)
    }, 0)

    const unpaidTotal = unpaidStudents.reduce((sum, s) => {
      return sum + (Number(s.fees) || 0)
    }, 0)


    setProfitSplit({
      labels: ["Paid Fees", "Unpaid Fees"],
      datasets: [
        {
          data: [paidStudents.length, unpaidStudents.length],
          backgroundColor: ["#22c55e", "#ef4444"],
        },
      ],
    })

    /* ===== MARKETING SOURCE ===== */

    const marketingMap = {}

    students.forEach((s) => {
      const source = s.reference || "Unknown"

      marketingMap[source] = (marketingMap[source] || 0) + 1
    })

    const marketingLabels = Object.keys(marketingMap)
    const marketingValues = Object.values(marketingMap)

    setMarketingData({
      labels: marketingLabels,
      datasets: [
        {
          label: "Students",
          data: marketingValues,
          backgroundColor: [
            "#6366f1",
            "#22c55e",
            "#f59e0b",
            "#ef4444",
            "#06b6d4",
          ],
        },
      ],
    })
    const tableData = labels.map((month, index) => ({
      id: index,
      month,
      revenue: `₹${values[index]}`,
      salary: `₹${Math.round(trainerSalary / 12)}`,
      profit: `₹${values[index] - Math.round(trainerSalary / 12)}`,
    }))

    setReportData(tableData)
  }







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
          {monthlyRevenue.labels && <Bar data={monthlyRevenue} />}
        </div>

        <div className="chart-box">
          <h3>Paid vs Unpaid Fees</h3>
          {profitSplit.labels && <Pie data={profitSplit} />}
        </div>

        <div className="chart-box">
          <h3>Marketing Sources</h3>
          {marketingData.labels && <Bar data={marketingData} />}
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
