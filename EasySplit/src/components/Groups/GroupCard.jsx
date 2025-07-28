import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users, Edit, Trash2, Check, Calendar } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import Button from '../UI/Button';
import { formatCurrency } from '../../utils/calculations';

const GroupCard = ({ 
  group, 
  isActive, 
  onSwitch, 
  onEdit, 
  onDelete, 
  delay = 0 
}) => {
  const { t } = useTranslation();
  const { getGroupParticipants, getGroupExpenses } = useAppStore();

  const participants = getGroupParticipants(group.id);
  const expenses = getGroupExpenses(group.id);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Generate colorful group icon based on group name
  const getGroupColor = (name) => {
    const colors = [
      'from-red-400 to-pink-500',
      'from-blue-400 to-indigo-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-purple-400 to-violet-500',
      'from-teal-400 to-cyan-500',
      'from-rose-400 to-pink-500',
      'from-indigo-400 to-purple-500'
    ];
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getGroupEmoji = (name) => {
    const emojis = ['🎉', '🏠', '✈️', '🍕', '🎬', '🏖️', '🎵', '💼', '🎮', '🏃'];
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return emojis[Math.abs(hash) % emojis.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay }}
      className={`card p-6 cursor-pointer transition-all duration-300 ${
        isActive
          ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-lg'
          : 'hover:shadow-lg'
      }`}
      onClick={(e) => {
        console.log('Group card clicked:', group.name);
        onSwitch();
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Colorful Group Icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGroupColor(group.name)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {getGroupEmoji(group.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {group.name}
              </h3>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </div>
            {group.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {group.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 ml-2 relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Edit button clicked for group:', group.name);
              onEdit();
            }}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 hover:scale-110 active:scale-95 rounded-lg"
            aria-label="Edit group"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Delete button clicked for group:', group.name);
              onDelete();
            }}
            className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-100 dark:hover:bg-danger-900/30 transition-all duration-200 hover:scale-110 active:scale-95 rounded-lg"
            aria-label="Delete group"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mx-auto mb-2 shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {participants.length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {t('groups.participants')}
          </p>
        </div>

        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 dark:border-green-700/50">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mx-auto mb-2 shadow-lg">
            <span className="text-white font-bold text-sm">
              {group.currency}
            </span>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {formatCurrency(totalExpenses, group.currency)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Total Spent
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          Created {new Date(group.createdAt).toLocaleDateString()}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-b-lg"
        />
      )}
    </motion.div>
  );
};

export default GroupCard;
