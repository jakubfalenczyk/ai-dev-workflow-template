# Client - AI Dev Workflow Template

This is the client-side application for the AI Dev Workflow Template, built with React, TypeScript, and Vite. It features a modern, modular architecture and uses Tailwind CSS for styling.

## Features

- **Framework**: React 19 with TypeScript.
- **Build Tool**: Vite for fast development and building.
- **Styling**: Tailwind CSS v4 for utility-first styling.
- **State Management**: Zustand for global state.
- **Data Fetching**: React Query (TanStack Query) for server state management.
- **Routing**: React Router v7.
- **Architecture**: Feature-based modules (Customers, Dashboard, Orders, Products).

## File Structure

```
client/
├── src/
│   ├── assets/         # Static assets (images, fonts)
│   ├── lib/            # Shared utilities and configurations (e.g., axios)
│   ├── modules/        # Feature modules containing components and logic
│   │   ├── customers/  # Customer management feature
│   │   ├── dashboard/  # Main dashboard view
│   │   ├── orders/     # Order management feature
│   │   └── products/   # Product management feature
│   ├── App.tsx         # Main application component and routing setup
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles and Tailwind directives
├── public/             # Public static files
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Major Libraries

- **react** & **react-dom**: UI library.
- **vite**: Frontend build tool.
- **typescript**: Static type checking.
- **tailwindcss**: Utility-first CSS framework.
- **@tanstack/react-query**: Asynchronous state management.
- **zustand**: Small, fast, and scalable bearbones state-management solution.
- **react-router-dom**: Declarative routing for React.
- **axios**: Promise based HTTP client.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

1.  Navigate to the client directory:
    ```bash
    cd client
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

- **Development Mode**:
  ```bash
  npm run dev
  ```
  The application will start at `http://localhost:5173` (default Vite port).

- **Production Build**:
  ```bash
  npm run build
  ```
  This compiles the application into the `dist` folder.

- **Preview Production Build**:
  ```bash
  npm run preview
  ```

## Development

The project follows a modular structure. When adding new features, consider creating a new directory under `src/modules` to keep related components, hooks, and types together.
