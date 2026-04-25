"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, Film, Plane, ShoppingCart, Sparkles, Plus, X, AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"
import type { FormData } from "./types"

interface StepWantsProps {
  data: FormData
  updateData: (data: Partial<FormData>) => void
}

const predefinedCategories = [
  { key: "dining", label: "Dining Out", icon: Utensils },
  { key: "entertainment", label: "Entertainment", icon: Film },
  { key: "travel", label: "Travel", icon: Plane },
  { key: "shopping", label: "Shopping", icon: ShoppingCart },
  { key: "hobbies", label: "Hobbies", icon: Sparkles },
]

export function StepWants({ data, updateData }: StepWantsProps) {
  const [customItems, setCustomItems] = useState<{ name: string; amount: number }[]>(
    data.wants.customItems || []
  )
  const [newItemName, setNewItemName] = useState("")
  const [newItemAmount, setNewItemAmount] = useState("")

  const targetWants = (data.monthlyIncome || 0) * 0.3
  const totalWants = 
    Object.entries(data.wants)
      .filter(([key]) => key !== "customItems" && key !== "notes")
      .reduce((sum, [, val]) => sum + (typeof val === "number" ? val : 0), 0) +
    customItems.reduce((sum, item) => sum + item.amount, 0)
  const remaining = targetWants - totalWants
  const isOverBudget = remaining < 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleWantChange = (key: string, value: string) => {
    updateData({
      wants: {
        ...data.wants,
        [key]: parseFloat(value) || 0,
      },
    })
  }

  const addCustomItem = () => {
    if (newItemName.trim() && newItemAmount) {
      const newItems = [...customItems, { name: newItemName.trim(), amount: parseFloat(newItemAmount) || 0 }]
      setCustomItems(newItems)
      updateData({
        wants: {
          ...data.wants,
          customItems: newItems,
        },
      })
      setNewItemName("")
      setNewItemAmount("")
    }
  }

  const removeCustomItem = (index: number) => {
    const newItems = customItems.filter((_, i) => i !== index)
    setCustomItems(newItems)
    updateData({
      wants: {
        ...data.wants,
        customItems: newItems,
      },
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Wants Breakdown</h2>
        <p className="text-muted-foreground mt-1">30% of your income for lifestyle</p>
      </div>

      <Card className="bg-chart-2/10 border-chart-2/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Target Budget (30%)</p>
              <p className="text-2xl font-bold text-chart-2">{formatCurrency(targetWants)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${isOverBudget ? "text-destructive" : "text-accent"}`}>
                {formatCurrency(Math.abs(remaining))}
                {isOverBudget && " over"}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${isOverBudget ? "bg-destructive" : "bg-chart-2"}`}
              style={{ width: `${Math.min(100, (totalWants / targetWants) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {predefinedCategories.map(({ key, label, icon: Icon }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm font-medium flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              {label}
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
                value={data.wants[key as keyof typeof data.wants] || ""}
                onChange={(e) => handleWantChange(key, e.target.value)}
                className="h-11 pl-10"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Custom items */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Custom Expenses</Label>
        
        {customItems.length > 0 && (
          <div className="space-y-2">
            {customItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                <span className="flex-1 text-sm text-foreground">{item.name}</span>
                <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCustomItem(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1"
          />
          <div className="relative w-32">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
              RM
            </span>
            <Input
              type="number"
              placeholder="0"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={addCustomItem} size="icon" className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any other lifestyle expenses or notes..."
          value={data.wants.notes || ""}
          onChange={(e) => updateData({ wants: { ...data.wants, notes: e.target.value } })}
          className="min-h-[80px] resize-none"
        />
      </div>

      <Card className={`border-0 ${isOverBudget ? "bg-destructive/10" : "bg-chart-2/10"}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isOverBudget ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <CheckCircle className="w-5 h-5 text-chart-2" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                Total Wants: {formatCurrency(totalWants)}
              </p>
              <p className={`text-sm ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                {isOverBudget 
                  ? `You are ${formatCurrency(Math.abs(remaining))} over your 30% wants budget`
                  : `${formatCurrency(remaining)} left in your wants budget`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
