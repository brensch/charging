import React, { useState } from "react"
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

function Page() {
  const [topUpAmount, setTopUpAmount] = useState("")
  const [autoTopUpTrigger, setAutoTopUpTrigger] = useState("")
  const [autoTopUpAmount, setAutoTopUpAmount] = useState("")

  // Dummy transaction data
  const transactions = [
    { id: 1, description: "Top-up", amount: 50 },
    { id: 2, description: "Purchase", amount: -20 },
    { id: 3, description: "Top-up", amount: 30 },
  ]

  // Calculate total credit from transactions
  const totalCredit = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0,
  )

  const handleTopUpSubmit = () => {
    console.log(`Top up by: $${topUpAmount}`)
    // Implement the top up functionality here
  }

  const handleAutoTopUpConfirm = () => {
    console.log(
      `Auto top up when below: $${autoTopUpTrigger}, top up with: $${autoTopUpAmount}`,
    )
    // Implement the auto top up functionality here
  }

  return (
    <Container maxW="4xl" p={4}>
      <Text fontSize="lg">Total Credit: ${totalCredit.toFixed(2)}</Text>
      <VStack spacing={4}>
        <Text fontSize="md" mt={4}>
          Once off top-up:
        </Text>
        <HStack>
          <NumberInput
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
          </NumberInput>
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
          {transactions.map((transaction) => (
            <HStack key={transaction.id} justify="space-between">
              <Text>{transaction.description}</Text>
              <Text>
                {transaction.amount > 0
                  ? `+$${transaction.amount}`
                  : `-$${Math.abs(transaction.amount)}`}
              </Text>
            </HStack>
          ))}
          <Divider my={4} />
        </Box>
      </VStack>
      <Outlet />
    </Container>
  )
}

export default Page
