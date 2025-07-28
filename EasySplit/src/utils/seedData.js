/**
 * Seed data for EasySplit app
 * Creates sample groups, participants, and expenses for demonstration
 */

export const generateSeedData = () => {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Generate unique IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Sample groups
  const groups = [
    {
      id: 'family-group-001',
      name: 'Family',
      description: 'Family expenses and shared costs',
      currency: 'PKR',
      createdAt: lastMonth.toISOString(),
      updatedAt: now.toISOString(),
      color: '#10b981', // emerald
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 'friends-group-001',
      name: 'Friends',
      description: 'Hangouts, trips, and shared activities',
      currency: 'PKR',
      createdAt: lastMonth.toISOString(),
      updatedAt: now.toISOString(),
      color: '#3b82f6', // blue
      icon: '👥'
    },
    {
      id: 'work-group-001',
      name: 'Work Colleagues',
      description: 'Office lunches, team events, and work-related expenses',
      currency: 'PKR',
      createdAt: lastMonth.toISOString(),
      updatedAt: now.toISOString(),
      color: '#8b5cf6', // purple
      icon: '💼'
    }
  ];

  // Sample participants
  const participants = [
    // Family group participants
    {
      id: 'participant-001',
      groupId: 'family-group-001',
      name: 'Ahmed Khan',
      email: 'ahmed.khan@email.com',
      phone: '+92 300 1234567',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    },
    {
      id: 'participant-002',
      groupId: 'family-group-001',
      name: 'Fatima Khan',
      email: 'fatima.khan@email.com',
      phone: '+92 301 2345678',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    },
    {
      id: 'participant-003',
      groupId: 'family-group-001',
      name: 'Ali Khan',
      email: 'ali.khan@email.com',
      phone: '+92 302 3456789',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    },

    // Friends group participants
    {
      id: 'participant-004',
      groupId: 'friends-group-001',
      name: 'Sara Ahmed',
      email: 'sara.ahmed@email.com',
      phone: '+92 303 4567890',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    },
    {
      id: 'participant-005',
      groupId: 'friends-group-001',
      name: 'Hassan Ali',
      email: 'hassan.ali@email.com',
      phone: '+92 304 5678901',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    },
    {
      id: 'participant-006',
      groupId: 'friends-group-001',
      name: 'Zara Sheikh',
      email: 'zara.sheikh@email.com',
      phone: '+92 305 6789012',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    },
    {
      id: 'participant-007',
      groupId: 'friends-group-001',
      name: 'Omar Malik',
      email: 'omar.malik@email.com',
      phone: '+92 306 7890123',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    },

    // Work colleagues participants
    {
      id: 'participant-008',
      groupId: 'work-group-001',
      name: 'Ayesha Siddiqui',
      email: 'ayesha.siddiqui@company.com',
      phone: '+92 307 8901234',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    },
    {
      id: 'participant-009',
      groupId: 'work-group-001',
      name: 'Usman Tariq',
      email: 'usman.tariq@company.com',
      phone: '+92 308 9012345',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    },
    {
      id: 'participant-010',
      groupId: 'work-group-001',
      name: 'Nadia Iqbal',
      email: 'nadia.iqbal@company.com',
      phone: '+92 309 0123456',
      hasWhatsApp: true,
      createdAt: lastMonth.toISOString()
    }
  ];

  // Sample expenses
  const expenses = [
    // Family expenses
    {
      id: 'expense-001',
      groupId: 'family-group-001',
      description: 'Grocery Shopping',
      amount: 8500,
      currency: 'PKR',
      category: 'Food & Dining',
      paidBy: ['participant-001'],
      splitBetween: ['participant-001', 'participant-002', 'participant-003'],
      splitType: 'equal',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-002',
      groupId: 'family-group-001',
      description: 'Electricity Bill',
      amount: 12000,
      currency: 'PKR',
      category: 'Utilities',
      paidBy: ['participant-002'],
      splitBetween: ['participant-001', 'participant-002', 'participant-003'],
      splitType: 'equal',
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-003',
      groupId: 'family-group-001',
      description: 'Internet Bill',
      amount: 3500,
      currency: 'PKR',
      category: 'Utilities',
      paidBy: ['participant-003'],
      splitBetween: ['participant-001', 'participant-002', 'participant-003'],
      splitType: 'equal',
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-009',
      groupId: 'family-group-001',
      description: 'Gas Bill',
      amount: 4200,
      currency: 'PKR',
      category: 'Utilities',
      paidBy: ['participant-001'],
      splitBetween: ['participant-001', 'participant-002', 'participant-003'],
      splitType: 'equal',
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-010',
      groupId: 'family-group-001',
      description: 'Family Dinner',
      amount: 5500,
      currency: 'PKR',
      category: 'Food & Dining',
      paidBy: ['participant-002'],
      splitBetween: ['participant-001', 'participant-002', 'participant-003'],
      splitType: 'equal',
      date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },

    // Friends expenses
    {
      id: 'expense-004',
      groupId: 'friends-group-001',
      description: 'Pizza Night',
      amount: 4500,
      currency: 'PKR',
      category: 'Food & Dining',
      paidBy: ['participant-004'],
      splitBetween: ['participant-004', 'participant-005', 'participant-006', 'participant-007'],
      splitType: 'equal',
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-005',
      groupId: 'friends-group-001',
      description: 'Movie Tickets',
      amount: 2800,
      currency: 'PKR',
      category: 'Entertainment',
      paidBy: ['participant-005'],
      splitBetween: ['participant-004', 'participant-005', 'participant-006', 'participant-007'],
      splitType: 'equal',
      date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-006',
      groupId: 'friends-group-001',
      description: 'Uber Ride',
      amount: 1200,
      currency: 'PKR',
      category: 'Transportation',
      paidBy: ['participant-006'],
      splitBetween: ['participant-004', 'participant-005', 'participant-006', 'participant-007'],
      splitType: 'equal',
      date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-011',
      groupId: 'friends-group-001',
      description: 'Coffee Shop',
      amount: 1800,
      currency: 'PKR',
      category: 'Food & Dining',
      paidBy: ['participant-007'],
      splitBetween: ['participant-004', 'participant-005', 'participant-006', 'participant-007'],
      splitType: 'equal',
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-012',
      groupId: 'friends-group-001',
      description: 'Gaming Zone',
      amount: 3200,
      currency: 'PKR',
      category: 'Entertainment',
      paidBy: ['participant-004'],
      splitBetween: ['participant-004', 'participant-005', 'participant-006'],
      splitType: 'equal',
      date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },

    // Work expenses
    {
      id: 'expense-007',
      groupId: 'work-group-001',
      description: 'Team Lunch',
      amount: 6000,
      currency: 'PKR',
      category: 'Food & Dining',
      paidBy: ['participant-008'],
      splitBetween: ['participant-008', 'participant-009', 'participant-010'],
      splitType: 'equal',
      date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-008',
      groupId: 'work-group-001',
      description: 'Office Supplies',
      amount: 2500,
      currency: 'PKR',
      category: 'Other',
      paidBy: ['participant-009'],
      splitBetween: ['participant-008', 'participant-009', 'participant-010'],
      splitType: 'equal',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-013',
      groupId: 'work-group-001',
      description: 'Coffee for Meeting',
      amount: 1500,
      currency: 'PKR',
      category: 'Food & Dining',
      paidBy: ['participant-010'],
      splitBetween: ['participant-008', 'participant-009', 'participant-010'],
      splitType: 'equal',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'expense-014',
      groupId: 'work-group-001',
      description: 'Team Building Event',
      amount: 8000,
      currency: 'PKR',
      category: 'Entertainment',
      paidBy: ['participant-008'],
      splitBetween: ['participant-008', 'participant-009', 'participant-010'],
      splitType: 'equal',
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    groups,
    participants,
    expenses,
    settlements: [] // No settlements initially
  };
};

/**
 * Check if seed data should be loaded
 * Only load if no groups exist
 */
export const shouldLoadSeedData = (currentData) => {
  return !currentData.groups || currentData.groups.length === 0;
};

/**
 * Load seed data into the store
 */
export const loadSeedData = (store) => {
  const seedData = generateSeedData();
  
  store.setState({
    groups: seedData.groups,
    participants: seedData.participants,
    expenses: seedData.expenses,
    settlements: seedData.settlements,
    currentGroupId: seedData.groups[0].id // Set Family as default group
  });
  
  console.log('✅ Seed data loaded successfully!');
  console.log(`📊 Loaded: ${seedData.groups.length} groups, ${seedData.participants.length} participants, ${seedData.expenses.length} expenses`);
};
