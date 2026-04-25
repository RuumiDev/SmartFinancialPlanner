"use client"

import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Download } from "lucide-react"
import type { SurveyResponse } from "./types"

const ADMIN_PDF_TEMPLATE_ID = "admin-survey-pdf-template"

interface SurveyDetailModalProps {
  survey: SurveyResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SurveyDetailModal({
  survey,
  open,
  onOpenChange,
}: SurveyDetailModalProps) {
  const captureRef = useRef<HTMLDivElement>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  if (!survey) return null

  const formatCurrency = (value: number) =>
    `RM ${value.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    setPdfLoading(true)
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      const el = document.getElementById(ADMIN_PDF_TEMPLATE_ID)
      if (!el) throw new Error("Admin PDF template element not found in DOM")
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
      pdf.save(`Survey-${survey.name.replace(/\s+/g, "-")}.pdf`)
    } catch (err) {
      console.error("[AdminPDF] export failed:", err)
    } finally {
      setIsGeneratingPDF(false)
      setPdfLoading(false)
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <DialogTitle className="text-xl">Survey Details</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Submitted on {new Date(survey.submittedAt).toLocaleDateString("en-MY", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
            >
              <Download className="w-4 h-4" />
              {pdfLoading ? "Generating PDF…" : "Download PDF"}
            </Button>
          </div>
        </DialogHeader>

        <div ref={captureRef} className="space-y-6 bg-background p-1">
          {/* Profile Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Profile Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium text-foreground">{survey.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium text-foreground">{survey.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span>
                <p className="font-medium text-foreground">{survey.age} years old</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <p className="font-medium text-foreground">{survey.gender}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Occupation:</span>
                <Badge variant="secondary">{survey.occupation}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Years to Pension:</span>
                <p className="font-medium text-foreground">{survey.yearsToPension} years</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Income Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Income & Budget Split</h3>
            <div className="bg-muted/50 rounded-lg p-4 mb-3">
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(survey.expectedIncome)}
                <span className="text-sm font-normal text-muted-foreground"> / month</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <p className="text-lg font-bold text-primary">{survey.budgetSplit.needsPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Needs</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-chart-3/20">
                <p className="text-lg font-bold" style={{ color: "var(--chart-3)" }}>{survey.budgetSplit.wantsPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Wants</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/20">
                <p className="text-lg font-bold text-accent">{survey.budgetSplit.savingsPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Savings</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Needs Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Needs Breakdown</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {survey.needs.ptptn > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PTPTN/MARA:</span>
                  <span className="font-medium text-foreground">{formatCurrency(survey.needs.ptptn)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Housing:</span>
                <span className="font-medium text-foreground">{formatCurrency(survey.needs.housing)}</span>
              </div>
              {survey.needs.car > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Car:</span>
                  <span className="font-medium text-foreground">{formatCurrency(survey.needs.car)}</span>
                </div>
              )}
              {survey.needs.personalLoans > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Personal Loans:</span>
                  <span className="font-medium text-foreground">{formatCurrency(survey.needs.personalLoans)}</span>
                </div>
              )}
              {survey.needs.others > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Others:</span>
                  <span className="font-medium text-foreground">{formatCurrency(survey.needs.others)}</span>
                </div>
              )}
              {(survey.needs.customItems || []).map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">{item.name}:</span>
                  <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-2 border-t font-semibold">
              <span className="text-foreground">Total Needs:</span>
              <span className="text-primary">{formatCurrency(survey.needs.total)}</span>
            </div>
          </div>

          <Separator />

          {/* Wants Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Wants Breakdown</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dining:</span>
                <span className="font-medium text-foreground">{formatCurrency(survey.wants.dining)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entertainment:</span>
                <span className="font-medium text-foreground">{formatCurrency(survey.wants.entertainment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Travel:</span>
                <span className="font-medium text-foreground">{formatCurrency(survey.wants.travel)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shopping:</span>
                <span className="font-medium text-foreground">{formatCurrency(survey.wants.shopping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hobbies:</span>
                <span className="font-medium text-foreground">{formatCurrency(survey.wants.hobbies)}</span>
              </div>
              {survey.wants.customItems.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">{item.name}:</span>
                  <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
            {survey.wants.notes && (
              <p className="text-xs text-muted-foreground mt-2 italic">Note: {survey.wants.notes}</p>
            )}
            <div className="flex justify-between mt-3 pt-2 border-t font-semibold">
              <span className="text-foreground">Total Wants:</span>
              <span style={{ color: "var(--chart-3)" }}>{formatCurrency(survey.wants.total)}</span>
            </div>
          </div>

          <Separator />

          {/* Savings Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Savings & Investments</h3>
            <div className="space-y-2 text-sm">
              {[
                { name: "KWSP", data: survey.savings.kwsp },
                { name: "Gold", data: survey.savings.gold },
                { name: "Mutual Funds", data: survey.savings.mutualFunds },
                { name: "ASB", data: survey.savings.asb },
                { name: "Tabung Haji", data: survey.savings.tabungHaji },
              ].map((item) => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.name}:</span>
                  <div className="text-right">
                    <span className="font-medium text-foreground">{formatCurrency(item.data.monthly)}/mo</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Proj: {formatCurrency(item.data.projected)})
                    </span>
                  </div>
                </div>
              ))}
              {(survey.savings.customItems || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{item.name} ({item.expectedRate}% p.a.):</span>
                  <span className="font-medium text-foreground">{formatCurrency(item.amount)}/mo</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-2 border-t">
              <div>
                <span className="font-semibold text-foreground">Monthly Total:</span>
                <p className="text-accent font-bold text-lg">{formatCurrency(survey.savings.total)}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-foreground">Projected at Retirement:</span>
                <p className="text-accent font-bold text-lg">{formatCurrency(survey.savings.projectedTotal)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* ── PDF overlay + template: only mounted during capture ── */}
    {isGeneratingPDF && (
      <>
        {/* Full-screen overlay so admin sees a spinner, not the raw template */}
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-6 shadow-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-semibold text-gray-700">Generating Report…</p>
          </div>
        </div>
        {/* PDF template rendered at full opacity for html-to-image */}
        <div
          id={ADMIN_PDF_TEMPLATE_ID}
          className="fixed top-0 left-0 z-[9998] w-[800px] h-fit bg-white text-black"
          style={{ fontFamily: "sans-serif", color: "#111827" }}
        >
        <div style={{ padding: "40px 48px" }}>
          {/* Header */}
          <div style={{ borderBottom: "3px solid #6366f1", paddingBottom: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>SF</span>
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#6366f1", margin: 0 }}>Smart Financial Planner</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Admin Survey Report</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#374151" }}>
              <span><strong>Respondent:</strong> {survey.name} ({survey.email})</span>
              <span><strong>Submitted:</strong> {new Date(survey.submittedAt).toLocaleDateString("en-MY")}</span>
            </div>
          </div>

          {/* Profile */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 10 }}>Profile</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
              {[
                ["Age", `${survey.age} years old`],
                ["Gender", survey.gender],
                ["Occupation", survey.occupation],
                ["Years to Pension", `${survey.yearsToPension} years`],
              ].map(([k, v]) => (
                <div key={k}><span style={{ color: "#6b7280" }}>{k}: </span><strong>{v}</strong></div>
              ))}
            </div>
          </div>

          {/* Income overview */}
          <div style={{ backgroundColor: "#f5f3ff", borderRadius: 10, padding: "14px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Monthly Income</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#4f46e5", margin: 0 }}>{formatCurrency(survey.expectedIncome)}</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { label: "Needs", pct: survey.budgetSplit.needsPercent.toFixed(1), color: "#6366f1" },
                { label: "Wants", pct: survey.budgetSplit.wantsPercent.toFixed(1), color: "#f59e0b" },
                { label: "Savings", pct: survey.budgetSplit.savingsPercent.toFixed(1), color: "#10b981" },
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
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 10 }}>Needs</p>
            {[
              { label: "PTPTN / MARA", val: survey.needs.ptptn },
              { label: "Housing", val: survey.needs.housing },
              { label: "Car", val: survey.needs.car },
              { label: "Personal Loans", val: survey.needs.personalLoans },
              { label: "Others", val: survey.needs.others },
              ...(survey.needs.customItems || []).map((c) => ({ label: c.name, val: c.amount })),
            ].filter((r) => r.val > 0).map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", color: "#374151" }}>
                <span>{row.label}</span><span style={{ fontWeight: 600 }}>{formatCurrency(row.val)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 6, color: "#4f46e5" }}>
              <span>Total Needs</span><span>{formatCurrency(survey.needs.total)}</span>
            </div>
          </div>

          {/* Wants */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 10 }}>Wants</p>
            {[
              { label: "Dining", val: survey.wants.dining },
              { label: "Entertainment", val: survey.wants.entertainment },
              { label: "Travel", val: survey.wants.travel },
              { label: "Shopping", val: survey.wants.shopping },
              { label: "Hobbies", val: survey.wants.hobbies },
              ...survey.wants.customItems.map((c) => ({ label: c.name, val: c.amount })),
            ].filter((r) => r.val > 0).map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", color: "#374151" }}>
                <span>{row.label}</span><span style={{ fontWeight: 600 }}>{formatCurrency(row.val)}</span>
              </div>
            ))}
            {survey.wants.notes && (
              <p style={{ fontSize: 11, color: "#6b7280", fontStyle: "italic", marginTop: 4 }}>Note: {survey.wants.notes}</p>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 6, color: "#d97706" }}>
              <span>Total Wants</span><span>{formatCurrency(survey.wants.total)}</span>
            </div>
          </div>

          {/* Savings */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 10 }}>Savings & Investments</p>
            {[
              { label: "KWSP (EPF)", monthly: survey.savings.kwsp.monthly, projected: survey.savings.kwsp.projected },
              { label: "Gold Investment", monthly: survey.savings.gold.monthly, projected: survey.savings.gold.projected },
              { label: "Mutual Funds", monthly: survey.savings.mutualFunds.monthly, projected: survey.savings.mutualFunds.projected },
              { label: "ASB", monthly: survey.savings.asb.monthly, projected: survey.savings.asb.projected },
              { label: "Tabung Haji", monthly: survey.savings.tabungHaji.monthly, projected: survey.savings.tabungHaji.projected },
            ].filter((r) => r.monthly > 0).map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", color: "#374151" }}>
                <span>{row.label}</span>
                <span><strong>{formatCurrency(row.monthly)}/mo</strong> <span style={{ color: "#6b7280" }}>(Proj: {formatCurrency(row.projected)})</span></span>
              </div>
            ))}
            {(survey.savings.customItems || []).map((item, i) => (
              <div key={`c${i}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", color: "#374151" }}>
                <span>{item.name} ({item.expectedRate}% p.a.)</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}/mo</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 6, color: "#059669" }}>
              <span>Monthly Total</span><span>{formatCurrency(survey.savings.total)}/mo</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#059669" }}>
              <span>Projected at Retirement</span><span>{formatCurrency(survey.savings.projectedTotal)}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, textAlign: "center", fontSize: 10, color: "#9ca3af" }}>
            Smart Financial Planner Admin Report · Exported {new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })} · Confidential
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
