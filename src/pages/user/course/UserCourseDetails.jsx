import { useParams, useNavigate } from "react-router-dom"
import "./UserCourseDetails.css"


function UserCourseDetails() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="course-page">




      {/* DIET PLANS */}
      <section className="course-section">
        <h3>🥗 Diet Plan</h3>

        <div className="diet-card">
          <h4>Morning Diet</h4>
          <ul>
            <li>Warm water + honey</li>
            <li>Boiled eggs / sprouts</li>
            <li>Banana or apple</li>
          </ul>
        </div>

        <div className="diet-card">
          <h4>Evening Diet</h4>
          <ul>
            <li>Green tea</li>
            <li>Dry fruits</li>
            <li>Protein shake</li>
          </ul>
        </div>
      </section>

      {/* TECHNICAL SYLLABUS */}
      <section className="course-section">
        <h3>🥋 Karate Technical Syllabus</h3>
        <ul>
          <li>Basic stances (Zenkutsu, Kokutsu)</li>
          <li>Punches & blocks</li>
          <li>Katas (Heian series)</li>
          <li>Kumite techniques</li>
          <li>Self-defense drills</li>
        </ul>
      </section>

      {/* COURSE INFO */}
      <section className="course-section">
        <h3>📋 Course Information</h3>
        <p><b>Trainer:</b> Suresh Sensei</p>
        <p><b>Duration:</b> 6 Months</p>
        <p><b>Batch:</b> FS-01</p>
        <p><b>Level:</b> Beginner → Intermediate</p>
      </section>

      {/* ACTIONS */}
      <div className="course-actions">
        <button
          className="danger-btn"
          onClick={() => navigate("/user")}
        >
          Exit Course
        </button>

      </div>

    </div>
  )
}

export default UserCourseDetails
console.log("");