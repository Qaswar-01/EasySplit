# EasySplit Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all the required dependencies including:
- React 18 and React DOM
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- Framer Motion (animations)
- Lucide React (icons)
- react-i18next (internationalization)
- And many more...

### 2. Start Development Server

```bash
npm run dev
```

This will start the development server at `http://localhost:5173` (or another available port).

### 3. Open in Browser

Navigate to the URL shown in your terminal (usually `http://localhost:5173`) to see the app running.

## Development Workflow

### Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build the app for production
- **`npm run preview`** - Preview the production build locally
- **`npm run lint`** - Run ESLint to check code quality

### Project Structure Overview

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (Dashboard, Groups, etc.)
├── store/         # Zustand state management
├── utils/         # Utility functions
├── i18n/          # Internationalization files
├── types/         # Type definitions
└── main.jsx       # App entry point
```

## Key Features Implemented

### ✅ Completed Features

1. **Project Setup & Configuration**
   - React + Vite project structure
   - Tailwind CSS configuration
   - PWA configuration with vite-plugin-pwa
   - ESLint setup

2. **Core State Management**
   - Zustand store with persistence
   - IndexedDB integration for offline storage
   - Data models for groups, participants, expenses

3. **UI Foundation & Theme System**
   - Dark/light theme support with system detection
   - Responsive layout with mobile-first design
   - Base UI components (Button, Input, Modal, etc.)
   - Layout components (Header, Sidebar, Navigation)

4. **PWA Features**
   - Service worker registration
   - App manifest for installability
   - Offline support utilities
   - Install prompt component

5. **Internationalization**
   - English and Urdu language support
   - react-i18next configuration
   - Translation files structure

### 🚧 Next Steps (Remaining Tasks)

The following components and features are ready to be implemented:

1. **Group Management Components**
   - GroupList and GroupForm components
   - Group switching functionality
   - CRUD operations with animations

2. **Participant Management**
   - ParticipantList and ParticipantForm
   - Add/edit/delete participants
   - Form validation

3. **Expense Management**
   - ExpenseForm with flexible splitting
   - ExpenseList with filtering and search
   - Receipt image handling

4. **Receipt OCR Integration**
   - Tesseract.js integration
   - Image preview and text extraction
   - Amount parsing from receipts

5. **Debt Calculation & Settlement**
   - Debt optimization algorithms
   - Settlement tracking
   - Payment reminders

6. **Analytics Dashboard**
   - Chart.js integration
   - Spending insights and trends
   - Category breakdowns

7. **User Onboarding**
   - Guided tour implementation
   - Help system and tooltips
   - First-time user experience

## Development Tips

### Theme Development
- Modify colors in `tailwind.config.js`
- Theme switching handled by `ThemeProvider`
- CSS custom properties for dynamic theming

### Adding New Languages
1. Create new translation file in `src/i18n/locales/`
2. Add language to `LANGUAGES` array in `src/types/index.js`
3. Update language detector configuration

### State Management
- Use Zustand store for global state
- IndexedDB for persistent offline storage
- Local storage for settings and preferences

### Component Development
- Follow existing component patterns
- Use Framer Motion for animations
- Implement proper accessibility features

## Troubleshooting

### Common Issues

1. **Dependencies not installing**
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then reinstall

2. **Development server not starting**
   - Check if port 5173 is available
   - Try different port: `npm run dev -- --port 3000`

3. **Build errors**
   - Check for TypeScript-like errors in JSDoc comments
   - Ensure all imports are correct

4. **PWA features not working**
   - PWA features only work in production build
   - Use `npm run build && npm run preview` to test

### Browser Support

- **Development**: Modern browsers with ES modules support
- **Production**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **PWA Features**: Best support in Chrome/Edge, limited in Safari/Firefox

## Next Development Phase

To continue development, focus on implementing the remaining tasks in order:

1. Start with Group Management (most fundamental)
2. Add Participant Management
3. Implement Expense Management
4. Add advanced features (OCR, Analytics, etc.)

Each component should follow the established patterns and include:
- Proper error handling
- Loading states
- Animations with Framer Motion
- Accessibility features
- Mobile-responsive design

## Getting Help

- Check the main README.md for detailed feature documentation
- Review existing components for implementation patterns
- Use browser dev tools for debugging PWA features
- Test offline functionality by disabling network in dev tools

Happy coding! 🚀
