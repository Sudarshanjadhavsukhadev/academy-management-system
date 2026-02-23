import { supabase } from "../../../services/supabase"
import { useEffect, useState } from "react"

import "./Courses.css"

function Courses() {
  const [courses, setCourses] = useState([])
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error(error)
    } else {
      setCourses(data)
    }
  }


  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)

  const [newCourse, setNewCourse] = useState({
    name: "",
    duration: "",
    fees: "",
    trainers: "",
    batches: "",
    status: "Active",
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const deleteCourse = (course) => {
    setCourseToDelete(course)
    setShowDeleteModal(true)
  }






  const deleteSelected = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete selected courses?"
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from("courses")
      .delete()
      .in("id", selected)

    if (error) {
      console.error(error)
    } else {
      setSelected([])
      fetchCourses()
    }
  }

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseToDelete.id)

    if (error) {
      console.error(error)
    } else {
      fetchCourses()
      setShowDeleteModal(false)
      setCourseToDelete(null)
    }
  }


  const addCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .insert([newCourse])

    if (error) {
      console.error(error)
    } else {
      fetchCourses() // refresh list
      setShowModal(false)
      setNewCourse({
        name: "",
        duration: "",
        fees: "",
        trainers: "",
        batches: "",
        status: "Active",
      })
    }
  }


  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="courses-page">
      <div className="admin-container">

        {/* HEADER */}
        <div className="courses-header">
          <h1>Courses</h1>

          <div className="controls">
            <input
              type="text"
              placeholder="Search course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="add-btn" onClick={() => setShowModal(true)}>
              + Add Course
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
          <table className="courses-table">
            <thead>
              <tr>
                <th></th>
                <th>Course Name</th>
                <th>Duration</th>
                <th>Fees</th>
                <th>Trainers</th>
                <th>Batches</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(course.id)}
                      onChange={() => toggleSelect(course.id)}
                    />
                  </td>
                  <td>{course.name}</td>
                  <td>{course.duration}</td>
                  <td>{course.fees}</td>
                  <td>{course.trainers}</td>
                  <td>{course.batches}</td>
                  <td>
                    <span
                      className={`status ${course.status === "Active" ? "active" : "inactive"
                        }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="row-delete"
                      onClick={() => deleteCourse(course)}

                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan="8" className="no-data">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ADD COURSE MODAL */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Add Course</h2>

              <div className="modal-section">
                <h4>Course Details</h4>
                <div className="modal-form">
                  <input
                    placeholder="Course Name"
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, name: e.target.value })
                    }
                  />
                  <input
                    placeholder="Duration (e.g. 6 Months)"
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, duration: e.target.value })
                    }
                  />
                  <input
                    placeholder="Fees"
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, fees: e.target.value })
                    }
                  />
                  <input
                    placeholder="Assigned Trainers"
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, trainers: e.target.value })
                    }
                  />
                  <input
                    placeholder="Batches"
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, batches: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="save" onClick={addCourse}>
                  Save Course
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM MODAL */}
        {showDeleteModal && (
          <div className="delete-overlay">
            <div className="delete-modal">
              <h3>Delete Course</h3>
              <p>
                Are you sure you want to delete{" "}
                <strong>{courseToDelete?.name}</strong>?
              </p>

              <div className="delete-actions">
                <button
                  className="cancel-delete"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setCourseToDelete(null)
                  }}

                >
                  Cancel
                </button>

                <button
                  className="confirm-delete"
                  onClick={confirmDeleteCourse}
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

export default Courses
