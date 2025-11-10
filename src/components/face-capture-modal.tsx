"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Camera, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { attendanceApi } from "@/lib/api/attendance"
import { authApi } from "@/lib/api/auth"

interface FaceCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onClockInSuccess?: () => void
}

export function FaceCaptureModal({ isOpen, onClose, onClockInSuccess }: FaceCaptureModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [askPermission, setAskPermission] = useState(false)

  let shift = localStorage.getItem("user_shift") ? JSON.parse(localStorage.getItem("user_shift") || '{}').shift : 'GEN'; // Default to 'D' if not found
  if(shift==="General"){
    shift = "GEN";
  }
  console.log("Using shift:", shift);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user", // Front camera
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setError(null)
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.")
      console.error("Camera error:", err)
    }
  }, [])


  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageDataUrl)
        stopCamera()
      }
    }
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const submitAttendance = useCallback(async () => {
    if (!capturedImage) return

    setIsLoading(true)
    try {
      // Get employee ID from localStorage or auth context
      const user = authApi.getUser();
      const empId = user.emp_id; // Fallback to 0 if not found

      // Convert base64 to blob
      const response = await fetch(capturedImage)
      const blob = await response.blob()

      const result = await attendanceApi.clockIn(empId, blob, shift)

      if (result.success) {
        alert(`Successfully ${result.action}! Time: ${result.timestamp}`)
        onClockInSuccess?.()
        onClose()
      } else {
        setError(result.error || "Failed to record attendance")
      }
    } catch (err) {
      setError("Failed to submit attendance. Please try again.")
      console.error("Attendance submission error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [capturedImage, onClose, onClockInSuccess])

  const handleClose = useCallback(() => {
    stopCamera()
    setCapturedImage(null)
    setError(null)
    onClose()
    setAskPermission(false);
  }, [stopCamera, onClose])

  // Start camera when modal opens
  //   useState(() => {
  //     if (isOpen && !stream && !capturedImage) {
  //       startCamera()
  //     }
  //   })

  
  if (isOpen && !askPermission) {
    const userConfirmed = window.confirm("This app wants to access your camera. Do you want to allow?");
    if (userConfirmed) {
      startCamera();
      setAskPermission(true);
    } else {
      console.log("Camera access denied by user");
      stopCamera();
      setAskPermission(false);
    }
    
  }


  useEffect(() => {
    if (isOpen && !stream && !capturedImage && askPermission) {
      startCamera()
    }
    // Stop camera when modal closes
    return () => {
      if (!isOpen) stopCamera()
    }
  }, [isOpen, stream, capturedImage, startCamera, stopCamera])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Face Capture for Attendance</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {!capturedImage ? (
              <div className="aspect-[4/3] flex items-center justify-center">
                {stream ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Starting camera...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[4/3]">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured face"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            {!capturedImage ? (
              <>
                <Button onClick={capturePhoto} disabled={!stream} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={submitAttendance}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Submitting..." : "Submit Attendance"}
                </Button>
                <Button variant="outline" onClick={retakePhoto}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
