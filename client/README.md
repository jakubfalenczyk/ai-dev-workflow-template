# Client - AI Dev Workflow Template

React frontend application with TypeScript, Vite, and Tailwind CSS.

## Features

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS v4 for utility-first styling
- **State Management**: Zustand for global state
- **Data Fetching**: React Query (TanStack Query) for server state management
- **Routing**: React Router v7
- **Architecture**: Feature-based modules (Customers, Dashboard, Orders, Products)

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Component                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  useQuery   │    │ useMutation  │    │ useState      │  │
│  │  (read)     │    │ (write)      │    │ (local)       │  │
│  └──────┬──────┘    └──────┬───────┘    └───────────────┘  │
│         │                  │                                 │
│         ▼                  ▼                                 │
│  ┌─────────────────────────────────────┐                    │
│  │         React Query Cache            │                    │
│  │  queryKey: ['customers']             │                    │
│  │  queryKey: ['customer', id]          │                    │
│  └──────────────────┬──────────────────┘                    │
│                     │                                        │
│                     ▼                                        │
│  ┌─────────────────────────────────────┐                    │
│  │         API Functions                │                    │
│  │         (customers.api.ts)           │                    │
│  └──────────────────┬──────────────────┘                    │
│                     │                                        │
│                     ▼                                        │
│  ┌─────────────────────────────────────┐                    │
│  │         Axios Client                 │                    │
│  │         (lib/apiClient.ts)           │                    │
│  └──────────────────┬──────────────────┘                    │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
              Express API (localhost:3000)
```

## File Structure

```
client/
├── src/
│   ├── assets/         # Static assets (images, fonts)
│   ├── lib/            # Shared utilities and configurations
│   │   └── apiClient.ts    # Axios instance with base URL
│   ├── modules/        # Feature modules
│   │   ├── customers/  # Customer management
│   │   │   ├── CustomerList.tsx    # List view with useQuery
│   │   │   ├── CustomerForm.tsx    # Create/Edit form
│   │   │   ├── customers.api.ts    # API functions
│   │   │   └── customers.types.ts  # TypeScript interfaces
│   │   ├── products/   # Product management
│   │   ├── orders/     # Order management
│   │   └── dashboard/  # Main dashboard view
│   ├── App.tsx         # Routes & layout
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles & Tailwind
├── public/             # Public static files
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Module Structure

Each feature module contains:

| File | Purpose |
|------|---------|
| `{Name}List.tsx` | List view with data fetching and delete actions |
| `{Name}Form.tsx` | Create/Edit form handling both modes |
| `{name}.api.ts` | Axios API functions (CRUD operations) |
| `{name}.types.ts` | TypeScript interfaces for the entity |

## React Query Patterns

### Query Keys
```typescript
['customers']           // List of all customers
['customer', id]        // Single customer by ID
['products']            // List of all products
['product', id]         // Single product by ID
['orders']              // List of all orders
['order', id]           // Single order by ID
```

### Cache Invalidation
After mutations, invalidate related queries:
```typescript
// After creating/updating/deleting a customer
queryClient.invalidateQueries({ queryKey: ['customers'] });

// After updating a specific customer (also invalidate the single query)
queryClient.invalidateQueries({ queryKey: ['customers'] });
queryClient.invalidateQueries({ queryKey: ['customer', id] });
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Dashboard` | Main dashboard with overview |
| `/customers` | `CustomerList` | Customer list view |
| `/customers/new` | `CustomerForm` | Create new customer |
| `/customers/:id/edit` | `CustomerForm` | Edit existing customer |
| `/products` | `ProductList` | Product list view |
| `/products/new` | `ProductForm` | Create new product |
| `/products/:id/edit` | `ProductForm` | Edit existing product |
| `/orders` | `OrderList` | Order list view |
| `/orders/new` | `OrderForm` | Create new order |

## Tailwind Styling

### Color Scheme
- **Primary**: Indigo (`indigo-600`, `indigo-700`)
- **Success**: Green (`green-100`, `green-800`)
- **Danger**: Red (`red-600`, `red-900`)
- **Neutral**: Gray (`gray-50`, `gray-100`, `gray-300`, `gray-500`, `gray-700`, `gray-900`)

### Common Patterns
```tsx
// Primary button
className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-md px-4 py-2"

// Secondary button
className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md px-4 py-2"

// Link action
className="text-indigo-600 hover:text-indigo-900"

// Danger action
className="text-red-600 hover:text-red-900"

// Status badge (active)
className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-green-100 text-green-800"

// Status badge (inactive)
className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-gray-100 text-gray-800"
```

## Adding a New Module

1. Create module directory: `src/modules/{name}/`

2. Create types file (`{name}.types.ts`):
```typescript
export interface Widget {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWidgetInput {
    name: string;
}
```

3. Create API file (`{name}.api.ts`):
```typescript
import apiClient from '../../lib/apiClient.ts';
import type { Widget, CreateWidgetInput } from './{name}.types.ts';

export const getWidgets = async (): Promise<Widget[]> => {
    const response = await apiClient.get('/widgets');
    return response.data;
};
// ... other CRUD functions
```

4. Create list component (`{Name}List.tsx`) with useQuery

5. Create form component (`{Name}Form.tsx`) with useMutation

6. Add routes in `App.tsx`:
```tsx
<Route path="/widgets" element={<WidgetList />} />
<Route path="/widgets/new" element={<WidgetForm />} />
<Route path="/widgets/:id/edit" element={<WidgetForm />} />
```

7. Add navigation link in `App.tsx` nav section

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

```bash
cd client
npm install
```

### Running the Application

**Development Mode**:
```bash
npm run dev
```
The application will start at `http://localhost:5173`

**Production Build**:
```bash
npm run build
```

**Preview Production Build**:
```bash
npm run preview
```

## Major Libraries

| Library | Purpose |
|---------|---------|
| `react` & `react-dom` | UI library |
| `vite` | Frontend build tool |
| `typescript` | Static type checking |
| `tailwindcss` | Utility-first CSS framework |
| `@tanstack/react-query` | Server state management |
| `zustand` | Client state management |
| `react-router-dom` | Declarative routing |
| `axios` | HTTP client |
