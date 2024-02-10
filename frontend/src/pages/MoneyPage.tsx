import React, { useContext, useEffect, useState } from "react"
import {
  Box,
  Button,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { doc, updateDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { CustomerContext } from "../contexts/CustomerContext"
import { AutoTopupPreferences } from "../contracts/stripe"
import { auth, firestore } from "../firebase"
import { ArrowBackIcon } from "@chakra-ui/icons"
import { PaymentsAPI } from "../constants/urls"

const MoneyPage = () => {
  let navigate = useNavigate()
  const [autoTopUpTrigger, setAutoTopUpTrigger] = useState("")
  const [autoTopUpAmount, setAutoTopUpAmount] = useState("")
  const [isAutoTopUpEnabled, setIsAutoTopUpEnabled] = useState(false)

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

  useEffect(() => {
    if (autoTopupPreferences) {
      setIsAutoTopUpEnabled(autoTopupPreferences.enabled)
    }
  }, [autoTopupPreferences])

  const handleToggleAutoTopUp = () => {
    setIsAutoTopUpEnabled(!isAutoTopUpEnabled)
    const firestoreId = auth.currentUser?.uid
    if (firestoreId) {
      updateAutoTopupPreferences(firestoreId, { enabled: !isAutoTopUpEnabled })
    }
  }

  const updateAutoTopupPreferences = (
    firestoreId: string,
    updatedPreferences: Partial<AutoTopupPreferences>,
  ) => {
    const docRef = doc(firestore, "autotopup_preferences", firestoreId)
    updateDoc(docRef, updatedPreferences)
      .then(() => console.log("Document successfully updated!"))
      .catch((error) => console.error("Error updating document: ", error))
  }

  const handleAutoTopUpConfirm = () => {
    const triggerCents = parseFloat(autoTopUpTrigger) * 100
    const amountCents = parseFloat(autoTopUpAmount) * 100
    const firestoreId = auth.currentUser?.uid
    if (firestoreId) {
      updateAutoTopupPreferences(firestoreId, {
        threshold_cents: triggerCents,
        recharge_value_cents_aud: amountCents,
      })
    }
  }

  return (
    <Container>
      <Typography variant="h4">Money</Typography>

      {customerBalance && (
        <Typography variant="h6">
          Total Credit: ${customerBalance?.cents_aud / 100}
        </Typography>
      )}

      <Stack spacing={4}>
        <Stack direction="row">
          <Button variant="contained" onClick={handleTopUpSubmit}>
            Manual Top Up
          </Button>
        </Stack>

        {stripeCustomer && stripeCustomer.payment_methods.length === 0 && (
          <Typography>
            No payment methods connected to your account. Add one in settings.
          </Typography>
        )}
      </Stack>

      {stripeCustomer?.payment_methods.length === 0 ? (
        <Stack spacing={2} alignItems="center">
          <Button
            variant="contained"
            onClick={() =>
              window.open(`${PaymentsAPI}/manage/${auth.currentUser?.uid}`)
            }
          >
            Add payment method
          </Button>
          <Typography>
            Can only use autotopup once payment method has been added.
          </Typography>
        </Stack>
      ) : (
        <>
          <Button
            variant="contained"
            onClick={() =>
              window.open(`${PaymentsAPI}/manage/${auth.currentUser?.uid}`)
            }
          >
            Manage payment methods
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={isAutoTopUpEnabled}
                onChange={handleToggleAutoTopUp}
              />
            }
            label="Enable Auto Top-Up"
          />
          {autoTopupPreferences && autoTopupPreferences.enabled && (
            <Stack spacing={2}>
              <Typography variant="h6">Auto Top-Up Settings:</Typography>
              <Typography>
                Threshold: ${autoTopupPreferences.threshold_cents / 100}
              </Typography>
              <TextField
                label="New threshold"
                type="number"
                variant="outlined"
                value={autoTopUpTrigger}
                onChange={(e) => setAutoTopUpTrigger(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <Typography>
                Recharge with: $
                {autoTopupPreferences.recharge_value_cents_aud / 100}
              </Typography>
              <TextField
                label="New recharge amount"
                type="number"
                variant="outlined"
                value={autoTopUpAmount}
                onChange={(e) => setAutoTopUpAmount(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <Button
                variant="contained"
                disabled={autoTopUpTrigger === "" || autoTopUpAmount === ""}
                onClick={handleAutoTopUpConfirm}
              >
                Update Auto Top-Up
              </Button>
            </Stack>
          )}
        </>
      )}
    </Container>
  )
}

export default MoneyPage
