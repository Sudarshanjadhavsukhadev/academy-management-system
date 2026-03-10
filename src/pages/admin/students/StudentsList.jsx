import { useEffect, useState } from "react"
import { supabase } from "../../../services/supabase"
import "./StudentsList.css"

function StudentsList({ goBack }) {

  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editData, setEditData] = useState({})
  const [branches, setBranches] = useState([])
  const [batches, setBatches] = useState([])
  const [activities, setActivities] = useState([])
  useEffect(() => {
    fetchStudents()
    fetchBranches()
    fetchActivities()
  }, [])

  const fetchStudents = async () => {

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("name")

    if (error) {
      console.error(error)
    } else {
      setStudents(data)
    }

  }
  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("*")

    if (!error) setBranches(data)
  }
  const fetchActivities = async () => {

    const { data, error } = await supabase
      .from("activities")
      .select("*")

    if (!error) {
      setActivities(data)
    }

  }
  const fetchBatches = async (branchName) => {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("branch", branchName)

    if (!error) setBatches(data)
  }
  const deleteStudent = async (id) => {

    const confirmDelete = window.confirm("Delete this student?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Error deleting student")
    } else {
      fetchStudents()
    }

  }
  const updateStudent = async () => {

    const { error } = await supabase
      .from("students")
      .update(editData)
      .eq("id", editData.id)

    if (error) {
      alert("Update failed")
      console.error(error)
    } else {
      alert("Student updated")
      setShowEdit(false)
      fetchStudents()
    }

  }
  const openProfile = (student) => {
    setSelectedStudent(student)
    setShowProfile(true)
  }
  const openEdit = (student) => {
    setEditData(student)
    setShowEdit(true)

    if (student.branch) {
      fetchBatches(student.branch)
    }
  }

  return (
    <div className="students-list-page">

      <h2>All Students</h2>

      <table className="students-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Activity</th>
            <th>Batch</th>
            <th>Branch</th>
            <th>Phone</th>
            <th>Fees</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {students.map(student => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.activity}</td>
              <td>{student.batch}</td>
              <td>{student.branch}</td>
              <td>{student["Whatsapp Number"]}</td>
              <td>₹{student.fees}</td>

              <td className="action-buttons">

                <button className="view-btn"
                  onClick={() => openProfile(student)}
                >
                  View
                </button>

                <button
                  className="edit-btn"
                  onClick={() => openEdit(student)}
                >
                  Edit
                </button>

                <button className="delete-btn"
                  onClick={() => deleteStudent(student.id)}
                >
                  Delete
                </button>

              </td>
            </tr>
          ))}

        </tbody>

      </table>

      <button onClick={goBack} className="back-btn">
        Back
      </button>
      {showProfile && selectedStudent && (

        <div className="profile-overlay">

          <div className="profile-popup">

            <button
              className="close-btn"
              onClick={() => setShowProfile(false)}
            >
              ✖
            </button>

            <h2>{selectedStudent.name}</h2>

            <img
              src={
                selectedStudent.profile_photo ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              className="profile-image"
            />

            <div className="profile-details">

              <p><strong>Activity:</strong> {selectedStudent.activity}</p>

              <p><strong>Batch:</strong> {selectedStudent.batch}</p>

              <p><strong>Branch:</strong> {selectedStudent.branch}</p>

              <p><strong>Phone:</strong> {selectedStudent["Whatsapp Number"]}</p>

              <p>
                <strong>Joining Date:</strong>
                {new Date(selectedStudent.join_date).toLocaleDateString()}
              </p>

              <p><strong>Fees:</strong> ₹{selectedStudent.fees}</p>

              <p>
                <strong>DOB:</strong>
                {new Date(selectedStudent.dob).toLocaleDateString()}
              </p>

              <p><strong>Reference:</strong> {selectedStudent.reference}</p>

              <p><strong>Status:</strong> {selectedStudent.status}</p>

            </div>
          </div>

        </div>

      )}
      {showEdit && (

        <div className="profile-overlay">

          <div className="profile-popup">

            <h2>Edit Student</h2>

            <input
              value={editData.name || ""}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Name"
            />

            

            <select
              value={editData.activity || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  activity: e.target.value
                })
              }
            >

              <option value="">Select Activity</option>

              {activities.map((activity) => (
                <option key={activity.id} value={activity.name}>
                  {activity.name}
                </option>
              ))}
            </select>

            <select
              value={editData.branch || ""}
              onChange={(e) => {
                const branch = e.target.value

                setEditData({
                  ...editData,
                  branch: branch,
                  batch: ""   // reset batch when branch changes
                })

                fetchBatches(branch)
              }}
            >

              <option value="">Select Branch</option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.name}>
                  {branch.name}
                </option>
              ))}

            </select>

            <select
              value={editData.batch || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  batch: e.target.value
                })
              }
            >

              <option value="">Select Batch</option>

              {batches.map((batch) => (
                <option key={batch.id} value={batch.name}>
                  {batch.name}
                </option>
              ))}

            </select>

            <input
              value={editData["Whatsapp Number"] || ""}
              onChange={(e) => setEditData({ ...editData, ["Whatsapp Number"]: e.target.value })}
              placeholder="Phone"
            />

            <input
              type="number"
              value={editData.fees || ""}
              onChange={(e) => setEditData({ ...editData, fees: e.target.value })}
              placeholder="Fees"
            />

            <div style={{ marginTop: "10px" }}>

              <button onClick={updateStudent} className="edit-btn">
                Save
              </button>

              <button
                onClick={() => setShowEdit(false)}
                className="delete-btn"
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

export default StudentsList