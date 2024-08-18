import { Button, Container, Grid, Paper, Typography } from "@mui/material"
import { format, formatDistanceToNow } from "date-fns"
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "../contexts/AuthContext"
import {
  ActualState,
  PlugSettings,
  PlugStatus,
  StateMachineState,
  UserRequest,
  UserRequestStatus,
  actualStateToJSON,
  stateMachineStateToJSON,
} from "../contracts/objects"
import { firestore } from "../firebase" // Assume you have a Firebase config file
import { useCustomer } from "../contexts/CustomerContext"

const PlugDetailPage = () => {
  const auth = useAuth()
  const { customerBalance } = useCustomer()
  const navigate = useNavigate()

  const { plugID } = useParams()
  const [plugStatus, setPlugStatus] = useState<PlugStatus | null>(null)
  const [plugSettings, setPlugSettings] = useState<PlugSettings | null>(null)

  const [loadingPlugStatus, setLoadingPlugStatus] = useState<boolean>(false)
  const [invalidPlugStatus, setInvalidPlugStatus] = useState<boolean>(false)

  const handleCreateRequest = async (state: StateMachineState) => {
    if (!plugID) {
      return
    }
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
    if (!plugID) {
      return
    }
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
          setInvalidPlugStatus(false)
        } else {
          setInvalidPlugStatus(true)
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
          setInvalidPlugStatus(false)
        } else {
          setInvalidPlugStatus(true)
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

  const formatState = (state: StateMachineState) =>
    stateMachineStateToJSON(state)
      .replace(/^StateMachineState_/, "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())

  console.log(
    plugStatus?.state_machine_details?.current_owner,
    auth.currentUser?.uid,
  )

  if (
    plugStatus?.state_machine_details?.current_owner !== undefined &&
    plugStatus?.state_machine_details?.current_owner !== "" &&
    plugStatus?.state_machine_details?.current_owner !== auth.currentUser?.uid
  ) {
    return (
      <Container>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} my={2}>
            <Typography>
              Someone else is currently using this plug. Please scan a different
              plug.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined">Scan different plug</Button>
          </Grid>
        </Grid>
      </Container>
    )
  }

  const needsCredit =
    customerBalance?.cents_aud !== undefined && customerBalance?.cents_aud <= 0

  return (
    <Container>
      <Grid container spacing={2} justifyContent="center">
        {loadingPlugStatus && (
          <Grid item xs={12} my={2}>
            <Typography>Loading plug state...</Typography>
          </Grid>
        )}
        {invalidPlugStatus && (
          <Grid item xs={12}>
            <Typography>
              Invalid plug. Try scanning again. If problem persists, contact
              support.
            </Typography>
          </Grid>
        )}
        {!loadingPlugStatus &&
          plugStatus &&
          plugSettings &&
          plugStatus.state?.state && (
            <React.Fragment>
              <Grid item xs={12} sx={{ marginBottom: "50px" }}>
                <Typography variant="h4" mt={2} mb={2}>
                  Plug{" "}
                  {plugSettings?.name === ""
                    ? plugStatus.id.slice(-15)
                    : plugSettings.name.slice(-15)}{" "}
                </Typography>
              </Grid>
              {needsCredit && (
                <Grid item xs={12}>
                  <Button onClick={() => navigate("/money")} variant="outlined">
                    Insufficient credit - top up
                  </Button>
                </Grid>
              )}
              <Grid item xs={12} container>
                {plugStatus.possible_next_states_labels.map(
                  (possibleState, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      color="primary"
                      disabled={needsCredit}
                      onClick={() =>
                        handleCreateRequest(
                          plugStatus.possible_next_states[index],
                        )
                      }
                    >
                      {possibleState}
                    </Button>
                  ),
                )}
                {plugStatus.possible_next_states_labels.length === 0 && (
                  <Button variant="contained" color="primary" disabled>
                    Waiting for system.
                  </Button>
                )}
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ padding: 0 }}>
                  <Grid container>
                    <Grid item xs={3}>
                      <Typography variant="body1" sx={{ padding: 1 }}>
                        State:
                      </Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography
                        variant="body1"
                        sx={{ padding: 1, textAlign: "right" }}
                      >
                        {formatState(plugStatus.state.state)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body1" sx={{ padding: 1 }}>
                        Power:
                      </Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography
                        variant="body1"
                        sx={{ padding: 1, textAlign: "right" }}
                      >
                        {(
                          plugStatus.latest_reading?.current! *
                          plugStatus.latest_reading?.voltage!
                        ).toFixed(2)}{" "}
                        W
                      </Typography>
                    </Grid>
                    {plugStatus.state_machine_details?.charge_start_time_ms !==
                      0 && (
                      <>
                        <Grid item xs={3}>
                          <Typography variant="body1" sx={{ padding: 1 }}>
                            Charge Start:
                          </Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography
                            variant="body1"
                            sx={{ padding: 1, textAlign: "right" }}
                          >
                            {plugStatus.state_machine_details
                              ?.charge_start_time_ms &&
                              format(
                                new Date(
                                  plugStatus.state_machine_details.charge_start_time_ms,
                                ),
                                "PPpp",
                              )}
                            <br />{" "}
                            {plugStatus.state_machine_details
                              ?.charge_start_time_ms &&
                              `${formatDistanceToNow(
                                new Date(
                                  plugStatus.state_machine_details.charge_start_time_ms,
                                ),
                              )} ago`}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    <Grid
                      item
                      xs={12}
                      sx={{
                        backgroundColor:
                          plugStatus.latest_reading?.state ===
                          ActualState.ActualState_ON
                            ? "#00ff00"
                            : "#f1f1f1",
                        padding: 0, // No padding to allow color to extend to the edges
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          padding: 1,
                          textAlign: "center",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
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
              </Grid>
            </React.Fragment>
          )}
      </Grid>
    </Container>
  )
}

export default PlugDetailPage
