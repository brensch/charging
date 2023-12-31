import React, { useContext, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
} from "@chakra-ui/react"
import { auth } from "../firebase"
import { CustomerContext } from "../contexts/CustomerContext"

function Page() {
  let navigate = useNavigate()

  const {
    customerBalance,
    stripeCustomer,
    autoTopupPreferences,
    transactions,
  } = useContext(CustomerContext)

  const handleTopUpSubmit = () => {
    const url = `http://localhost:4242/topup/${auth.currentUser?.uid}`
    window.open(url, "_blank")
  }

  return (
    <Container maxW="4xl" p={4}>
      {customerBalance && (
        <Text fontSize="lg">
          Total Credit: ${customerBalance?.cents_aud / 100}
        </Text>
      )}

      <VStack spacing={4}>
        <Text fontSize="md" mt={4}>
          Manual top-up:
        </Text>
        <HStack>
          <Button onClick={handleTopUpSubmit}>Top Up</Button>
        </HStack>
        <Text fontSize="md" mt={4}>
          Auto Top-Up Settings:
        </Text>
        {autoTopupPreferences &&
          autoTopupPreferences.enabled &&
          stripeCustomer &&
          stripeCustomer?.payment_methods.length > 0 && (
            <React.Fragment>
              <Text>
                Threshold: ${autoTopupPreferences?.threshold_cents / 100}
              </Text>
              <Text>
                Recharge with: $
                {autoTopupPreferences?.recharge_value_cents_aud / 100}
              </Text>
            </React.Fragment>
          )}
        {autoTopupPreferences && !autoTopupPreferences.enabled && (
          <Text>disabled</Text>
        )}
        {stripeCustomer && stripeCustomer.payment_methods.length === 0 && (
          <Text>
            No payment methods connected to your account. Add one in settings.
          </Text>
        )}
        <Button onClick={() => navigate("/autotopup")}>
          Auto Top-Up Settings
        </Button>
        <Box w="full">
          <Text fontSize="lg" mb={2}>
            Previous Transactions:
          </Text>
          {transactions.map((transaction) => (
            <Text key={transaction.payment_id}>
              {transaction.cents_aud / 100}
            </Text>
          ))}
          <Divider my={4} />
        </Box>
      </VStack>
      <Outlet />
    </Container>
  )
}

export default Page
