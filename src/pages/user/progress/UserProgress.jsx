import { useNavigate } from "react-router-dom"
import "./UserProgress.css"

function UserProgress() {
  const navigate = useNavigate()

  const progressData = [
    {
      course: "Karate",
      totalClasses: 60,
      attended: 48,
    },
    {
      course: "Dance",
      totalClasses: 40,
      attended: 30,
    }
  ]

  return (
    <div className="progress-page">
      <h2>📊 My Progress</h2>

      {progressData.map((item, index) => {
        const percentage = Math.round(
          (item.attended / item.totalClasses) * 100
        )

        return (
          <div className="progress-card" key={index}>
            <h4>{item.course}</h4>

            <p>
              Attendance: {item.attended}/{item.totalClasses}
            </p>

            <div className="progress-bar-wrapper">
              <div
                className="progress-bar-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="percentage">{percentage}% Attendance</p>

            <span
              className={`status ${
                percentage >= 75
                  ? "good"
                  : percentage >= 50
                  ? "average"
                  : "poor"
              }`}
            >
              {percentage >= 75
                ? "Good Performance"
                : percentage >= 50
                ? "Average Performance"
                : "Poor Attendance"}
            </span>
          </div>
        )
      })}

      {/* 🔙 BACK BUTTON */}
      <div className="progress-actions">
        <button
          className="back-btn"
          onClick={() => navigate("/user")}
        >
          ⬅ Back to Home
        </button>
      </div>
    </div>
  )
}

export default UserProgress
