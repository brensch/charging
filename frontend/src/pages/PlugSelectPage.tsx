import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import {
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material"
import { doc, updateDoc } from "firebase/firestore"
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { CustomerContext, useCustomer } from "../contexts/CustomerContext"
import { firestore } from "../firebase" // Assume you have a Firebase config file
import BarcodeScannerDialog from "../objects/BarcodeScanner"

const PlugSelectPage = () => {
  const navigate = useNavigate()
  const customer = useCustomer()

  const auth = useAuth()

  const { sessions } = useContext(CustomerContext)

  const updatePlug = (id: string) => {
    navigate(`${id}`)
  }

  const [plugID, setPlugID] = useState("")

  const [previousPlugIDs, setPreviousPlugIDs] = useState<string[]>([])

  const handleScannerClose = (scannedUrl?: string) => {
    if (scannedUrl) {
      try {
        const url = new URL(scannedUrl)
        const pathSegments = url.pathname
          .split("/")
          .filter((segment) => segment.length > 0) // Split and filter out empty segments

        // Validate that there are exactly two segments and the first segment is 'plug'
        if (pathSegments.length === 2 && pathSegments[0] === "plug") {
          const plugCode = pathSegments[1] // Extract the plug code
          updatePlug(plugCode) // Navigate to the plug detail page with the extracted code
        } else {
          console.error("Invalid URL format. Expected format: /plug/[code]")
        }
      } catch (error) {
        console.error("Error parsing scanned URL:", error)
      }
    }
  }

  // update previous plugs used from sessions
  useEffect(() => {
    const uniquePlugIds = new Set<string>()
    sessions.forEach((session) => {
      if (session.plug_id === plugID) {
        return
      }
      uniquePlugIds.add(session.plug_id)
    })
    setPreviousPlugIDs(Array.from(uniquePlugIds))
  }, [plugID, sessions])

  useEffect(() => {
    // Define a function to update the Firestore document
    const updatePlugSettings = async () => {
      const currentTimeInMs = Date.now()
      const plugSettingsRef = doc(firestore, "plug_settings", plugID)

      try {
        await updateDoc(plugSettingsRef, {
          last_time_user_checking_ms: currentTimeInMs,
        })
        console.log("PlugSettings document updated successfully")
      } catch (error) {
        console.error("Error updating PlugSettings document: ", error)
      }
    }

    // Call the update function immediately on component load
    updatePlugSettings()

    // Set up an interval to call the update function every 30 seconds
    const intervalId = setInterval(updatePlugSettings, 30000)

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId)
  }, [plugID])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPlugID(value)
  }

  console.log(customer.customerBalance?.cents_aud)
  return (
    <Container>
      {customer.customerBalance?.cents_aud === undefined ||
      customer.customerBalance?.cents_aud === 0 ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>
              You don't have any credit yet. Top up to get started.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" onClick={() => navigate("/money")}>
              Top Up
            </Button>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          yooooooo {customer.customerBalance?.cents_aud} yo
          <Grid item xs={12}>
            <Typography variant="h6">Scan QR code on Plug</Typography>
          </Grid>
          <Grid item xs={12}>
            <BarcodeScannerDialog
              // open={openScanner}
              onClose={handleScannerClose}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Or type in code</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Enter Code Manually"
              variant="outlined"
              value={plugID}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      disabled={plugID === ""}
                      onClick={() => updatePlug(plugID)}
                      edge="end"
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && plugID !== "") {
                  updatePlug(plugID)
                }
              }}
            />
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

export default PlugSelectPage
