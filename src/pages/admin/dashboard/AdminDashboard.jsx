import "./AdminDashboard.css"
import { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import Students from "../students/Students"
import Batches from "../batches/Batches"
import Courses from "../courses/courses"
import UpdateFees from "../fees/UpdateFees"
import Attendance from "../attendance/Attendance"
import StudentsList from "../students/StudentsList"
import AttendanceReport from "../attendance/AttendanceReport"
import Trainers from "../trainers/Trainers"
import Reports from "../reports/Reports"
import { supabase } from "../../../services/supabase"
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

function AdminDashboard() {
  const [rawData, setRawData] = useState([])
  const [columns, setColumns] = useState([])
  const [summary, setSummary] = useState({})
  const [charts, setCharts] = useState({})
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [analysisDone, setAnalysisDone] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [openBatchModal, setOpenBatchModal] = useState(false)
  const [stats, setStats] = useState({
    students: 0,
    trainers: 0,
    batches: 0,
    activities: 0,
    revenue: 0
  })
  const [upcomingClasses, setUpcomingClasses] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [toast, setToast] = useState(null)
  const [removedNotifications, setRemovedNotifications] = useState([])
  const [attendanceBatch, setAttendanceBatch] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [selectedSearchStudent, setSelectedSearchStudent] = useState(null)
  const [systemMessage, setSystemMessage] = useState(null)
  const [manualRevenueAmount, setManualRevenueAmount] = useState("")
  const [manualRevenueNote, setManualRevenueNote] = useState("")
  const [manualRevenueDate, setManualRevenueDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [showManualRevenueBox, setShowManualRevenueBox] = useState(false)
  const [manualRevenueHistory, setManualRevenueHistory] = useState([])
  const [revenueType, setRevenueType] = useState(null)
  const [last12MonthsRevenue, setLast12MonthsRevenue] = useState([])
  const [dbSize, setDbSize] = useState(0)
  const [tableUsage, setTableUsage] = useState([])
  const DB_LIMIT = 500 * 1024 * 1024

  useEffect(() => {

    const removed = JSON.parse(
      localStorage.getItem("removedNotifications") || "[]"
    )

    setRemovedNotifications(removed)

  }, [])
  // 📂 Excel Upload Handler
  const handleExcelUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setAnalysisDone(false) // 🔥 reset before new upload

    const reader = new FileReader()
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(sheet)

      if (data.length === 0) return

      setRawData(data)
      setColumns(Object.keys(data[0]))
    }

    reader.readAsBinaryString(file)
  }

  const searchStudents = async (query) => {

    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .ilike("name", `%${query}%`)

    if (error) {
      console.error(error)
    } else {
      setSearchResults(data)
    }

  }


  // 🧠 Analyze Excel Data
  useEffect(() => {
    if (rawData.length === 0 || columns.length === 0) return

    const numericCols = []
    const textCols = []

    columns.forEach((col) => {
      const hasNumber = rawData.some((row) => !isNaN(Number(row[col])))
      hasNumber ? numericCols.push(col) : textCols.push(col)
    })

    setSummary({
      rows: rawData.length,
      numeric: numericCols.length,
      text: textCols.length,
    })

    const numericTotals = {}
    numericCols.forEach((col) => {
      numericTotals[col] = rawData.reduce(
        (sum, row) => sum + (Number(row[col]) || 0),
        0
      )
    })



    const paymentStatusMap = {}
    rawData.forEach((row) => {
      const status = row["Payment Status"]
      if (!status) return
      paymentStatusMap[status] = (paymentStatusMap[status] || 0) + 1
    })

    setCharts({
      numericTotals,

      paymentStatusMap,
    })

    if (!analysisDone) {
      setShowSaveModal(true)
      setAnalysisDone(true)
    }

  }, [rawData, columns])

  const fetchStats = async () => {

    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .ilike("status", "active")

    const { count: trainerCount } = await supabase
      .from("trainers")
      .select("*", { count: "exact", head: true })

    const { count: batchCount } = await supabase
      .from("batches")
      .select("*", { count: "exact", head: true })

    const { count: activityCount } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })

    // ======================================
    // STUDENT FEES REVENUE (ACTUAL PAYMENTS)
    // ======================================
    const now = new Date()
    const currentMonth = now.toLocaleString("en-US", {
      month: "long",
    })
    const currentYear = now.getFullYear()

    const { data: paidFees } = await supabase
      .from("student_fees")
      .select("amount_paid, month, year, status")
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .eq("status", "Paid")

    const studentRevenue = (paidFees || []).reduce(
      (sum, row) => sum + Number(row.amount_paid || 0),
      0
    )

    // ======================================
    // MANUAL REVENUE
    // ======================================
    const { data: manualRevenue } = await supabase
      .from("manual_revenue")
      .select("*")

    const manualRevenueTotal = (manualRevenue || [])
      .filter((r) => {
        if (!r.payment_date) return false

        const d = new Date(r.payment_date)

        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        )
      })
      .reduce(
        (sum, r) => sum + Number(r.amount || 0),
        0
      )

    // ======================================
    // TOTAL MONTHLY REVENUE
    // ======================================
    const monthlyRevenue =
      studentRevenue + manualRevenueTotal
    setStats({
      students: studentCount ?? 0,
      trainers: trainerCount ?? 0,
      batches: batchCount ?? 0,
      activities: activityCount ?? 0,
      revenue: monthlyRevenue
    })
  }



  useEffect(() => {

    const loadData = async () => {
      await fetchStats()
      await fetchLast12MonthsRevenue()
      setRevenueType("last12")
      await fetchManualRevenueHistory()
    }

    loadData()

    const handler = async () => {
      await fetchStats()
      await fetchLast12MonthsRevenue()
      setRevenueType("last12")
      await fetchManualRevenueHistory()
    }

    window.addEventListener("paymentUpdated", handler)

    return () => {
      window.removeEventListener("paymentUpdated", handler)
    }

  }, [])

  useEffect(() => {

    const checkBirthdays = async () => {

      const today = new Date()
      const todayStr = today.toDateString()

      // ✅ CHECK IF CLEARED TODAY
      const clearedToday = localStorage.getItem("notificationsClearedToday")

      if (clearedToday === todayStr) return  // 🚨 STOP HERE

      const day = today.getDate()
      const month = today.getMonth() + 1

      const { data } = await supabase
        .from("students")
        .select("fees, fee_month")

      const { data: manualRevenue } = await supabase
        .from("manual_revenue")
        .select("*")
      if (!data) return

      const birthdayStudents = data.filter(student => {
        if (!student.dob) return false
        const dob = new Date(student.dob)
        return (
          dob.getDate() === day &&
          dob.getMonth() + 1 === month
        )
      })

      if (birthdayStudents.length > 0) {

        const removed = JSON.parse(
          localStorage.getItem("removedNotifications") || "[]"
        )

        const messages = birthdayStudents.map(
          s => `🎂 Today is ${s.name}'s birthday`
        )

        const filteredMessages = messages.filter(
          msg => !removed.includes(msg)
        )

        setNotifications(prev => {
          const merged = [...prev]

          filteredMessages.forEach(msg => {
            if (!merged.includes(msg)) {
              merged.push(msg)
            }
          })

          return merged
        })

        if (filteredMessages.length > 0) {
          setShowNotifications(true)
        }

      }

    }

    checkBirthdays()

  }, [])
  useEffect(() => {

    const loadNotifications = async () => {

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Notification error:", error)
        return
      }

      if (data) {
        const clearedAt = localStorage.getItem("notificationsClearedAt")

        const removed = JSON.parse(
          localStorage.getItem("removedNotifications") || "[]"
        )

        const messages = data
          .filter(n => {

            if (removed.includes(n.message)) return false   // ⭐⭐ VERY IMPORTANT

            if (!clearedAt) return true

            return new Date(n.created_at) > new Date(clearedAt)

          })
          .map(n => n.message)
        setNotifications(prev => {

          const merged = [...prev]

          messages.forEach(msg => {

            if (removed.includes(msg)) return

            if (!merged.includes(msg)) {
              merged.push(msg)
            }

          })

          return merged
        })
        if (messages.length > 0) {

          const latestMessage = messages[0]
          const lastShown = localStorage.getItem("lastToast")

          if (latestMessage !== lastShown) {

            setToast(latestMessage)

            localStorage.setItem("lastToast", latestMessage)

            setTimeout(() => {
              setToast(null)
            }, 7000)

          }

        }
      }

    }

    loadNotifications()

  }, [])

  useEffect(() => {

    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {

          const message = payload.new.message

          // update notification list
          setNotifications(prev => {

            if (prev.includes(message)) return prev

            if (removedNotifications.includes(message)) return prev

            return [message, ...prev]

          })

          // show toast instantly
          setToast(message)

          setTimeout(() => {
            setToast(null)
          }, 3000)

        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [removedNotifications])
  useEffect(() => {

    const checkClassNotifications = () => {

      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      upcomingClasses.forEach(cls => {

        if (!cls.timing) return

        const [hour, minute] = cls.timing.split(":").map(Number)
        const classMinutes = hour * 60 + minute

        const diff = classMinutes - currentMinutes

        // 10 minutes before class
        if (diff === 10) {

          const msg = `⏰ ${cls.name} will start in 10 minutes`

          setNotifications(prev => {

            if (removedNotifications.includes(msg)) return prev

            return [...prev, msg]

          })

        }

        // class start
        if (diff === 0) {

          const msg = `▶ ${cls.name} class has started`

          setNotifications(prev => {

            if (removedNotifications.includes(msg)) return prev

            return [...prev, msg]

          })

          setShowNotifications(true)

        }

      })

    }

    const interval = setInterval(checkClassNotifications, 60000)

    return () => clearInterval(interval)

  }, [upcomingClasses, removedNotifications])
  useEffect(() => {

    fetchDatabaseSize()
    fetchTableUsage()

    const interval = setInterval(() => {
      fetchDatabaseSize()
      fetchTableUsage()
    }, 15000)

    return () => clearInterval(interval)

  }, [])
  const clearNotifications = async () => {

    await supabase
      .from("notifications")
      .delete()
      .neq("id", 0)

    localStorage.setItem(
      "removedNotifications",
      JSON.stringify(notifications)
    )
    localStorage.setItem(
      "notificationsClearedToday",
      new Date().toDateString()
    )
    // ✅ ADD THIS LINE (IMPORTANT)
    setRemovedNotifications(notifications)

    setNotifications([])
    setShowNotifications(false)

    localStorage.removeItem("lastToast")

    localStorage.setItem(
      "notificationsClearedAt",
      new Date().toISOString()
    )
  }

  const showSystemMessage = (text, type = "info") => {

    setSystemMessage({ text, type })

    setTimeout(() => {
      setSystemMessage(null)
    }, 4000)

  }

  const removeSingleNotification = (index) => {

    const notif = notifications[index]

    const removed = JSON.parse(
      localStorage.getItem("removedNotifications") || "[]"
    )

    const updatedRemoved = [...removed, notif]

    localStorage.setItem(
      "removedNotifications",
      JSON.stringify(updatedRemoved)
    )

    // ✅ ADD THIS LINE
    setRemovedNotifications(updatedRemoved)

    setNotifications(prev =>
      prev.filter((_, i) => i !== index)
    )

  }

  const fetchDatabaseSize = async () => {

    const { data, error } = await supabase.rpc("get_database_size")

    if (error) {
      console.error(error)
      return
    }

    setDbSize(data)

  }
  const fetchTableUsage = async () => {

    const tables = ["students", "trainers", "batches", "courses"]

    const usage = []

    for (let table of tables) {

      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })

      usage.push({
        table,
        count: count || 0
      })

    }

    const total = usage.reduce((s, t) => s + t.count, 0)

    const finalUsage = usage.map(t => ({
      ...t,
      percent: total === 0 ? 0 : (t.count / total) * 100
    }))

    setTableUsage(finalUsage)

  }


  const saveToDatabase = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/save-excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: "Uploaded Excel",
          rawData,
          summary,
          charts,
          savedAt: new Date().toISOString(),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        showSystemMessage("Data saved successfully", "success")

        // 🔥 Reset dashboard after saving
        setRawData([])
        setColumns([])
        setSummary({})
        setCharts({})
        setAnalysisDone(false)
      }
      else {
        showSystemMessage(result.message || "Failed to save data", "error")
      }
    } catch (error) {
      showSystemMessage("Server error occurred", "error")
    } finally {
      setShowSaveModal(false)
    }
  }
  const loadAvailableYears = async () => {

    const { data } = await supabase
      .from("students")
      .select("created_at")

    if (!data) return

    const years = [
      ...new Set(
        data.map(s => new Date(s.created_at).getFullYear())
      )
    ]

    years.sort((a, b) => b - a)

    setAvailableYears(years)

  }
  const fetchLifetimeRevenue = async () => {

    const { data } = await supabase
      .from("students")
      .select("fees")

    const total = (data || []).reduce(
      (sum, s) => sum + (Number(s.fees) || 0),
      0
    )

    setRevenueResult({
      type: "Lifetime",
      amount: total
    })

  }
  const fetchMonthlyRevenue = async () => {

    if (selectedMonth === "") {
      alert("Please select month")
      return
    }

    const monthNumber = Number(selectedMonth)

    const { data } = await supabase
      .from("students")
      .select("fees, fee_month")

    const total = (data || [])
      .filter(s => {
        if (!s.last_payment_date) return false

        const m = new Date(s.last_payment_date).getMonth()
        return m === monthNumber
      })
      .reduce((sum, s) => sum + (Number(s.fees) || 0), 0)

    setRevenueResult({
      type: "Monthly",
      amount: total
    })

  }
  const fetchYearlyRevenue = async () => {

    if (!selectedYear) {
      alert("Please select year")
      return
    }

    const { data } = await supabase
      .from("students")
      .select("fees, created_at")

    const total = (data || [])
      .filter(s => new Date(s.last_payment_date).getFullYear() == selectedYear)
      .reduce((sum, s) => sum + (Number(s.fees) || 0), 0)

    setRevenueResult({
      type: "Yearly",
      amount: total
    })

  }
  const fetchLast12MonthsRevenue = async () => {

    const { data } = await supabase
      .from("student_fees")
      .select("amount_paid, payment_date, status")

    const { data: manualRevenue } = await supabase
      .from("manual_revenue")
      .select("*")

    const monthsMap = {}
    const now = new Date()

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      monthsMap[key] = 0
    }

    // Student fee revenue
    ; (data || []).forEach(row => {
      if (!row.payment_date) return
      if (row.status !== "Paid") return

      const d = new Date(row.payment_date)
      const key = `${d.getFullYear()}-${d.getMonth()}`

      if (monthsMap.hasOwnProperty(key)) {
        monthsMap[key] += Number(row.amount_paid || 0)
      }
    })

      // Manual revenue
      ; (manualRevenue || []).forEach(r => {
        if (!r.payment_date) return

        const d = new Date(r.payment_date)
        const key = `${d.getFullYear()}-${d.getMonth()}`

        if (monthsMap.hasOwnProperty(key)) {
          monthsMap[key] += Number(r.amount || 0)
        }
      })

    // Final chart data
    const result = Object.entries(monthsMap).map(([key, value]) => {
      const [year, month] = key.split("-")
      const date = new Date(year, month)

      return {
        label: date.toLocaleString("default", {
          month: "short",
          year: "2-digit"
        }),
        revenue: value
      }
    })

    setLast12MonthsRevenue(result)
  }
  const fetchManualRevenueHistory = async () => {

    const { data } = await supabase
      .from("manual_revenue")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      setManualRevenueHistory(data)
    }

  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Panel</h1>

        <div className="tab-buttons">

          <button
            className="active-tab"
            onClick={() => setActiveTab("addStudent")}
          >
            Student Registration
          </button>
          <button
            className="active-tab"
            onClick={() => {
              setActiveTab("dashboard")
              setSelectedSearchStudent(null)   // reset search student
            }}
          >
            Back
          </button>

          {/* 🔔 Notification Button */}
          <div className="notification-wrapper">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(true)}
            >
              🔔
              {notifications.length > 0 && (
                <span className="notification-badge">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="dashboard-layout">

          {/* LEFT SIDE */}
          <div className="dashboard-hero">

            <input
              type="text"
              placeholder="Search students, data, reports..."
              className="dashboard-search"
              value={searchQuery}
              onChange={(e) => searchStudents(e.target.value)}
            />

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    className="search-item"
                    onClick={() => {

                      setSelectedSearchStudent(student)

                      setSearchQuery("")
                      setSearchResults([])

                      setActiveTab("batches")

                    }}
                  >
                    <strong>{student.name}</strong>
                    <span className="search-meta">
                      {student.batch} • {student.branch}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="stats-panel">
              <h3>Academy Overview</h3>

              <div className="stats-cards">

                <div className="stat-card">
                  <span>Total Students</span>
                  <h2>{stats.students}</h2>
                </div>
                <div className="stat-card">
                  <span>Total Trainers</span>
                  <h2>{stats.trainers}</h2>
                </div>


                <div className="stat-card">
                  <span>Total Batches</span>
                  <h2>{stats.batches}</h2>
                </div>
                <div className="stat-card">
                  <span>Total Activity</span>
                  <h2>{stats.activities}</h2>
                </div>
                <div
                  className="stat-card"
                  onDoubleClick={async () => {

                    await fetchManualRevenueHistory()

                    setShowManualRevenueBox(true)

                  }}
                  style={{
                    cursor: "pointer"
                  }}
                >

                  <span>Total Revenue</span>

                  <h2>₹{stats.revenue}</h2>

                </div>




              </div>
            </div>


            {/* Reports Section */}
            <Reports />

          </div>

          {/* RIGHT SIDE PANEL */}
          <div className="right-panel">

            {/* 🔥 Upcoming Classes */}
            <div className="upcoming-panel">
              <h3>Upcoming Classes</h3>

              {upcomingClasses.length === 0 ? (
                <p className="empty-text">No upcoming classes</p>
              ) : (
                upcomingClasses.map((item, index) => (
                  <div key={index} className="upcoming-item">
                    <div className="upcoming-name">{item.name}</div>
                    <div className="upcoming-date">
                      {item.timing}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="storage-panel">

              <h3>Database Usage</h3>

              <div className="storage-bar">
                <div
                  className="storage-fill"
                  style={{
                    width: `${(dbSize / DB_LIMIT) * 100}%`
                  }}
                ></div>
              </div>

              <p>
                {(dbSize / 1024 / 1024).toFixed(2)} MB / 500 MB used
              </p>
              <div className="table-usage">
                <h4>Table Usage</h4>

                {tableUsage.map((t, i) => (
                  <div key={i} className="table-usage-row">

                    <span className="table-name">{t.table}</span>

                    <div className="table-bar">
                      <div
                        className="table-fill"
                        style={{ width: `${t.percent}%` }}
                      />
                    </div>

                    <span className="table-percent">
                      {t.percent.toFixed(0)}%
                    </span>

                  </div>
                ))}

              </div>

            </div>

          </div>


        </div>
      )
      }
      {
        activeTab === "dashboard" && (
          <>
            {/* Summary Cards */}
            {summary.rows && (
              <div className="summary-grid">
                <div className="summary-card">
                  Total Rows<br /><b>{summary.rows}</b>
                </div>
                <div className="summary-card">
                  Numeric Fields<br /><b>{summary.numeric}</b>
                </div>
                <div className="summary-card">
                  Text Fields<br /><b>{summary.text}</b>
                </div>
              </div>
            )}

            {/* Charts */}







          </>
        )
      }
      {
        activeTab === "addStudent" && (
          <Students goDashboard={() => setActiveTab("dashboard")} />
        )
      }
      {
        activeTab === "studentsList" && (
          <StudentsList
            goBack={() => setActiveTab("dashboard")}
          />
        )
      }
      {
        activeTab === "updateFees" && (
          <UpdateFees />
        )
      }
      {
        activeTab === "attendanceReport" && (
          <AttendanceReport />
        )
      }

      {
        activeTab === "batches" && (
          <Batches
            openAddModal={openBatchModal}
            searchStudent={selectedSearchStudent}
          />
        )
      }

      {
        activeTab === "courses" && (
          <Courses />
        )
      }
      {
        activeTab === "attendance" && (
          <Attendance
            batchName={attendanceBatch}
            goBack={() => setActiveTab("dashboard")}
          />
        )
      }
      {
        activeTab === "trainers" && (
          <Trainers />
        )
      }
      {/* Upload Modal */}
      {
        showUploadModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Upload Excel File</h3>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  handleExcelUpload(e)
                  setShowUploadModal(false)
                }}
              />
              <button
                className="cancel-btn"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>




            </div>
          </div>
        )
      }
      {/* Save Confirmation Modal */}
      {
        showSaveModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Save Analysis?</h3>
              <p>Do you want to save this analyzed data to database?</p>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button className="upload-btn" onClick={saveToDatabase}>
                  Yes, Save
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowSaveModal(false)
                    setAnalysisDone(false)
                  }}
                >
                  Cancel
                </button>


              </div>
            </div>
          </div>
        )
      }

      {
        showNotifications && (
          <>
            <div
              className="notification-overlay"
              onClick={() => setShowNotifications(false)}
            ></div>

            <div className="notification-panel">
              <div className="notification-header">
                <h3>Notifications</h3>

                <div className="notification-actions">

                  <button
                    className="clear-btn"
                    onClick={clearNotifications}
                  >
                    Clear
                  </button>

                  <button onClick={() => setShowNotifications(false)}>
                    ✖
                  </button>

                </div>
              </div>

              <div className="notification-body">
                {notifications.length === 0 ? (
                  <p>No new notifications</p>
                ) : (
                  notifications.map((note, index) => (

                    <div
                      key={index}
                      className="notification-item"

                    >

                      <span
                        onClick={() => {

                          if (note.includes("trainer registration")) {
                            setActiveTab("trainers")
                            setShowNotifications(false)
                          }

                        }}
                      >
                        {note}
                      </span>


                      <button
                        className="notif-close"
                        onClick={() => removeSingleNotification(index)}
                      >
                        ✖
                      </button>


                    </div>

                  ))
                )}
              </div>
            </div>
          </>
        )
      }
      {
        showManualRevenueBox && (

          <div className="modal-overlay">

            <div
              className="modal"
              style={{
                width: "350px"
              }}
            >

              <h3>Manual Revenue Entry</h3>

              <input
                type="number"
                placeholder="Enter Revenue Amount"
                value={manualRevenueAmount}
                onChange={(e) =>
                  setManualRevenueAmount(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />
              <input
                type="date"
                value={manualRevenueDate}
                onChange={(e) =>
                  setManualRevenueDate(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px"
                }}
              >

                <button
                  className="upload-btn"
                  onClick={async () => {

                    if (!manualRevenueAmount) {
                      alert("Enter amount")
                      return
                    }



                    const { error } = await supabase
                      .from("manual_revenue")
                      .insert([
                        {
                          amount: manualRevenueAmount,
                          payment_date: manualRevenueDate
                        }
                      ])

                    if (error) {

                      console.log(error)

                      alert(error.message)

                      return
                    }

                    if (!error) {

                      setManualRevenueAmount("")
                      setManualRevenueDate(
                        new Date().toISOString().split("T")[0]
                      )
                      setShowManualRevenueBox(false)

                      await fetchStats()
                      await fetchLast12MonthsRevenue()
                      await fetchManualRevenueHistory()

                      window.dispatchEvent(
                        new Event("paymentUpdated")
                      )

                    }

                  }}
                >
                  Save
                </button>

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setShowManualRevenueBox(false)
                  }
                >
                  Cancel
                </button>

              </div>
              <div
                style={{
                  marginTop: "25px",
                  maxHeight: "220px",
                  overflowY: "auto"
                }}
              >

                <h4 style={{ marginBottom: "10px" }}>
                  Revenue History
                </h4>

                {manualRevenueHistory.length === 0 ? (

                  <p>No entries</p>

                ) : (

                  manualRevenueHistory.map((item) => (

                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#f9fafb",
                        padding: "10px",
                        borderRadius: "8px",
                        marginBottom: "10px"
                      }}
                    >

                      <div>

                        <strong>
                          ₹{item.amount}
                        </strong>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280"
                          }}
                        >
                          {item.payment_date}
                        </div>

                      </div>

                      <button
                        onClick={async () => {

                          const confirmDelete = window.confirm(
                            "Are you sure you want to delete this manual revenue entry?"
                          )

                          if (!confirmDelete) return

                          await supabase
                            .from("manual_revenue")
                            .delete()
                            .eq("id", item.id)

                          await fetchStats()
                          await fetchLast12MonthsRevenue()
                          await fetchManualRevenueHistory()

                          showSystemMessage(
                            "Manual revenue deleted successfully",
                            "success"
                          )

                        }}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>

                    </div>

                  ))

                )}

              </div>

            </div>

          </div>

        )
      }

      {
        toast && (
          <div className="toast-notification">
            {toast}
          </div>
        )
      }
      {
        toast && (
          <div className="toast-notification">
            {toast}
          </div>
        )
      }
      {
        systemMessage && (
          <div className={`system-message ${systemMessage.type}`}>
            {systemMessage.text}
          </div>
        )
      }


    </div >
  )
}

export default AdminDashboard
