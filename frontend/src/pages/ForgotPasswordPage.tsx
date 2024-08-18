import React, { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { auth } from "../firebase"

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const handleForgotPassword = async () => {
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email)
      navigate("/password-reset-success")
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
          Forgot Password
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleForgotPassword}
            style={{
              boxShadow: "4px 4px 0px rgba(0, 0, 0, 1)", // Example of a bold, stark shadow
            }}
          >
            Reset Password
          </Button>
          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </Paper>
    </Container>
  )
}

export default ForgotPasswordPage
