"use client"

import { useState } from "react"
import { Shield, Users, Clock, Calendar, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaveRequestsTab } from "./admin/leave-requests-tab"
import { AttendanceRequestsTab } from "./admin/attendance-requests-tab"
import { ShiftManagementTab } from "./admin/shift-management-tab"
import { ReportsTab } from "./admin/reports-tab"

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("leave-requests")

  // Mock statistics for the overview cards
  const stats = {
    pendingLeaveRequests: 12,
    pendingAttendanceRequests: 8,
    totalEmployees: 156,
    activeShifts: 3,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600">Manage employee requests, shifts, and generate reports</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingLeaveRequests}</p>
                <p className="text-sm font-medium text-gray-600">Pending Leave Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAttendanceRequests}</p>
                <p className="text-sm font-medium text-gray-600">Pending Attendance Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{stats.activeShifts}</p>
                <p className="text-sm font-medium text-gray-600">Active Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-12">
                <TabsTrigger value="leave-requests" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Leave Requests</span>
                  <span className="sm:hidden">Leave</span>
                </TabsTrigger>
                <TabsTrigger value="attendance-requests" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Attendance Requests</span>
                  <span className="sm:hidden">Attendance</span>
                </TabsTrigger>
                {/* <TabsTrigger value="shift-management" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Shift Management</span>
                  <span className="sm:hidden">Shifts</span>
                </TabsTrigger> */}
                <TabsTrigger value="reports" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Reports</span>
                  <span className="sm:hidden">Reports</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="leave-requests" className="mt-0">
                <LeaveRequestsTab />
              </TabsContent>

              <TabsContent value="attendance-requests" className="mt-0">
                <AttendanceRequestsTab />
              </TabsContent>

              <TabsContent value="shift-management" className="mt-0">
                <ShiftManagementTab />
              </TabsContent>

              <TabsContent value="reports" className="mt-0">
                <ReportsTab />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
