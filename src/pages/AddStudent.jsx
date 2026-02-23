import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import "./AddStudent.css"

function AddStudent() {
    const navigate = useNavigate()
    const { courseName } = useParams()

    const courseBatchMap = {
        Karate: ["Morning 6–7 AM", "Evening 5–6 PM"],
        Taekwondo: ["Morning 7–8 AM", "Evening 6–7 PM"],
        "Kick Boxing": ["Morning 8–9 AM"],
        Dance: ["Evening 4–5 PM", "Evening 6–7 PM"]
    }

    const [course, setCourse] = useState(courseName || "")
    const [batch, setBatch] = useState("")

    const batches = course ? courseBatchMap[course] || [] : []
    const [skillLevel, setSkillLevel] = useState("")

    return (
        <div className="add-student-layout">
            <header className="add-student-header">
                <button onClick={() => navigate(-1)}>← Back</button>
                <h1>Add New Student</h1>
            </header>

            <form className="student-form">
                
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Enter full name" />
                </div>

                <div className="form-group">
                    <label>Mobile Number</label>
                    <input type="tel" placeholder="Enter mobile number" />
                </div>

                <div className="form-group">
                    <label>Email ID</label>
                    <input type="email" placeholder="Enter email address" />
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <textarea placeholder="Enter full address"></textarea>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Age</label>
                        <input type="number" placeholder="Age" />
                    </div>

                    <div className="form-group">
                        <label>Gender</label>
                        <select>
                            <option>Select</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

{/* COURSE */}
                <div className="form-group">
                    <label>Course</label>
                    <select
                        value={course}
                        onChange={(e) => {
                            setCourse(e.target.value)
                            setBatch("")
                        }}
                    >
                        <option value="">Select Course</option>
                        {Object.keys(courseBatchMap).map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* BATCH */}
                <div className="form-group">
                    <label>Batch</label>
                    <select
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        disabled={!course}
                    >
                        <option value="">Select Batch</option>
                        {batches.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

                {/* SKILL LEVEL */}
                <div className="form-group">
                    <label>Skill Level</label>
                    <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                    >
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>

                    <button type="submit" className="btn primary">
                        Save Student
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddStudent
