"use client"

import { useState } from "react"
import { Calendar, Plus, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplyLeaveModal } from "./apply-leave-modal"

export function ApplyLeave() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock leave balance data
  const leaveBalance = {
    annual: { total: 20, used: 8, remaining: 12 },
    sick: { total: 10, used: 3, remaining: 7 },
    personal: { total: 5, used: 2, remaining: 3 },
    emergency: { total: 3, used: 0, remaining: 3 },
  }

  // Mock upcoming leaves
  const upcomingLeaves = [
    {
      id: 1,
      type: "Annual Leave",
      startDate: "2024-03-15",
      endDate: "2024-03-19",
      days: 5,
      status: "approved",
    },
    {
      id: 2,
      type: "Personal Leave",
      startDate: "2024-04-10",
      endDate: "2024-04-10",
      days: 1,
      status: "pending",
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
          <p className="text-sm text-gray-600 mt-1">Submit new leave applications and manage your leave balance</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(leaveBalance).map(([type, balance]) => (
          <Card key={type} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 capitalize">{type} Leave</h3>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-900">{balance.remaining}</span>
                  <span className="text-sm text-gray-500">of {balance.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(balance.remaining / balance.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">Used: {balance.used} days</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-transparent"
              onClick={() => setIsModalOpen(true)}
            >
              <Calendar className="h-6 w-6" />
              <span>Apply Leave</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Clock className="h-6 w-6" />
              <span>Check Balance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <FileText className="h-6 w-6" />
              <span>Leave History</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}

      {/* Upcoming Leaves */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Leaves</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingLeaves.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming leaves scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{leave.type}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)} ({leave.days} day
                      {leave.days > 1 ? "s" : ""})
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        leave.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
