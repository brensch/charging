import React, { useState, useEffect } from "react"
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { FirebaseError } from "firebase/app"
import { auth } from "../firebase"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Divider from "@mui/material/Divider"
import { useLocation, useNavigate } from "react-router-dom"
import GoogleIcon from "@mui/icons-material/Google"
import AppleIcon from "@mui/icons-material/Apple"

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const location = useLocation()
  const from = location.state?.from || "/"
  const [isAppleDevice, setIsAppleDevice] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod|macintosh/.test(userAgent)) {
      setIsAppleDevice(true)
    }
  }, [])

  const handleSignIn = async (provider: any) => {
    setError(null)
    try {
      await signInWithPopup(auth, provider)
      navigate(from)
    } catch (error: unknown) {
      console.log(error)
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

  const handleEmailSignIn = async () => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
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

  const handleSignUp = () => {
    navigate("/signup")
  }

  const handleForgotPassword = () => {
    navigate("/forgot-password")
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 0 }}>
        <Stack spacing={2} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Login
          </Typography>
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
          <Button
            variant="outlined"
            onClick={handleEmailSignIn}
            style={{
              boxShadow: "4px 4px 0px rgba(0, 0, 0, 1)",
            }}
          >
            Sign in with Email
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleSignIn(new GoogleAuthProvider())}
            startIcon={<GoogleIcon />}
            style={{
              boxShadow: "4px 4px 0px rgba(0, 0, 0, 1)",
            }}
          >
            Sign in with Google
          </Button>
          {isAppleDevice && (
            <Button
              variant="outlined"
              startIcon={<AppleIcon />}
              style={{
                boxShadow: "4px 4px 0px rgba(0, 0, 0, 1)",
                width: "auto", // Adjust the width as needed
                alignSelf: "center", // Center align the button
              }}
              disabled
            >
              Coming Soon
            </Button>
          )}
          {error && <Typography color="error">{error}</Typography>}
        </Stack>
        <Divider
          sx={{
            borderColor: "black",
            borderWidth: "1px",
            width: "100%",
          }}
        />
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ p: 4 }}
        >
          <Button
            variant="outlined"
            onClick={handleSignUp}
            style={{
              boxShadow: "4px 4px 0px rgba(0, 0, 0, 1)",
              width: "auto", // Adjust the width as needed
            }}
          >
            Sign Up
          </Button>
          <Button
            variant="outlined"
            onClick={handleForgotPassword}
            style={{
              boxShadow: "4px 4px 0px rgba(0, 0, 0, 1)",
              width: "auto", // Adjust the width as needed
            }}
          >
            Forgot Password
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default LoginPage
