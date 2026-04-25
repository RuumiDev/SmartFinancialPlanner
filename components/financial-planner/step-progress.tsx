"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepProgressProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}

export function StepProgress({ currentStep, totalSteps, stepLabels }: StepProgressProps) {
  return (
    <div className="w-full">
      {/* Mobile view - simple progress bar */}
      <div className="sm:hidden mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-muted-foreground">{stepLabels[currentStep - 1]}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop view - step circles */}
      <div className="hidden sm:flex items-center justify-between mb-8">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isUpcoming && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 text-center max-w-[80px] leading-tight transition-colors duration-300",
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div className="flex-1 h-0.5 mx-3 mt-[-20px]">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
