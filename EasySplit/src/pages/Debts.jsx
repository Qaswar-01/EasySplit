import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle, Users, DollarSign, HeartHandshake, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';

import DebtCard from '../components/Debts/DebtCard';
import SettlementForm from '../components/Debts/SettlementForm';
import { formatCurrency } from '../utils/calculations';
import { useCurrency } from '../hooks/useCurrency';

const Debts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    getCurrentGroup,
    getGroupParticipants,
    getGroupDebts,
    addSettlement,
    isLoading,
    groups,
    setCurrentGroupId
  } = useAppStore();

  const [reminders, setReminders] = useState([]);

  const [settlingDebt, setSettlingDebt] = useState(null);
  const [showSettlementForm, setShowSettlementForm] = useState(false);

  // Load existing reminders from localStorage on component mount
  useEffect(() => {
    const savedReminders = JSON.parse(localStorage.getItem('whatsappReminders') || '[]');
    // Filter reminders that are still in the future
    const activeReminders = savedReminders.filter(reminder =>
      new Date(reminder.scheduledFor) > new Date()
    );
    setReminders(activeReminders);
  }, []);

  const currentGroup = getCurrentGroup();

  // Auto-select first group if none is selected but groups exist
  React.useEffect(() => {
    if (!currentGroup && groups.length > 0) {
      setCurrentGroupId(groups[0].id);
    }
  }, [currentGroup, groups, setCurrentGroupId]);

  const participants = currentGroup ? getGroupParticipants(currentGroup.id) : [];
  const debts = currentGroup ? getGroupDebts(currentGroup.id) : [];
  const currency = useCurrency();

  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const uniqueDebtors = new Set(debts.map(debt => debt.fromId)).size;
  const uniqueCreditors = new Set(debts.map(debt => debt.toId)).size;

  const handleSettleDebt = async (settlementData) => {
    try {
      await addSettlement({
        ...settlementData,
        groupId: currentGroup.id
      });
      setSettlingDebt(null);
      setShowSettlementForm(false);
    } catch (error) {
      console.error('Failed to settle debt:', error);
    }
  };

  const handleQuickSettle = (debt) => {
    setSettlingDebt(debt);
    setShowSettlementForm(true);
  };

  const handleReminderSet = (reminder) => {
    // Add to local state
    setReminders(prev => [...prev, reminder]);

    // Save to localStorage for persistence (same format as other reminder systems)
    const existingReminders = JSON.parse(localStorage.getItem('whatsappReminders') || '[]');

    // Convert reminder to the format expected by ReminderManager
    const formattedReminder = {
      id: reminder.id,
      contact: {
        name: participants.find(p => p.id === reminder.fromId)?.name || 'Unknown',
        phone: participants.find(p => p.id === reminder.fromId)?.phone || ''
      },
      message: reminder.message,
      scheduledFor: reminder.scheduledFor.toISOString(),
      created: new Date().toISOString(),
      debtInfo: {
        fromId: reminder.fromId,
        toId: reminder.toId,
        amount: reminder.amount,
        currency: reminder.currency
      }
    };

    existingReminders.push(formattedReminder);
    localStorage.setItem('whatsappReminders', JSON.stringify(existingReminders));

    // Schedule the reminder (in a real app, this would be handled by a background service)
    const timeUntilReminder = reminder.scheduledFor.getTime() - Date.now();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        // Check if reminder still exists (user might have cancelled it)
        const currentReminders = JSON.parse(localStorage.getItem('whatsappReminders') || '[]');
        const reminderExists = currentReminders.find(r => r.id === reminder.id);

        if (reminderExists && reminder.whatsappEnabled) {
          const fromName = participants.find(p => p.id === reminder.fromId)?.name || 'Unknown';
          const fromPhone = participants.find(p => p.id === reminder.fromId)?.phone;

          if (fromPhone) {
            const cleanPhone = fromPhone.replace(/[^\d+]/g, '');
            const encodedMessage = encodeURIComponent(reminder.message);
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');

            // Remove from localStorage after sending
            const updatedReminders = currentReminders.filter(r => r.id !== reminder.id);
            localStorage.setItem('whatsappReminders', JSON.stringify(updatedReminders));

            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('WhatsApp Reminder Sent', {
                body: `Reminder sent to ${fromName}`,
                icon: '/favicon.ico'
              });
            }
          }
        }

        // Remove from local state
        setReminders(prev => prev.filter(r => r.id !== reminder.id));
      }, timeUntilReminder);
    }

    // Show success message
    const fromName = participants.find(p => p.id === reminder.fromId)?.name || 'Unknown';
    const scheduledTime = reminder.scheduledFor.toLocaleString();
    alert(`✅ Reminder scheduled for ${fromName} on ${scheduledTime}`);
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
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Group Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a group first to view debts and settlements
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('debts.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Settle debts in <span className="font-medium">{currentGroup.name}</span>
          </p>
        </div>
        {debts.length > 0 && (
          <Button
            onClick={() => setShowSettlementForm(true)}
            icon={<HeartHandshake className="w-4 h-4" />}
          >
            Record Settlement
          </Button>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Outstanding
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalDebts, currency.code)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                People Who Owe
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {uniqueDebtors}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                People Owed
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {uniqueCreditors}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Reminders
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {reminders.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Debts List */}
      {debts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Settlement Plan
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Optimized to minimize transactions
            </p>
          </div>

          <AnimatePresence>
            {debts.map((debt, index) => (
              <DebtCard
                key={`${debt.fromId}-${debt.toId}`}
                debt={debt}
                participants={participants}
                currency={currency.code}
                onSettle={() => handleQuickSettle(debt)}
                onReminderSet={handleReminderSet}
                delay={index * 0.1}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('debts.noDebts')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Everyone is settled up! No outstanding debts in this group.
          </p>
          <Button
            onClick={() => navigate('/expenses')}
            icon={<DollarSign className="w-4 h-4" />}
          >
            Add New Expense
          </Button>
        </motion.div>
      )}

      {/* Settlement Form Modal */}
      <Modal
        isOpen={showSettlementForm}
        onClose={() => {
          setShowSettlementForm(false);
          setSettlingDebt(null);
        }}
        title="Record Settlement"
        size="md"
      >
        <SettlementForm
          participants={participants}
          currency={currency.code}
          initialDebt={settlingDebt}
          onSubmit={handleSettleDebt}
          onCancel={() => {
            setShowSettlementForm(false);
            setSettlingDebt(null);
          }}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
};

export default Debts;
