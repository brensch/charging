// src/ProtectedRoute.tsx
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"

interface ProtectedRouteProps {
  children: JSX.Element
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate("/login")
    }
  }, [currentUser])

  return children
}

export default ProtectedRoute
