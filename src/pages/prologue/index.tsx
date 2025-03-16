"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { SkipForward, Volume2, VolumeX, Play, ArrowRight } from "lucide-react"
import { delay } from "@/lib/utils"
import BackgroundParticles from "@/components/BackgroundParticles"
import OrangeDecorations from "@/components/OrangeDecorations"
import { useRouter } from "next/navigation"

// シーンの種類を定義
type SceneType = "start" | "prologue" | "narration1" | "narration2" | "npc" | "adventure" | "complete" | "end"

export default function PrologueScene({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter()
  const [currentScene, setCurrentScene] = useState<SceneType>("start")
  const [textProgress, setTextProgress] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const showSkipButton = true
  const [isMuted, setIsMuted] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  // タイピングエフェクト用タイマー
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  // BGM用 Audio 要素の参照
  const bgmRef = useRef<HTMLAudioElement | null>(null)

  // テキスト定義
  const narration1Text =
    "かつて、クローゼット王国は調和と美しさに満ちた世界でした。\nすべての衣装や小物は、まるで魔法のようにその居場所を知り、王国は輝いていたのです。"

  const narration2Text =
    "しかし、ある日、突如として現れた『混沌の呪い』が王国に暗い影を落としました。\n棚は乱れ、衣装は迷宮のごとく入り組み、かつての秩序は音を立てて崩れ去っていきました。"

  const npcDialogue =
    "勇者よ、あなたにのみ託された使命がある。\n散らかり果てた王国に再び秩序をもたらし、失われた美しさを取り戻すのです。\n『片方見つからないソックスライム』、そして『リバウンドラゴン』…彼らを打ち倒し、再び平和と輝きに満ちたクローゼットを取り戻すのです！"

  const adventureText =
    "冒険の始まり：\n\nここからあなたは、自らの『職業』を選び、断捨離の剣士、空間デザインの魔法使い、または時短の錬金術師として、各エリアに潜む混沌を一掃するための旅に出ます。\n初めは小さなクエストから始まり、ひとつひとつの達成があなたを強くします。\nそしてクローゼット王国が再び輝きを取り戻すまさにその時、あなたは国を統治する偉大な王になるのです。\n\nさぁ選ばれし勇者よ、行ってらっしゃい！"

  // 効果音再生関数（isMuted, audioEnabled に依存）
  const playSound = useCallback(
    (soundName: string) => {
      if (isMuted || !audioEnabled) return
      try {
        console.log(`効果音再生: ${soundName}`)
      } catch {
        console.log(`効果音の再生に失敗: ${soundName}`)
      }
    },
    [isMuted, audioEnabled],
  )

  // BGMの初期化と再生（audioEnabled が true のときに実行）
  useEffect(() => {
    if (typeof window !== "undefined" && audioEnabled) {
      try {
        bgmRef.current = new Audio("/sounds/prologue.mp3")
        bgmRef.current.loop = true
        bgmRef.current.volume = 0.5
        bgmRef.current.muted = isMuted
        bgmRef.current.play().catch((e) => {
          console.error("BGMの再生に失敗しました:", e)
        })
      } catch (error) {
        console.error("BGMの初期化に失敗しました:", error)
      }
    }
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause()
        bgmRef.current = null
      }
    }
  }, [audioEnabled, isMuted])

  // シーンの自動進行管理
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
        setCurrentScene("complete")
      }
    }

    progressScene()
  }, [currentScene, textProgress, isTyping, playSound])

  // シーン変更時の効果音再生
  useEffect(() => {
    if (currentScene === "narration1") {
      playSound("narration1")
    } else if (currentScene === "narration2") {
      playSound("narration2")
    }
  }, [currentScene, playSound])

  // タイピングエフェクト管理
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
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
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
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [currentScene, textProgress, playSound])

  // シーンスキップ関数
  const skipToNextScene = useCallback(() => {
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
        break
      default:
        break
    }
  }, [isTyping, currentScene, narration1Text, narration2Text, npcDialogue, adventureText, playSound])

  // ミュート切替
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (bgmRef.current) {
        bgmRef.current.muted = !prev
      }
      return !prev
    })
  }, [])

  // プロローグ開始（ボタン押下で実行）
  const startPrologue = () => {
    setAudioEnabled(true)
    setCurrentScene("prologue")
  }

  // 背景色設定
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

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${getBackgroundColor()} flex flex-col items-center justify-center transition-colors duration-1000`}
    >
      {/* 背景パーティクル（スタート、プロローグ、NPC、冒険、完了シーン） */}
      {["start", "prologue", "npc", "adventure", "complete"].includes(currentScene) && (
        <BackgroundParticles count={50} />
      )}

      {/* narration1 の場合のみオレンジ装飾 */}
      {currentScene === "narration1" && <OrangeDecorations count={30} />}

      {/* スタート画面 */}
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
          <p className="text-white mb-8 text-lg">物語を始めるには下のボタンをクリックしてください</p>
          <button
            onClick={startPrologue}
            className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-6 rounded-full text-lg shadow-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            物語を始める
          </button>
          <p className="text-xs text-gray-300 mt-2">以降、効果音が鳴ります（音楽：魔王魂）</p>
        </motion.div>
      )}

      {/* スキップ＆ミュートボタン（スタート以外） */}
      {currentScene !== "start" && (
        <div className="absolute top-6 right-6 z-50 flex space-x-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <button
              onClick={toggleMute}
              className="text-white/70 hover:text-white hover:bg-blue-800/30 p-2 rounded"
              title={isMuted ? "音を有効にする" : "音を無効にする"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </motion.div>
          {showSkipButton && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <button
                onClick={skipToNextScene}
                className="text-white/70 hover:text-white hover:bg-blue-800/30 p-2 rounded flex items-center"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                {isTyping ? "テキストを完了" : "スキップ"}
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* シーン表示 */}
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
              {/* ★ 修正箇所: pointer-events-none を追加 */}
              <div className="pointer-events-none absolute inset-0 bg-blue-900/50 rounded-lg backdrop-blur-sm"></div>
              {/* ↑ これで透明オーバーレイがタップを拾わなくなる */}
              <motion.div
                className="relative z-10 mt-4"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 4,
                  ease: "easeInOut",
                }}
              >
                {/* 画像の親要素に relative を追加 */}
                <div className="relative w-40 h-40 bg-yellow-200 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg flex items-center justify-center">
                  <Image src="/images/cow-fairy.webp" alt="片づけの妖精：モーちゃん" layout="fill" objectFit="cover" />
                </div>
                <div className="mt-2 text-center text-white font-medium">
                  <span className="bg-yellow-600/70 px-3 py-1 rounded-full text-sm">片づけの妖精：モーちゃん</span>
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
                className="pointer-events-none absolute inset-0 bg-gradient-radial from-yellow-300/30 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
              />
            )}
          </motion.div>
        )}

        {currentScene === "complete" && (
          <motion.div
            key="complete"
            className="text-center w-full max-w-md mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-300 tracking-wider mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              プロローグ完了
            </h1>
            <p className="text-white mb-8 text-lg">冒険の準備を始めましょう</p>
            <div className="relative z-50">
              <button
                onClick={() => {
                  console.log("ボタンがクリックされました")
                  if (bgmRef.current) {
                    const fadeOut = setInterval(() => {
                      if (bgmRef.current && bgmRef.current.volume > 0.05) {
                        bgmRef.current.volume -= 0.05
                      } else {
                        clearInterval(fadeOut)
                        if (bgmRef.current) {
                          bgmRef.current.pause()
                          bgmRef.current = null
                        }
                        if (onComplete) onComplete()
                        router.push("/charaset")
                      }
                    }, 100)
                  } else {
                    if (onComplete) onComplete()
                    router.push("/charaset")
                  }
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full text-lg shadow-lg touch-manipulation"
              >
                冒険の準備を始める <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes twinkle {
          0% {
            opacity: 0.1;
          }
          100% {
            opacity: 0.7;
          }
        }
        @keyframes falling {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
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

