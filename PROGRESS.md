# Financial Planner - Current Progress (Detailed)

## Overall Progress Summary (0-100)
- **UI/UX:** 90/100
  - User flow UI is polished, mobile-friendly, and fully functional.
  - Admin UI is clean with real data, alerts, and exports.
  - Remaining: minor polish, content tweaks, and final QA.
- **Survey Flow:** 90/100
  - Multi-step survey is wired end-to-end with validation and live calculations.
  - Remaining: extra validation or edge-case handling if needed.
- **Authentication:** 85/100
  - User: Google Auth only.
  - Admin: Firebase Email/Password only.
  - Remaining: optional password reset/admin management UI.
- **Database Integration:** 90/100
  - Surveys and users are saved to Firestore.
  - Admin reads real survey data and exports XLSX.
  - Remaining: optional indexes or analytics expansion.
- **Deployment/Hosting:** 80/100
  - Firebase Hosting (SSR) config created, rules deployed.
  - Hosting deploy enabled via webframeworks experiment.
  - Remaining: custom domain (optional) + final production smoke test.

## User Experience (What Users Can Do Now)
- **Login:** Google-only sign-in. No email/password UI.
- **Profile Step:**
  - Auto-fills name + email from Google.
  - **Email is read-only** if it came from Google.
  - **Name is editable** (user can change it in the form).
  - Fields included: gender, HP number, date of birth (date picker), occupation, student level (if occupation = student).
- **Live Calculations:** Age and Years to Pension update instantly based on DOB.
- **Survey Flow:** Full multi-step survey is usable end-to-end; final step triggers a completion modal.
- **Data Submission:** On “Complete,” the full survey is saved to Firestore.
- **Validation:** Step 1 blocks Next unless all required personal info is filled.
- **Savings Engine:** Monthly allocations drive live projected values (annuity compound interest).

## Admin Experience (What Admins Can Do Now)
- **Admin entry:** `/admin` route.
- **Login:** Firebase Auth Email/Password (no Google). Admin email: `admin@financialplanner.com`.
- **Dashboard data source:** Admin dashboard reads from **real Firestore** (`surveys` collection).
  - If Firestore read fails or no data exists, UI can show empty states.
- **Export:** SweetAlert2 confirmation + real XLSX export from Firestore using `xlsx`.
- **Animations:** GSAP page and table row animations are enabled.

## Auth Model (How Access Works)
- **Client (Survey):**
  - Uses Firebase Auth with Google provider only.
  - On login, writes/merges user profile in `users/{uid}`.
- **Admin:**
  - Uses Firebase Auth Email/Password.
  - Access checked by authenticated email matching `admin@financialplanner.com`.

## Firestore Data Model (What the DB Stores)

### `users/{uid}`
Stored on login (merge):
- `uid`: string
- `name`: string
- `email`: string
- `lastLoginAt`: timestamp
- `role`: string (optional, legacy)

### `surveys/{surveyId}`
Stored on completion:
- `userId`: string
- `name`: string
- `email`: string
- `gender`: string
- `hpNo`: string
- `occupation`: string
- `studentLevel`: string
- `dateOfBirth`: string (ISO)
- `age`: number
- `yearsToPension`: number
- `monthlyIncome`: number
- `needs`: object
- `wants`: object
- `savings`: object
- `savingsAllocations`: object
- `projectedPensionTotal`: number
- `submittedAt`: timestamp

## Firebase Rules (Email-Based Admin)
- Users can read/write only their own `users/{uid}` document.
- Signed-in users can create surveys.
- Only admin email (`admin@financialplanner.com`) can read surveys.
- No updates/deletes on surveys by default.

## Firebase + Hosting Setup
- Files added:
  - `firebase.json` (Hosting SSR + Firestore rules)
  - `.firebaserc`
  - `firestore.rules`
  - `firestore.indexes.json`
- Rules deployed: `firebase deploy --only firestore:rules`.
- Admin Auth user created: `admin@financialplanner.com`.
- Hosting deploy completed: `firebase deploy --only hosting`.

## Notes / Caveats
- Firestore must be **enabled in the Firebase console** (production mode is fine once rules are active).
- Service account key is ignored via `.gitignore`.
- Admin dashboard shows real Firestore data in overview + survey responses.
- Mock dataset timestamps updated to 2026.
- Favicon updated to `/public/form.png` (also used as Apple touch icon).
