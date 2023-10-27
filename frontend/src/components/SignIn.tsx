import React from "react"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "../firebase"
import { Button, useColorModeValue, Flex } from "@chakra-ui/react"

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()

    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Error signing in with Google: ", error)
    }
  }

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Button
        onClick={signInWithGoogle}
        backgroundColor="white"
        border="1px solid black"
        size={"lg"}
        boxShadow={useColorModeValue("4px 4px 0 black", "4px 4px 0 cyan")}
        _hover={{
          boxShadow: useColorModeValue("6px 6px 0 black", "6px 6px 0 cyan"),
        }}
        borderRadius="md" // Makes the button more rounded
        transition="box-shadow 0.2s ease-in-out" // Smooth transition for boxShadow
      >
        Sign in with Google
      </Button>
    </Flex>
  )
}

export default SignIn
