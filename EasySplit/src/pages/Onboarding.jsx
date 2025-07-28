import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useAppStore from '../store/useAppStore';
import Button from '../components/UI/Button';

const Onboarding = () => {
  const { t } = useTranslation();
  const { updateSettings } = useAppStore();

  const handleComplete = () => {
    updateSettings({ showOnboarding: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span className="text-3xl">💰</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
        >
          {t('onboarding.welcome')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-400 mb-8"
        >
          Split expenses with friends and family easily. Track who owes what and settle up with just a few taps.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleComplete}
            size="lg"
            fullWidth
          >
            {t('onboarding.finish')}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
