import { Navigate } from "react-router-dom"

function ProtectedUserRoute({ children }) {
  const isUserLoggedIn = localStorage.getItem("isUserLoggedIn")

  if (!isUserLoggedIn) {
    return <Navigate to="/user/login" replace />
  }

  return children
}

export default ProtectedUserRoute
