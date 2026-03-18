import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabase"
import "./AddBatch.css"


function AddBatch() {
  const navigate = useNavigate()
  const [batchName, setBatchName] = useState("")

  const [hour, setHour] = useState("")
  const [minute, setMinute] = useState("")
  const [ampm, setAmpm] = useState("")
  const [batchDays, setBatchDays] = useState([])
  const [branches, setBranches] = useState([])
  const [batchBranch, setBatchBranch] = useState("")
  const [message, setMessage] = useState("")

  const [batchesList, setBatchesList] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState(null)


  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("*")

    if (!error) setBranches(data)
  }

  useEffect(() => {

    fetchBranches()
    fetchBatchesList()   // ⭐ ADD THIS
  }, [])

  const deleteBatch = async () => {

    const { error } = await supabase
      .from("batches")
      .delete()
      .eq("id", selectedBatchId)

    if (!error) {
      fetchBatchesList()
      setShowDeleteModal(false)
    }

  }
  const toggleDay = (day) => {

    if (batchDays.includes(day)) {
      setBatchDays(batchDays.filter(d => d !== day))
    } else {
      setBatchDays([...batchDays, day])
    }

  }

  const addBatch = async () => {

    if (!batchName || !batchBranch || !hour || !minute || !ampm) {
      alert("Fill all fields")
      return
    }

    const finalTime = `${hour}:${minute} ${ampm}`



    const { error } = await supabase
      .from("batches")
      .insert([
        {
          name: batchName,
          branch: batchBranch,
          timing: finalTime,
          days: batchDays.join(", ")
        }
      ])

    if (error) {
      console.error(error)
    } else {

      setMessage("✅ Batch created successfully")

      setBatchName("")
      setBatchTrainer("")
      setBatchDays([])
      setBatchBranch("")
      setHour("")
      setMinute("")
      setAmpm("")

      fetchBatchesList()
    }

  }
  const fetchBatchesList = async () => {

    const { data, error } = await supabase
      .from("batches")
      .select("*")

    console.log("BATCH DATA:", data)

    if (!error) setBatchesList(data)

  }
  console.log(batchesList)

  return (
    <div className="add-batch-page">

      <div className="batch-header">

        <h1>Add New Batch</h1>

        <button
          className="back-btn"
          onClick={() => navigate("/admin")}
        >
          ← Back
        </button>

      </div>

      {message && <div className="success-msg">{message}</div>}

      <div className="layout-batch">

        <div className="batch-form">

          <label>Batch Name</label>
          <input
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="Morning Karate"
          />
          <label>Select Branch</label>

          <select
            value={batchBranch}
            onChange={(e) => {
              const branch = e.target.value
              setBatchBranch(branch)


            }}
          >
            <option value="">Select Branch</option>

            {branches.map((branch) => (
              <option key={branch.id} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>



          <label>Batch Time</label>

          <div className="time-row">

            <select value={hour} onChange={(e) => setHour(e.target.value)}>
              <option value="">HH</option>
              {[...Array(12)].map((_, i) => {
                const h = (i + 1).toString().padStart(2, "0")
                return <option key={h}>{h}</option>
              })}
            </select>

            <span className="colon">:</span>

            <select value={minute} onChange={(e) => setMinute(e.target.value)}>
              <option value="">MM</option>
              {[...Array(60)].map((_, i) => {
                const m = i.toString().padStart(2, "0")
                return <option key={m}>{m}</option>
              })}
            </select>

            <select value={ampm} onChange={(e) => setAmpm(e.target.value)}>
              <option value="">AM/PM</option>
              <option>AM</option>
              <option>PM</option>
            </select>

          </div>
          <label>Days</label>

          <div className="days-select">

            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
              <button
                key={day}
                className={batchDays.includes(day) ? "day active-day" : "day"}
                onClick={() => toggleDay(day)}
                type="button"
              >
                {day}
              </button>
            ))}

          </div>

          <button className="save-batch-btn" onClick={addBatch}>
            Create Batch
          </button>

        </div>



        <div className="batch-list-panel">

          <h2>Previous Batches</h2>

          {batchesList.length === 0 ? (
            <p>No Batches Created</p>
          ) : (
            batchesList.map((batch) => (

              <div key={batch.id} className="batch-card">

                <div>
                  <strong>{batch.name}</strong>
                  <p>{batch.branch}</p>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => {
                    setSelectedBatchId(batch.id)
                    setShowDeleteModal(true)
                  }}
                >
                  Delete
                </button>

              </div>

            )))}

        </div>
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-box">

              <h3>Delete Batch</h3>
              <p>Are you sure you want to delete this batch?</p>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="confirm-delete-btn"
                  onClick={deleteBatch}
                >
                  Delete
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>


  )

}

export default AddBatch