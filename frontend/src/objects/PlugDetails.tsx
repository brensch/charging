import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, onSnapshot } from "firebase/firestore"
import { firestore } from "../firebase" // Adjust the path to your Firebase config
import { Box, Container, Divider, Grid, Paper, Typography } from "@mui/material"
import {
  PlugStatus,
  PlugSettings,
  stateMachineStateToJSON,
} from "../contracts/objects"
import ElectricalServices from "@mui/icons-material/ElectricalServices"

interface PlugDetailsProps {
  plugId: string
  updateSelectedPlug: (id: string) => void
}

const PlugDetails: React.FC<PlugDetailsProps> = ({
  plugId,
  updateSelectedPlug,
}) => {
  const navigate = useNavigate()

  const [plugStatus, setPlugStatus] = useState<PlugStatus | null>(null)
  const [plugSettings, setPlugSettings] = useState<PlugSettings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    setLoading(true)
    let loadingCounter = 2
    const statusUnsub = onSnapshot(
      doc(firestore, "plug_status", plugId),
      (doc) => {
        if (doc.exists()) {
          setPlugStatus(PlugStatus.fromJSON(doc.data()))
        } else {
          setPlugStatus(null)
        }
        loadingCounter -= 1
        if (loadingCounter === 0) {
          setLoading(false)
        }
      },
    )

    const settingsUnsub = onSnapshot(
      doc(firestore, "plug_settings", plugId),
      (doc) => {
        if (doc.exists()) {
          setPlugSettings(PlugSettings.fromJSON(doc.data()))
        } else {
          setPlugSettings(null)
        }
        loadingCounter -= 1
        if (loadingCounter === 0) {
          setLoading(false)
        }
      },
    )

    return () => {
      statusUnsub()
      settingsUnsub()
    }
  }, [plugId, navigate])

  if (loading) {
    return <div />
  }

  return (
    <Paper
      onClick={() => updateSelectedPlug(plugId)}
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
      <Grid container wrap="nowrap" sx={{ flexGrow: 1 }}>
        <Grid item xs zeroMinWidth>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <>
              <Typography variant="body2" noWrap>
                {plugSettings?.name || plugStatus?.id}
              </Typography>
              <Divider sx={{ borderWidth: 1, borderColor: "black" }} />
              <Typography variant="body2" noWrap>
                {plugStatus?.state &&
                  stateMachineStateToJSON(plugStatus.state?.state)
                    .replace(/^StateMachineState_/, "")
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())}
              </Typography>
            </>
          )}
        </Grid>
        <Grid item>
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // width: 50,
              borderLeft: "2px solid black",
            }}
          >
            <ElectricalServices fontSize="large" />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default PlugDetails
