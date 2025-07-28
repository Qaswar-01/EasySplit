import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Receipt, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import Button from '../components/UI/Button';
import { formatCurrency } from '../utils/calculations';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    getCurrentGroup,
    getGroupParticipants,
    getGroupExpenses,
    getGroupDebts,
    groups,
    addGroup,
    setCurrentGroupId
  } = useAppStore();

  const currentGroup = getCurrentGroup();

  // Auto-select first group if none is selected but groups exist
  React.useEffect(() => {
    if (!currentGroup && groups.length > 0) {
      setCurrentGroupId(groups[0].id);
    }
  }, [currentGroup, groups, setCurrentGroupId]);

  // Safety checks to prevent errors during data loading
  if (!currentGroup) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">
            No group selected. Please select or create a group.
          </div>
        </div>
      </div>
    );
  }

  const participants = getGroupParticipants(currentGroup.id) || [];
  const expenses = getGroupExpenses(currentGroup.id) || [];
  const debts = getGroupDebts(currentGroup.id) || [];

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);

  const stats = [
    {
      name: 'Total Expenses',
      value: formatCurrency(totalExpenses, currentGroup?.currency),
      icon: Receipt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      name: 'Participants',
      value: participants.length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: 'Outstanding Debts',
      value: formatCurrency(totalDebts, currentGroup?.currency),
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900'
    }
  ];



  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard ✨
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Overview for <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{currentGroup.name}</span>
          </p>
        </div>
        <Button
          onClick={() => navigate('/expenses')}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Expense
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Expenses
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/expenses')}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {expense.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(expense.amount, expense.currency)}
                </p>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No expenses yet
              </p>
            )}
          </div>
        </motion.div>

        {/* Outstanding Debts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Outstanding Debts
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/debts')}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {debts.slice(0, 5).map((debt, index) => {
              const fromParticipant = participants.find(p => p.id === debt.fromId);
              const toParticipant = participants.find(p => p.id === debt.toId);
              
              return (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {fromParticipant?.name} owes {toParticipant?.name}
                    </p>
                  </div>
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    {formatCurrency(debt.amount, debt.currency)}
                  </p>
                </div>
              );
            })}
            {debts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                All settled up!
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
