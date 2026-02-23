import "./Home.css"
import { useNavigate } from "react-router-dom"

import {
    Chart as ChartJS,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"

ChartJS.register(
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
)

function Home() {
    const navigate = useNavigate()

    const stats = {
        courses: 4,
        batches: 11,
        students: 182,
        pendingFees: 23,
        attendance: 79
    }

    const courses = [
        { name: "Karate", batches: 5, students: 68 },
        { name: "Taekwondo", batches: 3, students: 44 },
        { name: "Kick Boxing", batches: 2, students: 31 },
        { name: "Dance", batches: 1, students: 39 }
    ]

    return (
        <div className="layout">
            {/* HEADER */}
            <header className="top-header">MJK Academy Trainer Dashboard</header>

            <div className="main-area">
                {/* SIDEBAR */}
                <aside className="sidebar">
                    <ul>
                        <li className="active">Overview</li>
                        <li>Courses</li>
                        <li>Batches</li>
                        <li>Students</li>
                        <li>Fees</li>
                        <li>Attendance</li>
                    </ul>
                </aside>

                {/* CONTENT */}
                <main className="content">
                    <h1 className="page-title">Dashboard Overview</h1>

                    {/* QUICK ACTION TABS */}
                    <div className="quick-actions">
                        <button
                            className="quick-btn"
                            onClick={() => navigate("/course/Karate/add-student")}
                        >
                            ➕ Add Student
                        </button>

                        
                    </div>


                    {/* STATS */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>{stats.courses}</h3>
                            <p>Total Courses</p>
                        </div>

                        <div className="stat-card">
                            <h3>{stats.batches}</h3>
                            <p>Total Batches</p>
                        </div>

                        <div className="stat-card">
                            <h3>{stats.students}</h3>
                            <p>Total Students</p>
                        </div>

                        <div className="stat-card alert">
                            <h3>{stats.pendingFees}</h3>
                            <p>Pending Fees</p>
                        </div>
                    </div>

                    {/* ATTENDANCE */}
                    <div className="attendance-card">
                        <h2>Today Attendance</h2>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${stats.attendance}%` }}
                            />
                        </div>
                        <p>{stats.attendance}% Students Present</p>
                    </div>

                    {/* COURSE OVERVIEW */}
                    <h2 className="section-title">Course Overview</h2>

                    <div className="course-grid">
                        {courses.map(course => (
                            <div
                                key={course.name}
                                className="course-card clickable"
                                onClick={() => navigate(`/course/${course.name}`)}
                            >
                                <h3>{course.name}</h3>
                                <p>Batches: {course.batches}</p>
                                <p>Students: {course.students}</p>
                            </div>
                        ))}
                    </div>


                    {/* ANALYTICS */}
                    <h2 className="section-title">Analytics Overview</h2>

                    <div className="graph-grid">
                        {/* STUDENTS PER COURSE */}
                        <div className="graph-card">
                            <h3>Students per Course</h3>
                            <Bar
                                data={{
                                    labels: courses.map(c => c.name),
                                    datasets: [
                                        {
                                            data: courses.map(c => c.students),
                                            backgroundColor: "#2dd4bf"
                                        }
                                    ]
                                }}
                                options={{
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { ticks: { color: "#9fb0b6" } },
                                        y: { ticks: { color: "#9fb0b6" } }
                                    }
                                }}
                            />
                        </div>

                        {/* ATTENDANCE TREND */}
                        <div className="graph-card">
                            <h3>Weekly Attendance Trend</h3>
                            <Line
                                data={{
                                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                                    datasets: [
                                        {
                                            data: [72, 75, 78, 80, 79, 82],
                                            borderColor: "#2dd4bf",
                                            tension: 0.4
                                        }
                                    ]
                                }}
                                options={{
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { ticks: { color: "#9fb0b6" } },
                                        y: { ticks: { color: "#9fb0b6" } }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Home
