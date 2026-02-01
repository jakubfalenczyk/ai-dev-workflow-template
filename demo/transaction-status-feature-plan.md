# Implementation Plan: Transaction Status Update Feature

## Requirements Restatement

**Feature**: Allow bank operators to Process or Decline pending transactions directly from the Transaction History page (`/orders`).

**User Story**: As a bank operator, I want to update the status of pending transactions so that I can approve or reject them without leaving the transaction list.

### Acceptance Criteria
1. PENDING transactions show "Process" and "Decline" action buttons
2. Clicking "Process" changes status to COMPLETED (displayed as "Processed")
3. Clicking "Decline" changes status to CANCELLED (displayed as "Declined")
4. Already processed/declined transactions do NOT show action buttons
5. Dashboard stats update after status change
6. Buttons are disabled while request is in progress
7. Toast message displays operation result (success/error)

### Technical Requirements
- **Backend**: PATCH `/api/orders/:id/status` endpoint with validation
- **Frontend**: Mutation with query invalidation and loading states
- **Constraints**: No database schema changes, follow existing patterns

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| No toast library installed | MEDIUM | Add `react-hot-toast` (lightweight, 4KB) |
| Race condition on rapid clicks | LOW | Disable buttons during mutation |
| Dashboard cache staleness | LOW | Invalidate `['dashboard']` query on success |
| Partial update failures | LOW | Use Prisma transaction for atomic updates |

---

## Implementation Phases

### Phase 1: Backend - Schema Validation
**Files**: `server/src/modules/orders/order.schema.ts`

Add Zod schema for status update:
```typescript
export const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']),
    }),
});
```

**Estimated Changes**: ~10 lines

---

### Phase 2: Backend - Service Layer
**Files**: `server/src/modules/orders/order.service.ts`

Add `updateOrderStatus` function following existing patterns:
```typescript
export const updateOrderStatus = async (id: string, status: string) => {
    return prisma.order.update({
        where: { id },
        data: { status },
        include: { customer: true, items: { include: { product: true } } },
    });
};
```

**Estimated Changes**: ~15 lines

---

### Phase 3: Backend - Controller
**Files**: `server/src/modules/orders/order.controller.ts`

Add `updateOrderStatus` handler with error handling:
- Return 404 if order not found
- Return 400 if invalid status
- Return 200 with updated order on success

**Estimated Changes**: ~20 lines

---

### Phase 4: Backend - Routes
**Files**: `server/src/modules/orders/order.routes.ts`

Add PATCH route:
```typescript
router.patch('/:id/status', validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);
```

**Estimated Changes**: ~3 lines

---

### Phase 5: Frontend - Install Toast Library
**Files**: `client/package.json`

Install `react-hot-toast`:
```bash
npm install react-hot-toast
```

Add `<Toaster />` to `App.tsx` root.

**Estimated Changes**: ~5 lines

---

### Phase 6: Frontend - API Function
**Files**: `client/src/modules/orders/orders.api.ts`

Add `updateOrderStatus` function:
```typescript
export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
};
```

**Estimated Changes**: ~5 lines

---

### Phase 7: Frontend - Types
**Files**: `client/src/modules/orders/orders.types.ts`

Add input type:
```typescript
export interface UpdateOrderStatusInput {
    status: Order['status'];
}
```

**Estimated Changes**: ~4 lines

---

### Phase 8: Frontend - UI Component
**Files**: `client/src/modules/orders/OrderList.tsx`

Add to table rows for PENDING orders:
1. Import `useMutation` and `useQueryClient`
2. Create `updateStatusMutation` with:
   - `mutationFn`: `updateOrderStatus`
   - `onSuccess`: Invalidate `['orders']` and `['dashboard']`, show success toast
   - `onError`: Show error toast
3. Add "Process" button (green) and "Decline" button (red) to action column
4. Conditionally render buttons only for `status === 'PENDING'`
5. Disable buttons when `mutation.isPending`

**Button Implementation**:
```tsx
{order.status === 'PENDING' && (
    <div className="flex gap-2">
        <button
            onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'COMPLETED' })}
            disabled={updateStatusMutation.isPending}
            className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50"
        >
            Process
        </button>
        <button
            onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'CANCELLED' })}
            disabled={updateStatusMutation.isPending}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
            Decline
        </button>
    </div>
)}
```

**Estimated Changes**: ~40 lines

---

## Test Cases (TDD)

### Backend Unit Tests
**File**: `server/src/modules/orders/order.service.test.ts`

| Test Case | Expected Result |
|-----------|-----------------|
| Update PENDING to COMPLETED | Returns order with status COMPLETED |
| Update PENDING to CANCELLED | Returns order with status CANCELLED |
| Update non-existent order | Throws Prisma NotFoundError |

### Backend Integration Tests
**File**: `server/src/modules/orders/order.routes.test.ts`

| Test Case | Expected Result |
|-----------|-----------------|
| PATCH /api/orders/:id/status with valid status | 200, updated order |
| PATCH /api/orders/:id/status with invalid status | 400, validation error |
| PATCH /api/orders/:id/status with invalid ID | 404, not found |
| PATCH /api/orders/:id/status missing body | 400, validation error |

### Frontend Unit Tests
**File**: `client/src/modules/orders/OrderList.test.tsx`

| Test Case | Expected Result |
|-----------|-----------------|
| PENDING order shows Process/Decline buttons | Buttons visible |
| COMPLETED order hides action buttons | No buttons rendered |
| CANCELLED order hides action buttons | No buttons rendered |
| Click Process triggers mutation | API called with COMPLETED |
| Click Decline triggers mutation | API called with CANCELLED |
| Buttons disabled during mutation | Buttons have disabled attribute |

---

## E2E Test Scenarios

**File**: `e2e/transaction-status.spec.ts`

### Scenario 1: Process Transaction
1. Navigate to `/orders`
2. Find a PENDING transaction
3. Click "Process" button
4. Verify status changes to "Processed"
5. Verify toast shows success message
6. Navigate to Dashboard
7. Verify stats updated (Processed count increased)

### Scenario 2: Decline Transaction
1. Navigate to `/orders`
2. Find a PENDING transaction
3. Click "Decline" button
4. Verify status changes to "Declined"
5. Verify toast shows success message
6. Navigate to Dashboard
7. Verify stats updated (Declined count increased)

### Scenario 3: Button States
1. Navigate to `/orders`
2. Verify PENDING transactions show action buttons
3. Verify COMPLETED transactions have no action buttons
4. Verify CANCELLED transactions have no action buttons

---

## Implementation Order

```
1. Backend Schema (order.schema.ts)
       ↓
2. Backend Service (order.service.ts)
       ↓
3. Backend Controller (order.controller.ts)
       ↓
4. Backend Routes (order.routes.ts)
       ↓
5. Backend Tests → Verify API works
       ↓
6. Frontend Toast Setup (App.tsx)
       ↓
7. Frontend API + Types (orders.api.ts, orders.types.ts)
       ↓
8. Frontend UI (OrderList.tsx)
       ↓
9. Frontend Tests → Verify UI works
       ↓
10. E2E Tests → Verify full flow
```

---

## Files Changed Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `server/src/modules/orders/order.schema.ts` | Modify | +10 |
| `server/src/modules/orders/order.service.ts` | Modify | +15 |
| `server/src/modules/orders/order.controller.ts` | Modify | +20 |
| `server/src/modules/orders/order.routes.ts` | Modify | +3 |
| `client/package.json` | Modify | +1 |
| `client/src/App.tsx` | Modify | +3 |
| `client/src/modules/orders/orders.api.ts` | Modify | +5 |
| `client/src/modules/orders/orders.types.ts` | Modify | +4 |
| `client/src/modules/orders/OrderList.tsx` | Modify | +40 |

**Total**: 9 files, ~100 lines of code

---

## Definition of Done

- [ ] PATCH `/api/orders/:id/status` endpoint working
- [ ] Validation returns 400 for invalid status values
- [ ] 404 returned for non-existent orders
- [ ] Process button changes status to COMPLETED
- [ ] Decline button changes status to CANCELLED
- [ ] Buttons only appear for PENDING transactions
- [ ] Buttons disabled during API request
- [ ] Toast shows success/error messages
- [ ] Dashboard stats refresh after status change
- [ ] All backend tests passing
- [ ] All frontend tests passing
- [ ] E2E tests passing

---

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
