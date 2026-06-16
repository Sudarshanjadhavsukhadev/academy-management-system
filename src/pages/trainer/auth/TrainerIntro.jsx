import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const TrainerIntro = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const introSeen = sessionStorage.getItem("trainerIntroSeen")

    if (introSeen === "true") {
      navigate("/trainer-login", { replace: true })
      return
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem("trainerIntroSeen", "true")
      navigate("/trainer-login", { replace: true })
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <video
        autoPlay
        muted
        playsInline
        onEnded={() => {
          sessionStorage.setItem("trainerIntroSeen", "true")
          navigate("/trainer-login", { replace: true })
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <source
          src="https://hawihdxdunxhzdaydgyb.supabase.co/storage/v1/object/public/assets/mjk-intro.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  )
}

export default TrainerIntro