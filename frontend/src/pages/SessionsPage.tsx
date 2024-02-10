import React, { useContext } from "react"
import { Box, Container, Divider, Typography } from "@mui/material"
import { CustomerContext } from "../contexts/CustomerContext"

const SessionsPage = () => {
  const {
    customerBalance,
    stripeCustomer,
    autoTopupPreferences,
    transactions,
  } = useContext(CustomerContext)

  return (
    <Container>
      <Typography variant="h4">Sessions</Typography>
      <Box sx={{ width: "100%" }}>
        <Typography variant="h6" mb={2}>
          Previous Transactions:
        </Typography>
        {transactions.map((transaction) => (
          <Typography key={transaction.payment_id}>
            ${transaction.cents_aud / 100}
          </Typography>
        ))}
      </Box>
    </Container>
  )
}

export default SessionsPage
