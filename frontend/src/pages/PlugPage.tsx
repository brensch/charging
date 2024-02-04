import React, { useState, useEffect } from "react"
import { Typography, TextField, Box, Button } from "@mui/material"
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
  }, []) // Empty dependency array means this effect runs once on mount

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

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4">Plug</Typography>
      <TextField
        label="Plug ID"
        variant="outlined"
        value={inputValue}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />

      {plugStatus && plugStatus.state?.state && (
        <React.Fragment>
          <Box border={1} padding={2} marginY={2}>
            <Typography variant="body1">
              State:{" "}
              {stateMachineStateToJSON(plugStatus.state?.state).replace(
                /^StateMachineState_/,
                "",
              )}
            </Typography>
            <Typography variant="body1">
              Time: {new Date(plugStatus.state?.time_ms).toLocaleString()}
            </Typography>
            <Typography variant="body1">
              Reason: {plugStatus.state.reason}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              handleCreateRequest(
                StateMachineState.StateMachineState_USER_REQUESTED_ON,
              )
            }
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
          >
            Request Off
          </Button>
        </React.Fragment>
      )}
      <Box border={1} padding={2} marginY={2}>
        {recentRequests.map((request) => (
          <React.Fragment>
            <Typography variant="body1">
              {stateMachineStateToJSON(request.requested_state).replace(
                /^StateMachineState_/,
                "",
              )}
            </Typography>
            <Typography variant="body1">
              {new Date(request.time_requested).toLocaleString()}
            </Typography>
            {request.result && (
              <React.Fragment>
                <Typography variant="body1">
                  {new Date(
                    request.result?.time_entered_state,
                  ).toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  {userRequestStatusToJSON(request.result.status).replace(
                    /^RequestedStatus_/,
                    "",
                  )}
                </Typography>
              </React.Fragment>
            )}
            -------------------
          </React.Fragment>
        ))}
      </Box>
    </div>
  )
}

export default PlugPage
