import React, { useState, useEffect, useContext } from "react"
import {
  Typography,
  TextField,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore"
import { firestore } from "../firebase" // Assume you have a Firebase config file
import {
  ActualState,
  PlugSettings,
  PlugStatus,
  StateMachineState,
  UserRequest,
  UserRequestResult,
  actualStateToJSON,
  stateMachineStateToJSON,
  userRequestStatusFromJSON,
  userRequestStatusToJSON,
} from "../contracts/objects"
import { useAuth } from "../contexts/AuthContext"
import { v4 as uuidv4 } from "uuid"
import { UserRequestStatus } from "../contracts/objects"
import QrCode2Icon from "@mui/icons-material/QrCode2"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import BarcodeScannerDialog from "../objects/BarcodeScanner"
import { CustomerContext } from "../contexts/CustomerContext"
import PlugDetails from "../objects/PlugDetails"
const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

const PlugSelectPage = () => {
  // const urlQuery = useQuery()
  const navigate = useNavigate()
  const auth = useAuth()

  const { sessions } = useContext(CustomerContext)

  const updatePlug = (id: string) => {
    navigate(`${id}`)
  }

  const [plugID, setPlugID] = useState("")

  // const [inUsePlugs, setInUsePlugs] = useState<string[]>([])
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

  // // get all currently controlled plugs
  // useEffect(() => {
  //   // Create a query against the "user_requests" collection, ordered by "time_requested" descending, limited to 5 documents
  //   const q = query(
  //     collection(firestore, "plug_status"),
  //     where("state.owner_id", "==", auth.currentUser?.uid),
  //     limit(5),
  //   )

  //   // Subscribe to the query
  //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //     const inUsePlugs: string[] = []
  //     querySnapshot.forEach((doc) => {
  //       const status = PlugStatus.fromJSON(doc.data())
  //       if (status.id === plugID) {
  //         return
  //       }
  //       inUsePlugs.push(status.id)
  //     })
  //     setInUsePlugs(inUsePlugs)
  //   })

  //   // Clean up the subscription when the component unmounts
  //   return () => unsubscribe()
  // }, [plugID]) // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPlugID(value)
  }

  // const previousPlugs = previousPlugIDs.filter(
  //   (previousPlug) => !inUsePlugs.includes(previousPlug),
  // )

  return (
    <Container>
      <Grid container spacing={2}>
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

        {/* {inUsePlugs.length > 0 && (
          <React.Fragment>
            <Grid item xs={12}>
              <Typography variant="h6">Your plugs in use right now</Typography>
            </Grid>
            {inUsePlugs.map((inUsePlugID) => (
              <Grid item xs={4}>
                <PlugDetails
                  plugId={inUsePlugID}
                  updateSelectedPlug={updatePlug}
                />
              </Grid>
            ))}
          </React.Fragment>
        )}
        {previousPlugs.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6">Previous plugs you've used</Typography>
          </Grid>
        )}
        {previousPlugs.map((previousPlugID) => (
          <Grid item xs={4}>
            <PlugDetails
              plugId={previousPlugID}
              updateSelectedPlug={updatePlug}
            />
          </Grid>
        ))} */}
      </Grid>
    </Container>
  )
}

export default PlugSelectPage
