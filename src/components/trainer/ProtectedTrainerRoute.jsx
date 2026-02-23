import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../../services/supabase"

function ProtectedTrainerRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const checkTrainer = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (!user) {
        setLoading(false)
        return
      }

      // ✅ CHECK trainers table instead of profiles
      const { data: trainer } = await supabase
        .from("trainers")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (trainer) {
        setAllowed(true)
      }

      setLoading(false)
    }

    checkTrainer()
  }, [])

  if (loading) return null
  if (!allowed) return <Navigate to="/trainer/login" replace />

  return children
}

export default ProtectedTrainerRoute
