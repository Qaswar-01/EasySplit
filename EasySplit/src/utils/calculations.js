/**
 * Utility functions for expense calculations and debt optimization
 */

/**
 * Calculate individual participant balances from expenses
 * @param {Array} expenses - Array of expense objects
 * @param {Array} participants - Array of participant objects
 * @returns {Object} - Object with participant balances
 */
export const calculateBalances = (expenses, participants) => {
  const balances = {};

  // Safety checks
  if (!Array.isArray(expenses)) {
    console.warn('calculateBalances: expenses is not an array', expenses);
    return balances;
  }

  if (!Array.isArray(participants)) {
    console.warn('calculateBalances: participants is not an array', participants);
    return balances;
  }

  // Initialize balances
  participants.forEach(participant => {
    if (participant && participant.id) {
      balances[participant.id] = 0;
    }
  });

  expenses.forEach(expense => {
    const { amount, paidBy, splitBetween, splitType, splits } = expense;

    // Handle both array and string formats for paidBy (backward compatibility)
    const paidByArray = Array.isArray(paidBy) ? paidBy : [paidBy];

    // Add amount paid by each participant
    paidByArray.forEach(participantId => {
      const paidAmount = amount / paidByArray.length; // Assume equal split among payers
      balances[participantId] = (balances[participantId] || 0) + paidAmount;
    });

    // Subtract amount owed by each participant
    if (splits && Array.isArray(splits)) {
      // Use splits if available (new format)
      splits.forEach(split => {
        balances[split.participantId] = (balances[split.participantId] || 0) - split.amount;
      });
    } else if (splitBetween && Array.isArray(splitBetween)) {
      // Use splitBetween for backward compatibility (seed data format)
      if (splitType === 'equal') {
        const splitAmount = amount / splitBetween.length;
        splitBetween.forEach(participantId => {
          balances[participantId] = (balances[participantId] || 0) - splitAmount;
        });
      } else {
        // For non-equal splits, assume equal for now (can be enhanced later)
        const splitAmount = amount / splitBetween.length;
        splitBetween.forEach(participantId => {
          balances[participantId] = (balances[participantId] || 0) - splitAmount;
        });
      }
    }
  });

  return balances;
};

/**
 * Calculate debts between participants (who owes whom)
 * @param {Array} expenses - Array of expense objects
 * @param {Array} participants - Array of participant objects
 * @returns {Array} - Array of debt objects
 */
export const calculateDebts = (expenses, participants) => {
  // Safety checks
  if (!Array.isArray(expenses)) {
    console.warn('calculateDebts: expenses is not an array', expenses);
    return [];
  }

  if (!Array.isArray(participants)) {
    console.warn('calculateDebts: participants is not an array', participants);
    return [];
  }

  const balances = calculateBalances(expenses, participants);
  const debts = [];

  // Convert balances to creditors (positive) and debtors (negative)
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([participantId, balance]) => {
    if (balance > 0.01) { // Creditor (owed money)
      creditors.push({ participantId, amount: balance });
    } else if (balance < -0.01) { // Debtor (owes money)
      debtors.push({ participantId, amount: Math.abs(balance) });
    }
  });

  // Optimize debts using greedy algorithm
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const settleAmount = Math.min(creditor.amount, debtor.amount);

    if (settleAmount > 0.01) {
      debts.push({
        fromId: debtor.participantId,
        toId: creditor.participantId,
        amount: Math.round(settleAmount * 100) / 100, // Round to 2 decimal places
        currency: expenses[0]?.currency || 'PKR'
      });
    }

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;

    if (creditor.amount < 0.01) creditorIndex++;
    if (debtor.amount < 0.01) debtorIndex++;
  }

  return debts;
};

/**
 * Calculate expense splits based on split type
 * @param {number} totalAmount - Total expense amount
 * @param {Array} participants - Array of participant objects
 * @param {string} splitType - 'equal', 'fixed', or 'percentage'
 * @param {Object} splitData - Additional split data (amounts, percentages)
 * @returns {Array} - Array of split objects
 */
export const calculateExpenseSplits = (totalAmount, participants, splitType, splitData = {}) => {
  const splits = [];

  switch (splitType) {
    case 'equal':
      const equalAmount = totalAmount / participants.length;
      participants.forEach(participant => {
        splits.push({
          participantId: participant.id,
          amount: Math.round(equalAmount * 100) / 100,
          type: 'equal'
        });
      });
      break;

    case 'fixed':
      participants.forEach(participant => {
        const amount = splitData.amounts?.[participant.id] || 0;
        splits.push({
          participantId: participant.id,
          amount: Math.round(amount * 100) / 100,
          type: 'fixed'
        });
      });
      break;

    case 'percentage':
      participants.forEach(participant => {
        const percentage = splitData.percentages?.[participant.id] || 0;
        const amount = (totalAmount * percentage) / 100;
        splits.push({
          participantId: participant.id,
          amount: Math.round(amount * 100) / 100,
          percentage,
          type: 'percentage'
        });
      });
      break;

    default:
      throw new Error(`Unknown split type: ${splitType}`);
  }

  return splits;
};

/**
 * Validate expense splits
 * @param {Array} splits - Array of split objects
 * @param {number} totalAmount - Total expense amount
 * @param {string} splitType - Split type
 * @returns {Object} - Validation result
 */
export const validateExpenseSplits = (splits, totalAmount, splitType) => {
  const result = {
    isValid: true,
    errors: [],
    totalSplitAmount: 0
  };

  if (!splits || splits.length === 0) {
    result.isValid = false;
    result.errors.push('At least one participant must be included in the split');
    return result;
  }

  // Calculate total split amount
  result.totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);

  // Check if total split amount matches expense amount (with small tolerance for rounding)
  const difference = Math.abs(result.totalSplitAmount - totalAmount);
  if (difference > 0.01) {
    result.isValid = false;
    result.errors.push(`Split amounts (${result.totalSplitAmount}) don't match expense total (${totalAmount})`);
  }

  // Validate percentage splits
  if (splitType === 'percentage') {
    const totalPercentage = splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      result.isValid = false;
      result.errors.push(`Percentages must add up to 100% (currently ${totalPercentage}%)`);
    }
  }

  // Check for negative amounts
  const negativeAmounts = splits.filter(split => split.amount < 0);
  if (negativeAmounts.length > 0) {
    result.isValid = false;
    result.errors.push('Split amounts cannot be negative');
  }

  return result;
};

/**
 * Format currency amount based on locale and currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale code
 * @returns {string} - Formatted currency string
 */
/**
 * Get currency symbol for display
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = 'PKR') => {
  const customSymbols = {
    'PKR': '₨',
    'INR': '₹',
    'BDT': '৳',
    'LKR': 'Rs',
    'NPR': 'Rs',
    'AFN': '؋',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'KRW': '₩',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'Fr'
  };
  return customSymbols[currency] || currency;
};

export const formatCurrency = (amount, currency = 'PKR', locale = 'en-PK') => {
  try {
    // Special handling for currencies with custom symbols
    const customSymbols = {
      'PKR': '₨',
      'INR': '₹',
      'BDT': '৳',
      'LKR': 'Rs',
      'NPR': 'Rs',
      'AFN': '؋'
    };

    if (customSymbols[currency]) {
      return `${customSymbols[currency]}${amount.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }

    // Use Intl.NumberFormat for standard currencies
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.warn('Currency formatting failed, using fallback:', error);
    // Fallback with custom symbols if available
    const customSymbols = {
      'PKR': '₨',
      'INR': '₹',
      'BDT': '৳',
      'LKR': 'Rs',
      'NPR': 'Rs',
      'AFN': '؋'
    };
    const symbol = customSymbols[currency] || currency;
    return `${symbol} ${amount.toFixed(2)}`;
  }
};

/**
 * Calculate expense statistics for a group
 * @param {Array} expenses - Array of expense objects
 * @param {Array} participants - Array of participant objects
 * @returns {Object} - Statistics object
 */
export const calculateExpenseStats = (expenses, participants) => {
  const stats = {
    totalExpenses: expenses.length,
    totalAmount: 0,
    averageExpense: 0,
    categoryBreakdown: {},
    participantContributions: {},
    monthlyTrends: {}
  };

  if (expenses.length === 0) return stats;

  // Calculate totals and averages
  stats.totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  stats.averageExpense = stats.totalAmount / expenses.length;

  // Category breakdown
  expenses.forEach(expense => {
    const category = expense.category || 'Other';
    stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + expense.amount;
  });

  // Participant contributions (how much each participant paid)
  participants.forEach(participant => {
    stats.participantContributions[participant.id] = {
      name: participant.name,
      totalPaid: 0,
      expenseCount: 0
    };
  });

  expenses.forEach(expense => {
    expense.paidBy.forEach(participantId => {
      if (stats.participantContributions[participantId]) {
        const paidAmount = expense.amount / expense.paidBy.length;
        stats.participantContributions[participantId].totalPaid += paidAmount;
        stats.participantContributions[participantId].expenseCount += 1;
      }
    });
  });

  // Monthly trends
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    stats.monthlyTrends[monthKey] = (stats.monthlyTrends[monthKey] || 0) + expense.amount;
  });

  return stats;
};
