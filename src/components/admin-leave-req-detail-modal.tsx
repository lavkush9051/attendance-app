"use client"

import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { X, Calendar, Clock, FileText, User, Download, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { leaveApi, authApi } from "@/lib/api"

interface LeaveRecord {
  id: string
  type: string
  startDate: string
  endDate: string
  days: number
  status: "approved" | "pending" | "rejected" | "cancelled" | "l1 approved"
  reason: string
  appliedDate: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
  attachment?: string
  empId?: string
  empName: string
  remarks?: string
}

interface LeaveDetailModalProps {
  isOpen: boolean
  onClose: () => void
  leave: LeaveRecord | null
  onCancelLeave: () => void
  onApprove?: (remarks: string) => void
  onReject?: (remarks: string) => void
}

export function AdminLeaveReqDetailModal({ isOpen, onClose, leave, onCancelLeave, onApprove, onReject }: LeaveDetailModalProps) {
  const [remarks, setRemarks] = useState("")
  useEffect(() => { setRemarks("") }, [isOpen])

  if (!isOpen || !leave) return null
  const todaydate = new Date().toISOString().split("T")[0]

  type AttItem = { id: number; original_name: string; mime_type: string; size_bytes: number; url: string }
  const [attachments, setAttachments] = useState<AttItem[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!isOpen || !leave) return
      try {
        const me = authApi.getUser()
        // getAttachmentMeta returns an ARRAY already
        const items = await leaveApi.getAttachmentMeta(leave.id, Number(leave.empId ?? me?.emp_id))
        if (mounted) setAttachments(items)
      } catch {
        if (mounted) setAttachments([])
      }
    }
    load()
    return () => { mounted = false }
  }, [isOpen, leave?.id])  // use leave.id so it doesn't re-run unnecessarily

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200"
      case "pending":  return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      case "cancelled":return "bg-gray-100 text-gray-800 border-gray-200"
      case "l1 approved": return "bg-blue-100 text-blue-800 border-blue-200"
      default:         return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-5 w-5 text-green-500" />
      case "pending":  return <Clock className="h-5 w-5 text-yellow-500" />
      case "rejected": return <AlertCircle className="h-5 w-5 text-red-500" />
      case "cancelled":return <X className="h-5 w-5 text-gray-500" />
      case "l1 approved": return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:         return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  const formatShortDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  async function handleDownload(att: { id: number; url: string }) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"
    const cleaned = att.url.replace(/\/attachment\/\d+(\?|$)/, "/attachment$1")
    const url = `${base}${cleaned}`

    console.log("Downloading from URL:", url, "attr:", att )

    // If you fixed CORS origins and need cookies:
    // const resp = await fetch(url, { credentials: "include" })
    // If you didn’t fix CORS and don’t need cookies:
    const resp = await fetch(url, { credentials: "omit" })

    if (!resp.ok) throw new Error("Failed to download attachment")

    const cd = resp.headers.get("Content-Disposition") || ""
    const m = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(cd)
    const filename = m ? decodeURIComponent(m[1]) : "attachment"

    const blob = await resp.blob()
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
  }

// ✅ Action logic: Buttons visible until 11:59 PM before start date, unless rejected
  const canTakeAction = () => {
    const start = new Date(leave.startDate)
    const cutoff = new Date(start)
    cutoff.setDate(cutoff.getDate() - 1)
    cutoff.setHours(23, 59, 59, 999)
 
    const now = new Date()
 
    // hide if rejected OR cutoff time passed
    if (leave.status === "rejected") return false
    if (leave.status === "cancelled") return false
    return now <= cutoff
  }
 
  const isActionable = canTakeAction()
  // IMPORTANT: Build only the *new* remark for this action (do NOT prepend existing trail)
  const buildNewRemark = (action: "Approved" | "Rejected") => {
    const actor = leave.status === "pending" ? "L1 Manager" : "L2 Manager"
    const trimmed = remarks.trim()
    return `${actor} (${action}) - ${trimmed}`
  }  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex items-start justify-between">
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
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(leave.status)}
              <div>
                <p className="font-medium text-gray-900">Current Status</p>
                <p className="text-sm text-gray-600">
                  {leave.status === "approved" && leave.approvedDate && `Approved on ${formatShortDate(leave.approvedDate)}`}
                  {leave.status === "pending" && "Awaiting approval"}
                  {leave.status === "l1 approved" && leave.approvedDate && `L1 Approved on ${formatShortDate(leave.approvedDate)}`}
                  {leave.status === "rejected" && "Application rejected"}
                  {leave.status === "cancelled" && "Application cancelled"}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(leave.status)}>
              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
            </Badge>
          </div>

          {/* Info */}
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
                      <p className="font-medium text-gray-900">{leave.days} day{leave.days > 1 ? "s" : ""}</p>
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

          {/* Attachments */}
          {attachments.length > 0 ? (
            <>
              <Separator />
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Attachment</h3>
                <div className="space-y-2">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{att.original_name}</p>
                          <p className="text-sm text-gray-600">{att.mime_type} • {(att.size_bytes / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(att)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <Separator />
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                No attachment uploaded.
              </div>
            </>
          )}

          {/* Action Buttons */}
          {/* <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">Close</Button>
            {leave.startDate > todaydate && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => { onCancelLeave(); setTimeout(onClose, 2000) }}
              >
                Cancel Leave
              </Button>
            )}
          </div> */}
          {/* ✅ Previous Approvals */}
          {leave.remarks && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Previous Remarks</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line">
                {leave.remarks}
              </div>
            </div>
          )}
 
          {/* Remark Input - always visible, optional, 150 chars */}
          <Separator />
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Remark (Optional, max 150 characters)</h3>
            <Textarea
              placeholder="Add a remark for approval/rejection..."
              value={remarks}
              // value={leave.remarks || remarks}
              onChange={(e) => setRemarks(e.target.value.slice(0, 150))}
              className="min-h-[80px]"
            />
            <p className="text-xs text-gray-500 mt-1">{remarks.length}/150</p>
          </div>
 
          {/* Action Buttons (approve/reject) if actionable, otherwise Close for final states */}
          {isActionable ? (
            <div className="flex space-x-3 pt-4">
              {/* <Button className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() =>  onApprove(buildNewRemark("Approved"))}>
                Approve
              </Button> */}
              <Button className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const newRemark = buildNewRemark("Approved");
                  console.log("Sending remarks to backend:", newRemark); // ✅ yaha log
                  onApprove?.(newRemark);
                }}>
                Approve
              </Button>
 
              {/* <Button variant="destructive" className="flex-1"
               onClick={() =>onReject(buildNewRemark("Rejected"))}>
                Reject
              </Button> */}
              <Button variant="destructive" className="flex-1"
                onClick={() => {
                  const newRemark = buildNewRemark("Rejected");
                  console.log("Sending remarks to backend:", newRemark);
                  onReject?.(newRemark);
                }}>
                Reject
              </Button>
 
            </div>
          ) : (
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}          
        </CardContent>
      </Card>
    </div>
  )
}
