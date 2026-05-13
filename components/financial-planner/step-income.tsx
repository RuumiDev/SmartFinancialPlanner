"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, Home, ShoppingBag, PiggyBank } from "lucide-react"
import type { FormData } from "./types"

interface StepIncomeProps {
  data: FormData
  updateData: (data: Partial<FormData>) => void
}

export function StepIncome({ data, updateData }: StepIncomeProps) {
  const income = data.monthlyIncome || 0
  const needs = income * 0.5
  const wants = income * 0.3
  const savings = income * 0.2

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Expected Income</h2>
        <p className="text-muted-foreground mt-1">The 50/30/20 Budget Rule</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="income" className="text-sm font-medium flex items-center gap-2">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          Monthly / Expected Income
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            RM
          </span>
          <Input
            id="income"
            type="number"
            placeholder="0"
            min={0}
            value={data.monthlyIncome || ""}
            onChange={(e) => updateData({ monthlyIncome: parseFloat(e.target.value) || 0 })}
            className="h-14 pl-12 text-2xl font-bold"
          />
        </div>
      </div>

      {income > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-semibold text-foreground">Your Budget Breakdown</h3>
          
          <div className="grid gap-4">
            <Card className="border-0 bg-chart-1/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="w-2 h-full min-h-[80px] bg-chart-1" />
                  <div className="flex-1 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-chart-1/20 flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5 text-chart-1" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Needs</p>
                        <p className="font-semibold text-foreground">50% of Income</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-chart-1 shrink-0 text-right">{formatCurrency(needs)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-chart-2/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="w-2 h-full min-h-[80px] bg-chart-2" />
                  <div className="flex-1 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-chart-2/20 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5 text-chart-2" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Wants</p>
                        <p className="font-semibold text-foreground">30% of Income</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-chart-2 shrink-0 text-right">{formatCurrency(wants)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-chart-3/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="w-2 h-full min-h-[80px] bg-chart-3" />
                  <div className="flex-1 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center shrink-0">
                        <PiggyBank className="w-5 h-5 text-chart-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Savings</p>
                        <p className="font-semibold text-foreground">20% of Income</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-chart-3 shrink-0 text-right">{formatCurrency(savings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-secondary/50 border-0">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                The 50/30/20 rule suggests allocating 50% of your income to needs, 
                30% to wants, and 20% to savings and debt repayment.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
