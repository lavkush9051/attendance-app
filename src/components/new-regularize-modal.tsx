"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { attendanceApi } from "@/lib/api"



interface NewRegularizeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewRegularizeModal({ isOpen, onClose }: NewRegularizeModalProps) {



  const [apiError, setApiError] = useState<string>("")

  const [formData, setFormData] = useState({
    date: "",
    type: "",
    clockIn: "",
    clockOut: "",
    reason: "",
    shift: "",

  })
  // Load L1 & L2 names from localStorage
  const user = JSON.parse(localStorage.getItem("user_data") || "{}");

  const l1Name = user.emp_l1_name;
  const l2Name = user.emp_l2_name;
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")




  const regularizeTypes = [
    { value: "missed-clock-in", label: "Missed Clock In" },
    { value: "missed-clock-out", label: "Missed Clock Out" },
    { value: "wrong-time", label: "Wrong Time Entry" },
    { value: "system-error", label: "System Error" },
    { value: "Outdoor Duty", label: "Outdoor Duty" },
    { value: "other", label: "Other" },
  ]

  const shiftTypes = [
    { value: "I", label: "I (07:00-15:00)" },
    { value: "II", label: "II (15:00-23:00)" },
    { value: "III", label: "III (23:00-07:00)" },
    { value: "GEN", label: "GEN (10:00-17:45)" },
  ]

  // ✅ AUTO-FILL logic when Outdoor Duty + Shift selected
  useEffect(() => {
    if (formData.type === "Outdoor Duty" && formData.shift) {
      let shiftTime = { in: "", out: "" }

      switch (formData.shift) {
        case "I":
          shiftTime = { in: "07:00", out: "15:00" }
          break
        case "II":
          shiftTime = { in: "15:00", out: "23:00" }
          break
        case "III":
          shiftTime = { in: "23:00", out: "07:00" }
          break
        case "GEN":
          shiftTime = { in: "10:00", out: "17:45" }
          break
      }

      setFormData((prev) => ({
        ...prev,
        clockIn: shiftTime.in,
        clockOut: shiftTime.out,
      }))
    }
  }, [formData.type, formData.shift])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) { newErrors.date = "Date is required" 

    } else {
    const selectedDate = new Date(formData.date)
    const today = new Date()
    
    // normalize today (remove time)
    today.setHours(0, 0, 0, 0)

    if (selectedDate > today) {
      newErrors.date = "Future date is not allowed for regularization"
    }
  }

    if (!formData.type) newErrors.type = "Regularization type is required"
    if (!formData.reason.trim()) newErrors.reason = "Reason is required"
    if (!formData.shift) newErrors.shift = "Shift type is required"

    if (formData.clockIn && formData.clockOut) {
      const clockIn = new Date(`2000-01-01 ${formData.clockIn}`)
      const clockOut = new Date(`2000-01-01 ${formData.clockOut}`)
      if (clockOut <= clockIn) {
        newErrors.clockOut = "Clock out time must be after clock in time"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const res = await attendanceApi.postRegularizeAttendance({
        id: "", // leave empty if your backend auto-generates
        emp_id: "", // will be set inside API util from authApi.getUser
        employee_name: "", // backend or util may set this, leave blank if not in form
        date: formData.date,
        original_clock_in: "", // if not used, leave blank or use as per your flow
        original_clock_out: "",
        requested_clock_in: formData.clockIn,
        requested_clock_out: formData.clockOut,
        reason: formData.reason,
        type: formData.type,
        status: "pending", // usually "pending" for new requests
        applied_date: "", // backend should set, or leave blank
        approved_by: "",
        approved_date: "",
        rejection_reason: "",
        shift: formData.shift,

      })
      // console.log("Regularization request submitted successfully", formData.clockIn, formData.clockOut, formData.reason, formData.type, formData.shift)
      setSubmitStatus("success")
      setTimeout(() => {
        onClose()
        setFormData({
          date: "",
          type: "",
          clockIn: "",
          clockOut: "",
          reason: "",
          shift: "",
        })
        setSubmitStatus("idle")
      }, 2000)
    }
    catch (error: any) {
      console.error("Regularization error:", error)

      setApiError(
        error?.message ||
        error?.response?.message ||
        "Failed to submit regularization request"
      )
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>New Regularization Request</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {submitStatus === "success" && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Regularization request submitted successfully!
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === "error" && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {apiError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                // max={today}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="type">Regularization Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select regularization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {regularizeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
              </div>
              <div>
                <Label>L1-Immediate RO</Label>
                <Input
                  type="text"
                  value={user?.emp_l1_name || ""}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed text-[11px]"
                />
              </div>

              <div>
                <Label htmlFor="shift">Shift Type *</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, shift: value }))}
                >
                  <SelectTrigger className={errors.shift ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftTypes.map((shift) => (
                      <SelectItem key={shift.value} value={shift.value}>
                        {shift.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shift && <p className="text-sm text-red-500 mt-1">{errors.shift}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clockIn">Clock In Time</Label>
                <Input
                  id="clockIn"
                  type="time"
                  value={formData.clockIn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clockIn: e.target.value }))}
                  className={errors.clockIn ? "border-red-500" : ""}
                />
                {errors.clockIn && <p className="text-sm text-red-500 mt-1">{errors.clockIn}</p>}
              </div>

              <div>
                <Label htmlFor="clockOut">Clock Out Time</Label>
                <Input
                  id="clockOut"
                  type="time"
                  value={formData.clockOut}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clockOut: e.target.value }))}
                  className={errors.clockOut ? "border-red-500" : ""}
                />
                {errors.clockOut && <p className="text-sm text-red-500 mt-1">{errors.clockOut}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for regularization..."
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                className={errors.reason ? "border-red-500" : ""}
                rows={3}
              />
              {errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason}</p>}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
