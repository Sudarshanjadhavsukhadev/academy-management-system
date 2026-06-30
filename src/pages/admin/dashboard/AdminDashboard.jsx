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

const dashboardLogo =
  "https://hawihdxdunxhzdaydgyb.supabase.co/storage/v1/object/public/assets/logos/mjk-logo.png";

function AdminDashboard() {
  const [rawData, setRawData] = useState([])
  const [columns, setColumns] = useState([])
  const [summary, setSummary] = useState({})
  const [charts, setCharts] = useState({})
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [analysisDone, setAnalysisDone] = useState(false)
  const [showBatchSelector, setShowBatchSelector] = useState(false)
  const [selectedStudentBatches, setSelectedStudentBatches] = useState([])
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
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  const [showRevenueModal, setShowRevenueModal] = useState(false)

  const [studentsList, setStudentsList] = useState([])
  const [revenueList, setRevenueList] = useState([])
  const [revenueSearch, setRevenueSearch] = useState("");
  const DB_LIMIT = 500 * 1024 * 1024

  const [showAssignBatchPopup, setShowAssignBatchPopup] =
    useState(false)

  const [assignBatch, setAssignBatch] =
    useState("")

  const [allBatches, setAllBatches] =
    useState([])

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

        .map(n => ({
          id: n.id,
          message: n.message
        }))

      setNotifications(prev => {



        const merged = [...prev]



        messages.forEach(msg => {



          if (removed.includes(msg.message)) return



          if (!merged.some(n => n.id === msg.id)) {
            merged.push(msg)
          }



        })



        return merged

      })

      if (messages.length > 0) {



        const latestMessage = messages[0]

        const lastShown = localStorage.getItem("lastToast")



        if (latestMessage !== lastShown) {



          setToast(latestMessage.message)



          localStorage.setItem("lastToast", latestMessage.message)



          setTimeout(() => {

            setToast(null)

          }, 7000)



        }



      }

    }



  }

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
      .select("*, batch_list")
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


    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    )

    console.log("NOW =", now);
    console.log("START =", startOfMonth.toISOString().split("T")[0]);
    console.log("END =", endOfMonth.toISOString().split("T")[0]);

    const { data: paidFees } = await supabase
      .from("student_fees")
      .select(`
    student_id,
    student_name,
    batch_name,
    amount_paid,
    payment_date,
    status
  `)
      .eq("status", "Paid")
      .eq(
        "month",
        now.toLocaleString("en-US", { month: "long" })
      )
      .eq("year", now.getFullYear())
    console.log("Paid Fees:", paidFees);

    console.log(
      "Dashboard Revenue:",
      paidFees?.reduce((sum, row) => sum + Number(row.amount_paid || 0), 0)
    );
    // Remove duplicate payments for same student in same month/year
    const uniquePaidFees = []
    const seen = new Set()

      ; (paidFees || []).forEach((row) => {
        const key =
          `${row.student_id}-${row.batch_name}-${row.payment_date}`;

        if (!seen.has(key)) {
          seen.add(key)
          uniquePaidFees.push(row)
        }
      })

    // Calculate revenue using unique payments only
    const studentRevenue = uniquePaidFees.reduce(
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

  const fetchUpcomingClasses = async () => {

    const { data, error } = await supabase
      .from("batches")
      .select("*")

    if (error) {
      console.log(error)
      return
    }

    const now = new Date()

    const currentMinutes =
      now.getHours() * 60 + now.getMinutes()

    const upcoming = (data || [])
      .map(batch => {

        if (!batch.timing) return null

        const time = batch.timing.trim()

        const [timePart, ampm] = time.split(" ")

        let [hour, minute] =
          timePart.split(":").map(Number)

        if (ampm === "PM" && hour !== 12) {
          hour += 12
        }

        if (ampm === "AM" && hour === 12) {
          hour = 0
        }

        return {
          ...batch,
          totalMinutes: hour * 60 + minute
        }

      })
      .filter(Boolean)
      .filter(batch =>
        batch.totalMinutes >= currentMinutes
      )
      .sort(
        (a, b) =>
          a.totalMinutes - b.totalMinutes
      )
      .slice(0, 3)

    setUpcomingClasses(upcoming)
  }


  useEffect(() => {

    const loadData = async () => {

      await fetchAllBatches()

      await fetchStats()
      await fetchLast12MonthsRevenue()
      await fetchManualRevenueHistory()
      await fetchUpcomingClasses()

      setRevenueType("last12")
    }

    loadData()

    // refresh upcoming classes every minute
    const upcomingInterval = setInterval(() => {
      fetchUpcomingClasses()
    }, 60000)

    const handler = async () => {
      await fetchStats()
      await fetchLast12MonthsRevenue()
      await fetchManualRevenueHistory()
      await fetchUpcomingClasses()
      setRevenueType("last12")
    }

    window.addEventListener("paymentUpdated", handler)

    return () => {
      clearInterval(upcomingInterval)
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
        .select("name, dob")

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
          setToast(filteredMessages[0])
        }

      }

    }

    checkBirthdays()

  }, [])
  useEffect(() => {


    loadNotifications()

  }, [])

  useEffect(() => {

    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {

          console.log("Realtime Payload:", payload)

          if (payload.eventType === "INSERT") {

            const notification = {
              id: payload.new.id,
              message: payload.new.message
            }

            setNotifications(prev => {

              if (prev.some(n => n.id === notification.id))
                return prev

              return [notification, ...prev]

            })

            setToast(notification.message)

            setTimeout(() => {
              setToast(null)
            }, 3000)

          }

          if (payload.eventType === "DELETE") {
            loadNotifications()
          }

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

    const { error } = await supabase
      .from("notifications")
      .delete()
      .not("id", "is", null)

    if (error) {
      console.error(error)
      return
    }

    setNotifications([])
    setRemovedNotifications([])
    setShowNotifications(false)
    setToast(null)

    localStorage.removeItem("removedNotifications")
    localStorage.removeItem("notificationsClearedToday")
    localStorage.removeItem("notificationsClearedAt")
    localStorage.removeItem("lastToast")

  }
  const showSystemMessage = (text, type = "info") => {

    setSystemMessage({ text, type })

    setTimeout(() => {
      setSystemMessage(null)
    }, 4000)

  }

  const fetchStudentsList = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, batch, branch, fees")
      .ilike("status", "active")
      .order("name")

    if (error) {
      console.error(error)
      return
    }

    setStudentsList(data || [])
  }

  const today = new Date();

  const startOfMonth = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), 1)
  );

  const endOfMonth = new Date(
    Date.UTC(today.getFullYear(), today.getMonth() + 1, 1)
  );
  const fetchRevenueDetails = async () => {
    const today = new Date();

    const currentMonth = today.toLocaleString("en-US", {
      month: "long"
    });

    const currentYear = today.getFullYear();

    const { data, error } = await supabase
      .from("student_fees")
      .select(`
id,
student_id,
student_name,
amount_paid,
payment_date,
month,
year,
batch_name
`)
      .gte("payment_date", startOfMonth.toISOString().split("T")[0])
      .lt("payment_date", endOfMonth.toISOString().split("T")[0])
      .eq("status", "Paid")
      .order("payment_date", { ascending: false });

    if (error) {
      console.error("Revenue details error:", error);
      return;
    }

    // ✅ Remove duplicate payments for same student in same month/year
    const uniquePayments = [];
    const seen = new Set();

    (data || []).forEach((item) => {
      const key =
        `${item.student_id}-${item.batch_name}-${item.payment_date}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniquePayments.push(item);
      }
    });

    setRevenueList(uniquePayments);
  };

  const removeSingleNotification = async (id) => {

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      return
    }

    setNotifications(prev =>
      prev.filter(item => item.id !== id)
    )

  }

  const fetchDatabaseSize = async () => {

    const { data, error } = await supabase.rpc("get_database_size")

    if (error) {
      console.error(error)
      return
    }

    setDbSize(data)

    const usagePercent = (data / DB_LIMIT) * 100

    if (usagePercent >= 90) {

      const msg = "🚨 Database storage above 90%"

      setNotifications(prev => {

        if (prev.includes(msg)) return prev

        return [...prev, msg]

      })

      setToast(msg)
    }
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

  const fetchLast12MonthsRevenue = async () => {

    const { data } = await supabase
      .from("student_fees")
      .select(`
student_id,
batch_name,
amount_paid,
payment_date,
status
`)

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
    ;
    const seen = new Set();

    (data || []).forEach((row) => {

      if (!row.payment_date) return;
      if (row.status !== "Paid") return;

      const uniqueKey =
        `${row.student_id}-${row.batch_name}-${row.payment_date}`;

      if (seen.has(uniqueKey)) return;

      seen.add(uniqueKey);

      const d = new Date(row.payment_date);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (monthsMap.hasOwnProperty(key)) {
        monthsMap[key] += Number(row.amount_paid || 0);
      }

    });
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

  const fetchAllBatches = async () => {

    const { data, error } = await supabase
      .from("batches")
      .select("*")

    if (error) {
      console.log(error)
      return
    }

    setAllBatches(data || [])
  }

  return (
    <div className="admin-dashboard">
      <img
        src={dashboardLogo}
        alt="MJK Background Logo"
        className="dashboard-background-logo"
      />
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

                  student.status?.toLowerCase() === "disabled" ? (

                    <div
                      key={student.id}
                      className="search-item"
                      style={{
                        background: "#fee2e2",
                        border: "1px solid #ef4444",
                        color: "#991b1b",
                        cursor: "default"
                      }}
                    >
                      <strong>
                        ⚠ {student.name} is Deactivated
                      </strong>
                    </div>

                  ) : (

                    <div
                      key={student.id}
                      className="search-item"
                      onClick={() => {

                        const batches = student.batch_list || []

                        // No batch assigned
                        if (
                          batches.length === 0 &&
                          !student.batch
                        ) {

                          setSelectedSearchStudent(student)
                          setShowAssignBatchPopup(true)

                          return
                        }

                        if (batches.length > 1) {

                          setSelectedSearchStudent(student)
                          setSelectedStudentBatches(batches)
                          setShowBatchSelector(true)

                        } else {

                          setSelectedSearchStudent(student)

                          setSearchQuery("")
                          setSearchResults([])

                          setActiveTab("batches")
                        }

                      }}
                    >
                      <strong>{student.name}</strong>

                      <span className="search-meta">

                        {student.batch_list?.length > 1
                          ? `${student.batch_list.length} Batches Enrolled`
                          : `${student.batch} • ${student.branch}`
                        }

                      </span>

                    </div>

                  )

                ))}
              </div>
            )}
            <div className="stats-panel">
              <h3>Academy Overview</h3>

              <div className="stats-cards">

                <div
                  className="stat-card"
                  onDoubleClick={async () => {
                    await fetchStudentsList()
                    setShowStudentsModal(true)
                  }}
                  style={{ cursor: "pointer" }}
                  title="Double click to view all students"
                >
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
                    await fetchRevenueDetails()
                    setShowRevenueModal(true)
                  }}
                  style={{ cursor: "pointer" }}
                  title="Double click to view fees collection details"
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
              <p
                style={{
                  fontWeight: "bold",
                  color:
                    (dbSize / DB_LIMIT) * 100 >= 90
                      ? "red"
                      : (dbSize / DB_LIMIT) * 100 >= 70
                        ? "orange"
                        : "green"
                }}
              >
                Usage: {((dbSize / DB_LIMIT) * 100).toFixed(2)}%
              </p>

              <p>
                Remaining:
                {(
                  (DB_LIMIT - dbSize) /
                  1024 /
                  1024
                ).toFixed(2)} MB
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
            <div className="batch-selector-modal">
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

                          if (note.message.includes("trainer registration")) {
                            setActiveTab("trainers")
                            setShowNotifications(false)
                          }

                        }}
                      >
                        {note.message}
                      </span>


                      <button
                        className="notif-close"
                        onClick={() => removeSingleNotification(note.id)}
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



                          await supabase
                            .from("manual_revenue")
                            .delete()
                            .eq("id", item.id)

                          await fetchStats()
                          await fetchLast12MonthsRevenue()
                          await fetchManualRevenueHistory()



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
        systemMessage && (
          <div className={`system-message ${systemMessage.type}`}>
            {systemMessage.text}
          </div>
        )
      }

      {showStudentsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowStudentsModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "700px",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative"
            }}
          >

            <button
              onClick={() => setShowStudentsModal(false)}
              style={{
                position: "sticky",
                top: "15px",
                right: "20px",
                background: "transparent",
                border: "none",
                fontSize: "32px",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#ef4444",
                zIndex: 9999
              }}
            >
              ✖
            </button>


            <h3>All Active Students</h3>

            {studentsList.length === 0 ? (
              <p>No students found.</p>
            ) : (
              studentsList.map((student) => (
                <div
                  key={student.id}
                  style={{
                    padding: "12px",
                    marginBottom: "10px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <strong>{student.name}</strong>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {student.batch} • {student.branch}
                    </div>
                  </div>
                  <strong>₹{student.fees}</strong>
                </div>
              ))
            )}

            <button
              className="cancel-btn"
              onClick={() => setShowStudentsModal(false)}
              style={{ marginTop: "20px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showRevenueModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRevenueModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "800px",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
          >
            <h3>Fees Collection Details</h3>
            <input
              type="text"
              placeholder="Search Student..."
              value={revenueSearch}
              onChange={(e) => setRevenueSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                margin: "20px 0",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "15px"
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 2fr 2fr 1fr",
                fontWeight: "bold",
                padding: "12px",
                background: "#f3f4f6",
                borderRadius: "8px",
                marginBottom: "10px"
              }}
            >
              <div>Student Name</div>
              <div>Batch</div>
              <div>Last Paid</div>
              <div>Amount</div>
            </div>

            {revenueList.length === 0 ? (
              <p>No payments found.</p>
            ) : (
              revenueList
                .filter(item =>
                  item.student_name
                    ?.toLowerCase()
                    .includes(revenueSearch.toLowerCase())
                )
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "3fr 2fr 2fr 1fr",
                      alignItems: "center",
                      padding: "14px 12px",
                      borderBottom: "1px solid #e5e7eb"
                    }}
                  >
                    <div>
                      <strong>{item.student_name}</strong>
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "#374151",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      title={item.batch_name}
                    >
                      {item.batch_name}
                    </div>
                    <div>
                      {item.payment_date}
                    </div>

                    <div
                      style={{
                        color: "#16a34a",
                        fontWeight: "bold"
                      }}
                    >
                      ₹{item.amount_paid}
                    </div>
                  </div>
                ))
            )}

            <button
              className="cancel-btn"
              onClick={() => setShowRevenueModal(false)}
              style={{ marginTop: "20px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showBatchSelector && (
        <div className="modal-overlay">
          <div className="modal">

            <h3 className="batch-selector-title">
              Select Batch
            </h3>

            <p className="batch-selector-subtitle">
              {selectedSearchStudent?.name} is enrolled in multiple batches.
              <br />
              Choose the batch you want to enter.
            </p>

            {selectedStudentBatches.map((batch, index) => (
              <button
                key={index}
                className="batch-option-btn"
                style={{
                  width: "100%",
                  marginBottom: "10px"
                }}
                onClick={() => {

                  const studentWithBatch = {
                    ...selectedSearchStudent,
                    selectedBatch: batch
                  }

                  setSelectedSearchStudent(studentWithBatch)

                  setShowBatchSelector(false)
                  setSearchQuery("")
                  setSearchResults([])

                  setTimeout(() => {
                    setActiveTab("batches")
                  }, 50)

                }}
              >
                {batch}
              </button>
            ))}



            <button
              className="batch-cancel-btn"
              onClick={() => setShowBatchSelector(false)}
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {showAssignBatchPopup && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>Assign Batch</h3>

            <p>
              {selectedSearchStudent?.name}
              has no batch assigned.
            </p>

            <select
              value={assignBatch}
              onChange={(e) =>
                setAssignBatch(e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "15px"
              }}
            >
              <option value="">
                Select Batch
              </option>

              {allBatches.map((batch) => (
                <option
                  key={batch.id}
                  value={batch.name}
                >
                  {batch.name}
                </option>
              ))}
            </select>
            <button
              onClick={async () => {

                if (!assignBatch) {
                  alert("Please select a batch")
                  return
                }

                const { error } = await supabase
                  .from("students")
                  .update({
                    batch: assignBatch,
                    batch_list: [assignBatch]
                  })
                  .eq(
                    "id",
                    selectedSearchStudent.id
                  )

                if (error) {
                  alert(error.message)
                  return
                }

                alert("Batch Assigned Successfully")

                const updatedStudent = {
                  ...selectedSearchStudent,
                  batch: assignBatch,
                  batch_list: [assignBatch]
                }

                setSelectedSearchStudent(updatedStudent)

                setShowAssignBatchPopup(false)

                setSearchQuery("")
                setSearchResults([])

                setActiveTab("batches")

              }}
            >
              Save
            </button>
          </div>
        </div>
      )}


    </div >
  )
}

export default AdminDashboard
