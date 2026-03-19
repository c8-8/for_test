"use client"

import { List, Play, BookX } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewMode = "list" | "quiz" | "wrong"

interface NavigationProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  wrongCount: number
}

export function Navigation({ currentView, onViewChange, wrongCount }: NavigationProps) {
  const navItems = [
    { id: "list" as const, label: "列表", icon: List },
    { id: "quiz" as const, label: "測驗", icon: Play },
    { id: "wrong" as const, label: "錯題本", icon: BookX, badge: wrongCount },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg md:static md:border-t-0 md:shadow-none md:bg-transparent">
      <div className="flex items-center justify-around md:justify-center md:gap-2 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                "md:flex-row md:gap-2 md:px-5 md:py-2.5",
                "active:scale-95",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium md:text-sm">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground md:static md:ml-1">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
