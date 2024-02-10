import React, { useContext, useEffect, useState } from "react"
import {
  Box,
  Button,
  Container,
  Divider,
  FormControlLabel,
  Grid,
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {customerBalance && (
            <Typography variant="h4">
              Credit: ${customerBalance?.cents_aud / 100}
            </Typography>
          )}
        </Grid>

        <Grid item xs={6}>
          <Button variant="outlined" onClick={handleTopUpSubmit} fullWidth>
            Manual Top Up
          </Button>
        </Grid>

        <Grid item xs={6}>
          {stripeCustomer && stripeCustomer.payment_methods.length > 0 ? (
            <Button
              variant="outlined"
              onClick={() =>
                window.open(`${PaymentsAPI}/manage/${auth.currentUser?.uid}`)
              }
              fullWidth
            >
              Manage payment methods
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() =>
                window.open(`${PaymentsAPI}/manage/${auth.currentUser?.uid}`)
              }
              fullWidth
            >
              Add payment method
            </Button>
          )}
        </Grid>

        {stripeCustomer && stripeCustomer.payment_methods.length === 0 && (
          <Grid item xs={12}>
            <Typography>
              No payment methods connected to your account.
              <br />
              <br />
              Add one to use auto topup.
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          {stripeCustomer?.payment_methods.length !== 0 && (
            <FormControlLabel
              control={
                <Switch
                  checked={isAutoTopUpEnabled}
                  onChange={handleToggleAutoTopUp}
                />
              }
              label="Enable Auto Top-Up"
            />
          )}
        </Grid>

        {stripeCustomer?.payment_methods.length !== 0 &&
          autoTopupPreferences &&
          autoTopupPreferences.enabled && (
            <React.Fragment>
              <Grid item xs={12}>
                <Typography variant="h6">Auto Top-Up Settings:</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="New threshold"
                  type="number"
                  variant="outlined"
                  value={autoTopUpTrigger}
                  onChange={(e) => setAutoTopUpTrigger(e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="New recharge amount"
                  type="number"
                  variant="outlined"
                  value={autoTopUpAmount}
                  onChange={(e) => setAutoTopUpAmount(e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  disabled={autoTopUpTrigger === "" || autoTopUpAmount === ""}
                  onClick={handleAutoTopUpConfirm}
                  fullWidth
                >
                  Update Auto Top-Up
                </Button>
              </Grid>
            </React.Fragment>
          )}
      </Grid>
    </Container>
  )
}

export default MoneyPage
