import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Receipt, 
  CreditCard, 
  BarChart3 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

const BottomNavigation = () => {
  const { t } = useTranslation();

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      exact: true
    },
    {
      name: 'Groups',
      href: '/groups',
      icon: Users
    },
    {
      name: 'People',
      href: '/participants',
      icon: Users
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: Receipt
    },
    {
      name: 'Debts',
      href: '/debts',
      icon: CreditCard
    }
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span className="text-xs mt-1 truncate max-w-full">
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNavigation;
