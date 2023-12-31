import React, { useContext, useState } from "react"
import { Outlet } from "react-router-dom"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
} from "@chakra-ui/react"
import SiteCard from "./SiteCard"
import { auth } from "../firebase"
import { CustomerContext } from "../contexts/CustomerContext"

function Page() {
  // const [topUpAmount, setTopUpAmount] = useState("")
  const [autoTopUpTrigger, setAutoTopUpTrigger] = useState("")
  const [autoTopUpAmount, setAutoTopUpAmount] = useState("")

  const { customerBalance, stripeCustomer } = useContext(CustomerContext)

  const handleTopUpSubmit = () => {
    const url = `http://localhost:4242/topup/${auth.currentUser?.uid}`
    window.open(url, "_blank")
  }

  const handleAutoTopUpConfirm = () => {
    const url = `http://localhost:4242/enrol/${auth.currentUser?.uid}`
    window.open(url, "_blank")
  }

  console.log(stripeCustomer)

  return (
    <Container maxW="4xl" p={4}>
      {customerBalance && (
        <Text fontSize="lg">
          Total Credit: ${customerBalance?.amount_aud / 100}
        </Text>
      )}
      {stripeCustomer?.payment_methods.length === 0 ? (
        <Button
          colorScheme="orange"
          onClick={() => {
            const url = `http://localhost:4242/manage/${auth.currentUser?.uid}`
            window.open(url)
          }}
        >
          Add payment method
        </Button>
      ) : (
        <Button
          colorScheme="orange"
          onClick={() => {
            const url = `http://localhost:4242/manage/${auth.currentUser?.uid}`
            window.open(url)
          }}
        >
          Manage payment methods
        </Button>
      )}
      <VStack spacing={4}>
        <Text fontSize="md" mt={4}>
          Once off top-up:
        </Text>
        <HStack>
          {/* <NumberInput
            min={0}
            value={topUpAmount}
            onChange={setTopUpAmount}
            precision={2}
          >
            <NumberInputField placeholder="Enter top-up amount" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput> */}
          <Button colorScheme="green" onClick={handleTopUpSubmit}>
            Top Up
          </Button>
        </HStack>
        <Text fontSize="md" mt={4}>
          Auto Top-Up Settings:
        </Text>
        <HStack>
          <NumberInput
            min={0}
            value={autoTopUpTrigger}
            onChange={setAutoTopUpTrigger}
            precision={2}
          >
            <NumberInputField placeholder="When I'm below" />
          </NumberInput>
          <Text>$</Text>
        </HStack>
        <HStack>
          <NumberInput
            min={0}
            value={autoTopUpAmount}
            onChange={setAutoTopUpAmount}
            precision={2}
          >
            <NumberInputField placeholder="Top up with" />
          </NumberInput>
          <Text>$</Text>
        </HStack>
        <Button colorScheme="orange" onClick={handleAutoTopUpConfirm}>
          Confirm Auto Top-Up
        </Button>
        <Box w="full">
          <Text fontSize="lg" mb={2}>
            Previous Transactions:
          </Text>
          {/* {transactions.map((transaction) => (
            <HStack key={transaction.id} justify="space-between">
              <Text>{transaction.description}</Text>
              <Text>
                {transaction.amount > 0
                  ? `+$${transaction.amount}`
                  : `-$${Math.abs(transaction.amount)}`}
              </Text>
            </HStack>
          ))} */}
          <Divider my={4} />
        </Box>
      </VStack>
      <Outlet />
    </Container>
  )
}

export default Page
