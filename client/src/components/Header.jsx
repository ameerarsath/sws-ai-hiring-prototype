import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { Bell, FileText, Menu, X } from 'lucide-react';

export default function Header({ sidebarOpen, onToggleSidebar }) {
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200/80 z-40 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left side: hamburger + logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X size={20} className="text-gray-600" />
            ) : (
              <Menu size={20} className="text-gray-600" />
            )}
          </button>

          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
            <FileText size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Doc<span className="text-primary-600">Vault</span>
          </h1>
        </div>

        {/* Right side */}
        <div className="relative">
          <button
            data-bell-button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 group cursor-pointer"
          >
            <Bell
              size={20}
              className={`transition-colors duration-200 ${
                showNotifications ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700'
              }`}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5 ring-2 ring-white animate-pulse-blue">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>
      </div>
    </header>
  );
}
