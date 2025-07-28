import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, User } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import Button from '../UI/Button';
import DebtReminder from './DebtReminder';

const DebtCard = ({
  debt,
  participants = [],
  currency = 'PKR',
  onSettle,
  onReminderSet,
  delay = 0
}) => {
  const getParticipantName = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : 'Unknown';
  };

  const getParticipantInitials = (id) => {
    const name = getParticipantName(id);
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    const hash = id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const fromName = getParticipantName(debt.fromId);
  const toName = getParticipantName(debt.toId);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay }}
      className="card p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        {/* Debt Flow Visualization */}
        <div className="flex items-center space-x-4 flex-1">
          {/* From Person */}
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getAvatarColor(debt.fromId)} rounded-full flex items-center justify-center text-white font-semibold`}>
              {getParticipantInitials(debt.fromId)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {fromName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Owes
              </p>
            </div>
          </div>

          {/* Arrow and Amount */}
          <div className="flex items-center space-x-3">
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(debt.amount, currency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Amount
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* To Person */}
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${getAvatarColor(debt.toId)} rounded-full flex items-center justify-center text-white font-semibold`}>
              {getParticipantInitials(debt.toId)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {toName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Is owed
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="ml-6 space-y-2">
          <Button
            onClick={onSettle}
            variant="success"
            icon={<CheckCircle className="w-4 h-4" />}
            className="whitespace-nowrap w-full"
          >
            Settle Up
          </Button>

          <DebtReminder
            debt={debt}
            participants={participants}
            currency={currency}
            onReminderSet={onReminderSet}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${getAvatarColor(debt.fromId)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
              {getParticipantInitials(debt.fromId)}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {fromName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Owes
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="flex items-center space-x-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100 text-right">
                {toName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                Is owed
              </p>
            </div>
            <div className={`w-10 h-10 ${getAvatarColor(debt.toId)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
              {getParticipantInitials(debt.toId)}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-3">
            {formatCurrency(debt.amount, currency)}
          </p>
          <Button
            onClick={onSettle}
            variant="success"
            icon={<CheckCircle className="w-4 h-4" />}
            fullWidth
          >
            Settle Up
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DebtCard;
