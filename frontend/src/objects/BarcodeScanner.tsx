import React, { useEffect, useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/library"
import { Dialog } from "@mui/material"

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
  const streamRef = useRef<MediaStream | null>(null) // Ref for the camera stream

  useEffect(() => {
    if (open) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          streamRef.current = stream // Store the stream in a ref
          const videoElement = videoRef.current
          if (videoElement) {
            videoElement.srcObject = stream
            videoElement.setAttribute("playsinline", "true")
            videoElement.play()

            codeReader.current = new BrowserMultiFormatReader()
            decodeFromVideo(videoElement)
          }
        })
        .catch((error) => {
          console.error("Error accessing video stream", error)
        })
    }

    return () => {
      // Cleanup function to reset the codeReader and release the camera stream
      if (codeReader.current) {
        codeReader.current.reset()
        codeReader.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop()
        })
        streamRef.current = null // Clear the stream ref after stopping the tracks
      }
    }
  }, [open]) // Dependency array ensures this effect runs only when `open` changes

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
    <Dialog open={open} onClose={() => onClose()}>
      <video ref={videoRef} style={{ width: "100%" }} muted autoPlay />
    </Dialog>
  )
}

export default BarcodeScannerDialog
