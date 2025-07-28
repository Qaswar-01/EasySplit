import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
    white: 'text-white'
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <motion.div
        className={clsx(
          'border-2 border-current border-t-transparent rounded-full',
          sizeClasses[size],
          colorClasses[color]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            'mt-2 text-sm font-medium',
            colorClasses[color]
          )}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
