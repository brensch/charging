import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import React, { useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Link from "@mui/material/Link"
import { useNavigate } from "react-router-dom"

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Container component="main" maxWidth="xs">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Login email sent.
      </Typography>
      <Typography variant="body1" component="h1" gutterBottom sx={{ mb: 4 }}>
        Check your email for a link to sign in
      </Typography>
      <Button variant="outlined" onClick={handleClickOpen}>
        Having trouble?
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"Having trouble?"}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            If you don't receive the email, check your spam folder.
          </Typography>
          <Typography>
            If the email does not contain a link, the link might have been
            removed by your spam filter.{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                navigate("/login") // Update the navigation path as needed
                handleClose() // Close the dialog after navigation
              }}
            >
              Click here
            </Link>{" "}
            and enter your email again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default LoginPage
