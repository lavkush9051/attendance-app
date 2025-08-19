import type { NextRequest } from "next/server"
import { mockApiHandlers } from "@/lib/api/mock-endpoints"

export async function GET(req: NextRequest) {
  return mockApiHandlers.getAdminLeaveRequests(req)
}
