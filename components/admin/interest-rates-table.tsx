"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X } from "lucide-react"
import type { InterestRate } from "./types"

interface InterestRatesTableProps {
  data: InterestRate[]
  onUpdate: (id: string, newRate: number) => void
}

export function InterestRatesTable({ data, onUpdate }: InterestRatesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  const handleEdit = (rate: InterestRate) => {
    setEditingId(rate.id)
    setEditValue(rate.currentRate.toString())
  }

  const handleSave = (id: string) => {
    const newRate = parseFloat(editValue)
    if (!isNaN(newRate) && newRate >= 0) {
      onUpdate(id, newRate)
    }
    setEditingId(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Investment Vehicle</TableHead>
            <TableHead>Current Rate (%)</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((rate) => (
            <TableRow key={rate.id}>
              <TableCell className="font-medium text-foreground">{rate.name}</TableCell>
              <TableCell>
                {editingId === rate.id ? (
                  <Input
                    type="number"
                    step="0.1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-24 h-8"
                    autoFocus
                  />
                ) : (
                  <span className="text-accent font-semibold">{rate.currentRate}%</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(rate.lastUpdated).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                {editingId === rate.id ? (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSave(rate.id)}
                      className="h-8 px-2 text-accent hover:text-accent"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-8 px-2 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(rate)}
                    className="h-8 px-2"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
