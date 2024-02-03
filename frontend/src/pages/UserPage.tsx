import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Stack,
  Typography,
  Button,
  Box,
  Divider,
} from "@mui/material"
import { auth } from "../firebase"
import { CustomerContext } from "../contexts/CustomerContext"
import { PaymentsAPI } from "../constants/urls"

function UserPage() {
  let navigate = useNavigate()

  const {
    customerBalance,
    stripeCustomer,
    autoTopupPreferences,
    transactions,
  } = useContext(CustomerContext)

  const handleTopUpSubmit = () => {
    const url = `${PaymentsAPI}/topup/${auth.currentUser?.uid}`
    window.open(url, "_blank")
  }

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      {customerBalance && (
        <Typography variant="h6">
          Total Credit: ${customerBalance?.cents_aud / 100}
        </Typography>
      )}

      <Stack spacing={4}>
        <Typography variant="body1" mt={4}>
          Manual top-up:
        </Typography>
        <Stack direction="row">
          <Button variant="contained" onClick={handleTopUpSubmit}>
            Top Up
          </Button>
        </Stack>
        <Typography variant="body1" mt={4}>
          Auto Top-Up Settings:
        </Typography>
        {autoTopupPreferences &&
          autoTopupPreferences.enabled &&
          stripeCustomer &&
          stripeCustomer?.payment_methods.length > 0 && (
            <React.Fragment>
              <Typography>
                Threshold: ${autoTopupPreferences?.threshold_cents / 100}
              </Typography>
              <Typography>
                Recharge with: $
                {autoTopupPreferences?.recharge_value_cents_aud / 100}
              </Typography>
            </React.Fragment>
          )}
        {autoTopupPreferences && !autoTopupPreferences.enabled && (
          <Typography>disabled</Typography>
        )}
        {stripeCustomer && stripeCustomer.payment_methods.length === 0 && (
          <Typography>
            No payment methods connected to your account. Add one in settings.
          </Typography>
        )}
        <Button variant="contained" onClick={() => navigate("/autotopup")}>
          Auto Top-Up Settings
        </Button>
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
      </Stack>
    </Container>
  )
}

export default UserPage
