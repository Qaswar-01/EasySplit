import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, 
  Users, 
  DollarSign, 
  BarChart3, 
  CreditCard, 
  Settings,
  ChevronRight,
  ChevronDown,
  Play,
  CheckCircle,
  MessageCircle,
  Plus,
  X
} from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const UserGuide = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('whats-new');
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleStep = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const guideData = {
    'whats-new': {
      title: '🆕 What\'s New!',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      steps: [
        {
          id: 'latest-features',
          title: '🚀 Latest Features & Improvements',
          description: 'Discover the newest enhancements',
          content: [
            '🔥 MAJOR UPDATES:',
            '',
            '📱 Smart WhatsApp Integration:',
            '• Auto-detects your device (Android/iOS/Desktop)',
            '• Opens native WhatsApp app when available',
            '• Automatic fallback to WhatsApp Web',
            '• Clear instructions for every platform',
            '',
            '📞 Enhanced Contact Import:',
            '• Import from phone contacts (bulk)',
            '• Browse WhatsApp contacts directly',
            '• Manual contact addition with validation',
            '• Persistent contact storage',
            '',
            '💬 Improved Messaging:',
            '• Better user guidance when sending messages',
            '• Clear instructions after WhatsApp opens',
            '• Professional message pre-filling',
            '',
            '✨ Try these features in Participants and Debts sections!'
          ]
        }
      ]
    },
    'getting-started': {
      title: 'Getting Started',
      icon: <Play className="w-5 h-5" />,
      steps: [
        {
          id: 'first-launch',
          title: 'Welcome to EasySplit!',
          description: 'Your first steps in the app',
          content: [
            '🎉 Welcome! EasySplit automatically loads with sample data',
            '',
            '📊 What you get immediately:',
            '• 3 sample groups: Family, Friends, Work Colleagues',
            '• Pre-loaded participants and expenses',
            '• Real debt calculations and analytics',
            '',
            '🧭 Navigation:',
            '• Desktop: Use sidebar on the left',
            '• Mobile: Use bottom navigation bar',
            '• Switch groups using the dropdown in sidebar',
            '',
            '💡 Tip: Explore sample data first, then create your own!'
          ]
        },
        {
          id: 'create-group',
          title: 'Create Your First Group',
          description: 'Set up a new expense group',
          content: [
            '1. Click "Groups" in the navigation',
            '2. Click the "+" (Add Group) button',
            '3. Enter group name (e.g., "Weekend Trip")',
            '4. Add description (optional)',
            '5. Select currency from dropdown:',
            '   • PKR (₨) - Pakistani Rupee',
            '   • USD ($) - US Dollar',
            '   • EUR (€) - Euro',
            '   • GBP (£) - British Pound',
            '   • INR (₹) - Indian Rupee',
            '6. Click "Create Group"',
            '7. Your new group becomes active automatically'
          ]
        },
        {
          id: 'add-participants',
          title: 'Add Participants',
          description: 'Invite people to your group with smart contact import',
          content: [
            '1. Go to "Participants" page',
            '2. Make sure correct group is selected (check sidebar)',
            '🆕 3. Click "Import Contacts" for multiple import options:',
            '   • "From Contacts" - Import from your phone contacts',
            '   • "From WhatsApp" - Opens WhatsApp app/web to browse contacts',
            '   • "Add New" - Add contacts manually',
            '4. Or click "Add Participant" to add manually',
            '5. Fill in details:',
            '   • Name (required)',
            '   • Phone (+92 300 1234567 format)',
            '   • Email (optional)',
            '6. Enable "Has WhatsApp" for debt reminders',
            '7. Click "Add Participant"'
          ]
        }
      ]
    },
    'expenses': {
      title: 'Managing Expenses',
      icon: <DollarSign className="w-5 h-5" />,
      steps: [
        {
          id: 'add-expense',
          title: 'Add New Expense',
          description: 'Record shared expenses with flexible splitting',
          content: [
            '1. Go to "Expenses" page',
            '2. Click "Add Expense" button',
            '3. Fill in expense details:',
            '   • Description (e.g., "Dinner at restaurant")',
            '   • Amount (in group currency)',
            '   • Date (defaults to today)',
            '4. Select who paid for it (can be multiple people)',
            '5. Choose category from dropdown',
            '6. Select participants to split between',
            '7. Choose split type and configure:',
            '   • Equal: Automatic equal division',
            '   • Fixed: Set specific amounts per person',
            '   • Percentage: Assign percentage shares',
            '8. Review split preview',
            '9. Click "Add Expense"'
          ]
        },
        {
          id: 'split-types',
          title: 'Understanding Split Types',
          description: 'Flexible ways to divide expenses',
          content: [
            '💰 Equal Split:',
            '• Divides amount equally among selected participants',
            '• Example: ₨1000 ÷ 4 people = ₨250 each',
            '',
            '🎯 Fixed Amount Split:',
            '• Set specific amounts for each person',
            '• Great for unequal consumption',
            '• Example: Alice ₨400, Bob ₨300, Carol ₨300',
            '',
            '📊 Percentage Split:',
            '• Assign percentage shares (must total 100%)',
            '• Example: Alice 50%, Bob 25%, Carol 25%',
            '',
            '⚡ Quick tip: Use "Distribute Equally" button to reset splits'
          ]
        },
        {
          id: 'categories',
          title: 'Expense Categories',
          description: 'Organize expenses for better tracking',
          content: [
            '🍽️ Food & Dining: Restaurants, takeout, groceries',
            '🚗 Transportation: Uber, gas, parking, flights',
            '🛍️ Shopping: Clothes, electronics, gifts',
            '🎬 Entertainment: Movies, games, concerts',
            '💡 Bills & Utilities: Electricity, internet, phone',
            '✈️ Travel: Hotels, flights, accommodation',
            '🏥 Healthcare: Medical, pharmacy, fitness',
            '📚 Education: Books, courses, supplies',
            '🥬 Groceries: Food shopping, household items',
            '📦 Other: Miscellaneous expenses',
            '',
            '💡 Categories help with analytics and spending insights!'
          ]
        },
        {
          id: 'multiple-payers',
          title: 'Multiple Payers Support',
          description: 'Handle complex payment scenarios',
          content: [
            '👥 Multiple people can pay for one expense:',
            '',
            '📝 How it works:',
            '1. Select multiple people in "Who paid?" section',
            '2. System automatically splits payment equally among payers',
            '3. Then splits expense among selected participants',
            '',
            '💡 Example scenario:',
            '• ₨1000 dinner expense',
            '• Alice and Bob both paid (₨500 each)',
            '• Split among Alice, Bob, Carol, David (₨250 each)',
            '• Result: Alice owes ₨0, Bob owes ₨0, Carol owes ₨250, David owes ₨250',
            '',
            '✨ Perfect for shared payments and complex scenarios!'
          ]
        }
      ]
    },
    'debts': {
      title: 'Debt Management',
      icon: <CreditCard className="w-5 h-5" />,
      steps: [
        {
          id: 'understanding-debts',
          title: 'Understanding Debt Optimization',
          description: 'Smart debt calculation and minimization',
          content: [
            '🧮 How EasySplit calculates debts:',
            '1. Analyzes all expenses in the current group',
            '2. Calculates who paid vs. who owes',
            '3. Uses smart optimization to minimize transactions',
            '',
            '💡 Example optimization:',
            '• Without optimization: A→B ₨100, B→C ₨100, C→A ₨100',
            '• With optimization: No transactions needed!',
            '',
            '🎨 Visual indicators:',
            '• 🟢 Green cards: Money you are owed',
            '• 🔴 Red cards: Money you owe others',
            '• 💰 Amounts update automatically with new expenses'
          ]
        },
        {
          id: 'whatsapp-reminders',
          title: '🆕 Enhanced WhatsApp Reminders',
          description: 'Smart messaging with device detection',
          content: [
            '📱 Quick Remind (Instant):',
            '1. Click "Quick Remind" on any debt card',
            '2. WhatsApp opens with pre-filled professional message',
            '3. Clear instructions guide you to send',
            '4. Message includes debt amount and group details',
            '',
            '⏰ Schedule Reminder (Later):',
            '1. Click "Schedule" on debt card',
            '2. Set date and time for reminder',
            '3. Customize message or use default',
            '4. Reminder sends automatically at scheduled time',
            '',
            '🚀 Smart Features:',
            '• Auto-detects Android/iOS/Desktop',
            '• Opens native WhatsApp app when available',
            '• Falls back to WhatsApp Web automatically',
            '• Professional message templates included'
          ]
        },
        {
          id: 'settle-debts',
          title: 'Settlement Management',
          description: 'Record and track payments',
          content: [
            '💳 Recording Settlements:',
            '1. When someone pays you, click "Settle Up"',
            '2. Confirm the settlement amount',
            '3. Add payment method notes:',
            '   • "Paid via bank transfer"',
            '   • "Cash payment"',
            '   • "Mobile payment (JazzCash/EasyPaisa)"',
            '4. Click "Record Settlement"',
            '',
            '📊 Settlement Tracking:',
            '• Debt automatically updates or disappears',
            '• Settlement history is preserved',
            '• Both parties can see settlement records',
            '• Analytics include settlement data',
            '',
            '✨ Partial settlements supported for large amounts!'
          ]
        },
        {
          id: 'debt-features',
          title: 'Advanced Debt Features',
          description: 'Additional debt management tools',
          content: [
            '🔄 Automatic Updates:',
            '• Debts recalculate when expenses are added/edited',
            '• Real-time optimization minimizes transactions',
            '• Group switching updates debt view instantly',
            '',
            '📞 Contact Integration:',
            '• Import contacts for easy WhatsApp access',
            '• Phone numbers enable direct messaging',
            '• Contact photos and names from your phone',
            '',
            '🎯 Smart Notifications:',
            '• Get notified when someone owes you money',
            '• Reminders for your own pending payments',
            '• Settlement confirmations and updates',
            '',
            '💡 Pro Tips:',
            '• Use "Quick Remind" for gentle nudges',
            '• Schedule reminders for appropriate times',
            '• Add context in settlement notes for clarity'
          ]
        }
      ]
    },
    'analytics': {
      title: 'Analytics & Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      steps: [
        {
          id: 'dashboard-overview',
          title: 'Dashboard Overview',
          description: 'Quick insights at a glance',
          content: [
            '📊 Dashboard provides instant overview:',
            '',
            '💰 Key Metrics:',
            '• Total group expenses',
            '• Your total spending',
            '• Money you owe',
            '• Money owed to you',
            '',
            '📈 Quick Charts:',
            '• Recent expenses timeline',
            '• Category spending breakdown',
            '• Participant contribution summary',
            '',
            '🎯 Smart Insights:',
            '• Spending trends and patterns',
            '• Most expensive categories',
            '• Group activity overview',
            '',
            '💡 All data updates in real-time as you add expenses!'
          ]
        },
        {
          id: 'detailed-analytics',
          title: 'Detailed Analytics Page',
          description: 'Comprehensive spending analysis',
          content: [
            '📊 Go to Analytics page for detailed insights:',
            '',
            '🥧 Category Breakdown (Pie Chart):',
            '• Visual spending distribution by category',
            '• Hover for exact amounts and percentages',
            '• Identify your biggest spending areas',
            '',
            '📊 Participant Contributions (Bar Chart):',
            '• Compare who paid how much',
            '• See contribution balance across group',
            '• Identify heavy spenders vs. light spenders',
            '',
            '📈 Monthly Trends (Line Chart):',
            '• Track spending patterns over time',
            '• Identify seasonal spending variations',
            '• Monitor group expense growth',
            '',
            '💳 Debt Analysis:',
            '• Visual debt relationships',
            '• Outstanding balances overview',
            '• Settlement history and patterns'
          ]
        },
        {
          id: 'insights-tips',
          title: 'Using Analytics Effectively',
          description: 'Get the most from your data',
          content: [
            '💡 Pro Tips for Analytics:',
            '',
            '🎯 Regular Review:',
            '• Check analytics weekly to understand spending',
            '• Compare monthly trends to identify patterns',
            '• Use category breakdown to budget better',
            '',
            '📊 Group Insights:',
            '• Monitor if expenses are fairly distributed',
            '• Identify who contributes most to group expenses',
            '• Track settlement patterns and frequency',
            '',
            '🔍 Expense Optimization:',
            '• Find categories where you overspend',
            '• Identify seasonal spending spikes',
            '• Plan future expenses based on trends',
            '',
            '📱 Mobile vs Desktop:',
            '• Charts are fully responsive',
            '• Touch/hover interactions for details',
            '• Export charts as images (coming soon!)'
          ]
        }
      ]
    },
    'settings': {
      title: 'Settings & Customization',
      icon: <BarChart3 className="w-5 h-5" />,
      steps: [
        {
          id: 'app-settings',
          title: 'App Preferences',
          description: 'Customize your EasySplit experience',
          content: [
            '⚙️ Access Settings from sidebar or header',
            '',
            '🎨 Theme Options:',
            '• Light Mode: Clean, bright interface',
            '• Dark Mode: Easy on the eyes, battery-friendly',
            '• System: Follows your device theme automatically',
            '',
            '🌍 Language & Region:',
            '• English (default)',
            '• Urdu (اردو) - Full RTL support',
            '• More languages coming soon!',
            '',
            '💰 Currency Settings:',
            '• Default currency for new groups',
            '• Supports PKR, USD, EUR, GBP, INR, JPY, CNY',
            '• Custom symbols and formatting',
            '',
            '🔔 Notification Preferences:',
            '• Debt reminders',
            '• Settlement notifications',
            '• New expense alerts'
          ]
        },
        {
          id: 'data-management',
          title: 'Data Management',
          description: 'Backup, import, and manage your data',
          content: [
            '💾 Data Backup & Restore:',
            '',
            '📤 Export Data:',
            '• Downloads complete JSON backup',
            '• Includes all groups, participants, expenses, settlements',
            '• File named with current date for easy organization',
            '• Safe to store in cloud or share between devices',
            '',
            '📥 Import Data:',
            '• Restore from previous backup',
            '• Merge data from other devices',
            '• Validates file format before import',
            '• Shows import summary with counts',
            '',
            '🗑️ Clear All Data:',
            '• Complete app reset option',
            '• Requires confirmation to prevent accidents',
            '• Cannot be undone - backup first!',
            '',
            '🌱 Sample Data:',
            '• Load demo groups and expenses',
            '• Perfect for testing and learning',
            '• Includes realistic Pakistani expense scenarios'
          ]
        },
        {
          id: 'pwa-features',
          title: 'Progressive Web App Features',
          description: 'Install and use EasySplit like a native app',
          content: [
            '📱 PWA Installation:',
            '',
            '🔽 How to Install:',
            '• Chrome: Click install prompt or menu → "Install EasySplit"',
            '• Safari: Share button → "Add to Home Screen"',
            '• Edge: Settings menu → "Apps" → "Install this site as an app"',
            '',
            '✨ Benefits of Installation:',
            '• Works offline completely',
            '• Faster loading and performance',
            '• Native app-like experience',
            '• No browser address bar',
            '• Appears in app drawer/start menu',
            '',
            '🔄 Offline Support:',
            '• All data stored locally in IndexedDB',
            '• Add expenses without internet',
            '• Sync when connection returns',
            '• Never lose your data',
            '',
            '🔔 Push Notifications (Coming Soon):',
            '• Debt reminder notifications',
            '• Settlement confirmations',
            '• New expense alerts'
          ]
        }
      ]
    },
    'whatsapp': {
      title: 'WhatsApp Integration',
      icon: <MessageCircle className="w-5 h-5" />,
      steps: [
        {
          id: 'smart-contact-import',
          title: '🚀 Smart Contact Import (NEW!)',
          description: 'Multiple ways to import WhatsApp contacts',
          content: [
            '🔥 REVOLUTIONARY FEATURES:',
            '',
            '🧠 Smart Device Detection:',
            '• Automatically detects Android/iOS/Desktop',
            '• Chooses best WhatsApp option for your device',
            '• Native app priority with automatic fallback',
            '• Seamless experience across all platforms',
            '',
            '📱 Three Import Methods:',
            '',
            '1️⃣ "From Contacts" (Phone Integration):',
            '• Bulk import from your phone contact list',
            '• Uses native Contact Picker API',
            '• Filters contacts with phone numbers',
            '• Instant import of multiple contacts',
            '',
            '2️⃣ "From WhatsApp" (Smart App Opening):',
            '• 🤖 Android: Opens WhatsApp app → Falls back to web',
            '• 💻 Desktop: Opens WhatsApp Desktop → Falls back to web',
            '• 🍎 iOS: Opens WhatsApp Web with QR instructions',
            '• Browse your actual WhatsApp contact list',
            '• Copy contact details directly from WhatsApp',
            '',
            '3️⃣ "Add New" (Manual Entry):',
            '• Manual contact addition with validation',
            '• Phone number format checking',
            '• Persistent storage across sessions'
          ]
        },
        {
          id: 'enhanced-messaging',
          title: '✨ Enhanced Messaging Experience',
          description: 'Professional debt reminders with clear guidance',
          content: [
            '💬 Improved Message Sending:',
            '',
            '🎯 Quick Remind Feature:',
            '• Click "Quick Remind" on any debt card',
            '• WhatsApp opens with professional pre-filled message',
            '• Clear popup instructions guide you step-by-step',
            '• Message includes debt amount and group context',
            '',
            '📝 Message Template Example:',
            '"Hi [Name]! 👋 Just a friendly reminder about our shared expense in [Group Name]. You owe ₨[Amount] for [expense details]. Thanks! 💰"',
            '',
            '🎯 User Guidance Improvements:',
            '• Clear instructions appear after WhatsApp opens',
            '• Step-by-step guidance for sending messages',
            '• Professional message templates included',
            '• No more confusion about what to do next',
            '',
            '⏰ Scheduled Reminders:',
            '• Set future reminder dates and times',
            '• Automatic WhatsApp opening at scheduled time',
            '• Customizable reminder messages',
            '• Persistent reminder storage'
          ]
        },
        {
          id: 'setup-whatsapp',
          title: 'Setting Up WhatsApp Integration',
          description: 'Enable WhatsApp features for participants',
          content: [
            '📞 Phone Number Setup:',
            '',
            '✅ Correct Format Examples:',
            '• Pakistan: +92 300 1234567',
            '• India: +91 98765 43210',
            '• USA: +1 555 123 4567',
            '• UK: +44 7700 900123',
            '',
            '⚙️ Setup Process:',
            '1. Add participants with phone numbers',
            '2. Use international format (+country code)',
            '3. Enable "Has WhatsApp" checkbox',
            '4. Test with WhatsApp icon next to participant',
            '5. Use "Import Contacts" for bulk setup',
            '',
            '🔧 Troubleshooting:',
            '• Ensure phone numbers include country code',
            '• Check WhatsApp is installed on target device',
            '• Verify contact has WhatsApp account',
            '• Test with your own number first',
            '',
            '💡 Pro Tips:',
            '• Import contacts once, use everywhere',
            '• Contacts persist across app sessions',
            '• Works with both individual and group chats',
            '• Messages are professional and contextual'
          ]
        },
        {
          id: 'whatsapp-best-practices',
          title: 'WhatsApp Best Practices',
          description: 'Tips for effective debt communication',
          content: [
            '� Communication Best Practices:',
            '',
            '⏰ Timing Matters:',
            '• Send reminders during appropriate hours',
            '• Avoid late night or very early messages',
            '• Consider time zones for international groups',
            '',
            '� Message Tone:',
            '• Keep messages friendly and professional',
            '• Include context (group name, expense details)',
            '• Use emojis to keep tone light',
            '• Avoid aggressive or demanding language',
            '',
            '� Frequency Guidelines:',
            '• Start with gentle reminders',
            '• Space out follow-up messages',
            '• Use scheduled reminders for consistency',
            '• Escalate politely if needed',
            '',
            '🤝 Relationship Management:',
            '• Remember these are friends/family',
            '• Focus on clarity, not pressure',
            '• Offer payment method suggestions',
            '• Be understanding of financial situations',
            '',
            '✨ EasySplit helps maintain friendships while managing money!'
          ]
        }
      ]
    }
  };

  const sections = Object.keys(guideData);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="EasySplit User Guide" size="xl">
      <div className="flex h-96 max-h-96">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 pr-4">
          <div className="space-y-2">
            {sections.map((sectionKey) => {
              const section = guideData[sectionKey];
              return (
                <button
                  key={sectionKey}
                  onClick={() => setActiveSection(sectionKey)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    sectionKey === 'whats-new'
                      ? activeSection === sectionKey
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 text-green-600 dark:text-green-400 border-2 border-green-200 dark:border-green-700'
                        : 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/20 dark:hover:to-blue-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700'
                      : activeSection === sectionKey
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {section.icon}
                      <span className="font-medium truncate">{section.title}</span>
                    </div>
                    {sectionKey === 'whatsapp' && (
                      <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 ml-2">
                        NEW
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pl-4 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              {guideData[activeSection].icon}
              <span>{guideData[activeSection].title}</span>
            </h3>

            <div className="space-y-3">
              {guideData[activeSection].steps.map((step) => (
                <div key={step.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {step.description}
                        </p>
                      </div>
                      {expandedSteps[step.id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedSteps[step.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                          <div className="space-y-2">
                            {step.content.map((item, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          🆕 Check out "What's New" for the latest WhatsApp integration features!
        </div>
        <Button onClick={onClose} variant="primary" className="sm:ml-4">
          Got it!
        </Button>
      </div>
    </Modal>
  );
};

export default UserGuide;
