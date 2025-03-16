"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SkipForward, Volume2, VolumeX, Play, ArrowRight } from "lucide-react"
import { delay } from "@/lib/utils"
import { useRouter } from "next/navigation"

// シーンの種類を定義
type SceneType = "start" | "prologue" | "narration1" | "narration2" | "npc" | "adventure" | "complete" | "end"

export default function PrologueScene({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter()
  const [currentScene, setCurrentScene] = useState<SceneType>("start")
  const [textProgress, setTextProgress] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [showSkipButton, setShowSkipButton] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)

  // テキストのタイピングエフェクト用のタイマー参照
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  // BGM用のAudio要素の参照
  const bgmRef = useRef<HTMLAudioElement | null>(null)

  // BGMの初期化と再生
  useEffect(() => {
    if (typeof window !== "undefined" && audioEnabled) {
      try {
        // BGMの初期化
        bgmRef.current = new Audio("/sounds/prologue.mp3")
        bgmRef.current.loop = true
        bgmRef.current.volume = 0.5

        // ミュート状態を反映
        if (bgmRef.current) {
          bgmRef.current.muted = isMuted
        }

        // BGMの再生
        bgmRef.current.play().catch((e) => {
          console.error("BGMの再生に失敗しました:", e)
        })

        // コンポーネントのアンマウント時にBGMを停止
        return () => {
          if (bgmRef.current) {
            bgmRef.current.pause()
            bgmRef.current = null
          }
        }
      } catch (error) {
        console.error("BGMの初期化に失敗しました:", error)
      }
    }
  }, [audioEnabled, isMuted])

  // ナレーションテキスト（2つに分割）- 各文を改行
  const narration1Text =
    "かつて、クローゼット王国は調和と美しさに満ちた世界でした。\nすべての衣装や小物は、まるで魔法のようにその居場所を知り、王国は輝いていたのです。"

  const narration2Text =
    "しかし、ある日、突如として現れた『混沌の呪い』が王国に暗い影を落としました。\n棚は乱れ、衣装は迷宮のごとく入り組み、かつての秩序は音を立てて崩れ去っていきました。"

  // NPCの台詞 - 各文を改行（プレイヤー名を固定テキスト「勇者よ」に変更）
  const npcDialogue =
    "勇者よ、あなたにのみ託された使命がある。\n散らかり果てた王国に再び秩序をもたらし、失われた美しさを取り戻すのです。\n各ダンジョンには、かの邪悪なボスが待ち受けています。\n『片方見つからないソックスライム』、そして『リバウンドラゴン』…彼らを打ち倒し、再び平和とか輝きに満ちたクローゼット王国を取り戻すのです！"

  // 冒険の始まりテキスト - 各文を改行
  const adventureText =
    "冒険の始まり：\n\nここからあなたは、自らの『職業』を選び、断捨離の剣士、空間デザインの魔法使い、または時短の錬金術師として、各エリアに潜む混沌を一掃するための旅に出ます。\n初めは小さなクエストから始まり、ひとつひとつの達成があなたを強くします。\nそしてクローゼット王国が再び輝きを取り戻すまさにその時、あなたは国を統治する偉大な王になるのです。\n\nさぁ、行ってらっしゃい！"

  // 効果音を再生する関数
  const playSound = (soundName: string) => {
    if (isMuted || !audioEnabled) return

    try {
      // 効果音を再生するコード
      // 実際のプロジェクトでは、ここで効果音を再生します
      // 例: 効果音をコンソールに出力
      console.log(`効果音再生: ${soundName}`)
    } catch (error) {
      console.log(`効果音の再生に失敗: ${soundName}`)
    }
  }

  // シーンの自動進行を管理
  useEffect(() => {
    if (currentScene === "start") return // スタート画面では自動進行しない

    const progressScene = async () => {
      if (currentScene === "prologue") {
        // プロローグシーン開始時に効果音を再生
        playSound("prologue")

        // プロローグシーンは5秒表示後に次へ
        await delay(5000)
        playSound("transition")
        setCurrentScene("narration1")
      } else if (currentScene === "narration1" && textProgress >= narration1Text.length && !isTyping) {
        // 最初のナレーションが完了したら2秒後に次のナレーションへ
        await delay(2000)
        playSound("transition")
        playSound("narration2")
        setTextProgress(0)
        setCurrentScene("narration2")
      } else if (currentScene === "narration2" && textProgress >= narration2Text.length && !isTyping) {
        // 2つ目のナレーションが完了したら2秒後にNPCシーンへ
        await delay(2000)
        playSound("transition")
        playSound("npc")
        setTextProgress(0)
        setCurrentScene("npc")
      } else if (currentScene === "npc" && textProgress >= npcDialogue.length && !isTyping) {
        // NPCの台詞が完了したら2秒後に冒険シーンへ
        await delay(2000)
        playSound("transition")
        playSound("adventure")
        setTextProgress(0)
        setCurrentScene("adventure")
      } else if (currentScene === "adventure" && textProgress >= adventureText.length && !isTyping) {
        // 冒険シーンが完了したら3秒後に最終画面へ
        await delay(3000)
        setCurrentScene("complete")
      }
    }

    progressScene()
  }, [currentScene, textProgress, isTyping, onComplete, isMuted, audioEnabled])

  // シーン変更時に対応する効果音を再生
  useEffect(() => {
    if (currentScene === "narration1") {
      playSound("narration1")
    } else if (currentScene === "narration2") {
      playSound("narration2")
    }
  }, [currentScene])

  // テキストのタイピングエフェクトを管理
  useEffect(() => {
    // 現在のシーンに応じたテキストを取得
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

    // タイピングエフェクトが必要なシーンの場合
    if (["narration1", "narration2", "npc", "adventure"].includes(currentScene) && textProgress < currentText.length) {
      setIsTyping(true)

      // 前のタイマーをクリア
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }

      // 次の文字を表示するタイマーをセット
      typingTimerRef.current = setTimeout(() => {
        setTextProgress((prev) => {
          // 文字が追加されるたびにタイピング音を再生（一定間隔で）
          if (prev % 3 === 0) {
            playSound("typing")
          }
          return prev + 1
        })
      }, 100) // 文字表示の速度を調整
    } else {
      setIsTyping(false)
    }

    // クリーンアップ関数
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [currentScene, textProgress])

  // シーンをスキップする関数
  const skipToNextScene = () => {
    // タイピング中の場合はテキストを完了させる
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

    // 次のシーンに進む
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
  }

  // ミュート状態を切り替える関数
  const toggleMute = () => {
    setIsMuted((prev) => {
      // BGMのミュート状態も更新
      if (bgmRef.current) {
        bgmRef.current.muted = !prev
      }
      return !prev
    })
  }

  // プロローグを開始する関数
  const startPrologue = () => {
    setAudioEnabled(true)
    setCurrentScene("prologue")
  }

  // 現在のシーンに基づいて背景色を取得
  const getBackgroundColor = () => {
    switch (currentScene) {
      case "narration1":
        return "bg-orange-400" // 明るいオレンジ
      case "narration2":
        return "bg-gray-800" // 暗い灰色
      default:
        return "bg-gradient-to-b from-blue-950 to-blue-900" // デフォルトの背景
    }
  }

  // オレンジ背景用の装飾要素（ハート、星など）
  const decorativeElements = ["❤️", "✨", "💫", "💕", "⭐", "💖", "🌟"]

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${getBackgroundColor()} flex flex-col items-center justify-center transition-colors duration-1000`}
    >
      {/* 背景の星や光の粒子効果（スタート、プロローグ、NPC、冒険シーンのみ） */}
      {(currentScene === "start" ||
        currentScene === "prologue" ||
        currentScene === "npc" ||
        currentScene === "adventure" ||
        currentScene === "complete") && (
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

      {/* オレンジ背景用の装飾要素（ハート、星など）- narration1シーンのみ */}
      {currentScene === "narration1" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => {
            const element = decorativeElements[Math.floor(Math.random() * decorativeElements.length)]
            const size = Math.random() * 1.5 + 1 // 1~2.5rem
            const duration = Math.random() * 10 + 15 // 15~25秒
            const delay = Math.random() * 10 // 0~10秒

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
          <Button
            onClick={startPrologue}
            className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-6 rounded-full text-lg shadow-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            物語を始める
          </Button>
          {/* 効果音案内テキストの追加 */}
          <p className="text-xs text-gray-300 mt-2">
            以降、効果音が鳴ります（音楽：魔王魂）
          </p>
        </motion.div>
      )}

      {/* スキップボタンとミュートボタン（スタート画面以外で表示） */}
      {currentScene !== "start" && (
        <div className="absolute top-6 right-6 z-50 flex space-x-2">
          {/* ミュートボタン */}
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

          {/* スキップボタン */}
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

      {/* プロローグシーン */}
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

        {/* ナレーションシーン1（明るいオレンジ背景） */}
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

        {/* ナレーションシーン2（暗い灰色背景） */}
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

        {/* NPCシーン */}
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
              {/* 背景イメージ - 乱れたクローゼット */}
              <div className="absolute inset-0 bg-blue-900/50 rounded-lg backdrop-blur-sm"></div>

              {/* 牛の妖精キャラクター */}
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
                <div className="w-40 h-40 bg-yellow-200 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg flex items-center justify-center">
                  <img src="/images/cow-fairy.webp" alt="牛の妖精" className="w-full h-full object-cover" />
                </div>
                <div className="mt-2 text-center text-white font-medium">
                  <span className="bg-yellow-600/70 px-3 py-1 rounded-full text-sm">牛の妖精</span>
                </div>
              </motion.div>
            </div>

            {/* 台詞表示 */}
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

        {/* 冒険の始まりシーン */}
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

            {/* 光の演出（テキストが完了したら表示） */}
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

        {/* 完了画面 - 冒険の準備へのボタン */}
        {currentScene === "complete" && (
          <motion.div
            key="complete"
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-300 tracking-wider mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              プロローグ完了
            </h1>
            <p className="text-white mb-8 text-lg">冒険の準備を始めましょう</p>
            <Button
              onClick={() => {
                // BGMをフェードアウトして停止
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
                      // onCompleteがあれば実行
                      if (onComplete) onComplete()
                      // charasetへ遷移
                      router.push("/charaset")
                    }
                  }, 100)
                } else {
                  // onCompleteがあれば実行
                  if (onComplete) onComplete()
                  // charasetへ遷移
                  router.push("/charaset")
                }
              }}
              className="bg-green-600 hover:bg-green-500 text-white px-8 py-6 rounded-full text-lg shadow-lg"
            >
              冒険の準備を始める <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* カスタムスタイル */}
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
