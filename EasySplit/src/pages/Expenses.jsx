import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Receipt, Search, Filter, Calendar, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import ExpenseForm from '../components/Expenses/ExpenseForm';
import ExpenseCard from '../components/Expenses/ExpenseCard';
import ExpenseFilters from '../components/Expenses/ExpenseFilters';
import { formatCurrency, getCurrencySymbol } from '../utils/calculations';
import { useCurrency } from '../hooks/useCurrency';
import { EXPENSE_CATEGORIES } from '../types/index';

const Expenses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    getCurrentGroup,
    getGroupExpenses,
    getGroupParticipants,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoading
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    participant: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  const currentGroup = getCurrentGroup();
  const allExpenses = currentGroup ? getGroupExpenses(currentGroup.id) : [];
  const participants = currentGroup ? getGroupParticipants(currentGroup.id) : [];
  const currency = useCurrency();

  // Filter and search expenses
  const filteredExpenses = useMemo(() => {
    let filtered = allExpenses;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    // Participant filter
    if (filters.participant) {
      filtered = filtered.filter(expense =>
        expense.paidBy.includes(filters.participant) ||
        expense.splits.some(split => split.participantId === filters.participant)
      );
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(expense =>
        new Date(expense.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(expense =>
        new Date(expense.date) <= new Date(filters.dateTo)
      );
    }

    // Amount filters
    if (filters.minAmount) {
      filtered = filtered.filter(expense => expense.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(expense => expense.amount <= parseFloat(filters.maxAmount));
    }

    return filtered;
  }, [allExpenses, searchQuery, filters]);

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  const handleAddExpense = async (expenseData) => {
    try {
      await addExpense(expenseData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const handleUpdateExpense = async (expenseData) => {
    try {
      await updateExpense(editingExpense.id, expenseData);
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await deleteExpense(deletingExpense.id);
      setDeletingExpense(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      participant: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchQuery('');
  };

  // If no group is selected
  if (!currentGroup) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Group Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a group first to manage expenses
          </p>
          <Button
            onClick={() => navigate('/groups')}
            icon={<Plus className="w-4 h-4" />}
          >
            Go to Groups
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('expenses.title')} 💰
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Track and split expenses in <span className="font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{currentGroup.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
            className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 border-2 border-gray-300 dark:border-gray-600"
          >
            Filters 🔍
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
            disabled={isLoading || participants.length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {t('expenses.add')} ✨
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Expenses
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {filteredExpenses.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {currency.symbol}
              </span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Amount
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalExpenses, currency.code)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(averageExpense, currentGroup.currency)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <Input
          placeholder="Search expenses by description, notes, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          iconPosition="left"
        />

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <ExpenseFilters
              filters={filters}
              onFiltersChange={setFilters}
              participants={participants}
              onClear={clearFilters}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expenses List */}
      {participants.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Participants Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add participants to this group before creating expenses
          </p>
          <Button
            onClick={() => navigate('/participants')}
            icon={<Users className="w-4 h-4" />}
          >
            Add Participants
          </Button>
        </motion.div>
      ) : filteredExpenses.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredExpenses.map((expense, index) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                participants={participants}
                currency={currentGroup.currency}
                onEdit={() => setEditingExpense(expense)}
                onDelete={() => setDeletingExpense(expense)}
                delay={index * 0.05}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || Object.values(filters).some(f => f) ? 'No Matching Expenses' : t('expenses.noExpenses')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || Object.values(filters).some(f => f)
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first expense to this group'
            }
          </p>
          {searchQuery || Object.values(filters).some(f => f) ? (
            <Button
              variant="secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              {t('expenses.add')}
            </Button>
          )}
        </motion.div>
      )}

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('expenses.add')}
        size="lg"
      >
        <ExpenseForm
          participants={participants}
          currency={currentGroup.currency}
          groupId={currentGroup.id}
          onSubmit={handleAddExpense}
          onCancel={() => setShowAddModal(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        title={t('expenses.edit')}
        size="lg"
      >
        {editingExpense && (
          <ExpenseForm
            initialData={editingExpense}
            participants={participants}
            currency={currentGroup.currency}
            groupId={currentGroup.id}
            onSubmit={handleUpdateExpense}
            onCancel={() => setEditingExpense(null)}
            isLoading={isLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteExpense}
        title={t('expenses.delete')}
        message={t('expenses.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Expenses;
