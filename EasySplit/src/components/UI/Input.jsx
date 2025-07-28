import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  required = false,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}, ref) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">
              {icon}
            </span>
          </div>
        )}
        
        <motion.input
          ref={ref}
          id={inputId}
          type={type}
          className={clsx(
            'input',
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            hasError && 'border-danger-300 dark:border-danger-600 focus:ring-danger-500',
            className
          )}
          initial={false}
          animate={{
            borderColor: hasError ? '#ef4444' : undefined
          }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">
              {icon}
            </span>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="w-5 h-5 text-danger-500" />
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1"
        >
          {error && (
            <p className="text-sm text-danger-600 dark:text-danger-400">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {helperText}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
