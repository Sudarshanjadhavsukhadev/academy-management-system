import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabase"

import "./AddBranch.css"

function AddBranch() {
  const navigate = useNavigate()
  const [branchName, setBranchName] = useState("")
  const [message, setMessage] = useState("")
  const [branches, setBranches] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBranchId, setSelectedBranchId] = useState(null)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("id", { ascending: false })

    if (!error) setBranches(data)
  }

  const addBranch = async () => {

    if (!branchName) {
      setMessage("⚠ Please enter branch name")
      return
    }

    const { error } = await supabase
      .from("branches")
      .insert([{ name: branchName }])

    if (error) {
      console.error(error)
      setMessage("❌ Error creating branch")
    }
    else {

      setMessage("✅ Branch created successfully")
      setBranchName("")
      fetchBranches()

      setTimeout(() => {
        setMessage("")
      }, 3000)

    }

  }
  const deleteBranch = async () => {

    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("id", selectedBranchId)

    if (error) {
      alert("Error deleting branch")
    } else {
      fetchBranches()
      setShowDeleteModal(false)
    }

  }

  return (
    <div className="add-branch-page">

      <div className="branch-header">

        <h1>Add New Branch</h1>

        <button
          className="back-btn"
          onClick={() => navigate("/admin")}
        >
          ← Back
        </button>

      </div>

      {message && <div className="success-msg">{message}</div>}

      <div className="branch-form">

        <label>Branch Name</label>

        <input
          type="text"
          placeholder="Enter Branch Name"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
        />

        <button
          className="save-branch-btn"
          onClick={addBranch}
        >
          Create Branch
        </button>

      </div>

      {/* ⭐ Previous Branch List */}

      <div className="branch-list">

        <h3>Previous Branches</h3>

        <div className="branch-list-container">

          {branches.length === 0 ? (
            <p>No Branches Added</p>
          ) : (
            branches.map((branch) => (
              <div key={branch.id} className="branch-card">

                <span>{branch.name}</span>

                <button
                  className="delete-btn"
                  onClick={() => {
                    setSelectedBranchId(branch.id)
                    setShowDeleteModal(true)
                  }}
                >
                  Delete
                </button>

              </div>
            ))
          )}

        </div>

      </div>

      {showDeleteModal && (
        <div className="modal-overlay">

          <div className="modal-box">

            <h3>Delete Branch</h3>

            <p>Are you sure you want to delete this branch?</p>

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={deleteBranch}
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default AddBranch