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
      className="card p-4 sm:p-6 hover:shadow-md transition-all duration-200"
    >
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
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
      <div className="md:hidden space-y-4">
        {/* Amount Display */}
        <div className="text-center bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount to settle</p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(debt.amount, currency)}
          </p>
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-12 h-12 ${getAvatarColor(debt.fromId)} rounded-full flex items-center justify-center text-white font-semibold`}>
              {getParticipantInitials(debt.fromId)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {fromName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Owes money
              </p>
            </div>
          </div>

          <div className="mx-4">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-1 text-right">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {toName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Should receive
              </p>
            </div>
            <div className={`w-12 h-12 ${getAvatarColor(debt.toId)} rounded-full flex items-center justify-center text-white font-semibold`}>
              {getParticipantInitials(debt.toId)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onSettle}
            variant="success"
            icon={<CheckCircle className="w-4 h-4" />}
            fullWidth
            className="py-3"
          >
            Mark as Settled
          </Button>

          <div className="w-full">
            <DebtReminder
              debt={debt}
              participants={participants}
              currency={currency}
              onReminderSet={onReminderSet}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DebtCard;
