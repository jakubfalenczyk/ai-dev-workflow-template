# Server CLAUDE.md - Code Generation Guidelines

## Tech Stack
- Express.js 5.1.0
- Prisma 5.10.0
- Zod 4.1.12
- SQLite
- TypeScript 5.9.3
- Node.js (CommonJS)

## Key Files
- `src/app.ts` - Express app setup, route registration
- `src/prisma.ts` - Shared Prisma client instance
- `src/middleware/validateRequest.ts` - Zod validation middleware
- `src/middleware/errorHandler.ts` - Global error handler
- `prisma/schema.prisma` - Database models

## Route File Pattern
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

## Controller Pattern
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

export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await itemService.getItemById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        next(error);
    }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const item = await itemService.updateItem(req.params.id, req.body);
        res.json(item);
    } catch (error) {
        next(error);
    }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await itemService.deleteItem(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
```

## Service Pattern
```typescript
import prisma from '../../prisma';
import { Prisma } from '@prisma/client';

export const createItem = async (data: Prisma.ItemCreateInput) => {
    return prisma.item.create({
        data,
    });
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

## Schema Pattern (Zod)
```typescript
import { z } from 'zod';

// Create schema - wraps fields in body object
export const createItemSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    }),
});

// Update schema - all fields optional
export const updateItemSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
});
```

## Registering Routes in app.ts
```typescript
import itemRoutes from './modules/items/item.routes';

// Add after other route registrations
app.use('/api/items', itemRoutes);
```

## Prisma Conventions

### Model Naming
- PascalCase for model names: `Customer`, `OrderItem`
- camelCase for field names: `createdAt`, `customerId`

### Common Fields
```prisma
model Item {
  id        String   @id @default(uuid())
  // ... other fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Relations
```prisma
// One-to-many (parent side)
model Customer {
  orders Order[]
}

// One-to-many (child side)
model Order {
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
}
```

### Including Relations in Queries
```typescript
// Include related data
return prisma.order.findMany({
    include: {
        customer: true,
        items: {
            include: {
                product: true,
            },
        },
    },
    orderBy: { createdAt: 'desc' },
});
```

## Error Handling

### Controller Pattern
Always wrap in try/catch and call `next(error)`:
```typescript
export const getItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // ... logic
    } catch (error) {
        next(error);
    }
};
```

### 404 Handling
```typescript
const item = await itemService.getItemById(req.params.id);
if (!item) {
    return res.status(404).json({ message: 'Item not found' });
}
```

### Response Status Codes
| Operation | Success Code |
|-----------|-------------|
| GET (list/single) | 200 |
| POST (create) | 201 |
| PATCH (update) | 200 |
| DELETE | 204 |

## Do NOT
- Omit try/catch in controllers
- Call `res.json()` without try/catch
- Import Prisma client directly (use `../../prisma`)
- Use ES modules syntax (`export default` is fine, but this is CommonJS)
- Forget to register routes in `app.ts`
- Forget to run `npx prisma generate` after schema changes
