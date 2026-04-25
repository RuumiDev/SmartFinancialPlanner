"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { User, Calendar, Briefcase, Clock, Mail, Phone } from "lucide-react"
import type { FormData } from "./types"

interface StepProfileProps {
  data: FormData
  updateData: (data: Partial<FormData>) => void
  onNext?: () => void
}

const CURRENT_YEAR = 2026

export function StepProfile({ data, updateData, onNext }: StepProfileProps) {
  const [name, setName] = useState(data.name)
  const [email, setEmail] = useState(data.email)
  const [gender, setGender] = useState(data.gender)
  const [hpNo, setHpNo] = useState(data.hpNo)
  const [occupation, setOccupation] = useState(data.occupation)
  const [studentLevel, setStudentLevel] = useState(data.studentLevel)
  const [isGoogleUser, setIsGoogleUser] = useState(false)

  // Derive age and yearsToPension directly — no state, no effect, no loop
  const age = data.dateOfBirth ? CURRENT_YEAR - data.dateOfBirth.getFullYear() : null
  const yearsToPension = age !== null ? Math.max(0, 55 - age) : null

  const latestAllowedDate = new Date(CURRENT_YEAR - 18, 11, 31)
  const earliestAllowedDate = new Date(1940, 0, 1)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  useEffect(() => {
    if (data.name && data.name !== name) setName(data.name)
    if (data.email && data.email !== email) setEmail(data.email)
    if (data.gender && data.gender !== gender) setGender(data.gender)
    if (data.hpNo && data.hpNo !== hpNo) setHpNo(data.hpNo)
    if (data.occupation && data.occupation !== occupation) setOccupation(data.occupation)
    if (data.studentLevel && data.studentLevel !== studentLevel) setStudentLevel(data.studentLevel)
  }, [
    data.name,
    data.email,
    data.gender,
    data.hpNo,
    data.occupation,
    data.studentLevel,
    name,
    email,
    gender,
    hpNo,
    occupation,
    studentLevel,
  ])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return
      const fromGoogle = user.providerData.some((provider) => provider.providerId === "google.com")
      setIsGoogleUser(fromGoogle)

      if (user.displayName && !name) {
        setName(user.displayName)
        updateData({ name: user.displayName })
      }

      if (user.email && !email) {
        setEmail(user.email)
        updateData({ email: user.email })
      }
    })

    return () => unsubscribe()
  }, [email, name, updateData])

  // ── DOB effect removed ── age and yearsToPension are now derived inline above ──

  return (
    <div
      id="step-1-container"
      className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Profile & Timeline</h2>
        <p className="text-muted-foreground mt-1">{"Let's start with your basic information"}</p>
      </div>

      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  updateData({ name: e.target.value })
                }}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  updateData({ email: e.target.value })
                }}
                readOnly={isGoogleUser && Boolean(email)}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gender</Label>
              <Select
                value={gender}
                onValueChange={(value) => {
                  setGender(value)
                  updateData({ gender: value })
                }}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hpNo" className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                HP No
              </Label>
              <Input
                id="hpNo"
                type="tel"
                placeholder="e.g., 012-3456789"
                value={hpNo}
                onChange={(e) => {
                  setHpNo(e.target.value)
                  updateData({ hpNo: e.target.value })
                }}
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Date of Birth
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dateOfBirth"
                    variant="outline"
                    className="h-11 w-full justify-start text-left font-normal"
                  >
                    {data.dateOfBirth ? formatDate(data.dateOfBirth) : "Select your date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <CalendarPicker
                    mode="single"
                    captionLayout="dropdown"
                    selected={data.dateOfBirth ?? undefined}
                    onSelect={(date) => updateData({ dateOfBirth: date ?? null })}
                    fromYear={1940}
                    toYear={CURRENT_YEAR - 18}
                    disabled={{ before: earliestAllowedDate, after: latestAllowedDate }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Occupation
              </Label>
              <Select
                value={occupation}
                onValueChange={(value) => {
                  setOccupation(value)
                  if (value !== "student") {
                    setStudentLevel("")
                    updateData({ occupation: value, studentLevel: "" })
                  } else {
                    updateData({ occupation: value })
                  }
                }}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select your occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="private">Private Sector</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="glc">Government Link Company</SelectItem>
                  <SelectItem value="businessman">Businessman</SelectItem>
                  <SelectItem value="pensioner">Pensioner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {occupation === "student" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Level of Study</Label>
              <Select
                value={studentLevel}
                onValueChange={(value) => {
                  setStudentLevel(value)
                  updateData({ studentLevel: value })
                }}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foundation">Foundation</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="degree">Degree</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="phd">PHD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {(age !== null || yearsToPension !== null) && (
        <Card className="border border-blue-100 bg-blue-50/70 shadow-sm">
          <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Age (based on {CURRENT_YEAR})</p>
                <p className="text-lg font-semibold text-slate-900">
                  {age !== null ? `${age} years` : "--"}
                </p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-slate-600">Years to Pension (Age 55)</p>
              <p className="text-lg font-semibold text-slate-900">
                {yearsToPension !== null ? `${yearsToPension} years` : "--"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {onNext && (
        <Button
          className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold"
          onClick={onNext}
        >
          Next: Income & Needs
        </Button>
      )}
    </div>
  )
}
