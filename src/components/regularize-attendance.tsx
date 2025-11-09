"use client"

import { useEffect, useState } from "react"
import { Search, Clock, CheckCircle, XCircle, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RegularizeDetailModal } from "./regularize-detail-modal"
import { NewRegularizeModal } from "./new-regularize-modal"
import { authApi } from "@/lib/api/auth"
import { attendanceApi } from "@/lib/api"

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

export function RegularizeAttendance() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<RegularizeRecord | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isNewRegularizeOpen, setIsNewRegularizeOpen] = useState(false)

  const [regularizeRecords, setRegularizeRecords] = useState<RegularizeRecord[]>([])
  const emp = authApi.getUser();
  console.log("Employee data:for regularize", emp)

  useEffect(() => {
    attendanceApi.getRegularizationRequests(emp.emp_id)
    .then(response  => { 
      const data = Array.isArray(response)
        ? response
        : (response && typeof response === "object" && "data" in response && Array.isArray((response as any).data))
        ? (response as any).data
        : [];
      const records: RegularizeRecord[] = data.map((item: any) => ({
        id: item.id,
        date: item.date ?? "",
        type: item.type ?? "other",
        originalClockIn: item.original_clock_in ?? "",
        originalClockOut: item.original_clock_out ?? "",
        requestedClockIn: item.requested_clock_in ?? "",
        requestedClockOut: item.requested_clock_out ?? "",
        reason: item.reason ?? "",
        status: item.status ?? "pending",
        appliedDate: item.applied_date ?? "",
        approvedBy: item.approved_by ?? "",
        approvedDate: item.approved_date ?? "",
        rejectionReason: item.rejection_reason ?? "",
        shift: item.shift ?? ""
      }))
      console.log("Fetched regularization records:", records)
      setRegularizeRecords(records)
    })
    .catch(error => { 
      console.error(`Failed to fetch regularization requests for user ${emp.emp_id}:`, error)
      setRegularizeRecords([]);
    });
  }, [])  
    // Fetch regularization records from API


  // Mock data
  // Replace with actual API call
  // const regularizeRecords1: RegularizeRecord[] = [
  //   {
  //     id: "REG001",
  //     date: "2024-01-15",
  //     type: "missed-clock-in",
  //     originalClockOut: "6:00 PM",
  //     requestedClockIn: "9:00 AM",
  //     reason: "Forgot to clock in due to urgent meeting",
  //     status: "approved",
  //     appliedDate: "2024-01-15",
  //     approvedBy: "Sarah Johnson",
  //     approvedDate: "2024-01-16",
  //   },
  //   {
  //     id: "REG002",
  //     date: "2024-01-20",
  //     type: "wrong-time",
  //     originalClockIn: "10:30 AM",
  //     originalClockOut: "6:00 PM",
  //     requestedClockIn: "9:00 AM",
  //     requestedClockOut: "6:00 PM",
  //     reason: "System recorded wrong time due to network issue",
  //     status: "pending",
  //     appliedDate: "2024-01-21",
  //   },
  //   {
  //     id: "REG003",
  //     date: "2024-01-25",
  //     type: "missed-clock-out",
  //     originalClockIn: "9:00 AM",
  //     requestedClockOut: "6:30 PM",
  //     reason: "Emergency call, forgot to clock out",
  //     status: "rejected",
  //     appliedDate: "2024-01-26",
  //     rejectionReason: "No supporting evidence provided",
  //   },
  //   {
  //     id: "REG004",
  //     date: "2024-02-01",
  //     type: "system-error",
  //     originalClockIn: "9:00 AM",
  //     originalClockOut: "4:00 PM",
  //     requestedClockOut: "6:00 PM",
  //     reason: "System malfunction during clock out",
  //     status: "approved",
  //     appliedDate: "2024-02-02",
  //     approvedBy: "Mike Chen",
  //     approvedDate: "2024-02-02",
  //   },
  // ]

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredRecords = regularizeRecords.filter((record) => {
    const matchesSearch =
     // record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeLabel(record.type).toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    const matchesType = typeFilter === "all" || record.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewDetails = (record: RegularizeRecord) => {
    setSelectedRecord(record)
    setIsDetailModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Summary statistics
  const totalRequests = regularizeRecords.length
  const approvedRequests = regularizeRecords.filter((r) => r.status.toLowerCase() === "approved").length
  const pendingRequests = regularizeRecords.filter((r) => r.status.toLowerCase() === "pending").length
  const rejectedRequests = regularizeRecords.filter((r) => r.status.toLowerCase() === "rejected").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regularize Attendance</h1>
          <p className="text-sm text-gray-600 mt-1">Submit and track attendance regularization requests</p>
        </div>
        <Button onClick={() => setIsNewRegularizeOpen(true)} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{approvedRequests}</p>
                <p className="text-sm font-medium text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
                <p className="text-sm font-medium text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{rejectedRequests}</p>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by ID, type, or reason..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="missed-clock-in">Missed Clock In</SelectItem>
                <SelectItem value="missed-clock-out">Missed Clock Out</SelectItem>
                <SelectItem value="wrong-time">Wrong Time Entry</SelectItem>
                <SelectItem value="system-error">System Error</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Regularization Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regularization Requests ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No regularization requests found</p>
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
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Request ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                        {/* <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th> */}
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Time Changes</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Applied</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">{record.id}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">{formatDate(record.date)}</span>
                          </td>
                          {/* <td className="py-4 px-4">
                            <span className="text-gray-700">{getTypeLabel(record.type)}</span>
                          </td> */}
                          <td className="py-4 px-4">
                            <div className="text-sm space-y-1">
                              {record.requestedClockIn && (
                                <div className="text-gray-900">In: {record.requestedClockIn}</div>
                              )}
                              {record.requestedClockOut && (
                                <div className="text-gray-900">Out: {record.requestedClockOut}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusColor(record.status)}>
                              <span className="mr-1">{getStatusIcon(record.status)}</span>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{formatDate(record.appliedDate)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(record)}>
                              <Eye className="h-4 w-4 mr-1" />
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
                {filteredRecords.map((record) => (
                  <Card key={record.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{record.id}</h3>
                          {/* <p className="text-sm text-gray-600">{getTypeLabel(record.type)}</p> */}
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">{formatDate(record.date)}</span>
                        </div>
                        {record.requestedClockIn && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Requested Clock In:</span>
                            <span className="font-medium text-gray-900">{record.requestedClockIn}</span>
                          </div>
                        )}
                        {record.requestedClockOut && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Requested Clock Out:</span>
                            <span className="font-medium text-gray-900">{record.requestedClockOut}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Applied:</span>
                          <span className="text-gray-900">{formatDate(record.appliedDate)}</span>
                        </div>
                      </div>

                      {/* <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Reason:</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{record.reason}</p>
                      </div> */}

                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(record)} className="w-full">
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

      {/* Modals */}
      <RegularizeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={selectedRecord}
      />

      <NewRegularizeModal isOpen={isNewRegularizeOpen} onClose={() => setIsNewRegularizeOpen(false)} />
    </div>
  )
}
