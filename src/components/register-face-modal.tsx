"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, RotateCcw, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { authApi } from "@/lib/api/auth"

interface RegisterFaceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function RegisterFaceModal({ isOpen, onClose, onSuccess }: RegisterFaceModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [shots, setShots] = useState<string[]>([])
  const [videoReady, setVideoReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const user = authApi.getUser()
  const empId = user?.emp_id
  const name = user?.emp_name || `EMP-${empId ?? ""}`

  const startCamera = useCallback(async () => {
    try {
      setVideoReady(false)
      // Prefer front camera; fallback to environment
      let s: MediaStream
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        })
      } catch {
        s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "environment" },
          audio: false,
        })
      }
      setStream(s)

      const v = videoRef.current
      if (v) {
        v.srcObject = s
        v.playsInline = true
        v.muted = true

        // Wait for a real frame before enabling capture
        const handleLoaded = async () => {
          try { await v.play() } catch {}
        }
        const handleCanPlay = () => {
          // have actual pixels
          if (v.videoWidth > 0 && v.videoHeight > 0) setVideoReady(true)
        }

        v.addEventListener("loadedmetadata", handleLoaded, { once: true })
        v.addEventListener("canplay", handleCanPlay, { once: true })
      }
      setError(null)
    } catch (e) {
      console.error(e)
      setError("Camera access denied or unavailable. Check browser permissions.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
    setVideoReady(false)
  }, [stream])

  // Start/stop tied to modal open state
useEffect(() => {
  let cancelled = false

  const stopTracks = (s?: MediaStream | null) => {
    s?.getTracks().forEach(t => t.stop())
  }

  const boot = async () => {
    setError(null)
    setVideoReady(false)

    // kill any old stream that might be hogging the cam
    stopTracks(stream)

    try {
      // prefer front cam, fallback to environment
      let s: MediaStream
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "user" }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })
      } catch {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })
      }

      if (cancelled) { stopTracks(s); return }

      setStream(s)

      const v = videoRef.current
      if (!v) return

      // set attributes BEFORE play
      v.muted = true
      v.playsInline = true
      v.setAttribute("playsinline", "true")
      v.srcObject = s

      // try to play
      await v.play().catch(() => {})

      // Poll until we actually have pixels (covers cases where canplay never fires)
      const start = Date.now()
      const id = window.setInterval(() => {
        if (!v) return
        if (v.videoWidth > 0 && v.videoHeight > 0 && v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          setVideoReady(true)
          window.clearInterval(id)
        } else if (Date.now() - start > 7000) { // 7s timeout
          window.clearInterval(id)
          setError("Could not start camera preview. Close other apps/tabs using the camera and try again.")
        }
      }, 120)
    } catch (e) {
      console.error(e)
      setError("Camera access denied or unavailable. Check browser permission for this site.")
    }
  }

  if (isOpen) {
    boot()
  } else {
    // closing modal
    stopTracks(stream)
    setStream(null)
    setVideoReady(false)
  }

  return () => {
    cancelled = true
    stopTracks(stream)
    setStream(null)
    setVideoReady(false)
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen])  // intentionally only when modal opens/closes

  const captureShot = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Hard guard: only capture when a real frame is available
    if (
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setError("Camera is not ready yet. Please wait a moment and try again.")
      return
    }

    const w = video.videoWidth
    const h = video.videoHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
    setShots((prev) => (prev.length < 4 ? [...prev, dataUrl] : prev))
  }, [])

  const deleteShot = (idx: number) => setShots((prev) => prev.filter((_, i) => i !== idx))

  const dataUrlToFile = async (dataUrl: string, filename: string) => {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], filename, { type: "image/jpeg" })
  }

  const submit = async () => {
    if (!empId) {
      setError("Employee not found in session.")
      return
    }
    if (shots.length !== 4) {
      setError("Please capture exactly 4 photos.")
      return
    }
    if (!apiBase) {
      setError("API base URL is not configured.")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const fd = new FormData()
      fd.append("emp_id", String(empId))
      fd.append("name", name)
      const files = await Promise.all(shots.map((s, i) => dataUrlToFile(s, `face-${i + 1}.jpg`)))
      files.forEach((f) => fd.append("files", f))

     // const res = await fetch(`${apiBase}/api/register`, { method: "POST", body: fd })
    const token = localStorage.getItem("auth_token")
//console.log("Token being sent:", token) // This will help you debug if the token is present

const res = await fetch(`${apiBase}/api/register`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`, // This is the crucial fix
  },
  body: fd,
})


      const json = await res.json().catch(() => ({} as any))
      if (!res.ok || json?.status === "failed") {
        throw new Error(json?.reason || json?.error || `HTTP ${res.status}`)
      }

      alert("Faces registered successfully!")
      onSuccess?.()
      onClose()
    } catch (e: any) {
      setError(e?.message || "Registration failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Register Face (Capture 4 Photos)</span>
          </DialogTitle>
        </DialogHeader>

        <Card className="shadow-none border-0">
          <CardContent className="space-y-4 p-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <div className="aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="block w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {shots.map((s, i) => (
                <div key={i} className="relative w-24 h-24 border rounded overflow-hidden">
                  <img src={s} alt={`shot-${i + 1}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => deleteShot(i)}
                    className="absolute top-1 right-1 bg-white/80 rounded p-1"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              ))}
              {shots.length < 4 && (
                <div className="w-24 h-24 border rounded flex items-center justify-center text-sm text-gray-500">
                  {shots.length}/4
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={captureShot}
                disabled={!stream || !videoReady || shots.length >= 4}
              >
                <Camera className="h-4 w-4 mr-2" />
                {videoReady ? "Capture" : "Initializing…"}
              </Button>
              <Button variant="outline" onClick={() => setShots([])}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={submit} disabled={isSubmitting || shots.length !== 4}>
                <Upload className="h-4 w-4 mr-2" />
                {isSubmitting ? "Uploading…" : "Submit 4 Photos"}
              </Button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
