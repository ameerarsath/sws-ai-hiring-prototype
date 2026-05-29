import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { formatRelativeTime } from '../utils/helpers';
import { Bell, Check, CheckCheck, Info, AlertCircle, Upload } from 'lucide-react';

const typeIcons = {
  info: <Info size={16} className="text-blue-500" />,
  success: <CheckCheck size={16} className="text-emerald-500" />,
  error: <AlertCircle size={16} className="text-red-500" />,
  upload: <Upload size={16} className="text-blue-500" />,
};

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Don't close if clicking the bell button itself
        if (event.target.closest('[data-bell-button]')) return;
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
      style={{
        animation: 'slideDown 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <h3 className="font-semibold text-gray-800 text-sm">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
            <p className="text-xs text-gray-300 mt-1">Upload files to get started</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.is_read) markAsRead(notification.id);
              }}
              className={`flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 cursor-pointer transition-all duration-200 hover:bg-blue-50/50 ${
                !notification.is_read ? 'bg-blue-50/30' : ''
              }`}
            >
              {/* Unread dot */}
              <div className="mt-1.5 flex-shrink-0">
                {!notification.is_read ? (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-blue-200 animate-pulse" />
                ) : (
                  <div className="w-2.5 h-2.5 bg-transparent rounded-full" />
                )}
              </div>

              {/* Icon */}
              <div className="mt-0.5 flex-shrink-0">
                {typeIcons[notification.type] || typeIcons.info}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.is_read ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(notification.timestamp)}
                </p>
              </div>

              {/* Read indicator */}
              {!notification.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  className="flex-shrink-0 mt-1 p-1 rounded-full hover:bg-blue-100 transition-colors"
                  title="Mark as read"
                >
                  <Check size={14} className="text-blue-500" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
