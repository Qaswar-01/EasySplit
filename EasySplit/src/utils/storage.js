/**
 * Storage utilities for offline data persistence using IndexedDB
 */

import { openDB } from 'idb';

const DB_NAME = 'EasySplitDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  GROUPS: 'groups',
  EXPENSES: 'expenses',
  PARTICIPANTS: 'participants',
  SETTLEMENTS: 'settlements',
  SETTINGS: 'settings'
};

let dbInstance = null;

/**
 * Initialize IndexedDB database
 */
export const initDB = async () => {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Groups store
        if (!db.objectStoreNames.contains(STORES.GROUPS)) {
          const groupStore = db.createObjectStore(STORES.GROUPS, { keyPath: 'id' });
          groupStore.createIndex('createdAt', 'createdAt');
          groupStore.createIndex('updatedAt', 'updatedAt');
        }

        // Expenses store
        if (!db.objectStoreNames.contains(STORES.EXPENSES)) {
          const expenseStore = db.createObjectStore(STORES.EXPENSES, { keyPath: 'id' });
          expenseStore.createIndex('groupId', 'groupId');
          expenseStore.createIndex('date', 'date');
          expenseStore.createIndex('createdAt', 'createdAt');
        }

        // Participants store
        if (!db.objectStoreNames.contains(STORES.PARTICIPANTS)) {
          const participantStore = db.createObjectStore(STORES.PARTICIPANTS, { keyPath: 'id' });
          participantStore.createIndex('groupId', 'groupId');
          participantStore.createIndex('name', 'name');
        }

        // Settlements store
        if (!db.objectStoreNames.contains(STORES.SETTLEMENTS)) {
          const settlementStore = db.createObjectStore(STORES.SETTLEMENTS, { keyPath: 'id' });
          settlementStore.createIndex('groupId', 'groupId');
          settlementStore.createIndex('settledAt', 'settledAt');
        }

        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      },
    });

    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    throw error;
  }
};

/**
 * Generic CRUD operations for IndexedDB
 */
export class DBStore {
  constructor(storeName) {
    this.storeName = storeName;
  }

  async getDB() {
    if (!dbInstance) {
      await initDB();
    }
    return dbInstance;
  }

  async getAll() {
    const db = await this.getDB();
    return await db.getAll(this.storeName);
  }

  async getById(id) {
    const db = await this.getDB();
    return await db.get(this.storeName, id);
  }

  async getByIndex(indexName, value) {
    const db = await this.getDB();
    return await db.getAllFromIndex(this.storeName, indexName, value);
  }

  async add(item) {
    const db = await this.getDB();
    return await db.add(this.storeName, item);
  }

  async put(item) {
    const db = await this.getDB();
    return await db.put(this.storeName, item);
  }

  async delete(id) {
    const db = await this.getDB();
    return await db.delete(this.storeName, id);
  }

  async clear() {
    const db = await this.getDB();
    return await db.clear(this.storeName);
  }

  async count() {
    const db = await this.getDB();
    return await db.count(this.storeName);
  }
}

// Store instances
export const groupsStore = new DBStore(STORES.GROUPS);
export const expensesStore = new DBStore(STORES.EXPENSES);
export const participantsStore = new DBStore(STORES.PARTICIPANTS);
export const settlementsStore = new DBStore(STORES.SETTLEMENTS);
export const settingsStore = new DBStore(STORES.SETTINGS);

/**
 * Fallback to localStorage for settings and simple data
 */
export const localStorageUtils = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

/**
 * Export/Import functionality for data backup
 */
export const exportData = async () => {
  try {
    const groups = await groupsStore.getAll();
    const expenses = await expensesStore.getAll();
    const participants = await participantsStore.getAll();
    const settlements = await settlementsStore.getAll();
    const settings = await settingsStore.getAll();

    return {
      version: DB_VERSION,
      timestamp: new Date().toISOString(),
      data: {
        groups,
        expenses,
        participants,
        settlements,
        settings
      }
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importData = async (exportedData) => {
  try {
    const { data } = exportedData;
    
    // Clear existing data
    await Promise.all([
      groupsStore.clear(),
      expensesStore.clear(),
      participantsStore.clear(),
      settlementsStore.clear(),
      settingsStore.clear()
    ]);

    // Import new data
    await Promise.all([
      ...data.groups.map(group => groupsStore.put(group)),
      ...data.expenses.map(expense => expensesStore.put(expense)),
      ...data.participants.map(participant => participantsStore.put(participant)),
      ...data.settlements.map(settlement => settlementsStore.put(settlement)),
      ...data.settings.map(setting => settingsStore.put(setting))
    ]);

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};
