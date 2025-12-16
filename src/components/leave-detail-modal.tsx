"use client"

import { X, Calendar, Clock, FileText, User, Download, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "./ui/textarea"
import { authApi, leaveApi } from "@/lib/api"
import { useState } from "react"

interface LeaveRecord {
  id: string
  type: string
  startDate: string
  endDate: string
  days: number
  status: "approved" | "pending" | "rejected" | "cancelled"
  reason: string
  appliedDate: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
  attachment?: string
  remarks?: string
}

interface LeaveDetailModalProps {
  isOpen: boolean
  onClose: () => void
  leave: LeaveRecord | null
  onCancelled?: () => void
}

export function LeaveDetailModal({ isOpen, onClose, leave, onCancelled }: LeaveDetailModalProps) {

  const [isCancelling, setIsCancelling] = useState(false);

  if (!isOpen || !leave) return null

  // // --- Cancel eligibility validation ---
  const isCancellable = () => {
    // const now = new Date()
    // const leaveStart = new Date(leave.startDate)

    // // Deadline = today 11:59:59 PM
    // const deadline = new Date(now)
    // deadline.setHours(23, 59, 59, 999)

    // // condition: leave should start after today
    // // and cancellation must be before today's 11:59 PM
    // return leaveStart > now && now <= deadline
    return true
  }
  const isRevokeVisible = () => {
      const status = leave.status?.toLowerCase()
      return status !== "cancelled" && status !== "rejected" && isCancellable() && status === "pending" || status === "approved" || status === "l1 approved"

  }

  // --- Handle cancel click ---
  const handleCancel = async () => {
    if (!isCancellable()) {
      alert(
        "You can cancel any upcoming leave only until 11:59 PM of the current day."
      )
      return
    }

    try {
      setIsCancelling(true)
      const emp = authApi.getUser()

      console.log("Current logged in employee:", emp)
      console.log("emp_id picked:", emp.emp_id)

      const payload = {
        leave_req_id: Number(leave.id),
        action: "cancel", // ✅ send only cancelled action
        admin_id: Number(emp.emp_id),
        remarks: "Cancelled by user",
      } as any
      console.log("Cancel leave payload:", payload)

      const res = await leaveApi.actionLeaveRequest(payload)
      console.log("API response for cancel:", res)

      const ok = res && res.success !== false && res.data && (res.data as any).status === "success"
      if (!ok) {
        throw new Error((res && (res as any).message) || "Failed to cancel leave request")
      }

      alert("Leave request cancelled successfully!")

      if (onCancelled) onCancelled()
      onClose()
    } catch (err: any) {
      alert(err?.message || "Failed to cancel leave. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "cancelled":
        return <X className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Leave Application Details</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Application ID: {leave.id}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(leave.status)}
              <div>
                <p className="font-medium text-gray-900">Current Status</p>
                <p className="text-sm text-gray-600">
                  {leave.status === "approved" &&
                    leave.approvedDate &&
                    `Approved on ${formatShortDate(leave.approvedDate)}`}
                  {leave.status === "pending" && "Awaiting approval"}
                  {leave.status === "rejected" && "Application rejected"}
                  {leave.status === "cancelled" && "Application cancelled"}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(leave.status)}>
              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
            </Badge>
          </div>

          {/* Leave Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Leave Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Leave Type</p>
                      <p className="font-medium text-gray-900">{leave.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium text-gray-900">
                        {leave.days} day{leave.days > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Applied On</p>
                      <p className="font-medium text-gray-900">{formatShortDate(leave.appliedDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Date Range</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-blue-600">Start Date</p>
                      <p className="font-medium text-blue-900">{formatDate(leave.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">End Date</p>
                      <p className="font-medium text-blue-900">{formatDate(leave.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Reason for Leave</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700">{leave.reason}</p>
            </div>
          </div>

          {/* Approval Information */}
          {(leave.status === "approved" || leave.status === "rejected") && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  {leave.status === "approved" ? "Approval" : "Rejection"} Details
                </h3>
                <div className="space-y-3">
                  {leave.approvedBy && (
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {leave.status === "approved" ? "Approved By" : "Reviewed By"}
                        </p>
                        <p className="font-medium text-gray-900">{leave.approvedBy}</p>
                      </div>
                    </div>
                  )}

                  {leave.approvedDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {leave.status === "approved" ? "Approved On" : "Reviewed On"}
                        </p>
                        <p className="font-medium text-gray-900">{formatShortDate(leave.approvedDate)}</p>
                      </div>
                    </div>
                  )}

                  {leave.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-600 mb-1">Rejection Reason</p>
                      <p className="text-red-800">{leave.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Attachment */}
          {leave.attachment && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Attachment</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{leave.attachment}</p>
                      <p className="text-sm text-gray-600">PDF Document</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </>
          )}
            {/* <h3 className="font-medium text-gray-900 mb-2">Remark (Optional, max 150 characters)</h3>
            <Textarea
              placeholder="Add a remark for approval/rejection..."
              value={leave.remarks || ""}
            // value={leave.remarks || remarks}
            /> */}
            {/* Remarks Section - only visible when not pending */}
            {leave.status !== "pending" && leave.remarks && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Remark</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {/* <p className="text-gray-700">{leave.remarks}</p> */}
                  <pre className="text-gray-700 whitespace-pre-line">
                    {leave.remarks}
                  </pre>
                </div>
              </div>
            )}
            
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Close
            </Button>

            {isRevokeVisible() && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Revoke"}
              </Button>
            )}
          </div>
          {/* Action Buttons */}
          {/* <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Close
            </Button>
            {leave.status === "pending" && (
              <Button variant="destructive" className="flex-1">
                Cancel Application
              </Button>
            )}
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}
