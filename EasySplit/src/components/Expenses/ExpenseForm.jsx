import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Receipt, DollarSign, Calendar, Tag, FileText, Camera, Users } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { EXPENSE_CATEGORIES, SPLIT_TYPES } from '../../types/index';
import { calculateExpenseSplits, validateExpenseSplits } from '../../utils/calculations';
import SplitSelector from './SplitSelector';
import ReceiptUpload from './ReceiptUpload';

const ExpenseForm = ({ 
  initialData = null, 
  participants = [],
  currency = 'PKR',
  groupId,
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    category: initialData?.category || 'Other',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    paidBy: initialData?.paidBy || [],
    splitType: initialData?.splits?.[0]?.type || SPLIT_TYPES.EQUAL,
    splits: initialData?.splits || [],
    notes: initialData?.notes || '',
    tags: initialData?.tags?.join(', ') || '',
    receiptImages: initialData?.receiptImages || []
  });

  const [errors, setErrors] = useState({});
  const [splitData, setSplitData] = useState({
    amounts: {},
    percentages: {}
  });

  // Initialize split data when participants or split type changes
  useEffect(() => {
    if (participants.length > 0 && formData.amount) {
      const amount = parseFloat(formData.amount);
      if (!isNaN(amount) && amount > 0) {
        try {
          const splits = calculateExpenseSplits(
            amount, 
            participants, 
            formData.splitType, 
            splitData
          );
          setFormData(prev => ({ ...prev, splits }));
        } catch (error) {
          console.error('Error calculating splits:', error);
        }
      }
    }
  }, [participants, formData.amount, formData.splitType, splitData]);

  const validateForm = () => {
    const newErrors = {};

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = t('errors.required');
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
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
    if (!formData.date) {
      newErrors.date = t('errors.required');
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      } else if (selectedDate < oneYearAgo) {
        newErrors.date = 'Date cannot be more than a year ago';
      }
    }

    // Paid by validation
    if (formData.paidBy.length === 0) {
      newErrors.paidBy = 'At least one person must pay for this expense';
    }

    // Split validation
    if (formData.splits.length > 0 && formData.amount) {
      const validation = validateExpenseSplits(
        formData.splits, 
        parseFloat(formData.amount), 
        formData.splitType
      );
      if (!validation.isValid) {
        newErrors.splits = validation.errors.join(', ');
      }
    }

    // Tags validation (optional)
    if (formData.tags) {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tags.some(tag => tag.length > 20)) {
        newErrors.tags = 'Each tag must be less than 20 characters';
      }
      if (tags.length > 10) {
        newErrors.tags = 'Maximum 10 tags allowed';
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

    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    const submitData = {
      groupId,
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: new Date(formData.date),
      paidBy: formData.paidBy,
      splits: formData.splits,
      notes: formData.notes.trim(),
      tags,
      receiptImages: formData.receiptImages,
      currency
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

  const handleSplitDataChange = (newSplitData) => {
    setSplitData(newSplitData);
  };

  const handleReceiptUpload = (images) => {
    setFormData(prev => ({
      ...prev,
      receiptImages: images
    }));
  };

  const handleReceiptOCR = (extractedData) => {
    if (extractedData.amount && !formData.amount) {
      handleChange('amount', extractedData.amount.toString());
    }
    if (extractedData.description && !formData.description) {
      handleChange('description', extractedData.description);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Receipt className="w-5 h-5 mr-2" />
          Expense Details
        </h3>

        {/* Description */}
        <Input
          label={t('expenses.description')}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          required
          placeholder="What was this expense for?"
          disabled={isLoading}
          icon={<FileText className="w-4 h-4" />}
          iconPosition="left"
        />

        {/* Amount and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('expenses.amount')}
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={errors.amount}
            required
            placeholder="0.00"
            disabled={isLoading}
            icon={<DollarSign className="w-4 h-4" />}
            iconPosition="left"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('expenses.category')}
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              disabled={isLoading}
              className="input"
            >
              {EXPENSE_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {t(`expenses.categories.${category.toLowerCase().replace(/[^a-z]/g, '')}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <Input
          label={t('expenses.date')}
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          error={errors.date}
          required
          disabled={isLoading}
          icon={<Calendar className="w-4 h-4" />}
          iconPosition="left"
        />
      </div>

      {/* Receipt Upload */}
      <ReceiptUpload
        images={formData.receiptImages}
        onImagesChange={handleReceiptUpload}
        onOCRResult={handleReceiptOCR}
        disabled={isLoading}
      />

      {/* Split Configuration */}
      <SplitSelector
        participants={participants}
        amount={parseFloat(formData.amount) || 0}
        paidBy={formData.paidBy}
        splitType={formData.splitType}
        splitData={splitData}
        splits={formData.splits}
        currency={currency}
        onPaidByChange={(paidBy) => handleChange('paidBy', paidBy)}
        onSplitTypeChange={(splitType) => handleChange('splitType', splitType)}
        onSplitDataChange={handleSplitDataChange}
        error={errors.paidBy || errors.splits}
        disabled={isLoading}
      />

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Additional Information
        </h3>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('expenses.notes')}
            <span className="text-gray-400 ml-1">({t('common.optional')})</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any additional notes about this expense"
            rows={3}
            disabled={isLoading}
            className="input resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.notes.length}/500 characters
          </p>
        </div>

        {/* Tags */}
        <Input
          label={t('expenses.tags')}
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          error={errors.tags}
          placeholder="Enter tags separated by commas (e.g., dinner, restaurant, birthday)"
          disabled={isLoading}
          icon={<Tag className="w-4 h-4" />}
          iconPosition="left"
          helperText="Separate multiple tags with commas"
        />
      </div>

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
          {initialData ? t('common.save') : t('common.add')}
        </Button>
      </div>
    </motion.form>
  );
};

export default ExpenseForm;
