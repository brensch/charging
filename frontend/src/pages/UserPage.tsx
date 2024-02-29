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
    <Container>
      <Typography variant="body1">
        We're going to let you set preferences here soon.
      </Typography>
    </Container>
  )
}

export default UserPage
