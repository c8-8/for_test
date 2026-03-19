"use client"

import { BookOpen, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type QuestionBank, medicalManagementQuestions, legalInfoQuestions } from "@/lib/quiz-data"

interface BankSelectorProps {
  onSelectBank: (bank: QuestionBank) => void
}

export function BankSelector({ onSelectBank }: BankSelectorProps) {
  const banks = [
    {
      id: "A" as const,
      name: "醫務管理概論",
      description: "醫療機構管理相關法規",
      count: medicalManagementQuestions.length,
    },
    {
      id: "B" as const,
      name: "醫療法規與病歷資訊管理",
      description: "健保與醫療糾紛法規",
      count: legalInfoQuestions.length,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">選擇題本</h2>
        <p className="text-sm text-muted-foreground mt-1">請選擇要瀏覽的題庫</p>
      </div>

      <div className="space-y-3">
        {banks.map((bank) => (
          <Card
            key={bank.id}
            className={cn(
              "cursor-pointer transition-all duration-200",
              "hover:shadow-md hover:border-primary/30 active:scale-[0.99]"
            )}
            onClick={() => onSelectBank(bank.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{bank.name}</h3>
                  <p className="text-sm text-muted-foreground">{bank.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    共 {bank.count} 題
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
