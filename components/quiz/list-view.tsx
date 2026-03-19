"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Star, Filter, Sun, Heart, ArrowLeft, MapPin, ChevronUp, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getQuestionsByBank, type Question, type QuestionBank } from "@/lib/quiz-data"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BankSelector } from "./bank-selector"

interface ListViewProps {
  starredIdsA: number[]
  starredIdsB: number[]
  onToggleStarA: (id: number) => void
  onToggleStarB: (id: number) => void
  bookmarkA: number | null
  bookmarkB: number | null
  onSetBookmarkA: (id: number | null) => void
  onSetBookmarkB: (id: number | null) => void
}

export function ListView({
  starredIdsA,
  starredIdsB,
  onToggleStarA,
  onToggleStarB,
  bookmarkA,
  bookmarkB,
  onSetBookmarkA,
  onSetBookmarkB,
}: ListViewProps) {
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null)
  const [showStarredOnly, setShowStarredOnly] = useState(false)
  const [showJumpMenu, setShowJumpMenu] = useState(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const longPressTriggeredRef = useRef(false)
  const questionRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const questions = selectedBank ? getQuestionsByBank(selectedBank) : []
  const starredIds = selectedBank === "A" ? starredIdsA : starredIdsB
  const onToggleStar = selectedBank === "A" ? onToggleStarA : onToggleStarB
  const bookmark = selectedBank === "A" ? bookmarkA : bookmarkB
  const onSetBookmark = selectedBank === "A" ? onSetBookmarkA : onSetBookmarkB

  const filteredQuestions = showStarredOnly
    ? questions.filter((q) => starredIds.includes(q.id))
    : questions

  const handleLongPressStart = useCallback((id: number) => {
    longPressTriggeredRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      onToggleStar(id)
    }, 500)
  }, [onToggleStar])

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const scrollToQuestion = useCallback((id: number) => {
    const element = questionRefs.current.get(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [])

  const scrollToBookmark = useCallback(() => {
    if (bookmark) {
      scrollToQuestion(bookmark)
    }
  }, [bookmark, scrollToQuestion])

  const handleJumpTo = useCallback((position: string) => {
    setShowJumpMenu(false)
    const totalQuestions = questions.length
    
    if (position === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    if (position === "bottom") {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
      return
    }
    
    const targetIndex = parseInt(position)
    if (!isNaN(targetIndex) && targetIndex <= totalQuestions) {
      const targetQuestion = questions[targetIndex - 1]
      if (targetQuestion) {
        scrollToQuestion(targetQuestion.id)
      }
    }
  }, [questions, scrollToQuestion])

  // Generate jump options based on total questions
  const jumpOptions = useCallback(() => {
    const totalQuestions = questions.length
    const options: string[] = ["top"]
    for (let i = 100; i <= Math.min(totalQuestions, 900); i += 100) {
      options.push(i.toString())
    }
    options.push("bottom")
    return options
  }, [questions.length])

  if (!selectedBank) {
    return <BankSelector onSelectBank={setSelectedBank} />
  }

  return (
    <div className="space-y-4 relative">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSelectedBank(null)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回選擇題本
      </Button>

      {/* Bank Title */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          題本 {selectedBank}
        </h2>
        <p className="text-sm text-muted-foreground">
          共 {questions.length} 題
        </p>
      </div>

      {/* Filter Toggle */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">須注意</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">（星號標記）</span>
            </div>
            <div className="flex items-center gap-2">
              {bookmark && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollToBookmark}
                  className="flex items-center gap-1 text-xs"
                >
                  <MapPin className="h-3 w-3" />
                  跳至書籤
                </Button>
              )}
              <Switch
                checked={showStarredOnly}
                onCheckedChange={setShowStarredOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hint */}
      <p className="text-xs text-muted-foreground text-center">
        長按題目可標記星號
      </p>

      {/* Question List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">尚無標記的題目</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              ref={(el) => {
                if (el) questionRefs.current.set(question.id, el)
              }}
              question={question}
              isStarred={starredIds.includes(question.id)}
              isBookmarked={bookmark === question.id}
              onLongPressStart={() => handleLongPressStart(question.id)}
              onLongPressEnd={handleLongPressEnd}
              onToggleStar={() => onToggleStar(question.id)}
              onToggleBookmark={() => 
                onSetBookmark(bookmark === question.id ? null : question.id)
              }
            />
          ))
        )}
      </div>

      {/* Floating Jump Button */}
      <div className="fixed bottom-24 left-4 md:bottom-8 z-50">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => setShowJumpMenu(!showJumpMenu)}
        >
          <Heart className={cn("h-5 w-5", showJumpMenu && "fill-primary-foreground")} />
        </Button>

        {/* Jump Menu */}
        {showJumpMenu && (
          <Card className="absolute bottom-14 left-0 w-32 shadow-xl border-primary/20">
            <CardContent className="p-2">
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                {jumpOptions().map((option) => (
                  <Button
                    key={option}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => handleJumpTo(option)}
                  >
                    {option === "top" ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        最上面
                      </>
                    ) : option === "bottom" ? (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        最下面
                      </>
                    ) : (
                      `${option} 題`
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Backdrop for jump menu */}
      {showJumpMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowJumpMenu(false)} 
        />
      )}
    </div>
  )
}

interface QuestionCardProps {
  question: Question
  isStarred: boolean
  isBookmarked: boolean
  onLongPressStart: () => void
  onLongPressEnd: () => void
  onToggleStar: () => void
  onToggleBookmark: () => void
}

import { forwardRef } from "react"

const QuestionCard = forwardRef<HTMLDivElement, QuestionCardProps>(
  function QuestionCard(
    {
      question,
      isStarred,
      isBookmarked,
      onLongPressStart,
      onLongPressEnd,
      onToggleStar,
      onToggleBookmark,
    },
    ref
  ) {
    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-200 select-none",
          "hover:shadow-md",
          isStarred && "ring-2 ring-warning ring-offset-2",
          isBookmarked && "border-amber-400 border-2"
        )}
        onMouseDown={onLongPressStart}
        onMouseUp={onLongPressEnd}
        onMouseLeave={onLongPressEnd}
        onTouchStart={onLongPressStart}
        onTouchEnd={onLongPressEnd}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">#{question.id}</span>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {question.question}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar()
                }}
                className={cn(
                  "flex-shrink-0 p-1.5 rounded-full transition-all duration-200",
                  "hover:bg-secondary active:scale-90",
                  isStarred ? "text-warning" : "text-muted-foreground"
                )}
              >
                <Star className={cn("h-5 w-5", isStarred && "fill-warning")} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleBookmark()
                }}
                className={cn(
                  "flex-shrink-0 p-1.5 rounded-full transition-all duration-200",
                  "hover:bg-secondary active:scale-90",
                  isBookmarked ? "text-amber-500" : "text-muted-foreground"
                )}
              >
                <Sun className={cn("h-5 w-5", isBookmarked && "fill-amber-500")} />
              </button>
            </div>
          </div>

          {/* Options - Always Visible */}
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            {(["A", "B", "C", "D"] as const).map((key) => (
              <div
                key={key}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-lg text-sm",
                  key === question.answer
                    ? "bg-success/10 text-success font-medium"
                    : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                    key === question.answer
                      ? "bg-success text-success-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {key}
                </span>
                <span className="pt-0.5">{question.options[key]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
)
