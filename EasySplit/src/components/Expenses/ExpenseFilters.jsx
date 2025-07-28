import { motion } from 'framer-motion';
import { Filter, X, Calendar, Users, DollarSign, Tag } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../types/index';
import Button from '../UI/Button';
import Input from '../UI/Input';

const ExpenseFilters = ({
  filters = {},
  onFiltersChange,
  participants = [],
  onClear
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="card p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filter Expenses
          </h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            icon={<X className="w-4 h-4" />}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Participant Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Participant
          </label>
          <select
            value={filters.participant || ''}
            onChange={(e) => handleFilterChange('participant', e.target.value)}
            className="input"
          >
            <option value="">All Participants</option>
            {participants.map(participant => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            From Date
          </label>
          <Input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            To Date
          </label>
          <Input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Min Amount
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={filters.minAmount || ''}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Max Amount
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={filters.maxAmount || ''}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active filters:
            </span>
            
            {filters.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Category: {filters.category}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.participant && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Participant: {participants.find(p => p.id === filters.participant)?.name}
                <button
                  onClick={() => handleFilterChange('participant', '')}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.dateFrom && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                From: {new Date(filters.dateFrom).toLocaleDateString()}
                <button
                  onClick={() => handleFilterChange('dateFrom', '')}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.dateTo && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                To: {new Date(filters.dateTo).toLocaleDateString()}
                <button
                  onClick={() => handleFilterChange('dateTo', '')}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.minAmount && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Min: {filters.minAmount}
                <button
                  onClick={() => handleFilterChange('minAmount', '')}
                  className="ml-1 hover:text-orange-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.maxAmount && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                Max: {filters.maxAmount}
                <button
                  onClick={() => handleFilterChange('maxAmount', '')}
                  className="ml-1 hover:text-orange-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ExpenseFilters;
