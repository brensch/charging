import React, { useState, useEffect, useContext } from "react"
import {
  Box,
  Flex,
  Container,
  Heading,
  Input,
  Text,
  Button,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react"
import { useNavigate, useParams } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import { MdPerson, MdPerson2, MdPower } from "react-icons/md"
import { CustomerBalance } from "../contracts/stripe"
import { firestore } from "../firebase"
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { CustomerContext } from "../contexts/CustomerContext"

interface AppBarProps {}

const AppBar: React.FC<AppBarProps> = () => {
  const navigate = useNavigate()

  const { customerBalance, stripeCustomer } = useContext(CustomerContext)

  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderBottomColor="black"
      width="100%"
    >
      <Container maxW="4xl" paddingTop={"1rem"} paddingBottom={"1rem"}>
        <Flex
          as="form"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          onSubmit={(e) => e.preventDefault()}
        >
          <Text fontSize="2xl" fontWeight="bold" onClick={() => navigate("/")}>
            SparkPlugs
          </Text>
          <Flex>
            <Button
              onClick={() => {
                navigate("/account")
              }}
              marginRight="2"
              backgroundColor="white"
              border="1px solid black"
              boxShadow={useColorModeValue("4px 4px 0 black", "4px 4px 0 cyan")}
              _hover={{
                boxShadow: useColorModeValue(
                  "6px 6px 0 black",
                  "6px 6px 0 cyan",
                ),
              }}
              borderRadius="md" // Makes the button more rounded
              transition="box-shadow 0.2s ease-in-out" // Smooth transition for boxShadow
            >
              <Icon as={MdPerson} />
            </Button>
            <Button
              onClick={() => {
                navigate("/plug")
              }}
              backgroundColor="white"
              border="1px solid black"
              boxShadow={useColorModeValue("4px 4px 0 black", "4px 4px 0 cyan")}
              _hover={{
                boxShadow: useColorModeValue(
                  "6px 6px 0 black",
                  "6px 6px 0 cyan",
                ),
              }}
              borderRadius="md" // Makes the button more rounded
              transition="box-shadow 0.2s ease-in-out" // Smooth transition for boxShadow
            >
              <Icon as={MdPower} />
            </Button>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

export default AppBar
