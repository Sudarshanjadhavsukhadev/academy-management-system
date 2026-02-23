import { useState, useEffect } from "react"
import { supabase } from "../../../services/supabase"

import "./Trainers.css"

function Trainers() {
  const [trainers, setTrainers] = useState([])


  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")

  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // success or error
  const [adminSession, setAdminSession] = useState(null)







  const fetchTrainers = async () => {
    const { data, error } = await supabase
      .from("trainers")
      .select(`
      *,
      trainer_batches (
        batch_name
      )
    `)
      .order("status", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setTrainers(data)
    }
  }

  // 🔥 STEP 4 - also add this below it
  useEffect(() => {
    window.scrollTo(0, 0)

    fetchTrainers()

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

          <div className="controls">
            <input
              type="text"
              placeholder="Search trainer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />



            <button
              className="delete-btn"
              disabled={selected.length === 0}
              onClick={deleteSelected}
            >
              Delete Selected
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
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Branch</th>
                <th>Batches</th>
                <th>Salary Type</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrainers.map((trainer) => (
                <tr key={trainer.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(trainer.id)}
                      onChange={() => toggleSelect(trainer.id)}
                    />
                  </td>
                  <td>{trainer.name}</td>
                  <td>{trainer.email}</td>
                  <td>{trainer.mobile}</td>
                  <td>{trainer.course}</td>
                  <td>{trainer.branch}</td>
                  <td>
                    {trainer.trainer_batches?.map(b => (
                      <span className="batch-chip" key={b.batch_name}>
                        {b.batch_name}
                      </span>
                    ))}
                  </td>
                  <td>{trainer.salary_type}</td>
                  <td>{trainer.salary}</td>
                  <td>
                    <span className={`status ${trainer.status?.toLowerCase()}`}>
                      {trainer.status === "Pending" && "🟡 Registration Request"}
                      {trainer.status === "Active" && "🟢 Approved"}
                      {trainer.status === "Rejected" && "🔴 Rejected"}
                    </span>
                  </td>
                  <td>
                    {trainer.status === "Pending" ? (
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
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        className="row-delete"
                        onClick={() => deleteTrainer(trainer.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </div>
    </div>
  )

}
export default Trainers
