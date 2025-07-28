import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Settings, Sun, Moon, Monitor, Book } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import useNotificationStore from '../../store/useNotificationStore';
import { useTheme } from '../Theme/ThemeProvider';
import Button from '../UI/Button';
import NotificationPanel from '../Notifications/NotificationPanel';
import UserGuide from '../Guide/UserGuide';

const Header = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getCurrentGroup } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, togglePanel, isOpen } = useNotificationStore();
  const [showUserGuide, setShowUserGuide] = useState(false);

  const currentGroup = getCurrentGroup();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>

            {/* App Title & Current Group */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t('app.name')}
              </h1>
              {currentGroup && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentGroup.name}
                </p>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              icon={getThemeIcon()}
              aria-label="Toggle theme"
              className="p-2 focus:outline-none focus:ring-0"
            />

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePanel}
                icon={<Bell className="w-5 h-5" />}
                aria-label="Notifications"
                className="p-2 relative focus:outline-none focus:ring-0"
              >
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Panel */}
              {isOpen && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <NotificationPanel />
                </div>
              )}
            </div>

            {/* User Guide */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserGuide(true)}
              icon={<Book className="w-5 h-5" />}
              aria-label="User Guide"
              className="p-2 focus:outline-none focus:ring-0"
            />

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              icon={<Settings className="w-5 h-5" />}
              aria-label="Settings"
              className="p-2 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* User Guide Modal */}
      <UserGuide
        isOpen={showUserGuide}
        onClose={() => setShowUserGuide(false)}
      />
    </motion.header>
  );
};

export default Header;
