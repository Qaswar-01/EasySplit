import { motion } from 'framer-motion';
import { Calendar, Edit, Trash2, Tag, FileText, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import Button from '../UI/Button';

const ExpenseCard = ({
  expense,
  participants = [],
  currency = 'PKR',
  onEdit,
  onDelete,
  delay = 0
}) => {
  // Safety check for expense object
  if (!expense) {
    return null;
  }

  const getParticipantName = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : 'Unknown';
  };

  const getPaidByNames = () => {
    // Handle both array and string formats for backward compatibility
    if (!expense.paidBy) {
      return 'Unknown';
    }

    if (Array.isArray(expense.paidBy)) {
      return expense.paidBy.map(id => getParticipantName(id)).join(', ');
    } else if (typeof expense.paidBy === 'string') {
      return getParticipantName(expense.paidBy);
    } else {
      return 'Unknown';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Transportation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Shopping': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Bills & Utilities': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Travel': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Healthcare': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'Education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Groceries': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  const getSplitTypeDisplay = () => {
    // Safety check for splits array
    if (!expense.splits || !Array.isArray(expense.splits) || expense.splits.length === 0) {
      return 'No split';
    }

    const firstSplit = expense.splits[0];
    if (!firstSplit || !firstSplit.type) {
      return 'Custom split';
    }

    switch (firstSplit.type) {
      case 'equal':
        return 'Split equally';
      case 'fixed':
        return 'Fixed amounts';
      case 'percentage':
        return 'By percentage';
      default:
        return 'Custom split';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay }}
      className="card p-6 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {expense.description || 'Untitled Expense'}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category || 'Other')}`}>
              {expense.category || 'Other'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Paid by {getPaidByNames()}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(expense.amount || 0, currency)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {getSplitTypeDisplay()}
          </div>
        </div>
      </div>

      {/* Split Details */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Split Details
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {(expense.splits && Array.isArray(expense.splits) ? expense.splits : []).map(split => (
            <div 
              key={split.participantId}
              className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {getParticipantName(split.participantId)}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(split.amount, currency)}
                {split.type === 'percentage' && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({split.percentage}%)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes and Tags */}
      {(expense.notes || expense.tags?.length > 0) && (
        <div className="mb-4 space-y-2">
          {expense.notes && (
            <div className="flex items-start">
              <FileText className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {expense.notes}
              </p>
            </div>
          )}
          
          {expense.tags?.length > 0 && (
            <div className="flex items-center flex-wrap gap-1">
              <Tag className="w-4 h-4 text-gray-400 mr-1" />
              {expense.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Created {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : 'Unknown'}
          {expense.updatedAt && expense.updatedAt !== expense.createdAt && (
            <span> • Updated {new Date(expense.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="p-2"
            aria-label="Edit expense"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            aria-label="Delete expense"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpenseCard;
