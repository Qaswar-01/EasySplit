import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, Percent, Calculator, AlertCircle } from 'lucide-react';
import { SPLIT_TYPES } from '../../types/index';
import { formatCurrency } from '../../utils/calculations';
import Button from '../UI/Button';
import Input from '../UI/Input';

const SplitSelector = ({
  participants = [],
  amount = 0,
  paidBy = [],
  splitType = SPLIT_TYPES.EQUAL,
  splitData = { amounts: {}, percentages: {} },
  splits = [],
  currency = 'PKR',
  onPaidByChange,
  onSplitTypeChange,
  onSplitDataChange,
  error = null,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [localSplitData, setLocalSplitData] = useState(splitData);

  useEffect(() => {
    setLocalSplitData(splitData);
  }, [splitData]);

  const handlePaidByToggle = (participantId) => {
    const newPaidBy = paidBy.includes(participantId)
      ? paidBy.filter(id => id !== participantId)
      : [...paidBy, participantId];
    onPaidByChange(newPaidBy);
  };

  const handleSplitTypeChange = (newSplitType) => {
    onSplitTypeChange(newSplitType);
    
    // Reset split data when changing type
    const newSplitData = { amounts: {}, percentages: {} };
    
    if (newSplitType === SPLIT_TYPES.FIXED) {
      // Initialize with equal amounts
      const equalAmount = amount / participants.length;
      participants.forEach(participant => {
        newSplitData.amounts[participant.id] = equalAmount.toFixed(2);
      });
    } else if (newSplitType === SPLIT_TYPES.PERCENTAGE) {
      // Initialize with equal percentages
      const equalPercentage = (100 / participants.length).toFixed(2);
      participants.forEach(participant => {
        newSplitData.percentages[participant.id] = equalPercentage;
      });
    }
    
    setLocalSplitData(newSplitData);
    onSplitDataChange(newSplitData);
  };

  const handleAmountChange = (participantId, value) => {
    const newSplitData = {
      ...localSplitData,
      amounts: {
        ...localSplitData.amounts,
        [participantId]: value
      }
    };
    setLocalSplitData(newSplitData);
    onSplitDataChange(newSplitData);
  };

  const handlePercentageChange = (participantId, value) => {
    const newSplitData = {
      ...localSplitData,
      percentages: {
        ...localSplitData.percentages,
        [participantId]: value
      }
    };
    setLocalSplitData(newSplitData);
    onSplitDataChange(newSplitData);
  };

  const distributeEqually = () => {
    if (splitType === SPLIT_TYPES.FIXED) {
      const equalAmount = (amount / participants.length).toFixed(2);
      const newAmounts = {};
      participants.forEach(participant => {
        newAmounts[participant.id] = equalAmount;
      });
      const newSplitData = { ...localSplitData, amounts: newAmounts };
      setLocalSplitData(newSplitData);
      onSplitDataChange(newSplitData);
    } else if (splitType === SPLIT_TYPES.PERCENTAGE) {
      const equalPercentage = (100 / participants.length).toFixed(2);
      const newPercentages = {};
      participants.forEach(participant => {
        newPercentages[participant.id] = equalPercentage;
      });
      const newSplitData = { ...localSplitData, percentages: newPercentages };
      setLocalSplitData(newSplitData);
      onSplitDataChange(newSplitData);
    }
  };

  // Calculate totals for validation
  const totalFixedAmount = Object.values(localSplitData.amounts || {})
    .reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
  
  const totalPercentage = Object.values(localSplitData.percentages || {})
    .reduce((sum, percentage) => sum + (parseFloat(percentage) || 0), 0);

  const getParticipantName = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : 'Unknown';
  };

  const getSplitAmount = (participantId) => {
    const split = splits.find(s => s.participantId === participantId);
    return split ? split.amount : 0;
  };

  if (participants.length === 0) {
    return (
      <div className="card p-6 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Add participants to the group first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Payment & Split
        </h3>
        {error && (
          <div className="flex items-center text-danger-600 dark:text-danger-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
      </div>

      {/* Who Paid */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('expenses.paidBy')} *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {participants.map(participant => (
            <motion.button
              key={participant.id}
              type="button"
              onClick={() => handlePaidByToggle(participant.id)}
              disabled={disabled}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                paidBy.includes(participant.id)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                  paidBy.includes(participant.id)
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {paidBy.includes(participant.id) && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-medium">{participant.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Split Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('expenses.splitType')} *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.values(SPLIT_TYPES).map(type => (
            <Button
              key={type}
              type="button"
              variant={splitType === type ? 'primary' : 'secondary'}
              onClick={() => handleSplitTypeChange(type)}
              disabled={disabled}
              className="justify-center"
              icon={
                type === SPLIT_TYPES.EQUAL ? <Users className="w-4 h-4" /> :
                type === SPLIT_TYPES.FIXED ? <DollarSign className="w-4 h-4" /> :
                <Percent className="w-4 h-4" />
              }
            >
              {t(`expenses.splitTypes.${type}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Split Details */}
      <AnimatePresence mode="wait">
        {splitType === SPLIT_TYPES.EQUAL && (
          <motion.div
            key="equal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-4 bg-blue-50 dark:bg-blue-900/20"
          >
            <div className="flex items-center mb-3">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                Equal Split
              </span>
            </div>
            <div className="space-y-2">
              {participants.map(participant => (
                <div key={participant.id} className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">{participant.name}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(getSplitAmount(participant.id), currency)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {splitType === SPLIT_TYPES.FIXED && (
          <motion.div
            key="fixed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fixed Amounts
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={distributeEqually}
                disabled={disabled}
              >
                Distribute Equally
              </Button>
            </div>
            
            <div className="space-y-3">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center space-x-3">
                  <span className="w-24 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {participant.name}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={localSplitData.amounts?.[participant.id] || ''}
                    onChange={(e) => handleAmountChange(participant.id, e.target.value)}
                    placeholder="0.00"
                    disabled={disabled}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total:
              </span>
              <span className={`font-semibold ${
                Math.abs(totalFixedAmount - amount) < 0.01
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-danger-600 dark:text-danger-400'
              }`}>
                {formatCurrency(totalFixedAmount, currency)} / {formatCurrency(amount, currency)}
              </span>
            </div>
          </motion.div>
        )}

        {splitType === SPLIT_TYPES.PERCENTAGE && (
          <motion.div
            key="percentage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Percentage Split
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={distributeEqually}
                disabled={disabled}
              >
                Distribute Equally
              </Button>
            </div>
            
            <div className="space-y-3">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center space-x-3">
                  <span className="w-24 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {participant.name}
                  </span>
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={localSplitData.percentages?.[participant.id] || ''}
                      onChange={(e) => handlePercentageChange(participant.id, e.target.value)}
                      placeholder="0.00"
                      disabled={disabled}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 text-right">
                      {formatCurrency(getSplitAmount(participant.id), currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total:
              </span>
              <span className={`font-semibold ${
                Math.abs(totalPercentage - 100) < 0.01
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-danger-600 dark:text-danger-400'
              }`}>
                {totalPercentage.toFixed(2)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplitSelector;
