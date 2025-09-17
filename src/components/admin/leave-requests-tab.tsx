"use client"

import { useState, useEffect } from "react"
import { Search, Check, X, Eye, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authApi, leaveApi } from "@/lib/api"
import { LeaveDetailModal } from "../leave-detail-modal"
import { AdminLeaveReqDetailModal } from "../admin-leave-req-detail-modal"
import { set } from "date-fns"


interface LeaveRequest {
  id: string
  employeeName: string
  employeeId: string
  leaveType: string
  fromDate: string
  toDate: string
  days: number
  reason: string
  status: "pending" | "approved" | "rejected" | "l1 approved"
  appliedDate: string
  attachment?: string
  remarks?: string
}

export function LeaveRequestsTab() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const emp = authApi.getUser()

  // Mock data - in real app, this would come from API
  useEffect(() => {
    leaveApi.getEmployeeLeaveRequests(emp.emp_id, { admin: true }).then(response => {
      const data = Array.isArray(response)
        ? response
        : (response && typeof response === "object" && "data" in response && Array.isArray((response as any).data))
          ? (response as any).data
          : [];
      const records: LeaveRequest[] = data.map((item: any) => ({
        id: item.id ?? "",
        employeeName: item.employee_name ?? "",
        employeeId: item.emp_id ?? emp.emp_id,
        leaveType: item.leave_type_name ?? "",
        fromDate: item.start_date ?? "",
        toDate: item.end_date ?? "",
        days:
          (item.start_date && item.end_date)
            ? ((new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 1,
        reason: item.reason ?? "",
        status: item.status?.toLowerCase() ?? "pending",
        appliedDate: item.applied_date ?? "",
        attachment: item.attachment,
        remarks: item.remarks ?? "",
      }))
      console.log("Fetched all leave requests:", records)
      setIsLoading(true)
      // Simulate API delay
      //await new Promise((resolve) => setTimeout(resolve, 1000))
      setLeaveRequests(records)
      setIsLoading(false)
      //setLeaveRequests(records)


    }).catch(error => {
      console.error("Failed to fetch leave requests:", error)
      setLeaveRequests([])
      setIsLoading(false)
    })
  }, [emp.emp_id])

  useEffect(() => {
    const filtered = leaveRequests.filter((request) => {
      const matchesSearch =
        request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.leaveType.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || request.status === statusFilter
      const matchesType = typeFilter === "all" || request.leaveType === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })

    setFilteredRequests(filtered)
  }, [leaveRequests, searchTerm, statusFilter, typeFilter])

  // Handle approve/reject action
  const handleAction = async (requestId: string, action: "approve" | "reject", remarks?: string) => {
    // prevent double-action on same row
    if (processingIds.has(requestId)) return

    setProcessingIds((prev) => {
      const s = new Set(prev)
      s.add(requestId)
      return s
    })

    try {
      // Build payload backend wants
      const payload = {
        leave_req_id: Number(requestId),          // <-- must be number
        action,                                   // "approve" | "reject"
        admin_id: Number(emp.emp_id),             // acting admin (L1/L2)
        remarks: remarks || "", //action === "reject" ? "Rejected by admin" : "Approved by admin", // optional
      }

      const res = await leaveApi.actionLeaveRequest(payload)

      // apiClient returns { success, data, message }
      // backend returns { status: "success" } on success
      const ok = res && res.success !== false && res.data && (res.data as any).status === "success"
      if (!ok) {
        const msg = (res && (res as any).message) || "Failed to update leave request"
        throw new Error(msg)
      }

      // Optimistically update local UI.
      // Backend may set intermediate "L1 Approved" — your UI only shows pending/approved/rejected,
      // so we convert approve -> "approved", reject -> "rejected".
      const nextStatus: "approved" | "rejected" = action === "approve" ? "approved" : "rejected"

      setLeaveRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: nextStatus } : r)),
      )

      setActionMessage({
        type: "success",
        message: `Leave request ${action === "approve" ? "approved" : "rejected"} successfully!`,
      })
      setTimeout(() => setActionMessage(null), 3000)
      setIsDetailModalOpen(false) // close modal if open
    } catch (err: any) {
      setActionMessage({
        type: "error",
        message: err?.message || `Failed to ${action} leave request. Please try again.`,
      })
      setTimeout(() => setActionMessage(null), 3000)
    } finally {
      setProcessingIds((prev) => {
        const s = new Set(prev)
        s.delete(requestId)
        return s
      })
    }
  }

  const handleViewDetails = (leave: LeaveRequest) => {
    setSelectedLeave(leave)
    setIsDetailModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "l1 approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { // need to check 
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const pendingCount = leaveRequests.filter((r) => r.status === "pending").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading leave requests...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Message */}
      {actionMessage && (
        <Alert
          className={actionMessage.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          <AlertDescription className={actionMessage.type === "success" ? "text-green-800" : "text-red-800"}>
            {actionMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leave Requests</h2>
          <p className="text-sm text-gray-600 mt-1">
            {pendingCount} pending request{pendingCount !== 1 ? "s" : ""} require your attention
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by employee name, ID, or leave type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="l1 approved">L1 Approved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Leave Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leave Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leave requests found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Leave Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">From Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">To Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Days</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{request.employeeName}</p>
                              <p className="text-sm text-gray-500">{request.employeeId}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">{request.leaveType}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">{formatDate(request.fromDate)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">{formatDate(request.toDate)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">{request.days}</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(request.status.toLowerCase())}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Button size="sm" variant="outline" className="bg-transparent" onClick={() => handleViewDetails(request)}>
                              <Eye className="h-3 w-3 mr-2" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{request.employeeName}</h3>
                          <p className="text-sm text-gray-600">{request.employeeId}</p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Leave Type:</span>
                          <span className="text-gray-900">{request.leaveType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="text-gray-900">
                            {formatDate(request.fromDate)} - {formatDate(request.toDate)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Days:</span>
                          <span className="font-medium text-gray-900">{request.days}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Reason:</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{request.reason}</p>
                      </div>

                      {/* {(request.status === "pending" || request.status === "l1 approved") ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(request.id, "approve")}
                            disabled={processingIds.has(request.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processingIds.has(request.id) ? (
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(request.id, "reject")}
                            disabled={processingIds.has(request.id)}
                            className="flex-1"
                          >
                            {processingIds.has(request.id) ? (
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                          <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={() => handleViewDetails(request)}>
                            <Eye className="h-4 w-4 mr-2" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={() => handleViewDetails(request)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      )} */}
                      <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={() => handleViewDetails(request)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Leave Detail Modal */}
      {/* <AdminLeaveReqDetailModal
        onCancelLeave = {() => handleAction(selectedLeave?.id || "", "reject")}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        leave={
          selectedLeave
            ? {
              // Map LeaveRequest to LeaveRecord
              id: selectedLeave.id,
              empId: selectedLeave.employeeId,
              type: selectedLeave.leaveType,
              startDate: selectedLeave.fromDate,
              endDate: selectedLeave.toDate,
              days: selectedLeave.days,
              reason: selectedLeave.reason,
              status:
                selectedLeave.status === "l1 approved"
                  ? "approved"
                  : selectedLeave.status,
              appliedDate: selectedLeave.appliedDate,
              attachment: selectedLeave.attachment,
              empName: selectedLeave.employeeName, // Assuming empName is same as employeeName
            }
            : null
        }
      /> */}
      <AdminLeaveReqDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        leave={
          selectedLeave
            ? {
              id: selectedLeave.id,
              empId: selectedLeave.employeeId,
              type: selectedLeave.leaveType,
              startDate: selectedLeave.fromDate,
              endDate: selectedLeave.toDate,
              days: selectedLeave.days,
              reason: selectedLeave.reason,
              status: selectedLeave.status, // keep l1 approved as-is
              appliedDate: selectedLeave.appliedDate,
              attachment: selectedLeave.attachment,
              empName: selectedLeave.employeeName,
              remarks: selectedLeave.remarks || "",
            }
            : null
        }
        onApprove={(remarks?: string) =>
          handleAction(selectedLeave?.id || "", "approve", remarks)
        }
        onReject={(remarks?: string) =>
          handleAction(selectedLeave?.id || "", "reject", remarks)
        }
        onCancelLeave={() => setIsDetailModalOpen(false)} // ✅ cancel just closes modal
      />
    </div>
  )
}
