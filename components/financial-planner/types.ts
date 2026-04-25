export interface CustomItem {
  name: string
  amount: number
}

export interface CustomSavingsItem extends CustomItem {
  expectedRate: number
}

export interface FormData {
  // Profile
  name: string
  email: string
  gender: string
  hpNo: string
  dateOfBirth: Date | null
  occupation: string
  studentLevel: string
  
  // Income
  monthlyIncome: number
  
  // Needs (50%)
  needs: {
    ptptn: number
    housing: number
    car: number
    personal: number
    others: number
    customItems: CustomItem[]
  }
  
  // Wants (30%)
  wants: {
    dining: number
    entertainment: number
    travel: number
    shopping: number
    hobbies: number
    notes: string
    customItems: CustomItem[]
  }
  
  // Savings (20%)
  savings: {
    kwsp: number
    gold: number
    mutualFunds: number
    asb: number
    tabungHaji: number
    customItems: CustomSavingsItem[]
  }
}

export const initialFormData: FormData = {
  name: "",
  email: "",
  gender: "",
  hpNo: "",
  dateOfBirth: null,
  occupation: "",
  studentLevel: "",
  monthlyIncome: 0,
  needs: {
    ptptn: 0,
    housing: 0,
    car: 0,
    personal: 0,
    others: 0,
    customItems: [],
  },
  wants: {
    dining: 0,
    entertainment: 0,
    travel: 0,
    shopping: 0,
    hobbies: 0,
    notes: "",
    customItems: [],
  },
  savings: {
    kwsp: 0,
    gold: 0,
    mutualFunds: 0,
    asb: 0,
    tabungHaji: 0,
    customItems: [],
  },
}
