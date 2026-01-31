# Server - AI Dev Workflow Template

Express.js backend API with TypeScript, Prisma ORM, and Zod validation.

## Features

- **Framework**: Express.js 5 with TypeScript
- **Database**: SQLite (via Prisma ORM)
- **Validation**: Zod for request validation
- **Architecture**: Layered modular structure

## Request Flow

```
HTTP Request
     │
     ▼
┌─────────────────┐
│  Express Router │  Routes define endpoints and middleware
│  (*.routes.ts)  │  Applies validateRequest() for POST/PATCH
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  validateRequest│  Middleware validates body/query/params
│  (middleware)   │  using Zod schemas
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │  Handles request/response
│ (*.controller.ts)│  Try/catch with next(error)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │  Business logic
│  (*.service.ts) │  Prisma database operations
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prisma Client  │  ORM layer
│   (prisma.ts)   │  SQLite database
└─────────────────┘
```

## File Structure

```
server/
├── prisma/
│   ├── schema.prisma   # Database models
│   └── seed.ts         # Database seeding
├── src/
│   ├── middleware/
│   │   ├── errorHandler.ts     # Global error handling
│   │   └── validateRequest.ts  # Zod validation middleware
│   ├── modules/
│   │   ├── customers/
│   │   │   ├── customer.routes.ts      # Route definitions
│   │   │   ├── customer.controller.ts  # Request handlers
│   │   │   ├── customer.service.ts     # Prisma operations
│   │   │   └── customer.schema.ts      # Zod schemas
│   │   ├── products/
│   │   └── orders/
│   ├── app.ts          # Express app setup
│   ├── prisma.ts       # Shared Prisma client
│   └── server.ts       # Entry point
├── .env                # Environment variables
├── package.json
└── tsconfig.json
```

## Layer Responsibilities

| Layer | File | Responsibility |
|-------|------|----------------|
| Router | `*.routes.ts` | Define endpoints, apply middleware |
| Schema | `*.schema.ts` | Zod validation schemas |
| Controller | `*.controller.ts` | Handle HTTP request/response |
| Service | `*.service.ts` | Business logic, Prisma operations |

## Middleware

### validateRequest
Validates request body, query, and params against Zod schema:
```typescript
router.post('/', validateRequest(createItemSchema), controller.createItem);
```

### errorHandler
Global error handler that:
- Returns 400 with validation errors for ZodError
- Returns 500 for other errors
- Logs all errors to console

## API Reference

### Health Check
```
GET /health
Response: { "status": "ok" }
```

### Customers

#### List Customers
```
GET /api/customers
Response: Customer[]
```

#### Get Customer
```
GET /api/customers/:id
Response: Customer | 404
```

#### Create Customer
```
POST /api/customers
Body: {
  name: string (required),
  email: string (required, valid email),
  phone?: string,
  address?: string,
  status?: "ACTIVE" | "INACTIVE" (default: "ACTIVE")
}
Response: 201 Customer
```

#### Update Customer
```
PATCH /api/customers/:id
Body: {
  name?: string,
  email?: string,
  phone?: string,
  address?: string,
  status?: "ACTIVE" | "INACTIVE"
}
Response: Customer
```

#### Delete Customer
```
DELETE /api/customers/:id
Response: 204 No Content
```

### Products

#### List Products
```
GET /api/products
Response: Product[]
```

#### Get Product
```
GET /api/products/:id
Response: Product | 404
```

#### Create Product
```
POST /api/products
Body: {
  sku: string (required),
  name: string (required),
  description?: string,
  price: number (required),
  stock?: number (default: 0)
}
Response: 201 Product
```

#### Update Product
```
PATCH /api/products/:id
Body: {
  sku?: string,
  name?: string,
  description?: string,
  price?: number,
  stock?: number
}
Response: Product
```

#### Delete Product
```
DELETE /api/products/:id
Response: 204 No Content
```

### Orders

#### List Orders
```
GET /api/orders
Response: Order[] (with customer and items.product)
```

#### Get Order
```
GET /api/orders/:id
Response: Order (with customer and items.product) | 404
```

#### Create Order
```
POST /api/orders
Body: {
  customerId: string (required),
  status?: "PENDING" | "COMPLETED" | "CANCELLED" (default: "PENDING"),
  items: [{
    productId: string (required),
    quantity: number (required, min: 1)
  }]
}
Response: 201 Order
```

#### Update Order
```
PATCH /api/orders/:id
Body: {
  status?: "PENDING" | "COMPLETED" | "CANCELLED"
}
Response: Order
```

#### Delete Order
```
DELETE /api/orders/:id
Response: 204 No Content
```

## Database

### Models

```prisma
Customer (id, name, email, phone?, address?, status, createdAt, updatedAt)
Product  (id, sku, name, description?, price, stock, createdAt, updatedAt)
Order    (id, customerId, status, totalAmount, orderDate, createdAt, updatedAt)
OrderItem(id, orderId, productId, quantity, unitPrice)
```

### Relationships
- Customer → Order (one-to-many)
- Order → OrderItem (one-to-many)
- Product → OrderItem (one-to-many)

### Common Prisma Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Apply schema to database (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name migration_name

# Open database GUI
npx prisma studio

# Seed database
npm run seed

# Reset database
npx prisma db push --force-reset
```

## Adding a New Module

1. Create `src/modules/{name}/` directory

2. Create schema file (`{name}.schema.ts`):
```typescript
import { z } from 'zod';

export const createItemSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
    }),
});

export const updateItemSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
    }),
});
```

3. Create service file (`{name}.service.ts`):
```typescript
import prisma from '../../prisma';
import { Prisma } from '@prisma/client';

export const getItems = async () => {
    return prisma.item.findMany({
        orderBy: { createdAt: 'desc' },
    });
};
// ... other CRUD operations
```

4. Create controller file (`{name}.controller.ts`):
```typescript
import { Request, Response, NextFunction } from 'express';
import * as itemService from './item.service';

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await itemService.getItems();
        res.json(items);
    } catch (error) {
        next(error);
    }
};
// ... other handlers
```

5. Create routes file (`{name}.routes.ts`):
```typescript
import { Router } from 'express';
import * as itemController from './item.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { createItemSchema, updateItemSchema } from './item.schema';

const router = Router();

router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.post('/', validateRequest(createItemSchema), itemController.createItem);
router.patch('/:id', validateRequest(updateItemSchema), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router;
```

6. Register routes in `src/app.ts`:
```typescript
import itemRoutes from './modules/items/item.routes';
app.use('/api/items', itemRoutes);
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

```bash
cd server
npm install
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
npm run seed
```

### Running the Application

**Development Mode** (with hot-reload):
```bash
npm run dev
```
Server runs at `http://localhost:3000`

**Production Mode**:
```bash
npm run start
```

## Environment Variables

Create `.env` file:
```
DATABASE_URL="file:./dev.db"
PORT=3000
```

## Major Libraries

| Library | Purpose |
|---------|---------|
| `express` | Web framework |
| `prisma` | ORM & database client |
| `zod` | Runtime validation |
| `cors` | CORS middleware |
| `dotenv` | Environment variables |
| `nodemon` | Development hot-reload |
| `ts-node` | TypeScript execution |
