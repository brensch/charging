import React from "react"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "../firebase" // Import the auth object

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()

    try {
      await signInWithPopup(auth, provider) // Use the imported auth object
    } catch (error) {
      console.error("Error signing in with Google: ", error)
    }
  }

  return <button onClick={signInWithGoogle}>Sign in with Google</button>
}

export default SignIn
