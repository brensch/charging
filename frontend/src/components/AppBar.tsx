import React, { useState, useEffect } from "react"
import { Box, Flex, Container, Heading, Input } from "@chakra-ui/react"
import { useNavigate, useParams } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"

interface AppBarProps {}

const AppBar: React.FC<AppBarProps> = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [inputValue, setInputValue] = useState(id || "")

  useEffect(() => {
    if (id) {
      setInputValue(id)
    }
  }, [id])

  useEffect(() => {
    // If inputValue length is 5, navigate
    if (inputValue.length >= 5) {
      navigate(`/plug/${inputValue}`)
    }
  }, [inputValue, navigate])

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
          onSubmit={(e) => e.preventDefault()} // Prevent form submission
        >
          <Heading marginRight="2rem" onClick={() => navigate("/")}>
            Charging
          </Heading>
          <Input
            placeholder="Plug ID"
            size="lg"
            height="55px"
            variant="outline"
            borderColor="black"
            width="200px"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            // maxLength={5} // Limit input to 5 characters
          />
        </Flex>
      </Container>
    </Box>
  )
}

export default AppBar
