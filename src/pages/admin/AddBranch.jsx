import { useState } from "react"
import { supabase } from "../../services/supabase"
import "./AddBranch.css"

function AddBranch() {

  const [branchName, setBranchName] = useState("")
  const [message, setMessage] = useState("")

  const addBranch = async () => {

    if (!branchName) {
      setMessage("⚠ Please enter branch name")
      return
    }

    const { error } = await supabase
      .from("branches")
      .insert([
        { name: branchName }
      ])

    if (error) {
      console.error(error)
      setMessage("❌ Error creating branch")
    } 
    else {

      setMessage("✅ Branch created successfully")

      setBranchName("")

      setTimeout(() => {
        setMessage("")
      }, 3000)

    }

  }

  return (
    <div className="add-branch-page">

      <h1>Add New Branch</h1>

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

    </div>
  )
}

export default AddBranch