import React, { useState, useEffect, useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/library"
import { Dialog, CircularProgress, Paper, Typography, Box } from "@mui/material"

interface BarcodeScannerDialogProps {
  open: boolean
  onClose: (scannedCode?: string) => void
}

const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({
  open,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true) // Start with loading state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      setDialogOpen(true)
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          streamRef.current = stream
          const videoElement = videoRef.current
          if (videoElement) {
            videoElement.srcObject = stream
            videoElement.setAttribute("playsinline", "true") // required for inline playback on iOS

            videoElement.onloadedmetadata = () => {
              videoElement.play().then(() => {
                setIsLoading(false) // Video is ready, stop showing loader
              })
            }

            codeReader.current = new BrowserMultiFormatReader()
            decodeFromVideo(videoElement)
          }
        })
        .catch((error) => {
          console.error("Error accessing video stream", error)
          setIsLoading(false)
          setDialogOpen(false)
        })
    }

    return () => {
      if (codeReader.current) {
        codeReader.current.reset()
        codeReader.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      setDialogOpen(false)
    }
  }, [open])

  const decodeFromVideo = (videoElement: HTMLVideoElement) => {
    codeReader.current
      ?.decodeFromVideoElement(videoElement)
      .then((result) => {
        onClose(result.getText())
      })
      .catch((err) => {
        console.error("Error decoding barcode", err)
      })
  }

  return (
    <Dialog open={dialogOpen} onClose={() => onClose()}>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Scan QR code on plug
        </Typography>
        <Paper
          elevation={3}
          sx={{
            width: 300, // Fixed width
            height: 300, // Fixed height
            margin: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative", // Needed for absolute positioning of CircularProgress
          }}
        >
          {isLoading && (
            <CircularProgress
              size={60}
              sx={{
                position: "absolute", // Positioned absolutely to center the loader
              }}
            />
          )}
          <video
            ref={videoRef}
            style={{
              display: isLoading ? "none" : "block", // Only display video when it's ready
              width: "100%", // Fill the container
              height: "100%", // Fill the container
              objectFit: "cover", // Cover the entire Paper area without stretching
            }}
            muted
            autoPlay
            playsInline // Required for inline playback on iOS
          />
        </Paper>
      </Box>
    </Dialog>
  )
}

export default BarcodeScannerDialog
