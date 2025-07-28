import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  Palette,
  Globe,
  DollarSign,
  Bell,
  Info,
  Download,
  Upload,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Mail,
  MessageCircle,
  Github,
  Heart,
  Book,
  Clock,
  Database
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useNotificationStore from '../store/useNotificationStore';
import { useTheme } from '../components/Theme/ThemeProvider';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import UserGuide from '../components/Guide/UserGuide';
import ReminderManager from '../components/Reminders/ReminderManager';
import { CURRENCIES, LANGUAGES } from '../types/index';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, clearAllData, forceLoadSeedData, isLoading } = useAppStore();

  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showReminderManager, setShowReminderManager] = useState(false);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    updateSettings({ language });
  };

  const handleCurrencyChange = (currency) => {
    updateSettings({ defaultCurrency: currency });

    // Show notification
    const notificationStore = useNotificationStore.getState();
    notificationStore.notifyInfo(
      'Currency Updated',
      `Default currency changed to ${currency}. Current group currency updated automatically.`
    );
  };

  const handleNotificationToggle = (type) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type]
      }
    });
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData();
      setShowClearDataDialog(false);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };



  const exportData = () => {
    try {
      const { groups, participants, expenses, settlements } = useAppStore.getState();

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        data: {
          groups,
          participants,
          expenses,
          settlements,
          settings
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `easysplit-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification
      const notificationStore = useNotificationStore.getState();
      notificationStore.notifyInfo('Data Exported', 'Your data has been successfully exported to a JSON file.');
    } catch (error) {
      console.error('Export failed:', error);
      const notificationStore = useNotificationStore.getState();
      notificationStore.notifyError('Export Failed', 'Failed to export data. Please try again.');
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedData = JSON.parse(text);

        // Validate data structure
        if (!importedData.data || !importedData.version) {
          throw new Error('Invalid backup file format');
        }

        const { groups, participants, expenses, settlements, settings: importedSettings } = importedData.data;

        // Update store with imported data
        const store = useAppStore.getState();
        store.groups = groups || [];
        store.participants = participants || [];
        store.expenses = expenses || [];
        store.settlements = settlements || [];

        if (importedSettings) {
          updateSettings(importedSettings);
        }

        // Trigger re-render
        useAppStore.setState({
          groups: groups || [],
          participants: participants || [],
          expenses: expenses || [],
          settlements: settlements || []
        });

        // Show success notification
        const notificationStore = useNotificationStore.getState();
        notificationStore.notifyInfo(
          'Data Imported',
          `Successfully imported ${groups?.length || 0} groups, ${participants?.length || 0} participants, and ${expenses?.length || 0} expenses.`
        );

      } catch (error) {
        console.error('Import failed:', error);
        const notificationStore = useNotificationStore.getState();
        notificationStore.notifyError('Import Failed', 'Failed to import data. Please check the file format.');
      }
    };

    input.click();
  };

  const themeOptions = [
    { value: 'light', label: t('settings.themes.light'), icon: Sun },
    { value: 'dark', label: t('settings.themes.dark'), icon: Moon },
    { value: 'system', label: t('settings.themes.system'), icon: Monitor }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {t('settings.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
              Customize your EasySplit experience
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowUserGuide(true)}
          variant="secondary"
          icon={<Book className="w-4 h-4" />}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          User Guide
        </Button>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.theme')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    theme === option.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    theme === option.value
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    theme === option.value
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.label}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Language & Region */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Language & Region
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.language')}
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="input"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.currency')}
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="input"
              >
                {CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.notifications')}
            </h2>
          </div>

          <div className="space-y-4">
            {Object.entries(settings.notifications || {}).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about {key} activities
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationToggle(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Data Management
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button
              variant="secondary"
              onClick={exportData}
              icon={<Download className="w-4 h-4" />}
              fullWidth
              className="text-sm sm:text-base py-2 sm:py-3"
            >
              <span className="sm:hidden">Export</span>
              <span className="hidden sm:inline">{t('settings.export')}</span>
            </Button>

            <Button
              variant="secondary"
              onClick={importData}
              icon={<Upload className="w-4 h-4" />}
              fullWidth
              className="text-sm sm:text-base py-2 sm:py-3"
            >
              <span className="sm:hidden">Import</span>
              <span className="hidden sm:inline">{t('settings.import')}</span>
            </Button>

            <Button
              variant="primary"
              onClick={forceLoadSeedData}
              icon={<Database className="w-4 h-4" />}
              fullWidth
              className="text-sm sm:text-base py-2 sm:py-3"
            >
              <span className="sm:hidden">Demo Data</span>
              <span className="hidden sm:inline">Load Demo Data</span>
            </Button>

            <Button
              variant="danger"
              onClick={() => setShowClearDataDialog(true)}
              icon={<Trash2 className="w-4 h-4" />}
              fullWidth
              className="text-sm sm:text-base py-2 sm:py-3"
            >
              <span className="sm:hidden">Clear Data</span>
              <span className="hidden sm:inline">{t('settings.clearData')}</span>
            </Button>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> Clearing data will permanently remove all groups, expenses, and participants. This action cannot be undone.
            </p>
          </div>
        </motion.div>

        {/* WhatsApp Reminders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              WhatsApp Reminders
            </h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage your scheduled WhatsApp reminders for expense notifications and payment requests.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowReminderManager(true)}
              icon={<Bell className="w-4 h-4" />}
              fullWidth
            >
              View Active Reminders
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                const reminders = JSON.parse(localStorage.getItem('whatsappReminders') || '[]');
                const activeCount = reminders.filter(r => new Date(r.scheduledFor) > new Date()).length;
                alert(`You have ${activeCount} active WhatsApp reminders scheduled.`);
              }}
              icon={<MessageCircle className="w-4 h-4" />}
              fullWidth
            >
              Check Status
            </Button>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                How it works
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Schedule reminders when importing contacts. WhatsApp will automatically open at the scheduled time with your message ready to send. Perfect for debt collection and expense notifications!
            </p>
          </div>
        </motion.div>

        {/* Support & Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Support & Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              onClick={() => window.open('mailto:support@easysplit.app', '_blank')}
              icon={<Mail className="w-4 h-4" />}
              fullWidth
            >
              Email Support
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.open('https://wa.me/923001234567?text=Hi! I need help with EasySplit app.', '_blank')}
              icon={<MessageCircle className="w-4 h-4" />}
              fullWidth
              className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
            >
              WhatsApp Support
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.open('https://github.com/easysplit/easysplit-app', '_blank')}
              icon={<Github className="w-4 h-4" />}
              fullWidth
            >
              GitHub
            </Button>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Need Help?
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We're here to help! Contact us via email or WhatsApp for quick support.
              You can also check our GitHub repository for updates and documentation.
            </p>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('settings.about')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Version 1.0.0 • Built with React & Vite
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowAboutModal(true)}
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Clear Data Confirmation */}
      <ConfirmDialog
        isOpen={showClearDataDialog}
        onClose={() => setShowClearDataDialog(false)}
        onConfirm={handleClearAllData}
        title="Clear All Data"
        message={t('settings.confirmClearData')}
        confirmText="Clear All Data"
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isLoading}
      />

      {/* About Modal */}
      <Modal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="About EasySplit"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              EasySplit v1.0.0
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              A Progressive Web App for splitting expenses among groups
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Built with:</strong> React, Vite, Tailwind CSS, Zustand, Framer Motion
            </p>
            <p>
              <strong>Features:</strong> Offline support, Multi-group management, Flexible splitting, Debt optimization
            </p>
            <p>
              <strong>Storage:</strong> IndexedDB for offline data persistence
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              onClick={() => setShowAboutModal(false)}
              fullWidth
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* User Guide */}
      <UserGuide
        isOpen={showUserGuide}
        onClose={() => setShowUserGuide(false)}
      />

      {/* Reminder Manager */}
      <ReminderManager
        isOpen={showReminderManager}
        onClose={() => setShowReminderManager(false)}
      />
    </div>
  );
};

export default Settings;
