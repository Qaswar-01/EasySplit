/**
 * PWA utilities for service worker management and app installation
 */

let deferredPrompt = null;
let swRegistration = null;

/**
 * Initialize PWA features
 */
export const initializePWA = () => {
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available');
    e.preventDefault();
    deferredPrompt = e;

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;

    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });

  // Service worker is registered by VitePWA plugin
  // Get existing registration if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      swRegistration = registration;
      console.log('Service Worker ready:', swRegistration);
    });
  }

  // Handle online/offline status
  window.addEventListener('online', () => {
    console.log('App is online');
    window.dispatchEvent(new CustomEvent('pwa-online'));
  });

  window.addEventListener('offline', () => {
    console.log('App is offline');
    window.dispatchEvent(new CustomEvent('pwa-offline'));
  });
};

// Service worker registration is handled by VitePWA plugin

/**
 * Prompt user to install PWA
 */
export const promptInstall = async () => {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('Install prompt failed:', error);
    return false;
  }
};

/**
 * Check if PWA is installable
 */
export const isInstallable = () => {
  return deferredPrompt !== null;
};

/**
 * Check if app is installed (running in standalone mode)
 */
export const isInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

/**
 * Update service worker
 */
export const updateServiceWorker = async () => {
  if (!swRegistration) {
    console.log('No service worker registration available');
    return false;
  }

  try {
    const newWorker = swRegistration.waiting;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Service worker update failed:', error);
    return false;
  }
};

/**
 * Get network status
 */
export const getNetworkStatus = () => {
  return {
    online: navigator.onLine,
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection
  };
};

/**
 * Share content using Web Share API
 */
export const shareContent = async (shareData) => {
  if (!navigator.share) {
    console.log('Web Share API not supported');
    return false;
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
};

/**
 * Request persistent storage
 */
export const requestPersistentStorage = async () => {
  if (!navigator.storage || !navigator.storage.persist) {
    console.log('Persistent storage not supported');
    return false;
  }

  try {
    const granted = await navigator.storage.persist();
    console.log(`Persistent storage ${granted ? 'granted' : 'denied'}`);
    return granted;
  } catch (error) {
    console.error('Persistent storage request failed:', error);
    return false;
  }
};

/**
 * Get storage usage estimate
 */
export const getStorageEstimate = async () => {
  if (!navigator.storage || !navigator.storage.estimate) {
    console.log('Storage estimate not supported');
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota,
      usage: estimate.usage,
      usagePercentage: estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0
    };
  } catch (error) {
    console.error('Storage estimate failed:', error);
    return null;
  }
};

/**
 * Clear app cache
 */
export const clearAppCache = async () => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('App cache cleared');
    }

    // Clear IndexedDB data
    if ('indexedDB' in window) {
      // This would be handled by the storage utility
      console.log('IndexedDB data should be cleared via storage utility');
    }

    return true;
  } catch (error) {
    console.error('Cache clear failed:', error);
    return false;
  }
};

/**
 * Check for app updates
 */
export const checkForUpdates = async () => {
  if (!swRegistration) {
    console.log('No service worker registration available');
    return false;
  }

  try {
    await swRegistration.update();
    console.log('Checked for service worker updates');
    return true;
  } catch (error) {
    console.error('Update check failed:', error);
    return false;
  }
};
