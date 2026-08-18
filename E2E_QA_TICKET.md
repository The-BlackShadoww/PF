# Personal Finance — E2E QA Ticket

**Scope:** Personal Finance web application  
**App URL:** `http://localhost:3000`  
**API:** `http://localhost:3001/api/v1`  
**Login URL:** `http://localhost:3000/login`  
**Total execution steps:** 59  
**Test role:** authenticated personal-finance user (the application has no role model)

## Quick reference

```text
APP URL       : http://localhost:3000
LOGIN PAGE    : http://localhost:3000/login
DATABASE       : PostgreSQL database in backend/.env (DATABASE_URL)
API DOCS       : http://localhost:3001/api/docs
SERVER LOGS    : terminal running `npm run start:dev` in backend/

TEST ACCOUNTS
  Primary      : create a unique email through /register
  Secondary    : create a second unique email through /register

RUN EXISTING TESTS FIRST
  Frontend     : cd frontend; npm run typecheck; npm run lint
  Backend      : cd backend; npm run test:e2e
  Expected     : all commands pass
  If any fail  : stop E2E execution and log the failure before proceeding

EXECUTION ORDER
  A Authentication
  B Account configuration and categories
  C Transactions
  D Dashboard
  E Reports
  F Settings and security
  G Budgets and cross-feature checks
```

## Bugs found during code reading — fix or accept before live QA

### BUG-001

```text
BUG ID      : BUG-001
STEP ID     : C-011
SEVERITY    : High
FEATURE     : Transactions
TITLE       : Delete transaction button has no click handler and cannot delete a transaction.
ENVIRONMENT : URL http://localhost:3000/transactions; any browser; authenticated user
STEPS TO REPRODUCE:
  1. Open /transactions with an existing transaction.
  2. Click the trash icon in that transaction's Actions column.
EXPECTED RESULT: The application requests confirmation and removes the transaction after confirmation.
ACTUAL RESULT: The button renders but invokes no action.
EVIDENCE: frontend/src/app/(app)/transactions/page.tsx:276-285
SUSPECTED CODE LOCATION: transactions page and frontend/src/lib/api/transactions.ts
SEVERITY JUSTIFICATION: Users cannot remove incorrectly entered financial records from the UI.
```

### BUG-002

```text
BUG ID      : BUG-002
STEP ID     : F-008
SEVERITY    : High
FEATURE     : Authentication / 2FA
TITLE       : A successful 2FA-required login redirects to a route that does not exist.
ENVIRONMENT : URL http://localhost:3000/login; 2FA-enabled user
STEPS TO REPRODUCE:
  1. Enable 2FA for an account.
  2. Log out and submit that account's correct credentials at /login.
EXPECTED RESULT: A 2FA verification page accepts the TOTP code and completes login.
ACTUAL RESULT: Login pushes the browser to /2fa, but no /2fa page exists.
EVIDENCE: frontend/src/app/(auth)/login/page.tsx:53-57; no frontend/src/app/**/2fa route.
SUSPECTED CODE LOCATION: frontend/src/app/(auth)/login/page.tsx
SEVERITY JUSTIFICATION: Enabling 2FA locks a user out of the application.
```

### BUG-003

```text
BUG ID      : BUG-003
STEP ID     : G-003
SEVERITY    : Medium
FEATURE     : Route protection
TITLE       : /account is an authenticated app route but is omitted from middleware protection.
ENVIRONMENT : URL http://localhost:3000/account; logged-out browser
STEPS TO REPRODUCE:
  1. Clear the refresh_token cookie or use a private browser session.
  2. Navigate directly to /account.
EXPECTED RESULT: Middleware redirects to /login?next=/account before rendering app UI.
ACTUAL RESULT: /account is not matched by the middleware; its client-side API request later fails instead.
EVIDENCE: frontend/src/middleware.ts:3-8 and frontend/src/app/(app)/account/page.tsx
SUSPECTED CODE LOCATION: frontend/src/middleware.ts
SEVERITY JUSTIFICATION: Protected account UI is exposed to anonymous visitors and fails inconsistently.
```

### BUG-004

```text
BUG ID      : BUG-004
STEP ID     : G-001
SEVERITY    : High
FEATURE     : Budgets
TITLE       : /budgets is linked as an implemented feature but renders only a page header.
ENVIRONMENT : URL http://localhost:3000/budgets; authenticated user
STEPS TO REPRODUCE:
  1. Sign in.
  2. Open /budgets from the sidebar.
EXPECTED RESULT: The user can create and view monthly budget limits.
ACTUAL RESULT: The route renders only the “Budgets” header; no budget UI calls the existing API.
EVIDENCE: frontend/src/app/(app)/budgets/page.tsx
SUSPECTED CODE LOCATION: frontend/src/app/(app)/budgets/page.tsx
SEVERITY JUSTIFICATION: A stated core feature is unavailable through the product UI.
```

## A — Authentication (10 steps)

- [ ] **A-001 — Landing-page protection:** At `/`, select **Open app**. Expected: a signed-out visitor is redirected to `/login?next=/dashboard`.
- [ ] **A-002 — Registration fields:** At `/register`, submit blank **Full Name**, **Email**, **Password**, and **Confirm Password**. Expected: field-specific required/format errors display and no account is created.
- [ ] **A-003 — Password confirmation:** Submit a unique valid name/email with mismatched **Password** and **Confirm Password**. Expected: “Passwords must match” displays.
- [ ] **A-004 — Registration success:** Register a unique user with a password of at least eight characters. Expected: redirect to `/login?registered=true` and “Registered successfully. Please log in.” is shown.
- [ ] **A-005 — Duplicate registration:** Register the same email again. Expected: “An account with this email already exists.” displays.
- [ ] **A-006 — Invalid login:** At `/login`, submit a valid-format email with an incorrect password. Expected: “Invalid credentials” displays and dashboard is not reached.
- [ ] **A-007 — Credential login:** Submit the new account’s correct **Email** and **Password**. Expected: redirect to `/dashboard` and the refresh-token cookie is set.
- [ ] **A-008 — Auth-route redirect:** While signed in, open `/login` and `/register`. Expected: each redirects to `/dashboard`.
- [ ] **A-009 — Logout:** Use the sidebar **Log out** control. Expected: session ends and a protected route redirects to login.
- [ ] **A-010 — Protected-route gate:** While logged out, directly open `/dashboard`, `/transactions`, `/budgets`, `/reports`, and `/settings`. Expected: each redirects to `/login` with its route in `next`.

## B — Account configuration and categories (12 steps)

- [ ] **B-001 — Account tab:** Sign in, open `/settings`, and select **Account**. Expected: **Account configuration** exposes **Initial balance ($)** and **Low-balance threshold ($)**.
- [ ] **B-002 — Save account configuration:** Set initial balance to `1000` and threshold to `100`, then select **Save configuration**. Expected: save succeeds and the values persist after refresh.
- [ ] **B-003 — Initial-balance boundary:** Attempt a negative initial balance. Expected: the form or API rejects it; no negative configuration is stored.
- [ ] **B-004 — Create savings sector:** Select **New sector**, enter name `Emergency`, percentage `25`, optional goal `5000`, choose a color/icon, and select **Save sector**. Expected: the sector appears and allocated total becomes 25%.
- [ ] **B-005 — Sector percentage cap:** Attempt sectors whose aggregate allocation exceeds 99%. Expected: creation is blocked or rejected, leaving cash allocation non-negative.
- [ ] **B-006 — Edit sector:** Edit **Emergency** to 30%. Expected: its displayed percentage updates and survives refresh.
- [ ] **B-007 — Delete sector:** Delete **Emergency**. Expected: it disappears and allocation returns to cash.
- [ ] **B-008 — Categories tab:** Select **Categories** under Settings. Expected: separate **Income** and **Expenses** category groups render.
- [ ] **B-009 — Create category:** Add a non-default expense category named `QA Groceries`, using a selected icon and color. Expected: it appears in Expenses and persists after refresh.
- [ ] **B-010 — Edit category:** Edit `QA Groceries` name/color/icon. Expected: changed values render after saving.
- [ ] **B-011 — Delete custom category:** Delete the custom category. Expected: it is removed from the list.
- [ ] **B-012 — Default category protection:** Attempt to delete a seeded default category. Expected: deletion is unavailable or rejected with no data change.

## C — Transactions (13 steps)

- [ ] **C-001 — Open transaction form:** At `/transactions`, select **Add Transaction**. Expected: the **Add Transaction** modal opens.
- [ ] **C-002 — Required fields:** Submit the empty modal. Expected: validation identifies missing type, category, amount, physical date, and billing period.
- [ ] **C-003 — Amount validation:** Enter `0`, a negative value, and a value with more than two decimals. Expected: invalid amounts cannot be saved.
- [ ] **C-004 — Expense creation:** Create an expense using a valid expense category, amount `25.50`, physical date today, billing month/year current month/year, and note `QA expense`. Expected: modal closes and the ledger shows a `- $25.50` expense.
- [ ] **C-005 — Income creation:** Create income using an income category, amount `100.00`, current physical/billing dates, note `QA income`. Expected: ledger shows `+ $100.00` income.
- [ ] **C-006 — Category/type mismatch:** Use dev tools or the API documentation to send an income type with an expense-category ID. Expected: API rejects it with “Transaction type must match category type”; no transaction is created.
- [ ] **C-007 — Billing-period attribution:** Create a transaction dated today but assigned to the prior billing month. Expected: its **Period** is the prior month while its **Date** is today.
- [ ] **C-008 — Edit transaction:** Select the pencil for `QA expense`, change amount to `30.00`, and save. Expected: one record updates and the modal closes.
- [ ] **C-009 — Date filter:** Apply a physical **Start date** and **End date** containing exactly one QA record. Expected: only that record is listed.
- [ ] **C-010 — Type and period filters:** Filter by **Expense**, then by the current **Show period** and **Year**. Expected: every returned row matches all selected criteria.
- [ ] **C-011 — Delete transaction:** Select the trash icon for a QA transaction. Expected: a confirmation and successful removal. Known code-analysis result: this currently fails as BUG-001.
- [ ] **C-012 — Pagination:** Create or seed more than 10 records, then use **Next** and **Previous**. Expected: page count, controls, and displayed rows change correctly.
- [ ] **C-013 — Empty state:** Use filters that match no records. Expected: **No transactions found** appears with no stale table rows.

## D — Dashboard (7 steps)

- [ ] **D-001 — Monthly totals:** Open `/dashboard` on **Monthly**. Expected: **Total Income**, **Total Expenses**, and **Net Savings** reflect the ledger’s current billing month.
- [ ] **D-002 — Category breakdown:** With at least one expense in the selected month, confirm **Expense Category Breakdown** includes its category and amount.
- [ ] **D-003 — Month navigation:** Select **Previous month**, then **Next month**. Expected: title and all monthly cards/charts reload for the selected billing month.
- [ ] **D-004 — Empty-month state:** Navigate to a month without expenses. Expected: category chart states “No expenses this month”; app does not crash.
- [ ] **D-005 — Six-month chart:** Verify **Monthly Income vs Expense** includes six months ending at the selected month and uses the matching yearly data across year boundaries.
- [ ] **D-006 — Quarterly view:** Select **Quarterly**, exercise prior/next quarter controls, and inspect summary and monthly breakdown. Expected: quarter boundaries and totals are correct.
- [ ] **D-007 — Yearly view:** Select **Yearly**, exercise prior/next year controls. Expected: twelve-month breakdown and annual totals update for the chosen year.

## E — Reports (6 steps)

- [ ] **E-001 — Default report:** At `/reports`, confirm **Configure report** defaults From/To to the current billing month and CSV is selected.
- [ ] **E-002 — Preview:** Choose a period containing QA income and expense. Expected: preview totals, savings, transaction count, and included months agree with dashboard totals.
- [ ] **E-003 — Invalid range:** Choose an end period before its start period. Expected: “End period cannot be before start period.” appears and **Download … Report** is disabled.
- [ ] **E-004 — CSV:** Select **CSV** and **Download CSV Report**. Expected: a `.csv` file downloads with transactions only from the selected inclusive billing period.
- [ ] **E-005 — PDF:** Select **PDF** and download. Expected: a readable `.pdf` report downloads for the selected period.
- [ ] **E-006 — Local history:** Confirm downloads appear in history; use re-download, then **Clear download history**. Expected: history is capped at 10 entries, re-downloads work, and clearing persists after refresh.

## F — Settings, preferences, and security (7 steps)

- [ ] **F-001 — Profile update:** In **Profile**, update full name, a valid public avatar URL, and timezone `Asia/Dhaka`. Expected: success feedback and new values persist after refresh.
- [ ] **F-002 — Avatar validation:** Enter an invalid avatar URL. Expected: form/API rejects it and retains the prior valid avatar.
- [ ] **F-003 — Preferences persistence:** In **Preferences**, change each exposed preference and save. Expected: values remain after refresh.
- [ ] **F-004 — Wrong current password:** In **Security**, submit a wrong **Current Password**. Expected: an error and no password change.
- [ ] **F-005 — New-password validation:** Submit a new password under eight characters and then a confirmation mismatch. Expected: client validation blocks both.
- [ ] **F-006 — Password change:** Change to a distinct valid password. Expected: success message, current session remains active, and a new login accepts the new password.
- [ ] **F-007 — 2FA setup lifecycle:** Enable 2FA by scanning the QR code and confirming a valid six-digit TOTP. Expected: status changes to **Enabled** and remains enabled after refresh.
- [ ] **F-008 — 2FA-required login:** Log out and sign in with the 2FA-enabled account. Expected: a 2FA verification page accepts the TOTP code and completes login. Known code-analysis result: this currently fails as BUG-002; after capturing evidence, use Security to disable 2FA with a valid code.

## G — Budgets and cross-feature flows (3 steps)

- [ ] **G-001 — Budgets UI:** Open `/budgets`. Expected: monthly budget creation/status UI. Known code-analysis result: this is currently unavailable (BUG-004).
- [ ] **G-002 — Cross-feature recalculation:** Create/edit an in-period transaction, then reload Dashboard, Reports preview, and Account summary. Expected: all three reflect the changed financial data.
- [ ] **G-003 — Anonymous account route:** In a fresh logged-out browser, open `/account`. Expected: redirect to login before the page loads. Known code-analysis result: this currently fails (BUG-003).

## Execution rules

On every failure: stop the current flow, capture browser console errors, failed network request/response, backend log lines, and relevant database state; then add a report using the BUG REPORT template supplied with this ticket. Do not create new application code or automated tests during QA.
