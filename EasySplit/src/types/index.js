/**
 * Core data types for the EasySplit application
 */

/**
 * @typedef {Object} Participant
 * @property {string} id - Unique identifier
 * @property {string} name - Participant name
 * @property {string} email - Optional email address
 * @property {string} avatar - Optional avatar URL
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} ExpenseSplit
 * @property {string} participantId - Participant ID
 * @property {number} amount - Amount this participant owes
 * @property {number} percentage - Percentage of total expense (for percentage splits)
 * @property {'equal' | 'fixed' | 'percentage'} type - Split type
 */

/**
 * @typedef {Object} Expense
 * @property {string} id - Unique identifier
 * @property {string} groupId - Group this expense belongs to
 * @property {string} description - Expense description
 * @property {number} amount - Total expense amount
 * @property {string} currency - Currency code (e.g., 'PKR', 'USD')
 * @property {string[]} paidBy - Array of participant IDs who paid
 * @property {ExpenseSplit[]} splits - How the expense is split
 * @property {string} category - Expense category
 * @property {string} notes - Optional notes
 * @property {string[]} tags - Optional tags
 * @property {string[]} receiptImages - Array of receipt image URLs
 * @property {Date} date - Expense date
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Group
 * @property {string} id - Unique identifier
 * @property {string} name - Group name
 * @property {string} description - Optional group description
 * @property {string} currency - Default currency for the group
 * @property {Participant[]} participants - Group participants
 * @property {Expense[]} expenses - Group expenses
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Debt
 * @property {string} fromId - Participant ID who owes money
 * @property {string} toId - Participant ID who is owed money
 * @property {number} amount - Amount owed
 * @property {string} currency - Currency code
 */

/**
 * @typedef {Object} Settlement
 * @property {string} id - Unique identifier
 * @property {string} groupId - Group ID
 * @property {string} fromId - Participant ID who paid
 * @property {string} toId - Participant ID who received payment
 * @property {number} amount - Settlement amount
 * @property {string} currency - Currency code
 * @property {Date} settledAt - Settlement timestamp
 * @property {string} notes - Optional settlement notes
 */

/**
 * @typedef {Object} AppSettings
 * @property {string} theme - 'light' | 'dark' | 'system'
 * @property {string} language - Language code (e.g., 'en', 'ur')
 * @property {string} defaultCurrency - Default currency code
 * @property {boolean} showOnboarding - Whether to show onboarding
 * @property {Object} notifications - Notification preferences
 */

export const SPLIT_TYPES = {
  EQUAL: 'equal',
  FIXED: 'fixed',
  PERCENTAGE: 'percentage'
};

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Travel',
  'Healthcare',
  'Education',
  'Groceries',
  'Other'
];

export const CURRENCIES = [
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
];

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
];
