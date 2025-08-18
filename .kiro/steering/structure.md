# Project Structure

## Root Level

- `src/`: Main source code directory
- `package.json`: Dependencies and scripts
- `vite.config.js`: Vite configuration
- `.env`: Environment variables (API base URL)
- `index.html`: Entry HTML file

## Source Organization (`src/`)

### Core Application

- `main.jsx`: Application entry point with providers
- `App.jsx`: Main routing and role-based navigation
- `styles.css`: Global CSS styles

### Architecture Patterns

- **Portal-based**: Each user role has its own portal with nested routing
- **Context-based state**: Authentication state managed via React Context
- **Protected routes**: Role-based access control using route guards

### Directory Structure

```
src/
├── components/          # Shared UI components
│   ├── NavBar.jsx      # Navigation component
│   └── ProtectedRoute.jsx # Route protection wrapper
├── pages/              # Public pages (login, signup)
├── portals/            # Role-specific portal containers
│   ├── UserPortal.jsx
│   ├── GuardPortal.jsx
│   └── ManagerPortal.jsx
├── state/              # Global state management
│   └── AuthContext.jsx # Authentication context
├── utils/              # Utility functions
│   └── api.js          # API client configuration
└── [role]/             # Role-specific feature modules
    ├── user/           # User role features
    ├── guard/          # Security guard features
    └── manager/        # Manager role features
```

## Naming Conventions

- Folders: lowercase with hyphens if needed
- Components: PascalCase with .jsx extension
- Role-specific modules organized by user type
- Each role has consistent feature set: Dashboard, Profile, Logs, etc.
