import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, User, Search, Import, Plus, ArrowLeft, Calendar, Clock, Bell, Download } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import WhatsAppContactPicker from '../WhatsApp/WhatsAppContactPicker';

const ContactPicker = ({ isOpen, onClose, onContactSelect }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showReminderScheduler, setShowReminderScheduler] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [addContactErrors, setAddContactErrors] = useState({});
  const [isMonitoringClipboard, setIsMonitoringClipboard] = useState(false);
  const [clipboardInterval, setClipboardInterval] = useState(null);
  const [lastClipboardContent, setLastClipboardContent] = useState('');
  const [showWhatsAppPicker, setShowWhatsAppPicker] = useState(false);

  // Check if Contacts API is supported
  const isContactsAPISupported = 'contacts' in navigator && 'ContactsManager' in window;

  // Enhanced sample contacts with WhatsApp verification
  const sampleContacts = [
    { id: '1', name: 'Ahmed Ali', phone: '+92 300 1234567', hasWhatsApp: true, status: 'online', lastSeen: '2 min ago' },
    { id: '2', name: 'Fatima Sheikh', phone: '+92 301 2345678', hasWhatsApp: true, status: 'online', lastSeen: 'now' },
    { id: '3', name: 'Hassan Khan', phone: '+92 302 3456789', hasWhatsApp: true, status: 'offline', lastSeen: '1 hour ago' },
    { id: '4', name: 'Ayesha Malik', phone: '+92 303 4567890', hasWhatsApp: true, status: 'online', lastSeen: '5 min ago' },
    { id: '5', name: 'Omar Siddiqui', phone: '+92 304 5678901', hasWhatsApp: true, status: 'offline', lastSeen: '3 hours ago' },
    { id: '6', name: 'Zara Ahmed', phone: '+92 305 6789012', hasWhatsApp: true, status: 'online', lastSeen: 'now' },
    { id: '7', name: 'Ali Raza', phone: '+92 306 7890123', hasWhatsApp: true, status: 'offline', lastSeen: '30 min ago' },
    { id: '8', name: 'Nadia Iqbal', phone: '+92 307 8901234', hasWhatsApp: true, status: 'online', lastSeen: '1 min ago' },
    { id: '9', name: 'Usman Tariq', phone: '+92 308 9012345', hasWhatsApp: true, status: 'offline', lastSeen: '2 hours ago' },
    { id: '10', name: 'Sara Butt', phone: '+92 309 0123456', hasWhatsApp: true, status: 'online', lastSeen: 'now' },
    { id: '11', name: 'Bilal Ahmed', phone: '+92 310 1234567', hasWhatsApp: true, status: 'online', lastSeen: '10 min ago' },
    { id: '12', name: 'Mariam Khan', phone: '+92 311 2345678', hasWhatsApp: true, status: 'offline', lastSeen: '1 day ago' },
    { id: '13', name: 'Faisal Malik', phone: '+92 312 3456789', hasWhatsApp: true, status: 'online', lastSeen: 'now' },
    { id: '14', name: 'Sana Iqbal', phone: '+92 313 4567890', hasWhatsApp: true, status: 'offline', lastSeen: '4 hours ago' },
    { id: '15', name: 'Kamran Shah', phone: '+92 314 5678901', hasWhatsApp: true, status: 'online', lastSeen: '15 min ago' }
  ];

  // Load existing contacts from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('participant-contacts');
    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts);
        setContacts(parsedContacts);
        setFilteredContacts(parsedContacts);
        if (parsedContacts.length > 0) {
          setHasPermission(true);
        }
      } catch (error) {
        console.error('Error loading saved contacts:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const requestContactsPermission = async () => {
    setIsLoading(true);

    // Request notification permission for reminders
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (isContactsAPISupported) {
      try {
        // Request contacts permission
        const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });

        // Process contacts
        const processedContacts = contacts.map(contact => ({
          id: Math.random().toString(36).substr(2, 9),
          name: contact.name?.[0] || 'Unknown',
          phone: contact.tel?.[0] || '',
          hasWhatsApp: true // Assume all contacts have WhatsApp
        })).filter(contact => contact.phone); // Only include contacts with phone numbers

        setContacts(processedContacts);
        setFilteredContacts(processedContacts);
        setHasPermission(true);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Failed to access contacts:', error);
        // Fall through to use sample contacts
      }
    }

    // Use sample contacts as fallback
    console.log('Using sample contacts for demonstration');
    setTimeout(() => {
      setContacts(sampleContacts);
      setFilteredContacts(sampleContacts);
      setHasPermission(true);
      setIsLoading(false);
    }, 1000); // Simulate loading time
  };

  const handleContactSelect = (contact) => {
    onContactSelect({
      name: contact.name,
      phone: contact.phone,
      email: '', // Can be added later
      hasWhatsApp: true
    });

    // Send welcome message via WhatsApp
    const welcomeMessage = `Hi ${contact.name}! 👋 You've been added to an expense group on EasySplit. We'll use this to share expenses and send payment reminders. Thanks! 💰`;

    // Ask if user wants to send welcome message
    const sendWelcome = window.confirm(
      `Send welcome message to ${contact.name} via WhatsApp?`
    );

    if (sendWelcome) {
      openWhatsApp(contact.phone, welcomeMessage);
    }

    onClose();
  };

  const openWhatsAppWithMessage = (phone, message = '') => {
    // Clean phone number - remove all non-digits except +
    let cleanPhone = phone.replace(/[^\d+]/g, '');

    // Handle Pakistani numbers
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+92' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('92') && !cleanPhone.startsWith('+92')) {
      cleanPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+92' + cleanPhone;
    }

    // Encode message for URL
    const encodedMessage = message ? encodeURIComponent(message) : '';

    console.log('Opening WhatsApp for:', cleanPhone, 'with message:', message);
    const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}${message ? `?text=${encodedMessage}` : ''}`;
    window.open(whatsappUrl, '_blank');
  };

  const openWhatsApp = (phone, message = '') => {
    openWhatsAppWithMessage(phone, message);
  };

  // Import from phone contacts
  const importFromPhoneContacts = async () => {
    try {
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };

        const deviceContacts = await navigator.contacts.select(props, opts);

        const importedContacts = deviceContacts.map((contact, index) => ({
          id: `imported-${Date.now()}-${index}`,
          name: contact.name?.[0] || 'Unknown',
          phone: contact.tel?.[0] || '',
          hasWhatsApp: true
        })).filter(contact => contact.phone);

        if (importedContacts.length > 0) {
          const updatedContacts = [...contacts, ...importedContacts];
          setContacts(updatedContacts);
          setFilteredContacts(updatedContacts);

          // Save to localStorage
          localStorage.setItem('participant-contacts', JSON.stringify(updatedContacts));

          alert(`✅ Successfully imported ${importedContacts.length} contacts from your phone!`);
        } else {
          alert('No contacts with phone numbers were found.');
        }
      } else {
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

  // Import from WhatsApp (smart app detection)
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
      followUpMessage = `✅ Trying to open WhatsApp app!\n\n📝 Next steps:\n1. Browse your WhatsApp contacts\n2. Copy contact name and phone number\n3. Come back here and click "Add New Contact"\n4. Fill in the contact details\n\n💡 If app didn't open, WhatsApp Web will open as backup!`;
    } else if (isDesktop) {
      // Desktop - check for WhatsApp desktop app, fallback to web
      message = `💻 Opening WhatsApp for contact import!\n\n📋 Instructions:\n1. WhatsApp Desktop app will try to open first\n2. If not installed, WhatsApp Web will open\n3. Browse your contacts and copy contact details\n4. Come back here and use "Add New Contact"\n\n🚀 Ready to open WhatsApp?`;
      whatsappUrl = 'whatsapp://';
      followUpMessage = `✅ Trying to open WhatsApp Desktop!\n\n📝 Next steps:\n1. Browse your WhatsApp contacts\n2. Copy contact name and phone number\n3. Come back here and click "Add New Contact"\n4. Fill in the contact details\n\n💡 If desktop app didn't open, WhatsApp Web will open as backup!`;
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

      // Show follow-up instructions
      setTimeout(() => {
        alert(followUpMessage);
      }, 3000);
    }
  };

  // Add new contact manually
  const handleAddContact = () => {
    const errors = {};

    if (!newContact.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!newContact.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(newContact.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (Object.keys(errors).length > 0) {
      setAddContactErrors(errors);
      return;
    }

    const contact = {
      id: `manual-${Date.now()}`,
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      hasWhatsApp: true
    };

    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    setFilteredContacts(updatedContacts);

    localStorage.setItem('participant-contacts', JSON.stringify(updatedContacts));

    setNewContact({ name: '', phone: '' });
    setAddContactErrors({});
    setShowAddContactForm(false);

    alert(`✅ ${contact.name} has been added to your contacts!`);
  };

  const cancelAddContact = () => {
    setNewContact({ name: '', phone: '' });
    setAddContactErrors({});
    setShowAddContactForm(false);
  };

  const scheduleReminder = (contact) => {
    setSelectedContact(contact);
    setReminderMessage(`Hi ${contact.name}! 👋 This is a friendly reminder about our shared expenses. Please check EasySplit for any pending payments. Thanks! 💰`);

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setReminderDate(tomorrow.toISOString().split('T')[0]);

    // Set default time to 10 AM
    setReminderTime('10:00');

    setShowReminderScheduler(true);
  };

  const handleScheduleReminder = () => {
    if (!selectedContact || !reminderDate || !reminderTime) {
      alert('Please fill in all reminder details');
      return;
    }

    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
    const now = new Date();

    if (reminderDateTime <= now) {
      alert('Please select a future date and time');
      return;
    }

    // Calculate delay in milliseconds
    const delay = reminderDateTime.getTime() - now.getTime();

    // Store reminder in localStorage for persistence
    const reminders = JSON.parse(localStorage.getItem('whatsappReminders') || '[]');
    const newReminder = {
      id: Date.now(),
      contact: selectedContact,
      message: reminderMessage,
      scheduledFor: reminderDateTime.toISOString(),
      created: now.toISOString()
    };

    reminders.push(newReminder);
    localStorage.setItem('whatsappReminders', JSON.stringify(reminders));

    // Schedule the reminder
    setTimeout(() => {
      // Check if reminder still exists (user might have cancelled it)
      const currentReminders = JSON.parse(localStorage.getItem('whatsappReminders') || '[]');
      const reminderExists = currentReminders.find(r => r.id === newReminder.id);

      if (reminderExists) {
        // Send WhatsApp message
        openWhatsAppWithMessage(selectedContact.phone, reminderMessage);

        // Remove from storage after sending
        const updatedReminders = currentReminders.filter(r => r.id !== newReminder.id);
        localStorage.setItem('whatsappReminders', JSON.stringify(updatedReminders));

        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('WhatsApp Reminder Sent', {
            body: `Reminder sent to ${selectedContact.name}`,
            icon: '/favicon.ico'
          });
        }
      }
    }, delay);

    alert(`Reminder scheduled for ${reminderDateTime.toLocaleString()}. WhatsApp will open automatically at that time.`);
    setShowReminderScheduler(false);
    resetReminderForm();
  };

  const resetReminderForm = () => {
    setSelectedContact(null);
    setReminderDate('');
    setReminderTime('');
    setReminderMessage('');
  };

  const cancelReminder = () => {
    setShowReminderScheduler(false);
    resetReminderForm();
  };

  const formatPhoneNumber = (phone) => {
    // Basic phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    return phone;
  };

  return (
    <>
      {/* Beautiful WhatsApp Contact Picker */}
      <WhatsAppContactPicker
        isOpen={isOpen}
        onClose={onClose}
        onContactSelect={handleContactSelect}
        title="Import Participant Contacts"
      />
    </>
  );
};

export default ContactPicker;
