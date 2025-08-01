/**
 * Main Zustand store for EasySplit application
 */

import { create } from 'zustand';
import {
  groupsStore,
  expensesStore,
  participantsStore,
  settlementsStore,
  settingsStore,
  localStorageUtils,
  initDB
} from '../utils/storage.js';
import { calculateDebts } from '../utils/calculations.js';
import { generateSeedData } from '../utils/seedData';
import useNotificationStore from './useNotificationStore.js';

const useAppStore = create((set, get) => ({
      // App state
      isLoading: false,
      error: null,
      currentGroupId: null,
      
      // Data
      groups: [],
      participants: [],
      expenses: [],
      settlements: [],
      
      // Settings
      settings: {
        theme: 'system',
        language: 'en',
        defaultCurrency: 'PKR',
        showOnboarding: false,
        notifications: {
          debts: true,
          settlements: true,
          newExpenses: true
        }
      },

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Initialize app data from IndexedDB
      initializeApp: async () => {
        try {
          set({ isLoading: true });

          // Enhanced debugging for mobile
          console.log('🔄 Initializing app...');
          console.log('📱 User Agent:', navigator.userAgent);
          console.log('🗄️ IndexedDB supported:', 'indexedDB' in window);
          console.log('🔧 Service Worker supported:', 'serviceWorker' in navigator);

          await initDB();
          console.log('✅ IndexedDB initialized');

          const [groups, expenses, participants, settlements] = await Promise.all([
            groupsStore.getAll(),
            expensesStore.getAll(),
            participantsStore.getAll(),
            settlementsStore.getAll()
          ]);

          console.log('📊 Loaded from IndexedDB:', {
            groups: groups.length,
            expenses: expenses.length,
            participants: participants.length,
            settlements: settlements.length
          });

          // If no data found, try to load seed data for demo
          if (groups.length === 0) {
            console.log('🌱 No data found, loading seed data for demo...');
            const seedData = generateSeedData();

            // Save seed data to IndexedDB
            await Promise.all([
              ...seedData.groups.map(group => groupsStore.put(group)),
              ...seedData.participants.map(participant => participantsStore.put(participant)),
              ...seedData.expenses.map(expense => expensesStore.put(expense))
            ]);

            console.log('✅ Seed data saved to IndexedDB');

            set({
              groups: seedData.groups,
              expenses: seedData.expenses,
              participants: seedData.participants,
              settlements: seedData.settlements,
              currentGroupId: seedData.groups[0].id
            });
          } else {
            set({
              groups,
              expenses,
              participants,
              settlements,
              currentGroupId: get().currentGroupId || (groups.length > 0 ? groups[0].id : null)
            });
          }

          // Add welcome notification for new users
          if (groups.length === 0) {
            const notificationStore = useNotificationStore.getState();
            notificationStore.notifyInfo(
              'Welcome to EasySplit!',
              'Create your first group to start splitting expenses with friends.'
            );
          }
        } catch (error) {
          console.error('❌ Failed to initialize app:', error);
          console.error('Error details:', error.message, error.stack);
          set({ error: 'Failed to load data: ' + error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // Group management
      createGroup: async (groupData) => {
        try {
          const newGroup = {
            id: crypto.randomUUID(),
            ...groupData,
            participants: [],
            expenses: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };

          console.log('💾 Saving group to IndexedDB:', newGroup);
          await groupsStore.add(newGroup);
          console.log('✅ Group saved successfully');

          const currentState = get();
          set({
            groups: [...currentState.groups, newGroup],
            currentGroupId: currentState.currentGroupId || newGroup.id
          });

          console.log('📊 Updated state - total groups:', currentState.groups.length + 1);

          // Notify about group creation
          const notificationStore = useNotificationStore.getState();
          notificationStore.notifyGroupCreated(newGroup.name);

          return newGroup;
        } catch (error) {
          console.error('Failed to create group:', error);
          set({ error: 'Failed to create group' });
          throw error;
        }
      },

      updateGroup: async (groupId, updates) => {
        try {
          const existingGroup = get().groups.find(g => g.id === groupId);
          if (!existingGroup) throw new Error('Group not found');

          const updatedGroup = {
            ...existingGroup,
            ...updates,
            updatedAt: new Date()
          };

          await groupsStore.put(updatedGroup);

          const currentState = get();
          const updatedGroups = currentState.groups.map(g =>
            g.id === groupId ? updatedGroup : g
          );
          set({ groups: updatedGroups });

          return updatedGroup;
        } catch (error) {
          console.error('Failed to update group:', error);
          set({ error: 'Failed to update group' });
          throw error;
        }
      },

      deleteGroup: async (groupId) => {
        try {
          await Promise.all([
            groupsStore.delete(groupId),
            // Delete related data
            ...get().expenses.filter(e => e.groupId === groupId).map(e => expensesStore.delete(e.id)),
            ...get().participants.filter(p => p.groupId === groupId).map(p => participantsStore.delete(p.id)),
            ...get().settlements.filter(s => s.groupId === groupId).map(s => settlementsStore.delete(s.id))
          ]);

          const currentState = get();
          const filteredGroups = currentState.groups.filter(g => g.id !== groupId);
          set({
            groups: filteredGroups,
            expenses: currentState.expenses.filter(e => e.groupId !== groupId),
            participants: currentState.participants.filter(p => p.groupId !== groupId),
            settlements: currentState.settlements.filter(s => s.groupId !== groupId),
            currentGroupId: currentState.currentGroupId === groupId
              ? (filteredGroups.length > 0 ? filteredGroups[0].id : null)
              : currentState.currentGroupId
          });
        } catch (error) {
          console.error('Failed to delete group:', error);
          set({ error: 'Failed to delete group' });
          throw error;
        }
      },

      setCurrentGroup: (groupId) => set({ currentGroupId: groupId }),

      // Participant management
      addParticipant: async (groupId, participantData) => {
        try {
          const newParticipant = {
            id: crypto.randomUUID(),
            groupId,
            ...participantData,
            createdAt: new Date()
          };

          await participantsStore.add(newParticipant);

          const currentState = get();
          set({
            participants: [...currentState.participants, newParticipant]
          });

          // Notify about participant addition
          const group = currentState.groups.find(g => g.id === groupId);
          const notificationStore = useNotificationStore.getState();
          notificationStore.notifyParticipantAdded(newParticipant.name, group?.name || 'Unknown Group');

          return newParticipant;
        } catch (error) {
          console.error('Failed to add participant:', error);
          set({ error: 'Failed to add participant' });
          throw error;
        }
      },

      updateParticipant: async (participantId, updates) => {
        try {
          const existingParticipant = get().participants.find(p => p.id === participantId);
          if (!existingParticipant) throw new Error('Participant not found');

          const updatedParticipant = {
            ...existingParticipant,
            ...updates
          };

          await participantsStore.put(updatedParticipant);

          const currentState = get();
          const updatedParticipants = currentState.participants.map(p =>
            p.id === participantId ? updatedParticipant : p
          );
          set({ participants: updatedParticipants });

          return updatedParticipant;
        } catch (error) {
          console.error('Failed to update participant:', error);
          set({ error: 'Failed to update participant' });
          throw error;
        }
      },

      deleteParticipant: async (participantId) => {
        try {
          await participantsStore.delete(participantId);

          const currentState = get();
          set({
            participants: currentState.participants.filter(p => p.id !== participantId)
          });
        } catch (error) {
          console.error('Failed to delete participant:', error);
          set({ error: 'Failed to delete participant' });
          throw error;
        }
      },

      // Expense management
      addExpense: async (expenseData) => {
        try {
          const newExpense = {
            id: crypto.randomUUID(),
            ...expenseData,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await expensesStore.add(newExpense);

          const currentState = get();
          set({
            expenses: [...currentState.expenses, newExpense]
          });

          // Notify about expense creation
          const group = currentState.groups.find(g => g.id === newExpense.groupId);
          const notificationStore = useNotificationStore.getState();
          notificationStore.notifyExpenseAdded(newExpense, group?.name || 'Unknown Group');

          return newExpense;
        } catch (error) {
          console.error('Failed to add expense:', error);
          set({ error: 'Failed to add expense' });
          throw error;
        }
      },

      updateExpense: async (expenseId, updates) => {
        try {
          const existingExpense = get().expenses.find(e => e.id === expenseId);
          if (!existingExpense) throw new Error('Expense not found');

          const updatedExpense = {
            ...existingExpense,
            ...updates,
            updatedAt: new Date()
          };

          await expensesStore.put(updatedExpense);

          const currentState = get();
          const updatedExpenses = currentState.expenses.map(e =>
            e.id === expenseId ? updatedExpense : e
          );
          set({ expenses: updatedExpenses });

          return updatedExpense;
        } catch (error) {
          console.error('Failed to update expense:', error);
          set({ error: 'Failed to update expense' });
          throw error;
        }
      },

      deleteExpense: async (expenseId) => {
        try {
          await expensesStore.delete(expenseId);

          const currentState = get();
          set({
            expenses: currentState.expenses.filter(e => e.id !== expenseId)
          });
        } catch (error) {
          console.error('Failed to delete expense:', error);
          set({ error: 'Failed to delete expense' });
          throw error;
        }
      },

      // Settlement management
      addSettlement: async (settlementData) => {
        try {
          const newSettlement = {
            id: crypto.randomUUID(),
            ...settlementData,
            settledAt: new Date()
          };

          await settlementsStore.add(newSettlement);

          const currentState = get();
          set({
            settlements: [...currentState.settlements, newSettlement]
          });

          // Notify about debt settlement
          const fromParticipant = currentState.participants.find(p => p.id === newSettlement.fromId);
          const toParticipant = currentState.participants.find(p => p.id === newSettlement.toId);
          const notificationStore = useNotificationStore.getState();
          notificationStore.notifyDebtSettled(
            fromParticipant?.name || 'Unknown',
            toParticipant?.name || 'Unknown',
            newSettlement.amount,
            newSettlement.currency
          );

          return newSettlement;
        } catch (error) {
          console.error('Failed to add settlement:', error);
          set({ error: 'Failed to add settlement' });
          throw error;
        }
      },

      // Settings management
      updateSettings: (updates) => {
        const currentState = get();
        const newSettings = { ...currentState.settings, ...updates };

        // If currency is being updated, also update current group's currency
        if (updates.defaultCurrency && currentState.currentGroupId) {
          const updatedGroups = currentState.groups.map(group =>
            group.id === currentState.currentGroupId
              ? { ...group, currency: updates.defaultCurrency }
              : group
          );

          set({
            settings: newSettings,
            groups: updatedGroups
          });
        } else {
          set({
            settings: newSettings
          });
        }
      },

      // Computed getters
      getCurrentGroup: () => {
        const { groups, currentGroupId } = get();
        return groups.find(g => g.id === currentGroupId) || null;
      },

      getGroupParticipants: (groupId) => {
        const { participants } = get();
        return participants.filter(p => p.groupId === groupId);
      },

      getGroupExpenses: (groupId) => {
        const { expenses } = get();
        return expenses.filter(e => e.groupId === groupId).sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      getGroupDebts: (groupId) => {
        if (!groupId) {
          console.warn('getGroupDebts: groupId is required');
          return [];
        }

        const expenses = get().getGroupExpenses(groupId) || [];
        const participants = get().getGroupParticipants(groupId) || [];

        console.log('getGroupDebts:', { groupId, expenses: expenses.length, participants: participants.length });

        return calculateDebts(expenses, participants);
      },

      // Force load seed data
      forceLoadSeedData: () => {
        console.log('🔄 Force loading seed data...');
        const seedData = generateSeedData();

        set({
          groups: seedData.groups,
          participants: seedData.participants,
          expenses: seedData.expenses,
          settlements: seedData.settlements,
          currentGroupId: seedData.groups[0].id
        });

        console.log('✅ Seed data loaded successfully!');
        console.log(`📊 Loaded: ${seedData.groups.length} groups, ${seedData.participants.length} participants, ${seedData.expenses.length} expenses`);
      },

      // Clear all data
      clearAllData: async () => {
        try {
          set({ isLoading: true });
          console.log('🗑️ Starting to clear all data...');

          // Clear IndexedDB stores
          console.log('🗄️ Clearing IndexedDB stores...');
          await Promise.all([
            groupsStore.clear(),
            expensesStore.clear(),
            participantsStore.clear(),
            settlementsStore.clear(),
            settingsStore.clear()
          ]);
          console.log('✅ IndexedDB stores cleared');

          // Reset store state to initial values
          console.log('🔄 Resetting store state...');
          set({
            groups: [],
            participants: [],
            expenses: [],
            settlements: [],
            currentGroupId: null,
            error: null,
            settings: {
              theme: 'system',
              language: 'en',
              defaultCurrency: 'PKR',
              showOnboarding: false,
              notifications: {
                debts: true,
                settlements: true,
                newExpenses: true
              }
            }
          });

          console.log('🎉 All data cleared successfully');

          // Show success notification
          const notificationStore = useNotificationStore.getState();
          notificationStore.notifySuccess(
            'Data Cleared',
            'All data has been successfully cleared from the app.'
          );

          return true;

        } catch (error) {
          console.error('❌ Failed to clear data:', error);

          // Show error notification
          const notificationStore = useNotificationStore.getState();
          notificationStore.notifyError(
            'Clear Data Failed',
            'Failed to clear all data. Please try again.'
          );

          set({ error: 'Failed to clear data: ' + error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }));

// Seed data initialization is handled within the store methods

export default useAppStore;
