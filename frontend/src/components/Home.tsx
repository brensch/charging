import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  SimpleGrid,
  Text,
} from "@chakra-ui/react"
import React from "react"
import { Outlet, useNavigate } from "react-router-dom"
import SiteCard from "./SiteCard"
import SiteCardGrid from "./SiteCardGrid"

function Page() {
  let navigate = useNavigate()
  return (
    <>
      <Container maxW="4xl" p={4}>
        <Text fontSize="3xl">Charge your car off peak for less.</Text>
        <Outlet />
      </Container>
      <Box borderBottom="1px solid" borderColor="black" />
      <Container maxW="4xl" p={4}>
        <Text fontSize="xl" align={"right"}>
          Here's some places that have signed up.
        </Text>
        <Flex justifyContent="flex-end" marginTop={3} marginBottom={5}>
          <Button
            bg="black"
            color="white"
            onClick={() => navigate("/plug/sVJGAe3z")}
          >
            Sign me up too
          </Button>
        </Flex>

        <Grid templateColumns={["repeat(1, 1fr)", "repeat(3, 1fr)"]}>
          <SiteCard />
          <SiteCard />
          {/* <SiteCardGrid /> */}
        </Grid>
      </Container>
    </>
  )
}

export default Page
