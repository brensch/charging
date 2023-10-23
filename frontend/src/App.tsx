import { useState } from "react"
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
  CSSReset,
  Container,
} from "@chakra-ui/react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom"
import routes from "./routes"
import AppBar from "./components/AppBar"

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
