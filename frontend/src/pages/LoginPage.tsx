import React, { useState } from "react"
import { sendSignInLinkToEmail } from "firebase/auth"
import { auth } from "../firebase" // Adjust the path according to your project structure
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import { useLocation, useNavigate } from "react-router-dom"

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const navigate = useNavigate()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()

  const from = location.state?.from || "/"
  console.log(location)

  console.log(`${from.pathname}${from.search}`)

  const sendEmailLink = async (e: React.FormEvent) => {
    setSending(true)
    setError(null)
    e.preventDefault()

    // Retrieve the originally targeted URL from query parameters or state
    // For example, if you're using React Router and have passed the target URL as a query parameter named 'redirectTo'
    const from = location.state?.from || "/"

    const actionCodeSettings = {
      // Include the originally targeted URL in the 'url' parameter, ensuring it's properly encoded
      url: `${
        window.location.origin
      }/confirm-login?redirectTo=${`${from.pathname}${from.search}`}`,
      handleCodeInApp: true,
    }

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      window.localStorage.setItem("emailForSignIn", email)
      navigate("/loginpending")
    } catch (error) {
      console.error(error)
      setError("Failed to send signin link: " + error)
      setSending(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={sendEmailLink}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <Button
            type="submit"
            fullWidth
            disabled={sending || email === ""}
            variant="outlined"
            sx={{ mt: 3, mb: 2 }}
          >
            Send Sign-in Link
          </Button>
          {error && <Typography>{error}</Typography>}
        </Box>
      </Paper>
    </Container>
  )
}

export default LoginPage
