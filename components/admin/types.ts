export interface SurveyResponse {
  id: string
  name: string
  email: string
  age: number
  gender: string
  occupation: string
  yearsToPension: number
  expectedIncome: number
  needs: {
    ptptn: number
    housing: number
    car: number
    personalLoans: number
    others: number
    customItems: { name: string; amount: number }[]
    total: number
  }
  wants: {
    dining: number
    entertainment: number
    travel: number
    shopping: number
    hobbies: number
    customItems: { name: string; amount: number }[]
    notes: string
    total: number
  }
  savings: {
    kwsp: { monthly: number; projected: number }
    gold: { monthly: number; projected: number }
    mutualFunds: { monthly: number; projected: number }
    asb: { monthly: number; projected: number }
    tabungHaji: { monthly: number; projected: number }
    customItems: { name: string; amount: number; expectedRate: number }[]
    total: number
    projectedTotal: number
  }
  budgetSplit: {
    needsPercent: number
    wantsPercent: number
    savingsPercent: number
  }
  submittedAt: string
}

export interface InterestRate {
  id: string
  name: string
  currentRate: number
  lastUpdated: string
}
