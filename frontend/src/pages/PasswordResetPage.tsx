import React, { useState } from "react"
import { confirmPasswordReset } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import { auth } from "../firebase" // Adjust the path according to your project structure
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import { useNavigate, useLocation } from "react-router-dom"

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const handleResetPassword = async () => {
    setError(null)
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    const query = new URLSearchParams(location.search)
    const oobCode = query.get("oobCode")

    if (!oobCode) {
      setError("Invalid or missing token.")
      return
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword)
      navigate("/login")
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        setError(error.message)
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
          Reset Password
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
            variant="contained"
            onClick={handleResetPassword}
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

export default PasswordResetPage
