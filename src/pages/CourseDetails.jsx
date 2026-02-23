import { useParams, useNavigate } from "react-router-dom"
import "./CourseDetails.css"

function CourseDetails() {
    const { courseName } = useParams()
    const navigate = useNavigate()

    const batches = [
        { id: 1, name: "Morning 6–7 AM", students: 22 },
        { id: 2, name: "Evening 5–6 PM", students: 18 }
    ]

    return (
        <div className="course-layout">
            <header className="course-header">
                <button onClick={() => navigate("/home")}>← Back</button>
                <h1>{courseName} Course</h1>
            </header>

            {/* ACTIONS */}
            <div className="action-grid">
                <button
                    className="action-card"
                    onClick={() => navigate(`/course/${courseName}/add-student`)}
                >
                    ➕ Add New Student
                </button>

                <button className="action-card">➕ Add New Batch</button>
            </div>

            {/* EXISTING BATCHES */}
            <h2 className="section-title">Existing Batches</h2>

            <div className="batch-grid">
                {batches.map(batch => (
                    <div key={batch.id} className="batch-card">
                        <h3>{batch.name}</h3>
                        <p>Students: {batch.students}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CourseDetails
