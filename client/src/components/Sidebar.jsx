import { LayoutDashboard, Upload, FolderOpen } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'Upload Files', icon: Upload },
  { id: 'files', label: 'All Files', icon: FolderOpen },
];

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200/80 z-30">
      <nav className="p-4 space-y-1.5 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon
                size={18}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-primary-600' : 'text-gray-400'
                }`}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-primary-700 mb-1">DocVault v1.0</p>
          <p className="text-xs text-primary-600/70">Document Management System</p>
        </div>
      </div>
    </aside>
  );
}
