import React, { useState, useEffect } from "react"
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
  where,
} from "firebase/firestore"
import { firestore } from "../firebase" // Assume you have a Firebase config file
import {
  PlugStatus,
  StateMachineState,
  UserRequest,
  UserRequestResult,
  stateMachineStateToJSON,
  userRequestStatusToJSON,
} from "../contracts/objects"
import { useAuth } from "../contexts/AuthContext"
import { v4 as uuidv4 } from "uuid"
import { UserRequestStatus } from "../contracts/objects"
import QrCode2Icon from "@mui/icons-material/QrCode2"
import BarcodeScannerDialog from "../objects/BarcodeScanner"
const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

const PlugPage = () => {
  const urlQuery = useQuery()
  const navigate = useNavigate()
  const auth = useAuth()
  const [inputValue, setInputValue] = useState(urlQuery.get("plug") || "")
  const [plugStatus, setPlugStatus] = useState<PlugStatus | null>(null)
  const [recentRequests, setRecentRequests] = useState<UserRequest[]>([])
  const [openScanner, setOpenScanner] = useState<boolean>(false)

  const handleScannerClose = (scannedUrl?: string) => {
    setOpenScanner(false)

    if (scannedUrl) {
      // Use the URL constructor and searchParams to extract the plug value
      const url = new URL(scannedUrl)
      const plugValue = url.searchParams.get("plug")

      if (plugValue) {
        setInputValue(plugValue)
        navigate(`?plug=${plugValue}`)
        // Handle the plug value as needed, like setting it to an input field
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
      plug_id: inputValue,
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
    const plugId = urlQuery.get("plug")
    if (plugId) {
      const unsubscribe = onSnapshot(
        doc(firestore, "plug_status", plugId),
        (doc) => {
          if (doc.exists()) {
            setPlugStatus(PlugStatus.fromJSON(doc.data()))
          } else {
            setPlugStatus(null)
          }
        },
      )

      return () => unsubscribe()
    }
  }, [urlQuery.get("plug")])

  useEffect(() => {
    // Create a query against the "user_requests" collection, ordered by "time_requested" descending, limited to 5 documents
    const q = query(
      collection(firestore, "user_requests"),
      where("plug_id", "==", inputValue),
      orderBy("time_requested", "desc"),
      limit(5),
    )

    // Subscribe to the query
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests: UserRequest[] = []
      querySnapshot.forEach((doc) => {
        requests.push(doc.data() as UserRequest) // Assuming your UserRequest type matches the document structure
      })
      setRecentRequests(requests) // Update state with the new list of requests
    })

    // Clean up the subscription when the component unmounts
    return () => unsubscribe()
  }, [urlQuery.get("plug")]) // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    navigate(`?plug=${value}`)
  }

  useEffect(() => {
    const plugId = urlQuery.get("plug")
    if (plugId !== inputValue) {
      setInputValue(plugId || "")
    }
  }, [urlQuery.get("plug")])

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
        value={inputValue}
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
      <BarcodeScannerDialog open={openScanner} onClose={handleScannerClose} />

      {plugStatus && plugStatus.state?.state && (
        <React.Fragment>
          <Paper elevation={3} style={{ padding: 0, margin: 0 }}>
            <Grid container spacing={0}>
              <Grid
                item
                xs={12}
                style={{ padding: 16, borderBottom: "2px solid black" }}
              >
                <Typography variant="h6" style={{ fontWeight: "bold" }}>
                  Current Plug State
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
                  {new Date(plugStatus.state.time_ms).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} style={{ padding: 16 }}>
                <Typography
                  variant="body1"
                  style={{ fontWeight: "bold", wordWrap: "break-word" }}
                >
                  {plugStatus.state.reason}
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              style={{ padding: 16, borderTop: "2px solid black" }}
            >
              <Box display="flex" justifyContent="space-around" padding={1}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    handleCreateRequest(
                      StateMachineState.StateMachineState_USER_REQUESTED_ON,
                    )
                  }
                  style={{ fontWeight: "bold", margin: "0 10px" }}
                >
                  Request On
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    handleCreateRequest(
                      StateMachineState.StateMachineState_USER_REQUESTED_OFF,
                    )
                  }
                  style={{ fontWeight: "bold", margin: "0 10px" }}
                >
                  Request Off
                </Button>
              </Box>
            </Grid>
          </Paper>
        </React.Fragment>
      )}
      {recentRequests.length > 0 && (
        <React.Fragment>
          <Typography
            variant="h6"
            style={{ marginBottom: "20px", marginTop: "20px" }}
          >
            Commands to plug
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="recent requests">
              <TableHead>
                <TableRow>
                  <TableCell>State</TableCell>
                  <TableCell>Time Requested</TableCell>
                  <TableCell>Time Entered State</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody style={{ padding: 0 }}>
                {recentRequests.map((request, index) => (
                  <TableRow key={index} style={{ padding: 0 }}>
                    <TableCell>
                      {stateMachineStateToJSON(request.requested_state).replace(
                        /^StateMachineState_/,
                        "",
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(request.time_requested).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {request.result
                        ? new Date(
                            request.result.time_entered_state,
                          ).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {request.result
                        ? userRequestStatusToJSON(
                            request.result.status,
                          ).replace(/^RequestedStatus_/, "")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {request.result ? request.result.reason : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </React.Fragment>
      )}
    </Container>
  )
}

export default PlugPage
