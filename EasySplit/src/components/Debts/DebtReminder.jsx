import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Calendar, MessageCircle, X, Plus, User } from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import WhatsAppContactPicker from '../WhatsApp/WhatsAppContactPicker';
import { formatCurrency } from '../../utils/calculations';

const DebtReminder = ({ debt, participants, currency, onReminderSet, onReminderDelete }) => {
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedWhatsAppContact, setSelectedWhatsAppContact] = useState(null);
  const [reminderData, setReminderData] = useState({
    date: '',
    time: '',
    message: '',
    whatsappEnabled: false,
    emailEnabled: false
  });

  const getParticipantName = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : 'Unknown';
  };

  const getParticipantPhone = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.phone : null;
  };

  const handleSetReminder = () => {
    if (!reminderData.date || !reminderData.time) {
      alert('Please select date and time for the reminder');
      return;
    }

    // Validate WhatsApp contact if WhatsApp is enabled
    if (reminderData.whatsappEnabled) {
      const fromName = getParticipantName(debt.fromId);
      const hasContact = selectedWhatsAppContact || getParticipantPhone(debt.fromId);

      if (!hasContact) {
        alert(`❌ Please select a WhatsApp contact for ${fromName} before scheduling the reminder.`);
        return;
      }
    }

    const reminderDateTime = new Date(`${reminderData.date}T${reminderData.time}`);
    const now = new Date();

    if (reminderDateTime <= now) {
      alert('Reminder time must be in the future');
      return;
    }

    const reminder = {
      id: Date.now(),
      debtId: `${debt.fromId}-${debt.toId}`,
      fromId: debt.fromId,
      toId: debt.toId,
      amount: debt.amount,
      currency,
      scheduledFor: reminderDateTime,
      message: reminderData.message || `Hi ${getParticipantName(debt.fromId)}, friendly reminder that you owe ${formatCurrency(debt.amount, currency)} to ${getParticipantName(debt.toId)}. Please settle when convenient. Thanks!`,
      whatsappEnabled: reminderData.whatsappEnabled,
      emailEnabled: reminderData.emailEnabled,
      status: 'scheduled',
      selectedContact: selectedWhatsAppContact // Include the selected contact
    };

    // Save the WhatsApp contact association for future quick reminders
    if (selectedWhatsAppContact) {
      const contactAssociations = JSON.parse(localStorage.getItem('participant-whatsapp-contacts') || '{}');
      contactAssociations[debt.fromId] = selectedWhatsAppContact;
      localStorage.setItem('participant-whatsapp-contacts', JSON.stringify(contactAssociations));
    }

    onReminderSet(reminder);
    setShowReminderModal(false);
    setSelectedWhatsAppContact(null);
    setReminderData({
      date: '',
      time: '',
      message: '',
      whatsappEnabled: false,
      emailEnabled: false
    });
  };

  const sendWhatsAppMessage = (phoneNumber, message) => {
    if (!phoneNumber) {
      alert('No phone number available for this participant');
      return;
    }

    // Clean phone number - remove all non-digits except +
    let cleanPhone = phoneNumber.replace(/[^\d+]/g, '');

    // Handle Pakistani numbers
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+92' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('92') && !cleanPhone.startsWith('+92')) {
      cleanPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+92' + cleanPhone;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp URL (remove + from phone number for wa.me)
    const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedMessage}`;

    console.log('Opening WhatsApp URL:', whatsappUrl);

    // Show user instruction for sending
    const contactName = getParticipantName(debt.fromId);

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Show helpful instruction
    setTimeout(() => {
      alert(`📱 WhatsApp opened with message for ${contactName}.\n\n✅ The message is ready in the chat box.\n\n👆 Please click the SEND button (➤) in WhatsApp to deliver the message!`);
    }, 1500);
  };

  const sendQuickReminder = () => {
    const fromName = getParticipantName(debt.fromId);
    const toName = getParticipantName(debt.toId);

    // Check if we have a saved WhatsApp contact association for this participant
    const contactAssociations = JSON.parse(localStorage.getItem('participant-whatsapp-contacts') || '{}');
    const associatedContact = contactAssociations[debt.fromId];

    // Fallback to participant phone or general contact search
    let fromPhone = associatedContact?.phone || getParticipantPhone(debt.fromId);

    // If still no phone, try to find by name in saved contacts
    if (!fromPhone) {
      const savedContacts = JSON.parse(localStorage.getItem('whatsapp-contacts') || '[]');
      const savedContact = savedContacts.find(contact =>
        contact.name.toLowerCase() === fromName.toLowerCase()
      );
      fromPhone = savedContact?.phone;
    }

    if (!fromPhone) {
      alert(`❌ No WhatsApp contact found for ${fromName}. Please schedule a reminder and select a contact first.`);
      return;
    }

    const message = `Hi ${fromName}! 👋 This is a friendly reminder that you owe ${formatCurrency(debt.amount, currency)} to ${toName}. Please settle when convenient. Thanks! 💰`;

    sendWhatsAppMessage(fromPhone, message);

    // Show success message
    alert(`✅ WhatsApp opened with draft message for ${fromName}!\nPlease review and send the message.`);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={sendQuickReminder}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          icon={<MessageCircle className="w-4 h-4" />}
          title="Send WhatsApp reminder now"
        >
          Quick Remind
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReminderModal(true)}
          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          icon={<Bell className="w-4 h-4" />}
          title="Schedule reminder"
        >
          Schedule
        </Button>
      </div>

      {/* Reminder Modal */}
      <Modal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        title="Schedule Debt Reminder"
        size="xl"
      >
        <div className="space-y-6">
          {/* Debt Info */}
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getParticipantName(debt.fromId).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Debt Reminder
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Schedule a payment reminder
                </p>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-center">
                <p className="text-gray-700 dark:text-gray-300 text-base mb-2">
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{getParticipantName(debt.fromId)}</span> owes
                </p>
                <p className="font-bold text-2xl text-orange-600 dark:text-orange-400 mb-2">
                  {formatCurrency(debt.amount, currency)}
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-base">
                  to <span className="font-semibold text-blue-600 dark:text-blue-400">{getParticipantName(debt.toId)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg mb-4">
              Schedule Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Reminder Date
                </label>
                <input
                  type="date"
                  value={reminderData.date}
                  onChange={(e) => setReminderData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={reminderData.time}
                  onChange={(e) => setReminderData(prev => ({ ...prev, time: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
              <MessageCircle className="w-5 h-5 inline mr-2" />
              Reminder Message
            </h4>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Message (Optional)
              </label>
              <textarea
                value={reminderData.message}
                onChange={(e) => setReminderData(prev => ({ ...prev, message: e.target.value }))}
                placeholder={`Hi ${getParticipantName(debt.fromId)}, friendly reminder that you owe ${formatCurrency(debt.amount, currency)} to ${getParticipantName(debt.toId)}. Please settle when convenient. Thanks!`}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none text-sm leading-relaxed"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {reminderData.message.length}/500 characters
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReminderData(prev => ({
                    ...prev,
                    message: `Hi ${getParticipantName(debt.fromId)}, friendly reminder that you owe ${formatCurrency(debt.amount, currency)} to ${getParticipantName(debt.toId)}. Please settle when convenient. Thanks!`
                  }))}
                  className="text-orange-600 hover:text-orange-700"
                >
                  Use Default Message
                </Button>
              </div>
            </div>
          </div>

          {/* Notification Methods */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
              <Bell className="w-5 h-5 inline mr-2" />
              Notification Methods
            </h4>

            <div className="space-y-4">
              {/* WhatsApp Option */}
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={reminderData.whatsappEnabled}
                    onChange={(e) => setReminderData(prev => ({ ...prev, whatsappEnabled: e.target.checked }))}
                    className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        WhatsApp Message
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Send reminder directly via WhatsApp at the scheduled time
                    </p>

                    {reminderData.whatsappEnabled && (
                      <div className="space-y-4">
                        {/* Current Contact Display */}
                        {selectedWhatsAppContact || getParticipantPhone(debt.fromId) ? (
                          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {(selectedWhatsAppContact?.name || getParticipantName(debt.fromId)).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {selectedWhatsAppContact?.name || getParticipantName(debt.fromId)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {selectedWhatsAppContact?.phone || getParticipantPhone(debt.fromId)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowContactPicker(true)}
                              className="text-green-600 hover:text-green-700"
                              icon={<User className="w-4 h-4" />}
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                                  ⚠️ No WhatsApp contact selected for {getParticipantName(debt.fromId)}
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                  Select a contact to send WhatsApp reminders
                                </p>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowContactPicker(true)}
                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                                icon={<Plus className="w-4 h-4" />}
                              >
                                Select Contact
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const phone = selectedWhatsAppContact?.phone || getParticipantPhone(debt.fromId);
                              if (phone) {
                                const message = reminderData.message || `Hi ${selectedWhatsAppContact?.name || getParticipantName(debt.fromId)}, friendly reminder that you owe ${formatCurrency(debt.amount, currency)} to ${getParticipantName(debt.toId)}. Please settle when convenient. Thanks!`;
                                const whatsappUrl = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
                                window.open(whatsappUrl, '_blank');
                              }
                            }}
                            className="text-green-600 hover:text-green-700"
                            icon={<MessageCircle className="w-4 h-4" />}
                            disabled={!selectedWhatsAppContact && !getParticipantPhone(debt.fromId)}
                          >
                            Test Message
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowContactPicker(true)}
                            className="text-blue-600 hover:text-blue-700"
                            icon={<User className="w-4 h-4" />}
                          >
                            Browse Contacts
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* In-App Notification Option */}
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={reminderData.emailEnabled}
                    onChange={(e) => setReminderData(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        In-App Notification
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show browser notification at the scheduled time
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
          <Button
            variant="secondary"
            onClick={() => setShowReminderModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSetReminder}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            icon={<Bell className="w-4 h-4" />}
          >
            Schedule Reminder
          </Button>
        </div>
      </Modal>

      {/* WhatsApp Contact Picker */}
      <WhatsAppContactPicker
        isOpen={showContactPicker}
        onClose={() => setShowContactPicker(false)}
        onContactSelect={(contact) => {
          setSelectedWhatsAppContact(contact);
          setShowContactPicker(false);
        }}
        currentContact={selectedWhatsAppContact}
        title={`Select WhatsApp Contact for ${getParticipantName(debt.fromId)}`}
      />
    </>
  );
};

export default DebtReminder;
