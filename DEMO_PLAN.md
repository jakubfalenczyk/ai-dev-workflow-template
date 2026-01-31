# Demo Plan: AI-Assisted Development Workflow

This document outlines a live demo showcasing AI-assisted development using Claude Code commands.

## Demo Overview

**Audience:** Bank executives
**Duration:** ~20 minutes
**Application:** Meridian Commercial Bank (demo banking app)

### Commands to Showcase

| Command | Purpose |
|---------|---------|
| `/everything-claude-code:plan` | Create detailed implementation plan |
| `/everything-claude-code:tdd` | Test-driven development workflow |
| `/everything-claude-code:e2e` | End-to-end testing with Playwright |

---

## Feature: Transaction Status Update

Allow bank operators to **Process** or **Decline** pending transactions directly from the Transaction History page.

### Why This Feature?

| Criteria | Score | Reason |
|----------|-------|--------|
| Speed to implement | 5/5 | ~20 min, no schema changes |
| Planning showcase | 5/5 | Clear phases, validation rules, error handling |
| TDD-friendly | 5/5 | Service function, API endpoint, edge cases |
| E2E-friendly | 5/5 | Visible UI buttons, status changes |
| Business value | 5/5 | Real banking workflow: approve/decline transactions |

### User Flow

1. User sees pending transactions with **"Process"** and **"Decline"** buttons
2. Clicks "Process" → Status changes to "Processed" (green badge)
3. Clicks "Decline" → Status changes to "Declined" (red badge)
4. Dashboard stats update automatically

---

## Demo Script

### Phase 1: Planning (2 min)

**Command:** `/everything-claude-code:plan`

Show the AI creating a detailed implementation plan:
- Backend/frontend separation
- Validation rules (valid status values)
- Error scenarios (order not found, invalid status)
- Test cases identification

### Phase 2: TDD - Backend (8 min)

**Command:** `/everything-claude-code:tdd`

#### Step 2.1: Write Tests FIRST
```typescript
// server/src/modules/orders/__tests__/order.service.test.ts
describe('updateOrderStatus', () => {
    it('should update status from PENDING to COMPLETED');
    it('should update status from PENDING to CANCELLED');
    it('should throw error for non-existent order');
    it('should return the updated order with relations');
});
```

#### Step 2.2: Run Tests (FAIL)
```bash
npm test -- order.service.test.ts
# Expected: Tests fail (function doesn't exist)
```

#### Step 2.3: Implement Service Function
```typescript
// server/src/modules/orders/order.service.ts
export const updateOrderStatus = async (id: string, status: string) => {
    return prisma.order.update({
        where: { id },
        data: { status },
        include: {
            customer: true,
            items: { include: { product: true } },
        },
    });
};
```

#### Step 2.4: Run Tests (PASS)
```bash
npm test -- order.service.test.ts
# Expected: All tests pass
```

#### Step 2.5: Add API Layer
```typescript
// order.schema.ts - Zod validation
export const updateOrderStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']),
    }),
});

// order.controller.ts - Handler
export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
        res.json(order);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Order not found' });
        }
        next(error);
    }
};

// order.routes.ts - Route
router.patch('/:id/status', validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);
```

### Phase 3: Frontend Implementation (5 min)

#### Step 3.1: Add API Function
```typescript
// client/src/modules/orders/orders.api.ts
export const updateOrderStatus = async (id: string, data: { status: string }) => {
    const response = await apiClient.patch(`/orders/${id}/status`, data);
    return response.data;
};
```

#### Step 3.2: Add UI with Mutation
```tsx
// client/src/modules/orders/OrderList.tsx
const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, { status }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
});

// In table row for PENDING orders:
<button onClick={() => statusMutation.mutate({ id: order.id, status: 'COMPLETED' })}>
    Process
</button>
<button onClick={() => statusMutation.mutate({ id: order.id, status: 'CANCELLED' })}>
    Decline
</button>
```

### Phase 4: E2E Testing (5 min)

**Command:** `/everything-claude-code:e2e`

#### Step 4.1: Generate Playwright Tests
```typescript
// tests/e2e/transaction-status.spec.ts
test('can process pending transaction', async ({ page }) => {
    await page.goto('/orders');

    // Find a pending transaction
    const pendingRow = page.locator('tr').filter({ hasText: 'Processing' }).first();

    // Click Process button
    await pendingRow.locator('button', { hasText: 'Process' }).click();

    // Verify status changed
    await expect(pendingRow.locator('text=Processed')).toBeVisible();
});

test('can decline pending transaction', async ({ page }) => {
    await page.goto('/orders');

    const pendingRow = page.locator('tr').filter({ hasText: 'Processing' }).first();
    await pendingRow.locator('button', { hasText: 'Decline' }).click();

    await expect(pendingRow.locator('text=Declined')).toBeVisible();
});
```

#### Step 4.2: Run Tests
```bash
npx playwright test transaction-status.spec.ts
```

#### Step 4.3: Show Results
- Screenshots captured
- All tests passing
- HTML report generated

---

## Files to Create/Modify

### Backend (Server)

| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/orders/__tests__/order.service.test.ts` | CREATE | Unit tests for service |
| `server/src/modules/orders/order.service.ts` | MODIFY | Add `updateOrderStatus` |
| `server/src/modules/orders/order.schema.ts` | MODIFY | Add validation schema |
| `server/src/modules/orders/order.controller.ts` | MODIFY | Add handler |
| `server/src/modules/orders/order.routes.ts` | MODIFY | Add PATCH route |

### Frontend (Client)

| File | Action | Description |
|------|--------|-------------|
| `client/src/modules/orders/orders.types.ts` | MODIFY | Add input type |
| `client/src/modules/orders/orders.api.ts` | MODIFY | Add API function |
| `client/src/modules/orders/OrderList.tsx` | MODIFY | Add mutation + buttons |

### Tests

| File | Action | Description |
|------|--------|-------------|
| `tests/e2e/transaction-status.spec.ts` | CREATE | Playwright E2E tests |

---

## Test Cases

### Unit Tests (TDD)

| Test | Input | Expected |
|------|-------|----------|
| Update PENDING → COMPLETED | `(validId, 'COMPLETED')` | Order with status='COMPLETED' |
| Update PENDING → CANCELLED | `(validId, 'CANCELLED')` | Order with status='CANCELLED' |
| Non-existent order | `(invalidId, 'COMPLETED')` | Throws P2025 error |
| Invalid status value | `(validId, 'INVALID')` | Validation error |

### E2E Tests

| Test | Steps | Assertion |
|------|-------|-----------|
| Process transaction | Click "Process" on pending row | Status shows "Processed" |
| Decline transaction | Click "Decline" on pending row | Status shows "Declined" |
| No buttons on completed | View completed transaction row | No action buttons visible |
| Dashboard updates | Process transaction, go to dashboard | Stats reflect change |

---

## Success Criteria

- [ ] `PATCH /api/orders/:id/status` endpoint works
- [ ] Invalid status values return 400 error
- [ ] Non-existent orders return 404 error
- [ ] UI shows buttons only for PENDING orders
- [ ] "Process" changes status to COMPLETED
- [ ] "Decline" changes status to CANCELLED
- [ ] Dashboard stats update after change
- [ ] All unit tests pass
- [ ] All E2E tests pass

---

## Pre-Demo Checklist

- [ ] Both servers running (`npm run dev` in client and server)
- [ ] Database seeded with mix of PENDING/COMPLETED/CANCELLED orders
- [ ] Playwright installed (`npx playwright install`)
- [ ] Terminal split for running tests
- [ ] Browser open to http://localhost:5173

---

## Talking Points for Executives

1. **AI-Assisted Planning** - "The AI helps break down features into clear, implementable steps"

2. **Test-Driven Development** - "We write tests first to define expected behavior, then implement to pass those tests"

3. **Quality Assurance** - "Automated E2E tests verify the feature works from user perspective"

4. **Speed & Confidence** - "This workflow enables faster development with higher confidence in code quality"

5. **Real Banking Workflow** - "This transaction approval feature mirrors real banking operations"
