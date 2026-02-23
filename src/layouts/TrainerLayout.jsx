import { Outlet } from "react-router-dom"
import TrainerHeader from "../components/trainer/TrainerHeader"
import "../styles/TrainerLayout.css"

const TrainerLayout = () => {
  return (
    <div className="trainer-layout">
      <TrainerHeader />

      <main className="trainer-content">
        <Outlet />
      </main>
    </div>
  )
}

export default TrainerLayout
