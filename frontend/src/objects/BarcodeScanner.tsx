import React, { useEffect, useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/library"
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material"

interface BarcodeScannerDialogProps {
  open: boolean
  onClose: (scannedCode?: string) => void
}

const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({
  open,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = new BrowserMultiFormatReader()

  useEffect(() => {
    if (open) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          const videoElement = videoRef.current
          if (videoElement) {
            videoElement.srcObject = stream
            videoElement.setAttribute("playsinline", "true") // required to tell iOS safari we don't want fullscreen
            videoElement.play()

            decodeFromVideo(videoElement)
          }
        })
        .catch((error) => {
          console.error("Error accessing video stream", error)
        })
    }

    return () => {
      codeReader.reset()
    }
  }, [open])

  const decodeFromVideo = (videoElement: HTMLVideoElement) => {
    codeReader
      .decodeFromVideoElement(videoElement)
      .then((result) => {
        onClose(result.getText()) // Close the dialog after scanning
      })
      .catch((err) => {
        console.error("Error decoding barcode", err)
      })
  }

  return (
    <Dialog open={open} onClose={() => onClose()}>
      <video ref={videoRef} style={{ width: "100%" }} muted autoPlay />
    </Dialog>
  )
}

export default BarcodeScannerDialog
