import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { promptInstall, isInstallable, isInstalled } from '../../utils/pwa';
import Button from '../UI/Button';

const PWAPrompt = () => {
  const { t } = useTranslation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (isInstalled()) {
      return;
    }

    // Listen for install prompt availability
    const handleInstallAvailable = () => {
      if (isInstallable()) {
        // Show prompt after a delay if not dismissed before
        const hasSeenPrompt = localStorage.getItem('easysplit-install-prompt-dismissed');
        if (!hasSeenPrompt) {
          setTimeout(() => {
            setShowPrompt(true);
          }, 3000); // Show after 3 seconds
        }
      }
    };

    // Listen for app updates
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    // Listen for successful installation
    const handleInstalled = () => {
      setShowPrompt(false);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Remember user dismissed the prompt
    localStorage.setItem('easysplit-install-prompt-dismissed', 'true');
  };

  const dismissUpdate = () => {
    setShowUpdate(false);
  };

  return (
    <>
      {/* Install Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 z-50 lg:bottom-6 lg:left-6 lg:right-auto lg:max-w-sm"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-3">
                    <Download className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {t('pwa.install')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Install EasySplit for quick access
                    </p>
                  </div>
                </div>
                <button
                  onClick={dismissPrompt}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1"
                >
                  Install
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissPrompt}
                  className="flex-1"
                >
                  Not now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Prompt */}
      <AnimatePresence>
        {showUpdate && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-4 right-4 z-50 lg:top-6 lg:left-6 lg:right-auto lg:max-w-sm"
          >
            <div className="bg-primary-600 text-white rounded-lg shadow-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">
                    {t('pwa.update')}
                  </h3>
                  <p className="text-sm text-primary-100">
                    {t('pwa.updateMessage')}
                  </p>
                </div>
                <button
                  onClick={dismissUpdate}
                  className="p-1 rounded-lg hover:bg-primary-700 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-primary-100" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleUpdate}
                  className="flex-1"
                >
                  Update
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissUpdate}
                  className="flex-1 text-white hover:bg-primary-700"
                >
                  Later
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAPrompt;
