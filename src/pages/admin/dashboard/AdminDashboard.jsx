import "./AdminDashboard.css"
import { useState, useEffect } from "react"
import * as XLSX from "xlsx"

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

    const paymentByMonth = {}
    rawData.forEach((row) => {
      const month = row["Month"]
      const amount = Number(row["Payment Amount"]) || 0
      if (!month) return
      paymentByMonth[month] = (paymentByMonth[month] || 0) + amount
    })

    const paymentStatusMap = {}
    rawData.forEach((row) => {
      const status = row["Payment Status"]
      if (!status) return
      paymentStatusMap[status] = (paymentStatusMap[status] || 0) + 1
    })

    setCharts({
      numericTotals,
      paymentByMonth,
      paymentStatusMap,
    })

    if (!analysisDone) {
      setShowSaveModal(true)
      setAnalysisDone(true)
    }

  }, [rawData, columns])



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
        alert("✅ Data saved successfully")

        // 🔥 Reset dashboard after saving
        setRawData([])
        setColumns([])
        setSummary({})
        setCharts({})
        setAnalysisDone(false)
      }
      else {
        alert(result.message || "❌ Failed to save data")
      }
    } catch (error) {
      alert("❌ Server error")
    } finally {
      setShowSaveModal(false)
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Excel Data Analyzer</h1>

        <button
          className="upload-btn"
          onClick={() => setShowUploadModal(true)}
        >
          Analyze Excel
        </button>
      </div>

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
      {charts.numericTotals && (
        <div className="chart-grid">
          {/* Numeric Summary */}
          <div className="chart-card">
            <h3>Numeric Data Summary</h3>
            <Bar
              data={{
                labels: Object.keys(charts.numericTotals),
                datasets: [
                  {
                    data: Object.values(charts.numericTotals),
                    backgroundColor: "#2563eb",
                  },
                ],
              }}
            />
          </div>

          {/* Payment Status Pie */}
          {charts.paymentStatusMap && (
            <div className="chart-card">
              <h3>Payment Status Distribution</h3>
              <Pie
                data={{
                  labels: Object.keys(charts.paymentStatusMap),
                  datasets: [
                    {
                      data: Object.values(charts.paymentStatusMap),
                      backgroundColor: ["#2563eb", "#16a34a"],
                    },
                  ],
                }}
              />
            </div>
          )}

          {/* Payment by Month Bar */}
          {charts.paymentByMonth && (
            <div className="chart-card">
              <h3>Total Payment by Month</h3>
              <Bar
                data={{
                  labels: Object.keys(charts.paymentByMonth),
                  datasets: [
                    {
                      data: Object.values(charts.paymentByMonth),
                      backgroundColor: "#9333ea",
                    },
                  ],
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
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
      )}
      {/* Save Confirmation Modal */}
      {showSaveModal && (
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
      )}

    </div>
  )
}

export default AdminDashboard
