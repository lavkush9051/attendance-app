"use client"

import { useState, useEffect } from "react"
import { Search, Check, X, Eye, Filter, RefreshCw } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { authApi, attendanceApi } from "@/lib/api"
import { AdminAttendanceReqDetailModal } from "../admin-attendance-req-detail-modal"

interface AttendanceRequest {
  id: string
  employeeName: string
  employeeId: string
  date: string
  originalClockIn?: string
  originalClockOut?: string
  requestedClockIn?: string
  requestedClockOut?: string
  reason: string
  type: "missed-clock-in" | "missed-clock-out" | "wrong-time" | "system-error" | "other"
  status: "pending" | "approved" | "rejected" | "l1 approved"
  appliedDate: string
}

export function AttendanceRequestsTab() {
  const [attendanceRequests, setAttendanceRequests] = useState<AttendanceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<AttendanceRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [selectedAttend, setSelectedAttend] = useState<AttendanceRequest | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  // Mock data - in real app, this would come from API

  // const mockAttendanceRequests: AttendanceRequest[] = [
  //   {
  //     id: "AR001",
  //     employeeName: "Alice Johnson",
  //     employeeId: "EMP001",
  //     date: "2024-03-15",
  //     originalClockOut: "6:00 PM",
  //     requestedClockIn: "9:00 AM",
  //     reason: "Forgot to clock in due to urgent meeting",
  //     type: "Missed Clock In",
  //     status: "pending",
  //     appliedDate: "2024-03-15",
  //   },
  //   {
  //     id: "AR002",
  //     employeeName: "Bob Smith",
  //     employeeId: "EMP002",
  //     date: "2024-03-14",
  //     originalClockIn: "10:30 AM",
  //     originalClockOut: "6:00 PM",
  //     requestedClockIn: "9:00 AM",
  //     requestedClockOut: "6:00 PM",
  //     reason: "System recorded wrong time due to network issue",
  //     type: "Wrong Time Entry",
  //     status: "pending",
  //     appliedDate: "2024-03-14",
  //   },
  //   {
  //     id: "AR003",
  //     employeeName: "Carol Davis",
  //     employeeId: "EMP003",
  //     date: "2024-03-13",
  //     originalClockIn: "9:00 AM",
  //     requestedClockOut: "6:30 PM",
  //     reason: "Emergency call, forgot to clock out",
  //     type: "Missed Clock Out",
  //     status: "approved",
  //     appliedDate: "2024-03-13",
  //   },
  //   {
  //     id: "AR004",
  //     employeeName: "David Wilson",
  //     employeeId: "EMP004",
  //     date: "2024-03-12",
  //     originalClockIn: "9:00 AM",
  //     originalClockOut: "4:00 PM",
  //     requestedClockOut: "6:00 PM",
  //     reason: "System malfunction during clock out",
  //     type: "System Error",
  //     status: "rejected",
  //     appliedDate: "2024-03-12",
  //   },
  //   {
  //     id: "AR005",
  //     employeeName: "Eva Brown",
  //     employeeId: "EMP005",
  //     date: "2024-03-11",
  //     originalClockIn: "9:30 AM",
  //     requestedClockIn: "9:00 AM",
  //     reason: "Traffic delay, arrived late but worked extra hours",
  //     type: "Late Arrival",
  //     status: "pending",
  //     appliedDate: "2024-03-11",
  //   },
  // ]

  const emp = authApi.getUser();
  useEffect(() => {
    attendanceApi.getRegularizationRequests(emp.emp_id, { admin: true }).then(response => {
      const data = Array.isArray(response)
        ? response
        : (response && typeof response === "object" && "data" in response && Array.isArray((response as any).data))
          ? (response as any).data
          : [];

      const records: AttendanceRequest[] = data.map((item: any) => ({

        id: item.id ?? "",
        employeeName: item.employee_name ?? "",
        employeeId: item.emp_id ?? emp.emp_id,
        date: item.date ?? "",
        originalClockIn: item.original_clock_in ?? "",
        originalClockOut: item.original_clock_out ?? "",
        requestedClockIn: item.requested_clock_in ?? "",
        requestedClockOut: item.requested_clock_out ?? "",
        reason: item.reason ?? "",
        type: item.type ?? "",
        status: item.status ?? "pending",
        appliedDate: item.applied_date ?? "",
      }))
      setIsLoading(true)
      setAttendanceRequests(records)
      setIsLoading(false)
    }).catch(error => {
      console.error("Failed to fetch attendance requests:", error)
      setAttendanceRequests([])
    })
  }, [emp.emp_id])


  // Simulate API call to fetch attendance requests
  // useEffect(() => {
  //   const fetchAttendanceRequests = async () => {
  //     setIsLoading(true)
  //     // Simulate API delay
  //     await new Promise((resolve) => setTimeout(resolve, 1000))
  //     setAttendanceRequests(mockAttendanceRequests)
  //     setIsLoading(false)
  //   }

  //   fetchAttendanceRequests()
  // }, [])

  // Filter requests based on search and filters
  useEffect(() => {
    const filtered = attendanceRequests.filter((request) => {
      const matchesSearch =
        request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.type.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || request.status === statusFilter
      const matchesType = typeFilter === "all" || request.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })

    setFilteredRequests(filtered)
  }, [attendanceRequests, searchTerm, statusFilter, typeFilter])

  // const handleAction = async (requestId: string, action: "approve" | "reject") => {

  //   setProcessingIds((prev) => new Set(prev).add(requestId))

  //   try {
  //     //payload for API call
  //     const payload = {
  //       attendance_request_id: requestId,
  //     }
  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 1500))

  //     // Update the request status
  //     setAttendanceRequests((prev) =>
  //       prev.map((request) =>
  //         request.id === requestId ? { ...request, status: action === "approve" ? "approved" : "rejected" } : request,
  //       ),
  //     )

  //     setActionMessage({
  //       type: "success",
  //       message: `Attendance request ${action === "approve" ? "approved" : "rejected"} successfully!`,
  //     })

  //     // Clear message after 3 seconds
  //     setTimeout(() => setActionMessage(null), 3000)
  //   } catch (error) {
  //     setActionMessage({
  //       type: "error",
  //       message: `Failed to ${action} attendance request. Please try again.`,
  //     })
  //     setTimeout(() => setActionMessage(null), 3000)
  //   } finally {
  //     setProcessingIds((prev) => {
  //       const newSet = new Set(prev)
  //       newSet.delete(requestId)
  //       return newSet
  //     })
  //   }
  // }
  const handleAction = async (requestId: string, action: "approve" | "reject") => {
    // mark this row as processing
    if (processingIds.has(requestId)) return
    setProcessingIds((prev) => new Set(prev).add(requestId))

    try {

      // Backend expects: { art_id, action, admin_id }
      const payload = {
        attendance_request_id: Number(requestId),       // convert to number if your ids are numeric
        action,                          // "approve" | "reject"
        admin_id: Number(emp.emp_id), // convert to number if your admin_id is numeric
      }

      // call your attendance action API (must be implemented similar to leaveApi.actionLeaveRequest)
      const res = await attendanceApi.actionAttendanceRequest(payload)

      // normalize success check (covers ApiResponse shapes or plain objects)
      const ok =
        (res && (res as any).status === "success") ||
        (res && (res as any).data && (res as any).data.status === "success") ||
        (res && (res as any).success === true)

      if (!ok) {
        const errMsg =
          ((res as any)?.data?.error) ||
          ((res as any)?.error) ||
          "Failed to update attendance request"
        throw new Error(errMsg)
      }

      // optimistic UI update
      setAttendanceRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? { ...request, status: action === "approve" ? "approved" : "rejected" }
            : request,
        ),
      )

      setActionMessage({
        type: "success",
        message: `Attendance request ${action === "approve" ? "approved" : "rejected"} successfully!`,
      })

      // Clear success message
      setTimeout(() => setActionMessage(null), 3000)
    } catch (error: any) {
      setActionMessage({
        type: "error",
        message:
          (error?.message as string) ||
          `Failed to ${action} attendance request. Please try again.`,
      })
      setTimeout(() => setActionMessage(null), 3000)
    } finally {
      // unmark processing
      setProcessingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const handleViewDetails = (request: AttendanceRequest) => {
    setSelectedAttend(request)
    setIsDetailModalOpen(true)
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const pendingCount = attendanceRequests.filter((r) => r.status === "pending").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading attendance requests...</span>
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
          <h2 className="text-xl font-semibold text-gray-900">Attendance Requests</h2>
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
                  placeholder="Search by employee name, ID, or request type..."
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
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Request Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Missed Clock In">Missed Clock In</SelectItem>
                <SelectItem value="Missed Clock Out">Missed Clock Out</SelectItem>
                <SelectItem value="Wrong Time Entry">Wrong Time Entry</SelectItem>
                <SelectItem value="System Error">System Error</SelectItem>
                <SelectItem value="Late Arrival">Late Arrival</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendance Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance requests found</p>
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
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Clock In</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Clock Out</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
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
                            <span className="text-gray-700">{formatDate(request.date)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              {request.originalClockIn && (
                                <div className="text-gray-500 line-through">{request.originalClockIn}</div>
                              )}
                              {request.requestedClockIn && (
                                <div className="text-green-600 font-medium">{request.requestedClockIn}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              {request.originalClockOut && (
                                <div className="text-gray-500 line-through">{request.originalClockOut}</div>
                              )}
                              {request.requestedClockOut && (
                                <div className="text-green-600 font-medium">{request.requestedClockOut}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">{request.type}</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              {(request.status.toLowerCase() === "pending" || request.status.toLowerCase() === "l1 approved") ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAction(request.id, "approve")}
                                    disabled={processingIds.has(request.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {processingIds.has(request.id) ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleAction(request.id, "reject")}
                                    disabled={processingIds.has(request.id)}
                                  >
                                    {processingIds.has(request.id) ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <X className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(request)}>
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => handleViewDetails(request)}>
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
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
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">{formatDate(request.date)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Type:</span>
                          <span className="text-gray-900">{request.type}</span>
                        </div>
                        {request.requestedClockIn && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Requested Clock In:</span>
                            <span className="font-medium text-green-600">{request.requestedClockIn}</span>
                          </div>
                        )}
                        {request.requestedClockOut && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Requested Clock Out:</span>
                            <span className="font-medium text-green-600">{request.requestedClockOut}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Reason:</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{request.reason}</p>
                      </div>

                      {request.status.toLowerCase() === "pending" ? (
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
                            View Details
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={() => handleViewDetails(request)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <AdminAttendanceReqDetailModal
        onCancelAttendance={() => handleAction(selectedAttend?.id || "", "reject")}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={selectedAttend
          ? {
            id: selectedAttend.id,
            empId: selectedAttend.employeeId,
            empName: selectedAttend.employeeName,
            date: selectedAttend.date,
            originalClockIn: selectedAttend.originalClockIn,
            originalClockOut: selectedAttend.originalClockOut,
            requestedClockIn: selectedAttend.requestedClockIn,
            requestedClockOut: selectedAttend.requestedClockOut,
            reason: selectedAttend.reason,
            type: selectedAttend.type,
            status:
                selectedAttend.status === "l1 approved"
                  ? "approved"
                  : selectedAttend.status,
            appliedDate: selectedAttend.appliedDate
          }
          : null
        }
      />
    </div>
  )
}
