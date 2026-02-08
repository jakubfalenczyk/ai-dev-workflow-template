# Plan: Transaction Status Update

**Type:** Feature
**Created:** 2026-02-08

## Goal

Allow bank operators to Process or Decline pending transactions directly from the Transaction History page (`/orders`). PENDING transactions display "Process" and "Decline" action buttons; completed/cancelled transactions do not. A toast notification confirms the result.

## Research Findings

### Existing Patterns
- **Order model** already has `status: PENDING | COMPLETED | CANCELLED` — no schema changes needed
- **order.service.ts** (server) has `createOrder`, `getOrders`, `getOrderById` — missing `updateOrderStatus`
- **order.controller.ts** (server) has create/get handlers — missing status update handler
- **order.schema.ts** (server) only has `createOrderSchema` — needs a `updateOrderStatusSchema`
- **order.routes.ts** (server) registers POST `/`, GET `/`, GET `/:id` — needs PATCH `/:id/status`
- **orders.api.ts** (client) has `getOrders`, `getOrderById`, `createOrder` — needs `updateOrderStatus`
- **OrderList.tsx** (client) renders table with status badges but no action buttons
- **Dashboard.tsx** uses `queryKey: ['dashboard']` — must be invalidated on status change
- **No toast/notification system** exists — need to add one (lightweight, e.g. `react-hot-toast`)
- **validateRequest middleware** parses `body`, `query`, `params` from the Zod schema

### Key Files
| File | Current State |
|------|--------------|
| `server/src/modules/orders/order.service.ts` | CRUD minus update |
| `server/src/modules/orders/order.controller.ts` | Handlers minus update |
| `server/src/modules/orders/order.schema.ts` | Only create schema |
| `server/src/modules/orders/order.routes.ts` | POST, GET, GET/:id |
| `client/src/modules/orders/orders.api.ts` | get, getById, create |
| `client/src/modules/orders/orders.types.ts` | Order, CreateOrderInput |
| `client/src/modules/orders/OrderList.tsx` | Table with status badges |

## Approach

Vertical slice: backend endpoint first, then client API, then UI with mutation + toast.

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `server/src/modules/orders/order.service.ts` | Modify | Add `updateOrderStatus(id, status)` |
| `server/src/modules/orders/order.schema.ts` | Modify | Add `updateOrderStatusSchema` with params.id + body.status validation |
| `server/src/modules/orders/order.controller.ts` | Modify | Add `updateOrderStatus` handler (404 if not found, 400 if invalid) |
| `server/src/modules/orders/order.routes.ts` | Modify | Register `PATCH /:id/status` with validation |
| `client/src/modules/orders/orders.api.ts` | Modify | Add `updateOrderStatus(id, status)` API function |
| `client/src/modules/orders/OrderList.tsx` | Modify | Add Process/Decline buttons for PENDING rows, mutation, toast |
| `package.json` (client) | Modify | Add `react-hot-toast` dependency |
| `client/src/App.tsx` | Modify | Add `<Toaster />` component |

## Implementation Steps

### Phase 1: Backend — Service Layer
1. Add `updateOrderStatus` to `order.service.ts`:
   - Accept `id: string` and `status: string`
   - Use `prisma.order.update({ where: { id }, data: { status } })`
   - Include customer and items relations in response (consistent with getOrders)

### Phase 2: Backend — Validation Schema
2. Add `updateOrderStatusSchema` to `order.schema.ts`:
   ```typescript
   export const updateOrderStatusSchema = z.object({
       params: z.object({
           id: z.string().uuid('Invalid Order ID'),
       }),
       body: z.object({
           status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED'], {
               errorMap: () => ({ message: 'Status must be PENDING, COMPLETED, or CANCELLED' }),
           }),
       }),
   });
   ```

### Phase 3: Backend — Controller
3. Add `updateOrderStatus` to `order.controller.ts`:
   - Call `orderService.updateOrderStatus(req.params.id, req.body.status)`
   - Return 404 if order not found (check with `getOrderById` first, or catch Prisma `P2025` error)
   - Return 200 with updated order on success

### Phase 4: Backend — Route Registration
4. Add route to `order.routes.ts`:
   ```typescript
   router.patch('/:id/status', validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);
   ```

### Phase 5: Frontend — API Layer
5. Add `updateOrderStatus` to `orders.api.ts`:
   ```typescript
   export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
       const response = await apiClient.patch(`/orders/${id}/status`, { status });
       return response.data;
   };
   ```

### Phase 6: Frontend — Toast Setup
6. Install `react-hot-toast` and add `<Toaster />` to `App.tsx` layout.

### Phase 7: Frontend — UI (OrderList.tsx)
7. Update `OrderList.tsx`:
   - Import `useMutation`, `useQueryClient` from TanStack Query
   - Import `toast` from `react-hot-toast`
   - Add `updateStatusMutation` using `useMutation`:
     - `mutationFn`: calls `updateOrderStatus(id, status)`
     - `onSuccess`: invalidate `['orders']` and `['dashboard']` queries, show success toast
     - `onError`: show error toast
   - Add an "Actions" column header to the table
   - For each PENDING row, render:
     - "Process" button (emerald, calls mutation with `COMPLETED`)
     - "Decline" button (red, calls mutation with `CANCELLED`)
   - Both buttons disabled while `mutation.isPending` for that specific order
   - Non-PENDING rows show a dash or empty cell in the Actions column

## Verification

- [ ] `PATCH /api/orders/:id/status` returns 200 with updated order
- [ ] `PATCH /api/orders/nonexistent/status` returns 404
- [ ] `PATCH /api/orders/:id/status` with invalid status returns 400
- [ ] PENDING rows show Process and Decline buttons
- [ ] COMPLETED/CANCELLED rows do NOT show action buttons
- [ ] Clicking Process changes status to COMPLETED ("Processed" badge)
- [ ] Clicking Decline changes status to CANCELLED ("Declined" badge)
- [ ] Buttons are disabled during pending mutation
- [ ] Toast message appears on success/error
- [ ] Dashboard stats update after status change (query invalidation)
- [ ] Type check passes (`tsc --noEmit`)
- [ ] Build passes (`npm run build`)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Toast library conflicts | Low | Low | `react-hot-toast` is zero-dep, widely compatible |
| Race condition on concurrent status updates | Low | Medium | Prisma handles at DB level; UI disables buttons during mutation |
| Status transition validation (e.g. CANCELLED -> COMPLETED) | Medium | Low | Out of scope per requirements, but could add server-side guard later |

## Test Cases (TDD)

### Unit Tests (Server)
- `updateOrderStatus` service returns updated order with new status
- `updateOrderStatus` controller returns 404 for missing order
- `updateOrderStatusSchema` rejects invalid status values
- `updateOrderStatusSchema` rejects missing status field

### Integration Tests (Client)
- `updateOrderStatus` API function calls correct endpoint
- OrderList renders action buttons only for PENDING orders
- Clicking Process triggers mutation with COMPLETED status
- Clicking Decline triggers mutation with CANCELLED status
- Buttons are disabled while mutation is pending
- Success toast appears after mutation resolves

### E2E Scenarios
- Navigate to /orders, find PENDING transaction, click Process, verify status changes to "Processed"
- Navigate to /orders, find PENDING transaction, click Decline, verify status changes to "Declined"
- Verify already-processed transactions have no action buttons
- Verify dashboard stats reflect updated counts after status change
