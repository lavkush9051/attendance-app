"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw } from "lucide-react" // Ensure you have lucide-react or use text "Refresh"

// Define the shape of the data from backend
interface CaptchaData {
  captcha_id: string
  image_base64: string
}

interface Props {
  onCaptchaChange: (token: string, answer: string) => void
}

export default function CustomCaptcha({ onCaptchaChange }: Props) {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchCaptcha = async () => {
    setLoading(true)
    try {
      // Adjust URL if your backend port/path is different
      const res = await fetch("http://localhost:8000/generate-captcha") 
      if (!res.ok) throw new Error("Failed to load captcha")
      const data = await res.json()
      
      setCaptchaData(data)
      setInputValue("") // Clear text box
      onCaptchaChange(data.captcha_id, "") // Reset parent state
    } catch (error) {
      console.error("Captcha error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load captcha on mount
  useEffect(() => {
    fetchCaptcha()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    if (captchaData) {
      // Send both the HIDDEN TOKEN and USER ANSWER to parent
      onCaptchaChange(captchaData.captcha_id, val)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-600">Security Check</label>
      
      <div className="flex items-center gap-3">
        {/* Captcha Image Area */}
        <div className="relative border rounded-md overflow-hidden bg-gray-50 min-w-[140px] h-[50px] flex items-center justify-center">
          {loading ? (
            <span className="text-xs text-gray-400">Loading...</span>
          ) : captchaData ? (
            <img 
              src={`data:image/png;base64,${captchaData.image_base64}`} 
              alt="Captcha"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-red-400">Error</span>
          )}
        </div>

        {/* Refresh Button */}
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={fetchCaptcha}
          title="Refresh Image"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Input Field */}
      <Input
        placeholder="Type the characters above"
        value={inputValue}
        onChange={handleChange}
        required
        autoComplete="off"
      />
    </div>
  )
}