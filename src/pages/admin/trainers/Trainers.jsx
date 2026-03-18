import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../../services/supabase"

import "./Trainers.css"

function Trainers() {
  const [trainers, setTrainers] = useState([])


  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // success or error
  const [adminSession, setAdminSession] = useState(null)
  const [editingTrainer, setEditingTrainer] = useState(null)
  const [confirmDisableTrainer, setConfirmDisableTrainer] = useState(null)
  const [confirmActiveTrainer, setConfirmActiveTrainer] = useState(null)
  const [allBatches, setAllBatches] = useState([])
  const [selectedBatches, setSelectedBatches] = useState([])

  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from("trainers")
      .select("*")
      .order("status", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
    } else {


      const enriched = await Promise.all(

        data.map(async (t) => {

          const batches = await fetchTrainerBatches(t.user_id)

          return {
            ...t,
            batches
          }

        })

      )

      setTrainers(enriched)
    }
  }
  const fetchTrainerBatches = async (trainerId) => {

    const { data } = await supabase
      .from("trainer_batches")
      .select("batch_name")
      .eq("trainer_id", trainerId)

    return data || []
  }
  const fetchAllBatches = async () => {

    const { data, error } = await supabase
      .from("batches")
      .select("name")

    if (!error) {
      setAllBatches(data)
    }

  }

  // 🔥 STEP 4 - also add this below it
  useEffect(() => {
    window.scrollTo(0, 0)

    fetchTrainers()
    fetchAllBatches()
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setAdminSession(data.session)
    }

    getSession()

    // 🔥 REALTIME LISTENER
    const channel = supabase
      .channel("trainer-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trainers",
        },
        () => {
          fetchTrainers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [message])


  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const deleteTrainer = async (id) => {
    const { error } = await supabase
      .from("trainers")
      .delete()
      .eq("id", id)

    if (error) {
      setMessage(error.message)
      setMessageType("error")
    }
    else {
      fetchTrainers()
    }
  }


  const deleteSelected = async () => {
    const { error } = await supabase
      .from("trainers")
      .delete()
      .in("id", selected)

    if (error) {
      console.error(error)
    } else {
      setSelected([])
      fetchTrainers()
    }
  }
  const toggleTrainerStatus = (trainer) => {

    if (trainer.status === "Active") {
      setConfirmDisableTrainer(trainer)
      return
    }

    // 🔥 for Disabled OR Rejected → activate
    if (trainer.status === "Disabled" || trainer.status === "Rejected") {
      setConfirmActiveTrainer(trainer)
      return
    }

  }

  // ✅ APPROVE TRAINER
  const approveTrainer = async (id) => {
    const { error } = await supabase
      .from("trainers")
      .update({ status: "Active" })
      .eq("id", id)

    if (!error) {
      setMessage("Trainer Approved ✅")
      setMessageType("success")
      fetchTrainers()
    }
  }

  // ✅ REJECT TRAINER
  const rejectTrainer = async (id) => {
    const { error } = await supabase
      .from("trainers")
      .update({ status: "Rejected" })
      .eq("id", id)

    if (!error) {
      setMessage("Trainer Rejected ❌")
      setMessageType("error")
      fetchTrainers()
    }
  }

  const toggleBatch = (batchName) => {

    if (selectedBatches.includes(batchName)) {
      setSelectedBatches(
        selectedBatches.filter(b => b !== batchName)
      )
    } else {
      setSelectedBatches([...selectedBatches, batchName])
    }

  }



  const filteredTrainers = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.course.toLowerCase().includes(search.toLowerCase()) ||
      t.branch.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="trainers-page">
      <div className="trainers-container">

        <div className="trainers-header">
          <h1>Trainers</h1>

          <div className="header-actions">
            <input
              className="search-input"
              type="text"
              placeholder="Search trainer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />



            <button
              className="back-btn"
              onClick={() => navigate("/admin")}
            >
              ← Back
            </button>
          </div>
        </div>

        {message && (
          <div className={`custom-message ${messageType}`}>
            {message}
          </div>
        )}
        <div className="table-wrapper">
          <table className="trainers-table">
            <thead>
              <tr>

                <th>Name</th>
                <th>Email</th>
                <th>Batches</th>
                <th>Status</th>
                <th>Edit</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrainers.map((trainer) => (
                <tr key={trainer.id}>

                  <td>{trainer.name}</td>
                  <td>{trainer.email}</td>

                  <td>
                    {trainer.batches?.map(b => (
                      <span className="batch-chip" key={b.batch_name}>
                        {b.batch_name}
                      </span>
                    ))}
                  </td>

                  <td>
                    <span className={`status ${trainer.status?.toLowerCase()}`}>
                      {trainer.status === "Pending" && "🟡 Pending Approval"}
                      {trainer.status === "Active" && "🟢 Approved"}
                      {trainer.status === "Rejected" && "🔴 Rejected"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={async () => {

                        const confirmEdit = window.confirm(
                          `⚠️ You are about to edit trainer "${trainer.name}". Continue?`
                        )

                        if (!confirmEdit) return

                        setEditingTrainer(trainer)

                        const { data } = await supabase
                          .from("trainer_batches")
                          .select("batch_name")
                          .eq("trainer_id", trainer.user_id)

                        const existing = data?.map(b => b.batch_name) || []

                        setSelectedBatches(existing)

                      }}
                    >
                      Edit
                    </button>
                  </td>

                  <td>

                    {trainer.status === "Pending" && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => approveTrainer(trainer.id)}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() => rejectTrainer(trainer.id)}
                          style={{ marginLeft: 10 }}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {trainer.status !== "Pending" && (
                      <button
                        className={trainer.status === "Active" ? "active-btn" : "disable-btn"}
                        onClick={() => toggleTrainerStatus(trainer)}
                      >
                        {trainer.status === "Active" ? "Active" : "Disabled"}
                      </button>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </div>
      {confirmDisableTrainer && (
        <div className="branch-popup-overlay">
          <div className="branch-popup">

            <h3>Disable Trainer</h3>

            <p>
              Are you sure to disable
              <strong> {confirmDisableTrainer.name}</strong> ?
            </p>

            <button
              className="disable-btn"
              onClick={async () => {

                await supabase
                  .from("trainers")
                  .update({ status: "Disabled" })
                  .eq("id", confirmDisableTrainer.id)

                fetchTrainers()
                setConfirmDisableTrainer(null)

              }}
            >
              Yes Disable
            </button>

            <button onClick={() => setConfirmDisableTrainer(null)}>
              Cancel
            </button>

          </div>
        </div>
      )}
      {confirmActiveTrainer && (
        <div className="branch-popup-overlay">
          <div className="branch-popup">

            <h3>Activate Trainer</h3>

            <p>
              Activate
              <strong> {confirmActiveTrainer.name}</strong> ?
            </p>

            <button
              className="active-btn"
              onClick={async () => {

                await supabase
                  .from("trainers")
                  .update({ status: "Active" })
                  .eq("id", confirmActiveTrainer.id)

                fetchTrainers()
                setConfirmActiveTrainer(null)

              }}
            >
              Yes Activate
            </button>

            <button onClick={() => setConfirmActiveTrainer(null)}>
              Cancel
            </button>

          </div>
        </div>
      )}
      {editingTrainer && (
        <div className="branch-popup-overlay">

          <div className="branch-popup">

            <h2>Edit Trainer</h2>

            <input
              type="text"
              placeholder="Trainer Name"
              value={editingTrainer.name || ""}
              onChange={(e) =>
                setEditingTrainer({
                  ...editingTrainer,
                  name: e.target.value
                })
              }
              className="batch-input"
            />

            <input
              type="email"
              placeholder="Email"
              value={editingTrainer.email || ""}
              onChange={(e) =>
                setEditingTrainer({
                  ...editingTrainer,
                  email: e.target.value
                })
              }
              className="batch-input"
            />

            <h3 style={{ marginTop: "20px" }}>Assign Batches</h3>

            <div className="days-container">

              {allBatches.map(batch => (

                <label key={batch.name} className="day-option">

                  <input
                    type="checkbox"
                    checked={selectedBatches.includes(batch.name)}
                    onChange={() => toggleBatch(batch.name)}
                  />

                  {batch.name}

                </label>

              ))}

            </div>

            <div style={{ marginTop: "20px" }}>

              <button
                className="add-btn"
                onClick={async () => {

                  console.log("Trainer ID:", editingTrainer.id)
                  console.log("Selected:", selectedBatches)

                  const { error } = await supabase
                    .from("trainers")
                    .update({
                      name: editingTrainer.name,
                      email: editingTrainer.email
                    })
                    .eq("id", editingTrainer.id)

                  if (error) {
                    console.log(error)
                    alert("Trainer update failed")
                    return
                  }

                  // delete old mapping
                  const { error: deleteError } = await supabase
                    .from("trainer_batches")
                    .delete()
                    .eq("trainer_id", editingTrainer.user_id)

                  if (deleteError) {
                    console.log(deleteError)
                    alert("Delete failed")
                    return
                  }

                  // insert new mapping
                  if (selectedBatches.length > 0) {

                    const rows = selectedBatches.map(batch => ({
                      trainer_id: editingTrainer.user_id,
                      batch_name: batch
                    }))

                    const { data, error: insertError } = await supabase
                      .from("trainer_batches")
                      .insert(rows)
                      .select()

                    console.log("Insert Data:", data)
                    console.log("Insert Error:", insertError)

                    if (insertError) {
                      alert("Insert batches failed")
                      return
                    }
                  }

                  alert("Trainer Updated ✅")

                  fetchTrainers()
                  setEditingTrainer(null)

                }}
              >
                Update
              </button>
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => setEditingTrainer(null)}
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
export default Trainers
