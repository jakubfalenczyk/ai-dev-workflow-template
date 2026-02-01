# Plan Command Prompt

Use this as input for `/everything-claude-code:plan` during the demo.

---

## Command

```
/everything-claude-code:plan
```

## Prompt to Use

```
Add a Transaction Status Update feature to the Meridian Commercial Bank application.

## Feature Requirements

Allow bank operators to Process or Decline pending transactions directly from the Transaction History page (/orders).

### User Story
As a bank operator, I want to update the status of pending transactions so that I can approve or reject them without leaving the transaction list.

### Acceptance Criteria

1. PENDING transactions should show "Process" and "Decline" action buttons
2. Clicking "Process" changes status to COMPLETED (displayed as "Processed")
3. Clicking "Decline" changes status to CANCELLED (displayed as "Declined")
4. Already processed/declined transactions should NOT show action buttons
5. Dashboard stats should update after status change
6. Buttons should be disabled while the request is in progress
7. System displays a toast message with the result of the operation.

### Technical Requirements

**Backend:**
- Add PATCH /api/orders/:id/status endpoint
- Validate status is one of: PENDING, COMPLETED, CANCELLED
- Return 404 if order not found
- Return 400 if invalid status value

**Frontend:**
- Add mutation for status update
- Invalidate orders and dashboard queries on success
- Show loading state on buttons during mutation

### Constraints
- No database schema changes required
- Use existing order.service.ts patterns
- Follow existing code conventions
```

---

## Expected Output

The planner should create a detailed implementation plan with:
- Backend phases (service, schema, controller, routes)
- Frontend phases (API, types, UI component)
- Test cases for TDD
- E2E scenarios
- Risk assessment
