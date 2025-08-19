// Mock API endpoints that match your backend structure
// These can be used for development/testing before backend is ready

import { type NextRequest, NextResponse } from "next/server"

// Mock data
const mockEmployees = [
  {
    id: "1",
    emp_id: "EMP001",
    name: "Alice Johnson",
    email: "alice@company.com",
    department: "Engineering",
    designation: "Software Engineer",
    shift: "Day Shift",
    week_off: "Saturday",
    status: "active",
    join_date: "2022-03-15",
  },
  // Add more mock employees...
]

const mockLeaveRequests = [
  {
    id: "LR001",
    emp_id: "EMP001",
    employee_name: "Alice Johnson",
    leave_type_id: "LT001",
    leave_type_name: "Annual Leave",
    start_date: "2024-03-15",
    end_date: "2024-03-19",
    days: 5,
    reason: "Family vacation",
    status: "pending",
    applied_date: "2024-03-01",
  },
  // Add more mock leave requests...
]

// Mock API handlers (these would go in your app/api routes)
export const mockApiHandlers = {
  // POST /api/login
  login: async (req: NextRequest) => {
    const body = await req.json()

    // Mock authentication
    if (body.email && body.password) {
      return NextResponse.json({
        success: true,
        data: {
          token: "mock_jwt_token_12345",
          user: {
            id: "1",
            emp_id: "EMP001",
            name: "John Doe",
            email: body.email,
            role: "employee",
            department: "Engineering",
            designation: "Software Engineer",
          },
          expires_in: 3600,
        },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  },

  // GET /api/employees
  getEmployees: async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const department = searchParams.get("department")
    const search = searchParams.get("search")

    let filteredEmployees = mockEmployees

    if (department) {
      filteredEmployees = filteredEmployees.filter((emp) => emp.department === department)
    }

    if (search) {
      filteredEmployees = filteredEmployees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(search.toLowerCase()) ||
          emp.emp_id.toLowerCase().includes(search.toLowerCase()),
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredEmployees,
    })
  },

  // GET /api/leave-requests (admin)
  getAdminLeaveRequests: async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const adminId = searchParams.get("admin_id")
    const status = searchParams.get("status")

    let filteredRequests = mockLeaveRequests

    if (status) {
      filteredRequests = filteredRequests.filter((req) => req.status === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredRequests,
    })
  },

  // PUT /api/leave-request/action
  actionLeaveRequest: async (req: NextRequest) => {
    const body = await req.json()
    const { leave_request_id, action, admin_id } = body

    // Mock update
    const requestIndex = mockLeaveRequests.findIndex((req) => req.id === leave_request_id)
    if (requestIndex !== -1) {
      mockLeaveRequests[requestIndex].status = action === "approve" ? "approved" : "rejected"
    }

    return NextResponse.json({
      success: true,
      message: `Leave request ${action}d successfully`,
    })
  },
}
