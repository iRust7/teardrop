import React from 'react';
import { User } from '../types';
import { getAvatarColor, getInitials } from '../utils/helpers';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const statusSizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-3 h-3',
};

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', showStatus = true }) => {
  const backgroundColor = getAvatarColor(user.username);
  const initials = getInitials(user.username);

  const statusColor = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  }[user.status];

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white`}
        style={{ backgroundColor }}
      >
        {initials}
      </div>
      {showStatus && (
        <div
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} ${statusColor} rounded-full border-2 border-white`}
        />
      )}
    </div>
  );
};

export default UserAvatar;
