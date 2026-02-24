import React from 'react';

const Avatar = ({ user, size = 'w-10 h-10', className = '' }) => {
  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  const getRandomColor = (username) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];

    // Use username to consistently get the same color for the same user
    const index = username ? username.length % colors.length : 0;
    return colors[index];
  };

  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={`${user.username}'s avatar`}
        className={`${size} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${size} ${getRandomColor(user?.username)} rounded-full flex items-center justify-center text-white font-bold text-lg ${className}`}
    >
      {getInitial(user?.username)}
    </div>
  );
};

export default Avatar;