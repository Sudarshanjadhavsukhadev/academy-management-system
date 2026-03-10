
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

    // last 6 months
    const monthlyMap = {}

    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = d.toLocaleString("default", { month: "short" })
      monthlyMap[monthName] = 0
    }

    // fill revenue
    students.forEach((s) => {
      if (!s.join_date) return

      const d = new Date(s.join_date)
      const monthName = d.toLocaleString("default", { month: "short" })

      if (monthlyMap.hasOwnProperty(monthName)) {
        monthlyMap[monthName] += Number(s.fees) || 0
      }
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

    /* ===== COURSE ENROLLMENT ===== */

    const courseMap = {}

    students.forEach((s) => {
    const course = s.activity || "Unknown"

      courseMap[course] = (courseMap[course] || 0) + 1
    })

    const courseLabels = Object.keys(courseMap)
    const courseValues = Object.values(courseMap)

    setProfitSplit({
      labels: courseLabels,
      datasets: [
        {
          label: "Students",
          data: courseValues,
          backgroundColor: [
            "#6366f1",
            "#22c55e",
            "#f59e0b",
            "#ef4444",
            "#06b6d4",
            "#8b5cf6",
            "#14b8a6",
            "#f97316",
            "#a855f7",
            "#eab308"
          ],
        },
      ],
    })

    /* ===== MARKETING SOURCE ===== */

    // predefined marketing sources
    const marketingMap = {
      "Instagram": 0,
      "Facebook": 0,
      "Google": 0,
      "Friend Referral": 0,
      "Walk In": 0,
      "Other": 0
    }

    students.forEach((s) => {
      const source = s.reference || "Other"

      if (marketingMap.hasOwnProperty(source)) {
        marketingMap[source]++
      } else {
        marketingMap["Other"]++
      }
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
   
  }







  return (

    <div className="reports-page">
      {/* HEADER */}

      {/* SUMMARY */}


      {/* CHARTS */}
      <div className="reports-charts">

        <div className="chart-box">
          <h3>Monthly Revenue</h3>
          {monthlyRevenue.labels && <Bar data={monthlyRevenue} />}
        </div>

        <div className="chart-box">
          <h3>Students per Activity</h3>

          <div style={{ height: "280px" }}>
            {profitSplit.labels && (
              <Pie
                data={profitSplit}
                options={{
                  plugins: {
                    legend: {
                      position: "bottom"
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            )}
          </div>
        </div>
        <div className="chart-box marketing-chart">
          <h3>Marketing Sources</h3>
          {marketingData.labels && <Bar data={marketingData} />}
        </div>

      </div>
     
    </div>

  )
}

export default Reports
