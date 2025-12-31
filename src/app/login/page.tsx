// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { authApi } from "@/lib/api/auth"
// import { Eye, EyeOff } from "lucide-react"

// export default function LoginPage() {
//   const router = useRouter()
//   const [username, setUsername] = useState("")
//   const [password, setPassword] = useState("")
//   const [showPassword, setShowPassword] = useState(false) // New state for password visibility
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)
//     setLoading(true)
//     try {
//       await authApi.login({
//         username,
//         password,
//         remember_me: true,
//       })
//       // login success → go to dashboard (or wherever your home is)
//       router.push("/")
//     } catch (err: any) {
//       setError(err?.message ?? "Login failed")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-[70vh] w-full flex items-center justify-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-xl">Log in</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={onSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm text-gray-600 mb-1">Ueser Id</label>
//               <Input
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder="Enter user id"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm text-gray-600 mb-1">Password</label>
//               <div className="relative">
//                 <Input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter password"
//                   required
//                   className="pr-10" // 👈 space for icon
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             {error && <p className="text-sm text-red-600">{error}</p>}

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? "Signing in..." : "Sign in"}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/lib/api/auth"
import { Eye, EyeOff } from "lucide-react"
import CustomCaptcha from "@/components/CustomCaptcha" // <--- Import Component

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // --- NEW: Captcha State ---
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic client-side check
    if (!captchaToken || !captchaAnswer) {
      setError("Please complete the security check.")
      return
    }

    setLoading(true)
    try {
      // Pass the extra fields to your API
      await authApi.login({
        username,
        password,
        captcha_id: captchaToken,      // <--- Send Token
        captcha_answer: captchaAnswer, // <--- Send Answer
        remember_me: true,
      })
      
      router.push("/")
    } catch (err: any) {
      // If error (like wrong captcha), we usually want to CLEAR the password 
      // but maybe keep the username. 
      // You might want to trigger a captcha refresh here if possible, 
      // but simpler to just show the error first.
      const msg =
        err?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Login failed"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">User Id</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter user id"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* --- NEW: Captcha Section --- */}
            <CustomCaptcha 
              onCaptchaChange={(token, answer) => {
                setCaptchaToken(token)
                setCaptchaAnswer(answer)
              }} 
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}