"use client"

import { useState } from "react"
import { leaveApi } from "@/lib/api"
import { useApi, useMutation } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Example component showing how to integrate with the API
export function LeaveRequestsWithApi() {
  const [adminId] = useState("admin123") // This would come from auth context

  // Fetch leave requests using the API
  const {
    data: leaveRequests,
    loading,
    error,
    refetch,
  } = useApi(() => leaveApi.getAdminLeaveRequests(adminId, { status: "pending" }), [adminId])

  // Mutation for approving/rejecting requests
  const { mutate: actionMutation, loading: actionLoading } = useMutation()

  const handleAction = async (leaveRequestId: string, action: "approve" | "reject") => {
    try {
      const actionFn = actionMutation(leaveApi.actionLeaveRequest)
      await actionFn({
        leave_request_id: leaveRequestId,
        action,
        admin_id: adminId,
        comments: `${action} by admin`,
      })

      // Refetch data after successful action
      refetch()
    } catch (error) {
      console.error(`Failed to ${action} leave request:`, error)
    }
  }

  if (loading) {
    return <div>Loading leave requests...</div>
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">Error loading leave requests: {error.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Leave Requests (API Integration)</h2>

      {leaveRequests?.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{request.employee_name}</span>
              <Badge>{request.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Type:</strong> {request.leave_type_name}
              </p>
              <p>
                <strong>Duration:</strong> {request.start_date} to {request.end_date}
              </p>
              <p>
                <strong>Days:</strong> {request.days}
              </p>
              <p>
                <strong>Reason:</strong> {request.reason}
              </p>

              {request.status === "pending" && (
                <div className="flex space-x-2 mt-4">
                  <Button
                    onClick={() => handleAction(request.id, "approve")}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction(request.id, "reject")}
                    disabled={actionLoading}
                    variant="destructive"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
