import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';

function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [fileListKey, setFileListKey] = useState(0);

  const handleUploadComplete = useCallback(() => {
    // Force re-render of FileList and Dashboard when files are uploaded
    setFileListKey((k) => k + 1);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard key={fileListKey} onNavigate={setActiveView} />;
      case 'upload':
        return <FileUpload onUploadComplete={handleUploadComplete} />;
      case 'files':
        return <FileList key={fileListKey} />;
      default:
        return <Dashboard key={fileListKey} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      {/* Main content area */}
      <main className="ml-64 pt-16">
        <div className="p-8 max-w-6xl">
          {renderView()}
        </div>
      </main>

      {/* Toast container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#1e293b',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            padding: '14px 18px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
