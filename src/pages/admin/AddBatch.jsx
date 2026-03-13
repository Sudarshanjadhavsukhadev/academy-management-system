import { useState, useEffect } from "react"
import { supabase } from "../../services/supabase"
import "./AddBatch.css"

function AddBatch() {

  const [batchName, setBatchName] = useState("")
  const [batchTrainer, setBatchTrainer] = useState("")
  const [batchTime, setBatchTime] = useState("")
  const [batchDays, setBatchDays] = useState([])
  const [branches, setBranches] = useState([])
  const [batchBranch, setBatchBranch] = useState("")
  const [message, setMessage] = useState("")
  const [trainers, setTrainers] = useState([])
  const [batchesList, setBatchesList] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState(null)

  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from("trainers")
      .select("*")

    if (!error) setTrainers(data)
  }
  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("*")

    if (!error) setBranches(data)
  }

  useEffect(() => {
    fetchTrainers()
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

    if (!batchName || !batchTrainer || !batchTime) {
      alert("Fill all fields")
      return
    }

    const { error } = await supabase
      .from("batches")
      .insert([
        {
          name: batchName,
          branch: batchBranch,
          trainer: batchTrainer,
          timing: batchTime,
          days: batchDays.join(", ")
        }
      ])
    if (error) {
      console.error(error)
    } else {


      setMessage("✅ Batch created successfully")

      setBatchName("")
      setBatchTrainer("")
      setBatchTime("")
      setBatchDays([])
      setBatchBranch("")
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

      <h1>Add New Batch</h1>

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

          <label>Assign Trainer</label>
          <select
            value={batchTrainer}
            onChange={(e) => setBatchTrainer(e.target.value)}
          >
            <option value="">Select Trainer</option>

            {trainers.map((trainer) => (
              <option key={trainer.id} value={trainer.name}>
                {trainer.name}
              </option>
            ))}

          </select>

          <label>Batch Time</label>
          <input
            type="time"
            value={batchTime}
            onChange={(e) => setBatchTime(e.target.value)}
          />

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