"use client"

import { useState, useMemo } from "react"
import { BookX, Calendar, Clock, Trash2, AlertTriangle, ChevronRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { getQuestionById, type QuizSession, type Question } from "@/lib/quiz-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface WrongAnswersProps {
  sessions: QuizSession[]
  onDeleteSession: (sessionId: string) => void
  onClearAll: () => void
}

function SessionDetailView({ session, onBack }: { session: QuizSession; onBack: () => void }) {
  const wrongQuestions = useMemo(() => {
    return session.wrongQuestionIds
      .map(id => getQuestionById(id, session.bank))
      .filter((q): q is Question => q !== undefined)
  }, [session])

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回錯題本列表
      </Button>
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-bold">測驗紀錄: {session.sessionId}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(session.timestamp).toLocaleString('zh-TW')}
          </p>
          <p className="text-sm text-muted-foreground">
            分數: {session.score.toFixed(0)} / 題庫: {session.bank}
          </p>
        </CardContent>
      </Card>
      
      <h3 className="text-md font-semibold pt-4">錯誤題目詳解 ({wrongQuestions.length} 題)</h3>
      
      {wrongQuestions.length > 0 ? (
        <div className="space-y-3">
          {wrongQuestions.map((q, index) => (
            <Card key={q.id} className="overflow-hidden">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-foreground leading-relaxed mb-4">
                  {index + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {(["A", "B", "C", "D"] as const).map((key) => (
                    <div
                      key={key}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded-lg text-sm",
                        key === q.answer
                          ? "bg-success/10 text-success font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                          key === q.answer
                            ? "bg-success text-success-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        {key}
                      </span>
                      <span className="pt-0.5">{q.options[key]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">恭喜！本次測驗沒有錯題。</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function WrongAnswers({ sessions, onDeleteSession, onClearAll }: WrongAnswersProps) {
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(null)

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => b.timestamp - a.timestamp)
  }, [sessions])

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    if (window.confirm(`確定要刪除測驗紀錄 ${sessionId} 嗎？`)) {
      onDeleteSession(sessionId)
    }
  }

  if (selectedSession) {
    return <SessionDetailView session={selectedSession} onBack={() => setSelectedSession(null)} />
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <BookX className="h-16 w-16 text-muted-foreground/30" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground">尚無錯題本</h3>
          <p className="text-sm text-muted-foreground mt-1">
            完成測驗後，包含錯題的測驗紀錄會顯示在這裡
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-destructive/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  共 {sessions.length} 本錯題本
                </p>
                <p className="text-xs text-muted-foreground">
                  點擊紀錄以查看錯題詳情
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              清除全部
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-3">
        {sortedSessions.map((session) => (
          <Card 
            key={session.sessionId} 
            className="overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/30 active:scale-[0.99] transition-all"
            onClick={() => setSelectedSession(session)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      ID: {session.sessionId}
                    </Badge>
                    <Badge variant="secondary">題庫 {session.bank}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(session.timestamp).toLocaleDateString("zh-TW")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(session.timestamp).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm mt-2">
                    分數: <span className="font-bold text-primary">{session.score.toFixed(0)}</span> / 
                    錯誤題數: <span className="font-bold text-destructive">{session.wrongQuestionIds.length}</span>
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => handleDelete(e, session.sessionId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
