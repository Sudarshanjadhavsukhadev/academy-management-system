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

import { supabase } from "../../../services/supabase"
import { useEffect, useState } from "react"



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

function Batches() {
  const [batches, setBatches] = useState([])

  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)

  const [newBatch, setNewBatch] = useState({
    name: "",
    course: "",
    trainer: "",
    branch: "",
    timing: "",
    strength: "",
    status: "Active",
    days: [],
  })

  // ✅ ADD HERE 👇
  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error(error)
    } else {
      setBatches(data)
    }
  }
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const deleteBatch = async (id) => {
    const { error } = await supabase
      .from("batches")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
    } else {
      fetchBatches()
    }
  }


  const deleteSelected = async () => {
    const { error } = await supabase
      .from("batches")
      .delete()
      .in("id", selected)

    if (error) {
      console.error(error)
    } else {
      setSelected([])
      fetchBatches()
    }
  }


  const addBatch = async () => {
    const { error } = await supabase
      .from("batches")
      .insert([
        {
          ...newBatch,
          strength: Number(newBatch.strength),
          days: newBatch.days.join(","),
        },
      ])

    if (error) {
      console.error(error)
    } else {
      fetchBatches()
      setShowModal(false)
      setNewBatch({
        name: "",
        course: "",
        trainer: "",
        branch: "",
        timing: "",
        strength: "",
        status: "Active",
        days: [],
      })
    }
  }


  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.course.toLowerCase().includes(search.toLowerCase()) ||
      b.branch.toLowerCase().includes(search.toLowerCase())
  )

  return (

    <div className="batches-page">
      {/* HEADER */}
      <div className="batches-header">
        <h1>Batches</h1>

        <div className="controls">
          <input
            type="text"
            placeholder="Search batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Add Batch
          </button>

          <button
            className="delete-btn"
            disabled={selected.length === 0}
            onClick={deleteSelected}
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="batches-table">
          <thead>
            <tr>
              <th></th>
              <th>Batch</th>
              <th>Course</th>
              <th>Trainer</th>
              <th>Branch</th>
              <th>Days</th>
              <th>Timing</th>
              <th>Students</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredBatches.map((batch) => (
              <tr key={batch.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(batch.id)}
                    onChange={() => toggleSelect(batch.id)}
                  />
                </td>

                <td>{batch.name}</td>
                <td>{batch.course}</td>
                <td>{batch.trainer}</td>
                <td>{batch.branch}</td>

                {/* ✅ Days Column */}
                <td>
                  {batch.days}
                  {!batch.days?.includes("Sun") && (
                    <span style={{ color: "red", marginLeft: "6px" }}>
                      (Closed on Sunday)
                    </span>
                  )}
                </td>

                <td>{batch.timing}</td>
                <td>{batch.strength}</td>

                <td>
                  <span
                    className={`status ${batch.status === "Active" ? "active" : "inactive"
                      }`}
                  >
                    {batch.status}
                  </span>
                </td>

                <td>
                  <button
                    className="row-delete"
                    onClick={() => deleteBatch(batch.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredBatches.length === 0 && (
              <tr>
                <td colSpan="9" className="no-data">
                  No batches found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD BATCH MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Batch</h2>

            <div className="modal-section">
              <h4>Batch Details</h4>
              <div className="modal-form">
                <input
                  placeholder="Batch Name"
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, name: e.target.value })
                  }
                />
                <input
                  placeholder="Course"
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, course: e.target.value })
                  }
                />
                <input
                  placeholder="Trainer"
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, trainer: e.target.value })
                  }
                />
                <input
                  placeholder="Branch"
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, branch: e.target.value })
                  }
                />
                <input
                  placeholder="Timing (e.g. 9 AM - 11 AM)"
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, timing: e.target.value })
                  }
                />
                <input
                  placeholder="Student Strength"
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, strength: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="days-section">
              <h4>Select Working Days</h4>

              <div className="days-grid">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <label
                    key={day}
                    className={`day-card ${newBatch.days.includes(day) ? "selected-day" : ""
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={newBatch.days.includes(day)}
                      onChange={() => {
                        if (newBatch.days.includes(day)) {
                          setNewBatch({
                            ...newBatch,
                            days: newBatch.days.filter((d) => d !== day),
                          })
                        } else {
                          setNewBatch({
                            ...newBatch,
                            days: [...newBatch.days, day],
                          })
                        }
                      }}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="save" onClick={addBatch}>
                Save Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}

export default Batches
