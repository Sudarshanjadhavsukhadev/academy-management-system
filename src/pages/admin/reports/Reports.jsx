
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

    const handler = () => {
      fetchReports()
    }

    window.addEventListener("paymentUpdated", handler)

    return () => {
      window.removeEventListener("paymentUpdated", handler)
    }

  }, [])
  const fetchReports = async () => {


    const { data: students } = await supabase
      .from("students")
      .select("*")

    const { data: manualRevenue } = await supabase
      .from("manual_revenue")
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

    // last 12 months (1 Year)
    // ===== LAST 12 MONTH REVENUE (FIXED BARS) =====

    const labels = []
    const values = new Array(12).fill(0)

    const today = new Date()

    // create fixed 12 month labels
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)

      labels.push(
        d.toLocaleString("default", {
          month: "short",
          year: "2-digit"
        })
      )
    }

    // fill revenue correctly
    students.forEach((s) => {
      if (!s.fee_month) return

      const d = new Date(s.fee_month)

      const diffMonths =
        (today.getFullYear() - d.getFullYear()) * 12 +
        (today.getMonth() - d.getMonth())

      if (diffMonths >= 0 && diffMonths < 12) {
        const index = 11 - diffMonths
        values[index] +=
          (
            Number(s.fees || 0) *
            Number(s.advance_months || 1)
          )
      }
    })
    manualRevenue.forEach((r) => {

      if (!r.payment_date) return

      const d = new Date(r.payment_date)

      const diffMonths =
        (today.getFullYear() - d.getFullYear()) * 12 +
        (today.getMonth() - d.getMonth())

      if (diffMonths >= 0 && diffMonths < 12) {

        const index = 11 - diffMonths

        values[index] += Number(r.amount || 0)

      }

    })

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

      let course = s.activity || "Unknown"

      // FIX ARRAY FORMAT
      if (typeof course === "string") {

        try {

          const parsed = JSON.parse(course)

          if (Array.isArray(parsed)) {
            course = parsed.join(", ")
          }

        } catch {

          course = course
            .replace("[", "")
            .replace("]", "")
            .replace(/"/g, "")

        }

      }

      courseMap[course] =
        (courseMap[course] || 0) + 1

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



        <div className="chart-box marketing-chart">
          <h3>Students per Activity</h3>

          <div style={{ flex: 1, position: "relative" }}>
            {profitSplit.labels && (
              <Pie
                data={profitSplit}
                options={{
                  plugins: {
                    legend: {
                      position: "right",
                      align: "center"
                    }
                  },
                  maintainAspectRatio: false
                }}
              />
            )}
          </div>
        </div>
        <div className="chart-box marketing-chart">
          <h3>Monthly Revenue</h3>
          <div style={{ flex: 1, position: "relative" }}>
            {monthlyRevenue.labels && (
              <Bar
                data={monthlyRevenue}
                options={{
                  maintainAspectRatio: false
                }}
              />
            )}
          </div>
        </div>
        <div className="chart-box marketing-chart">
          <h3>Marketing Sources</h3>

          <div style={{ flex: 1, position: "relative" }}>
            {marketingData.labels && (
              <Bar
                data={marketingData}
                options={{
                  maintainAspectRatio: false
                }}
              />
            )}
          </div>

        </div>

      </div>

    </div>

  )
}

export default Reports
