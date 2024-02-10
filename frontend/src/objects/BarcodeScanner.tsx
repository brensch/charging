import React, { useState, useEffect, useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/library"
import { Dialog, CircularProgress, Paper, Typography } from "@mui/material"

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
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      setDialogOpen(true)
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          streamRef.current = stream
          const videoElement = videoRef.current
          if (videoElement) {
            videoElement.srcObject = stream
            videoElement.setAttribute("playsinline", "true")

            videoElement.onloadedmetadata = () => {
              videoElement.play().then(() => setIsLoading(false))
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
      <Paper
        elevation={3}
        style={{ padding: "20px", border: "2px solid black" }}
      >
        <Typography variant="h6" style={{ marginBottom: "20px" }}>
          Scan QR code on plug
        </Typography>
        <Paper
          elevation={3}
          style={{
            width: "300px",
            height: "300px",
            margin: "auto",
            border: "none",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "none",
          }}
        >
          {isLoading && <CircularProgress />}
          <video
            ref={videoRef}
            style={{
              border: "2px solid black", // Apply the border directly to the video
              width: "calc(100% + 4px)", // Account for border width
              height: "calc(100% + 4px)", // Account for border width
              objectFit: "cover",
              position: "relative", // To ensure the border aligns properly

              display: isLoading ? "none" : "block",
            }}
            muted
            autoPlay
          />
        </Paper>
      </Paper>
    </Dialog>
  )
}

export default BarcodeScannerDialog
