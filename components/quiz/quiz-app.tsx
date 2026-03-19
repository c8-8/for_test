"use client"

import { useState, useCallback } from "react"
import { Stethoscope } from "lucide-react"
import { Navigation, type ViewMode } from "./navigation"
import { ListView } from "./list-view"
import { QuizMode } from "./quiz-mode"
import { WrongAnswers } from "./wrong-answers"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { 
  STARRED_KEY_A, 
  STARRED_KEY_B, 
  WRONG_ANSWERS_KEY,
  BOOKMARK_KEY_A,
  BOOKMARK_KEY_B, 
  type QuizSession
} from "@/lib/quiz-data"

export function QuizApp() {
  const [currentView, setCurrentView] = useState<ViewMode>("list")
  const [starredIdsA, setStarredIdsA, starredAHydrated] = useLocalStorage<number[]>(STARRED_KEY_A, [])
  const [starredIdsB, setStarredIdsB, starredBHydrated] = useLocalStorage<number[]>(STARRED_KEY_B, [])
  const [quizSessions, setQuizSessions, sessionsHydrated] = useLocalStorage<QuizSession[]>(WRONG_ANSWERS_KEY, [])
  const [bookmarkA, setBookmarkA, bookmarkAHydrated] = useLocalStorage<number | null>(BOOKMARK_KEY_A, null)
  const [bookmarkB, setBookmarkB, bookmarkBHydrated] = useLocalStorage<number | null>(BOOKMARK_KEY_B, null)

  const handleToggleStarA = useCallback(
    (id: number) => {
      setStarredIdsA((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      )
    },
    [setStarredIdsA]
  )

  const handleToggleStarB = useCallback(
    (id: number) => {
      setStarredIdsB((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      )
    },
    [setStarredIdsB]
  )

  const handleSaveSession = useCallback(
    (session: QuizSession) => {
      setQuizSessions((prev) => [...prev, session])
    },
    [setQuizSessions]
  )

  const handleDeleteSession = useCallback((sessionId: string) => {
    setQuizSessions(prev => prev.filter(s => s.sessionId !== sessionId))
  }, [setQuizSessions])

  const handleClearAllSessions = useCallback(() => {
    setQuizSessions([])
  }, [setQuizSessions])

  // Show loading state until localStorage is hydrated
  const isHydrated = starredAHydrated && starredBHydrated && sessionsHydrated && bookmarkAHydrated && bookmarkBHydrated
  
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Stethoscope className="h-12 w-12 text-primary" />
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">醫務管理師刷題</h1>
                <p className="text-xs text-muted-foreground">證照考試練習平台</p>
              </div>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <Navigation
                currentView={currentView}
                onViewChange={setCurrentView}
                wrongCount={quizSessions.length}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {currentView === "list" && (
          <ListView 
            starredIdsA={starredIdsA}
            starredIdsB={starredIdsB}
            onToggleStarA={handleToggleStarA}
            onToggleStarB={handleToggleStarB}
            bookmarkA={bookmarkA}
            bookmarkB={bookmarkB}
            onSetBookmarkA={setBookmarkA}
            onSetBookmarkB={setBookmarkB}
          />
        )}
        {currentView === "quiz" && (
          <QuizMode onSaveSession={handleSaveSession} />
        )}
        {currentView === "wrong" && (
          <WrongAnswers
            sessions={quizSessions}
            onDeleteSession={handleDeleteSession}
            onClearAll={handleClearAllSessions}
          />
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
          wrongCount={quizSessions.length}
        />
      </div>
    </div>
  )
}
