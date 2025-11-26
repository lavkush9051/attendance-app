"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { leaveApi } from "@/lib/api"
// import { SearchableSelect } from "./SearchableSelect"// for-dropdown selection of approvers.

interface ApplyLeaveModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ApplyLeaveModal({ isOpen, onClose }: ApplyLeaveModalProps) {
  // for-dropdown selection of approvers.
  // const approvers = [
  //   { id: "1", name: "Select Employee 1" },
  //   { id: "2", name: "Select Employee 2" },
  //   { id: "3", name: "Select Employee 3" },
  // ]
  // const approverOptions = approvers.map(a => ({
  //   label: a.name,
  //   value: a.id,
  // }))

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    attachment: null as File | null,
    applied_date: "",
    // l1Approver: "",
    // l2Approver: "",
  })
  // Load L1 & L2 names from localStorage
  const user = JSON.parse(localStorage.getItem("user_data") || "{}");

  const l1Name = user.emp_l1_name;
  const l2Name = user.emp_l2_name;


  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const leaveTypes = [
    "Casual Leave",
    "Earned Leave",
    "Half Pay Leave",
    "Commuted Leave (Half Pay)",
    "Compensatory Off",
    "Optional Holiday",
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.leaveType) newErrors.leaveType = "Leave type is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (!formData.reason.trim()) newErrors.reason = "Reason is required"
    // if (!formData.l1Approver) newErrors.l1Approver = "Level 1 approver is required"
    // if (!formData.l2Approver) newErrors.l2Approver = "Level 2 approver is required"

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        newErrors.endDate = "End date must be after start date"
      }
    }
    // 🚨 Backdated validation rule
    // 🚨 Backdated validation rule (updated)
    if (formData.startDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const start = new Date(formData.startDate)

      const isHalfPay = formData.leaveType === "Half Pay Leave"
      const isCommuted = formData.leaveType.includes("Commuted")

      if (start < today && !(isHalfPay || isCommuted)) {
        newErrors.startDate =
          "Backdated leave is only allowed for Half Pay Leave or Commuted Leave"
      }
    }


    // if (formData.startDate) {
    //   const today = new Date()
    //   today.setHours(0, 0, 0, 0) // normalize
    //   const start = new Date(formData.startDate)
    //   if (start < today && formData.leaveType !== "Medical Leave") {
    //     newErrors.startDate = "Backdated leave is only allowed for Medical Leave"
    //   }
    // }

    // Attachment is OPTIONAL. If present, validate.
    if (formData.attachment) {
      const f = formData.attachment
      const maxBytes = 10 * 1024 * 1024  // 10MB
      const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"]
      if (!allowed.includes(f.type)) newErrors.attachment = "Only PDF or image files are allowed"
      if (f.size > maxBytes) newErrors.attachment = "File must be ≤ 10MB"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Simulate API call
      // if (!formData.attachment) {
      //   setErrors((prev) => ({ ...prev, attachment: "Attachment is required" }))
      //   setIsSubmitting(false)
      //   return
      // }
      await leaveApi.createLeaveRequest({
        // leave_type: formData.leaveType,
        leave_type:
          formData.leaveType.includes("Commuted")
            ? "Half Pay Leave"
            : formData.leaveType,

        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
        leave_req_emp_id: '',
        attachment: formData.attachment ?? undefined, // optional
        applied_date: new Date().toISOString().split('T')[0],
      })
      // No need to wait if not required, just proceed
      setSubmitStatus("success")
      setTimeout(() => {
        onClose()
        setFormData({
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
          attachment: null,
          applied_date: "",
          // l1Approver: "",
          // l2Approver: "",
        })
        setSubmitStatus("idle")
      }, 2000)
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, attachment: file }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Apply for Leave</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {submitStatus === "success" && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Leave application submitted successfully!</AlertDescription>
            </Alert>
          )}

          {submitStatus === "error" && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to submit leave application. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, leaveType: value }))}
              >
                <SelectTrigger className={errors.leaveType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaveType && <p className="text-sm text-red-500 mt-1">{errors.leaveType}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
              </div>
              {/* L1 & L2 Reporting Officers (Auto-filled from localStorage) */}
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <Label>L1-Immediate RO</Label>
                  <Input
                    type="text"
                    value={user?.emp_l1_name || ""}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed text-[8px]"
                  />
                </div>

                <div>
                  <Label>L2-Next RO</Label>
                  <Input
                    type="text"
                    value={user?.emp_l2_name || ""}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed text-[8px]"
                  />
                </div>
              </div>

              {/* <div>
                <Label>L1 Approver *</Label>
                <SearchableSelect
                  options={approverOptions}
                  value={formData.l1Approver}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, l1Approver: value }))
                  }
                  placeholder="Select L1 Approver"
                />

                {errors.l1Approver && (
                  <p className="text-sm text-red-500 mt-1">{errors.l1Approver}</p>
                )}
              </div> */}
              {/* L2 Approver (after End Date) */}
              {/* <div>
                <Label>L2 Approver *</Label>

                <SearchableSelect
                  options={approverOptions}
                  value={formData.l2Approver}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, l2Approver: value }))
                  }
                  placeholder="Select L2 Approver"
                />

                {errors.l2Approver && (
                  <p className="text-sm text-red-500 mt-1">{errors.l2Approver}</p>
                )}
              </div> */}
            </div>

            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for your leave..."
                value={formData.reason}
                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                className={errors.reason ? "border-red-500" : ""}
                rows={3}
              />
              {errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason}</p>}
            </div>

            <div>
              <Label htmlFor="attachment">Attachment</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="attachment"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="attachment"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleFileChange}
                      />
                      {errors.attachment && <p className="text-sm text-red-500 mt-1">{errors.attachment}</p>}
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                  {formData.attachment && (
                    <p className="text-sm text-green-600 mt-2">Selected: {formData.attachment.name}</p>
                  )}
                </div>
              </div>
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
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
