import React, { useContext } from "react"
import { Box, Divider, Typography } from "@mui/material"
import { CustomerContext } from "../contexts/CustomerContext"

const SessionsPage = () => {
  const {
    customerBalance,
    stripeCustomer,
    autoTopupPreferences,
    transactions,
  } = useContext(CustomerContext)

  return (
    <div style={{ padding: 20 }}>
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
        <Divider sx={{ my: 4 }} />
      </Box>
      {/* Additional content and components go here */}
    </div>
  )
}

export default SessionsPage
