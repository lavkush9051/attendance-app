"use client"

import type React from "react"

import { useState } from "react"
import { User, Mail, Phone, MapPin, Calendar, Clock, Award, Edit, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false)

  // Mock user data
  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    designation: "Senior Software Engineer",
    employeeId: "EMP001",
    joinDate: "2022-03-15",
    location: "New York, NY",
    manager: "Sarah Johnson",
    workingHours: "9:00 AM - 6:00 PM",
    avatar: "/placeholder.svg?height=120&width=120",
  }

  // Mock attendance stats
  const attendanceStats = {
    totalWorkingDays: 22,
    presentDays: 20,
    absentDays: 2,
    leaveDays: 5,
    avgWorkingHours: 8.5,
    punctualityScore: 85,
  }

  // Mock leave balance
  const leaveBalance = {
    annual: { total: 20, used: 8, remaining: 12 },
    sick: { total: 10, used: 3, remaining: 7 },
    personal: { total: 5, used: 2, remaining: 3 },
    emergency: { total: 3, used: 0, remaining: 3 },
  }

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: "leave",
      description: "Annual leave approved for March 15-19",
      date: "2024-03-01",
      status: "approved",
    },
    {
      id: 2,
      type: "attendance",
      description: "Regularization request submitted for Feb 28",
      date: "2024-02-29",
      status: "pending",
    },
    {
      id: 3,
      type: "achievement",
      description: "Perfect attendance for February",
      date: "2024-02-28",
      status: "completed",
    },
    {
      id: 4,
      type: "leave",
      description: "Sick leave taken on Feb 20",
      date: "2024-02-20",
      status: "approved",
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "leave":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "attendance":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "achievement":
        return <Award className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {userData.firstName[0]}
                    {userData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-transparent"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-gray-600">{userData.designation}</p>
                <p className="text-sm text-gray-500">{userData.department}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{userData.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{userData.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{userData.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">ID: {userData.employeeId}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Joined {formatDate(userData.joinDate)}</span>
              </div>

              <Separator />

              <Button className="w-full" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview (This Month)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.presentDays}</p>
                  <p className="text-sm text-gray-600">Present Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.absentDays}</p>
                  <p className="text-sm text-gray-600">Absent Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{attendanceStats.leaveDays}</p>
                  <p className="text-sm text-gray-600">Leave Days</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{attendanceStats.avgWorkingHours}h</p>
                  <p className="text-sm text-gray-600">Avg Hours</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Punctuality Score</span>
                  <span className="text-sm font-bold text-gray-900">{attendanceStats.punctualityScore}%</span>
                </div>
                <Progress value={attendanceStats.punctualityScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Leave Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(leaveBalance).map(([type, balance]) => (
                  <div key={type} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900 capitalize">{type} Leave</h3>
                      <Badge variant="outline">
                        {balance.remaining}/{balance.total}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Used: {balance.used}</span>
                        <span className="text-gray-600">Remaining: {balance.remaining}</span>
                      </div>
                      <Progress value={(balance.remaining / balance.total) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                    </div>
                    <Badge className={getStatusColor(activity.status)} variant="secondary">
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardHeader>
              <CardTitle>Work Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Department</Label>
                    <p className="text-gray-900">{userData.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Designation</Label>
                    <p className="text-gray-900">{userData.designation}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Employee ID</Label>
                    <p className="text-gray-900">{userData.employeeId}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Reporting Manager</Label>
                    <p className="text-gray-900">{userData.manager}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Working Hours</Label>
                    <p className="text-gray-900">{userData.workingHours}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Join Date</Label>
                    <p className="text-gray-900">{formatDate(userData.joinDate)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ""}`}
      {...props}
    >
      {children}
    </label>
  )
}
