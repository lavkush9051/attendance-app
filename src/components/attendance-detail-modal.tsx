"use client"

import { X, Clock, Calendar, CheckCircle, XCircle, Plane, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DayAttendance } from "@/app/page"

interface AttendanceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date | null
  onRegularize: () => void
  attendance?: DayAttendance
}

export function AttendanceDetailModal({ isOpen, onClose, date, onRegularize, attendance }: AttendanceDetailModalProps) {
  if (!isOpen || !date) return null

  const data: DayAttendance = attendance ?? { status: "absent" }

  // Mock data - in real app, this would come from API based on the selected date
  // const attendanceData = {
  //   status: "present" as const,
  //   clockIn: "9:15 AM",
  //   clockOut: "6:30 PM",
  //   shift: "Day Shift (9:00 AM - 6:00 PM)",
  //   workingHours: "9h 15m",
  //   breakTime: "1h 00m",
  //   overtime: "0h 15m",
  //   location: "Office - Floor 3",
  //   notes: "Arrived 15 minutes late due to traffic",
  // }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "present":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          label: "Present",
          color: "bg-green-100 text-green-800",
        }
      case "absent":
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          label: "Absent",
          color: "bg-red-100 text-red-800",
        }
      case "leave":
        return {
          icon: <Plane className="h-5 w-5 text-blue-500" />,
          label: "On Leave",
          color: "bg-blue-100 text-blue-800",
        }
      case "holiday":
        return {
          icon: <Calendar className="h-5 w-5 text-purple-500" />,
          label: "Holiday",
          color: "bg-purple-100 text-purple-800",
        }
      default:
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          label: "Present",
          color: "bg-green-100 text-green-800",
        }
    }
  }

  const statusInfo = getStatusInfo(data.status)
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Attendance Details</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">{formattedDate}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {statusInfo.icon}
              <span className="font-medium">Status</span>
            </div>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>

          {data.status === "present" && (
            <>
              {/* Time Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Clock In</span>
                  </div>
                  <span className="font-medium">{data.clockIn?? "-"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Clock Out</span>
                  </div>
                  <span className="font-medium">{data.clockOut ?? "-"}</span>
                </div>

                {/* <div className="flex items-center justify-between">
                  <span className="text-sm">Working Hours</span>
                  <span className="font-medium">{attendanceData.workingHours}</span>
                </div> */}

                {/* <div className="flex items-center justify-between">
                  <span className="text-sm">Break Time</span>
                  <span className="font-medium">{attendanceData.breakTime}</span>
                </div> */}

                {/* <div className="flex items-center justify-between">
                  <span className="text-sm">Overtime</span>
                  <span className="font-medium text-orange-600">{attendanceData.overtime}</span>
                </div> */}
              </div>

              <hr className="my-4" />

              {/* Additional Info
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Shift</span>
                  <p className="font-medium">{attendanceData.shift}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Location</span>
                  <p className="font-medium">{attendanceData.location}</p>
                </div>

                {attendanceData.notes && (
                  <div>
                    <span className="text-sm text-gray-600">Notes</span>
                    <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2 mt-1">
                      {attendanceData.notes}
                    </p>
                  </div>
                )}
              </div> */}
            {data.shift && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Shift</span>
                    <span className="font-medium">{data.shift}</span>
                  </div>
                )}
            </>
          )}

          {data.status === "leave" && <p className="text-sm text-blue-700">Marked on leave.</p>}
          {data.status === "holiday" && <p className="text-sm text-purple-700">Holiday.</p>}
          {data.status === "absent" && <p className="text-sm text-red-700">No clock-in/out recorded.</p>}



          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Close
            </Button>
            <Button onClick={onRegularize} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Regularize
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
