"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SkipForward, Volume2, VolumeX, Play } from "lucide-react"
import { delay } from "@/lib/utils"

// シーンの種類を定義
type SceneType = "start" | "prologue" | "narration1" | "narration2" | "npc" | "adventure" | "complete"

export default function PrologueScene({ onComplete }: { onComplete?: () => void }) {
  const [currentScene, setCurrentScene] = useState<SceneType>("start")
  const [textProgress, setTextProgress] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [showSkipButton] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  // プロローグ用の背景音楽オブジェクトを管理する ref
  const prologueAudioRef = useRef<HTMLAudioElement | null>(null)

  // テキストのタイピングエフェクト用のタイマー参照
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ナレーションテキスト（2つに分割）- 各文を改行
  const narration1Text =
    "かつて、クローゼット王国は調和と美しさに満ちた世界でした。\nすべての衣装や小物は、まるで魔法のようにその居場所を知り、王国は輝いていたのです。"

  const narration2Text =
    "しかし、ある日、突如として現れた『混沌の呪い』が王国に暗い影を落としました。\n棚は乱れ、衣装は迷宮のごとく入り組み、かつての秩序は音を立てて崩れ去っていきました。"

  // NPCの台詞 - 各文を改行（プレイヤー名は固定テキスト「勇者よ」）
  const npcDialogue =
    "勇者よ、あなたにのみ託された使命がある。\n散らかり果てた王国に再び秩序をもたらし、失われた美しさを取り戻すのです。\n各ダンジョンには、かの邪悪なボスが待ち受けています。\n『片方見つからないソックスライム』、そして『リバウンドラゴン』…彼らを打ち倒し、再び平和とか輝きに満ちたクローゼット王国を取り戻すのです！"

  // 冒険の始まりテキスト - 各文を改行
  const adventureText =
    "冒険の始まり：\n\nここからあなたは、自らの『職業』を選び、断捨離の剣士、空間デザインの魔法使い、または時短の錬金術師として、各エリアに潜む混沌を一掃するための旅に出ます。\n初めは小さなクエストから始まり、ひとつひとつの達成があなたを強くします。\nそしてクローゼット王国が再び輝きを取り戻すまさにその時、あなたは国を統治する偉大な王になるのです。\n\nさぁ、行ってらっしゃい！"

  // 効果音を再生する関数（依存：isMuted, audioEnabled）
  const playSound = useCallback((soundName: string) => {
    if (isMuted || !audioEnabled) return

    try {
      if (soundName === "prologue") {
        // プロローグ音楽はループ再生する
        if (!prologueAudioRef.current) {
          prologueAudioRef.current = new Audio("/sounds/prologue.mp3")
          prologueAudioRef.current.loop = true
        }
        prologueAudioRef.current.play()
      } else {
        console.log(`効果音再生: ${soundName}`)
      }
    } catch (error) {
      console.log(`効果音の再生に失敗: ${soundName}`, error)
    }
  }, [isMuted, audioEnabled])

  // シーンの自動進行を管理
  useEffect(() => {
    if (currentScene === "start") return

    const progressScene = async () => {
      if (currentScene === "prologue") {
        playSound("prologue")
        await delay(5000)
        playSound("transition")
        setCurrentScene("narration1")
      } else if (currentScene === "narration1" && textProgress >= narration1Text.length && !isTyping) {
        await delay(2000)
        playSound("transition")
        playSound("narration2")
        setTextProgress(0)
        setCurrentScene("narration2")
      } else if (currentScene === "narration2" && textProgress >= narration2Text.length && !isTyping) {
        await delay(2000)
        playSound("transition")
        playSound("npc")
        setTextProgress(0)
        setCurrentScene("npc")
      } else if (currentScene === "npc" && textProgress >= npcDialogue.length && !isTyping) {
        await delay(2000)
        playSound("transition")
        playSound("adventure")
        setTextProgress(0)
        setCurrentScene("adventure")
      } else if (currentScene === "adventure" && textProgress >= adventureText.length && !isTyping) {
        await delay(3000)
        if (prologueAudioRef.current) {
          prologueAudioRef.current.pause()
          prologueAudioRef.current.currentTime = 0
        }
        setCurrentScene("complete")
        if (onComplete) onComplete()
      }
    }

    progressScene()
  }, [currentScene, textProgress, isTyping, onComplete, isMuted, audioEnabled, playSound])

  useEffect(() => {
    if (currentScene === "narration1") {
      playSound("narration1")
    } else if (currentScene === "narration2") {
      playSound("narration2")
    }
  }, [currentScene, playSound])

  // テキストのタイピングエフェクトを管理
  useEffect(() => {
    const getCurrentText = () => {
      switch (currentScene) {
        case "narration1":
          return narration1Text
        case "narration2":
          return narration2Text
        case "npc":
          return npcDialogue
        case "adventure":
          return adventureText
        default:
          return ""
      }
    }

    const currentText = getCurrentText()

    if (["narration1", "narration2", "npc", "adventure"].includes(currentScene) && textProgress < currentText.length) {
      setIsTyping(true)
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      typingTimerRef.current = setTimeout(() => {
        setTextProgress((prev) => {
          if (prev % 3 === 0) {
            playSound("typing")
          }
          return prev + 1
        })
      }, 100)
    } else {
      setIsTyping(false)
    }

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [currentScene, textProgress, playSound])

  const skipToNextScene = () => {
    if (isTyping) {
      const currentText =
        currentScene === "narration1"
          ? narration1Text
          : currentScene === "narration2"
            ? narration2Text
            : currentScene === "npc"
              ? npcDialogue
              : adventureText
      setTextProgress(currentText.length)
      return
    }

    switch (currentScene) {
      case "prologue":
        playSound("transition")
        setCurrentScene("narration1")
        break
      case "narration1":
        playSound("transition")
        playSound("narration2")
        setTextProgress(0)
        setCurrentScene("narration2")
        break
      case "narration2":
        playSound("transition")
        playSound("npc")
        setTextProgress(0)
        setCurrentScene("npc")
        break
      case "npc":
        playSound("transition")
        playSound("adventure")
        setTextProgress(0)
        setCurrentScene("adventure")
        break
      case "adventure":
        setCurrentScene("complete")
        if (onComplete) onComplete()
        break
      default:
        break
    }
  }

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const startPrologue = () => {
    setAudioEnabled(true)
    setCurrentScene("prologue")
    playSound("prologue")
  }

  const getBackgroundColor = () => {
    switch (currentScene) {
      case "narration1":
        return "bg-orange-400"
      case "narration2":
        return "bg-gray-800"
      default:
        return "bg-gradient-to-b from-blue-950 to-blue-900"
    }
  }

  const decorativeElements = ["❤️", "✨", "💫", "💕", "⭐", "💖", "🌟"]

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${getBackgroundColor()} flex flex-col items-center justify-center transition-colors duration-1000`}
    >
      {(currentScene === "start" ||
        currentScene === "prologue" ||
        currentScene === "npc" ||
        currentScene === "adventure") && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {currentScene === "narration1" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => {
            const element = decorativeElements[Math.floor(Math.random() * decorativeElements.length)]
            const size = Math.random() * 1.5 + 1
            const duration = Math.random() * 10 + 15
            const delay = Math.random() * 10

            return (
              <div
                key={`deco-${i}`}
                className="absolute animate-falling"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-50px`,
                  fontSize: `${size}rem`,
                  opacity: Math.random() * 0.3 + 0.7,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              >
                {element}
              </div>
            )
          })}
        </div>
      )}

      {currentScene === "start" && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-yellow-300 tracking-wider mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            乱れしクローゼット王国
          </h1>
          <p className="text-white mb-8 text-lg">
            物語を始めるには下のボタンをクリックしてください
          </p>
          <Button
            onClick={startPrologue}
            className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-6 rounded-full text-lg shadow-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            物語を始める
          </Button>
          <p className="text-xs text-gray-300 mt-2">
            ※この先、効果音が鳴ります（音楽：魔王魂）。
          </p>
        </motion.div>
      )}

      {currentScene !== "start" && (
        <div className="absolute top-6 right-6 z-50 flex space-x-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-blue-800/30"
              onClick={toggleMute}
              title={isMuted ? "音を有効にする" : "音を無効にする"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </motion.div>
          {showSkipButton && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-blue-800/30"
                onClick={skipToNextScene}
              >
                <SkipForward className="mr-2 h-4 w-4" />
                {isTyping ? "テキストを完了" : "スキップ"}
              </Button>
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentScene === "prologue" && (
          <motion.div
            key="prologue"
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-300 tracking-wider mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              乱れしクローゼット王国
            </h1>
          </motion.div>
        )}

        {currentScene === "narration1" && (
          <motion.div
            key="narration1"
            className="max-w-2xl mx-auto p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="text-lg md:text-xl text-white leading-relaxed drop-shadow-md whitespace-pre-line text-left">
              {narration1Text.substring(0, textProgress)}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </motion.div>
        )}

        {currentScene === "narration2" && (
          <motion.div
            key="narration2"
            className="max-w-2xl mx-auto p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="text-lg md:text-xl text-white leading-relaxed drop-shadow-md whitespace-pre-line text-left">
              {narration2Text.substring(0, textProgress)}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </motion.div>
        )}

        {currentScene === "npc" && (
          <motion.div
            key="npc"
            className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="relative mb-8 w-full flex justify-center">
              <div className="absolute inset-0 bg-blue-900/50 rounded-lg backdrop-blur-sm"></div>
              <motion.div
                className="relative z-10 mt-4"
                animate={{ y: [0, -10, 0], scale: [1, 1.02, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4, ease: "easeInOut" }}
              >
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
                  <Image
                    src="/images/cow-fairy.webp"
                    alt="片づけの妖精：モーちゃん"
                    width={160}
                    height={160}
                    objectFit="cover"
                  />
                </div>
                <div className="mt-2 text-center text-white font-medium">
                  <span className="bg-yellow-600/70 px-3 py-1 rounded-full text-sm">
                    片づけの妖精：モーちゃん
                  </span>
                </div>
              </motion.div>
            </div>
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-xl max-w-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-lg text-white leading-relaxed whitespace-pre-line text-left">
                {npcDialogue.substring(0, textProgress)}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </motion.div>
          </motion.div>
        )}

        {currentScene === "adventure" && (
          <motion.div
            key="adventure"
            className="max-w-2xl mx-auto p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              冒険の始まり
            </h2>
            <p className="text-lg md:text-xl text-white leading-relaxed whitespace-pre-line text-left">
              {adventureText.substring(10, textProgress)}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
            {textProgress >= adventureText.length && (
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-yellow-300/30 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0.1; }
          100% { opacity: 0.7; }
        }
        @keyframes falling {
          0% { 
            transform: translateY(-10px) rotate(0deg); 
            opacity: 0;
          }
          10% { opacity: 1; }
          100% { 
            transform: translateY(100vh) rotate(360deg); 
            opacity: 0.7;
          }
        }
        .animate-falling {
          animation: falling linear forwards;
        }
      `}</style>
    </div>
  )
}
