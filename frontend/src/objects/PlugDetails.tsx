// PlugDetails.tsx
import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, onSnapshot } from "firebase/firestore"
import { firestore } from "../firebase" // Adjust the path to your Firebase config
import { Container, Typography } from "@mui/material"
import {
  PlugStatus,
  PlugSettings,
  stateMachineStateToJSON,
} from "../contracts/objects"

interface PlugDetailsProps {
  plugId: string
}

const PlugDetails: React.FC<PlugDetailsProps> = ({ plugId }) => {
  const navigate = useNavigate()

  const [plugStatus, setPlugStatus] = useState<PlugStatus | null>(null)
  const [plugSettings, setPlugSettings] = useState<PlugSettings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const statusUnsub = onSnapshot(
      doc(firestore, "plug_status", plugId),
      (doc) => {
        if (doc.exists()) {
          setPlugStatus(PlugStatus.fromJSON(doc.data()))
        } else {
          setPlugStatus(null)
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
      },
    )

    setLoading(false)

    return () => {
      statusUnsub()
      settingsUnsub()
    }
  }, [plugId, navigate])

  return (
    <Container>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          {plugSettings && (
            <Typography variant="h5">{plugSettings.name}</Typography>
          )}
          {plugStatus && (
            <Typography variant="body1">
              {stateMachineStateToJSON(plugStatus.state?.state)}
            </Typography>
          )}
        </>
      )}
    </Container>
  )
}

export default PlugDetails
