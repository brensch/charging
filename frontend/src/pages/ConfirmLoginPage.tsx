import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import { auth } from "../firebase" // Adjust the path according to your project structure

const ConfirmLoginInPage: React.FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setError("Invalid sign-in link or it has expired.")
      return
    }

    let email = window.localStorage.getItem("emailForSignIn")
    if (!email) {
      email = window.prompt("Please provide your email for confirmation")
    }

    if (email) {
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn")
          navigate("/") // Navigate to the homepage or dashboard after successful sign-in
        })
        .catch((error) => {
          console.error(error)
          setError(
            "Failed to sign in. Please try the link again or request a new one.",
          )
        })
    }
  }, [navigate])

  return <div>{error ? <p>{error}</p> : <p>Confirming your sign-in...</p>}</div>
}

export default ConfirmLoginInPage
