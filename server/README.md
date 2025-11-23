# Server - AI Dev Workflow Template

This is the server-side application for the AI Dev Workflow Template, built with Node.js, Express, and TypeScript. It provides a RESTful API to support the client application, utilizing Prisma for database interactions and Zod for runtime validation.

## Features

- **Framework**: Express.js with TypeScript for type safety.
- **Database**: SQLite (via Prisma ORM) for easy local development.
- **Validation**: Zod for request body and query parameter validation.
- **Architecture**: Modular structure organized by features (modules).

## File Structure

```
server/
├── prisma/             # Prisma schema and seed scripts
│   ├── schema.prisma   # Database schema definition
│   └── seed.ts         # Database seeding script
├── src/
│   ├── middleware/     # Custom Express middleware (e.g., error handling)
│   ├── modules/        # Feature-based modules (controllers, routes, services)
│   ├── app.ts          # Express application setup and middleware configuration
│   ├── prisma.ts       # Shared Prisma client instance
│   └── server.ts       # Application entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Major Libraries

- **express**: Web framework for Node.js.
- **prisma**: Next-generation ORM for Node.js and TypeScript.
- **zod**: TypeScript-first schema declaration and validation library.
- **cors**: Middleware to enable Cross-Origin Resource Sharing.
- **dotenv**: Module to load environment variables.
- **nodemon**: Utility to monitor changes and restart the server (dev).

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1.  Navigate to the server directory:
    ```bash
    cd server
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up the database:
    ```bash
    # Generate Prisma client
    npx prisma generate

    # Push schema to the database (creates dev.db)
    npx prisma db push

    # Seed the database with initial data
    npm run seed
    ```

### Running the Application

- **Development Mode** (with hot-reload):
  ```bash
  npm run dev
  ```
  The server will start at `http://localhost:3000` (or the port specified in `.env`).

- **Production Build**:
  ```bash
  npm run start
  ```

## API Overview

The API is organized into modules within `src/modules`. Each module typically contains its own routes and controllers. Common endpoints include resources for customers, products, and orders.
