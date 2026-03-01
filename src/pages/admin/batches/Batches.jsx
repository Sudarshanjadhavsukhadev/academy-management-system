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

function Batches({ openAddModal }) {
  const [batches, setBatches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState("")
  const [branches, setBranches] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
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


  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error(error)
    } else {
      setBranches(data)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])
  useEffect(() => {
    if (openAddModal) {
      setShowModal(true)
    }
  }, [openAddModal])
  const fetchBatches = async (branch) => {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("branch", branch)
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
      fetchBatches(selectedBranch)
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
      fetchBatches(selectedBranch)
    }
  }


  const addBatch = async () => {
    if (!selectedBranch) {
      alert("Please select branch first")
      return
    }

    const { error } = await supabase
      .from("batches")
      .insert([
        {
          ...newBatch,
          branch: selectedBranch, // 🔥 auto set branch
          strength: Number(newBatch.strength),
          days: newBatch.days.join(","),
        },
      ])

    if (error) {
      console.error(error)
    } else {
      fetchBatches(selectedBranch)
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

          <button
            className="add-btn"
            disabled={!selectedBranch}
            onClick={() => setShowModal(true)}
          >
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
      <div className="branch-section">
        <div className="branch-header">
          <h2>Select Branch</h2>
          <button className="add-branch-btn">+ Add Branch</button>
        </div>

        <div className="branch-list">
          {branches.map((branch) => (
            <button
              key={branch.id}
              className={`branch-pill ${selectedBranch === branch.name ? "active-branch" : ""
                }`}
              onClick={() => {
                setSelectedBranch(branch.name)
                setSelected([])
                fetchBatches(branch.name)
              }}
            >
              {branch.name}
            </button>
          ))}
        </div>
      </div>

      {/* BATCH PILLS */}
      {selectedBranch ? (
        <div className="batch-section">
          <h2>Select Batch</h2>

          <div className="batch-list">
            {filteredBatches.map((batch) => (
              <button
                key={batch.id}
                className={`batch-pill ${selectedBatch?.id === batch.id ? "active-batch" : ""
                  }`}
                onClick={() => setSelectedBatch(batch)}
              >
                {batch.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3>Please Select Branch First</h3>
        </div>
      )}

      {/* BATCH DETAILS */}
      {selectedBatch && (
        <div className="batch-details-card">
          <h3>{selectedBatch.name}</h3>

          <div className="details-grid">
            <div><strong>Course:</strong> {selectedBatch.course}</div>
            <div><strong>Trainer:</strong> {selectedBatch.trainer}</div>
            <div><strong>Branch:</strong> {selectedBatch.branch}</div>
            <div><strong>Timing:</strong> {selectedBatch.timing}</div>
            <div><strong>Students:</strong> {selectedBatch.strength}</div>

            <div>
              <strong>Status:</strong>{" "}
              <span className={`status ${selectedBatch.status === "Active" ? "active" : "inactive"
                }`}>
                {selectedBatch.status}
              </span>
            </div>

            <div>
              <strong>Days:</strong> {selectedBatch.days}
            </div>
          </div>
        </div>
      )}

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
