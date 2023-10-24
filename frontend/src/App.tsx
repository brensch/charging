import { Box, CSSReset, ChakraProvider, Container } from "@chakra-ui/react"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import AppBar from "./components/AppBar"
import routes from "./routes"

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
