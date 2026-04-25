"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import * as XLSX from "xlsx"
import Swal from "sweetalert2"
import { gsap } from "gsap"
import { db } from "@/lib/firebase"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  FileText,
  Percent,
  LogOut,
  Search,
  Download,
  TrendingUp,
} from "lucide-react"
import { AnalyticsCards } from "./analytics-cards"
import { SurveyDataTable } from "./survey-data-table"
import { InterestRatesTable } from "./interest-rates-table"
import { mockSurveyResponses, mockInterestRates } from "./mock-data"
import type { InterestRate, SurveyResponse } from "./types"

type ActiveView = "overview" | "surveys" | "rates"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [interestRates, setInterestRates] = useState<InterestRate[]>(mockInterestRates)
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(mockSurveyResponses)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const surveysQuery = query(collection(db, "surveys"), orderBy("submittedAt", "desc"))
        const snapshot = await getDocs(surveysQuery)
        const data = snapshot.docs.map((doc) => mapSurveyResponse(doc.id, doc.data()))
        setSurveyResponses(data)
      } catch (error) {
        console.error("Failed to load surveys:", error)
      }
    }

    loadSurveys()
  }, [])

  useEffect(() => {
    const wrapper = document.querySelector("[data-slot='sidebar-wrapper']")
    if (!wrapper) return
    gsap.fromTo(
      wrapper,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
  }, [])

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      const formatRM = (value: number) => {
        if (isNaN(value)) return "RM 0.00"
        return new Intl.NumberFormat("en-MY", {
          style: "currency",
          currency: "MYR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value).replace("MYR", "RM")
      }

      const snapshot = await getDocs(collection(db, "surveys"))
      const rows = snapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>
        const needs = (data.needs ?? {}) as Record<string, unknown>
        const wants = (data.wants ?? {}) as Record<string, unknown>
        const savings = (data.savings ?? {}) as Record<string, unknown>

        const needsCustomItems = Array.isArray(needs.customItems)
          ? (needs.customItems as { name: string; amount: number }[])
          : []
        const wantsCustomItems = Array.isArray(wants.customItems)
          ? (wants.customItems as { name: string; amount: number }[])
          : []
        const savingsCustomItems = Array.isArray(savings.customItems)
          ? (savings.customItems as { name: string; amount: number; expectedRate: number }[])
          : []

        const flattenItems = (items: { name: string; amount: number }[]) =>
          items.length > 0
            ? items.map((i) => `${i.name}: ${formatRM(toNumber(i.amount))}`).join(" | ")
            : ""

        const needsTotal =
          toNumber(needs.ptptn) + toNumber(needs.housing) + toNumber(needs.car) +
          toNumber(needs.personal) + toNumber(needs.others) +
          needsCustomItems.reduce((s, i) => s + toNumber(i.amount), 0)

        const wantsTotal =
          toNumber(wants.dining) + toNumber(wants.entertainment) + toNumber(wants.travel) +
          toNumber(wants.shopping) + toNumber(wants.hobbies) +
          wantsCustomItems.reduce((s, i) => s + toNumber(i.amount), 0)

        const savingsTotal =
          toNumber(savings.kwsp) + toNumber(savings.gold) + toNumber(savings.mutualFunds) +
          toNumber(savings.asb) + toNumber(savings.tabungHaji) +
          savingsCustomItems.reduce((s, i) => s + toNumber(i.amount), 0)

        return {
          Name: String(data.name ?? ""),
          Email: String(data.email ?? ""),
          Age: toNumber(data.age),
          Gender: String(data.gender ?? ""),
          Occupation: String(data.occupation ?? ""),
          "Years to Pension": toNumber(data.yearsToPension),
          "Monthly Income": formatRM(toNumber(data.monthlyIncome)),
          "Needs – PTPTN": formatRM(toNumber(needs.ptptn)),
          "Needs – Housing": formatRM(toNumber(needs.housing)),
          "Needs – Car": formatRM(toNumber(needs.car)),
          "Needs – Personal": formatRM(toNumber(needs.personal)),
          "Needs – Others": formatRM(toNumber(needs.others)),
          "Needs – Custom Items": flattenItems(needsCustomItems),
          "Total Needs": formatRM(needsTotal),
          "Wants – Dining": formatRM(toNumber(wants.dining)),
          "Wants – Entertainment": formatRM(toNumber(wants.entertainment)),
          "Wants – Travel": formatRM(toNumber(wants.travel)),
          "Wants – Shopping": formatRM(toNumber(wants.shopping)),
          "Wants – Hobbies": formatRM(toNumber(wants.hobbies)),
          "Wants – Custom Items": flattenItems(wantsCustomItems),
          "Wants – Notes": String(wants.notes ?? ""),
          "Total Wants": formatRM(wantsTotal),
          "Savings – KWSP": formatRM(toNumber(savings.kwsp)),
          "Savings – Gold": formatRM(toNumber(savings.gold)),
          "Savings – Mutual Funds": formatRM(toNumber(savings.mutualFunds)),
          "Savings – ASB": formatRM(toNumber(savings.asb)),
          "Savings – Tabung Haji": formatRM(toNumber(savings.tabungHaji)),
          "Savings – Custom Funds": savingsCustomItems.length > 0
            ? savingsCustomItems.map((i) => `${i.name}: ${formatRM(toNumber(i.amount))} @ ${i.expectedRate}%`).join(" | ")
            : "",
          "Total Savings": formatRM(savingsTotal),
          "Submitted At": formatTimestamp(data.submittedAt),
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Surveys")
      XLSX.writeFile(workbook, "Financial_Planner_Export.xlsx")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAll = async () => {
    const result = await Swal.fire({
      title: "Export all survey data?",
      text: "This will download an Excel file with all responses.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Export",
      cancelButtonText: "Cancel",
    })

    if (!result.isConfirmed) return

    await exportToExcel()
  }

  const confirmLogout = async () => {
    const result = await Swal.fire({
      title: "Log out of admin?",
      text: "You will be redirected to the login page.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Log out",
      cancelButtonText: "Cancel",
    })

    if (result.isConfirmed) {
      onLogout()
    }
  }

  const handleUpdateRate = (id: string, newRate: number) => {
    setInterestRates((prev) =>
      prev.map((rate) =>
        rate.id === id
          ? { ...rate, currentRate: newRate, lastUpdated: new Date().toISOString().split("T")[0] }
          : rate
      )
    )
  }

  const navItems = [
    { id: "overview" as const, label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "surveys" as const, label: "Survey Responses", icon: FileText },
    { id: "rates" as const, label: "Global Interest Rates", icon: Percent },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
            <SidebarHeader className="border-b p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Financial Planner</h2>
                  <p className="text-xs text-muted-foreground">Admin Portal</p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activeView === item.id}
                          onClick={() => setActiveView(item.id)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <div className="mt-auto border-t p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={confirmLogout}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </Sidebar>
        <SidebarInset>
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleExportAll} className="gap-2" disabled={isExporting}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isExporting ? "Exporting..." : "Export Full Data (.xlsx)"}
              </span>
              <span className="sm:hidden">{isExporting ? "Exporting..." : "Export"}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      AD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={confirmLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {/* Mobile Search */}
          <div className="mb-4 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {activeView === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground">
                  Monitor survey submissions and financial planning metrics
                </p>
              </div>
              <AnalyticsCards data={surveyResponses} />
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Recent Surveys</h2>
                <SurveyDataTable data={surveyResponses} searchQuery={searchQuery} />
              </div>
            </div>
          )}

          {activeView === "surveys" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Survey Responses</h1>
                <p className="text-muted-foreground">
                  View and manage all submitted financial surveys
                </p>
              </div>
              <SurveyDataTable data={surveyResponses} searchQuery={searchQuery} />
            </div>
          )}

          {activeView === "rates" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Global Interest Rates</h1>
                <p className="text-muted-foreground">
                  Manage interest rates for investment vehicles (KWSP, ASB, etc.)
                </p>
              </div>
              <InterestRatesTable data={interestRates} onUpdate={handleUpdateRate} />
            </div>
          )}
        </main>
        </SidebarInset>
    </SidebarProvider>
  )
}

function mapSurveyResponse(id: string, raw: Record<string, unknown>): SurveyResponse {
  const needs = (raw.needs ?? {}) as Record<string, unknown>
  const wants = (raw.wants ?? {}) as Record<string, unknown>
  const savings = (raw.savings ?? {}) as Record<string, unknown>
  const monthlyIncome = toNumber(raw.monthlyIncome)

  const needsCustomItems = Array.isArray(needs.customItems)
    ? (needs.customItems as { name: string; amount: number }[])
    : []

  const needsTotal =
    toNumber(needs.ptptn) +
    toNumber(needs.housing) +
    toNumber(needs.car) +
    toNumber(needs.personal) +
    toNumber(needs.others) +
    needsCustomItems.reduce((s, i) => s + toNumber(i.amount), 0)

  const wantsCustomItems = Array.isArray(wants.customItems)
    ? (wants.customItems as { name: string; amount: number }[])
    : []

  const wantsTotal =
    toNumber(wants.dining) +
    toNumber(wants.entertainment) +
    toNumber(wants.travel) +
    toNumber(wants.shopping) +
    toNumber(wants.hobbies) +
    wantsCustomItems.reduce((sum, item) => sum + toNumber(item.amount), 0)

  const savingsCustomItems = Array.isArray(savings.customItems)
    ? (savings.customItems as { name: string; amount: number; expectedRate: number }[])
    : []

  const yearsToPension = toNumber(raw.yearsToPension)
  const projected = {
    kwsp: projectedValue(toNumber(savings.kwsp), 0.055, yearsToPension),
    gold: projectedValue(toNumber(savings.gold), 0.06, yearsToPension),
    mutualFunds: projectedValue(toNumber(savings.mutualFunds), 0.08, yearsToPension),
    asb: projectedValue(toNumber(savings.asb), 0.05, yearsToPension),
    tabungHaji: projectedValue(toNumber(savings.tabungHaji), 0.035, yearsToPension),
  }

  const savingsTotal =
    toNumber(savings.kwsp) +
    toNumber(savings.gold) +
    toNumber(savings.mutualFunds) +
    toNumber(savings.asb) +
    toNumber(savings.tabungHaji) +
    savingsCustomItems.reduce((s, i) => s + toNumber(i.amount), 0)

  const projectedTotal =
    projected.kwsp +
    projected.gold +
    projected.mutualFunds +
    projected.asb +
    projected.tabungHaji

  const totalBudget = needsTotal + wantsTotal + savingsTotal
  const budgetSplit = {
    needsPercent: totalBudget ? (needsTotal / totalBudget) * 100 : 0,
    wantsPercent: totalBudget ? (wantsTotal / totalBudget) * 100 : 0,
    savingsPercent: totalBudget ? (savingsTotal / totalBudget) * 100 : 0,
  }

  const submittedAt = formatTimestamp(raw.submittedAt)

  return {
    id,
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    age: toNumber(raw.age),
    gender: String(raw.gender ?? ""),
    occupation: String(raw.occupation ?? ""),
    yearsToPension,
    expectedIncome: monthlyIncome,
    needs: {
      ptptn: toNumber(needs.ptptn),
      housing: toNumber(needs.housing),
      car: toNumber(needs.car),
      personalLoans: toNumber(needs.personal),
      others: toNumber(needs.others),
      customItems: needsCustomItems,
      total: needsTotal,
    },
    wants: {
      dining: toNumber(wants.dining),
      entertainment: toNumber(wants.entertainment),
      travel: toNumber(wants.travel),
      shopping: toNumber(wants.shopping),
      hobbies: toNumber(wants.hobbies),
      customItems: wantsCustomItems,
      notes: String(wants.notes ?? ""),
      total: wantsTotal,
    },
    savings: {
      kwsp: { monthly: toNumber(savings.kwsp), projected: projected.kwsp },
      gold: { monthly: toNumber(savings.gold), projected: projected.gold },
      mutualFunds: { monthly: toNumber(savings.mutualFunds), projected: projected.mutualFunds },
      asb: { monthly: toNumber(savings.asb), projected: projected.asb },
      tabungHaji: { monthly: toNumber(savings.tabungHaji), projected: projected.tabungHaji },
      customItems: savingsCustomItems,
      total: savingsTotal,
      projectedTotal,
    },
    budgetSplit,
    submittedAt,
  }
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  return 0
}

function projectedValue(monthly: number, annualReturn: number, years: number) {
  if (!monthly || years <= 0) return 0
  const monthlyRate = annualReturn / 12
  const months = years * 12
  return monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
}

function formatTimestamp(value: unknown) {
  if (!value || typeof value !== "object") return ""
  const timestamp = value as { toDate?: () => Date }
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString()
  }
  return ""
}
