import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FileText, Download, ArrowUpDown, FolderOpen } from 'lucide-react';
import { formatFileSize, formatDate } from '../utils/helpers';

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('upload_date');
  const [sortDir, setSortDir] = useState('desc');

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

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'size') {
        valA = Number(valA);
        valB = Number(valB);
      } else if (sortField === 'upload_date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [files, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ field, children }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors select-none group"
    >
      <span className="flex items-center gap-1.5">
        {children}
        <ArrowUpDown
          size={12}
          className={`transition-colors ${
            sortField === field ? 'text-primary-500' : 'text-gray-300 group-hover:text-gray-400'
          }`}
        />
      </span>
    </th>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-32" />
        <div className="bg-gray-200 rounded-2xl h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">All Files</h2>
        <p className="text-gray-500 mt-1">
          {files.length} file{files.length !== 1 ? 's' : ''} uploaded
        </p>
      </div>

      {files.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-400">No files uploaded yet</p>
          <p className="text-sm text-gray-300 mt-1">Upload PDF files to see them here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <SortHeader field="original_name">Name</SortHeader>
                  <SortHeader field="size">Size</SortHeader>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <SortHeader field="upload_date">Upload Date</SortHeader>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-red-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                          {file.original_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        PDF
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(file.upload_date)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/api/files/${file.id}/download`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                        download
                      >
                        <Download size={13} />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
