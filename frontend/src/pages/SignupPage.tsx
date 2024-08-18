import React, { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { FirebaseError } from "firebase/app" // Correct import for FirebaseError
import { auth } from "../firebase" // Adjust the path according to your project structure
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import { useLocation, useNavigate } from "react-router-dom"

const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const location = useLocation()
  const from = location.state?.from || "/"

  const handleSignUp = async () => {
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      navigate(from)
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setError(error.message.replace("Firebase:", ""))
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        console.error("Unknown error type", error)
        setError("An unknown error occurred.")
      }
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sign Up
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            fullWidth
            variant="outlined"
            onClick={handleSignUp}
            style={{
              boxShadow: "4px 4px 0px rgba(0, 0, 0, 1)", // Example of a bold, stark shadow
            }}
          >
            Sign Up
          </Button>
          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </Paper>
    </Container>
  )
}

export default SignupPage
