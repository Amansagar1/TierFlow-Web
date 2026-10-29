# TierFlow - Business Rules & Architecture Document

This document outlines the business assumptions, mathematical calculations, database idempotency safeguards, and scheduling mechanics implemented in **TierFlow**.

---

## 1. Investment Plans Configuration

The investment plans are configured centrally in `backend/src/constants/businessRules.js`:

| Plan ID | Plan Name | Duration | Daily ROI (%) | Min Investment (₹) | Tag / Badge |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `growth-a` | Growth Plan A | 90 Days | 1.0% | ₹ 1,000 | Best for beginners |
| `growth-b` | Growth Plan B | 120 Days | 1.5% | ₹ 5,000 | Most Popular |
| `wealth` | Wealth Plan | 180 Days | 2.0% | ₹ 10,000 | Higher returns |
| `premium` | Premium Plan | 365 Days | 2.5% | ₹ 25,000 | Long-term growth |

---

## 2. Daily ROI Calculation Formula & Idempotency Safeguards

### Calculation Logic
For every active investment (`investmentStatus: 'Active'`):
```text
Daily ROI = (Principal Investment Amount × Daily ROI Percentage) / 100
```
- Rounded to two decimal places.
- Validated to ensure the current calculation date is between `startDate` and `endDate`.
- When an investment reaches its `endDate`, its status is updated to `Completed`.

### Database Idempotency Safeguard
To guarantee that accidentally running the scheduler multiple times on the same date **NEVER** duplicates credits or corrupts wallet balances:
1. Every ROI calculation assigns an `earningDateStr` string formatted as `YYYY-MM-DD` (e.g. `2024-10-30`).
2. The `ROIHistory` Mongoose collection enforces a strict **unique compound index**:
   ```javascript
   roiHistorySchema.index({ investment: 1, earningDateStr: 1 }, { unique: true });
   ```
3. Before processing, the service queries whether a record exists for `{ investment, earningDateStr }`. If so, it is safely skipped.
4. If two concurrent workers attempt an insertion simultaneously, MongoDB rejects the duplicate with error code `11000`, preventing double crediting.

---

## 3. Multi-Level Referral Commission Structure

Commissions are paid across a 3-level upline hierarchy whenever an investment is created:

- **Level 1 (Direct Sponsor)**: **5.0%** of investment amount (`Direct Income`)
- **Level 2 (Grandparent Sponsor)**: **3.0%** of investment amount (`Level Income`)
- **Level 3 (Great-Grandparent Sponsor)**: **2.0%** of investment amount (`Level Income`)

### Commission Idempotency
`ReferralIncome` maintains a unique compound index:
```javascript
referralIncomeSchema.index(
  { user: 1, fromUser: 1, investment: 1, referralLevel: 1 },
  { unique: true }
);
```
This guarantees that each upline recipient is paid exactly once per level for any single investment.

---

## 4. Automated Daily ROI Scheduler (node-cron)

- **Schedule**: Daily at 12:00 AM (`0 0 * * *`)
- **Timezone**: Configured via `ROI_TIMEZONE` (defaults to `Asia/Kolkata` / GMT+5:30)
- **Overlap Protection**: An in-memory execution guard (`isJobRunning`) prevents a new execution from starting if the previous cycle is still ongoing.
- **Fail-safe**: Unhandled errors are caught and logged without terminating the Node.js process.
- **Manual Trigger**: Developers and evaluators can manually execute the process via `POST /api/roi-history/process-daily`.
