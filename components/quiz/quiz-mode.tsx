"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, CheckCircle2, XCircle, Trophy, RotateCcw, BookOpen, ArrowLeft, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  createRandomQuiz,
  generateSessionId,
  getQuestionsByBank, 
  type Question, 
  type QuizSession, 
  type QuestionBank 
} from "@/lib/quiz-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuizModeProps {
  onSaveSession: (session: QuizSession) => void
}

type QuizState = "select-bank" | "playing" | "finished"

const QUIZ_SIZE = 50

export function QuizMode({ onSaveSession }: QuizModeProps) {
  const [state, setState] = useState<QuizState>("select-bank")
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [score, setScore] = useState(0)
  const [finalResults, setFinalResults] = useState<{
    score: number
    correctCount: number
    wrongCount: number
  } | null>(null)

  const selectBank = useCallback((bank: QuestionBank) => {
    setSelectedBank(bank)
    const newQuestions = createRandomQuiz(bank, QUIZ_SIZE)
    setQuestions(newQuestions)
    setUserAnswers({})
    setQuizStartTime(new Date())
    setFinalResults(null)
    setState("playing")
  }, [])

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmitQuiz = () => {
    let correctCount = 0
    const wrongQuestionIds: number[] = []

    questions.forEach(q => {
      if (userAnswers[q.id] === q.answer) {
        correctCount++
      } else {
        wrongQuestionIds.push(q.id)
      }
    })

    const finalScore = (correctCount / questions.length) * 100
    
    setFinalResults({
      score: finalScore,
      correctCount: correctCount,
      wrongCount: questions.length - correctCount,
    })
    setState("finished")

    // Create and save the session
    if (quizStartTime && selectedBank) {
      const session: QuizSession = {
        sessionId: generateSessionId(quizStartTime),
        timestamp: quizStartTime.getTime(),
        wrongQuestionIds,
        bank: selectedBank,
        score: finalScore,
        totalQuestions: questions.length,
      }
      onSaveSession(session)
    }
  }

  const restartQuiz = () => {
    if (selectedBank) {
      selectBank(selectedBank)
    }
  }

  const backToSelectBank = useCallback(() => {
    setSelectedBank(null)
    setState("select-bank")
  }, [])

  // Bank Selection Screen
  if (state === "select-bank") {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Trophy className="h-16 w-16 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold text-foreground">隨機測驗模式</h2>
          <p className="text-muted-foreground mt-1">一次測驗 {QUIZ_SIZE} 題，完成後顯示結果</p>
        </div>

        <div className="space-y-3">
          {(["A", "B"] as const).map((bank) => {
            const bankQuestions = getQuestionsByBank(bank)
            return (
              <Card
                key={bank}
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.99]"
                onClick={() => selectBank(bank)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">題本 {bank}</h3>
                      <p className="text-sm text-muted-foreground">共 {bankQuestions.length} 題</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Finished Screen
  if (state === "finished" && finalResults) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={backToSelectBank}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回選擇題本
        </Button>
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-2">
            <Trophy className={cn(
              "h-16 w-16 mx-auto mb-2",
              finalResults.score >= 60 ? "text-success" : "text-destructive"
            )} />
            <CardTitle className="text-2xl">測驗完成！</CardTitle>
            <p className="text-sm text-muted-foreground">題本 {selectedBank}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">{finalResults.score.toFixed(0)}分</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-success/10 border-success/20">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-success mb-1" />
                  <p className="text-2xl font-bold text-success">{finalResults.correctCount}</p>
                  <p className="text-xs text-success">答對</p>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4 text-center">
                  <XCircle className="h-8 w-8 mx-auto text-destructive mb-1" />
                  <p className="text-2xl font-bold text-destructive">{finalResults.wrongCount}</p>
                  <p className="text-xs text-destructive">答錯</p>
                </CardContent>
              </Card>
            </div>

            <Button onClick={restartQuiz} className="w-full gap-2" size="lg">
              <RotateCcw className="h-5 w-5" />
              再測一次
            </Button>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-center">本次測驗詳解</h3>
          {questions.map((q, index) => {
            const userAnswer = userAnswers[q.id]
            const isCorrect = userAnswer === q.answer
            return (
              <Card key={q.id} className={cn(isCorrect ? "border-green-500/30" : "border-red-500/30")}>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-foreground leading-relaxed mb-4">
                    {index + 1}. {q.question}
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><b>正確答案: {q.answer}</b>. {q.options[q.answer]}</p>
                    <p className={cn(isCorrect ? "text-green-600" : "text-red-600")}>
                      <b>你的答案: {userAnswer || "未作答"}</b>
                      {userAnswer && `. ${q.options[userAnswer as "A"|"B"|"C"|"D"]}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Quiz Screen (Playing)
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={backToSelectBank}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </Button>
      <h2 className="text-xl font-bold text-center">隨機測驗 - 題本 {selectedBank}</h2>
      
      {questions.map((q, index) => (
        <Card key={q.id}>
          <CardContent className="p-5">
            <p className="text-base font-medium leading-relaxed text-foreground mb-4">
              {index + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {(["A", "B", "C", "D"] as const).map((key) => (
                <label 
                  key={key}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200 cursor-pointer",
                    userAnswers[q.id] === key 
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={key}
                    checked={userAnswers[q.id] === key}
                    onChange={() => handleAnswerSelect(q.id, key)}
                    className="mt-1"
                  />
                  <span className="text-sm text-foreground">{key}: {q.options[key]}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button 
        onClick={handleSubmitQuiz} 
        className="w-full gap-2" 
        size="lg"
        disabled={Object.keys(userAnswers).length !== questions.length}
      >
        <Send className="h-5 w-5" />
        完成並交卷
      </Button>
      {Object.keys(userAnswers).length !== questions.length && (
        <p className="text-center text-sm text-muted-foreground">
          請完成所有題目後再交卷 ({Object.keys(userAnswers).length} / {questions.length})
        </p>
      )}
    </div>
  )
}
