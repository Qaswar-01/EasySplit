import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Users } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import GroupForm from '../components/Groups/GroupForm';
import GroupCard from '../components/Groups/GroupCard';
import ConfirmDialog from '../components/UI/ConfirmDialog';

const Groups = () => {
  const { t } = useTranslation();
  const {
    groups,
    currentGroupId,
    createGroup,
    updateGroup,
    deleteGroup,
    setCurrentGroup,
    isLoading
  } = useAppStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);

  const handleCreateGroup = async (groupData) => {
    try {
      await createGroup(groupData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleUpdateGroup = async (groupData) => {
    try {
      await updateGroup(editingGroup.id, groupData);
      setEditingGroup(null);
    } catch (error) {
      console.error('Failed to update group:', error);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(deletingGroup.id);
      setDeletingGroup(null);
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  const handleSwitchGroup = (groupId) => {
    setCurrentGroup(groupId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('groups.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your colorful expense groups
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
          disabled={isLoading}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          {t('groups.create')}
        </Button>
      </motion.div>

      {/* Groups Grid */}
      {groups.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {groups.map((group, index) => (
              <GroupCard
                key={group.id}
                group={group}
                isActive={group.id === currentGroupId}
                onSwitch={() => handleSwitchGroup(group.id)}
                onEdit={() => setEditingGroup(group)}
                onDelete={() => setDeletingGroup(group)}
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
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('groups.noGroups')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first group to start tracking expenses with friends and family.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            {t('groups.create')}
          </Button>
        </motion.div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('groups.create')}
      >
        <GroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        title={t('groups.edit')}
      >
        {editingGroup && (
          <GroupForm
            initialData={editingGroup}
            onSubmit={handleUpdateGroup}
            onCancel={() => setEditingGroup(null)}
            isLoading={isLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDeleteGroup}
        title={t('groups.delete')}
        message={t('groups.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Groups;
