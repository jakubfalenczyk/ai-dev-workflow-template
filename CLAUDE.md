# CLAUDE.md - AI Assistant Instructions

This file provides context and coding patterns for AI assistants working on this codebase.

## Project Overview

Full-stack TypeScript CRUD application with:
- **Client**: React 19 + Vite + TanStack Query + Tailwind CSS
- **Server**: Express 5 + Prisma + Zod + SQLite

## Module Structure

### Client Module (`client/src/modules/{name}/`)
```
{Name}List.tsx       # List view with useQuery
{Name}Form.tsx       # Create/Edit form with useMutation
{name}.api.ts        # Axios API functions
{name}.types.ts      # TypeScript interfaces
```

### Server Module (`server/src/modules/{name}/`)
```
{name}.routes.ts     # Express router with validation
{name}.controller.ts # Request handlers with try/catch
{name}.service.ts    # Prisma database operations
{name}.schema.ts     # Zod validation schemas
```

## Adding a New Feature

### Step 1: Database Model
Add to `server/prisma/schema.prisma`:
```prisma
model Widget {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
Run: `npx prisma db push`

### Step 2: Server Module
Create `server/src/modules/widgets/`:
- `widget.schema.ts` - Zod schemas
- `widget.service.ts` - Prisma operations
- `widget.controller.ts` - Express handlers
- `widget.routes.ts` - Route definitions

Register in `server/src/app.ts`:
```typescript
import widgetRoutes from './modules/widgets/widget.routes';
app.use('/api/widgets', widgetRoutes);
```

### Step 3: Client Module
Create `client/src/modules/widgets/`:
- `widgets.types.ts` - TypeScript types
- `widgets.api.ts` - API functions
- `WidgetList.tsx` - List component
- `WidgetForm.tsx` - Form component

Add routes in `client/src/App.tsx`:
```tsx
<Route path="/widgets" element={<WidgetList />} />
<Route path="/widgets/new" element={<WidgetForm />} />
<Route path="/widgets/:id/edit" element={<WidgetForm />} />
```

## Code Patterns

### React Query - List with Delete
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, deleteItem } from './items.api.ts';

function ItemList() {
    const queryClient = useQueryClient();
    const { data: items, isLoading } = useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
        },
    });

    if (isLoading) return <div>Loading...</div>;
    // render list...
}
```

### React Query - Form with Create/Update
```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function ItemForm() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    const { data: item } = useQuery({
        queryKey: ['item', id],
        queryFn: () => getItemById(id!),
        enabled: isEdit,
    });

    const createMutation = useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            navigate('/items');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data) => updateItem(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['item', id] });
            navigate('/items');
        },
    });
}
```

### Axios API Functions
```typescript
import apiClient from '../../lib/apiClient.ts';
import type { Item, CreateItemInput } from './items.types.ts';

export const getItems = async (): Promise<Item[]> => {
    const response = await apiClient.get('/items');
    return response.data;
};

export const createItem = async (data: CreateItemInput): Promise<Item> => {
    const response = await apiClient.post('/items', data);
    return response.data;
};
```

### Zod Schema (Server)
```typescript
import { z } from 'zod';

export const createItemSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    }),
});

export const updateItemSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
```

### Express Controller
```typescript
import { Request, Response, NextFunction } from 'express';
import * as itemService from './item.service';

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await itemService.createItem(req.body);
        res.status(201).json(item);
    } catch (error) {
        next(error);
    }
};

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await itemService.getItems();
        res.json(items);
    } catch (error) {
        next(error);
    }
};
```

### Express Routes
```typescript
import { Router } from 'express';
import * as itemController from './item.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createItemSchema, updateItemSchema } from './item.schema';

const router = Router();

router.post('/', validateRequest(createItemSchema), itemController.createItem);
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.patch('/:id', validateRequest(updateItemSchema), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;
```

### Prisma Service
```typescript
import prisma from '../../prisma';
import { Prisma } from '@prisma/client';

export const createItem = async (data: Prisma.ItemCreateInput) => {
    return prisma.item.create({ data });
};

export const getItems = async () => {
    return prisma.item.findMany({
        orderBy: { createdAt: 'desc' },
    });
};

export const getItemById = async (id: string) => {
    return prisma.item.findUnique({
        where: { id },
    });
};

export const updateItem = async (id: string, data: Prisma.ItemUpdateInput) => {
    return prisma.item.update({
        where: { id },
        data,
    });
};

export const deleteItem = async (id: string) => {
    return prisma.item.delete({
        where: { id },
    });
};
```

## API Endpoints

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create customer |
| PATCH | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PATCH | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id` | Update order |
| DELETE | `/api/orders/:id` | Delete order |

## Database Schema

```
Customer (id, name, email, phone?, address?, status, createdAt, updatedAt)
    └── orders: Order[]

Product (id, sku, name, description?, price, stock, createdAt, updatedAt)
    └── orderItems: OrderItem[]

Order (id, customerId, status, totalAmount, orderDate, createdAt, updatedAt)
    ├── customer: Customer
    └── items: OrderItem[]

OrderItem (id, orderId, productId, quantity, unitPrice)
    ├── order: Order
    └── product: Product
```

## File Naming Conventions

| Location | Convention | Example |
|----------|------------|---------|
| Client components | PascalCase | `CustomerList.tsx` |
| Client API/types | camelCase | `customers.api.ts` |
| Server modules | singular.camelCase | `customer.routes.ts` |
| Prisma models | PascalCase | `Customer` |

## Environment Variables

### Server (`server/.env`)
```
DATABASE_URL="file:./dev.db"
PORT=3000
```

### Client
API base URL is configured in `client/src/lib/apiClient.ts`

## Common Tasks

```bash
# Run both servers (from respective directories)
cd client && npm run dev
cd server && npm run dev

# Database operations
cd server
npx prisma db push      # Apply schema changes
npx prisma studio       # Open database GUI
npm run seed            # Seed database

# Build for production
cd client && npm run build
```
