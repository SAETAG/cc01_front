"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Volume2, VolumeX, ArrowRight, Check } from "lucide-react"
import { useRouter } from "next/router"

// 選択肢の型定義
type JobType = "断捨離の剣士" | "空間デザインの魔法使い" | "時短の錬金術師" | null
type BossType = "リバウンドラゴン" | "分身ゴーレム" | "無限増殖スライム" | null
type RewardType =
  | "透視の魔法がかかったクローゼット"
  | "瞬きの間に装いが決まるクローゼット"
  | "永遠の秩序を宿すクローゼット"
  | null

// ステップの型定義
type SetupStep = "job" | "boss" | "reward" | "confirm"

/**
 * 背景の星コンポーネント
 * クライアント側で乱数生成するため、SSR時との不整合を防止
 */
function RandomStars() {
  const [stars, setStars] = useState<
    { left: number; top: number; opacity: number; duration: number }[]
  >([])

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.7,
      duration: Math.random() * 5 + 3, // 3～8秒
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s infinite alternate`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * 落下装飾コンポーネント
 * 同様にクライアント側で乱数を生成してから表示
 */
function FallingDecorations() {
  const [decorations, setDecorations] = useState<
    { element: string; left: number; size: number; duration: number; delay: number; opacity: number }[]
  >([])

  useEffect(() => {
    const decorativeElements = ["✨", "💫", "⭐", "🌟", "💎", "🔮"]
    const newDecorations = Array.from({ length: 20 }).map(() => {
      const element =
        decorativeElements[Math.floor(Math.random() * decorativeElements.length)]
      const size = Math.random() * 1.5 + 1 // 1～2.5rem
      const duration = Math.random() * 10 + 15 // 15～25秒
      const delay = Math.random() * 10 // 0～10秒
      const left = Math.random() * 100
      const opacity = Math.random() * 0.3 + 0.7
      return { element, left, size, duration, delay, opacity }
    })
    setDecorations(newDecorations)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

export default function CharacterSetup() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<SetupStep>("job")
  const [selectedJob, setSelectedJob] = useState<JobType>(null)
  const [selectedBoss, setSelectedBoss] = useState<BossType>(null)
  const [selectedReward, setSelectedReward] = useState<RewardType>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // BGM用のAudio要素の参照
  const bgmRef = useRef<HTMLAudioElement | null>(null)

  // BGMの初期化と再生
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // public/sounds 配下のファイルを参照
        bgmRef.current = new Audio("/sounds/storysetting.mp3")
        bgmRef.current.loop = true
        bgmRef.current.volume = 0.5

        bgmRef.current.addEventListener("error", (e) => {
          console.error("BGMの読み込みに失敗しました:", e)
        })

        // ユーザーインタラクション後に再生開始
        const playBGM = () => {
          if (bgmRef.current) {
            bgmRef.current.play().catch((e) => {
              console.error("BGMの再生に失敗しました:", e)
              console.log("BGMなしで続行します")
            })
          }
          document.removeEventListener("click", playBGM)
        }

        document.addEventListener("click", playBGM)

        return () => {
          document.removeEventListener("click", playBGM)
          if (bgmRef.current) {
            bgmRef.current.pause()
            bgmRef.current = null
          }
        }
      } catch (error) {
        console.error("BGMの初期化に失敗しました:", error)
      }
    }
  }, [])

  // ミュート状態の切り替え
  const toggleMute = () => {
    setIsMuted((prev) => {
      if (bgmRef.current) {
        bgmRef.current.muted = !prev
      }
      return !prev
    })
  }

  // 次のステップに進む処理（useCallback で安定化）
  const goToNextStep = useCallback(() => {
    setIsTransitioning(true)
    console.log("効果音再生: 選択完了")

    setTimeout(() => {
      switch (currentStep) {
        case "job":
          setCurrentStep("boss")
          break
        case "boss":
          setCurrentStep("reward")
          break
        case "reward":
          setCurrentStep("confirm")
          break
        case "confirm":
          // BGM停止（フェードアウト処理）
          if (bgmRef.current) {
            try {
              const fadeOut = setInterval(() => {
                if (bgmRef.current && bgmRef.current.volume > 0.05) {
                  bgmRef.current.volume -= 0.05
                } else {
                  clearInterval(fadeOut)
                  if (bgmRef.current) {
                    bgmRef.current.pause()
                    bgmRef.current = null
                  }
                  router.push("/dashboard")
                }
              }, 100)
            } catch (error) {
              console.error("BGM停止中にエラーが発生しました:", error)
              router.push("/dashboard")
            }
          } else {
            router.push("/dashboard")
          }
          break
      }
      setIsTransitioning(false)
    }, 500)
  }, [currentStep, router])

  // 選択肢を保存する（モック実装）
  const saveSelection = (step: SetupStep) => {
    console.log(
      `${step}の選択を保存: `,
      step === "job" ? selectedJob : step === "boss" ? selectedBoss : selectedReward
    )
  }

  // 次へボタンの有効性判定
  const isNextButtonEnabled = () => {
    switch (currentStep) {
      case "job":
        return selectedJob !== null
      case "boss":
        return selectedBoss !== null
      case "reward":
        return selectedReward !== null
      case "confirm":
        return true
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-blue-950 to-blue-900 flex flex-col items-center justify-center">
      {/* 背景の星 */}
      <RandomStars />

      {/* 落下装飾 */}
      <FallingDecorations />

      {/* ミュートボタン */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-blue-800/30"
          onClick={toggleMute}
          title={isMuted ? "音を有効にする" : "音を無効にする"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* 牛の妖精キャラクター */}
          <motion.div
            key="fairy"
            className="mb-8 flex justify-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 4,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 bg-yellow-200 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg flex items-center justify-center">
                <Image
                  src="/images/cow-fairy.webp"
                  alt="モーちゃん"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="mt-2 text-center text-white font-medium">
                <span className="bg-yellow-600/70 px-3 py-1 rounded-full text-sm">モーちゃん</span>
              </div>
            </motion.div>
          </motion.div>

          {/* 各ステップのコンテンツ */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`bg-blue-900/50 backdrop-blur-md rounded-lg p-6 border border-blue-400/20 shadow-xl ${
              isTransitioning ? "pointer-events-none" : ""
            }`}
          >
            {/* 職業選択 */}
            {currentStep === "job" && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 text-center mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  勇者よ、あなたはどのタイプの勇者を目指すか？
                </h2>

                <RadioGroup
                  value={selectedJob || ""}
                  onValueChange={(value) => setSelectedJob(value as JobType)}
                  className="space-y-4"
                >
                  <JobOption
                    value="断捨離の剣士"
                    title="断捨離重視"
                    description="断捨離の剣士"
                    subtext="不要なものを素早く処分するのが得意"
                    isSelected={selectedJob === "断捨離の剣士"}
                  />

                  <JobOption
                    value="空間デザインの魔法使い"
                    title="美しい整理収納重視"
                    description="空間デザインの魔法使い"
                    subtext="見た目やレイアウトの美しさを追求"
                    isSelected={selectedJob === "空間デザインの魔法使い"}
                  />

                  <JobOption
                    value="時短の錬金術師"
                    title="効率のよい整理収納重視"
                    description="時短の錬金術師"
                    subtext="作業時間や動線を最適化するのが得意"
                    isSelected={selectedJob === "時短の錬金術師"}
                  />
                </RadioGroup>

                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => {
                      saveSelection("job")
                      goToNextStep()
                    }}
                    disabled={!isNextButtonEnabled()}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-2 rounded-full text-lg shadow-lg"
                  >
                    次へ進む <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* ボス選択 */}
            {currentStep === "boss" && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 text-center mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  今のクローゼットの問題は何かな？
                </h2>

                <RadioGroup
                  value={selectedBoss || ""}
                  onValueChange={(value) => setSelectedBoss(value as BossType)}
                  className="space-y-4"
                >
                  <BossOption
                    value="リバウンドラゴン"
                    title="片付けてもすぐにリバウンドする"
                    description="リバウンドラゴン"
                    isSelected={selectedBoss === "リバウンドラゴン"}
                  />

                  <BossOption
                    value="分身ゴーレム"
                    title="どこになにがあるのかわからない"
                    description="分身ゴーレム"
                    isSelected={selectedBoss === "分身ゴーレム"}
                  />

                  <BossOption
                    value="無限増殖スライム"
                    title="物が増えすぎる"
                    description="無限増殖スライム"
                    isSelected={selectedBoss === "無限増殖スライム"}
                  />
                </RadioGroup>

                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => {
                      saveSelection("boss")
                      goToNextStep()
                    }}
                    disabled={!isNextButtonEnabled()}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-2 rounded-full text-lg shadow-lg"
                  >
                    次へ進む <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* 報酬選択 */}
            {currentStep === "reward" && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 text-center mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  どんなクローゼットにしたい？
                </h2>

                <RadioGroup
                  value={selectedReward || ""}
                  onValueChange={(value) => setSelectedReward(value as RewardType)}
                  className="space-y-4"
                >
                  <RewardOption
                    value="透視の魔法がかかったクローゼット"
                    title="一目でどこに何があるのかわかる"
                    description="透視の魔法がかかったクローゼット"
                    isSelected={selectedReward === "透視の魔法がかかったクローゼット"}
                  />

                  <RewardOption
                    value="瞬きの間に装いが決まるクローゼット"
                    title="すぐにコーディネートが決まる"
                    description="瞬きの間に装いが決まるクローゼット"
                    isSelected={selectedReward === "瞬きの間に装いが決まるクローゼット"}
                  />

                  <RewardOption
                    value="永遠の秩序を宿すクローゼット"
                    title="綺麗な状態がずっと続く"
                    description="永遠の秩序を宿すクローゼット"
                    isSelected={selectedReward === "永遠の秩序を宿すクローゼット"}
                  />
                </RadioGroup>

                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => {
                      saveSelection("reward")
                      goToNextStep()
                    }}
                    disabled={!isNextButtonEnabled()}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-2 rounded-full text-lg shadow-lg"
                  >
                    次へ進む <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* 最終確認 */}
            {currentStep === "confirm" && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 text-center mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  冒険の準備が整いました！
                </h2>

                <div className="space-y-4">
                  <Card className="bg-blue-800/50 border-blue-400/30">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-yellow-200 mb-2">あなたの職業</h3>
                      <p className="text-white text-xl">{selectedJob}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-800/50 border-blue-400/30">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-yellow-200 mb-2">倒すべきボス</h3>
                      <p className="text-white text-xl">{selectedBoss}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-800/50 border-blue-400/30">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-yellow-200 mb-2">目指す最終報酬</h3>
                      <p className="text-white text-xl">{selectedReward}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    onClick={goToNextStep}
                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full text-lg shadow-lg"
                  >
                    これでOK <Check className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

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

// 職業選択オプションコンポーネント
function JobOption({
  value,
  title,
  description,
  subtext,
  isSelected,
}: {
  value: string
  title: string
  description: string
  subtext: string
  isSelected: boolean
}) {
  return (
    <div
      className={`relative rounded-lg border-2 p-4 transition-all duration-300 ${
        isSelected
          ? "border-yellow-400 bg-blue-800/70 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          : "border-blue-400/30 bg-blue-800/30 hover:bg-blue-800/50"
      }`}
    >
      <div className="flex items-start">
        <RadioGroupItem value={value} id={value} className="sr-only" />
        <Label htmlFor={value} className="flex flex-1 cursor-pointer items-start gap-2">
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="text-lg font-semibold text-white">{title}</div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center"
                >
                  <Check className="h-4 w-4 text-blue-900" />
                </motion.div>
              )}
            </div>
            <div className="text-xl font-bold text-purple-300 mt-1">{description}</div>
            <div className="text-blue-100 mt-1">{subtext}</div>
          </div>
        </Label>
      </div>
    </div>
  )
}

// ボス選択オプションコンポーネント
function BossOption({
  value,
  title,
  description,
  isSelected,
}: {
  value: string
  title: string
  description: string
  isSelected: boolean
}) {
  return (
    <div
      className={`relative rounded-lg border-2 p-4 transition-all duration-300 ${
        isSelected
          ? "border-yellow-400 bg-blue-800/70 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          : "border-blue-400/30 bg-blue-800/30 hover:bg-blue-800/50"
      }`}
    >
      <div className="flex items-start">
        <RadioGroupItem value={value} id={value} className="sr-only" />
        <Label htmlFor={value} className="flex flex-1 cursor-pointer items-start gap-2">
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="text-lg font-semibold text-white">{title}</div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center"
                >
                  <Check className="h-4 w-4 text-blue-900" />
                </motion.div>
              )}
            </div>
            <div className="text-xl font-bold text-purple-300 mt-1">{description}</div>
          </div>
        </Label>
      </div>
    </div>
  )
}

// 報酬選択オプションコンポーネント
function RewardOption({
  value,
  title,
  description,
  isSelected,
}: {
  value: string
  title: string
  description: string
  isSelected: boolean
}) {
  return (
    <div
      className={`relative rounded-lg border-2 p-4 transition-all duration-300 ${
        isSelected
          ? "border-yellow-400 bg-blue-800/70 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          : "border-blue-400/30 bg-blue-800/30 hover:bg-blue-800/50"
      }`}
    >
      <div className="flex items-start">
        <RadioGroupItem value={value} id={value} className="sr-only" />
        <Label htmlFor={value} className="flex flex-1 cursor-pointer items-start gap-2">
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="text-lg font-semibold text-white">{title}</div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center"
                >
                  <Check className="h-4 w-4 text-blue-900" />
                </motion.div>
              )}
            </div>
            <div className="text-xl font-bold text-purple-300 mt-1">{description}</div>
          </div>
        </Label>
      </div>
    </div>
  )
}
