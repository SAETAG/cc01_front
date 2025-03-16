"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

interface FloatingObject {
  left: string
  top: string
  fontSize: string
  opacity: number
  animationDuration: string
  animationDelay: string
  transform: string
  icon: string
}

export default function LoginScreen() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [floatingObjects, setFloatingObjects] = useState<FloatingObject[]>([])
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    setIsLoaded(true)
    const objects: FloatingObject[] = Array.from({ length: 25 }).map(() => {
      const objectIcons = [
        "✨",
        "💃",
        "🦺",
        "👙",
        "🌟",
        "💎",
        "👖",
        "🧦",
        "🧥",
        "👔",
        "🩷",
        "👑",
        "✨",
        "👚",
        "👒",
        "🧤",
      ]
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 1.5 + 1}rem`,
        opacity: Math.random() * 0.4 + 0.6,
        animationDuration: `${Math.random() * 10 + 10}s`,
        animationDelay: `${Math.random() * 5}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
        icon: objectIcons[Math.floor(Math.random() * objectIcons.length)],
      }
    })
    setFloatingObjects(objects)
  }, [])

  const validateForm = () => {
    let valid = true
    const newErrors = {
      email: "",
      password: "",
    }

    if (!email.trim()) {
      newErrors.email = "メールアドレスを入力してください"
      valid = false
    }

    if (!password) {
      newErrors.password = "パスワードを入力してください"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Handle successful login
      console.log("Login attempted:", { email, password, rememberMe })
      // Here you would typically call an API to authenticate the user
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-emerald-900 flex flex-col items-center justify-center">
      {/* Background city image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60 transition-opacity duration-1000"
        style={{
          backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
          opacity: isLoaded ? 0.6 : 0,
        }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent" />

      {/* Floating objects effect */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingObjects.map((obj, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: obj.left,
              top: obj.top,
              fontSize: obj.fontSize,
              opacity: obj.opacity,
              animationDuration: obj.animationDuration,
              animationDelay: obj.animationDelay,
              transform: obj.transform,
            }}
          >
            {obj.icon}
          </div>
        ))}
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="ghost"
          className="text-white hover:bg-emerald-800/50 rounded-full p-3"
          onClick={() => console.log("Back to title screen")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      {/* Login Form */}
      <div
        className={`relative z-10 bg-emerald-800/80 backdrop-blur-sm p-8 rounded-lg border-2 border-emerald-400 shadow-lg max-w-md w-full transform transition-all duration-1000 ${
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <h1 className="text-3xl font-bold text-yellow-300 tracking-wider mb-2 text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          ログイン
        </h1>
        <div className="text-white text-sm mb-6 text-center opacity-90">冒険を続けるために、ログインしてください</div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              メールアドレス
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-emerald-700/50 border-emerald-500 text-white placeholder:text-emerald-300/50 ${
                errors.email ? "border-red-400" : ""
              }`}
              placeholder="example@mail.com"
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              パスワード
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-emerald-700/50 border-emerald-500 text-white placeholder:text-emerald-300/50 pr-10 ${
                  errors.password ? "border-red-400" : ""
                }`}
                placeholder="パスワードを入力"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-emerald-500 bg-emerald-700/50 text-emerald-500 focus:ring-emerald-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                ログイン状態を保存
              </Label>
            </div>
            <div className="text-sm">
              <a href="#" className="text-emerald-300 hover:text-emerald-200">
                パスワードをお忘れですか？
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full py-6 mt-6 text-lg bg-emerald-800 border-2 border-emerald-400 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 ${
              hoveredButton === "login" ? "scale-105 shadow-[0_0_15px_rgba(52,211,153,0.5)]" : ""
            }`}
            onMouseEnter={() => setHoveredButton("login")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            ログイン
          </Button>
        </form>

        <div className="mt-6 text-center text-white/70 text-sm">
          アカウントをお持ちでないですか？{" "}
          <a href="#" className="text-emerald-300 hover:text-emerald-200">
            新規登録
          </a>
        </div>
      </div>

      {/* Version number */}
      <div className="absolute bottom-4 right-4 text-white/70 text-sm">v1.0.0</div>
    </div>
  )
}

