import { motion } from 'framer-motion';
import { User, Mail, Edit, Trash2, Calendar } from 'lucide-react';
import Button from '../UI/Button';

const ParticipantCard = ({ 
  participant, 
  onEdit, 
  onDelete, 
  delay = 0 
}) => {
  // Generate avatar initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a consistent color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay }}
      className="card p-6 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className={`w-12 h-12 ${getAvatarColor(participant.name)} rounded-full flex items-center justify-center text-white font-semibold`}>
            {participant.avatar ? (
              <img 
                src={participant.avatar} 
                alt={participant.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(participant.name)
            )}
          </div>
          
          {/* Name and Email */}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {participant.name}
            </h3>
            {participant.email && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Mail className="w-3 h-3 mr-1" />
                <span className="truncate">{participant.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="p-2"
            aria-label="Edit participant"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            aria-label="Delete participant"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats or Additional Info */}
      <div className="space-y-3">
        {/* Member Since */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          Added {new Date(participant.createdAt).toLocaleDateString()}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Active Member
          </span>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {participant.email && (
              <button
                onClick={() => window.open(`mailto:${participant.email}`, '_blank')}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Send Email
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ParticipantCard;
