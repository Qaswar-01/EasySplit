import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// Store
import useAppStore from './store/useAppStore';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';
import ErrorBoundary from './components/UI/ErrorBoundary';
import PWAPrompt from './components/PWA/PWAPrompt';
import PWAInstallPrompt from './components/PWA/PWAInstallPrompt';
import ThemeProvider from './components/Theme/ThemeProvider';

// Pages
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Participants from './pages/Participants';
import Expenses from './pages/Expenses';
import Debts from './pages/Debts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';

// Utils
import { initializePWA } from './utils/pwa';

function App() {
  const { i18n } = useTranslation();
  const { 
    isLoading, 
    error, 
    settings, 
    initializeApp,
    clearError 
  } = useAppStore();

  useEffect(() => {
    // Initialize PWA features
    initializePWA();
    
    // Initialize app data
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    // Set language from settings
    if (settings.language && i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  // Show loading spinner during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show onboarding for first-time users
  if (settings.showOnboarding) {
    return (
      <ThemeProvider>
        <ErrorBoundary>
          <Onboarding />
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-all duration-500 relative">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-30 dark:opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
              <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>
            </div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="fixed top-4 left-4 right-4 z-50"
                >
                  <div className="bg-danger-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button
                      onClick={clearError}
                      className="ml-4 text-white hover:text-gray-200 transition-colors"
                      aria-label="Close error"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/participants" element={<Participants />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/debts" element={<Debts />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>

            <PWAPrompt />
            <PWAInstallPrompt />
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
