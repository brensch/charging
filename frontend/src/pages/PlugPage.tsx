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
import BarcodeScannerDialog from "../objects/BarcodeScanner"
import { CustomerContext } from "../contexts/CustomerContext"
import PlugDetails from "../objects/PlugDetails"
const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

const PlugPage = () => {
  const urlQuery = useQuery()
  const navigate = useNavigate()
  const auth = useAuth()

  const { sessions } = useContext(CustomerContext)

  const updatePlug = (id: string) => {
    setPlugID(id)
    navigate(`?plug=${id}`)
  }

  const [plugID, setPlugID] = useState(urlQuery.get("plug") || "")
  const [plugStatus, setPlugStatus] = useState<PlugStatus | null>(null)
  const [plugSettings, setPlugSettings] = useState<PlugSettings | null>(null)
  const [inUsePlugs, setInUsePlugs] = useState<string[]>([])
  const [openScanner, setOpenScanner] = useState<boolean>(false)
  const [loadingPlugStatus, setLoadingPlugStatus] = useState<boolean>(false)
  const [previousPlugIDs, setPreviousPlugIDs] = useState<string[]>([])

  const handleScannerClose = (scannedUrl?: string) => {
    setOpenScanner(false)

    if (scannedUrl) {
      const url = new URL(scannedUrl)
      const plugValue = url.searchParams.get("plug")

      if (plugValue) {
        updatePlug(plugValue)
      }
    }
  }
  const toggleScanner = () => {
    setOpenScanner(!openScanner)
  }

  const handleCreateRequest = async (state: StateMachineState) => {
    const id = uuidv4() // Generate a unique UUID

    const userRequest: UserRequest = {
      id: id,
      user_id: auth.currentUser?.uid!,
      plug_id: plugID,
      requested_state: state,
      time_requested: Date.now(),
      result: {
        status: UserRequestStatus.RequestedStatus_PENDING,
        time_entered_state: Date.now(),
        reason: "user request",
      },
    }

    try {
      // Use `doc` to create a reference to the new document with the UUID and `setDoc` to create it

      await setDoc(doc(firestore, "user_requests", id), userRequest)
      console.log(
        "Document successfully written with UUID as the doc reference!",
      )
    } catch (e) {
      console.error("Error adding document with UUID as the doc reference: ", e)
    }
  }

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

  useEffect(() => {
    if (!plugID) {
      setPlugSettings(null)
      setPlugStatus(null)
      return
    }
    let loadingCounter = 2 // Start with 2 to represent the two subscriptions we're about to make
    setLoadingPlugStatus(true)

    // Subscribe to plug_status document
    const unsubscribeStatus = onSnapshot(
      doc(firestore, "plug_status", plugID),
      (doc) => {
        if (doc.exists()) {
          setPlugStatus(PlugStatus.fromJSON(doc.data()))
        }
        // Decrement the loading counter and check if all data has been loaded
        loadingCounter -= 1
        if (loadingCounter === 0) {
          setLoadingPlugStatus(false)
        }
      },
    )

    // Subscribe to plug_settings document
    const unsubscribeSettings = onSnapshot(
      doc(firestore, "plug_settings", plugID), // Assuming plugID is also used for plug_settings; adjust if necessary
      (doc) => {
        if (doc.exists()) {
          setPlugSettings(PlugSettings.fromJSON(doc.data()))
        }
        // Decrement the loading counter and check if all data has been loaded
        loadingCounter -= 1
        if (loadingCounter === 0) {
          setLoadingPlugStatus(false)
        }
      },
    )

    // Return a cleanup function that unsubscribes from both documents
    return () => {
      unsubscribeStatus()
      unsubscribeSettings()
    }
  }, [plugID]) // Dependencies array, re-run effect if plugID changes

  // get all currently controlled plugs
  useEffect(() => {
    // Create a query against the "user_requests" collection, ordered by "time_requested" descending, limited to 5 documents
    const q = query(
      collection(firestore, "plug_status"),
      where("state.owner_id", "==", auth.currentUser?.uid),
      limit(5),
    )

    // Subscribe to the query
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const inUsePlugs: string[] = []
      querySnapshot.forEach((doc) => {
        const status = PlugStatus.fromJSON(doc.data())
        if (status.id === plugID) {
          return
        }
        inUsePlugs.push(status.id)
      })
      setInUsePlugs(inUsePlugs)
    })

    // Clean up the subscription when the component unmounts
    return () => unsubscribe()
  }, [plugID]) // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updatePlug(value)
  }

  useEffect(() => {
    const plugId = urlQuery.get("plug")
    if (plugId !== plugID) {
      setPlugID(plugId || "")
    }
  }, [urlQuery])

  const previousPlugs = previousPlugIDs.filter(
    (previousPlug) => !inUsePlugs.includes(previousPlug),
  )

  const formatState = (state: StateMachineState) =>
    stateMachineStateToJSON(state)
      .replace(/^StateMachineState_/, "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())

  return (
    <Container>
      <TextField
        label="Enter Plug Code or scan"
        variant="outlined"
        value={plugID}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={toggleScanner}>
                <QrCode2Icon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <BarcodeScannerDialog
        open={openScanner}
        onClose={handleScannerClose}
        banner="Scan QR Code on plug"
      />
      {loadingPlugStatus && <Typography>loading plug state</Typography>}
      {!loadingPlugStatus &&
        plugStatus &&
        plugSettings &&
        plugStatus.state?.state && (
          <React.Fragment>
            <Paper elevation={3} style={{ padding: 0, margin: 0 }}>
              <Grid container spacing={0}>
                <Grid
                  item
                  xs={12}
                  style={{ padding: 16, borderBottom: "2px solid black" }}
                >
                  <Typography variant="h6" style={{ fontWeight: "bold" }}>
                    {plugSettings?.name === ""
                      ? plugStatus.id
                      : plugSettings.name}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={7}
                  style={{
                    padding: 16,
                    borderRight: "2px solid black",
                    borderBottom: "2px solid black",
                  }}
                >
                  <Typography
                    variant="body1"
                    style={{ fontWeight: "bold", wordWrap: "break-word" }}
                  >
                    {formatState(plugStatus.state.state)}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={5}
                  style={{ padding: 16, borderBottom: "2px solid black" }}
                >
                  <Typography
                    variant="body1"
                    style={{ fontWeight: "bold", wordWrap: "break-word" }}
                  >
                    {(
                      plugStatus.latest_reading?.current! *
                      plugStatus.latest_reading?.voltage!
                    ).toFixed(2)}
                    W
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={9}
                  style={{
                    padding: 16,
                    borderRight: "2px solid black",
                    backgroundColor: "ff00ff",
                  }}
                >
                  <Box display="flex" justifyContent="space-around">
                    {plugStatus.possible_next_states_labels.map(
                      (possibleState, index) => {
                        return (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() =>
                              handleCreateRequest(
                                plugStatus.possible_next_states[index],
                              )
                            }
                            style={{
                              fontWeight: "bold",
                              boxShadow: "4px 4px 0px rgba(0, 0, 0, 1)", // Example of a bold, stark shadow
                            }}
                          >
                            {possibleState}
                          </Button>
                        )
                      },
                    )}
                    {plugStatus.possible_next_states_labels.length === 0 && (
                      <Button
                        variant="contained"
                        color="primary"
                        disabled
                        style={{
                          fontWeight: "bold",
                          boxShadow: "4px 4px 0px rgba(0, 0, 0, 1)", // Example of a bold, stark shadow
                        }}
                      >
                        Waiting for system.
                      </Button>
                    )}
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={3}
                  style={{
                    display: "flex", // Enable flexbox
                    flexDirection: "column", // Stack children vertically
                    justifyContent: "center", // Center vertically
                    alignItems: "center", // Center horizontally
                    padding: 16,
                    backgroundColor:
                      plugStatus.latest_reading?.state ===
                      ActualState.ActualState_ON
                        ? "#00ff00"
                        : "#f1f1f1",
                  }}
                >
                  <Typography
                    variant="body1"
                    style={{
                      fontWeight: "bold",
                      wordWrap: "break-word",
                      textAlign: "center", // Ensure text is centered within Typography
                    }}
                  >
                    {plugStatus.latest_reading?.state &&
                      actualStateToJSON(
                        plugStatus.latest_reading?.state,
                      ).replace("ActualState_", "")}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </React.Fragment>
        )}
      <Grid container spacing={1}>
        {inUsePlugs.length > 0 && (
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
        ))}
      </Grid>
    </Container>
  )
}

export default PlugPage
