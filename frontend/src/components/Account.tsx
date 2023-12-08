import React from "react"
import { Outlet } from "react-router-dom"
import { Box, Container, Grid, Text, Button } from "@chakra-ui/react"
import SiteCard from "./SiteCard"

function Page() {
  console.log("account page")
  return (
    <Container maxW="4xl" p={4}>
      <Text fontSize="xl" align={"right"}>
        It's all about you.
      </Text>
      <Button colorScheme="blue" mt={4}>
        Click Me
      </Button>
    </Container>
  )
}

export default Page
