import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { doc, updateDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { useCustomer } from "../contexts/CustomerContext"
import { AutoTopupPreferences } from "../contracts/stripe"
import { firestore } from "../firebase"
import { PaymentsAPI } from "../constants/urls"
import { useAuth } from "../contexts/AuthContext"

const MoneyPage = () => {
  const navigate = useNavigate()
  const [autoTopUpTrigger, setAutoTopUpTrigger] = useState("")
  const [autoTopUpAmount, setAutoTopUpAmount] = useState("")
  const [isAutoTopUpEnabled, setIsAutoTopUpEnabled] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState<string>("")
  const { currentUser, verified } = useAuth()

  const {
    customerBalance,
    stripeCustomer,
    autoTopupPreferences,
    transactions,
  } = useCustomer()

  const handleTopUpSubmit = () => {
    const url = `${PaymentsAPI}/topup/${currentUser?.uid}`
    window.open(url, "_blank")
  }

  useEffect(() => {
    if (autoTopupPreferences) {
      setIsAutoTopUpEnabled(autoTopupPreferences.enabled)
    }
  }, [autoTopupPreferences])

  const handleToggleAutoTopUp = () => {
    setIsAutoTopUpEnabled(!isAutoTopUpEnabled)
    const firestoreId = currentUser?.uid
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
    const firestoreId = currentUser?.uid
    if (firestoreId) {
      updateAutoTopupPreferences(firestoreId, {
        threshold_cents: triggerCents,
        recharge_value_cents_aud: amountCents,
      })
      setAutoTopUpAmount("")
      setAutoTopUpTrigger("")
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {customerBalance && (
            <Typography variant="h4" mt={2} mb={2}>
              You've got ${customerBalance?.cents_aud / 100}
            </Typography>
          )}
        </Grid>
        {verified && (
          <>
            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleTopUpSubmit}>
                Manual Topup
              </Button>
            </Grid>
            <Grid item xs={12}>
              {stripeCustomer && stripeCustomer.payment_methods.length > 0 ? (
                <Button
                  variant="outlined"
                  onClick={() =>
                    window.open(`${PaymentsAPI}/manage/${currentUser?.uid}`)
                  }
                >
                  Manage payment methods
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() =>
                    window.open(`${PaymentsAPI}/manage/${currentUser?.uid}`)
                  }
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
              isAutoTopUpEnabled && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12}>
                        <Typography variant="h6">
                          Auto Topup Settings:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>
                          When below: $
                          {autoTopupPreferences?.threshold_cents &&
                            autoTopupPreferences?.threshold_cents / 100}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="New threshold"
                          type="number"
                          variant="outlined"
                          value={autoTopUpTrigger}
                          onChange={(e) => setAutoTopUpTrigger(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>
                          Recharge with: $
                          {autoTopupPreferences?.recharge_value_cents_aud &&
                            autoTopupPreferences?.recharge_value_cents_aud /
                              100}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="New recharge"
                          type="number"
                          variant="outlined"
                          value={autoTopUpAmount}
                          onChange={(e) => setAutoTopUpAmount(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={handleAutoTopUpConfirm}
                          fullWidth
                          disabled={!autoTopUpTrigger || !autoTopUpAmount}
                        >
                          Update Auto Topup
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Topup History</Typography>
                <TableContainer>
                  <Table aria-label="transactions table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount (AUD)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.payment_id}>
                          <TableCell>
                            {new Date(
                              transaction.completed_ms,
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            ${transaction.cents_aud / 100}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  )
}

export default MoneyPage
