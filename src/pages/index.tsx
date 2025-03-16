"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ useRouter をインポート
import { Button } from "@/components/ui/button";

interface FloatingObject {
  left: string;
  top: string;
  fontSize: string;
  opacity: number;
  animationDuration: string;
  animationDelay: string;
  transform: string;
  icon: string;
}

export default function RPGTitleScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [floatingObjects, setFloatingObjects] = useState<FloatingObject[]>([]);

  const router = useRouter(); // ✅ useRouter フックを追加

  useEffect(() => {
    setIsLoaded(true);
    const objects: FloatingObject[] = Array.from({ length: 25 }).map(() => {
      const objectIcons = ["✨", "💃", "🦺", "👙", "🌟", "💎", "👖", "🧦", "🧥", "👔","🩷","👑","✨","👚","👒","🧤"];
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 1.5 + 1}rem`,
        opacity: Math.random() * 0.4 + 0.6,
        animationDuration: `${Math.random() * 10 + 10}s`,
        animationDelay: `${Math.random() * 5}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
        icon: objectIcons[Math.floor(Math.random() * objectIcons.length)],
      };
    });
    setFloatingObjects(objects);
  }, []);

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

      {/* Game title */}
      <div
        className={`relative z-10 text-center transform transition-all duration-1000 ${
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <h1 className="text-5xl md:text-7xl font-bold text-yellow-300 tracking-wider mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          Closet Chronicle
        </h1>

        {/* Subtitle with Japanese characters */}
        <div className="text-white text-xl md:text-2xl mb-16 opacity-90">あなたとクローゼットの物語。</div>

        {/* Menu buttons */}
        <div className="flex flex-col gap-4 items-center">
          <Button
            className={`w-64 py-6 text-lg bg-emerald-800 border-2 border-emerald-400 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 ${
              hoveredButton === "new" ? "scale-105 shadow-[0_0_15px_rgba(52,211,153,0.5)]" : ""
            }`}
            onClick={() => router.push("/signup")} // ✅ `新たな冒険へ` → `/login` に遷移
            onMouseEnter={() => setHoveredButton("new")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            新たな冒険へ
          </Button>

          <Button
            className={`w-64 py-6 text-lg bg-emerald-800 border-2 border-emerald-400 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 ${
              hoveredButton === "continue" ? "scale-105 shadow-[0_0_15px_rgba(52,211,153,0.5)]" : ""
            }`}
            onClick={() => router.push("/login")} // ✅ `冒険の続きへ` → `/signup` に遷移
            onMouseEnter={() => setHoveredButton("continue")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            冒険の続きへ
          </Button>
        </div>
      </div>

      {/* Version number */}
      <div className="absolute bottom-4 right-4 text-white/70 text-sm">v1.0.0</div>
    </div>
  );
}
