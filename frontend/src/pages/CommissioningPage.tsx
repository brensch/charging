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
  CommissioningStateRequest,
  CommissioningStateResponse,
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

const CommissioningPage = () => {
  const urlQuery = useQuery()
  const navigate = useNavigate()
  const auth = useAuth()

  const updateSite = (id: string) => {
    setSiteID(id)
    navigate(`?site=${id}`)
  }

  const [siteID, setSiteID] = useState(urlQuery.get("site") || "")
  const [plugStatus, setPlugStatus] = useState<PlugStatus | null>(null)
  const [plugsSettings, setPlugsSettings] = useState<PlugSettings[]>([])
  const [commissioningResponse, setCommissioningResponse] =
    useState<CommissioningStateResponse | null>(null)
  const [openScanner, setOpenScanner] = useState<boolean>(false)
  const [loadingPlugStatus, setLoadingPlugStatus] = useState<boolean>(false)
  const [previousPlugIDs, setPreviousPlugIDs] = useState<string[]>([])

  const handleScannerClose = (scannedUrl?: string) => {
    setOpenScanner(false)

    if (scannedUrl) {
      const url = new URL(scannedUrl)
      const plugValue = url.searchParams.get("site")

      if (plugValue) {
        updateSite(plugValue)
      }
    }
  }
  const toggleScanner = () => {
    setOpenScanner(!openScanner)
  }

  const activateCommissioning = async (plugID: string) => {
    const userRequest: CommissioningStateRequest = {
      site_id: siteID,
      requestor_id: auth.currentUser?.uid!,
      time_requested_ms: Date.now(),
      active_plug: plugID,
    }

    try {
      // Use `doc` to create a reference to the new document with the UUID and `setDoc` to create it

      await addDoc(collection(firestore, "commissioning_requests"), userRequest)
      console.log(
        "Document successfully written with UUID as the doc reference!",
      )
    } catch (e) {
      console.error("Error adding document with UUID as the doc reference: ", e)
    }
  }

  // get all currently controlled plugs
  useEffect(() => {
    const q = query(
      collection(firestore, "plug_settings"),
      where("site_id", "==", siteID),
    )

    // Subscribe to the query
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const plugsSettings: PlugSettings[] = []
      querySnapshot.forEach((doc) => {
        plugsSettings.push(PlugSettings.fromJSON(doc.data()))
      })
      setPlugsSettings(plugsSettings)
    })

    // Clean up the subscription when the component unmounts
    return () => unsubscribe()
  }, [siteID]) // Empty dependency array means this effect runs once on mount

  // get latest commissioning state response
  useEffect(() => {
    const q = query(
      collection(firestore, "commissioning_responses"),
      where("site_id", "==", siteID),
      orderBy("time_actioned_ms", "desc"),
      limit(1),
    )

    // Subscribe to the query
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setCommissioningResponse(
          CommissioningStateResponse.fromJSON(doc.data()),
        )
      })
    })

    // Clean up the subscription when the component unmounts
    return () => unsubscribe()
  }, [siteID]) // Empty dependency array means this effect runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateSite(value)
  }

  useEffect(() => {
    const plugId = urlQuery.get("site")
    if (plugId !== siteID) {
      setSiteID(plugId || "")
    }
  }, [urlQuery])

  console.log(commissioningResponse)

  return (
    <Container>
      <TextField
        label="Enter Site Code or scan"
        variant="outlined"
        value={siteID}
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
      {(commissioningResponse === null || !commissioningResponse?.active) && (
        <Button
          fullWidth
          variant="outlined"
          onClick={() => activateCommissioning("init")}
        >
          Activate Commissioning mode
        </Button>
      )}
      {commissioningResponse?.active && (
        <Button fullWidth variant="outlined">
          Deactivate Commissioning mode
        </Button>
      )}
      <BarcodeScannerDialog
        open={openScanner}
        onClose={handleScannerClose}
        banner="Scan QR Code on magic box"
      />
      {plugsSettings.map((plug) => (
        <div>{plug.id}</div>
      ))}
    </Container>
  )
}

export default CommissioningPage
