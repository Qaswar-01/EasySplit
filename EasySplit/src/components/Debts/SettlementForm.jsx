import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { DollarSign, Users, FileText, Calendar } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { formatCurrency } from '../../utils/calculations';

const SettlementForm = ({ 
  participants = [],
  currency = 'PKR',
  initialDebt = null,
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    fromId: initialDebt?.fromId || '',
    toId: initialDebt?.toId || '',
    amount: initialDebt?.amount?.toString() || '',
    notes: '',
    settledAt: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialDebt) {
      setFormData(prev => ({
        ...prev,
        fromId: initialDebt.fromId,
        toId: initialDebt.toId,
        amount: initialDebt.amount.toString()
      }));
    }
  }, [initialDebt]);

  const validateForm = () => {
    const newErrors = {};

    // From participant validation
    if (!formData.fromId) {
      newErrors.fromId = 'Please select who is paying';
    }

    // To participant validation
    if (!formData.toId) {
      newErrors.toId = 'Please select who is being paid';
    } else if (formData.fromId === formData.toId) {
      newErrors.toId = 'Payer and recipient cannot be the same person';
    }

    // Amount validation
    if (!formData.amount) {
      newErrors.amount = t('errors.required');
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = t('errors.invalidAmount');
      } else if (amount > 1000000) {
        newErrors.amount = 'Amount cannot exceed 1,000,000';
      }
    }

    // Date validation
    if (!formData.settledAt) {
      newErrors.settledAt = t('errors.required');
    } else {
      const selectedDate = new Date(formData.settledAt);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (selectedDate > today) {
        newErrors.settledAt = 'Settlement date cannot be in the future';
      } else if (selectedDate < oneYearAgo) {
        newErrors.settledAt = 'Settlement date cannot be more than a year ago';
      }
    }

    // Notes validation (optional)
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
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
      fromId: formData.fromId,
      toId: formData.toId,
      amount: parseFloat(formData.amount),
      currency,
      notes: formData.notes.trim(),
      settledAt: new Date(formData.settledAt)
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

  const getParticipantName = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : 'Unknown';
  };

  const availableParticipants = participants.filter(p => p.id !== formData.fromId);
  const availablePayers = participants.filter(p => p.id !== formData.toId);

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Settlement Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Settlement Details
        </h3>

        {/* Who is paying */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Who is paying? *
          </label>
          <select
            value={formData.fromId}
            onChange={(e) => handleChange('fromId', e.target.value)}
            disabled={isLoading || (initialDebt && initialDebt.fromId)}
            className={`input ${errors.fromId ? 'border-danger-300 dark:border-danger-600' : ''}`}
          >
            <option value="">Select person paying</option>
            {availablePayers.map(participant => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
          {errors.fromId && (
            <p className="text-sm text-danger-600 dark:text-danger-400 mt-1">
              {errors.fromId}
            </p>
          )}
        </div>

        {/* Who is being paid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Who is being paid? *
          </label>
          <select
            value={formData.toId}
            onChange={(e) => handleChange('toId', e.target.value)}
            disabled={isLoading || (initialDebt && initialDebt.toId)}
            className={`input ${errors.toId ? 'border-danger-300 dark:border-danger-600' : ''}`}
          >
            <option value="">Select person being paid</option>
            {availableParticipants.map(participant => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
          {errors.toId && (
            <p className="text-sm text-danger-600 dark:text-danger-400 mt-1">
              {errors.toId}
            </p>
          )}
        </div>

        {/* Amount and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Settlement Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={errors.amount}
            required
            placeholder="0.00"
            disabled={isLoading || (initialDebt && initialDebt.amount)}
            icon={<DollarSign className="w-4 h-4" />}
            iconPosition="left"
            helperText={`Amount in ${currency}`}
          />

          <Input
            label="Settlement Date"
            type="date"
            value={formData.settledAt}
            onChange={(e) => handleChange('settledAt', e.target.value)}
            error={errors.settledAt}
            required
            disabled={isLoading}
            icon={<Calendar className="w-4 h-4" />}
            iconPosition="left"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <FileText className="w-4 h-4 inline mr-1" />
            Settlement Notes
            <span className="text-gray-400 ml-1">({t('common.optional')})</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any notes about this settlement (e.g., payment method, reference number)"
            rows={3}
            disabled={isLoading}
            className={`input resize-none ${errors.notes ? 'border-danger-300 dark:border-danger-600' : ''}`}
            maxLength={500}
          />
          {errors.notes && (
            <p className="text-sm text-danger-600 dark:text-danger-400 mt-1">
              {errors.notes}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.notes.length}/500 characters
          </p>
        </div>
      </div>

      {/* Settlement Preview */}
      {formData.fromId && formData.toId && formData.amount && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
        >
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
            Settlement Summary
          </h4>
          <p className="text-green-800 dark:text-green-200">
            <span className="font-medium">{getParticipantName(formData.fromId)}</span>
            {' '}pays{' '}
            <span className="font-medium">{formatCurrency(parseFloat(formData.amount) || 0, currency)}</span>
            {' '}to{' '}
            <span className="font-medium">{getParticipantName(formData.toId)}</span>
          </p>
        </motion.div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
          Record Settlement
        </Button>
      </div>
    </motion.form>
  );
};

export default SettlementForm;
