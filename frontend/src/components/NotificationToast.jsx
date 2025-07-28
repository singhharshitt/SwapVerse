import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService.jsx';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationService.getNotifications());
    };

    // Update notifications immediately
    updateNotifications();

    // Set up interval to check for new notifications
    const interval = setInterval(updateNotifications, 100);

    return () => clearInterval(interval);
  }, []);

  const handleRemove = (id) => {
    notificationService.removeNotification(id);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${notificationService.getNotificationStyles(notification.type)} flex items-start space-x-3 animate-slide-in`}
        >
          <div className="flex-shrink-0">
            {notificationService.getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => handleRemove(notification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast; 