import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Receipt, 
  CreditCard, 
  BarChart3, 
  Settings,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import useAppStore from '../../store/useAppStore';

const Sidebar = ({ onClose }) => {
  const { t } = useTranslation();
  const { groups, currentGroupId } = useAppStore();

  const navigationItems = [
    {
      name: t('navigation.dashboard'),
      href: '/',
      icon: Home,
      exact: true
    },
    {
      name: t('navigation.groups'),
      href: '/groups',
      icon: Users
    },
    {
      name: t('participants.title'),
      href: '/participants',
      icon: Users
    },
    {
      name: t('navigation.expenses'),
      href: '/expenses',
      icon: Receipt
    },
    {
      name: t('navigation.debts'),
      href: '/debts',
      icon: CreditCard
    },
    {
      name: t('navigation.analytics'),
      href: '/analytics',
      icon: BarChart3
    },
    {
      name: t('navigation.settings'),
      href: '/settings',
      icon: Settings
    }
  ];

  const currentGroup = groups.find(g => g.id === currentGroupId);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('app.name')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('app.tagline')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Current Group Info */}
      {currentGroup && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('groups.current')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {currentGroup.name}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('app.name')} v1.0.0
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
