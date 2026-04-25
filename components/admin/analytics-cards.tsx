"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Briefcase, PiggyBank } from "lucide-react"
import type { SurveyResponse } from "./types"

interface AnalyticsCardsProps {
  data: SurveyResponse[]
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalSurveys = data.length

  const avgIncome =
    data.length > 0
      ? data.reduce((acc, curr) => acc + curr.expectedIncome, 0) / data.length
      : 0

  const occupationCounts = data.reduce(
    (acc, curr) => {
      acc[curr.occupation] = (acc[curr.occupation] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const topOccupation =
    Object.entries(occupationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

  const totalProjectedSavings = data.reduce(
    (acc, curr) => acc + curr.savings.projectedTotal,
    0
  )

  const cards = [
    {
      title: "Total Surveys",
      value: totalSurveys.toString(),
      icon: FileText,
      description: "Completed submissions",
    },
    {
      title: "Average Income",
      value: `RM ${avgIncome.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      description: "Monthly average",
    },
    {
      title: "Top Occupation",
      value: topOccupation,
      icon: Briefcase,
      description: "Most common category",
    },
    {
      title: "Projected Savings",
      value: `RM ${(totalProjectedSavings / 1000000).toFixed(2)}M`,
      icon: PiggyBank,
      description: "Total at retirement",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className={`transition-all duration-500 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
