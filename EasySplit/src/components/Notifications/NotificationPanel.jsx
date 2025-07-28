import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Check, Trash2, ExternalLink } from 'lucide-react';
import useNotificationStore from '../../store/useNotificationStore';
import Button from '../UI/Button';

const NotificationPanel = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isOpen,
    closePanel,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getRecentNotifications
  } = useNotificationStore();

  const recentNotifications = getRecentNotifications(20);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      closePanel();
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 lg:relative lg:inset-auto"
      >
        {/* Mobile Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={closePanel}
        />
        
        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl lg:relative lg:w-80 lg:h-auto lg:max-h-96 lg:rounded-lg lg:border lg:border-gray-200 lg:dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  icon={<Check className="w-4 h-4" />}
                  className="p-1"
                  title="Mark all as read"
                />
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="p-1 text-danger-600 hover:text-danger-700"
                  title="Clear all"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={closePanel}
                icon={<X className="w-4 h-4" />}
                className="p-1"
                title="Close"
              />
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto max-h-80">
            {recentNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {recentNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4 ${getNotificationColor(notification.type)} ${
                        !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg flex-shrink-0">
                          {getNotificationIcon(notification)}
                        </span>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.read 
                                ? 'text-gray-900 dark:text-gray-100' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              {notification.actionUrl && (
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🔔</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPanel;
