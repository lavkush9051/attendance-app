"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"

const PUBLIC_ROUTES = new Set<string>([
  "/login",
])

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  // treat API routes and static assets as public
  const isPublic =
    !pathname ||
    PUBLIC_ROUTES.has(pathname) ||
    pathname.startsWith("/api")

  useEffect(() => {
    if (isPublic) {
      setReady(true)
      return
    }
    const user = authApi.getUser() // reads from localStorage (client-only in your authApi)
    if (!user) {
      const returnTo = encodeURIComponent(pathname)
      router.replace(`/login?returnTo=${returnTo}`)
      return
    }
    setReady(true)
  }, [pathname, router, isPublic])

  if (!ready) {
    // optional: loading UI
    return null
  }

  return <>{children}</>
}
