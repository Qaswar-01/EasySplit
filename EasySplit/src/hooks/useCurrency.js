import { useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import { getCurrencySymbol } from '../utils/calculations';

/**
 * Hook to get the current currency based on the active group or default settings
 * @returns {Object} Currency information including code, symbol, and formatting functions
 */
export const useCurrency = () => {
  const { getCurrentGroup, settings } = useAppStore();
  
  const currentGroup = getCurrentGroup();
  
  const currency = useMemo(() => {
    // Use current group's currency if available, otherwise use default from settings
    const currencyCode = currentGroup?.currency || settings.defaultCurrency || 'PKR';
    
    return {
      code: currencyCode,
      symbol: getCurrencySymbol(currencyCode),
      name: getCurrencyName(currencyCode)
    };
  }, [currentGroup?.currency, settings.defaultCurrency]);
  
  return currency;
};

/**
 * Get the full name of a currency
 * @param {string} currencyCode - Currency code (e.g., 'PKR', 'USD')
 * @returns {string} Full currency name
 */
const getCurrencyName = (currencyCode) => {
  const currencyNames = {
    'PKR': 'Pakistani Rupee',
    'INR': 'Indian Rupee',
    'BDT': 'Bangladeshi Taka',
    'LKR': 'Sri Lankan Rupee',
    'NPR': 'Nepalese Rupee',
    'AFN': 'Afghan Afghani',
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'JPY': 'Japanese Yen',
    'CNY': 'Chinese Yuan',
    'KRW': 'South Korean Won',
    'AUD': 'Australian Dollar',
    'CAD': 'Canadian Dollar',
    'CHF': 'Swiss Franc'
  };
  
  return currencyNames[currencyCode] || currencyCode;
};

export default useCurrency;
