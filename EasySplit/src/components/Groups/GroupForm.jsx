import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { CURRENCIES } from '../../types/index';

const GroupForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    currency: initialData?.currency || 'PKR'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('errors.required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Group name must be at least 2 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      currency: formData.currency
    };

    onSubmit(submitData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Group Name */}
      <Input
        label={t('groups.name')}
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
        placeholder="Enter group name"
        disabled={isLoading}
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('groups.description')}
          <span className="text-gray-400 ml-1">({t('common.optional')})</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter group description"
          rows={3}
          disabled={isLoading}
          className="input resize-none"
        />
        {errors.description && (
          <p className="text-sm text-danger-600 dark:text-danger-400 mt-1">
            {errors.description}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formData.description.length}/200 characters
        </p>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('groups.currency')}
        </label>
        <select
          value={formData.currency}
          onChange={(e) => handleChange('currency', e.target.value)}
          disabled={isLoading}
          className="input"
        >
          {CURRENCIES.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code} - {currency.name}
            </option>
          ))}
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          className="flex-1"
        >
          {initialData ? t('common.save') : t('common.add')}
        </Button>
      </div>
    </motion.form>
  );
};

export default GroupForm;
