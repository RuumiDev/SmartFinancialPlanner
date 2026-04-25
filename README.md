# Financial Planner 2026

A full-stack web application built for Hirumi University students and staff to plan their personal finances using the **50/30/20 budgeting framework**, backed by Firebase for authentication and data storage, with a secure admin dashboard for survey management.

---

## Table of Contents

- [Product Requirements Document (PRD)](#product-requirements-document-prd)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [User Flows](#user-flows)
- [Firebase Data Model](#firebase-data-model)
- [Authentication Model](#authentication-model)
- [Savings Engine](#savings-engine)
- [Admin Dashboard](#admin-dashboard)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Libraries Reference](#libraries-reference)
- [Security Notes](#security-notes)

---

## Product Requirements Document (PRD)

### Purpose

Help individuals — particularly university students — understand and plan their monthly finances using a structured, guided survey experience. The tool collects profile information, income, and spending data, then models savings growth toward retirement (pension at age 55).

### Target Users

- **Primary**: University students (undergraduate, postgraduate, diploma) in Malaysia
- **Secondary**: Employed individuals, self-employed, government servants, retirees
- **Admin**: Financial advisors or administrators who review survey responses

### Core Features

| Feature | Description |
|---|---|
| Google Sign-In | Federated auth via Google for all regular users |
| Multi-Step Survey | 5-step guided form: Profile → Income → Needs → Wants → Savings |
| 50/30/20 Framework | Automatic budget split — 50% Needs, 30% Wants, 20% Savings |
| Live Projections | Compound interest calculations per investment vehicle |
| Profile Auto-Fill | Name and email pre-populated from Google account |
| DOB Calendar Picker | Interactive calendar with auto-calculated age and years-to-pension |
| Firestore Persistence | Survey responses and user profiles saved to Firestore |
| Admin Dashboard | Email/password secured portal with analytics and export |
| XLSX Export | Full Firestore dataset downloadable as Excel |
| Mobile Support | Redirect-based Google auth on mobile devices |
| SweetAlert2 UX | Polished confirmation dialogs for destructive/key actions |

### Non-Goals (Out of Scope)

- Payment or transaction processing
- Multi-currency support
- Real-time investment data feeds
- Email notifications

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.7.3 |
| Runtime | React | 19.2.4 |
| Styling | Tailwind CSS | 4.2.0 |
| Component Library | shadcn/ui + Radix UI | Latest |
| Backend / Auth | Firebase (Auth + Firestore) | 12.10.0 |
| Animation | GSAP | 3.14.2 |
| Dialogs | SweetAlert2 | 11.26.22 |
| Date Picker | react-day-picker | 9.13.2 |
| Excel Export | xlsx (SheetJS) | 0.18.5 |
| Charts | Recharts | 2.15.0 |
| Forms | react-hook-form + zod | 7.54.1 / 3.24.1 |
| Package Manager | npm | — |
| Hosting | Firebase Hosting (webframeworks) | — |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser / Client                │
│                                                  │
│  ┌──────────────┐      ┌───────────────────┐    │
│  │  User App    │      │   Admin Portal    │    │
│  │  /           │      │   /admin          │    │
│  └──────┬───────┘      └────────┬──────────┘    │
│         │ Google Auth           │ Email/Password │
└─────────┼───────────────────────┼───────────────┘
          │                       │
          ▼                       ▼
┌─────────────────────────────────────────────────┐
│              Firebase Services                   │
│                                                  │
│  ┌────────────────────┐  ┌─────────────────────┐│
│  │  Authentication    │  │  Cloud Firestore     ││
│  │  - Google Provider │  │  - /users/{uid}      ││
│  │  - Email/Password  │  │  - /surveys/{id}     ││
│  └────────────────────┘  └─────────────────────┘│
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  Firebase Hosting (SSR via webframeworks)  │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Component Architecture

```
app/
├── page.tsx                    → renders <FinancialPlanner />
└── admin/
    └── page.tsx                → renders admin login + <AdminDashboard />

components/
├── financial-planner/
│   ├── financial-planner.tsx   → Main state orchestrator
│   ├── login-screen.tsx        → Google auth (popup/redirect)
│   ├── step-profile.tsx        → Step 1: personal info
│   ├── step-income.tsx         → Step 2: monthly income
│   ├── step-needs.tsx          → Step 3: 50% needs allocation
│   ├── step-wants.tsx          → Step 4: 30% wants allocation
│   ├── step-savings.tsx        → Step 5: 20% savings + projections
│   ├── step-progress.tsx       → Progress bar / stepper UI
│   ├── success-modal.tsx       → Completion screen
│   └── types.ts                → FormData interface
│
├── admin/
│   ├── admin-dashboard.tsx     → Dashboard with sidebar + analytics
│   ├── analytics-cards.tsx     → Summary stat cards
│   ├── survey-data-table.tsx   → Paginated responses table
│   ├── survey-detail-modal.tsx → View individual survey
│   ├── interest-rates-table.tsx→ Reference rate display
│   ├── mock-data.ts            → Fallback data structure
│   └── types.ts                → Admin-specific types
│
└── ui/                         → shadcn/ui primitives (Button, Card, etc.)

lib/
├── firebase.ts                 → Firebase app + auth + db init
└── utils.ts                    → cn() Tailwind class merge helper
```

---

## Project Structure

```
FinancialPlanner/
├── app/
│   ├── layout.tsx              Metadata, favicon, root layout
│   ├── globals.css             Global Tailwind styles
│   ├── page.tsx                User app entry point
│   └── admin/
│       └── page.tsx            Admin portal entry point
├── components/
│   ├── financial-planner/      Survey app components
│   ├── admin/                  Admin dashboard components
│   └── ui/                     Reusable UI primitives
├── lib/
│   ├── firebase.ts             Firebase initialization
│   └── utils.ts                Utility functions
├── hooks/
│   ├── use-mobile.ts           Mobile detection hook
│   └── use-toast.ts            Toast notification hook
├── public/
│   └── form.png                Favicon / app icon
├── styles/
│   └── globals.css             Additional global styles
├── .env.local                  Firebase config keys (gitignored)
├── firebase.json               Firebase project config (hosting + rules)
├── .firebaserc                 Project alias (financial-planner-fb427)
├── firestore.rules             Firestore security rules
├── firestore.indexes.json      Firestore composite indexes
├── next.config.mjs             Next.js configuration
├── tailwind.config.*           Tailwind CSS configuration
└── tsconfig.json               TypeScript configuration
```

---

## User Flows

### Regular User Flow

```
1. Land on app (/)
        │
        ▼
2. Login Screen
   - Click "Sign in with Google"
   - Desktop: signInWithPopup
   - Mobile (width < 768px): signInWithRedirect → getRedirectResult on mount
        │
        ▼
3. Google OAuth completes
   - User doc created/merged in Firestore: users/{uid}
     { uid, name, email, lastLogin }
        │
        ▼
4. Step 1 — Profile & Timeline
   - Name (auto-filled, editable)
   - Email (auto-filled, read-only for Google users)
   - Gender, HP No, Date of Birth (calendar picker)
   - Occupation (+ Student Level sub-dropdown if student)
   - Live display: current age + years until pension (55)
   - Required field validation before proceeding
        │
        ▼
5. Step 2 — Monthly Income
   - Enter gross monthly income (MYR)
   - Displays 50/30/20 target split
        │
        ▼
6. Step 3 — Needs (50% target)
   - PTPTN, Housing, Car, Personal Loan, Others
   - Live total vs target comparison
        │
        ▼
7. Step 4 — Wants (30% target)
   - Dining, Entertainment, Travel, Shopping, Hobbies
   - Free-text notes field
   - Custom line items (name + amount)
        │
        ▼
8. Step 5 — Savings (20% target)
   - Allocate across: KWSP, Gold, Mutual Funds, ASB, Tabung Haji
   - Live compound interest projections per vehicle
   - Total projected pension fund displayed
        │
        ▼
9. Complete Survey
   - SweetAlert2 confirmation dialog
   - Survey document written to Firestore: surveys/{autoId}
   - Success modal displayed
        │
        ▼
10. Start Over (optional)
    - SweetAlert2 confirmation
    - Form resets to initial state
    - Returns to Step 1
```

### Admin Flow

```
1. Navigate to /admin
        │
        ▼
2. Admin Login
   - Email: admin@financialplanner.com
   - Password: [secure password set in Firebase Console]
   - signInWithEmailAndPassword
   - Validates user.email === "admin@financialplanner.com"
   - SweetAlert2 welcome / error alerts
        │
        ▼
3. Admin Dashboard loads
   - GSAP page-load animation
   - Fetches all documents from Firestore surveys collection
        │
        ├── Overview Tab
        │   - Analytics cards (total surveys, avg income, avg savings, etc.)
        │   - Recharts visualizations
        │
        ├── Survey Responses Tab
        │   - Paginated table (GSAP row animations)
        │   - Search / filter
        │   - View individual survey (detail modal)
        │   - Export row as CSV (SweetAlert2 confirm)
        │
        └── Export All (XLSX)
            - SweetAlert2 confirm with loading state
            - Fetches all Firestore surveys
            - Generates .xlsx file via SheetJS
            - Downloads to browser
        │
        ▼
4. Logout
   - SweetAlert2 confirmation
   - Firebase signOut()
   - Returns to admin login screen
```

---

## Firebase Data Model

### Collection: `users`

Document ID: `{uid}` (Firebase Auth UID)

```json
{
  "uid": "string",
  "name": "string",
  "email": "string",
  "lastLogin": "Timestamp"
}
```

### Collection: `surveys`

Document ID: auto-generated

```json
{
  "userId": "string",
  "submittedAt": "Timestamp",

  "profile": {
    "name": "string",
    "email": "string",
    "gender": "string",
    "hpNo": "string",
    "dateOfBirth": "Timestamp | null",
    "occupation": "string",
    "studentLevel": "string"
  },

  "monthlyIncome": "number",

  "needs": {
    "ptptn": "number",
    "housing": "number",
    "car": "number",
    "personal": "number",
    "others": "number"
  },

  "wants": {
    "dining": "number",
    "entertainment": "number",
    "travel": "number",
    "shopping": "number",
    "hobbies": "number",
    "notes": "string",
    "customItems": [{ "name": "string", "amount": "number" }]
  },

  "savings": {
    "kwsp": "number",
    "gold": "number",
    "mutualFunds": "number",
    "asb": "number",
    "tabungHaji": "number"
  },

  "savingsAllocations": { ... },
  "projectedPensionTotal": "number"
}
```

---

## Authentication Model

| Role | Method | Condition |
|---|---|---|
| Regular User | Google OAuth | Any Google account |
| Admin | Email / Password | `email === "admin@financialplanner.com"` |

### Mobile vs Desktop Auth

```typescript
// login-screen.tsx
const isMobile = window.innerWidth < 768

if (isMobile) {
  await signInWithRedirect(auth, googleProvider)
  // Result handled in useEffect via getRedirectResult()
} else {
  await signInWithPopup(auth, googleProvider)
}
```

### Firestore Security Rules Summary

```
/users/{userId}
  read:  owner OR admin
  write: owner only

/surveys/{surveyId}
  create: any signed-in user
  read:   admin only
  update/delete: NEVER
```

---

## Savings Engine

Located in `components/financial-planner/step-savings.tsx`.

### Investment Vehicles & Annual Returns

| Vehicle | Return Rate |
|---|---|
| KWSP (EPF) | 6% p.a. |
| Gold | 10% p.a. |
| Mutual Funds | 8% p.a. |
| ASB | 6% p.a. |
| Tabung Haji | 5% p.a. |

### Projection Formula

Uses the **Future Value of an Annuity** formula:

$$FV = P \times \frac{(1 + r)^n - 1}{r}$$

Where:
- $P$ = monthly contribution (MYR)
- $r$ = monthly interest rate ($\text{annual rate} \div 12$)
- $n$ = total months until pension age (55)

Age is derived from the user's date of birth. `CURRENT_YEAR = 2026`.

---

## Admin Dashboard

### Analytics Cards

Calculated in real-time from Firestore survey data:

- Total survey submissions
- Average monthly income
- Average savings rate
- Most common occupation
- Age distribution

### Features

- **GSAP Animations**: Page-load fade-in, table row staggered entrance
- **Recharts**: Bar/pie charts for income and savings distribution
- **Pagination**: Client-side with configurable page size
- **Row Export**: Per-survey CSV download
- **Bulk Export**: Full dataset as `.xlsx` via SheetJS

---

## Environment Variables

Create a `.env.local` file at the project root. **Never commit this file.**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

All values are found in the Firebase Console under **Project Settings → Your Apps → SDK setup and configuration**.

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# 1. Clone or download the project
cd FinancialPlanner

# 2. Install dependencies
npm install

# 3. Create environment variables
# Copy the .env.local template above and fill in your Firebase keys

# 4. Start the development server
npm run dev
```

App runs at `http://localhost:3000`  
Admin portal at `http://localhost:3000/admin`

### Firebase Console Setup Required

1. **Authentication → Sign-in method**
   - Enable **Google** provider
   - Enable **Email/Password** provider

2. **Firestore Database**
   - Create database in production mode
   - Deploy rules: `firebase deploy --only firestore:rules`

3. **Create admin account**
   - In Firebase Console → Authentication → Users → Add user
   - Email: `admin@financialplanner.com`
   - Set a secure password

---

## Deployment

This project uses **Firebase Hosting with the webframeworks experiment** for SSR support.

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Enable webframeworks (required for Next.js SSR)
firebase experiments:enable webframeworks

# 4. Initialize (already done — firebase.json and .firebaserc exist)
# firebase init hosting  ← skip if files already exist

# 5. Deploy everything
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting

# Or deploy only Firestore rules
firebase deploy --only firestore:rules
```

### Firebase Project

- **Project ID**: `financial-planner-fb427`
- **Hosting URL**: `https://financial-planner-fb427.web.app`

---

## Libraries Reference

| Library | Purpose |
|---|---|
| `next` | SSR framework, app router, API routes |
| `react` / `react-dom` | UI rendering |
| `typescript` | Static typing |
| `tailwindcss` | Utility-first CSS |
| `shadcn/ui` | Pre-built accessible component system |
| `@radix-ui/*` | Headless UI primitives (used by shadcn) |
| `firebase` | Client SDK — Auth + Firestore |
| `firebase-admin` | Server SDK — used in scripts (e.g. set admin role) |
| `gsap` | Page load and table animations |
| `sweetalert2` | Confirmation and alert dialogs |
| `react-day-picker` | Calendar component for date of birth |
| `date-fns` | Date formatting and arithmetic |
| `xlsx` (SheetJS) | Generate and download Excel files |
| `recharts` | Chart components for admin analytics |
| `react-hook-form` | Form state management |
| `zod` | Schema validation |
| `@hookform/resolvers` | zod adapter for react-hook-form |
| `lucide-react` | Icon library |
| `clsx` + `tailwind-merge` | Conditional class name utilities |
| `sonner` | Toast notifications |
| `next-themes` | Dark/light mode theming |
| `vaul` | Drawer (bottom sheet) component |
| `cmdk` | Command palette component |
| `embla-carousel-react` | Carousel component |
| `react-resizable-panels` | Resizable panel layouts |
| `input-otp` | OTP input component |
| `animejs` | Installed but replaced by GSAP in production |
| `three` | 3D graphics (installed, available for future use) |
| `@vercel/analytics` | Usage analytics (optional) |

---

## Security Notes

- `.env.local` is gitignored — never commit Firebase keys
- `firestore.rules` enforces server-side access control
- Admin email is validated both client-side (in the React component) and enforced by Firestore rules
- Survey documents are **immutable** — update and delete are disabled in Firestore rules
- `financialplanner.json` (Firebase Admin SDK service account key) is gitignored
- Firebase API keys in `NEXT_PUBLIC_*` variables are safe to expose client-side — security is enforced by Firestore rules and Firebase Auth, not by keeping keys secret

---

## Known Limitations

- Pension projection uses a fixed retirement age of **55** (Malaysian standard)
- Annual return rates are **estimates** and not live market data
- Admin portal supports a single admin account only
- No password reset flow for the admin account (use Firebase Console)
- Mobile redirect auth requires the app to be served over HTTPS in production

---

*Last updated: April 2026*
# Financial Planner

A Next.js financial planning app with Google user sign-in, multi-step survey flow, Firestore persistence, and an admin dashboard with real data export.

## Features
- Google-only user sign-in
- Multi-step financial survey with live calculations
- Firestore persistence for users and surveys
- Admin dashboard with Email/Password auth and XLSX export

## Local Setup
```powershell
npm install
npm run dev
```
Open http://localhost:3000

## Firebase Setup
1) Create a Firebase project
2) Enable Authentication providers:
   - Google (for users)
   - Email/Password (for admin)
3) Enable Firestore (production mode is recommended with rules)
4) Add Firebase config to `.env.local`

## Admin Access
- Admin route: `/admin`
- Create an Auth user in Firebase:
  - Email: admin@financialplanner.com
  - Password: admin123

## Firestore Collections
- `users/{uid}`: user profiles
- `surveys/{surveyId}`: survey responses

## Deployment (Firebase Hosting SSR)
```powershell
firebase login
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

## Notes
- Firestore rules are in `firestore.rules`
- Hosting config is in `firebase.json`
