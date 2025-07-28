import { motion } from 'framer-motion';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  trend = null,
  delay = 0 
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-1 ${
              trend.direction === 'up' 
                ? 'text-green-600 dark:text-green-400' 
                : trend.direction === 'down'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {trend.direction === 'up' && '↗ '}
              {trend.direction === 'down' && '↘ '}
              {trend.value}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
