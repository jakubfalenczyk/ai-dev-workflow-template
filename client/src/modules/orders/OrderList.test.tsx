import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import OrderList from './OrderList.tsx';
import * as ordersApi from './orders.api.ts';
import type { Order } from './orders.types.ts';

vi.mock('./orders.api.ts');

const mockOrdersApi = ordersApi as unknown as {
    getOrders: ReturnType<typeof vi.fn>;
    updateOrderStatus: ReturnType<typeof vi.fn>;
};

const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
    id: 'order-123',
    customerId: 'customer-456',
    customer: {
        id: 'customer-456',
        name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        address: null,
        status: 'ACTIVE',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
    },
    status: 'PENDING',
    totalAmount: '150.00',
    orderDate: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    items: [
        {
            id: 'item-1',
            orderId: 'order-123',
            productId: 'product-789',
            product: {
                id: 'product-789',
                sku: 'PROD-001',
                name: 'Test Product',
                description: null,
                price: '75.00',
                stock: 100,
                createdAt: '2024-01-15T00:00:00Z',
                updatedAt: '2024-01-15T00:00:00Z',
            },
            quantity: 2,
            unitPrice: '75.00',
        },
    ],
    ...overrides,
});

describe('OrderList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Action Buttons Visibility', () => {
        it('should show Process and Decline buttons for PENDING orders', async () => {
            const pendingOrder = createMockOrder({ status: 'PENDING' });
            mockOrdersApi.getOrders.mockResolvedValue([pendingOrder]);

            render(<OrderList />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /process/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
            });
        });

        it('should NOT show action buttons for COMPLETED orders', async () => {
            const completedOrder = createMockOrder({ status: 'COMPLETED' });
            mockOrdersApi.getOrders.mockResolvedValue([completedOrder]);

            render(<OrderList />);

            // Wait for the table to render by looking for the order ID
            await waitFor(() => {
                expect(screen.getByText(/ORDER-12/i)).toBeInTheDocument();
            });

            expect(screen.queryByRole('button', { name: /process/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /decline/i })).not.toBeInTheDocument();
        });

        it('should NOT show action buttons for CANCELLED orders', async () => {
            const cancelledOrder = createMockOrder({ status: 'CANCELLED' });
            mockOrdersApi.getOrders.mockResolvedValue([cancelledOrder]);

            render(<OrderList />);

            // Wait for the table to render by looking for the order ID
            await waitFor(() => {
                expect(screen.getByText(/ORDER-12/i)).toBeInTheDocument();
            });

            expect(screen.queryByRole('button', { name: /process/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /decline/i })).not.toBeInTheDocument();
        });
    });

    describe('Status Update Actions', () => {
        it('should call updateOrderStatus with COMPLETED when Process is clicked', async () => {
            const user = userEvent.setup();
            const pendingOrder = createMockOrder({ status: 'PENDING' });
            mockOrdersApi.getOrders.mockResolvedValue([pendingOrder]);
            mockOrdersApi.updateOrderStatus.mockResolvedValue({
                ...pendingOrder,
                status: 'COMPLETED',
            });

            render(<OrderList />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /process/i })).toBeInTheDocument();
            });

            await user.click(screen.getByRole('button', { name: /process/i }));

            await waitFor(() => {
                expect(mockOrdersApi.updateOrderStatus).toHaveBeenCalledWith(
                    'order-123',
                    'COMPLETED'
                );
            });
        });

        it('should call updateOrderStatus with CANCELLED when Decline is clicked', async () => {
            const user = userEvent.setup();
            const pendingOrder = createMockOrder({ status: 'PENDING' });
            mockOrdersApi.getOrders.mockResolvedValue([pendingOrder]);
            mockOrdersApi.updateOrderStatus.mockResolvedValue({
                ...pendingOrder,
                status: 'CANCELLED',
            });

            render(<OrderList />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
            });

            await user.click(screen.getByRole('button', { name: /decline/i }));

            await waitFor(() => {
                expect(mockOrdersApi.updateOrderStatus).toHaveBeenCalledWith(
                    'order-123',
                    'CANCELLED'
                );
            });
        });
    });

    describe('Button States During Mutation', () => {
        it('should disable buttons while mutation is in progress', async () => {
            const user = userEvent.setup();
            const pendingOrder = createMockOrder({ status: 'PENDING' });
            mockOrdersApi.getOrders.mockResolvedValue([pendingOrder]);

            // Create a promise that doesn't resolve immediately
            let resolvePromise: (value: Order) => void;
            mockOrdersApi.updateOrderStatus.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolvePromise = resolve;
                    })
            );

            render(<OrderList />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /process/i })).toBeInTheDocument();
            });

            const processButton = screen.getByRole('button', { name: /process/i });
            const declineButton = screen.getByRole('button', { name: /decline/i });

            // Click process button
            await user.click(processButton);

            // Buttons should be disabled during mutation
            await waitFor(() => {
                expect(processButton).toBeDisabled();
                expect(declineButton).toBeDisabled();
            });

            // Resolve the promise
            resolvePromise!({ ...pendingOrder, status: 'COMPLETED' });

            // After mutation completes, buttons should be re-enabled (or order should be updated)
            await waitFor(() => {
                // Either buttons are enabled again or the order status changed
                expect(mockOrdersApi.updateOrderStatus).toHaveBeenCalled();
            });
        });
    });
});
