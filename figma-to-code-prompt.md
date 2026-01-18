# Figma-to-Code: Topbar to Left Sidebar Conversion

## Figma Design
- **URL**: https://www.figma.com/design/uB3lB1QmZ7C59egTxQCumz/ERP--Community-?node-id=19-703&t=ITVMZt0rYd6RdJMo-0
- **File Key**: `uB3lB1QmZ7C59egTxQCumz`
- **Node ID**: `19:703`

## Design Alignment Requirements

**STRICT PIXEL-PERFECT ALIGNMENT** - The implementation must match the Figma design exactly:

| Property | Requirement |
|----------|-------------|
| **Padding** | Extract exact values from Figma (px) and convert to Tailwind or custom CSS |
| **Spacing/Gaps** | Match all margins and gaps between elements exactly |
| **Colors** | Use exact hex/rgb values from Figma - no approximations |
| **Typography** | Match font-family, font-size, font-weight, line-height, letter-spacing |
| **Icons** | Download icons from Figma assets or match with equivalent icons |
| **Border radius** | Match exact corner radius values |
| **Shadows** | Replicate any box-shadows or effects |
| **Dimensions** | Match width, height of sidebar and elements |

**EXCEPTION - Menu Items**: Use the existing navigation items from the current topbar (not Figma labels). The routes must remain functional:
- Dashboard → /
- Customers → /customers
- Products → /products
- Orders → /orders

## Prompt

```
Convert the current horizontal topbar navigation to a left sidebar based on the Figma design.

1. Fetch the design from Figma using MCP:
   - Use mcp__figma__get_design_context with fileKey "uB3lB1QmZ7C59egTxQCumz" and nodeId "19:703"
   - Use mcp__figma__get_screenshot for visual reference
   - Use mcp__figma__get_variable_defs if design tokens are available

2. Create a new Sidebar component at client/src/components/Sidebar.tsx:
   - PIXEL-PERFECT: Match all padding, spacing, colors, typography, icons exactly
   - Extract exact values from the design context (don't approximate)
   - Download any icons/assets from the provided asset URLs
   - Use custom Tailwind values or inline styles if needed for exact measurements

3. IMPORTANT - Keep existing menu items and routing:
   - Use my current navigation items: Dashboard, Customers, Products, Orders
   - Preserve React Router Link/NavLink functionality
   - Keep the existing routes working (/, /customers, /products, /orders)
   - Only the visual design should come from Figma, not the menu labels

4. Update client/src/App.tsx:
   - Remove the inline topbar navigation
   - Import and use the new Sidebar component
   - Change layout to horizontal flex (sidebar + content)

Tech stack: React, TypeScript, Tailwind CSS, React Router
```

## Current Implementation

**File**: `client/src/App.tsx`

**Layout**: Vertical (topbar above content)
```
┌─────────────────────────────────────┐
│           Topbar Navigation         │
├─────────────────────────────────────┤
│                                     │
│           Main Content              │
│                                     │
└─────────────────────────────────────┘
```

**Current Navigation** (inline in App.tsx, lines 18-37):
```tsx
<nav className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      <div className="flex space-x-8">
        <Link to="/">Dashboard</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/products">Products</Link>
        <Link to="/orders">Orders</Link>
      </div>
    </div>
  </div>
</nav>
```

## Target Implementation

**Layout**: Horizontal (sidebar beside content)
```
┌──────────┬──────────────────────────┐
│          │                          │
│  Left    │      Main Content        │
│  Sidebar │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

**New Files**:
- `client/src/components/Sidebar.tsx` - New sidebar component matching Figma

**Modified Files**:
- `client/src/App.tsx` - Remove topbar, add sidebar, change layout to flex row

## Navigation Items to Preserve
- Dashboard → /
- Customers → /customers
- Products → /products
- Orders → /orders
