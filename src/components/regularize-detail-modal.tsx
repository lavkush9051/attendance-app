"use client"

import { X, Calendar, Clock, AlertCircle, CheckCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface RegularizeRecord {
  id: string
  date: string
  type: "missed-clock-in" | "missed-clock-out" | "wrong-time" | "system-error" | "other"
  originalClockIn?: string
  originalClockOut?: string
  requestedClockIn?: string
  requestedClockOut?: string
  reason: string
  status: "approved" | "pending" | "rejected"
  appliedDate: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
  shift?: string
}

interface RegularizeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: RegularizeRecord | null
}

export function RegularizeDetailModal({ isOpen, onClose, record }: RegularizeDetailModalProps) {
  if (!isOpen || !record) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
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
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "missed-clock-in":
        return "Missed Clock In"
      case "missed-clock-out":
        return "Missed Clock Out"
      case "wrong-time":
        return "Wrong Time Entry"
      case "system-error":
        return "System Error"
      case "other":
        return "Other"
      default:
        return type
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
              <CardTitle className="text-xl">Regularization Request Details</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Request ID: {record.id}</p>
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
              {getStatusIcon(record.status)}
              <div>
                <p className="font-medium text-gray-900">Current Status</p>
                <p className="text-sm text-gray-600">
                  {record.status === "approved" &&
                    record.approvedDate &&
                    `Approved on ${formatShortDate(record.approvedDate)}`}
                  {record.status === "pending" && "Awaiting approval"}
                  {record.status === "rejected" && "Request rejected"}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(record.status)}>
              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            </Badge>
          </div>

          {/* Request Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Request Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">{formatShortDate(record.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium text-gray-900">{getTypeLabel(record.type)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Shift</p>
                      <p className="font-medium text-gray-900">{record.shift}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Applied On</p>
                      <p className="font-medium text-gray-900">{formatShortDate(record.appliedDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Time Changes</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  {record.originalClockIn && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Original Clock In:</span>
                      <span className="font-medium text-blue-900">{record.originalClockIn}</span>
                    </div>
                  )}
                  {record.requestedClockIn && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Requested Clock In:</span>
                      <span className="font-medium text-blue-900">{record.requestedClockIn}</span>
                    </div>
                  )}
                  {record.originalClockOut && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Original Clock Out:</span>
                      <span className="font-medium text-blue-900">{record.originalClockOut}</span>
                    </div>
                  )}
                  {record.requestedClockOut && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Requested Clock Out:</span>
                      <span className="font-medium text-blue-900">{record.requestedClockOut}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Reason for Regularization</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700">{record.reason}</p>
            </div>
          </div>

          {/* Approval/Rejection Information */}
          {(record.status === "approved" || record.status === "rejected") && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  {record.status === "approved" ? "Approval" : "Rejection"} Details
                </h3>
                <div className="space-y-3">
                  {record.approvedBy && (
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {record.status === "approved" ? "Approved By" : "Reviewed By"}
                        </p>
                        <p className="font-medium text-gray-900">{record.approvedBy}</p>
                      </div>
                    </div>
                  )}

                  {record.approvedDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {record.status === "approved" ? "Approved On" : "Reviewed On"}
                        </p>
                        <p className="font-medium text-gray-900">{formatShortDate(record.approvedDate)}</p>
                      </div>
                    </div>
                  )}

                  {record.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-600 mb-1">Rejection Reason</p>
                      <p className="text-red-800">{record.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Close
            </Button>
            {record.status === "pending" && (
              <Button variant="destructive" className="flex-1">
                Cancel Request
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
