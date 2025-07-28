import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Zap, Wifi, Star } from 'lucide-react';
import Button from '../UI/Button';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari, show manual install instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.navigator.standalone;
    
    if (isIOS && !isInStandaloneMode && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } else {
      // Show manual install instructions for iOS
      setShowPrompt(false);
      // You could show a modal with iOS install instructions here
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Install EasySplit</h3>
                <p className="text-blue-100 text-sm">Get the app experience!</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Works Offline</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Lightning Fast</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Native Feel</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {isIOS 
                  ? "Tap Share → Add to Home Screen" 
                  : "Install for faster access and offline use"
                }
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="flex-1 text-gray-600 hover:text-gray-800"
                  size="sm"
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  icon={isIOS ? <Smartphone className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  size="sm"
                >
                  {isIOS ? "How to Install" : "Install App"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
