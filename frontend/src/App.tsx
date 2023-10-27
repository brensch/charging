import {
  Box,
  CSSReset,
  ChakraProvider,
  Container,
  Heading,
  Text,
} from "@chakra-ui/react"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import AppBar from "./components/AppBar"
import routes from "./routes"
import { auth } from "./firebase"
import { useEffect, useState } from "react"
import { User } from "@firebase/auth"
import SignIn from "./components/SignIn"
import Fonts from "./Fonts"
import theme from "./Theme"

function RenderRoute(route: any) {
  if (!route.children) {
    return (
      <Route key={route.path} path={route.path} element={<route.component />} />
    )
  }

  return (
    <Route key={route.path} path={route.path} element={<route.component />}>
      {route.children.map(RenderRoute)}
    </Route>
  )
}

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  console.log(auth.currentUser)

  useEffect(() => {
    // This will keep track of authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe() // Cleanup on unmount
  }, [])

  if (user === undefined) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <SignIn />
  }
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Fonts />
      <Box w="100vw">
        <Router>
          <AppBar />
          <Container maxW="4xl" p={4}>
            <Routes>{routes.map(RenderRoute)}</Routes>
          </Container>
        </Router>
        <Heading>The spectacle before us was indeed sublime.</Heading>
        <Text>
          Apparently we had reached a great height in the atmosphere, for the
          sky was a dead black, and the stars had ceased to twinkle. By the same
          illusion which lifts the horizon of the sea to the level of the
          spectator on a hillside, the sable cloud beneath was dished out, and
          the car seemed to float in the middle of an immense dark sphere, whose
          upper half was strewn with silver. Looking down into the dark gulf
          below, I could see a ruddy light streaming through a rift in the
          clouds.
        </Text>
      </Box>
    </ChakraProvider>
  )
}

export default App
