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
  Input,
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
      <Container maxW="4xl" paddingTop={"1.5rem"} paddingBottom={"1.5rem"}>
        <Flex
          as="form"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          onSubmit={(e) => {
            e.preventDefault()
            // You can handle the form submission logic here.
          }}
        >
          <Heading marginRight="2rem">Charging</Heading>
          <Input
            placeholder="Plug ID"
            size="lg"
            height="55px"
            variant="outline"
            borderColor="black"
            width="200px" // Corrected width to 100 pixels
          />
        </Flex>
      </Container>
    </Box>
  )
}

export default AppBar

{
  /* <Text fontSize="m" onClick={handleLogout}>
            {auth.currentUser?.displayName}
          </Text> */
}

{
  /* <Menu>
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
          </Menu> */
}
