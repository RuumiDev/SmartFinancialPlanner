"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PiggyBank, TrendingUp, Clock, Building2, Landmark, CircleDollarSign, Plus, X } from "lucide-react"
import type { FormData, CustomSavingsItem } from "./types"

interface StepSavingsProps {
  data: FormData
  updateData: (data: Partial<FormData>) => void
}

const investmentVehicles = [
  { key: "kwsp",        label: "KWSP (EPF)",       icon: Building2,       description: "Employees Provident Fund",       defaultRate: 6 },
  { key: "gold",        label: "Gold Investment",   icon: CircleDollarSign, description: "Physical gold or gold savings", defaultRate: 10 },
  { key: "mutualFunds", label: "Mutual Funds",      icon: TrendingUp,      description: "Diversified investment funds",   defaultRate: 8 },
  { key: "asb",         label: "ASB",               icon: Landmark,        description: "Amanah Saham Bumiputera",        defaultRate: 6 },
  { key: "tabungHaji",  label: "Tabung Haji",       icon: Building2,       description: "Pilgrimage savings fund",        defaultRate: 5 },
]

export function StepSavings({ data, updateData }: StepSavingsProps) {
  const targetSavings = (data.monthlyIncome || 0) * 0.2
  const currentYear = 2026
  const age = data.dateOfBirth ? currentYear - data.dateOfBirth.getFullYear() : 30
  const yearsToPension = Math.max(0, 55 - age)

  const [savingsAllocations, setSavingsAllocations] = useState({
    kwsp: data.savings.kwsp,
    asb: data.savings.asb,
    tabungHaji: data.savings.tabungHaji,
    gold: data.savings.gold,
    mutualFunds: data.savings.mutualFunds,
  })

  const defaultRates = Object.fromEntries(investmentVehicles.map((v) => [v.key, v.defaultRate]))
  const [customRates, setCustomRates] = useState<Record<string, number>>(defaultRates)

  const [customSavingsItems, setCustomSavingsItems] = useState<CustomSavingsItem[]>(
    data.savings.customItems || []
  )
  const [newItemName, setNewItemName] = useState("")
  const [newItemAmount, setNewItemAmount] = useState("")
  const [newItemRate, setNewItemRate] = useState("")

  useEffect(() => {
    setSavingsAllocations({
      kwsp: data.savings.kwsp,
      asb: data.savings.asb,
      tabungHaji: data.savings.tabungHaji,
      gold: data.savings.gold,
      mutualFunds: data.savings.mutualFunds,
    })
  }, [
    data.savings.kwsp,
    data.savings.asb,
    data.savings.tabungHaji,
    data.savings.gold,
    data.savings.mutualFunds,
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  /** FV of an annuity — annualReturnDecimal e.g. 0.06 for 6% */
  const calculateProjectedValue = (monthlyContribution: number, annualReturnDecimal: number) => {
    if (!monthlyContribution || yearsToPension <= 0 || annualReturnDecimal <= 0) return 0
    const monthlyRate = annualReturnDecimal / 12
    const months = yearsToPension * 12
    return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  }

  const handleSavingsChange = (key: keyof typeof savingsAllocations, value: string) => {
    const parsedValue = parseFloat(value) || 0
    const nextAllocations = { ...savingsAllocations, [key]: parsedValue }
    setSavingsAllocations(nextAllocations)
    updateData({ savings: { ...data.savings, ...nextAllocations, customItems: customSavingsItems } })
  }

  const handleRateChange = (key: string, value: string) => {
    setCustomRates((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  const addCustomVehicle = () => {
    if (newItemName.trim() && newItemAmount) {
      const newItems: CustomSavingsItem[] = [
        ...customSavingsItems,
        {
          name: newItemName.trim(),
          amount: parseFloat(newItemAmount) || 0,
          expectedRate: parseFloat(newItemRate) || 0,
        },
      ]
      setCustomSavingsItems(newItems)
      updateData({ savings: { ...data.savings, ...savingsAllocations, customItems: newItems } })
      setNewItemName("")
      setNewItemAmount("")
      setNewItemRate("")
    }
  }

  const removeCustomVehicle = (index: number) => {
    const newItems = customSavingsItems.filter((_, i) => i !== index)
    setCustomSavingsItems(newItems)
    updateData({ savings: { ...data.savings, ...savingsAllocations, customItems: newItems } })
  }

  const totalMonthlyContributions =
    investmentVehicles.reduce(
      (sum, v) => sum + (savingsAllocations[v.key as keyof typeof savingsAllocations] || 0),
      0
    ) + customSavingsItems.reduce((sum, item) => sum + (item.amount || 0), 0)

  const totalProjectedPension =
    investmentVehicles.reduce((sum, v) => {
      const contribution = savingsAllocations[v.key as keyof typeof savingsAllocations] || 0
      return sum + calculateProjectedValue(contribution, (customRates[v.key] || 0) / 100)
    }, 0) +
    customSavingsItems.reduce((sum, item) => {
      return sum + calculateProjectedValue(item.amount || 0, (item.expectedRate || 0) / 100)
    }, 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Savings Engine</h2>
        <p className="text-muted-foreground mt-1">20% of your income for the future</p>
      </div>

      <Card className="bg-chart-3/10 border-chart-3/20">
        <CardContent className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-chart-3/20 flex items-center justify-center shrink-0">
                <PiggyBank className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Savings (20%)</p>
                <p className="text-xl font-bold text-chart-3">{formatCurrency(targetSavings)}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-muted-foreground flex items-center gap-1 sm:justify-end">
                <Clock className="w-3 h-3" />
                {yearsToPension} years to pension
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="pension-projector" className="border rounded-xl px-4 bg-card shadow-sm">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Project My Pension</p>
                <p className="text-sm text-muted-foreground">Allocate savings &amp; set your own expected return</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-6 pt-2">
              {investmentVehicles.map(({ key, label, icon: Icon, description, defaultRate }) => {
                const monthlyContribution = savingsAllocations[key as keyof typeof savingsAllocations] || 0
                const rate = customRates[key] ?? defaultRate
                const projectedValue = calculateProjectedValue(monthlyContribution, rate / 100)

                return (
                  <div key={key} className="space-y-3 p-4 bg-secondary/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={key} className="text-xs text-muted-foreground">
                          Monthly Contribution
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
                            value={savingsAllocations[key as keyof typeof savingsAllocations] || ""}
                            onChange={(e) => handleSavingsChange(key as keyof typeof savingsAllocations, e.target.value)}
                            className="h-11 pl-10 w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`${key}-rate`} className="text-xs text-muted-foreground">
                          Expected Return (% p.a.)
                        </Label>
                        <div className="relative">
                          <Input
                            id={`${key}-rate`}
                            type="number"
                            placeholder={String(defaultRate)}
                            min={0}
                            max={100}
                            step={0.1}
                            value={customRates[key] ?? defaultRate}
                            onChange={(e) => handleRateChange(key, e.target.value)}
                            className="h-11 pr-8 w-full"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            %
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Projected Value at Age 55
                        </Label>
                        <div className="h-11 px-3 bg-muted rounded-lg flex items-center">
                          <span className="text-base font-bold text-accent">
                            {formatCurrency(projectedValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Custom investment vehicles */}
              {customSavingsItems.length > 0 && (
                <div className="space-y-3">
                  {customSavingsItems.map((item, index) => (
                    <div key={index} className="p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <button
                          onClick={() => removeCustomVehicle(index)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly</p>
                          <p className="font-semibold text-foreground">{formatCurrency(item.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rate</p>
                          <p className="font-semibold text-foreground">{item.expectedRate}% p.a.</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Projected</p>
                          <p className="font-semibold text-accent">
                            {formatCurrency(calculateProjectedValue(item.amount, item.expectedRate / 100))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add custom investment / savings */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Add Investment / Savings</Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Input
                    placeholder="Fund name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full h-10 sm:flex-1 sm:min-w-28"
                    onKeyDown={(e) => e.key === "Enter" && addCustomVehicle()}
                  />
                  <div className="relative w-full sm:w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">RM</span>
                    <Input
                      type="number" placeholder="0" min={0}
                      value={newItemAmount}
                      onChange={(e) => setNewItemAmount(e.target.value)}
                      className="h-10 pl-10 w-full"
                      onKeyDown={(e) => e.key === "Enter" && addCustomVehicle()}
                    />
                  </div>
                  <div className="relative w-full sm:w-24">
                    <Input
                      type="number" placeholder="% p.a." min={0} max={100} step={0.1}
                      value={newItemRate}
                      onChange={(e) => setNewItemRate(e.target.value)}
                      className="h-10 pr-7 w-full"
                      onKeyDown={(e) => e.key === "Enter" && addCustomVehicle()}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                  <Button
                    type="button" variant="outline"
                    onClick={addCustomVehicle}
                    disabled={!newItemName.trim() || !newItemAmount}
                    className="h-10 w-full sm:w-10 sm:shrink-0"
                  >
                    <Plus className="w-4 h-4 sm:mx-auto" />
                    <span className="sm:hidden ml-2">Add Investment</span>
                  </Button>
                </div>
              </div>

              {/* Summary card */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Monthly Savings</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(totalMonthlyContributions)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {targetSavings > 0 ? ((totalMonthlyContributions / targetSavings) * 100).toFixed(0) : 0}% of target
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Projected Pension</p>
                      <p className="text-2xl font-bold text-accent">{formatCurrency(totalProjectedPension)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        At age 55 ({yearsToPension} years)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="bg-secondary/50 border-0">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Projections are estimates using your expected return rates and assume consistent monthly contributions.
            Actual returns may vary.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
