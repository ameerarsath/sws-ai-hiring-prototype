import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, HardDrive, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { formatFileSize, formatRelativeTime } from '../utils/helpers';

export default function Dashboard({ onNavigate }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('/api/files');
      setFiles(res.data);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const recentCount = files.filter((f) => {
    const uploadDate = new Date(f.upload_date);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return uploadDate > oneDayAgo;
  }).length;

  const stats = [
    {
      label: 'Total Files',
      value: files.length,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/25',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Size',
      value: formatFileSize(totalSize),
      icon: HardDrive,
      color: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/25',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Recent Uploads',
      value: recentCount,
      subtitle: 'Last 24 hours',
      icon: Clock,
      color: 'from-violet-500 to-violet-600',
      shadow: 'shadow-violet-500/25',
      bg: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      label: 'Upload Rate',
      value: files.length > 0 ? `${Math.round((recentCount / Math.max(files.length, 1)) * 100)}%` : '0%',
      subtitle: 'Activity today',
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      shadow: 'shadow-amber-500/25',
      bg: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ];

  const recentFiles = files.slice(0, 5);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome back 👋</h2>
        <p className="text-gray-500 mt-1">Here's an overview of your document storage</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} className={stat.textColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent files */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Recent Files</h3>
          <button
            onClick={() => onNavigate('files')}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors cursor-pointer"
          >
            View all
            <ArrowRight size={14} />
          </button>
        </div>

        {recentFiles.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 font-medium">No files uploaded yet</p>
            <button
              onClick={() => onNavigate('upload')}
              className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
            >
              Upload your first file →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {file.original_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {formatRelativeTime(file.upload_date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
