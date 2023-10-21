import { useState } from "react"
import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"
import "./App.css"
import {
  ChakraProvider,
  Box,
  LinkBox,
  LinkOverlay,
  Image,
  Heading,
  Button,
  Text,
  Code,
  VStack,
} from "@chakra-ui/react"
function App() {
  const [count, setCount] = useState(0)

  return (
    <ChakraProvider>
      <VStack spacing={6} align="center">
        <Heading size="xl">Alyssa is cool</Heading>

        <Button
          colorScheme="blue"
          onClick={() => setCount((count) => count + 1)}
        >
          booped {count} times
        </Button>
        <Text mt={4}>Cool as</Text>
      </VStack>
    </ChakraProvider>
  )
}

export default App
