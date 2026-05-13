"use client"

import { useState, useCallback, useEffect } from "react"
import Swal from "sweetalert2"
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, TrendingUp } from "lucide-react"
import { LoginScreen } from "./login-screen"
import { StepProgress } from "./step-progress"
import { StepProfile } from "./step-profile"
import { StepIncome } from "./step-income"
import { StepNeeds } from "./step-needs"
import { StepWants } from "./step-wants"
import { StepSavings } from "./step-savings"
import { SuccessModal } from "./success-modal"
import { type FormData, initialFormData } from "./types"

const STEP_LABELS = ["Profile", "Income", "Needs", "Wants", "Savings"]
const TOTAL_STEPS = 5

export function FinancialPlanner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showSuccess, setShowSuccess] = useState(false)

  // Subscribe to auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true)
        setUserId(user.uid)
        setFormData((prev) => ({
          ...prev,
          email: prev.email || user.email || "",
          name: prev.name || user.displayName || "",
        }))
        setDoc(
          doc(db, "users", user.uid),
          { uid: user.uid, email: user.email ?? "", name: user.displayName ?? "", lastLoginAt: serverTimestamp() },
          { merge: true }
        ).catch((err) => console.error("[Auth] user doc update failed:", err))
      }
      setIsAuthLoading(false)
    })

    return () => unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const saveSurveyResponse = async () => {
    if (!userId) {
      await Swal.fire({
        title: "Missing user",
        text: "Please sign in again before submitting your plan.",
        icon: "error",
      })
      return false
    }

    const currentYear = 2026
    const age = formData.dateOfBirth
      ? currentYear - formData.dateOfBirth.getFullYear()
      : null
    const yearsToPension = age !== null ? Math.max(0, 55 - age) : null

    const projectedPensionTotal = calculateProjectedPensionTotal(
      formData.savings,
      yearsToPension ?? 0
    )

    try {
      await addDoc(collection(db, "surveys"), {
        userId,
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        hpNo: formData.hpNo,
        occupation: formData.occupation,
        studentLevel: formData.studentLevel,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
        age,
        yearsToPension,
        monthlyIncome: formData.monthlyIncome,
        needs: formData.needs,
        wants: formData.wants,
        savings: formData.savings,
        savingsAllocations: formData.savings,
        projectedPensionTotal,
        submittedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      await Swal.fire({
        title: "Submission failed",
        text: (error as Error).message,
        icon: "error",
      })
      return false
    }
  }

  const updateFormData = useCallback((data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }, [])

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      if (currentStep === 1) {
        const missingField = getFirstMissingProfileField(formData)
        if (missingField) {
          await Swal.fire({
            title: "Please complete your profile",
            text: `Missing: ${missingField}.`,
            icon: "warning",
          })
          return
        }
      }

      setCurrentStep((prev) => prev + 1)
      return
    }

    const result = await Swal.fire({
      title: "Complete your plan?",
      text: "You can still review and adjust it afterward.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Complete",
      cancelButtonText: "Review",
    })

    if (result.isConfirmed) {
      const saved = await saveSurveyResponse()
      if (saved) {
        setShowSuccess(true)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const resetPlanner = () => {
    setFormData(initialFormData)
    setCurrentStep(1)
    setShowSuccess(false)
  }

  const handleReset = async () => {
    setShowSuccess(false)
    const result = await Swal.fire({
      title: "Start over?",
      text: "This will clear all your answers.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reset",
      cancelButtonText: "Cancel",
    })

    if (result.isConfirmed) {
      resetPlanner()
    } else {
      setShowSuccess(true)
    }
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Sign out?",
      text: "You will be returned to the login screen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sign out",
      cancelButtonText: "Cancel",
    })

    if (result.isConfirmed) {
      setIsLoggedIn(false)
      setUserId(null)
      resetPlanner()
    }
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen
        isAuthLoading={isAuthLoading}
        onLogin={async (user) => {
          setIsLoggedIn(true)
          if (!user?.uid) return
          setUserId(user.uid)

          setFormData((prev) => ({
            ...prev,
            email: prev.email || user.email || "",
            name: prev.name || user.name || "",
          }))

          try {
            await setDoc(
              doc(db, "users", user.uid),
              {
                uid: user.uid,
                email: user.email ?? "",
                name: user.name ?? "",
                lastLoginAt: serverTimestamp(),
              },
              { merge: true }
            )
          } catch (error) {
            await Swal.fire({
              title: "Profile not saved",
              text: (error as Error).message,
              icon: "error",
            })
          }
        }}
      />
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepProfile data={formData} updateData={updateFormData} />
      case 2:
        return <StepIncome data={formData} updateData={updateFormData} />
      case 3:
        return <StepNeeds data={formData} updateData={updateFormData} />
      case 4:
        return <StepWants data={formData} updateData={updateFormData} />
      case 5:
        return <StepSavings data={formData} updateData={updateFormData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-sm">Smart Financial Planner</h1>
              <p className="text-xs text-muted-foreground">2026</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <StepProgress 
          currentStep={currentStep} 
          totalSteps={TOTAL_STEPS} 
          stepLabels={STEP_LABELS} 
        />
        
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex-1 sm:flex-none sm:w-32 h-11 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 sm:flex-none sm:w-32 h-11 gap-2"
          >
            {currentStep === TOTAL_STEPS ? "Complete" : "Next"}
            {currentStep !== TOTAL_STEPS && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        onReset={handleReset}
        data={formData}
      />
    </div>
  )
}

function getFirstMissingProfileField(data: FormData) {
  if (!data.name.trim()) return "Name"
  if (!data.email.trim()) return "Email"
  if (!data.gender.trim()) return "Gender"
  if (!data.hpNo.trim()) return "HP No"
  if (!data.dateOfBirth) return "Date of Birth"
  if (!data.occupation.trim()) return "Occupation"
  if (data.occupation === "student" && !data.studentLevel.trim()) return "Student Level"
  return ""
}

function calculateProjectedPensionTotal(
  savings: FormData["savings"],
  yearsToPension: number
) {
  const rates = {
    kwsp: 0.06,
    asb: 0.06,
    tabungHaji: 0.05,
    gold: 0.10,
    mutualFunds: 0.08,
  }

  const getFutureValue = (monthly: number, annualReturn: number) => {
    if (!monthly || yearsToPension <= 0) return 0
    const monthlyRate = annualReturn / 12
    const months = yearsToPension * 12
    return monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  }

  const fixedTotal =
    getFutureValue(savings.kwsp, rates.kwsp) +
    getFutureValue(savings.asb, rates.asb) +
    getFutureValue(savings.tabungHaji, rates.tabungHaji) +
    getFutureValue(savings.gold, rates.gold) +
    getFutureValue(savings.mutualFunds, rates.mutualFunds)

  const customTotal = (savings.customItems || []).reduce((sum, item) => {
    return sum + getFutureValue(item.amount || 0, (item.expectedRate || 0) / 100)
  }, 0)

  return fixedTotal + customTotal
}
