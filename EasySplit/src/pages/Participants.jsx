import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Users, UserPlus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import useNotificationStore from '../store/useNotificationStore';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import ParticipantForm from '../components/Participants/ParticipantForm';
import ParticipantCard from '../components/Participants/ParticipantCard';
import ContactPicker from '../components/Participants/ContactPicker';

const Participants = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    groups,
    getCurrentGroup,
    getGroupParticipants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    setCurrentGroup,
    isLoading
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [deletingParticipant, setDeletingParticipant] = useState(null);
  const [showContactPicker, setShowContactPicker] = useState(false);

  const currentGroup = getCurrentGroup();
  const participants = currentGroup ? getGroupParticipants(currentGroup.id) : [];

  const handleAddParticipant = async (participantData) => {
    try {
      await addParticipant(currentGroup.id, participantData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add participant:', error);
    }
  };

  const handleUpdateParticipant = async (participantData) => {
    try {
      await updateParticipant(editingParticipant.id, participantData);
      setEditingParticipant(null);
    } catch (error) {
      console.error('Failed to update participant:', error);
    }
  };

  const handleDeleteParticipant = async () => {
    try {
      await deleteParticipant(deletingParticipant.id);
      setDeletingParticipant(null);
    } catch (error) {
      console.error('Failed to delete participant:', error);
    }
  };

  const handleContactSelect = async (contactData) => {
    if (!currentGroup) return;

    try {
      const participantData = {
        ...contactData,
        groupId: currentGroup.id
      };

      console.log('Adding participant:', participantData);
      await addParticipant(currentGroup.id, participantData);
      setShowContactPicker(false);

      // Show success notification
      const notificationStore = useNotificationStore.getState();
      notificationStore.notifyInfo(
        'Participant Added',
        `${contactData.name} has been added to ${currentGroup.name}`
      );
    } catch (error) {
      console.error('Failed to add participant from contact:', error);
    }
  };

  // If no group is selected, show message to create/select group
  if (!currentGroup) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Group Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select a group first to manage participants
          </p>
          <Button
            onClick={() => navigate('/groups')}
            icon={<Plus className="w-4 h-4" />}
          >
            Go to Groups
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('participants.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add and manage people in your expense groups
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowContactPicker(true)}
              icon={<Plus className="w-4 h-4" />}
              disabled={isLoading || !currentGroup}
              variant="secondary"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Import Contacts
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<UserPlus className="w-4 h-4" />}
              disabled={isLoading || !currentGroup}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {t('participants.add')}
            </Button>
          </div>
        </div>

        {/* Group Selector */}
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select Group:
              </label>
            </div>
            <div className="flex-1">
              <select
                value={currentGroup?.id || ''}
                onChange={(e) => {
                  const selectedGroupId = e.target.value;
                  console.log('Group selected:', selectedGroupId);
                  setCurrentGroup(selectedGroupId);

                  // Show visual feedback
                  if (selectedGroupId) {
                    const selectedGroup = groups.find(g => g.id === selectedGroupId);
                    console.log('Selected group object:', selectedGroup);
                  }
                }}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                style={{ minHeight: '48px' }}
              >
                <option value="" disabled>
                  Choose a group to manage participants...
                </option>
                {groups.map(group => (
                  <option key={group.id} value={group.id} className="py-2">
                    🎉 {group.name} • {group.currency} • {getGroupParticipants(group.id).length} participants
                  </option>
                ))}
              </select>
            </div>
          </div>
          {currentGroup && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-700 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">✅</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                      {currentGroup.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Currency: <span className="font-semibold text-green-600 dark:text-green-400">{currentGroup.currency}</span> • {participants.length} participants
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(currentGroup.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Active Group
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Participants Grid */}
      {participants.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {participants.map((participant, index) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onEdit={() => setEditingParticipant(participant)}
                onDelete={() => setDeletingParticipant(participant)}
                delay={index * 0.1}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('participants.noParticipants')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add people to this group to start splitting expenses together.
          </p>
          <Button
            onClick={() => setShowAddModal(true)}
            icon={<UserPlus className="w-4 h-4" />}
          >
            {t('participants.add')}
          </Button>
        </motion.div>
      )}

      {/* Add Participant Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('participants.add')}
      >
        <ParticipantForm
          onSubmit={handleAddParticipant}
          onCancel={() => setShowAddModal(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Participant Modal */}
      <Modal
        isOpen={!!editingParticipant}
        onClose={() => setEditingParticipant(null)}
        title={t('participants.edit')}
      >
        {editingParticipant && (
          <ParticipantForm
            initialData={editingParticipant}
            onSubmit={handleUpdateParticipant}
            onCancel={() => setEditingParticipant(null)}
            isLoading={isLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingParticipant}
        onClose={() => setDeletingParticipant(null)}
        onConfirm={handleDeleteParticipant}
        title={t('participants.delete')}
        message={t('participants.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isLoading}
      />

      {/* Contact Picker */}
      <ContactPicker
        isOpen={showContactPicker}
        onClose={() => setShowContactPicker(false)}
        onContactSelect={handleContactSelect}
      />
    </div>
  );
};

export default Participants;
