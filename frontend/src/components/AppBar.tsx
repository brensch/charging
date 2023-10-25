import {
  Box,
  Flex,
  Button,
  Container,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  MenuDivider,
} from "@chakra-ui/react"
import React from "react"
import { useLocation, useNavigate } from "react-router-dom" // Assuming you are using react-router
import routes from "../routes"
import { ChevronDownIcon } from "@chakra-ui/icons"
import { auth } from "../firebase"
import { signOut } from "firebase/auth"

interface AppBarProps {}

function getRootParentPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  return segments[0] || ""
}

const AppBar: React.FC<AppBarProps> = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Extract current root parent path
  const currentRoot = getRootParentPath(location.pathname)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/") // Optional: Redirect to home or login page after logging out
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderBottomColor="black"
      width="100%"
    >
      <Container maxW="4xl">
        <Flex
          paddingTop={2}
          paddingBottom={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Text fontSize="2xl">Charging</Text>
          <Text fontSize="m" onClick={handleLogout}>
            {auth.currentUser?.displayName}
          </Text>

          <Menu>
            <MenuButton as={Button} size="sm" variant="outline">
              {currentRoot || "home"}
            </MenuButton>
            <MenuList>
              {routes.map((route) => (
                <MenuItem
                  key={route.path}
                  onClick={() => {
                    navigate(route.path)
                  }}
                >
                  {route.path || "home"}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>
      </Container>
    </Box>
  )
}

export default AppBar
