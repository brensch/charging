import React from "react"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import { useNavigate } from "react-router-dom"

const PasswordResetSuccessPage: React.FC = () => {
  const navigate = useNavigate()

  const handleBackToLogin = () => {
    navigate("/login")
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Password Reset Email Sent
        </Typography>
        <Typography variant="body1">
          A password reset email has been sent to your email address. Please
          check your inbox and follow the instructions to reset your password.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={handleBackToLogin}
          sx={{ mt: 2 }}
        >
          Back to Login
        </Button>
      </Paper>
    </Container>
  )
}

export default PasswordResetSuccessPage
