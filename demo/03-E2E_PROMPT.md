# E2E Command Prompt

Use this as input for `/everything-claude-code:e2e` during the demo.

---

## Command

```
/everything-claude-code:e2e
```

## Prompt to Use

```
Generate and run comprehensive E2E tests for the Transaction Status Update feature.

## Application URL

http://localhost:5173

## Feature to Test

Transaction status can be updated from the Transaction History page (/orders):
- PENDING transactions have "Process" and "Decline" buttons
- Clicking "Process" changes status to "Processed" (COMPLETED)
- Clicking "Decline" changes status to "Declined" (CANCELLED)

## Test Scenarios

### 1. Process a Pending Transaction
Steps:
1. Navigate to /orders (Transaction History page)
2. Find a row with "Processing" status badge
3. Click the "Process" button in that row
4. Wait for the mutation to complete

Assertions:
- The status badge should change to "Processed" (green)
- The "Process" and "Decline" buttons should disappear
- Take screenshot of the result

### 2. Decline a Pending Transaction
Steps:
1. Navigate to /orders
2. Find a row with "Processing" status badge
3. Click the "Decline" button in that row
4. Wait for the mutation to complete

Assertions:
- The status badge should change to "Declined" (red)
- The buttons should disappear
- Take screenshot of the result

### 3. Verify No Actions on Completed Orders
Steps:
1. Navigate to /orders
2. Find a row with "Processed" status badge

Assertions:
- No "Process" or "Decline" buttons should be visible
- Only a dash or empty cell in actions column

### 4. Dashboard Stats Update After Status Change
Steps:
1. Navigate to / (Dashboard)
2. Note the "Processing" count in stats
3. Navigate to /orders
4. Process one pending transaction
5. Navigate back to / (Dashboard)

Assertions:
- The "Processing" count should decrease by 1
- The "Processed" count should increase by 1

### 5. Button Loading State
Steps:
1. Navigate to /orders
2. Find a pending transaction
3. Click "Process" button
4. Observe button state during request

Assertions:
- Button should be disabled during mutation
- Other buttons in same row should also be disabled

## Output Requirements

- Save screenshots to screenshots/ folder
- Generate test report
- Show pass/fail status for each test
```

---

## Expected Output

1. Playwright test file created
2. Tests executed against running application
3. Screenshots captured for each scenario
4. Test report with pass/fail status
