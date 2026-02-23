import { useNavigate } from "react-router-dom"
import { AiFillHome } from "react-icons/ai"
import { MdMenuBook } from "react-icons/md"
import { HiChartBar } from "react-icons/hi"
import { FaUser } from "react-icons/fa"
import { useEffect, useState } from "react"

import { supabase } from "../../../services/supabase"
import OnboardingModal from "./OnboardingModal"

import "./UserDashboard.css"

function UserDashboard() {
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user) {
        setLoading(false)
        return
      }

      // ✅ SHOW onboarding ONLY if flag is NOT true
      if (user.user_metadata?.onboarding_completed !== true) {
        setShowOnboarding(true)
      }

      setLoading(false)
    }

    checkOnboarding()
  }, [])

  // ⛔ Prevent UI render until decision is made
  if (loading) return null


  return (
    <div className="user-app">


      {/* 🔥 ONBOARDING POPUP */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => setShowOnboarding(false)}
        />
      )}


      {/* QUICK STATS */}
      <section className="stats">
        <div className="stat-card">
          <p>Courses</p>
          <h3>2</h3>
        </div>
        <div className="stat-card">
          <p>Batch</p>
          <h3>FS-01</h3>
        </div>
        <div className="stat-card">
          <p>Trainer</p>
          <h3>Suresh</h3>
        </div>
        <div className="stat-card success">
          <p>Fees</p>
          <h3>Paid</h3>
        </div>
      </section>

      {/* MY COURSES */}
      <section className="section">
        <h4>📚 My Courses</h4>

        <div className="course-card active">
          <div className="course-top">
            <h5>Full Stack Development</h5>
            <span className="badge active">Active</span>
          </div>

          <p>Batch: FS-01</p>
          <p>Time: 9:00 AM – 11:00 AM</p>


          <div className="progress">
            <div className="progress-bar" style={{ width: "65%" }} />
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/user/course/karate")}
          >
            Continue Learning
          </button>

        </div>
        {/* ADD NEW COURSE */}
        <div
          className="course-card add-new"
          onClick={() => setShowOnboarding(true)}
        >
          <h5>➕ Add New Course</h5>
          <p>Enroll in another program</p>
        </div>
      </section>

      {/* UPCOMING */}
      <section className="section">
        <h4>⏰ Upcoming Classes</h4>
        <div className="list-card live">🔴 Today · Full Stack · 9:00 AM</div>
        <div className="list-card">📅 Tomorrow · Data Analytics · 11:00 AM</div>
      </section>

      {/* ANNOUNCEMENTS */}
      <section className="section">
        <h4>📢 Announcements</h4>
        <div className="announcement">
          🎉 New React Workshop this Saturday at 10 AM
        </div>
      </section>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <div className="nav-item" onClick={() => navigate("/user")}>
          <AiFillHome />
          <span>Home</span>
        </div>

        <div className="nav-item" onClick={() => navigate("/user/course/karate")}>
          <MdMenuBook />
          <span>Courses</span>
        </div>


        <div className="nav-item" onClick={() => navigate("/user/progress")}>
          <HiChartBar />
          <span>Progress</span>
        </div>

        <div className="nav-item" onClick={() => navigate("/user/profile")}>
          <FaUser />
          <span>Profile</span>
        </div>
      </nav>

    </div>
  )
}

export default UserDashboard
