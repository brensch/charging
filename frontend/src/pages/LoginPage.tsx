import React, { useState } from "react"
import { sendSignInLinkToEmail } from "firebase/auth"
import { auth } from "../firebase" // Adjust the path according to your project structure
import Typography from "@mui/material/Typography"

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")

  const sendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault()

    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this URL must be in the authorized domains list in the Firebase Console.
      url: `${window.location.origin}/confirm-login`,
      // This must be true for email link sign-in.
      handleCodeInApp: true,
    }

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      // Save the email locally so you don't need to ask the user for it again on the confirmation page
      window.localStorage.setItem("emailForSignIn", email)
      alert("Sign-in link sent! Check your email.")
    } catch (error) {
      console.error(error)
      alert("Error sending email link. Please try again.")
    }
  }

  return (
    <div>
      <Typography variant="h4">Login</Typography>
      <form onSubmit={sendEmailLink}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Send Sign-in Link</button>
      </form>
    </div>
  )
}

export default LoginPage
