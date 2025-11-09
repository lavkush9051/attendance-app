"use client"

import { useState } from "react"
import { Search, Calendar, Clock, FileText, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LeaveDetailModal } from "./leave-detail-modal"
import { leaveApi } from "@/lib/api"
import { useEffect } from "react"
import { authApi } from "@/lib/api"

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

export function LeaveHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedLeave, setSelectedLeave] = useState<LeaveRecord | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Mock data - in real app, this would come from API
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const emp = authApi.getUser();
  
  useEffect(() => {
    leaveApi.getEmployeeLeaveRequests(emp.emp_id).then(response => {
      // If the API response is an object with a property containing the array, extract it here
      // For example, if response = { data: [...] }, use response.data
      const data = Array.isArray(response)
        ? response
        : (response && typeof response === "object" && "data" in response && Array.isArray((response as any).data))
        ? (response as any).data
        : [];
      const records: LeaveRecord[] = data.map((item: any) => ({
        id: item.id,
        type: item.leave_type_name,
        startDate: item.start_date,
        endDate: item.end_date,
        days: item.days,
        status: item.status,
        reason: item.reason,
        appliedDate: item.applied_date,
        approvedBy: item.approved_by,
        approvedDate: item.approved_date,
        rejectionReason: item.rejection_reason,
        attachment: item.attachment ? item.attachment.name : undefined,
        remarks: item.remarks,
      }))
      records.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
      console.log("Leave requests:", records)
      setLeaveRecords(records)
    }).catch((error) => {
      console.error("Failed to fetch leave requests for employee 10001:", error);
      setLeaveRecords([]);
    });
  }, [])

  // const leaveRecords: LeaveRecord[] = [
  //   {
  //     id: "LV001",
  //     type: "Annual Leave",
  //     startDate: "2024-01-15",
  //     endDate: "2024-01-19",
  //     days: 5,
  //     status: "approved",
  //     reason: "Family vacation to Goa",
  //     appliedDate: "2024-01-01",
  //     approvedBy: "Sarah Johnson",
  //     approvedDate: "2024-01-02",
  //     attachment: "flight-tickets.pdf",
  //   },
  //   {
  //     id: "LV002",
  //     type: "Sick Leave",
  //     startDate: "2024-02-10",
  //     endDate: "2024-02-12",
  //     days: 3,
  //     status: "approved",
  //     reason: "Fever and flu symptoms",
  //     appliedDate: "2024-02-09",
  //     approvedBy: "Sarah Johnson",
  //     approvedDate: "2024-02-09",
  //     attachment: "medical-certificate.pdf",
  //   },
  //   {
  //     id: "LV003",
  //     type: "Personal Leave",
  //     startDate: "2024-03-05",
  //     endDate: "2024-03-05",
  //     days: 1,
  //     status: "pending",
  //     reason: "Personal work - bank visit",
  //     appliedDate: "2024-03-01",
  //   },
  //   {
  //     id: "LV004",
  //     type: "Emergency Leave",
  //     startDate: "2024-02-20",
  //     endDate: "2024-02-21",
  //     days: 2,
  //     status: "rejected",
  //     reason: "Family emergency",
  //     appliedDate: "2024-02-19",
  //     rejectionReason: "Insufficient documentation provided",
  //   },
  //   {
  //     id: "LV005",
  //     type: "Annual Leave",
  //     startDate: "2024-04-15",
  //     endDate: "2024-04-22",
  //     days: 8,
  //     status: "cancelled",
  //     reason: "Wedding ceremony",
  //     appliedDate: "2024-03-15",
  //   },
  //   {
  //     id: "LV006",
  //     type: "Maternity Leave",
  //     startDate: "2024-05-01",
  //     endDate: "2024-08-01",
  //     days: 90,
  //     status: "approved",
  //     reason: "Maternity leave",
  //     appliedDate: "2024-03-01",
  //     approvedBy: "HR Department",
  //     approvedDate: "2024-03-05",
  //     attachment: "medical-certificate.pdf",
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
      case "Cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "L1 Approved":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return "✓"
      case "L1 Approved":
        return "✓"
      case "Pending":
        return "⏳"
      case "Rejected":
        return "✗"
      case "Cancelled":
        return "⊘"
      default:
        return "?"
    }
  }

  const filteredRecords = leaveRecords.filter((record) => {
    const matchesSearch =
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    const matchesType = typeFilter === "all" || record.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

  const handleViewDetails = (leave: LeaveRecord) => {
    setSelectedLeave(leave)
    setIsDetailModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  // Summary statistics
  const totalLeaves = leaveRecords.length
  const approvedLeaves = leaveRecords.filter((l) => l.status.toLowerCase() === "approved").length
  const pendingLeaves = leaveRecords.filter((l) => l.status.toLowerCase() === "pending").length
  const totalDaysTaken = leaveRecords.filter((l) => l.status.toLowerCase() === "approved").reduce((sum, l) => sum + l.days, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave History</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage your leave applications</p>
        </div>
        {/* <Button className="mt-4 sm:mt-0">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button> */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{totalLeaves}</p>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{approvedLeaves}</p>
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
                <p className="text-2xl font-bold text-gray-900">{pendingLeaves}</p>
                <p className="text-sm font-medium text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{totalDaysTaken}</p>
                <p className="text-sm font-medium text-gray-600">Days Taken</p>
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
                  placeholder="Search by leave type, reason, or ID..."
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
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
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

      {/* Leave Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leave Applications ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leave records found</p>
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
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Leave ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Days</th>
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
                            <span className="text-gray-700">{record.type}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="text-gray-900">{formatDate(record.startDate)}</div>
                              <div className="text-gray-500">to {formatDate(record.endDate)}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">{record.days}</span>
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
                          <p className="text-sm text-gray-600">{record.type}</p>
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          <span className="mr-1">{getStatusIcon(record.status)}</span>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="text-gray-900">
                            {formatDate(record.startDate)} - {formatDate(record.endDate)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Days:</span>
                          <span className="font-medium text-gray-900">{record.days}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Applied:</span>
                          <span className="text-gray-900">{formatDate(record.appliedDate)}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Reason:</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{record.reason}</p>
                      </div>

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

      {/* Leave Detail Modal */}
      <LeaveDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} leave={selectedLeave} />
    </div>
  )
}
