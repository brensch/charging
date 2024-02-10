// src/ProtectedRoute.tsx
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"

interface UnprotectedRouteProps {
  children: JSX.Element
}

const UnprotectedRoute: React.FC<UnprotectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      navigate("/home")
    }
  }, [currentUser])

  return children
}

export default UnprotectedRoute
