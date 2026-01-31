# AI Dev Workflow Template

A full-stack TypeScript CRUD application template demonstrating modern development patterns with React and Express.

## Tech Stack

### Client
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| React Router | 7.9.6 | Client-side routing |
| Vite | 7.2.4 | Build tool & dev server |
| TypeScript | ~5.9.3 | Static typing |
| Tailwind CSS | 4.1.17 | Utility-first styling |
| TanStack React Query | 5.90.10 | Server state management |
| Zustand | 5.0.8 | Client state (available) |
| Axios | 1.13.2 | HTTP client |

### Server
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 5.1.0 | Web framework |
| Prisma | 5.10.0 | ORM & database client |
| Zod | 4.1.12 | Runtime validation |
| SQLite | - | Database |
| TypeScript | 5.9.3 | Static typing |

## Project Structure

```
ai-dev-workflow-template/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── lib/           # Shared utilities (apiClient)
│   │   ├── modules/       # Feature modules
│   │   │   ├── customers/ # Customer CRUD
│   │   │   ├── products/  # Product CRUD
│   │   │   ├── orders/    # Order CRUD
│   │   │   └── dashboard/ # Main dashboard
│   │   ├── App.tsx        # Routes & layout
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── server/                 # Express backend API
│   ├── prisma/
│   │   └── schema.prisma  # Database models
│   ├── src/
│   │   ├── middleware/    # Express middleware
│   │   ├── modules/       # Feature modules
│   │   │   ├── customers/ # routes, controller, service, schema
│   │   │   ├── products/
│   │   │   └── orders/
│   │   ├── app.ts         # Express app setup
│   │   └── server.ts      # Entry point
│   └── package.json
│
├── CLAUDE.md              # AI assistant instructions
└── README.md              # This file
```

## Quick Start

### Prerequisites
- Node.js v18+
- npm

### Server Setup

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Server runs at `http://localhost:3000`

### Client Setup

```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173`

## Documentation

- [Client README](./client/README.md) - Frontend architecture and patterns
- [Server README](./server/README.md) - Backend architecture and API reference
- [CLAUDE.md](./CLAUDE.md) - AI assistant coding guidelines
