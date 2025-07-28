import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  MessageCircle, 
  Calendar, 
  Trash2, 
  Bell, 
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const ReminderManager = ({ isOpen, onClose }) => {
  const [reminders, setReminders] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadReminders();
    }
  }, [isOpen]);

  const loadReminders = () => {
    const storedReminders = JSON.parse(localStorage.getItem('whatsappReminders') || '[]');
    // Filter out past reminders
    const now = new Date();
    const activeReminders = storedReminders.filter(reminder => 
      new Date(reminder.scheduledFor) > now
    );
    
    // Update localStorage to remove past reminders
    localStorage.setItem('whatsappReminders', JSON.stringify(activeReminders));
    setReminders(activeReminders);
  };

  const deleteReminder = (reminderId) => {
    const updatedReminders = reminders.filter(r => r.id !== reminderId);
    setReminders(updatedReminders);
    localStorage.setItem('whatsappReminders', JSON.stringify(updatedReminders));
    setShowDeleteConfirm(false);
    setReminderToDelete(null);
  };

  const confirmDelete = (reminder) => {
    setReminderToDelete(reminder);
    setShowDeleteConfirm(true);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return 'very soon';
    }
  };

  const getStatusColor = (scheduledFor) => {
    const now = new Date();
    const reminderTime = new Date(scheduledFor);
    const diff = reminderTime.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) return 'text-red-600 bg-red-50 border-red-200';
    if (hours < 24) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="WhatsApp Reminders" size="lg">
        <div className="space-y-4">
          {/* Header Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {reminders.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Reminders
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reminders.filter(r => new Date(r.scheduledFor).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Due Today
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {reminders.filter(r => new Date(r.scheduledFor).getTime() - new Date().getTime() >= 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Future
              </div>
            </div>
          </div>

          {/* Reminders List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {reminders.length > 0 ? (
                reminders.map((reminder) => {
                  const dateTime = formatDateTime(reminder.scheduledFor);
                  return (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-4 rounded-lg border-2 ${getStatusColor(reminder.scheduledFor)} dark:bg-gray-800 dark:border-gray-600`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Contact Info */}
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {reminder.contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {reminder.contact.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {reminder.contact.phone}
                              </p>
                            </div>
                          </div>

                          {/* Timing Info */}
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {dateTime.date}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {dateTime.time}
                              </span>
                            </div>
                          </div>

                          {/* Relative Time */}
                          <div className="flex items-center space-x-2 mb-3">
                            <Bell className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {dateTime.relative}
                            </span>
                          </div>

                          {/* Message Preview */}
                          <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                            <div className="flex items-center space-x-2 mb-2">
                              <MessageCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Message Preview
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {reminder.message}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="ml-4">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => confirmDelete(reminder)}
                            icon={<Trash2 className="w-4 h-4" />}
                            className="p-2"
                            title="Delete Reminder"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Active Reminders
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Schedule WhatsApp reminders from the contact picker to see them here.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 Reminders will automatically open WhatsApp at the scheduled time
            </div>
            <Button onClick={onClose} variant="primary">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Reminder"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Delete this reminder?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {reminderToDelete && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>{reminderToDelete.contact.name}</strong> - {formatDateTime(reminderToDelete.scheduledFor).date} at {formatDateTime(reminderToDelete.scheduledFor).time}
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteReminder(reminderToDelete.id)}
              className="flex-1"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReminderManager;
