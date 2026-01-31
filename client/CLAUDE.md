# Client CLAUDE.md - Code Generation Guidelines

## Tech Stack
- React 19.2.0
- React Router 7.9.6
- Vite 7.2.4
- TypeScript ~5.9.3
- Tailwind CSS 4.1.17
- TanStack React Query 5.90.10
- Zustand 5.0.8
- Axios 1.13.2

## Key Files
- `src/App.tsx` - Routes and layout
- `src/lib/apiClient.ts` - Axios instance
- `src/modules/` - Feature modules

## Component Pattern

### List Component
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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

    if (isLoading) return <div className="text-center py-4">Loading...</div>;

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
                    <p className="mt-2 text-sm text-gray-700">Description here.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <Link
                        to="/items/new"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                        Add Item
                    </Link>
                </div>
            </div>
            {/* Table content */}
        </div>
    );
}

export default ItemList;
```

### Form Component
```tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createItem, updateItem, getItemById } from './items.api.ts';
import type { CreateItemInput } from './items.types.ts';

function ItemForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<CreateItemInput>({
        name: '',
        // other fields with defaults
    });

    const { data: item } = useQuery({
        queryKey: ['item', id],
        queryFn: () => getItemById(id!),
        enabled: isEdit,
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                // map other fields
            });
        }
    }, [item]);

    const createMutation = useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            navigate('/items');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateItemInput>) => updateItem(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            queryClient.invalidateQueries({ queryKey: ['item', id] });
            navigate('/items');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Form content */}
        </div>
    );
}

export default ItemForm;
```

## API File Pattern
```typescript
import apiClient from '../../lib/apiClient.ts';
import type { Item, CreateItemInput } from './items.types.ts';

export const getItems = async (): Promise<Item[]> => {
    const response = await apiClient.get('/items');
    return response.data;
};

export const getItemById = async (id: string): Promise<Item> => {
    const response = await apiClient.get(`/items/${id}`);
    return response.data;
};

export const createItem = async (data: CreateItemInput): Promise<Item> => {
    const response = await apiClient.post('/items', data);
    return response.data;
};

export const updateItem = async (id: string, data: Partial<CreateItemInput>): Promise<Item> => {
    const response = await apiClient.patch(`/items/${id}`, data);
    return response.data;
};

export const deleteItem = async (id: string): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
};
```

## Types File Pattern
```typescript
export interface Item {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

export interface CreateItemInput {
    name: string;
    status?: 'ACTIVE' | 'INACTIVE';
}
```

## Import Conventions

- Include `.ts` extension for local imports: `import { getItems } from './items.api.ts'`
- Use `type` imports for types: `import type { Item } from './items.types.ts'`
- Import React Query hooks from `@tanstack/react-query`
- Import router hooks from `react-router-dom`

## Styling Guidelines

### Colors
| Usage | Classes |
|-------|---------|
| Primary button | `bg-indigo-600 hover:bg-indigo-700 text-white` |
| Secondary button | `border-gray-300 bg-white hover:bg-gray-50 text-gray-700` |
| Link/action | `text-indigo-600 hover:text-indigo-900` |
| Danger action | `text-red-600 hover:text-red-900` |
| Active status | `bg-green-100 text-green-800` |
| Inactive status | `bg-gray-100 text-gray-800` |

### Common Classes
```tsx
// Page container
className="px-4 sm:px-6 lg:px-8"

// Page title
className="text-2xl font-semibold text-gray-900"

// Subtitle
className="mt-2 text-sm text-gray-700"

// Form input
className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"

// Form label
className="block text-sm font-medium text-gray-700"
```

## Do NOT
- Use class components (use function components)
- Use Redux (use React Query for server state, Zustand for client state)
- Use fetch directly (use the apiClient from `lib/apiClient.ts`)
- Use CSS modules or styled-components (use Tailwind)
- Omit `.ts`/`.tsx` extensions in local imports
