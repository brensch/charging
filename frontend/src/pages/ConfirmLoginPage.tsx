import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "../firebase" // Adjust the path according to your project structure
import CircularProgress from "@mui/material/CircularProgress"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const ConfirmLoginInPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if the user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/") // User is signed in, navigate to home
      } else {
        // No user is signed in, proceed with email link sign in flow
        if (isSignInWithEmailLink(auth, window.location.href)) {
          let storedEmail = window.localStorage.getItem("emailForSignIn")
          if (!storedEmail) {
            setLoading(false) // Show the form to input email manually
          } else {
            signInWithEmailStoredEmail(storedEmail)
          }
        } else {
          setError("Invalid sign-in link or it has expired.")
          setLoading(false)
        }
      }
    })

    return () => unsubscribe() // Cleanup subscription
  }, [navigate])

  const signInWithEmailStoredEmail = async (storedEmail: string) => {
    try {
      await signInWithEmailLink(auth, storedEmail, window.location.href)
      // window.localStorage.removeItem("emailForSignIn")
      navigate("/") // Navigate to the homepage after successful sign-in
    } catch (error) {
      console.error(error)
      setError("Failed to sign in. Please request a new link.")
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailLink(auth, email, window.location.href)
      // window.localStorage.removeItem("emailForSignIn")
      navigate("/")
    } catch (error) {
      console.error(error)
      setError("Failed to sign in. Please request a new link.")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      gap={2}
    >
      {error ? (
        <React.Fragment>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" onClick={() => navigate("/login")}>
            Try again
          </Button>
        </React.Fragment>
      ) : (
        <Box
          component="form"
          width="100%"
          maxWidth={360}
          onSubmit={handleSubmit}
          gap={2}
          display="flex"
          flexDirection="column"
        >
          <TextField
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Confirm Email
          </Button>
          <Typography variant="body2">
            Next time, load the link in the same browser you tried to log in
            with to avoid having to confirm your email.
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default ConfirmLoginInPage
