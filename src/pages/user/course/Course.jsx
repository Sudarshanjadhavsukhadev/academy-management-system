import "./Courses.css"

function Courses() {
  const courses = [
    {
      id: 1,
      title: "Full Stack Development",
      batch: "FS-01",
      time: "9:00 AM - 11:00 AM",
      status: "Active",
      enrolled: true,
    },
    {
      id: 2,
      title: "Data Analytics",
      enrolled: false,
    },
  ]

  const enrolledCourses = courses.filter(c => c.enrolled)

  return (
    <div className="courses-page">
      <h2>My Courses</h2>

      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <p>You are not enrolled in any course</p>
          <button>Enroll Now</button>
        </div>
      ) : (
        enrolledCourses.map(course => (
          <div className="course-card" key={course.id}>
            <h3>{course.title}</h3>
            <p>Batch: {course.batch}</p>
            <p>Time: {course.time}</p>
            <span className="status">{course.status}</span>

            <button className="continue-btn">
              Continue Learning
            </button>
          </div>
        ))
      )}

      <div className="enroll-more">
        <button>+ Enroll More Courses</button>
      </div>
    </div>
  )
}

export default Courses
