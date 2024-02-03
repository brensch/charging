import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Button,
  TextField,
  Switch,
  Stack,
  FormControlLabel,
  IconButton,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { auth, firestore } from "../firebase"
import { CustomerContext } from "../contexts/CustomerContext"
import { doc, updateDoc } from "firebase/firestore"
import { PaymentsAPI } from "../constants/urls"
import { AutoTopupPreferences } from "../contracts/stripe"

function TopUpPage() {
  let navigate = useNavigate()
  const [autoTopUpTrigger, setAutoTopUpTrigger] = useState("")
  const [autoTopUpAmount, setAutoTopUpAmount] = useState("")
  const [isAutoTopUpEnabled, setIsAutoTopUpEnabled] = useState(false)

  const { customerBalance, stripeCustomer, autoTopupPreferences } =
    useContext(CustomerContext)

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
    <Container maxWidth="lg" sx={{ p: 4 }}>
      <IconButton onClick={() => navigate("/account")}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h5">Autotopup Settings</Typography>
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
              <Typography variant="subtitle1">Auto Top-Up Settings:</Typography>
              <Typography>
                Threshold: ${autoTopupPreferences.threshold_cents / 100}
              </Typography>
              <Typography>
                Recharge with: $
                {autoTopupPreferences.recharge_value_cents_aud / 100}
              </Typography>

              <Typography variant="subtitle1">
                New Auto Top-Up Settings:
              </Typography>
              <TextField
                label="When I'm below"
                type="number"
                variant="outlined"
                value={autoTopUpTrigger}
                onChange={(e) => setAutoTopUpTrigger(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <TextField
                label="Top up with"
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

export default TopUpPage
