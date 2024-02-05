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
      <Typography variant="body1" mt={4}>
        You are a valued customer. Keep it up.
      </Typography>
    </Container>
  )
}

export default UserPage
