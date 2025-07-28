import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  User,
  Search,
  X,
  Check,
  Plus,
  Download,
  Users
} from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import Input from '../UI/Input';

// Function to clear all sample contact data
// To manually clear in browser console, run:
// ['whatsapp-contacts','participant-contacts','contacts','sample-contacts','participant-whatsapp-contacts'].forEach(key => localStorage.removeItem(key)); location.reload();
const clearAllSampleContacts = () => {
  const keysToRemove = [
    'whatsapp-contacts',
    'participant-contacts',
    'contacts',
    'sample-contacts',
    'participant-whatsapp-contacts'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('🧹 Cleared all sample contact data from localStorage');
};

const WhatsAppContactPicker = ({
  isOpen,
  onClose,
  onContactSelect,
  currentContact = null,
  title = "Select WhatsApp Contact"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(currentContact);
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [addContactErrors, setAddContactErrors] = useState({});
  const [isMonitoringClipboard, setIsMonitoringClipboard] = useState(false);
  const [clipboardInterval, setClipboardInterval] = useState(null);
  const [lastClipboardContent, setLastClipboardContent] = useState('');

  // No sample contacts - users should import or add manually

  // Clear sample contacts on component mount
  useEffect(() => {
    // Clear all sample contact data
    clearAllSampleContacts();

    // Also clear any existing contacts in state
    setContacts([]);
    setFilteredContacts([]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Clear all sample contact data every time modal opens
      clearAllSampleContacts();

      // Start with empty contacts - users must import their own
      setContacts([]);
      setFilteredContacts([]);
      setSelectedContact(currentContact);
    }
  }, [isOpen, currentContact]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  const handleConfirm = () => {
    if (selectedContact) {
      onContactSelect(selectedContact);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedContact(currentContact);
    setSearchQuery('');
    setShowAddContactForm(false);
    setNewContact({ name: '', phone: '' });
    setAddContactErrors({});
    onClose();
  };

  const openWhatsAppDirectly = (contact) => {
    const whatsappUrl = `https://wa.me/${contact.phone.replace(/[^\d]/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  const validateNewContact = () => {
    const errors = {};

    if (!newContact.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!newContact.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      // Basic phone validation
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(newContact.phone.trim())) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    // Check if contact already exists
    const existingContact = contacts.find(contact =>
      contact.phone.replace(/[^\d]/g, '') === newContact.phone.replace(/[^\d]/g, '')
    );
    if (existingContact) {
      errors.phone = 'Contact with this phone number already exists';
    }

    setAddContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddContact = () => {
    if (!validateNewContact()) {
      return;
    }

    // Format phone number
    let formattedPhone = newContact.phone.trim();
    if (!formattedPhone.startsWith('+')) {
      // Add country code if not present (assuming Pakistan +92)
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+92' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('92')) {
        formattedPhone = '+92' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    const newContactData = {
      id: Date.now().toString(),
      name: newContact.name.trim(),
      phone: formattedPhone,
      hasWhatsApp: true
    };

    // Add to contacts list
    const updatedContacts = [...contacts, newContactData];
    setContacts(updatedContacts);
    setFilteredContacts(updatedContacts);

    // Save to localStorage
    localStorage.setItem('whatsapp-contacts', JSON.stringify(updatedContacts));

    // Auto-select the new contact
    setSelectedContact(newContactData);

    // Reset form
    setNewContact({ name: '', phone: '' });
    setAddContactErrors({});
    setShowAddContactForm(false);
  };

  // Smart clipboard monitoring for automatic contact detection
  const startClipboardMonitoring = () => {
    setIsMonitoringClipboard(true);

    const interval = setInterval(async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipboardText = await navigator.clipboard.readText();

          // Check if clipboard content changed and contains contact info
          if (clipboardText !== lastClipboardContent && clipboardText.length > 5) {
            setLastClipboardContent(clipboardText);

            // Try to parse contact information
            const phoneRegex = /(\+?\d{1,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/g;
            const phones = clipboardText.match(phoneRegex);

            if (phones && phones.length > 0) {
              const phone = phones[0];
              const cleanPhone = phone.replace(/[\s\-]/g, '');

              // Try to extract name
              let name = '';
              const lines = clipboardText.split('\n');
              const phoneLineIndex = lines.findIndex(line => line.includes(phone));

              if (phoneLineIndex >= 0) {
                const phoneLine = lines[phoneLineIndex];
                const nameMatch = phoneLine.replace(phone, '').trim();
                if (nameMatch && nameMatch.length > 0) {
                  name = nameMatch;
                } else if (phoneLineIndex > 0) {
                  const prevLine = lines[phoneLineIndex - 1].trim();
                  if (prevLine && prevLine.length > 0) {
                    name = prevLine;
                  }
                }
              }

              // If no name found, try to extract from the text
              if (!name) {
                const textWithoutPhone = clipboardText.replace(phone, '').trim();
                const words = textWithoutPhone.split(/\s+/).filter(word =>
                  word.length > 1 && !/^\d+$/.test(word) && !word.includes('@')
                );
                if (words.length > 0) {
                  name = words.slice(0, 2).join(' '); // Take first two words as name
                }
              }

              if (!name) {
                name = 'WhatsApp Contact';
              }

              // Show quick add dialog
              const confirmed = confirm(
                `📱 Contact detected in clipboard!\n\n` +
                `Name: ${name}\n` +
                `Phone: ${cleanPhone}\n\n` +
                `Would you like to add this contact?`
              );

              if (confirmed) {
                const contact = {
                  id: `clipboard-${Date.now()}`,
                  name: name,
                  phone: cleanPhone,
                  hasWhatsApp: true
                };

                const updatedContacts = [...contacts, contact];
                setContacts(updatedContacts);
                setFilteredContacts(updatedContacts);

                localStorage.setItem('whatsapp-contacts', JSON.stringify(updatedContacts));

                alert(`✅ ${name} has been added to your contacts!`);
                stopClipboardMonitoring();
              }
            }
          }
        }
      } catch (error) {
        // Clipboard access might be denied, continue silently
      }
    }, 1000); // Check every second

    setClipboardInterval(interval);

    // Auto-stop after 2 minutes
    setTimeout(() => {
      stopClipboardMonitoring();
    }, 120000);
  };

  const stopClipboardMonitoring = () => {
    setIsMonitoringClipboard(false);
    if (clipboardInterval) {
      clearInterval(clipboardInterval);
      setClipboardInterval(null);
    }
  };

  const importFromPhoneContacts = async () => {
    try {
      // Check if the Contacts API is supported
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };

        const contacts = await navigator.contacts.select(props, opts);

        // Convert to our format
        const importedContacts = contacts.map((contact, index) => ({
          id: `imported-${Date.now()}-${index}`,
          name: contact.name?.[0] || 'Unknown',
          phone: contact.tel?.[0] || '',
          hasWhatsApp: true // Assume they have WhatsApp
        })).filter(contact => contact.phone); // Only include contacts with phone numbers

        if (importedContacts.length > 0) {
          // Add to existing contacts
          const updatedContacts = [...contacts, ...importedContacts];
          setContacts(updatedContacts);
          setFilteredContacts(updatedContacts);

          // Save to localStorage
          localStorage.setItem('whatsapp-contacts', JSON.stringify(updatedContacts));

          alert(`✅ Successfully imported ${importedContacts.length} contacts from your phone!`);
        } else {
          alert('No contacts with phone numbers were found.');
        }
      } else {
        // Fallback for browsers that don't support Contacts API
        alert('📱 Contact import is not supported in this browser.\n\nTo import contacts:\n1. Use Chrome on Android\n2. Or manually add contacts using the "Add New Contact" button');
      }
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        alert('❌ Permission denied. Please allow access to contacts to import them.');
      } else {
        console.error('Error importing contacts:', error);
        alert('❌ Failed to import contacts. Please try again or add contacts manually.');
      }
    }
  };

  const importFromWhatsApp = () => {
    // Detect device type and available WhatsApp options
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isDesktop = !isMobile;

    let message = '';
    let whatsappUrl = '';
    let followUpMessage = '';

    if (isAndroid) {
      // Android device - try to open WhatsApp app first
      message = `📱 Opening WhatsApp for contact import!\n\n📋 Instructions:\n1. WhatsApp app will try to open first\n2. If app doesn't open, WhatsApp Web will open\n3. Browse your contacts and copy contact details\n4. Come back here and use "Add New Contact"\n\n🚀 Ready to open WhatsApp?`;
      whatsappUrl = 'intent://send/#Intent;scheme=whatsapp;package=com.whatsapp;end';
      followUpMessage = `✅ Trying to open WhatsApp app!\n\n📝 Next steps:\n1. Browse your WhatsApp contacts\n2. Copy contact name and phone number\n3. Come back here and click "Add New Contact"\n4. Paste the details\n\n💡 If app didn't open, WhatsApp Web will open as backup!`;
    } else if (isDesktop) {
      // Desktop - check for WhatsApp desktop app, fallback to web
      message = `💻 Opening WhatsApp for contact import!\n\n📋 Instructions:\n1. WhatsApp Desktop app will try to open first\n2. If not installed, WhatsApp Web will open\n3. Browse your contacts and copy contact details\n4. Come back here and use "Add New Contact"\n\n🚀 Ready to open WhatsApp?`;
      whatsappUrl = 'whatsapp://';
      followUpMessage = `✅ Trying to open WhatsApp Desktop!\n\n📝 Next steps:\n1. Browse your WhatsApp contacts\n2. Copy contact name and phone number\n3. Come back here and click "Add New Contact"\n4. Paste the details\n\n💡 If desktop app didn't open, WhatsApp Web will open as backup!`;
    } else {
      // iOS or other mobile - use WhatsApp Web
      message = `📱 Opening WhatsApp Web for contact import!\n\n📋 Instructions:\n1. WhatsApp Web will open in a new tab\n2. Scan QR code with your phone if needed\n3. Browse your contacts and copy contact details\n4. Come back here and use "Add New Contact"\n\n🚀 Ready to open WhatsApp Web?`;
      whatsappUrl = 'https://web.whatsapp.com/';
      followUpMessage = `✅ WhatsApp Web opened!\n\n📝 Next steps:\n1. Scan QR code if needed\n2. Browse your WhatsApp contacts\n3. Copy contact name and phone number\n4. Come back here and click "Add New Contact"\n\n💡 Tip: You can click on contact info to see details!`;
    }

    const confirmed = confirm(message);

    if (confirmed) {
      // Try to open native app first
      if (isAndroid || isDesktop) {
        // Create a hidden link to try opening the native app
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Fallback to WhatsApp Web after a short delay if native app doesn't open
        setTimeout(() => {
          window.open('https://web.whatsapp.com/', '_blank');
        }, 2000);
      } else {
        // Direct to WhatsApp Web for iOS and other platforms
        window.open(whatsappUrl, '_blank');
      }

      // Start clipboard monitoring for automatic contact detection
      setTimeout(() => {
        startClipboardMonitoring();
        alert(followUpMessage + `\n\n🤖 Smart Detection: I'm now monitoring your clipboard for contact info. Just copy any contact details and I'll detect them automatically!`);
      }, 3000);
    }
  };





  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title} size="md">
      <div className="space-y-6">
        {/* Beautiful Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 blur-sm"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search your contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Selected Contact Preview */}
        {selectedContact && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedContact.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedContact.phone}
                  </p>
                </div>
              </div>
              <Check className="w-5 h-5 text-green-600" />
            </div>
          </div>
        )}

        {/* Clipboard Monitoring Status */}
        {isMonitoringClipboard && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Smart Detection Active
                </span>
              </div>
              <button
                onClick={stopClipboardMonitoring}
                className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                Stop
              </button>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Copy any contact details from WhatsApp and I'll detect them automatically!
            </p>
          </div>
        )}

        {/* Smart Detection Card */}
        {!isMonitoringClipboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 shadow-xl mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">🤖 Smart Detection</h4>
                    <p className="text-blue-100 text-sm">AI-powered contact recognition</p>
                  </div>
                </div>
                <button
                  onClick={startClipboardMonitoring}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Start
                </button>
              </div>
              <p className="text-blue-100 text-sm">
                Automatically detects contact info when you copy from WhatsApp
              </p>
            </div>
          </motion.div>
        )}

        {/* Contacts List or Empty State */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selectedContact?.id === contact.id
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg shadow-green-500/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-blue-900/20 hover:shadow-lg hover:shadow-blue-500/10'
                  }`}
                  onClick={() => handleContactSelect(contact)}
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Enhanced Avatar */}
                      <div className="relative">
                        <div className={`w-12 h-12 bg-gradient-to-br ${
                          selectedContact?.id === contact.id
                            ? 'from-green-400 to-emerald-500'
                            : 'from-blue-500 via-purple-500 to-pink-500'
                        } rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        {contact.hasWhatsApp && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                            <MessageCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          {contact.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {contact.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {selectedContact?.id === contact.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openWhatsAppDirectly(contact);
                        }}
                        className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                        title="Open WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                {searchQuery ? (
                  // Search No Results State
                  <div className="space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Search className="w-10 h-10 text-gray-400" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No contacts found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                        No contacts match "{searchQuery}". Try a different search term.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Empty State
                  <div className="space-y-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="relative"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                        <MessageCircle className="w-12 h-12 text-white" />
                      </div>
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-3xl mx-auto -z-10"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4"
                    >
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Ready to Connect!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                        Import your WhatsApp contacts to send beautiful debt reminders and keep track of who owes what.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-4"
                    >
                      {/* Primary Action */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddContactForm(true)}
                        className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add First Contact</span>
                      </motion.button>

                      {/* Secondary Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={importFromWhatsApp}
                          className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-medium border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={importFromPhoneContacts}
                          className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-medium border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Contacts</span>
                        </motion.button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Private</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Easy</span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Contacts Button */}
        {contacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                clearAllSampleContacts();
                setContacts([]);
                setFilteredContacts([]);
                setSelectedContact(null);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-700 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Clear All Contacts</span>
            </motion.button>
          </motion.div>
        )}

        {/* Simplified Contact Management */}
        {!showAddContactForm ? null : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700"
          >
            <div className="space-y-6">
              {/* Form Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Add New Contact</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Enter contact details for WhatsApp reminders</p>
              </div>

              {/* Enhanced Form Fields */}
              <div className="space-y-4">
                {/* Name Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Input
                    label="Full Name"
                    type="text"
                    value={newContact.name}
                    onChange={(e) => {
                      setNewContact(prev => ({ ...prev, name: e.target.value }));
                      if (addContactErrors.name) {
                        setAddContactErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder="Enter contact name"
                    error={addContactErrors.name}
                    required
                    icon={<User className="w-5 h-5" />}
                    iconPosition="left"
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/50 rounded-xl"
                  />
                </motion.div>

                {/* Phone Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Input
                    label="WhatsApp Number"
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => {
                      setNewContact(prev => ({ ...prev, phone: e.target.value }));
                      if (addContactErrors.phone) {
                        setAddContactErrors(prev => ({ ...prev, phone: '' }));
                      }
                    }}
                    placeholder="+92 300 1234567"
                    error={addContactErrors.phone}
                    required
                    icon={<Phone className="w-5 h-5" />}
                    iconPosition="left"
                    helperText="Include country code (e.g., +92 for Pakistan)"
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/50 rounded-xl"
                  />
                </motion.div>
              </div>

              {/* Enhanced Form Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex space-x-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAddContactForm(false);
                    setNewContact({ name: '', phone: '' });
                    setAddContactErrors({});
                  }}
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddContact}
                  disabled={!newContact.name.trim() || !newContact.phone.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Contact
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Beautiful Action Buttons */}
        {!showAddContactForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex space-x-4 pt-6 border-t border-gradient-to-r from-gray-200 via-blue-200 to-purple-200 dark:from-gray-700 dark:via-blue-700 dark:to-purple-700"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: selectedContact ? 1.02 : 1 }}
              whileTap={{ scale: selectedContact ? 0.98 : 1 }}
              onClick={handleConfirm}
              disabled={!selectedContact}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                selectedContact
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>{selectedContact ? `Select ${selectedContact.name}` : 'Select Contact'}</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};

export default WhatsAppContactPicker;
