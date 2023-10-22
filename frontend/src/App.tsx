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
} from "@chakra-ui/react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom"
import routes from "./routes"

// function RenderRoutes({ routeConfig }: { routeConfig: any }) {
//   const flatRoutes = flattenRoutes(routeConfig)

//   return (
//     <Routes>
//       {flatRoutes.map((route: any, index: number) => (
//         <Route key={index} path={route.path} element={<route.component />} />
//       ))}
//     </Routes>
//   )
// }

// function flattenRoutes(routeConfig: any[]): any[] {
//   let routes: any[] = []

//   routeConfig.forEach((route) => {
//     // Add the parent route
//     routes.push(route)

//     // If the route has children, add those too
//     if (route.children) {
//       routes = routes.concat(flattenRoutes(route.children))
//     }
//   })

//   return routes
// }

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

function RenderRoutes({ routeConfig }: { routeConfig: any }) {
  return (
    <Routes>
      {routeConfig.map((route: any, index: number) => (
        <Route
          key={index}
          path={route.path}
          element={
            <>
              <route.component />
              {route.children && <RenderRoutes routeConfig={route.children} />}
            </>
          }
        />
      ))}
    </Routes>
  )
}
function App2() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <ChakraProvider>
        <VStack spacing={6} align="center">
          <Heading size="xl">It's chargin time</Heading>

          <Button
            colorScheme="blue"
            onClick={() => setCount((count) => count + 1)}
          >
            booped {count} times
          </Button>

          <Routes>{routes.map(RenderRoute)}</Routes>
        </VStack>
      </ChakraProvider>
    </Router>
  )
}

const Home = () => {
  return (
    <div>
      Home
      <Outlet /> {/* This will render nested routes */}
    </div>
  )
}

const Child = () => {
  return <div>Child</div>
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />}>
          {/* Nested route */}
          <Route index element={<></>} /> {/* Empty for just /home */}
          <Route path="child" element={<Child />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App2
