# Phase 1: Setup - Foundation & Basic Structure

> Establish the core technical foundation with a minimal working Electron + React application displaying basic UI layout.

**Duration**: 3-4 days  
**Goal**: Create a functioning desktop application shell with the three-panel layout and basic navigation.

---

## Success Criteria
- [ ] Electron app launches successfully on Windows/macOS/Linux
- [ ] Three-panel responsive layout renders correctly
- [ ] Basic routing and navigation works
- [ ] Development environment is fully configured
- [ ] All core dependencies are installed and configured

---

## 1. Project Initialization

### 1.1 Repository Setup
**Steps**:
1. Initialize Git repository with `.gitignore` for Node/Electron/React
2. Create directory structure as defined in `project-rules.md`
3. Set up branch protection rules for `main` branch
4. Create initial README.md with setup instructions
5. Configure ESLint and Prettier with TypeScript rules

### 1.2 Electron + React Scaffolding
**Steps**:
1. Initialize package.json with Electron Forge and Vite
2. Configure TypeScript with strict mode and path aliases
3. Set up Electron main process entry point (`src/main/index.ts`)
4. Create React renderer entry point (`src/renderer/index.tsx`)
5. Configure preload script with secure context bridge

### 1.3 Build Configuration
**Steps**:
1. Configure electron-builder for multi-platform builds
2. Set up Vite configuration for React + TypeScript
3. Configure hot reload for development
4. Create npm scripts for dev, build, and package
5. Test build process on target platform

---

## 2. UI Foundation

### 2.1 Three-Panel Layout Implementation
**Steps**:
1. Create main application layout component with CSS Grid
2. Implement responsive breakpoints (1200px, 1440px, 1920px)
3. Add panel resize functionality with drag handles
4. Create placeholder content for each panel
5. Test layout responsiveness at different window sizes

### 2.2 Theme System Setup
**Steps**:
1. Implement CSS custom properties from `theme-rules.md`
2. Create SCSS architecture with variables and mixins
3. Set up light/dark mode toggle functionality
4. Apply minimalist color palette to base components
5. Implement system font stack

### 2.3 Base Component Library
**Steps**:
1. Create Button component with primary/secondary/text variants
2. Create Card and Panel wrapper components
3. Implement basic form inputs (text, select)
4. Create loading skeleton components
5. Add basic icons using Unicode symbols

---

## 3. Core Infrastructure

### 3.1 State Management Setup
**Steps**:
1. Install and configure Zustand with TypeScript
2. Create base store structure for games and UI state
3. Implement devtools integration for debugging
4. Set up persistence middleware for selected state
5. Create helper hooks for common state access patterns

### 3.2 IPC Communication Layer
**Steps**:
1. Define typed IPC channel names and payloads
2. Create secure IPC handlers in main process
3. Implement renderer-side API wrapper functions
4. Add error handling for IPC calls
5. Test bi-directional communication

### 3.3 Database Foundation
**Steps**:
1. Install better-sqlite3 and configure for Electron
2. Create database initialization script
3. Implement basic schema (games and settings tables)
4. Create DatabaseManager singleton class
5. Test database read/write operations

---

## 4. Developer Experience

### 4.1 Development Tooling
**Steps**:
1. Configure VS Code workspace settings
2. Set up debugging configuration for main/renderer
3. Create development environment variables template
4. Implement logging system for debugging
5. Add performance monitoring in dev mode

### 4.2 Type System Foundation
**Steps**:
1. Create shared type definitions directory
2. Define basic interfaces (Game, Position, Move)
3. Set up type generation for IPC channels
4. Configure TypeScript path aliases
5. Add type checking to build process

---

## Deliverables

### Working Application
- Electron app that launches and displays three-panel layout
- Panels are responsive and can be resized
- Basic theme applied (minimalist design)
- Navigation between panels works

### Code Structure
```
holocoach/
├── src/
│   ├── main/
│   │   ├── index.ts         ✓ Main process entry
│   │   └── ipc/
│   │       └── handlers.ts  ✓ Basic IPC setup
│   │   ├── renderer/
│   │   │   ├── index.tsx        ✓ React app entry
│   │   │   ├── App.tsx          ✓ Main layout
│   │   │   ├── components/
│   │   │   │   ├── layout/      ✓ Panel components
│   │   │   │   └── common/      ✓ Base UI components
│   │   │   └── styles/
│   │   │   │   └── theme.scss   ✓ Theme implementation
│   │   │   └── shared/
│   │   │   │   └── types/           ✓ Basic type definitions
│   │   ├── package.json             ✓ All dependencies
│   │   ├── tsconfig.json           ✓ TypeScript config
│   │   └── electron-builder.json   ✓ Build configuration
│   └── README.md
```

### Documentation
- Updated README with development setup instructions
- Code documentation headers on all files
- Basic architecture decision records (ADRs)

---

## Known Limitations (To Address in MVP)
- No actual chess functionality
- No external API connections
- No game analysis capabilities
- Placeholder content in all panels
- No data persistence beyond basic setup

---

## Risks & Mitigations
- **Risk**: Electron security misconfiguration
  - **Mitigation**: Follow security best practices from tech-stack.md
- **Risk**: Performance issues with panel resizing
  - **Mitigation**: Implement debounced resize handlers
- **Risk**: TypeScript configuration complexity
  - **Mitigation**: Start with strict mode, relax if needed

---

This phase establishes a solid technical foundation that can be iteratively enhanced in subsequent phases. 