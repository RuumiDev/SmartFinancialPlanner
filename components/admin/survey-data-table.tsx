"use client"

import { useState, useEffect, useRef } from "react"
import Swal from "sweetalert2"
import { gsap } from "gsap"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { SurveyDetailModal } from "./survey-detail-modal"
import type { SurveyResponse } from "./types"

interface SurveyDataTableProps {
  data: SurveyResponse[]
  searchQuery: string
}

export function SurveyDataTable({ data, searchQuery }: SurveyDataTableProps) {
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const itemsPerPage = 5

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.occupation.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    if (!tableRef.current) return
    const rows = tableRef.current.querySelectorAll("tbody tr")
    if (!rows.length) return

    gsap.fromTo(
      rows,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" }
    )
  }, [paginatedData.length])

  const formatCurrency = (value: number) =>
    `RM ${value.toLocaleString("en-MY", { minimumFractionDigits: 0 })}`

  const handleViewSurvey = (survey: SurveyResponse) => {
    setSelectedSurvey(survey)
    setModalOpen(true)
  }

  const handleExportRow = async (survey: SurveyResponse) => {
    const result = await Swal.fire({
      title: `Export ${survey.name}?`,
      text: "This will download a CSV file for this response.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Export",
      cancelButtonText: "Cancel",
    })

    if (!result.isConfirmed) return

    const csvContent = [
      ["Name", "Email", "Age", "Gender", "Occupation", "Years to Pension", "Expected Income", "Needs Total", "Wants Total", "Savings Total", "Projected Savings"],
      [
        survey.name,
        survey.email,
        survey.age,
        survey.gender,
        survey.occupation,
        survey.yearsToPension,
        survey.expectedIncome,
        survey.needs.total,
        survey.wants.total,
        survey.savings.total,
        survey.savings.projectedTotal,
      ],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `survey_${survey.name.replace(/\s+/g, "_")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div ref={tableRef} className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Age</TableHead>
              <TableHead className="hidden md:table-cell">Occupation</TableHead>
              <TableHead className="hidden lg:table-cell">Expected Income</TableHead>
              <TableHead className="hidden xl:table-cell">Budget Split</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((survey, index) => (
              <TableRow
                key={survey.id}
                className={`transition-all duration-300 ${mounted ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}
                style={{ transitionDelay: `${(index + 4) * 100}ms` }}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{survey.name}</p>
                    <p className="text-xs text-muted-foreground">{survey.email}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-foreground">
                  {survey.age}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary">{survey.occupation}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell font-medium text-foreground">
                  {formatCurrency(survey.expectedIncome)}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-primary">{survey.budgetSplit.needsPercent.toFixed(0)}%</span>
                    <span className="text-muted-foreground">/</span>
                    <span style={{ color: "var(--chart-3)" }}>{survey.budgetSplit.wantsPercent.toFixed(0)}%</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-accent">{survey.budgetSplit.savingsPercent.toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewSurvey(survey)}
                      className="h-8 px-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExportRow(survey)}
                      className="h-8 px-2"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Export</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No survey responses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <SurveyDetailModal
        survey={selectedSurvey}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
