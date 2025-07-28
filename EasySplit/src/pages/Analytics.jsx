import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BarChart3, PieChart, TrendingUp, Users, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import Button from '../components/UI/Button';
import ChartCard from '../components/Analytics/ChartCard';
import StatsCard from '../components/Analytics/StatsCard';
import { formatCurrency, calculateExpenseStats } from '../utils/calculations';
import { useCurrency } from '../hooks/useCurrency';

const Analytics = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    getCurrentGroup,
    getGroupExpenses,
    getGroupParticipants,
    getGroupDebts
  } = useAppStore();

  const [timeRange, setTimeRange] = useState('all'); // all, month, quarter, year

  const currentGroup = getCurrentGroup();
  const allExpenses = currentGroup ? getGroupExpenses(currentGroup.id) : [];
  const participants = currentGroup ? getGroupParticipants(currentGroup.id) : [];
  const debts = currentGroup ? getGroupDebts(currentGroup.id) : [];
  const currency = useCurrency();

  // Filter expenses by time range
  const filteredExpenses = useMemo(() => {
    if (timeRange === 'all') return allExpenses;

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return allExpenses;
    }

    return allExpenses.filter(expense => new Date(expense.date) >= cutoffDate);
  }, [allExpenses, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateExpenseStats(filteredExpenses, participants);
  }, [filteredExpenses, participants]);

  // Prepare chart data
  const categoryData = useMemo(() => {
    const categories = Object.entries(stats.categoryBreakdown).map(([category, amount]) => ({
      name: category,
      value: amount,
      percentage: stats.totalAmount > 0 ? ((amount / stats.totalAmount) * 100).toFixed(1) : 0
    }));
    return categories.sort((a, b) => b.value - a.value);
  }, [stats]);

  const participantData = useMemo(() => {
    return Object.entries(stats.participantContributions).map(([id, data]) => ({
      id,
      name: data.name,
      totalPaid: data.totalPaid,
      expenseCount: data.expenseCount,
      percentage: stats.totalAmount > 0 ? ((data.totalPaid / stats.totalAmount) * 100).toFixed(1) : 0
    })).sort((a, b) => b.totalPaid - a.totalPaid);
  }, [stats]);

  const monthlyData = useMemo(() => {
    const months = Object.entries(stats.monthlyTrends).map(([month, amount]) => ({
      month,
      amount,
      formattedMonth: new Date(month + '-01').toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    }));
    return months.sort((a, b) => a.month.localeCompare(b.month));
  }, [stats]);

  const debtData = useMemo(() => {
    return debts.map(debt => ({
      ...debt,
      fromName: participants.find(p => p.id === debt.fromId)?.name || 'Unknown',
      toName: participants.find(p => p.id === debt.toId)?.name || 'Unknown'
    }));
  }, [debts, participants]);

  const timeRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'year', label: 'Last Year' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'month', label: 'Last Month' }
  ];

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
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Group Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a group first to view analytics
          </p>
          <Button
            onClick={() => navigate('/groups')}
            icon={<Users className="w-4 h-4" />}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('analytics.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Insights for <span className="font-medium">{currentGroup.name}</span>
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {timeRangeOptions.map(option => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title={t('analytics.totalExpenses')}
          value={stats.totalExpenses}
          icon={<BarChart3 className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title={t('analytics.totalAmount')}
          value={formatCurrency(stats.totalAmount, currentGroup.currency)}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title={t('analytics.averageExpense')}
          value={formatCurrency(stats.averageExpense, currentGroup.currency)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Active Participants"
          value={participants.length}
          icon={<Users className="w-6 h-6" />}
          color="orange"
        />
      </motion.div>

      {/* Charts Grid */}
      {filteredExpenses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ChartCard
              title={t('analytics.categoryBreakdown')}
              type="pie"
              data={categoryData}
              currency={currency.code}
              icon={<PieChart className="w-5 h-5" />}
            />
          </motion.div>

          {/* Participant Contributions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ChartCard
              title={t('analytics.participantContributions')}
              type="bar"
              data={participantData}
              currency={currency.code}
              icon={<Users className="w-5 h-5" />}
            />
          </motion.div>

          {/* Debt Analysis */}
          {debtData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ChartCard
                title="Debt Analysis"
                type="debt"
                data={debtData}
                currency={currency.code}
                icon={<CreditCard className="w-5 h-5" />}
              />
            </motion.div>
          )}

          {/* Monthly Trends */}
          {monthlyData.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <ChartCard
                title={t('analytics.monthlyTrends')}
                type="line"
                data={monthlyData}
                currency={currency.code}
                icon={<Calendar className="w-5 h-5" />}
              />
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {timeRange === 'all'
              ? 'Add some expenses to see analytics and insights'
              : 'No expenses found for the selected time range'
            }
          </p>
          {timeRange === 'all' ? (
            <Button
              onClick={() => navigate('/expenses')}
              icon={<DollarSign className="w-4 h-4" />}
            >
              Add Expenses
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setTimeRange('all')}
            >
              View All Time
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
