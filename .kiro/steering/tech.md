# Technology Stack

## Build System & Framework

- **Vite**: Modern build tool and dev server
- **React 18**: Frontend framework with hooks and functional components
- **React Router DOM v6**: Client-side routing with role-based navigation

## Key Dependencies

- **@zxing/browser**: QR code scanning functionality
- **axios**: HTTP client for API communication
- **react-router-dom**: Routing and navigation

## Development Setup

```bash
npm install
npm run dev      # Start development server on port 5173
npm run build    # Build for production
npm run preview  # Preview production build
```

## Environment Configuration

- Environment variables prefixed with `VITE_`
- API base URL configured via `VITE_API_BASE_URL`
- Copy `.env.sample` to `.env` for local development

## Code Style & Conventions

- ES6+ modules with `"type": "module"` in package.json
- Functional components with React hooks
- JSX file extension for React components
- Single CSS file (`src/styles.css`) for global styles
- Consistent naming: PascalCase for components, camelCase for functions/variables
