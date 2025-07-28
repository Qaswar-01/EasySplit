import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Notification store for managing in-app notifications
 */
const useNotificationStore = create(
  persist(
    (set, get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      isOpen: false,

      // Actions
      addNotification: (notification) => {
        const newNotification = {
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          read: false,
          type: 'info', // info, success, warning, error
          ...notification
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));

        // Auto-remove after 30 seconds for non-persistent notifications
        if (!notification.persistent) {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, 30000);
        }
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const wasUnread = notification && !notification.read;
          
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (!notification || notification.read) return state;

          return {
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }));
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0
        });
      },

      togglePanel: () => {
        set((state) => ({
          isOpen: !state.isOpen
        }));
      },

      closePanel: () => {
        set({ isOpen: false });
      },

      // Utility functions
      getUnreadNotifications: () => {
        return get().notifications.filter(n => !n.read);
      },

      getRecentNotifications: (limit = 10) => {
        return get().notifications.slice(0, limit);
      },

      // Notification creators for common scenarios
      notifyExpenseAdded: (expense, groupName) => {
        get().addNotification({
          type: 'success',
          title: 'Expense Added',
          message: `"${expense.description}" added to ${groupName}`,
          icon: '💰',
          actionUrl: '/expenses'
        });
      },

      notifyDebtSettled: (fromName, toName, amount, currency) => {
        get().addNotification({
          type: 'success',
          title: 'Debt Settled',
          message: `${fromName} paid ${amount} ${currency} to ${toName}`,
          icon: '✅',
          actionUrl: '/debts'
        });
      },

      notifyGroupCreated: (groupName) => {
        get().addNotification({
          type: 'success',
          title: 'Group Created',
          message: `"${groupName}" group has been created`,
          icon: '👥',
          actionUrl: '/groups'
        });
      },

      notifyParticipantAdded: (participantName, groupName) => {
        get().addNotification({
          type: 'info',
          title: 'Participant Added',
          message: `${participantName} joined ${groupName}`,
          icon: '👤',
          actionUrl: '/participants'
        });
      },

      notifyError: (title, message) => {
        get().addNotification({
          type: 'error',
          title,
          message,
          icon: '❌',
          persistent: true
        });
      },

      notifyWarning: (title, message) => {
        get().addNotification({
          type: 'warning',
          title,
          message,
          icon: '⚠️'
        });
      },

      notifyInfo: (title, message) => {
        get().addNotification({
          type: 'info',
          title,
          message,
          icon: 'ℹ️'
        });
      }
    }),
    {
      name: 'easysplit-notifications',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Keep only last 50 notifications
        unreadCount: state.unreadCount
      })
    }
  )
);

export default useNotificationStore;
