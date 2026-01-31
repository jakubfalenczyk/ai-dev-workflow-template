# TDD Command Prompt

Use this as input for `/everything-claude-code:tdd` during the demo.

---

## Command

```
/everything-claude-code:tdd
```

## Prompt to Use

```
Implement the Transaction Status Update feature using TDD.

## Feature Summary

Add ability to update order status via PATCH /api/orders/:id/status endpoint, then add UI buttons to the OrderList component.

## TDD Requirements

### Phase 1: Backend Service (Write Tests First)

Create tests in: server/src/modules/orders/__tests__/order.service.test.ts

Test cases to write FIRST:
1. updateOrderStatus should update status from PENDING to COMPLETED
2. updateOrderStatus should update status from PENDING to CANCELLED
3. updateOrderStatus should throw error for non-existent order (Prisma P2025)
4. updateOrderStatus should return the updated order with customer and items relations

Then implement: server/src/modules/orders/order.service.ts
- Add updateOrderStatus(id: string, status: string) function

### Phase 2: Backend API

Add to order.schema.ts:
- updateOrderStatusSchema with Zod validation
- params.id must be valid UUID
- body.status must be enum: PENDING, COMPLETED, CANCELLED

Add to order.controller.ts:
- updateOrderStatus handler
- Handle Prisma P2025 error as 404
- Return updated order on success

Add to order.routes.ts:
- PATCH /:id/status route with validation middleware

### Phase 3: Frontend

Add to orders.api.ts:
- updateOrderStatus(id, { status }) function

Add to OrderList.tsx:
- useMutation for status updates
- Invalidate ['orders'] and ['dashboard'] queries on success
- Add "Process" button (sets COMPLETED) for PENDING rows
- Add "Decline" button (sets CANCELLED) for PENDING rows
- Disable buttons while mutation is pending
- No buttons for non-PENDING orders

## Run Tests After Each Step

Backend: npm test (or npx jest)
Frontend: Verify in browser at http://localhost:5173/orders
```

---

## Expected Workflow

1. **Write test** → Run (RED - fails)
2. **Implement code** → Run (GREEN - passes)
3. **Refactor if needed** → Run (still GREEN)
4. Repeat for each component
