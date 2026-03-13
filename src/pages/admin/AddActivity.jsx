import { useState, useEffect } from "react"
import { supabase } from "../../services/supabase"
import "./AddActivity.css"

function AddActivity() {

  const [activityName, setActivityName] = useState("")
  const [activities, setActivities] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedActivityId, setSelectedActivityId] = useState(null)
  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("id", { ascending: false })

    if (!error) setActivities(data)
  }

  const handleAddActivity = async (e) => {
    e.preventDefault()

    if (!activityName) {
      alert("Enter activity name")
      return
    }

    const { error } = await supabase
      .from("courses")
      .insert([{ name: activityName }])

    if (error) {
      alert("Error adding activity")
    } else {
      alert("Activity Added Successfully")
      setActivityName("")
      fetchActivities()
    }
  }

  const deleteActivity = async () => {

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", selectedActivityId)

    if (error) {
      alert("Error deleting activity")
    } else {
      fetchActivities()
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="add-activity-page">
      <h2>Add Activity</h2>

      <form onSubmit={handleAddActivity} className="add-activity-form">

        <input
          type="text"
          placeholder="Enter Activity Name"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
        />

        <button type="submit">Add Activity</button>

      </form>

      {/* Activity List */}

      <div className="activity-list">

        <h3>Previous Activities</h3>

        {activities.length === 0 ? (
          <p>No Activities Added</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-card">

              <span>{activity.name}</span>

              <button
                className="delete-btn"
                onClick={() => {
                  setSelectedActivityId(activity.id)
                  setShowDeleteModal(true)
                }}
              >
                Delete
              </button>

            </div>
          ))
        )}

      </div>

      {showDeleteModal && (
        <div className="modal-overlay">

          <div className="modal-box">

            <h3>Delete Activity</h3>

            <p>Are you sure you want to delete this activity?</p>

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={deleteActivity}
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

export default AddActivity