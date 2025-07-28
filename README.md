# EasySplit - Progressive Web App Expense Splitter

A modern, feature-rich Progressive Web App for splitting expenses among groups, built with React, Vite, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Multi-Group Management**: Create and manage multiple expense groups
- **Flexible Expense Splitting**: Equal, fixed amount, and percentage-based splits
- **Multiple Payers**: Support for expenses paid by multiple people
- **Debt Optimization**: Smart algorithm to minimize payment transactions
- **Receipt OCR**: Extract text and amounts from receipt images using Tesseract.js
- **Offline Support**: Full offline functionality with IndexedDB storage

### User Experience
- **Progressive Web App**: Installable with offline support
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Theme**: System-aware theme with manual toggle
- **Multi-language**: English and Urdu support with react-i18next
- **Smooth Animations**: Framer Motion animations throughout the app
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Technical Features
- **Modern Tech Stack**: React 18, Vite, Tailwind CSS, Zustand
- **TypeScript-like JSDoc**: Comprehensive type definitions with JSDoc
- **PWA Optimized**: Service worker, manifest, and caching strategies
- **State Management**: Zustand with persistence and IndexedDB integration
- **Currency Support**: Multiple currencies with proper formatting
- **Data Export/Import**: Backup and restore functionality

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with persistence
- **Database**: IndexedDB with idb wrapper
- **PWA**: vite-plugin-pwa with Workbox
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Internationalization**: react-i18next
- **OCR**: Tesseract.js
- **Charts**: Chart.js with react-chartjs-2
- **Routing**: React Router DOM

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm)
- Modern web browser with PWA support

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EasySplit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Header, Sidebar, etc.)
│   ├── UI/             # Base UI components (Button, Input, Modal, etc.)
│   ├── Theme/          # Theme provider and utilities
│   └── PWA/            # PWA-specific components
├── pages/              # Page components
├── store/              # Zustand store configuration
├── utils/              # Utility functions
│   ├── storage.js      # IndexedDB utilities
│   ├── calculations.js # Expense and debt calculations
│   └── pwa.js          # PWA utilities
├── i18n/               # Internationalization
│   ├── config.js       # i18n configuration
│   └── locales/        # Translation files
├── types/              # Type definitions (JSDoc)
└── hooks/              # Custom React hooks
```

## 🎯 Usage

### Getting Started
1. **First Launch**: Complete the onboarding flow
2. **Create a Group**: Add your first expense group
3. **Add Participants**: Include people who will share expenses
4. **Record Expenses**: Add expenses with flexible splitting options
5. **Settle Debts**: View optimized settlement suggestions

### Key Features

#### Group Management
- Create multiple groups for different contexts (trips, roommates, etc.)
- Switch between groups easily
- Manage group participants

#### Expense Tracking
- Add expenses with descriptions, amounts, and categories
- Choose from three splitting methods:
  - **Equal Split**: Divide equally among all participants
  - **Fixed Amount**: Specify exact amounts for each person
  - **Percentage**: Split by custom percentages
- Support for multiple payers per expense
- Attach receipt images with OCR text extraction

#### Debt Settlement
- View optimized settlement plan to minimize transactions
- Mark debts as settled when paid
- Track settlement history

#### Analytics
- Visual spending insights with charts
- Category-wise expense breakdown
- Monthly spending trends
- Participant contribution analysis

## 🌐 PWA Features

### Installation
- Install directly from browser on supported devices
- Works offline after initial load
- App-like experience with standalone display mode

### Offline Support
- Full functionality without internet connection
- Data stored locally in IndexedDB
- Automatic sync when connection restored

### Performance
- Optimized bundle size with code splitting
- Efficient caching strategies
- Fast loading with Vite's optimizations

## 🎨 Customization

### Themes
- Light, dark, and system-aware themes
- Customizable color palette in `tailwind.config.js`
- CSS custom properties for dynamic theming

### Languages
- Add new languages in `src/i18n/locales/`
- Update language list in `src/types/index.js`
- Translations automatically applied throughout the app

### Currency Support
- Add new currencies in `src/types/index.js`
- Automatic formatting with Intl.NumberFormat
- Special handling for currencies like PKR

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- ESLint configuration for React
- Consistent component structure
- JSDoc type annotations
- Tailwind CSS utility classes

### Testing
- Component testing setup ready
- PWA testing utilities included
- Accessibility testing recommended

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **PWA Features**: Chrome, Edge, Safari (limited), Firefox (limited)
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- UI inspiration from modern expense tracking apps
- PWA best practices from [web.dev](https://web.dev/)

## 🐛 Known Issues

- OCR accuracy depends on image quality
- Some PWA features limited on iOS Safari
- IndexedDB storage limits vary by browser

## 🔮 Roadmap

- [ ] Real-time collaboration with WebRTC
- [ ] Cloud sync and backup
- [ ] Advanced analytics and reporting
- [ ] Integration with banking APIs
- [ ] Voice input for expenses
- [ ] Smart categorization with ML

---

For more information, please check the documentation or open an issue on GitHub.
