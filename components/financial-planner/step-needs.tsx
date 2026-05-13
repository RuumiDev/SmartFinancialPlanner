"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Home, Car, CreditCard, MoreHorizontal, Plus, X, AlertCircle, CheckCircle } from "lucide-react"
import type { FormData, CustomItem } from "./types"

interface StepNeedsProps {
  data: FormData
  updateData: (data: Partial<FormData>) => void
}

const needsCategories = [
  { key: "ptptn", label: "PTPTN / MARA", icon: GraduationCap, description: "Education loans" },
  { key: "housing", label: "Housing Loan", icon: Home, description: "Mortgage payments" },
  { key: "car", label: "Car Loan", icon: Car, description: "Vehicle financing" },
  { key: "personal", label: "Personal Loan", icon: CreditCard, description: "Personal financing" },
  { key: "others", label: "Others", icon: MoreHorizontal, description: "Insurance, utilities, etc." },
] as const

export function StepNeeds({ data, updateData }: StepNeedsProps) {
  const [customItems, setCustomItems] = useState<CustomItem[]>(data.needs.customItems || [])
  const [newItemName, setNewItemName] = useState("")
  const [newItemAmount, setNewItemAmount] = useState("")

  const targetNeeds = (data.monthlyIncome || 0) * 0.5

  const fixedTotal =
    (data.needs.ptptn || 0) +
    (data.needs.housing || 0) +
    (data.needs.car || 0) +
    (data.needs.personal || 0) +
    (data.needs.others || 0)

  const customTotal = customItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const totalNeeds = fixedTotal + customTotal
  const remaining = targetNeeds - totalNeeds
  const isOverBudget = remaining < 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleNeedChange = (key: string, value: string) => {
    updateData({
      needs: {
        ...data.needs,
        customItems,
        [key]: parseFloat(value) || 0,
      },
    })
  }

  const addCustomItem = () => {
    if (newItemName.trim() && newItemAmount) {
      const newItems: CustomItem[] = [
        ...customItems,
        { name: newItemName.trim(), amount: parseFloat(newItemAmount) || 0 },
      ]
      setCustomItems(newItems)
      updateData({ needs: { ...data.needs, customItems: newItems } })
      setNewItemName("")
      setNewItemAmount("")
    }
  }

  const removeCustomItem = (index: number) => {
    const newItems = customItems.filter((_, i) => i !== index)
    setCustomItems(newItems)
    updateData({ needs: { ...data.needs, customItems: newItems } })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Needs Breakdown</h2>
        <p className="text-muted-foreground mt-1">50% of your income for essentials</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Target Budget (50%)</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(targetNeeds)}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-xl font-bold ${isOverBudget ? "text-destructive" : "text-accent"}`}>
                {formatCurrency(Math.abs(remaining))}
                {isOverBudget && " over"}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${isOverBudget ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${Math.min(100, (totalNeeds / targetNeeds) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {needsCategories.map(({ key, label, icon: Icon, description }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              {label}
              <span className="text-xs text-muted-foreground font-normal">({description})</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                RM
              </span>
              <Input
                id={key}
                type="number"
                placeholder="0"
                min={0}
                value={data.needs[key as keyof Omit<typeof data.needs, "customItems">] || ""}
                onChange={(e) => handleNeedChange(key, e.target.value)}
                className="h-11 pl-10"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Custom Expenses */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Custom Expenses</Label>

        {customItems.length > 0 && (
          <div className="space-y-2">
            {customItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                <span className="flex-1 text-sm text-foreground">{item.name}</span>
                <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                <button
                  onClick={() => removeCustomItem(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Expense name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 h-10"
            onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
          />
          <div className="relative w-32">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
              RM
            </span>
            <Input
              type="number"
              placeholder="0"
              min={0}
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              className="h-10 pl-10"
              onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addCustomItem}
            disabled={!newItemName.trim() || !newItemAmount}
            className="h-10 w-10 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className={`border-0 ${isOverBudget ? "bg-destructive/10" : "bg-accent/10"}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isOverBudget ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-accent" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                Total Needs: {formatCurrency(totalNeeds)}
              </p>
              <p className={`text-sm ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                {isOverBudget
                  ? `You are ${formatCurrency(Math.abs(remaining))} over your 50% needs budget`
                  : `${formatCurrency(remaining)} left in your needs budget`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
