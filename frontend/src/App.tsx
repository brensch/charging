import { Box, CSSReset, ChakraProvider, Container } from "@chakra-ui/react"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import AppBar from "./components/AppBar"
import routes from "./routes"
import { auth } from "./firebase"
import { useEffect, useState } from "react"
import { User } from "@firebase/auth"
import SignIn from "./components/SignIn"

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
    <ChakraProvider>
      <CSSReset />
      <Box w="100vw">
        <Router>
          <AppBar />
          <Container maxW="4xl" p={4}>
            <Routes>{routes.map(RenderRoute)}</Routes>
          </Container>
        </Router>
      </Box>
    </ChakraProvider>
  )
}

export default App
