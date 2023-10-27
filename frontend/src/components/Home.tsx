import { Box, Container, Flex, Grid, SimpleGrid, Text } from "@chakra-ui/react"
import React from "react"
import { Outlet } from "react-router-dom"
import SiteCard from "./SiteCard"

function Page() {
  return (
    <>
      <Container maxW="4xl" p={4}>
        <Text fontSize="3xl">Charge your car off peak for less.</Text>
        <Outlet />
      </Container>
      <Box borderBottom="1px solid" borderColor="black" />
      <Container maxW="4xl" p={4}>
        <Grid templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]}>
          <SiteCard />
          <SiteCard />
          <SiteCard />
        </Grid>
      </Container>
    </>
  )
}

export default Page
