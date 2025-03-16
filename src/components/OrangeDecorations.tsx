"use client"

import { useState, useEffect } from "react"

interface Decoration {
  element: string
  left: number
  size: number
  duration: number
  delay: number
  opacity: number
}

interface OrangeDecorationsProps {
  count?: number
  className?: string
}

const decorativeElements = ["❤️", "✨", "💫", "💕", "⭐", "💖", "🌟"]

export default function OrangeDecorations({ count = 30, className = "" }: OrangeDecorationsProps) {
  const [decorations, setDecorations] = useState<Decoration[]>([])

  useEffect(() => {
    const newDecos = Array.from({ length: count }).map(() => {
      const element = decorativeElements[Math.floor(Math.random() * decorativeElements.length)]
      const size = Math.random() * 1.5 + 1 // 1～2.5rem
      const duration = Math.random() * 10 + 15 // 15～25秒
      const delay = Math.random() * 10 // 0～10秒
      const left = Math.random() * 100
      const opacity = Math.random() * 0.3 + 0.7
      return { element, left, size, duration, delay, opacity }
    })
    setDecorations(newDecos)
  }, [count])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {decorations.map((deco, i) => (
        <div
          key={`deco-${i}`}
          className="absolute animate-falling"
          style={{
            left: `${deco.left}%`,
            top: `-50px`,
            fontSize: `${deco.size}rem`,
            opacity: deco.opacity,
            animationDuration: `${deco.duration}s`,
            animationDelay: `${deco.delay}s`,
          }}
        >
          {deco.element}
        </div>
      ))}
    </div>
  )
}

