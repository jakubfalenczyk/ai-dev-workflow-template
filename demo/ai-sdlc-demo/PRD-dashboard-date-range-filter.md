# PRD: Dashboard Date Range Filter with Period-over-Period Comparison

**Product:** Meridian Commercial Bank — Enterprise Banking Platform
**Feature Area:** Dashboard Intelligence
**Status:** Draft
**Date:** 2026-03-24
**Author:** Product Team

---

## 1. Problem Statement

The Meridian dashboard currently displays all-time aggregated KPIs (Total Clients, Financial Products, Total Transactions, Total Revenue) and trend badges (+12%, +15%, +8%, +3) that are **hardcoded placeholders** — they do not reflect actual data from any real time window. Charts (Transaction Volume area chart, Monthly Revenue bar chart) show rolling monthly data with no way to zoom into specific periods.

Bank managers, relationship managers, and executives cannot answer basic operational questions from the dashboard today:

- "How did revenue perform in Q1 vs Q4 last year?"
- "Are transaction volumes up or down this month compared to last month?"
- "Which products drove the most revenue in the past 30 days?"
- "How many clients were onboarded this quarter?"

Without a date range control, every number on the dashboard is context-free. The pending/declined transaction counts and the revenue figures mean nothing without knowing the time window they represent.

---

## 2. Goals

| Goal | Metric | Target |
|------|--------|--------|
| Make trend indicators data-driven | % of trend badges showing real calculations | 100% |
| Reduce time-to-insight for managers | Time to filter dashboard to a specific period | < 5 seconds |
| Enable period comparison | All KPI cards show delta vs comparison period | All 4 KPI cards |
| Drive chart interactivity | Charts respond to selected date range | All 3 charts |

---

## 3. Non-Goals

- Real-time streaming data (the existing 30-second polling is sufficient)
- Per-widget date ranges (one global range applies to all widgets)
- Saved/named date range presets per user (future scope)
- Export to CSV/PDF (future scope)
- Mobile-optimized date picker (desktop-first for v1)

---

## 4. User Stories

### Primary: Dashboard Date Range Control

**US-01** — As a **bank manager**, I want to select a date range from a preset list (This Month, Last Month, This Quarter, Last Quarter, This Year, Last 12 Months, Custom) so that all dashboard metrics reflect only transactions within that window.

**US-02** — As a **relationship manager**, I want to see each KPI card display a percentage change vs the equivalent previous period (e.g., "This Month" compares against "Last Month") so I can understand whether we are trending up or down.

**US-03** — As a **bank executive**, I want the charts (Transaction Volume, Monthly Revenue) to zoom to show only data within the selected date range so I can inspect specific periods without all-time noise.

**US-04** — As any user, I want my selected date range to persist across browser refreshes (stored in localStorage) so I don't have to re-select it every time I visit the dashboard.

**US-05** — As any user, I want a "Custom" option that opens a calendar date-picker so I can inspect arbitrary date windows (e.g., a specific audit period or campaign).

---

## 5. Functional Requirements

### 5.1 Date Range Selector Component

- Placed in the Dashboard page header, right side, replacing the static "Last updated" timestamp
- Displays the currently active range label (e.g., "This Month")
- Dropdown with the following presets:

| Label | Window | Comparison Period |
|-------|--------|-------------------|
| Today | Current calendar day | Yesterday |
| Last 7 Days | Rolling 7 days | Previous 7 days |
| This Month | MTD from 1st | Same month last year OR last month |
| Last Month | Full previous month | Month before that |
| This Quarter | QTD from quarter start | Last quarter |
| Last Quarter | Full previous quarter | Quarter before that |
| This Year | YTD from Jan 1 | Last year same YTD |
| Last 12 Months | Rolling 12 months | Prior 12 months |
| Custom | User-defined start/end | User-defined comparison (optional) |

- Default range on first load: **This Month**
- Selected range persists in `localStorage` key `meridian_dashboard_range`

### 5.2 KPI Cards — Trend Indicators

All four stat cards (Total Clients, Financial Products, Total Transactions, Total Revenue) must:

- Replace the hardcoded trend badge with a **calculated delta** from real data
- Show: `▲ +12.4%` (green) or `▼ -3.1%` (red) vs comparison period
- Show an absolute delta below the percentage: e.g., `+3 new clients`
- Show a tooltip on hover explaining the comparison: "vs Last Month (Feb 2026)"

### 5.3 Charts

**Transaction Volume (Area Chart):**
- X-axis granularity adapts to range:
  - ≤ 14 days → daily
  - 15–90 days → weekly
  - > 90 days → monthly
- Overlay a second translucent line for the comparison period (dashed)
- Legend shows "Selected Period" and "Comparison Period"

**Monthly Revenue (Bar Chart):**
- Renders bars for each unit of granularity within the range
- Comparison period bars shown in a lighter shade behind selected-period bars (grouped or overlaid)

**Transaction Status (Pie Chart):**
- Filters to only transactions within the selected date range
- Updates percentage labels dynamically

### 5.4 Supporting Panels

**Top Financial Products:**
- Ranked by `totalRevenue` within the selected date range
- Each row shows revenue for the selected period + delta vs comparison

**Top Clients:**
- Ranked by `totalSpent` within the selected date range
- Same delta treatment

**Recent Transactions Table:**
- Continues to show the most recent N transactions regardless of range (operational view)
- Table header shows the active range as context: "Showing transactions: Mar 1 – Mar 24, 2026"

---

## 6. API Changes

### 6.1 Dashboard Stats Endpoint

**Current:** `GET /api/dashboard/stats` — returns all-time aggregates

**New:** `GET /api/dashboard/stats?from=2026-03-01&to=2026-03-24&compareFrom=2026-02-01&compareTo=2026-02-28`

**Response additions:**

```typescript
interface DashboardStats {
  // existing fields
  totalClients: number;
  activeClients: number;
  totalProducts: number;
  totalTransactions: number;
  pendingTransactions: number;
  totalRevenue: number;
  monthlyRevenue: number;

  // new fields
  period: {
    from: string;   // ISO date
    to: string;     // ISO date
  };
  comparison: {
    from: string;
    to: string;
    totalClients: number;
    totalTransactions: number;
    totalRevenue: number;
  };
  trends: {
    clients: number;       // percentage delta
    transactions: number;  // percentage delta
    revenue: number;       // percentage delta
    clientsAbsolute: number;
    transactionsAbsolute: number;
    revenueAbsolute: number;
  };
}
```

### 6.2 Monthly Data Endpoint

**Current:** `GET /api/dashboard/monthly` — fixed 12-month rolling window

**New:** `GET /api/dashboard/monthly?from=2026-01-01&to=2026-03-24&granularity=weekly`

- `granularity`: `daily | weekly | monthly` (auto-computed by server if not provided based on range width)
- Returns comparison period series alongside selected period series

### 6.3 Top Products & Top Clients Endpoints

Both accept `from` and `to` query params to scope results.

---

## 7. UI Mockup Description

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard                                    [This Month ▼] [📅]   │
│  Welcome back. Here's your business overview.  Mar 1 – Mar 24, 2026 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Clients│ │  Financial   │ │    Total     │ │   Revenue    │
│     24       │ │  Products    │ │ Transactions │ │   $2.1M      │
│  20 active   │ │     23       │ │     18       │ │ $340K/month  │
│  ▲ +2 (+9%) │ │  Active off. │ │  3 processing│ │ ▲ +15.2%    │
│  vs Feb 2026 │ │  — flat      │ │  ▼ -8.3%    │ │ vs Feb 2026  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

The date range dropdown opens inline below the selector with preset buttons and a "Custom range" option that reveals a dual calendar picker.

---

## 8. Technical Architecture

### Client

- New `useDateRange` hook (Zustand store) — holds `{ from, to, compareFrom, compareTo, label }`, persists to localStorage
- `DateRangePicker` component — dropdown trigger + preset list + optional dual calendar
- All `useQuery` calls in `dashboard.api.ts` accept `DateRange` params and include them in cache keys: `['dashboard', 'stats', from, to]`
- Chart components updated to accept `comparisonSeries` prop

### Server

- `dashboard.service.ts` — all queries accept optional `from` / `to` / `compareFrom` / `compareTo` date parameters
- Prisma `where` clauses wrap order dates: `orderDate: { gte: new Date(from), lte: new Date(to) }`
- Comparison stats computed in a second parallel Prisma call, delta calculations done in service layer
- `granularity` helper computes `daily/weekly/monthly` from range width

---

## 9. Acceptance Criteria

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| AC-01 | User opens Dashboard for first time | "This Month" range is selected; all KPIs reflect current month data |
| AC-02 | User selects "Last Quarter" | All 4 KPI cards, both charts, all tables update to Q4 2025 data |
| AC-03 | KPI card trend badge | Shows real % vs comparison period, green/red, with tooltip |
| AC-04 | User selects Custom range with invalid end < start | Error state shown inline; query not fired |
| AC-05 | User refreshes browser | Previously selected range is restored from localStorage |
| AC-06 | Date range with no data | All KPIs show 0, charts show empty state with "No data for selected period" |
| AC-07 | Transaction Volume chart | Adapts granularity: daily for ≤14 days, weekly for 15–90 days, monthly for >90 |
| AC-08 | Charts show comparison overlay | Second translucent/dashed series visible on Transaction Volume chart |
| AC-09 | "Today" preset | Stats show only today's data; comparison shows yesterday |
| AC-10 | API error on range change | Error toast shown; previous data remains visible (stale) |

---

## 10. Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Historical data may be sparse for demo seed data | Charts look empty for certain ranges | Seed at least 12 months of transaction history |
| Date timezone handling (server UTC vs browser local) | Off-by-one day errors at range boundaries | Normalize all dates to UTC on server; send ISO strings with timezone from client |
| Performance: multiple parallel Prisma queries per page load | Latency spike on range change | Add DB indexes on `orderDate`; cache comparison-period results for common presets |
| Products table has no date dimension for comparison | "Financial Products" KPI can't trend | Count products created within date range; note in UI "products added in period" |

---

## 11. Out of Scope (Future)

- Per-user saved custom ranges with names
- Scheduled email reports for a selected range
- Dashboard widget reordering/personalization
- Export filtered data to CSV or PDF
- Alerts when metrics drop below thresholds

---

## 12. Success Metrics (Post-Launch)

- **Dashboard session duration** increases by ≥ 20% (users explore different periods)
- **Date range control interaction rate** ≥ 60% of dashboard sessions within 30 days
- **Hardcoded trend percentage** complaints: 0 (they no longer exist)
- **Time to answer "how did last quarter perform"**: < 10 seconds from dashboard open
