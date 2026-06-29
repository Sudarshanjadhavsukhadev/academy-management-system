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
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import * as XLSX from "xlsx"
import { supabase } from "../../../services/supabase"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"



import "./Batches.css"

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

function Batches({ searchStudent }) {
  console.log("🔥 Batches component rendered");
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [allBatches, setAllBatches] = useState([])
  const [trainerName, setTrainerName] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [branches, setBranches] = useState([])

  useEffect(() => {
    console.log("selectedBranch =", selectedBranch);
    console.log("branches =", branches);
  }, [selectedBranch, branches]);

  const [search, setSearch] = useState("")

  const [selectedBatch, setSelectedBatch] = useState(null)
  const [showPopup, setShowPopup] = useState(
    sessionStorage.getItem("batchPopupShown") !== "true"
  )
  const [popupStep, setPopupStep] = useState(1)
  const [showMenu, setShowMenu] = useState(false)
  const [showAddBranchPopup, setShowAddBranchPopup] = useState(false)
  const [branchName, setBranchName] = useState("")
  const [showAddBatchPopup, setShowAddBatchPopup] = useState(false)
  const [batchName, setBatchName] = useState("")
  const [batchCourse, setBatchCourse] = useState("")
  const [batchBranch, setBatchBranch] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [trainers, setTrainers] = useState([])
  const [courses, setCourses] = useState([])
  const [resetBatchFees, setResetBatchFees] = useState(false)
  const [batchTrainer, setBatchTrainer] = useState("")
  const [batchTime, setBatchTime] = useState("")
  const [studentStrength, setStudentStrength] = useState(0)
  const [batchDays, setBatchDays] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [batchStudents, setBatchStudents] = useState([])
  const [viewStudent, setViewStudent] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [paymentStudent, setPaymentStudent] = useState(null)
  const [paymentDate, setPaymentDate] = useState(null)
  const [advanceText, setAdvanceText] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [studentBatches, setStudentBatches] = useState([])
  const [totalFees, setTotalFees] = useState(0)
  const [attendance, setAttendance] = useState({})
  const [attendanceStats, setAttendanceStats] = useState([])
  const [studentAttendanceChart, setStudentAttendanceChart] = useState(null)
  const [studentAttendanceDates, setStudentAttendanceDates] = useState([])
  const [showAttendancePopup, setShowAttendancePopup] = useState(false)
  const [attendanceFromDate, setAttendanceFromDate] = useState("")
  const [attendanceToDate, setAttendanceToDate] = useState("")
  const [lastAttendance, setLastAttendance] = useState({})
  const [messagePopup, setMessagePopup] = useState("")
  const [confirmDisableStudent, setConfirmDisableStudent] = useState(null)
  const [confirmActiveStudent, setConfirmActiveStudent] = useState(null)
  const [confirmResetStudent, setConfirmResetStudent] = useState(null)
  const [confirmSaveStudent, setConfirmSaveStudent] = useState(null)
  const [editImageSrc, setEditImageSrc] = useState(null)
  const [editCrop, setEditCrop] = useState({ x: 0, y: 0 })
  const [editZoom, setEditZoom] = useState(1)
  const [editCroppedAreaPixels, setEditCroppedAreaPixels] = useState(null)
  const [showEditCropModal, setShowEditCropModal] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const fetchAllBatches = async () => {
    const { data, error } = await supabase
      .from("batches")
      .select("*")

    if (error) {
      console.error(error)
    } else {
      setAllBatches(data)
    }
  }
  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("id", { ascending: true });

    console.log("BRANCHES:", data);
    console.log("BRANCH ERROR:", error);

    if (error) {
      console.error(error);
      return;
    }

    setBranches(data || []);
  };
  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from("trainers")
      .select("*")

    if (error) {
      console.error(error)
    } else {
      setTrainers(data)
    }
  }

  const fetchTrainerBatches = async (name) => {

    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("trainer", name)

    if (!error) {
      setBatches(data)
    }

  }


  const fetchStudentStrength = async (batchName) => {

    const { data, error } = await supabase
      .from("students")
      .select("id,batch,batch_list,status,name")

    if (error) {
      console.error(error)
      return
    }

    const filtered = (data || []).filter(student =>
      student.batch === batchName ||
      (Array.isArray(student.batch_list) &&
        student.batch_list.includes(batchName))
    )
    console.log("COUNTED STUDENTS", filtered)
    setStudentStrength(
      filtered.filter(
        student => student.status?.toLowerCase() !== "disabled"
      ).length
    )
  }
  const fetchBatchStudents = async (batchName) => {

    const { data, error } = await supabase
      .from("students")
      .select("*")

    if (error) {
      console.error(error)
      return
    }

    const filtered = (data || []).filter(student =>
      student.batch === batchName ||
      (Array.isArray(student.batch_list) &&
        student.batch_list.includes(batchName))
    )

    const { data: feeData } = await supabase
      .from("student_fees")
      .select("*")
      .eq("batch_name", batchName)
    console.log("Batch Name:", batchName);
    console.log("Fee Data:", feeData);
    console.log("Student IDs:", filtered.map(s => ({
      id: s.id,
      name: s.name
    })));

    const studentsWithFees = filtered.map(student => {

      const matchedFees = feeData.filter((f) => {
        const match =
          String(f.student_id).trim() === String(student.id).trim();

        console.log("---------------");
        console.log("Student:", student.name);
        console.log("Student ID:", student.id);
        console.log("Fee Student ID:", f.student_id);
        console.log("Matched:", match);

        return match;
      });

      console.log("Matched Fees:", matchedFees);

      console.log("================================");
      console.log("Student:", student.name);
      console.log("Student ID:", student.id);
      console.log("Matched Fees:", matchedFees);

      const latestFee = matchedFees.sort(
        (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
      )[0];

      console.log("Latest Fee Object =", latestFee);
      console.log("Payment Date =", latestFee?.payment_date);
      console.log("Student Last Payment =", student.last_payment_date);

      const lastPayment =
        student.payment_reset
          ? null
          : (
            latestFee?.payment_date ??
            student.last_payment_date ??
            null
          );

      return {
        ...student,
        latestFee: student.payment_reset ? null : latestFee,
        last_payment_date: lastPayment
      };

    });

    setBatchStudents(studentsWithFees)
  }
  const fetchLastAttendance = async (batchName) => {

    const { data, error } = await supabase
      .from("attendance")
      .select("student_id, date, status")
      .eq("batch", batchName)
      .order("date", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    const map = {}

    data.forEach(record => {

      if (!map[record.student_id]) {
        map[record.student_id] = {
          date: record.date,
          status: record.status
        }
      }

    })

    setLastAttendance(map)
  }
  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")

    console.log("Courses Data:", data)   // 👈 ADD THIS LINE

    if (error) {
      console.error(error)
    } else {
      setCourses(data)
    }
  }
  const addBranch = async () => {
    if (!branchName.trim()) {
      alert("Please enter branch name")
      return
    }

    const { error } = await supabase
      .from("branches")
      .insert([{ name: branchName }])

    if (error) {
      console.error(error)
    } else {
      setBranchName("")
      setShowAddBranchPopup(false)
      fetchBranches() // refresh branch list
    }
  }
  const deleteBranch = async (id) => {
    const confirmDelete = window.confirm("Delete this branch?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
    } else {
      fetchBranches()
    }
  }
  const addBatch = async () => {

    if (!batchName || !batchCourse || !batchBranch || !batchTrainer) {
      alert("Please fill all fields")
      return
    }

    // ⭐ insert batch first
    const selectedBranchRow = branches.find(
      branch => String(branch.id) === String(batchBranch)
    )

    const { error } = await supabase
      .from("batches")
      .insert([
        {
          name: batchName,
          course: batchCourse,
          branch_id: String(batchBranch),
          branch: selectedBranchRow?.name,
          trainer: batchTrainer,
          timing: batchTime,
          days: batchDays.join(", ")
        }
      ])

    if (error) {
      console.error(error)
      return
    }

    // ⭐ VERY IMPORTANT → get trainer REAL ID
    const { data: trainerRow } = await supabase
      .from("trainers")
      .select("id")
      .eq("name", batchTrainer)
      .single()

    if (trainerRow) {

      await supabase.from("trainer_batches").insert([
        {
          trainer_id: trainerRow.id,
          batch_name: batchName
        }
      ])

    }

    // reset
    setBatchName("")
    setBatchCourse("")
    setBatchBranch("")
    setBatchTrainer("")
    setBatchTime("")
    setBatchDays([])
    setShowAddBatchPopup(false)

    setSelectedBranch(batchBranch)
    fetchBatches(batchBranch)
    alert("Batch Created & Trainer Assigned ✅")

  }
  const updateBatch = async () => {

    const selectedBranchRow = branches.find(
      branch => String(branch.id) === String(batchBranch)
    )

    const { error } = await supabase
      .from("batches")
      .update({
        name: batchName,
        course: batchCourse,
        branch_id: String(batchBranch),
        branch: selectedBranchRow?.name,
        trainer: batchTrainer,
        timing: batchTime,
        days: batchDays.join(", ")
      })
      .eq("id", selectedBatch.id)
    if (error) {
      console.error(error)
    } else {

      alert("Batch Updated")

      setIsEditing(false)

      await fetchBatches(batchBranch)

      const updatedBatch = {
        ...selectedBatch,
        name: batchName,
        course: batchCourse,
        branch_id: batchBranch,
        trainer: batchTrainer,
        timing: batchTime,
        days: batchDays.join(", ")
      }

      setSelectedBatch(updatedBatch)

      sessionStorage.setItem(
        "selectedBatch",
        JSON.stringify(updatedBatch)
      )

    }

  }


  const deleteBatch = async (id) => {
    const confirmDelete = window.confirm("Delete this batch?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("batches")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
    } else {
      fetchBatches(batchBranch || selectedBranch)
    }
  }

  useEffect(() => {
    fetchBranches()
    fetchTrainers()
    fetchCourses()
    fetchAllBatches()
  }, [])
  useEffect(() => {

    const loadSavedData = async () => {
      if (searchStudent) return;

      if (branches.length === 0) return

      const savedBranch = sessionStorage.getItem("selectedBranch")
      const savedBatch = sessionStorage.getItem("selectedBatch")

      if (savedBranch) {
        setSelectedBranch(savedBranch)
        await fetchBatches(savedBranch)
      }

      if (savedBatch) {

        const parsedBatch = JSON.parse(savedBatch)

        const { data: latestBatch, error } = await supabase
          .from("batches")
          .select("*")
          .eq("id", parsedBatch.id)
          .single()

        console.log("LATEST BATCH =", latestBatch)

        if (!error && latestBatch) {

          setSelectedBatch(latestBatch)

          sessionStorage.setItem(
            "selectedBatch",
            JSON.stringify(latestBatch)
          )

          setActiveTab("students")
        }
      }
    }

    loadSavedData()

  }, [branches, searchStudent])
  useEffect(() => {

    const getTrainer = async () => {

      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user) return

      const email = userData.user.email

      const { data, error } = await supabase
        .from("trainers")
        .select("name")
        .eq("email", email)

      if (error) {
        console.log(error)
        return
      }

      if (data && data.length > 0) {

        setTrainerName(data[0].name)

        await fetchTrainerBatches(data[0].name)

        setShowPopup(false)
        sessionStorage.setItem("batchPopupShown", "true")

      }
    }

    getTrainer()

  }, [])

  useEffect(() => {

    if (!selectedBatch) return

    setBatchStudents([])        // 🔥 clear old students
    setAttendance({})           // 🔥 clear old attendance

    fetchBatchStudents(selectedBatch.name)

    fetchStudentStrength(selectedBatch.name)
    fetchLastAttendance(selectedBatch.name)

  }, [selectedBatch?.id])

  useEffect(() => {
    if (!searchStudent) return;

    const row = document.getElementById(
      `student-${searchStudent.id}`
    );

    if (row) {
      row.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [batchStudents, searchStudent]);

  const loadBatches = async () => {

    if (!searchStudent) return

    const batchToOpen =
      searchStudent.selectedBatch ||
      searchStudent.batch

    console.log("searchStudent =", searchStudent);
    console.log("batchToOpen =", batchToOpen);
    console.log(
      "Available batches =",
      allBatches.map(b => ({
        name: b.name,
        branch: b.branch
      }))
    );

    const batchRow = allBatches.find(
      b => b.name.trim() === batchToOpen.trim()
    );

    console.log("batchRow =", batchRow);

    if (!batchRow) return

    const branchRow = branches.find(
      b => b.name === batchRow.branch
    )
    console.log("branchRow =", branchRow);

    if (!branchRow) return

    setShowPopup(false)

    setSelectedBranch(branchRow.id)

    console.log("branchRow =", branchRow);
    console.log("branchRow.id =", branchRow.id);
    console.log("branchRow.name =", branchRow.name);

    const loaded = await fetchBatches(branchRow.id)

    if (!loaded || loaded.length === 0) return

    const selected = loaded.find(
      b => b.name === batchRow.name
    )

    if (!selected) {
      console.log("Batch not found", loaded)
      return
    }

    setSelectedBatch(selected)

    sessionStorage.setItem(
      "selectedBranch",
      branchRow.id
    )

    sessionStorage.setItem(
      "selectedBatch",
      JSON.stringify(selected)
    )

    setActiveTab("students")

  }

  useEffect(() => {

    if (!searchStudent) return;

    if (branches.length === 0) return;

    if (allBatches.length === 0) return;

    console.log("Running loadBatches...");
    loadBatches();

  }, [searchStudent, branches, allBatches]);

  const fetchBatches = async (branchId) => {

    let branchRow = branches.find(
      b => String(b.id) === String(branchId)
    )

    // If branches state is not ready,
    // fetch directly from Supabase.
    if (!branchRow) {

      const { data } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .single()

      branchRow = data
    }

    if (!branchRow) return []

    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("branch", branchRow.name)

    if (error) {
      console.log(error)
      return []
    }

    setBatches(data || [])

    return data || []
  }



  const toggleDay = (day) => {

    if (batchDays.includes(day)) {
      setBatchDays(batchDays.filter(d => d !== day))
    } else {
      setBatchDays([...batchDays, day])
    }

  }

  const toggleStudentStatus = async (student) => {

    const status = student.status?.toLowerCase().trim()

    // ACTIVE → DISABLE CONFIRM
    if (status === "active") {
      setConfirmDisableStudent(student)
      return
    }

    // DISABLED → ACTIVE CONFIRM
    if (status === "disabled") {
      setConfirmActiveStudent(student)
      return
    }

  }

  const markAttendance = (id, status) => {

    setAttendance(prev => ({
      ...prev,
      [id]: status
    }))

  }
  const fetchAttendanceStats = async () => {

    const { data, error } = await supabase
      .from("attendance")
      .select("*")

    if (error) {
      console.error(error)
      return
    }

    const monthly = {}

    data.forEach((record) => {

      const month = new Date(record.date).toLocaleString("default", { month: "short" })

      if (!monthly[month]) {
        monthly[month] = 0
      }

      if (record.status === "Present") {
        monthly[month] += 1
      }

    })

    const labels = Object.keys(monthly)
    const values = Object.values(monthly)

    setAttendanceStats({
      labels,
      datasets: [
        {
          label: "Monthly Attendance",
          data: values,
          backgroundColor: "#6366f1"
        }
      ]
    })
  }
  useEffect(() => {
    fetchAttendanceStats()
  }, [])

  const fetchStudentAttendanceCalendar = async (studentId) => {

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", studentId)

    if (error) {
      console.error(error)
      return
    }

    const formatted = data.map((record) => ({
      date: new Date(record.date),
      status: record.status
    }))

    setStudentAttendanceDates(formatted)
  }

  const saveAttendance = async () => {



    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")

    const today = `${year}-${month}-${day}`
    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("batch", selectedBatch.name)
      .eq("date", today)

    if (existing.length > 0) {
      setMessagePopup("⚠️ Attendance already saved today")
      return
    }

    const records = batchStudents.map(student => ({
      student_id: student.id,
      student_name: student.name,
      batch: selectedBatch.name,
      date: today,
      status: attendance[student.id] === "present" ? "Present" : "Absent"
    }))

    const { error } = await supabase
      .from("attendance")
      .insert(records)

    if (error) {
      console.error(error)
      setMessagePopup("❌ Error saving attendance")
    } else {

      setMessagePopup("✅ Attendance saved successfully")

      fetchLastAttendance(selectedBatch.name)

      // ⭐⭐⭐⭐⭐ VERY VERY IMPORTANT ⭐⭐⭐⭐⭐
      if (viewStudent) {
        fetchStudentAttendanceCalendar(viewStudent.id)
      }

    }

  }


  const filteredBatches = batches
  // ✅ ACTIVE STUDENTS
  const activeStudents = batchStudents.filter(
    (student) =>
      student.status !== "disabled" &&
      student.name?.toLowerCase().includes(search.toLowerCase())
  )

  // ✅ INACTIVE STUDENTS
  const inactiveStudents = batchStudents.filter(
    (student) =>
      student.status === "disabled" &&
      student.name?.toLowerCase().includes(search.toLowerCase())
  )



  const getTileClass = ({ date }) => {

    const todayStr = new Date().toDateString()

    // ⭐ DO NOT COLOR TODAY
    if (date.toDateString() === todayStr) {
      return null
    }

    // attendance record
    const record = studentAttendanceDates.find(
      (d) => d.date.toDateString() === date.toDateString()
    )

    if (record) {
      if (record.status === "Present") return "present-day"
      if (record.status === "Absent") return "absent-day"
    }

    // batch class day logic
    if (selectedBatch?.days) {

      const batchDays = selectedBatch.days.split(", ").map(d => d.trim())

      const dayName = date.toLocaleString("en-US", { weekday: "short" })

      if (batchDays.includes(dayName)) {
        return "class-day"
      }

    }

    return null
  }
  const getTileContent = ({ date }) => {

    if (!selectedBatch?.days) return null

    const batchDays = selectedBatch.days.split(", ").map(d => d.trim())

    const dayName = date.toLocaleString("en-US", { weekday: "short" })

    const record = studentAttendanceDates.find(
      (d) => d.date.toDateString() === date.toDateString()
    )

    // if attendance marked → don't show class text
    if (record) return null

    if (batchDays.includes(dayName)) {
      return <div className="class-text">CLASS</div>
    }

  }

  const formatDate = (date) => {

    if (!date) return "-"

    const d = new Date(date)

    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()

    return `${day}/${month}/${year}`

  }

  const getNextDueDate = (student) => {

    if (!student.last_payment_date || !student.join_date) {
      return null
    }

    const paidDate = new Date(student.last_payment_date)

    const joinDate = new Date(student.join_date)

    // ✅ ALWAYS USE JOIN DATE DAY
    const joinDay = joinDate.getDate()

    const nextDue = new Date(
      paidDate.getFullYear(),
      paidDate.getMonth() + 1,
      joinDay
    )

    return nextDue
  }

  const downloadAttendanceSheet = async () => {

    if (!selectedBatch) return

    // 🔥 fetch all attendance of this batch
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("batch", selectedBatch.name)
      .gte("date", attendanceFromDate)
      .lte("date", attendanceToDate)

    if (error) {
      console.error(error)
      return
    }

    // 🔥 get all unique dates
    const allDates = [
      ...new Set(data.map(r => r.date))
    ].sort()

    // 🔥 group by student
    const studentsMap = {}

    data.forEach(record => {
      if (!studentsMap[record.student_id]) {
        studentsMap[record.student_id] = {
          name: record.student_name,
          records: {}
        }
      }

      const day = record.date

      studentsMap[record.student_id].records[day] =
        record.status === "Present" ? "P" : "A"
    })

    // 🔥 create excel rows
    const rows = [
      ["MJK ACADEMY"],
      ["ATTENDANCE REPORT"],
      [],
      ["Batch", selectedBatch.name],
      ["Trainer", selectedBatch.trainer],
      ["Branch", selectedBatch.branch],
      ["From Date", attendanceFromDate],
      ["To Date", attendanceToDate],
      []
    ]

    // header
    const formattedDates = allDates.map(date => {
      const d = new Date(date)

      return `${String(d.getDate()).padStart(2, "0")}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${d.getFullYear()}`
    })

    const header = ["Student Name", ...formattedDates]
    rows.push(header)

    // data rows
    Object.values(studentsMap).forEach(student => {

      const row = [student.name]

      allDates.forEach(date => {
        row.push(student.records[date] || "-")
      })

      rows.push(row)
    })

    // 🔥 convert to sheet
    const ws = XLSX.utils.aoa_to_sheet(rows)
    Object.keys(ws).forEach(cell => {
      if (!cell.startsWith("!")) {
        ws[cell].s = {
          alignment: {
            horizontal: "center",
            vertical: "center"
          }
        }
      }
    })
    ws["!cols"] = [
      { wch: 35 }, // Student Name
      ...allDates.map(() => ({ wch: 12 }))
    ]
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, "Attendance")

    XLSX.writeFile(
      wb,
      `${selectedBatch.name}_Attendance_Report_${attendanceFromDate}_to_${attendanceToDate}.xlsx`
    )
    setShowAttendancePopup(false)
  }

  return (
    <div className="batches-page">

      {/* HEADER */}

      {!showPopup && (
        <div className="top-control-bar">

          {/* Branch */}
          {console.log("Dropdown value:", selectedBranch)}
          <select
            value={selectedBranch}
            onChange={(e) => {

              setSelectedBranch(e.target.value)
              sessionStorage.setItem("selectedBranch", e.target.value)

              setSelectedBatch(null)
              sessionStorage.removeItem("selectedBatch")

              fetchBatches(e.target.value)
            }}
          >
            <option value="">Select Branch</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          {/* Batch */}
          <select
            value={selectedBatch?.id || ""}
            onChange={(e) => {
              const batch = batches.find(b => b.id == e.target.value)
              setSelectedBatch(batch)

              sessionStorage.setItem(
                "selectedBatch",
                JSON.stringify(batch)
              )
              setActiveTab("students")
            }}
          >
            <option value="">Select Batch</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="right-controls">

            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button onClick={() => navigate("/admin")}>
              ← Back
            </button>

          </div>

        </div>
      )}

      {/* BATCH DETAILS */}
      {selectedBatch && (
        <div className="batch-details-card">

          <div className="batch-top-row">

            <div className="batch-actions">
              <button
                className={activeTab === "details" ? "tab-btn active-tab" : "tab-btn"}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>

              <button
                className={activeTab === "students" ? "tab-btn active-tab" : "tab-btn"}
                onClick={() => setActiveTab("students")}
              >
                Students
              </button>

              <button
                className={activeTab === "attendance" ? "tab-btn active-tab" : "tab-btn"}
                onClick={() => setActiveTab("attendance")}
              >
                Attendance
              </button>

              <button
                onClick={() => setShowAttendancePopup(true)}
              >
                Attendance Sheet
              </button>
              <button
                className={activeTab === "inactive" ? "tab-btn active-tab" : "tab-btn"}
                onClick={() => setActiveTab("inactive")}
              >
                Inactive Students
              </button>


              <button
                onClick={() => {
                  setIsEditing(true)
                  setBatchName(selectedBatch.name)
                  setBatchCourse(selectedBatch.course)
                  setBatchBranch(selectedBatch.branch_id)
                  setBatchTrainer(selectedBatch.trainer)
                  setBatchTime(selectedBatch.timing)
                  setBatchDays(selectedBatch.days?.split(", ") || [])
                }}
              >
                Edit
              </button>
              <button
                style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "none"
                }}
                onClick={async () => {

                  const confirmReset = window.confirm(
                    "Reset paid fee records for this batch?"
                  )

                  if (!confirmReset) return

                  // ONLY RESET STUDENTS WHO ACTUALLY PAID
                  const { error } = await supabase
                    .from("students")
                    .update({
                      payment_reset: true,
                      fee_month: null,
                      advance_note: null,
                      last_payment_date: null,
                      fees_status: null
                    })
                    .eq("batch", selectedBatch.name)
                    .eq("branch", selectedBatch.branch)


                  if (error) {
                    console.error(error);
                    alert("Failed to reset batch fees");
                    return;
                  }

                  await fetchBatchStudents(selectedBatch.name)
                  window.dispatchEvent(new Event("paymentUpdated"))

                  // ✅ VERY IMPORTANT
                  setResetBatchFees(true)

                  alert("Batch fees reset successfully")

                }}
              >
                Reset Batch Fees
              </button>
            </div>

            {console.log("SELECTED BATCH =", selectedBatch)}

            <div className="batch-meta">
              <span>
                <strong>Trainer:</strong> {selectedBatch?.trainer}
              </span>

              <span>
                <strong>Students:</strong> {studentStrength}
              </span>
            </div>

          </div>
          {activeTab === "details" && (
            <>
              <div className="batch-title-row">

                <h3 className="batch-name">{selectedBatch.name}</h3>

                <div className="batch-time-days">
                  <span><strong>Time:</strong> {selectedBatch.timing}</span>
                  <span><strong>Days:</strong> {selectedBatch.days}</span>
                </div>

              </div>
            </>
          )}


          {activeTab === "students" && (
            <div className="students-list">

              <h3>Students Enrolled</h3>

              {batchStudents.length === 0 ? (
                <p>No students in this batch</p>
              ) : (
                <table className="students-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Joining Date</th>
                      <th>Fees Assigned</th>

                      <th>Paid On</th>
                      <th>Last Paid</th>
                      <th>Next Due</th>
                      <th>Action</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {activeStudents.map((student) => (
                      <tr
                        id={`student-${student.id}`}
                        key={student.id}
                        className={
                          searchStudent?.id === student.id
                            ? "highlight-student"
                            : student.status === "disabled"
                              ? "disabled-row"
                              : (
                                !student.payment_reset &&
                                student.fees_status === "Paid"
                              )
                                ? "paid-row"
                                : ""
                        }
                      >

                        <td>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column"
                            }}
                          >

                            <span>{student.name}</span>

                            {student.advance_note && (
                              <small
                                style={{
                                  color: "#22c55e",
                                  fontWeight: "600",
                                  marginTop: "4px"
                                }}
                              >
                                {student.advance_note}
                              </small>
                            )}

                          </div>

                        </td>

                        <td>{formatDate(student.join_date)}</td>

                        <td>{student.fees || "-"}</td>



                        <td>
                          <button
                            className="mark-fees-btn"
                            disabled={student.status === "disabled"}
                            onClick={() => {

                              setPaymentStudent(student);

                              setPaymentDate(new Date());

                              const batches = student.batch_list || [student.batch];

                              setStudentBatches(batches);

                              const total =
                                batches.length *
                                Number(
                                  student.batch_fees?.[selectedBatch.name] ||
                                  student.fees ||
                                  0
                                );

                              setTotalFees(total);

                              // Admin can edit this amount
                              setPaymentAmount(total.toString());

                            }}
                          >
                            Mark Fees
                          </button>
                        </td>
                        <td>
                          {student.advance_note
                            ? "-"
                            : (
                              student.payment_reset
                                ? "-"
                                : formatDate(
                                  student.latestFee?.payment_date ||
                                  student.last_payment_date
                                )
                            )
                          }
                        </td>
                        <td>

                          {student.advance_note
                            ? "-"
                            : (
                              student.payment_reset
                                ? (
                                  (() => {

                                    const due = getNextDueDate(student)

                                    if (!due) return "-"

                                    const today = new Date()

                                    due.setHours(0, 0, 0, 0)
                                    today.setHours(0, 0, 0, 0)

                                    // ✅ overdue students should still show due
                                    if (today > due) {
                                      return formatDate(due)
                                    }

                                    // ✅ future due students hidden
                                    return "-"

                                  })()
                                )
                                : (
                                  student.last_payment_date
                                    ? formatDate(getNextDueDate(student))
                                    : "-"
                                )
                            )
                          }

                        </td>
                        <td className="action-buttons">

                          {student.advance_note && (
                            <button
                              style={{
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                cursor: "pointer"
                              }}
                              onClick={async () => {
                                await supabase
                                  .from("students")
                                  .update({
                                    advance_note: null,
                                    last_payment_date: null,
                                    fee_month: null,
                                    fees_status: null,
                                    payment_reset: false
                                  })
                                  .eq("id", student.id)

                                fetchBatchStudents(selectedBatch.name)
                              }}
                            >
                              Remove Note
                            </button>
                          )}

                          <button
                            className="view-btn"
                            onClick={() => {
                              setViewStudent(student)
                              fetchStudentAttendanceCalendar(student.id)
                            }}
                          >
                            View
                          </button>

                          <button
                            className="edit-btn"
                            onClick={() =>
                              setEditingStudent({
                                ...student,

                                activity: (() => {
                                  if (Array.isArray(student.activity)) {
                                    return student.activity;
                                  }

                                  if (typeof student.activity === "string") {
                                    try {
                                      const parsed = JSON.parse(student.activity);

                                      if (Array.isArray(parsed)) {
                                        return parsed;
                                      }

                                      return [student.activity];
                                    } catch {
                                      return [student.activity];
                                    }
                                  }

                                  return [];
                                })(),

                                batch_list: (() => {
                                  if (Array.isArray(student.batch_list)) {
                                    return student.batch_list;
                                  }

                                  if (typeof student.batch_list === "string") {
                                    try {
                                      const parsed = JSON.parse(student.batch_list);

                                      if (Array.isArray(parsed)) {
                                        return parsed;
                                      }

                                      return [student.batch_list];
                                    } catch {
                                      return [student.batch_list];
                                    }
                                  }

                                  return student.batch ? [student.batch] : [];
                                })(),
                              })
                            }
                          >
                            Edit
                          </button>

                        </td>


                        <td>
                          {(() => {
                            const status = student.status?.toLowerCase().trim()

                            return (
                              <button
                                className={status === "active" ? "active-btn" : "disable-btn"}
                                onClick={() => toggleStudentStatus(student)}
                              >
                                {status === "active" ? "Active" : "Disabled"}
                              </button>
                            )
                          })()}
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              )}

            </div>
          )}
          {activeTab === "attendance" && (
            <div className="students-list">

              <h3>Attendance</h3>

              {batchStudents.length === 0 ? (
                <p>No students in this batch</p>
              ) : (
                <>
                  <table className="students-table attendance-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Last Attendance</th>
                        <th>Last Status</th>
                        <th>Present</th>
                        <th>Absent</th>
                      </tr>
                    </thead>



                    <tbody>
                      {batchStudents
                        .filter(student => student.status !== "disabled")
                        .map((student) => (
                          <tr
                            key={student.id}
                            className={
                              searchStudent?.id === student.id
                                ? "highlight-student"
                                : attendance[student.id] === "present"
                                  ? "present-row"
                                  : attendance[student.id] === "absent"
                                    ? "absent-row"
                                    : ""
                            }
                          >

                            <td>{student.name}</td>

                            <td>
                              {lastAttendance[student.id]
                                ? new Date(lastAttendance[student.id].date).toLocaleDateString()
                                : "Not Marked"}
                            </td>

                            <td>
                              {!lastAttendance[student.id] ? (
                                "-"
                              ) : (
                                <span
                                  style={{
                                    color:
                                      lastAttendance[student.id].status === "Present"
                                        ? "#16a34a"
                                        : "#dc2626",
                                    fontWeight: "bold"
                                  }}
                                >
                                  {lastAttendance[student.id].status}
                                </span>
                              )}
                            </td>

                            <td>
                              <button

                                className="active-btn"
                                onClick={() => markAttendance(student.id, "present")}
                              >
                                Present
                              </button>
                            </td>

                            <td>
                              <button
                                className="disable-btn"
                                onClick={() => markAttendance(student.id, "absent")}
                              >
                                Absent
                              </button>
                            </td>





                          </tr>
                        ))}
                    </tbody>

                  </table>


                  <div style={{ marginTop: "20px" }}>
                    <button

                      className="add-btn"
                      onClick={saveAttendance}
                    >
                      Save Attendance
                    </button>
                  </div>



                </>



              )}

            </div>
          )}
          {activeTab === "inactive" && (
            <div className="students-list">

              <h3>Inactive Students</h3>

              {inactiveStudents.length === 0 ? (
                <p>No inactive students</p>
              ) : (
                <table className="students-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Joining Date</th>
                      <th>Fees</th>
                      <th>Last Paid</th>
                      <th>Action</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {inactiveStudents.map((student) => (
                      <tr key={student.id} className="disabled-row">

                        <td>{student.name}</td>
                        <td>{formatDate(student.join_date)}</td>
                        <td>{student.fees || "-"}</td>

                        <td>-</td>

                        <td>
                          <button
                            className="view-btn"
                            onClick={() => {
                              setViewStudent(student)
                              fetchStudentAttendanceCalendar(student.id)
                            }}
                          >
                            View
                          </button>
                        </td>

                        <td>
                          <button
                            className="disable-btn"
                            onClick={() => toggleStudentStatus(student)}
                          >
                            Activate
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              )}
            </div>
          )}
        </div>
      )
      }

      {/* BRANCH SELECT POPUP */}
      {
        showPopup && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <button
                className="close-popup"
                onClick={() => {
                  setShowPopup(false)
                  sessionStorage.setItem("batchPopupShown", "true")
                }}
              >
                ✕
              </button>

              {popupStep === 1 && (
                <>
                  <h2>Please Select Branch</h2>
                  <p>Select a branch to view batches</p>

                  <div className="popup-branch-list">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        className="popup-branch-btn"
                        onClick={() => {

                          setSelectedBranch(branch.id)

                          sessionStorage.setItem(
                            "selectedBranch",
                            branch.id
                          )

                          fetchBatches(branch.id)

                          setPopupStep(2)

                        }}
                      >
                        {branch.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {popupStep === 2 && (
                <>
                  <h2>Select Batch</h2>

                  <div className="popup-branch-list">
                    {filteredBatches.map((batch) => (
                      <button
                        key={batch.id}
                        className="popup-branch-btn"
                        onClick={() => {

                          setSelectedBatch(batch)
                          console.log("NEW BATCH =", batch)

                          sessionStorage.setItem(
                            "selectedBatch",
                            JSON.stringify(batch)
                          )

                          setActiveTab("students")

                          setShowPopup(false)

                          sessionStorage.setItem(
                            "batchPopupShown",
                            "true"
                          )

                        }}
                      >
                        {batch.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        )
      }

      {viewStudent && (
        <div className="branch-popup-overlay">
          <div className="student-profile-popup">

            {/* LEFT SIDE */}
            <div className="student-info">

              <h2>Student Profile</h2>

              <img
                src={viewStudent.profile_photo}
                alt="student"
                className="student-photo"
              />

              <div className="student-details-grid">

                <p><strong>Name:</strong> {viewStudent.name}</p>
                <div>
                  <strong>Activity:</strong>

                  <div className="selected-activities" style={{ marginTop: "5px" }}>
                    {(Array.isArray(viewStudent.activity)
                      ? viewStudent.activity
                      : [viewStudent.activity]
                    ).map((act) => (
                      <div key={act} className="activity-chip">
                        {act}
                      </div>
                    ))}
                  </div>
                </div>

                <p><strong>Branch:</strong> {viewStudent.branch}</p>
                <div>
                  <strong>Batches:</strong>

                  <div
                    className="selected-activities"
                    style={{ marginTop: "5px" }}
                  >
                    {(viewStudent.batch_list || [viewStudent.batch]).map((batch) => (
                      <div
                        key={batch}
                        className="activity-chip"
                      >
                        {batch}
                      </div>
                    ))}
                  </div>
                </div>

                <p><strong>Joining Date:</strong> {viewStudent.join_date}</p>
                <p><strong>WhatsApp:</strong> {viewStudent["Whatsapp Number"]}</p>

                <p><strong>Fees:</strong> ₹{viewStudent.fees}</p>
                <p><strong>Date of Birth:</strong> {viewStudent.dob}</p>

                <p><strong>Reference:</strong> {viewStudent.reference}</p>
                <p><strong>Status:</strong> {viewStudent.status}</p>

              </div>
              <button
                className="popup-close-btn"
                onClick={() => setViewStudent(null)}
              >
                ✕
              </button>

            </div>

            {/* RIGHT SIDE */}
            <div className="student-chart">

              <h3>Attendance Chart</h3>

              <Calendar
                tileClassName={getTileClass}
                tileContent={getTileContent}
              />

            </div>

          </div>
        </div>
      )}
      {/* ADD BRANCH POPUP */}
      {
        showAddBranchPopup && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <h2>Add Branch</h2>

              <input
                type="text"
                placeholder="Enter branch name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                style={{
                  padding: "10px",
                  width: "220px",
                  marginTop: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />

              <div style={{ marginTop: "20px" }}>
                <button onClick={addBranch}>Save</button>

                <button
                  style={{ marginLeft: "10px", background: "#e5e7eb", color: "#111" }}
                  onClick={() => setShowAddBranchPopup(false)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )
      }

      {/* ADD BATCH POPUP */}
      {
        showAddBatchPopup && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <h2>Add Batch</h2>
              <h3 style={{ marginTop: "20px" }}>Existing Batches</h3>

              <div className="existing-batches">

                {batches.map((batch) => (
                  <div key={batch.id} className="existing-batch-item">

                    <span>{batch.name}</span>

                    <button
                      className="delete-batch-btn"
                      onClick={() => deleteBatch(batch.id)}
                    >
                      Delete
                    </button>

                  </div>
                ))}

              </div>

              <div className="batch-form-row">

                <input
                  type="text"
                  placeholder="Batch Name"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="batch-input"
                />

                <select
                  value={batchCourse}
                  onChange={(e) => setBatchCourse(e.target.value)}
                  className="batch-input"
                >
                  <option value="">Select Activity</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>

                <select
                  value={batchBranch}
                  onChange={(e) => setBatchBranch(e.target.value)}
                  className="batch-input"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                <select
                  value={batchTrainer}
                  onChange={(e) => setBatchTrainer(e.target.value)}
                  className="batch-input"
                >
                  <option value="">Select Trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.name}>
                      {trainer.name}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={batchTime}
                  onChange={(e) => setBatchTime(e.target.value)}
                  className="batch-input"
                />
                <div className="days-container">

                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                    <label key={day} className="day-option">

                      <input
                        type="checkbox"
                        checked={batchDays.includes(day)}
                        onChange={() => toggleDay(day)}
                      />

                      {day}

                    </label>
                  ))}

                </div>

              </div>


              <div style={{ marginTop: "20px" }}>
                <button onClick={addBatch}>Save</button>

                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => setShowAddBatchPopup(false)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )
      }
      {
        isEditing && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <h2>Edit Batch</h2>

              <div className="batch-form-row">

                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="batch-input"
                />

                <select
                  value={batchCourse}
                  onChange={(e) => setBatchCourse(e.target.value)}
                  className="batch-input"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>

                <select
                  value={batchBranch}
                  onChange={(e) => setBatchBranch(e.target.value)}
                  className="batch-input"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                <select
                  value={batchTrainer}
                  onChange={(e) => setBatchTrainer(e.target.value)}
                  className="batch-input"
                >
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.name}>
                      {trainer.name}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={batchTime}
                  onChange={(e) => setBatchTime(e.target.value)}
                  className="batch-input"
                />

              </div>

              <div className="days-container">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <label key={day} className="day-option">
                    <input
                      type="checkbox"
                      checked={batchDays.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>

              <div style={{ marginTop: "20px" }}>
                <button onClick={updateBatch}>Update</button>

                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )
      }
      {paymentStudent && (
        <div className="branch-popup-overlay">
          <div className="branch-popup">

            <h3>Select Payment Date</h3>

            <div
              style={{
                background: "#f8f8f8",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "15px"
              }}
            >
              <p>
                <strong>Student:</strong> {paymentStudent.name}
              </p>

              <p>
                <strong>Total Activities:</strong> {studentBatches.length}
              </p>

              <p>
                <strong>Total Fees:</strong> ₹{totalFees}
              </p>

              {studentBatches.length > 1 ? (
                <>
                  <label
                    style={{
                      display: "block",
                      marginTop: "12px",
                      marginBottom: "5px"
                    }}
                  >
                    Amount Received
                  </label>

                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter Amount"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc"
                    }}
                  />
                </>
              ) : (
                <p
                  style={{
                    marginTop: "12px",
                    fontWeight: "bold",
                    color: "#16a34a"
                  }}
                >
                  Fees Amount: ₹{paymentStudent.fees}
                </p>
              )}
            </div>

            <div className="payment-calendar">
              <Calendar
                value={paymentDate}
                onChange={(date) => setPaymentDate(date)}
                showNeighboringMonth={false}
              />
            </div>

            <input
              type="text"
              placeholder="Example: Fees Paid Till Dec 2026"
              value={advanceText}
              onChange={(e) => setAdvanceText(e.target.value)}
              style={{
                width: "250px",
                padding: "10px",
                marginTop: "15px",
                borderRadius: "8px",
                border: "1px solid #ddd"
              }}
            />

            <div style={{ marginTop: "15px" }}>

              <button
                className="add-btn"



                onClick={async () => {
                  if (!paymentDate) {
                    alert("Please select date")
                    return
                  }

                  const selectedPaymentDate = new Date(paymentDate)

                  const year = selectedPaymentDate.getFullYear()

                  const month = String(
                    selectedPaymentDate.getMonth() + 1
                  ).padStart(2, "0")

                  const day = String(
                    selectedPaymentDate.getDate()
                  ).padStart(2, "0")

                  const formattedDate = `${year}-${month}-${day}`
                  const paymentMonth = `${year}-${month}`

                  // ✅ PREVENT DOUBLE PAYMENT FOR SAME MONTH

                  const monthName = selectedPaymentDate.toLocaleString(
                    "en-US",
                    { month: "long" }
                  );



                  const { data: existingFee } = await supabase
                    .from("student_fees")
                    .select("id")
                    .eq("student_id", paymentStudent.id)
                    .eq("batch_name", selectedBatch.name)
                    .eq("month", monthName)
                    .eq("year", Number(year))
                    .maybeSingle();


                  console.log("Duplicate Result:", existingFee);
                  console.log("Student ID:", paymentStudent.id);
                  console.log("Batch:", selectedBatch.name);
                  console.log("Month:", monthName);
                  console.log("Year:", Number(year));

                  if (existingFee) {

                    setMessagePopup(
                      `⚠️ Fees already marked for ${monthName} ${year}`
                    );
                    return;
                  }

                  console.log("INSERT START");




                  // ALWAYS fetch student using the exact paymentStudent.id first
                  const { data: studentRow, error: studentLookupError } = await supabase
                    .from("students")
                    .select("id")
                    .eq("id", paymentStudent.id)
                    .maybeSingle()

                  if (studentLookupError) {
                    console.error("Student lookup failed:", studentLookupError)
                    alert("Unable to find student ID for revenue entry.")
                    return
                  }

                  if (!studentRow || !studentRow.id) {
                    alert("Student ID not found.")
                    return
                  }

                  const feeRecords = studentBatches.map((batchName) => ({
                    student_id: studentRow.id,
                    student_name: paymentStudent.name,

                    batch: batchName,
                    batch_name: batchName,

                    branch: paymentStudent.branch,

                    month: monthName,
                    year: Number(year),

                    amount_paid:
                      studentBatches.length > 1
                        ? Number(paymentAmount) / studentBatches.length
                        : Number(paymentStudent.fees),

                    payment_date: formattedDate,
                    status: "Paid",
                    note: advanceText || null
                  }));

                  const { error: feeError } = await supabase
                    .from("student_fees")
                    .insert(feeRecords);

                  console.log("INSERT FINISHED");



                  if (feeError) {
                    console.error("student_fees insert error:", feeError)
                    alert(
                      "Payment saved on student, but failed to create revenue record.\n\n" +
                      feeError.message
                    )
                    return
                  }

                  if (feeError) {
                    console.error(feeError)
                    alert("Payment saved on student, but failed to create revenue record.")
                    return
                  }

                  const { error: studentUpdateError } = await supabase
                    .from("students")
                    .update({
                      last_payment_date: formattedDate,
                      payment_reset: false,
                      fee_month: monthName,
                      fees_status: "Paid",
                      advance_note: advanceText || null
                    })
                    .eq("id", paymentStudent.id)

                  if (studentUpdateError) {
                    console.error(studentUpdateError)
                    alert(studentUpdateError.message)
                    return
                  }

                  await new Promise(resolve => setTimeout(resolve, 300));
                  // Wait a moment so Supabase finishes the delete
                  await new Promise(resolve => setTimeout(resolve, 500));

                  await fetchBatchStudents(selectedBatch.name);

                  setPaymentStudent(null);
                  setPaymentDate(null);

                  window.dispatchEvent(new Event("paymentUpdated"));

                  setPaymentStudent(null)
                  setPaymentDate(null)
                  setAdvanceText("")
                }}
              >
                Save
              </button>

              <button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  setPaymentStudent(null)
                  setPaymentDate(null)   // 🔥 VERY IMPORTANT
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
        messagePopup && (
          <div className="message-popup">
            <div className="message-box">

              <p>{messagePopup}</p>

              <button onClick={() => setMessagePopup("")}>
                OK
              </button>

            </div>
          </div>
        )
      }

      {
        editingStudent && (
          <div className="profile-overlay">
            <div className="profile-edit-card">

              <h2 className="profile-title">Edit Student Profile</h2>

              <div className="profile-edit-body">

                {/* LEFT PHOTO */}
                <div className="profile-photo-section">

                  <img
                    src={editingStudent.profile_photo}
                    className="profile-photo-big"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    id="editPhotoUpload"
                    onChange={(e) => {

                      const file = e.target.files[0]
                      if (!file) return

                      const reader = new FileReader()

                      reader.onload = () => {
                        setEditImageSrc(reader.result)
                        setShowEditCropModal(true)
                      }

                      reader.readAsDataURL(file)

                    }}
                  />

                  <label htmlFor="editPhotoUpload" className="change-photo-btn">
                    Change Photo
                  </label>

                </div>

                {/* RIGHT FORM */}
                <div className="profile-form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      value={editingStudent?.name || ""}
                      onChange={(e) =>
                        setEditingStudent({ ...editingStudent, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Activity</label>

                    <select
                      onChange={(e) => {
                        const value = e.target.value

                        if (!value) return

                        if (!editingStudent.activity?.includes(value)) {
                          setEditingStudent({
                            ...editingStudent,
                            activity: [...(editingStudent.activity || []), value],
                          })
                        }

                        e.target.value = ""
                      }}
                    >
                      <option value="">Select Activity</option>

                      {courses.map((course) => (
                        <option key={course.id} value={course.name}>
                          {course.name}
                        </option>
                      ))}
                    </select>

                    <div className="selected-activities">
                      {(editingStudent.activity || []).map((act) => (
                        <div key={act} className="activity-chip">
                          {act}
                          <span
                            onClick={() =>
                              setEditingStudent({
                                ...editingStudent,
                                activity: editingStudent.activity.filter((a) => a !== act),
                              })
                            }
                          >
                            ❌
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Branch</label>
                    <select
                      value={editingStudent.branch || ""}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          branch: e.target.value
                        })
                      }
                    >
                      <option value="">Select Branch</option>

                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.name}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Batch</label>

                    <select
                      onChange={(e) => {

                        const value = e.target.value;

                        if (!value) return;

                        if (
                          !(editingStudent.batch_list || []).includes(value)
                        ) {
                          setEditingStudent({
                            ...editingStudent,
                            batch_list: [
                              ...(editingStudent.batch_list || []),
                              value
                            ]
                          });
                        }

                        e.target.value = "";

                      }}
                    >
                      <option value="">Select Batch</option>

                      {allBatches.map(batch => (
                        <option
                          key={batch.id}
                          value={batch.name}
                        >
                          {batch.name}
                        </option>
                      ))}
                    </select>

                    <div className="selected-activities">

                      {(editingStudent.batch_list || []).map((batch) => (

                        <div
                          key={batch}
                          className="activity-chip"
                        >

                          {batch}

                          <span
                            onClick={() =>
                              setEditingStudent({
                                ...editingStudent,
                                batch_list:
                                  editingStudent.batch_list.filter(
                                    b => b !== batch
                                  )
                              })
                            }
                          >
                            ❌
                          </span>

                        </div>

                      ))}

                    </div>

                  </div>
                  <div className="form-group">
                    <label>Joining Date</label>
                    <input
                      type="date"
                      value={editingStudent.join_date || ""}
                      onChange={(e) =>
                        setEditingStudent({ ...editingStudent, join_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp Number</label>
                    <input
                      value={editingStudent["Whatsapp Number"] || ""}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          ["Whatsapp Number"]: e.target.value
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Fees</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editingStudent.fees || ""}
                      onChange={(e) =>
                        setEditingStudent({ ...editingStudent, fees: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={editingStudent.dob || ""}
                      onChange={(e) =>
                        setEditingStudent({ ...editingStudent, dob: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Reference</label>
                    <select
                      value={editingStudent.reference || ""}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          reference: e.target.value
                        })
                      }
                    >
                      <option value="">Select Reference</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Google">Google</option>
                      <option value="Friend Referral">Friend Referral</option>
                      <option value="Walk In">Walk In</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>






                </div>

              </div>

              <div className="profile-actions">

                <button
                  className="save-profile-btn"
                  onClick={() => {
                    setConfirmSaveStudent(editingStudent);
                    setEditingStudent(null);
                  }}
                >
                  Save Changes
                </button>

                <button
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none"
                  }}
                  onClick={() => {
                    setConfirmResetStudent(editingStudent)
                    setEditingStudent(null)
                  }}
                >
                  Reset Fees
                </button>

                <button
                  className="cancel-profile-btn"
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </button>

              </div>

            </div>
          </div>
        )
      }
      {
        confirmDisableStudent && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <h3 style={{ marginBottom: "10px" }}>
                Disable Student
              </h3>

              <p style={{ marginBottom: "20px", color: "#555" }}>
                Are you sure you want to disable
                <strong> {confirmDisableStudent.name}</strong> ?
              </p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>

                <button
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none"
                  }}
                  onClick={async () => {

                    const { error } = await supabase
                      .from("students")
                      .update({
                        status: "disabled",
                        last_payment_date: null,
                        fees_status: null
                      })
                      .eq("id", confirmDisableStudent.id)

                    if (!error) {
                      fetchBatchStudents(selectedBatch.name)

                      // Refresh dashboard cards (Total Students, Revenue, Charts)
                      window.dispatchEvent(new Event("paymentUpdated"))
                    }

                    setConfirmDisableStudent(null)

                  }}
                >
                  Yes Disable
                </button>

                <button
                  style={{
                    background: "#e5e7eb",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none"
                  }}
                  onClick={() => setConfirmDisableStudent(null)}
                >
                  Cancel
                </button>

              </div>

            </div>
          </div>
        )
      }
      {
        showEditCropModal && (

          <div className="crop-modal">

            <div className="crop-container">

              <Cropper
                image={editImageSrc}
                crop={editCrop}
                zoom={editZoom}
                aspect={1}
                onCropChange={setEditCrop}
                onZoomChange={setEditZoom}
                onCropComplete={(area, pixels) =>
                  setEditCroppedAreaPixels(pixels)
                }
              />

            </div>

            <button
              onClick={async () => {

                setPhotoUploading(true)

                const croppedBlob = await getCroppedImg(
                  editImageSrc,
                  editCroppedAreaPixels
                )

                const formDataUpload = new FormData()
                formDataUpload.append("file", croppedBlob)
                formDataUpload.append("upload_preset", "dtjyggwjd")

                const res = await fetch(
                  "https://api.cloudinary.com/v1_1/dtjyggwjd/image/upload",
                  {
                    method: "POST",
                    body: formDataUpload
                  }
                )

                const data = await res.json()

                if (data.secure_url) {

                  setEditingStudent({
                    ...editingStudent,
                    profile_photo: data.secure_url
                  })

                }

                setPhotoUploading(false)
                setShowEditCropModal(false)

              }}
            >
              {photoUploading ? "Uploading..." : "Crop & Upload"}
            </button>

          </div>

        )
      }
      {
        confirmActiveStudent && (
          <div className="branch-popup-overlay">
            <div className="branch-popup">

              <h3 style={{ marginBottom: "10px" }}>
                Activate Student
              </h3>

              <p style={{ marginBottom: "20px", color: "#555" }}>
                Are you sure you want to activate
                <strong> {confirmActiveStudent.name}</strong> ?
              </p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>

                <button
                  style={{
                    background: "#22c55e",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none"
                  }}
                  onClick={async () => {

                    const { error } = await supabase
                      .from("students")
                      .update({
                        status: "active",
                        join_date: new Date().toISOString().split("T")[0]
                      })
                      .eq("id", confirmActiveStudent.id)

                    if (!error) {
                      fetchBatchStudents(selectedBatch.name)
                      window.location.reload()   // 🔥 ADD THIS
                    }
                    setConfirmActiveStudent(null)

                  }}
                >
                  Yes Activate
                </button>

                <button
                  style={{
                    background: "#e5e7eb",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none"
                  }}
                  onClick={() => setConfirmActiveStudent(null)}
                >
                  Cancel
                </button>

              </div>

            </div>
          </div>
        )
      }
      {confirmResetStudent && (
        <div className="branch-popup-overlay">
          <div className="branch-popup">

            <h3 style={{ marginBottom: "10px" }}>
              Reset Student Payment
            </h3>

            <p style={{ marginBottom: "20px", color: "#555" }}>
              Are you sure you want to reset payment for
              <strong> {confirmResetStudent.name}</strong>?
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center"
              }}
            >
              <button
                style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none"
                }}
                onClick={async () => {

                  // 1️⃣ Delete student's fee records
                  const { error: deleteFeeError } = await supabase
                    .from("student_fees")
                    .delete()
                    .eq("student_id", confirmResetStudent.id);

                  if (deleteFeeError) {
                    console.error(deleteFeeError);
                    alert("Failed to remove revenue entry.");
                    return;
                  }

                  // 2️⃣ Check if any records still exist
                  const { data: remainingFees, error: checkError } = await supabase
                    .from("student_fees")
                    .select("id")
                    .eq("student_id", confirmResetStudent.id);

                  console.log("Remaining Fees:", remainingFees);

                  if (checkError) {
                    console.error(checkError);
                    return;
                  }

                  if (remainingFees.length > 0) {
                    alert("Some fee records still exist.");
                    return;
                  }

                  // 3️⃣ Reset student payment fields
                  const { error } = await supabase
                    .from("students")
                    .update({
                      payment_reset: true,
                      fee_month: null,
                      advance_note: null,
                      last_payment_date: null,
                      fees_status: null
                    })
                    .eq("id", confirmResetStudent.id);

                  if (error) {
                    console.error(error);
                    return;
                  }

                  await fetchBatchStudents(selectedBatch.name);

                  window.dispatchEvent(new Event("paymentUpdated"));

                  setConfirmResetStudent(null);
                  setEditingStudent(null);
                }}
              >
                Reset Payment
              </button>

              <button
                style={{
                  background: "#e5e7eb",
                  color: "#111",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "none"
                }}
                onClick={() => {
                  setEditingStudent(confirmResetStudent)
                  setConfirmResetStudent(null)
                }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {confirmSaveStudent && (
        <div className="branch-popup-overlay">
          <div className="branch-popup">

            <h3>Save Student Changes</h3>

            <p style={{ marginBottom: "20px" }}>
              Are you sure you want to save changes for
              <strong> {confirmSaveStudent.name}</strong>?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px"
              }}
            >

              <button
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px"
                }}
                onClick={async () => {



                  // Student must have at least one activity

                  if ((confirmSaveStudent.activity || []).length === 0) {

                    alert("Please select at least one activity.");

                    return;

                  }



                  // Student must have at least one batch

                  if ((confirmSaveStudent.batch_list || []).length === 0) {

                    alert("Please select at least one batch.");

                    return;

                  }











                  // Find the complete batch object

                  const selectedBatchRows = allBatches.filter(batch =>

                    (confirmSaveStudent.batch_list || []).includes(batch.name)

                  );



                  console.log("Selected Batch Rows:", selectedBatchRows);



                  const { error } = await supabase

                    .from("students")

                    .update({

                      name: confirmSaveStudent.name,

                      activity: confirmSaveStudent.activity,

                      branch: confirmSaveStudent.branch,



                      batch: confirmSaveStudent.batch_list?.[0] || "",



                      batch_list: confirmSaveStudent.batch_list || [],

                      join_date: confirmSaveStudent.join_date,

                      fees: Number(confirmSaveStudent.fees),

                      batch_fees: (confirmSaveStudent.batch_list || []).reduce(
                        (obj, batchName) => {
                          obj[batchName] = Number(confirmSaveStudent.fees);
                          return obj;
                        },
                        {}
                      ),

                      dob: confirmSaveStudent.dob,

                      reference: confirmSaveStudent.reference,

                      profile_photo: confirmSaveStudent.profile_photo,

                      ["Whatsapp Number"]: confirmSaveStudent["Whatsapp Number"]

                    })

                    .eq("id", confirmSaveStudent.id)



                  if (!error) {



                    // Refresh batches

                    const updatedBatches = await fetchBatches(selectedBranch);



                    // Find the student's new batch

                    const newBatch = updatedBatches.find(

                      batch => batch.name === confirmSaveStudent.batch_list?.[0]

                    );



                    if (newBatch) {

                      setSelectedBatch(newBatch);

                      await fetchBatchStudents(newBatch.name);

                    }



                    window.dispatchEvent(new Event("paymentUpdated"));

                    setConfirmSaveStudent(null);


                    setEditingStudent(null);

                  }



                }}
              >
                Yes Save
              </button>

              <button
                style={{
                  background: "#e5e7eb",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px"
                }}
                onClick={() => {
                  setEditingStudent(confirmSaveStudent);
                  setConfirmSaveStudent(null);
                }}
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}

      {showAttendancePopup && (
        <div className="branch-popup-overlay">
          <div className="attendance-popup">

            <h2>Attendance Report</h2>

            <div className="attendance-input-group">

              <label> From Date</label>

              <input
                type="date"
                value={attendanceFromDate}
                onChange={(e) => setAttendanceFromDate(e.target.value)}
              />

            </div>
            <div className="attendance-input-group">

              <label> To Date</label>

              <input
                type="date"
                value={attendanceToDate}
                onChange={(e) => setAttendanceToDate(e.target.value)}
              />

            </div>


            <div className="attendance-popup-buttons">

              <button
                className="download-attendance-btn"
                onClick={downloadAttendanceSheet}
              >
                ⬇ Download Excel
              </button>
              <button
                className="cancel-attendance-btn"
                onClick={() => setShowAttendancePopup(false)}
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}
    </div >
  )
}
export default Batches
