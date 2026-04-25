"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, RotateCcw, Sparkles } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { FormData } from "./types"

const PDF_TEMPLATE_ID = "success-pdf-template"

interface SuccessModalProps {
  open: boolean
  onClose: () => void
  onReset: () => void
  data: FormData
}

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981"]

export function SuccessModal({ open, onClose, onReset, data }: SuccessModalProps) {
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

  const totalNeeds =
    (data.needs.ptptn || 0) +
    (data.needs.housing || 0) +
    (data.needs.car || 0) +
    (data.needs.personal || 0) +
    (data.needs.others || 0) +
    (data.needs.customItems || []).reduce((s, i) => s + i.amount, 0)

  const totalWants =
    Object.entries(data.wants)
      .filter(([key]) => key !== "customItems" && key !== "notes")
      .reduce((sum, [, val]) => sum + (typeof val === "number" ? val : 0), 0) +
    (data.wants.customItems || []).reduce((s, i) => s + i.amount, 0)

  const totalSavings =
    (data.savings.kwsp || 0) +
    (data.savings.gold || 0) +
    (data.savings.mutualFunds || 0) +
    (data.savings.asb || 0) +
    (data.savings.tabungHaji || 0) +
    (data.savings.customItems || []).reduce((s, i) => s + i.amount, 0)

  const totalBudget = totalNeeds + totalWants + totalSavings
  const remainingBudget = (data.monthlyIncome || 0) - totalBudget

  const pieData = [
    { name: "Needs", value: totalNeeds },
    { name: "Wants", value: totalWants },
    { name: "Savings", value: totalSavings },
  ].filter((d) => d.value > 0)

  const needsPct = data.monthlyIncome > 0 ? ((totalNeeds / data.monthlyIncome) * 100).toFixed(1) : "0"
  const wantsPct = data.monthlyIncome > 0 ? ((totalWants / data.monthlyIncome) * 100).toFixed(1) : "0"
  const savingsPct = data.monthlyIncome > 0 ? ((totalSavings / data.monthlyIncome) * 100).toFixed(1) : "0"

  // Fetch AI summary when modal opens and budget is not perfectly zero
  useEffect(() => {
    if (!open || remainingBudget === 0) return
    setAiSummary(null)
    setAiError(null)
    setAiLoading(true)

    fetch("/api/analyze-budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        income: data.monthlyIncome,
        needs: data.needs,
        wants: data.wants,
        savings: data.savings,
        unallocated: remainingBudget,
      }),
    })
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) {
          const msg = json.error ?? `HTTP ${res.status}`
          console.error("[SuccessModal] AI API error:", msg)
          setAiError(msg)
          return
        }
        setAiSummary((json.suggestion?.trim()) || null)
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err)
        console.error("[SuccessModal] AI fetch failed:", msg)
        setAiError(msg)
      })
      .finally(() => setAiLoading(false))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    setPdfLoading(true)
    try {
      // Wait for React to render the template and Recharts to animate
      await new Promise((resolve) => setTimeout(resolve, 500))
      const el = document.getElementById(PDF_TEMPLATE_ID)
      if (!el) throw new Error("PDF template element not found in DOM")
      const [{ default: jsPDF }, { toPng }] = await Promise.all([
        import("jspdf"),
        import("html-to-image"),
      ])
      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: "#ffffff", height: el.scrollHeight })
      const img = new Image()
      img.src = dataUrl
      await new Promise((resolve) => { img.onload = resolve })
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (img.height * pdfWidth) / img.width
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`SmartFinancialPlan-${data.name || "User"}.pdf`)
    } catch (err) {
      console.error("[SuccessModal] PDF export failed:", err)
    } finally {
      setIsGeneratingPDF(false)
      setPdfLoading(false)
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <DialogTitle className="text-2xl text-center">Plan Complete!</DialogTitle>
          <DialogDescription className="text-center">
            {"Great job, "}{data.name || "User"}! Your Smart Financial Plan for 2026 is ready.
          </DialogDescription>
        </DialogHeader>

        {/* Visible summary (web view) */}
        <div ref={captureRef} className="space-y-4 py-2 bg-background">
          {/* Budget summary */}
          <div className="p-4 bg-secondary/50 rounded-xl space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Budget Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Income</span>
                <span className="font-medium text-foreground">{formatCurrency(data.monthlyIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Needs ({needsPct}%)</span>
                <span className="font-medium text-chart-1">{formatCurrency(totalNeeds)}</span>
              </div>
              {(data.needs.customItems || []).map((item, i) => (
                <div key={i} className="flex justify-between text-xs pl-4 text-muted-foreground">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wants ({wantsPct}%)</span>
                <span className="font-medium text-chart-2">{formatCurrency(totalWants)}</span>
              </div>
              {(data.wants.customItems || []).map((item, i) => (
                <div key={i} className="flex justify-between text-xs pl-4 text-muted-foreground">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
              {data.wants.notes && (
                <p className="text-xs text-muted-foreground italic pl-4">Note: {data.wants.notes}</p>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Savings ({savingsPct}%)</span>
                <span className="font-medium text-chart-3">{formatCurrency(totalSavings)}</span>
              </div>
              {(data.savings.customItems || []).map((item, i) => (
                <div key={i} className="flex justify-between text-xs pl-4 text-muted-foreground">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-medium text-foreground">Total Allocated</span>
                <span className="font-bold text-primary">{formatCurrency(totalBudget)}</span>
              </div>
              {remainingBudget > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unallocated</span>
                  <span className="font-medium text-accent">{formatCurrency(remainingBudget)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Donut chart */}
          {pieData.length > 0 && (
            <div className="p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-semibold text-foreground text-sm mb-2">Budget Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* AI suggestion — outside capture area */}
        {remainingBudget !== 0 && (
          <div className={`rounded-xl border p-4 shadow-sm ${
            remainingBudget < 0
              ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50"
              : "border-indigo-200 bg-gradient-to-br from-blue-50 to-indigo-50"
          }`}>
            <div className="mb-3 flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                remainingBudget < 0 ? "bg-red-100" : "bg-indigo-100"
              }`}>
                <Sparkles className={`h-4 w-4 ${remainingBudget < 0 ? "text-red-600" : "text-indigo-600"}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${remainingBudget < 0 ? "text-red-900" : "text-indigo-900"}`}>
                  AI Advisor Suggestion
                </p>
                <p className={`text-xs ${remainingBudget < 0 ? "text-red-500" : "text-indigo-500"}`}>
                  {remainingBudget < 0
                    ? `Overspending by ${formatCurrency(Math.abs(remainingBudget))}`
                    : `Unallocated: ${formatCurrency(remainingBudget)}`}
                </p>
              </div>
            </div>
            {aiLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className={`h-3 w-full rounded ${remainingBudget < 0 ? "bg-red-200/70" : "bg-indigo-200/70"}`} />
                <div className={`h-3 w-5/6 rounded ${remainingBudget < 0 ? "bg-red-200/70" : "bg-indigo-200/70"}`} />
                <div className={`h-3 w-4/6 rounded ${remainingBudget < 0 ? "bg-red-200/70" : "bg-indigo-200/70"}`} />
              </div>
            ) : aiSummary ? (
              <p className={`text-sm leading-relaxed ${remainingBudget < 0 ? "text-red-900" : "text-indigo-900"}`}>
                {aiSummary}
              </p>
            ) : (
              <p className={`text-sm italic ${remainingBudget < 0 ? "text-red-700" : "text-indigo-700"}`}>
                {remainingBudget < 0
                  ? "You are spending more than you earn. Review your Wants and cut non-essential items."
                  : "Consider directing your unallocated funds into an emergency fund or boosting your savings to reach the 20% target."}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
          >
            <Download className="w-4 h-4" />
            {pdfLoading ? "Generating…" : "Save as PDF"}
          </Button>
          <Button className="flex-1 gap-2" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
            Start Over
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* PDF template + overlay: only mounted when the user clicks Download PDF */}
    {isGeneratingPDF && (
      <>
        {/* Full-screen overlay so the user sees a spinner, not the raw template */}
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-semibold text-gray-700">Generating Official Report…</p>
          </div>
        </div>
        {/* PDF template at full opacity so html-to-image can capture it */}
        <div
          id={PDF_TEMPLATE_ID}
          className="fixed top-0 left-0 z-[9998] w-[800px] h-fit bg-white text-black"
          style={{ fontFamily: "sans-serif", color: "#111827" }}
        >
      <div style={{ padding: "40px 48px 0" }}>
        {/* Header */}
        <div style={{ borderBottom: "3px solid #6366f1", paddingBottom: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>SF</span>
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#6366f1", margin: 0 }}>Smart Financial Planner</p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Official Financial Plan Report</p>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#374151" }}>
            <span><strong>Name:</strong> {data.name || "—"}</span>
            <span><strong>Generated:</strong> {new Date().toLocaleString("en-MY")}</span>
          </div>
        </div>

        {/* Income overview */}
        <div style={{ backgroundColor: "#f5f3ff", borderRadius: 10, padding: "14px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Monthly Income</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: "#4f46e5", margin: 0 }}>{formatCurrency(data.monthlyIncome)}</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Needs", pct: needsPct, color: "#6366f1" },
              { label: "Wants", pct: wantsPct, color: "#f59e0b" },
              { label: "Savings", pct: savingsPct, color: "#10b981" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center", padding: "6px 14px", backgroundColor: "#ede9fe", borderRadius: 8 }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: s.color, margin: 0 }}>{s.pct}%</p>
                <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Needs */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 10 }}>Needs (50%)</p>
          {[
            { label: "PTPTN / MARA", val: data.needs.ptptn },
            { label: "Housing", val: data.needs.housing },
            { label: "Car", val: data.needs.car },
            { label: "Personal Loans", val: data.needs.personal },
            { label: "Others", val: data.needs.others },
            ...(data.needs.customItems || []).map((c) => ({ label: c.name, val: c.amount })),
          ].filter((r) => r.val > 0).map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", color: "#374151" }}>
              <span>{row.label}</span><span style={{ fontWeight: 600 }}>{formatCurrency(row.val)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 6, color: "#4f46e5" }}>
            <span>Total Needs</span><span>{formatCurrency(totalNeeds)}</span>
          </div>
        </div>

        {/* Wants */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 10 }}>Wants (30%)</p>
          {[
            { label: "Dining Out", val: data.wants.dining },
            { label: "Entertainment", val: data.wants.entertainment },
            { label: "Travel", val: data.wants.travel },
            { label: "Shopping", val: data.wants.shopping },
            { label: "Hobbies", val: data.wants.hobbies },
            ...(data.wants.customItems || []).map((c) => ({ label: c.name, val: c.amount })),
          ].filter((r) => r.val > 0).map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", color: "#374151" }}>
              <span>{row.label}</span><span style={{ fontWeight: 600 }}>{formatCurrency(row.val)}</span>
            </div>
          ))}
          {data.wants.notes && (
            <p style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic", marginTop: 4 }}>Note: {data.wants.notes}</p>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 6, color: "#d97706" }}>
            <span>Total Wants</span><span>{formatCurrency(totalWants)}</span>
          </div>
        </div>

        {/* Savings */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 10 }}>Savings & Investments (20%)</p>
          {[
            { label: "KWSP (EPF)", val: data.savings.kwsp },
            { label: "Gold Investment", val: data.savings.gold },
            { label: "Mutual Funds", val: data.savings.mutualFunds },
            { label: "ASB", val: data.savings.asb },
            { label: "Tabung Haji", val: data.savings.tabungHaji },
            ...(data.savings.customItems || []).map((c) => ({ label: `${c.name} (${c.expectedRate}% p.a.)`, val: c.amount })),
          ].filter((r) => r.val > 0).map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", color: "#374151" }}>
              <span>{row.label}</span><span style={{ fontWeight: 600 }}>{formatCurrency(row.val)}/mo</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 6, color: "#059669" }}>
            <span>Total Savings</span><span>{formatCurrency(totalSavings)}/mo</span>
          </div>
        </div>

        {/* Budget totals */}
        <div style={{ backgroundColor: "#f0fdf4", borderRadius: 10, padding: "14px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: "#6b7280" }}>Total Allocated</span>
            <span style={{ fontWeight: 700, color: "#111827" }}>{formatCurrency(totalBudget)}</span>
          </div>
          {remainingBudget > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#6b7280" }}>Unallocated Remainder</span>
              <span style={{ fontWeight: 700, color: "#d97706" }}>{formatCurrency(remainingBudget)}</span>
            </div>
          )}
        </div>

        {/* Pie chart — fixed dimensions, SVG labels, custom HTML legend, animation off */}
        {pieData.length > 0 && (
          <div style={{ marginBottom: 20, height: 450, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", marginBottom: 8, alignSelf: "flex-start" }}>Budget Distribution</p>
            <PieChart width={440} height={360}>
              <Pie
                data={pieData}
                cx={220}
                cy={160}
                innerRadius={65}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={false}
                label={({ name, value }: { name: string; value: number }) => `${name}: ${formatCurrency(value)}`}
                labelLine={true}
              >
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
            </PieChart>
            {/* Custom HTML legend — renders reliably in html-to-image */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, fontSize: 12, fontWeight: 600, color: "#374151", marginTop: 8 }}>
              {pieData.map((entry, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI suggestion */}
        {(aiSummary || remainingBudget > 0) && (
          <div style={{ backgroundColor: "#eef2ff", borderRadius: 10, padding: "14px 20px", marginBottom: 20, borderLeft: "4px solid #6366f1" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", marginBottom: 6 }}>AI Advisor Suggestion</p>
            <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, margin: 0 }}>
              {aiSummary || "Consider directing your unallocated funds into an emergency fund or boosting your savings to reach the 20% target."}
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, textAlign: "center", fontSize: 10, color: "#9ca3af" }}>
          Generated by Smart Financial Planner · {new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })} · For personal planning purposes only.
        </div>
        {/* Physical spacer — prevents html-to-image from clipping the last element */}
        <div className="h-12 w-full shrink-0" />
      </div>
        </div>
      </>
    )}
    </>
  )
}

