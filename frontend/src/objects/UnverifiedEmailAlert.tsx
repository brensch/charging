import React, { useState, useEffect } from "react"
import {
  Alert,
  AlertTitle,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { sendEmailVerification } from "firebase/auth"
import { useAuth } from "../contexts/AuthContext"
import { FirebaseError } from "firebase/app"

const RESEND_INTERVAL = 120 // 2 minutes in seconds

const UnverifiedEmailAlert: React.FC = () => {
  const { currentUser } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState<string>("")
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [countdown, setCountdown] = useState<number>(0)

  useEffect(() => {
    // Check if there's a saved timestamp in localStorage
    const lastSentTimestamp = localStorage.getItem("lastSentTimestamp")
    if (lastSentTimestamp) {
      const elapsed = Math.floor(
        (Date.now() - parseInt(lastSentTimestamp)) / 1000,
      )
      const remaining = RESEND_INTERVAL - elapsed
      if (remaining > 0) {
        setCountdown(remaining)
        setIsButtonDisabled(true)
      }
    }
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1)
      }, 1000)
    } else if (countdown === 0 && isButtonDisabled) {
      setIsButtonDisabled(false)
    }

    return () => clearInterval(timer)
  }, [countdown, isButtonDisabled])

  const handleResendVerificationEmail = () => {
    if (currentUser) {
      sendEmailVerification(currentUser)
        .then(() => {
          setDialogMessage("Verification email sent. Please check your inbox.")
          setIsDialogOpen(true)
          setIsButtonDisabled(true)
          setCountdown(RESEND_INTERVAL) // Set countdown to 2 minutes
          localStorage.setItem("lastSentTimestamp", Date.now().toString()) // Save the current timestamp
        })
        .catch((error) => {
          let message = "Failed to send verification email."
          if (error instanceof FirebaseError) {
            message = error.message.replace("Firebase:", "")
          } else if (error instanceof Error) {
            message = error.message
          }
          setDialogMessage(message)
          setIsDialogOpen(true)
        })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  if (!currentUser || currentUser.emailVerified) {
    return null // Do not render anything if the user is verified or not logged in
  }

  return (
    <>
      <Alert severity="warning" sx={{ textAlign: "left", mt: 1 }}>
        <AlertTitle>Unverified email</AlertTitle>
        <Typography>
          You can't top up your credit until your email is verified.
        </Typography>
        {isButtonDisabled ? (
          <Typography sx={{ mt: 2 }}>
            Verification email sent. You can resend in {countdown} seconds.
          </Typography>
        ) : (
          <Button
            variant="outlined"
            onClick={handleResendVerificationEmail}
            sx={{ mt: 2 }}
          >
            Send Verification Email
          </Button>
        )}
      </Alert>

      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant="outlined" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default UnverifiedEmailAlert
