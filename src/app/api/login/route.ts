import type { NextRequest } from "next/server"
import { mockApiHandlers } from "@/lib/api/mock-endpoints"

export async function POST(req: NextRequest) {
  return mockApiHandlers.login(req)
}
