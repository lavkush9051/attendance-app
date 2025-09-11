// "use client"

// import { useState } from "react"
// import { Calendar, Plus, Clock, FileText } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { ApplyLeaveModal } from "./apply-leave-modal"

// export function ApplyLeave() {
//   const [isModalOpen, setIsModalOpen] = useState(false)

//   // Mock leave balance data
//   const leaveBalance = {
//     casual: { total: 20, used: 8, remaining: 12 },
//     earned: { total: 10, used: 3, remaining: 7 },
//     halfpay: { total: 5, used: 2, remaining: 3 },
//     medical: { total: 3, used: 0, remaining: 3 },
//   }

//   // Mock upcoming leaves
//   const upcomingLeaves = [
//     {
//       id: 1,
//       type: "Annual Leave",
//       startDate: "2024-03-15",
//       endDate: "2024-03-19",
//       days: 5,
//       status: "approved",
//     },
//     {
//       id: 2,
//       type: "Personal Leave",
//       startDate: "2024-04-10",
//       endDate: "2024-04-10",
//       days: 1,
//       status: "pending",
//     },
//   ]

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//     })
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
//           <p className="text-sm text-gray-600 mt-1">Submit new leave applications and manage your leave balance</p>
//         </div>
//         <Button onClick={() => setIsModalOpen(true)} className="mt-4 sm:mt-0">
//           <Plus className="h-4 w-4 mr-2" />
//           Apply for Leave
//         </Button>
//       </div>

//       {/* Leave Balance Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {Object.entries(leaveBalance).map(([type, balance]) => (
//           <Card key={type} className="relative overflow-hidden">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-semibold text-gray-900 capitalize">{type} Leave</h3>
//                 <Calendar className="h-5 w-5 text-gray-400" />
//               </div>
//               <div className="space-y-2">
//                 <div className="flex justify-between items-end">
//                   <span className="text-2xl font-bold text-gray-900">{balance.remaining}</span>
//                   <span className="text-sm text-gray-500">of {balance.total}</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                     style={{ width: `${(balance.remaining / balance.total) * 100}%` }}
//                   />
//                 </div>
//                 <p className="text-xs text-gray-600">Used: {balance.used} days</p>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

     

//       {/* Upcoming Leaves */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Upcoming Leaves</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {upcomingLeaves.length === 0 ? (
//             <div className="text-center py-8">
//               <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500">No upcoming leaves scheduled</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {upcomingLeaves.map((leave) => (
//                 <div key={leave.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div>
//                     <h3 className="font-medium text-gray-900">{leave.type}</h3>
//                     <p className="text-sm text-gray-600">
//                       {formatDate(leave.startDate)} - {formatDate(leave.endDate)} ({leave.days} day
//                       {leave.days > 1 ? "s" : ""})
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span
//                       className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
//                         leave.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
//                       }`}
//                     >
//                       {leave.status}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Apply Leave Modal */}
//       <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
//     </div>
//   )
// }
// // src/components/apply-leave.tsx
// // "use client"

// // import { useEffect, useState } from "react"
// // import { Calendar, Plus } from "lucide-react"
// // import { Button } from "@/components/ui/button"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { ApplyLeaveModal } from "./apply-leave-modal"
// // import { leaveApi, type LeaveBalance } from "@/lib/api/leave"
// // // If you have authApi, you can use it; otherwise we’ll fall back to localStorage
// // import { authApi } from "@/lib/api"

// // export function ApplyLeave() {
// //   const [isModalOpen, setIsModalOpen] = useState(false)
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState<string | null>(null)
// //   const [balance, setBalance] = useState<LeaveBalance | null>(null)

// //   // Optional upcoming leaves (left as-is)
// //   const upcomingLeaves = [
// //     { id: 1, type: "Annual Leave", startDate: "2024-03-15", endDate: "2024-03-19", days: 5, status: "approved" },
// //     { id: 2, type: "Personal Leave", startDate: "2024-04-10", endDate: "2024-04-10", days: 1, status: "pending" },
// //   ]

// //   useEffect(() => {
// //     const fetchBalance = async () => {
// //       try {
// //         setLoading(true)
// //         setError(null)

// //         // Get emp_id from your session
// //         let empId: number | string | null = null
// //         try {
// //           const userFromAuth = authApi?.getUser?.()
// //           empId = userFromAuth?.emp_id ?? null
// //         } catch {
// //           // ignore
// //         }
// //         if (!empId && typeof window !== "undefined") {
// //           const raw = localStorage.getItem("user_data")
// //           if (raw) {
// //             const parsed = JSON.parse(raw)
// //             empId = parsed?.emp_id ?? null
// //           }
// //         }

// //         if (!empId) {
// //           setError("Employee not found in session.")
// //           setLoading(false)
// //           return
// //         }

// //         const data = await leaveApi.getLeaveBalance(empId)
// //         setBalance(data)
// //       } catch (e: any) {
// //         setError(e?.message || "Failed to load leave balance.")
// //       } finally {
// //         setLoading(false)
// //       }
// //     }

// //     fetchBalance()
// //   }, [])

// //   const formatDate = (dateString: string) =>
// //     new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })

// //   // Map API → UI cards (used=0 because the endpoint returns balances, not usage)
// //   const cards = balance
// //     ? [
// //         { key: "casual_leave", label: "Casual", total: balance.casual_leave },
// //         { key: "earned_leave", label: "Earned", total: balance.earned_leave },
// //         { key: "half_pay_leave", label: "Half Pay", total: balance.half_pay_leave },
// //         { key: "medical_leave", label: "Medical", total: balance.medical_leave },
// //       ]
// //     : []

// //   return (
// //     <div className="space-y-6">
// //       {/* Page Header */}
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
// //         <div>
// //           <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
// //           <p className="text-sm text-gray-600 mt-1">Submit new leave applications and manage your leave balance</p>
// //         </div>
// //         <Button onClick={() => setIsModalOpen(true)} className="mt-4 sm:mt-0">
// //           <Plus className="h-4 w-4 mr-2" />
// //           Apply for Leave
// //         </Button>
// //       </div>

// //       {/* State: Loading / Error */}
// //       {loading && (
// //         <Card>
// //           <CardContent className="p-6">
// //             <p className="text-gray-600">Loading leave balance…</p>
// //           </CardContent>
// //         </Card>
// //       )}
// //       {error && (
// //         <Card>
// //           <CardContent className="p-6">
// //             <p className="text-red-600 text-sm">{error}</p>
// //           </CardContent>
// //         </Card>
// //       )}

// //       {/* Leave Balance Cards */}
// //       {!loading && !error && balance && (
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// //           {cards.map((c) => {
// //             const used = 0 // If you later add "used" from backend, replace this
// //             const remaining = c.total - used
// //             const pct = c.total > 0 ? (remaining / c.total) * 100 : 0
// //             return (
// //               <Card key={c.key} className="relative overflow-hidden">
// //                 <CardContent className="p-6">
// //                   <div className="flex items-center justify-between mb-4">
// //                     <h3 className="font-semibold text-gray-900 capitalize">{c.label} Leave</h3>
// //                     <Calendar className="h-5 w-5 text-gray-400" />
// //                   </div>
// //                   <div className="space-y-2">
// //                     <div className="flex justify-between items-end">
// //                       <span className="text-2xl font-bold text-gray-900">{remaining}</span>
// //                       <span className="text-sm text-gray-500">of {c.total}</span>
// //                     </div>
// //                     <div className="w-full bg-gray-200 rounded-full h-2">
// //                       <div
// //                         className="bg-blue-600 h-2 rounded-full transition-all duration-300"
// //                         style={{ width: `${pct}%` }}
// //                       />
// //                     </div>
// //                     <p className="text-xs text-gray-600">Used: {used} days</p>
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             )
// //           })}
// //         </div>
// //       )}

// //       {/* Upcoming Leaves (unchanged) */}
// //       <Card>
// //         <CardHeader>
// //           <CardTitle>Upcoming Leaves</CardTitle>
// //         </CardHeader>
// //         <CardContent>
// //           {upcomingLeaves.length === 0 ? (
// //             <div className="text-center py-8">
// //               <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
// //               <p className="text-gray-500">No upcoming leaves scheduled</p>
// //             </div>
// //           ) : (
// //             <div className="space-y-4">
// //               {upcomingLeaves.map((leave) => (
// //                 <div key={leave.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
// //                   <div>
// //                     <h3 className="font-medium text-gray-900">{leave.type}</h3>
// //                     <p className="text-sm text-gray-600">
// //                       {formatDate(leave.startDate)} - {formatDate(leave.endDate)} ({leave.days} day
// //                       {leave.days > 1 ? "s" : ""})
// //                     </p>
// //                   </div>
// //                   <div className="text-right">
// //                     <span
// //                       className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
// //                         leave.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
// //                       }`}
// //                     >
// //                       {leave.status}
// //                     </span>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>

// //       {/* Apply Leave Modal */}
// //       <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
// //     </div>
// //   )
// // }



"use client"

import { useEffect, useState } from "react"
import { Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplyLeaveModal } from "./apply-leave-modal"
import { leaveApi } from "@/lib/api/leave"
// Optional: auth helper; otherwise we'll use localStorage
import { authApi } from "@/lib/api"
import { LeaveHistory } from "./leave-history"

type LeaveTypeRow = {
  type: string
  accrued: number
  held: number      // pending (on HOLD)
  committed: number // approved/used (COMMIT)
  available: number // accrued - committed - held
}

type LeaveBalanceSnapshot = {
  emp_id: number
  types: LeaveTypeRow[]
  totals: { accrued: number; held: number; committed: number; available: number }
}

export function ApplyLeave() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<LeaveBalanceSnapshot | null>(null)

  // (Optional) you can still show upcoming leaves; leaving your mock here
  const upcomingLeaves = [
    { id: 1, type: "Annual Leave", startDate: "2024-03-15", endDate: "2024-03-19", days: 5, status: "approved" },
    { id: 2, type: "Personal Leave", startDate: "2024-04-10", endDate: "2024-04-10", days: 1, status: "pending" },
  ]

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get emp_id from your session or localStorage
        let empId: number | null = null
        try {
          const u = authApi?.getUser?.()
          empId = u?.emp_id ?? null
        } catch { /* ignore */ }

        if (!empId && typeof window !== "undefined") {
          const raw = localStorage.getItem("user_data")
          if (raw) {
            const parsed = JSON.parse(raw)
            empId = parsed?.emp_id ?? null
          }
        }

        if (!empId) {
          setError("Employee not found in session.")
          return
        }

        // Call your API (backed by /api/leave-balance/snapshot)
        const raw: any = await leaveApi.getLeaveBalance(empId)
        // Map LeaveBalance to LeaveBalanceSnapshot
        const types: LeaveTypeRow[] = [
          {
            type: "Casual",
            accrued: raw.casual_leave ?? 0,
            held: raw.casual_leave_held ?? 0,
            committed: raw.casual_leave_committed ?? 0,
            available: (raw.casual_leave ?? 0) - (raw.casual_leave_held ?? 0) - (raw.casual_leave_committed ?? 0),
          },
          {
            type: "Earned",
            accrued: raw.earned_leave ?? 0,
            held: raw.earned_leave_held ?? 0,
            committed: raw.earned_leave_committed ?? 0,
            available: (raw.earned_leave ?? 0) - (raw.earned_leave_held ?? 0) - (raw.earned_leave_committed ?? 0),
          },
          {
            type: "Half Pay",
            accrued: raw.half_pay_leave ?? 0,
            held: raw.half_pay_leave_held ?? 0,
            committed: raw.half_pay_leave_committed ?? 0,
            available: (raw.half_pay_leave ?? 0) - (raw.half_pay_leave_held ?? 0) - (raw.half_pay_leave_committed ?? 0),
          },
          {
            type: "Medical",
            accrued: raw.medical_leave ?? 0,
            held: raw.medical_leave_held ?? 0,
            committed: raw.medical_leave_committed ?? 0,
            available: (raw.medical_leave ?? 0) - (raw.medical_leave_held ?? 0) - (raw.medical_leave_committed ?? 0),
          },
        ]
        const totals = {
          accrued: types.reduce((sum, t) => sum + t.accrued, 0),
          held: types.reduce((sum, t) => sum + t.held, 0),
          committed: types.reduce((sum, t) => sum + t.committed, 0),
          available: types.reduce((sum, t) => sum + t.available, 0),
        }
        const data: LeaveBalanceSnapshot = {
          emp_id: empId!,
          types,
          totals,
        }
        setSnapshot(data)
      } catch (e: any) {
        setError(e?.message || "Failed to load leave balance.")
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Balance</h1>
          <p className="text-sm text-gray-600 mt-1">Submit new leave applications and manage your leave balance</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Loading leave balance…</p>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Leave Balance Cards */}
      {!loading && !error && snapshot && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {snapshot.types.map((row) => {
            const total = row.accrued
            const remaining = row.available
            const used = row.committed
            const pending = row.held
            const pct = total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0

            return (
              <Card key={row.type} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{row.type}</h3>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-bold text-gray-900">{remaining}</span>
                      <span className="text-sm text-gray-500">of {total}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="text-xs text-gray-600 flex flex-col gap-1">
                      <span>Used (approved): {used} day{used === 1 ? "" : "s"}</span>
                      <span>Pending (held): {pending} day{pending === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Upcoming Leaves
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
      </Card> */}

      <LeaveHistory />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
