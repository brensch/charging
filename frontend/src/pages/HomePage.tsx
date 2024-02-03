import React from "react"
import { Typography, Button } from "@mui/material"
import { signOut } from "firebase/auth"
import { auth } from "../firebase" // Adjust this import path to where your Firebase config and auth are initialized

const HomePage = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth)
      console.log("Logged out successfully")
      // Optionally redirect the user to login page or show a message
    } catch (error) {
      console.error("Error logging out: ", error)
      // Handle errors here, such as showing an error message
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4">Home Page</Typography>
      {/* Additional content and components go here */}
      <Button variant="contained" color="primary" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  )
}

export default HomePage
