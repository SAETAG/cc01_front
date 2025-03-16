"use client"

import { useState, useEffect } from "react"

interface Particle {
  left: number
  top: number
  opacity: number
  duration: number
}

interface BackgroundParticlesProps {
  count?: number
  className?: string
}

export default function BackgroundParticles({ count = 50, className = "" }: BackgroundParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles = Array.from({ length: count }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.7,
      duration: Math.random() * 5 + 3, // 3～8秒
    }))
    setParticles(newParticles)
  }, [count])

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animation: `twinkle ${p.duration}s infinite alternate`,
          }}
        />
      ))}
    </div>
  )
}

