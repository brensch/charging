import {
  Box,
  CSSReset,
  Center,
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
import { CustomProvider } from "firebase/app-check"
import { CustomerProvider } from "./contexts/CustomerContext"

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

  if (user === null) {
    return (
      <ChakraProvider theme={theme}>
        <CSSReset />
        <Fonts />
        <SignIn />
      </ChakraProvider>
    )
  }

  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Fonts />
      <CustomerProvider>
        <Box w="100vw" minHeight="100vh" m="0" p="0">
          {user === undefined ? (
            <Center>Loading...</Center>
          ) : (
            <Router>
              <Box
                as="header"
                position="sticky"
                top="0"
                zIndex="1000"
                bg="white"
              >
                <AppBar />
              </Box>
              <Routes>{routes.map(RenderRoute)}</Routes>
            </Router>
          )}
        </Box>
      </CustomerProvider>
    </ChakraProvider>
  )
}

export default App
