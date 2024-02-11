import React, { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext" // Adjust the path according to your project structure

interface ProtectedRouteProps {
  children: JSX.Element
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!currentUser) {
      console.log(location)
      // Redirect unauthenticated users to the login page, preserving the originally targeted URL
      navigate("/login", { state: { from: location } })
    }
  }, [currentUser, navigate, location])

  return currentUser ? children : null // Render children if the user is authenticated, otherwise render nothing
}

export default ProtectedRoute
