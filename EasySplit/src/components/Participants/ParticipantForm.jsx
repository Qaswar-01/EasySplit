import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Mail } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';

const ParticipantForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t('errors.required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = t('errors.invalidEmail');
      }
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
      email: formData.email.trim() || null
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
      {/* Name */}
      <Input
        label={t('participants.name')}
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
        placeholder="Enter participant name"
        disabled={isLoading}
        icon={<User className="w-4 h-4" />}
        iconPosition="left"
      />

      {/* Email */}
      <Input
        label={t('participants.email')}
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        placeholder="Enter email address (optional)"
        disabled={isLoading}
        icon={<Mail className="w-4 h-4" />}
        iconPosition="left"
        helperText="Email is optional but useful for notifications"
      />

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

export default ParticipantForm;
