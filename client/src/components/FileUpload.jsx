import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatFileSize } from '../utils/helpers';
import { useNotifications } from '../context/NotificationContext';

export default function FileUpload({ onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [fileStatuses, setFileStatuses] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef(null);
  const { fetchNotifications } = useNotifications();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf'
    );

    if (files.length === 0) {
      toast.error('Only PDF files are accepted');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
    setUploadDone(false);
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setUploadDone(false);
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || uploading) return;

    setUploading(true);
    setUploadDone(false);
    const isBulk = selectedFiles.length > 3;

    // Initialize statuses
    const statuses = {};
    selectedFiles.forEach((_, i) => {
      statuses[i] = { status: 'uploading', progress: 0 };
    });
    setFileStatuses(statuses);

    if (isBulk) {
      toast.loading(
        `Upload in progress — processing ${selectedFiles.length} files in background`,
        { id: 'bulk-upload', duration: Infinity }
      );
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setOverallProgress(pct);

            // Simulate individual progress
            const newStatuses = {};
            selectedFiles.forEach((_, i) => {
              newStatuses[i] = {
                status: pct === 100 ? 'complete' : 'uploading',
                progress: pct,
              };
            });
            setFileStatuses(newStatuses);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const newStatuses = {};
            selectedFiles.forEach((_, i) => {
              newStatuses[i] = { status: 'complete', progress: 100 };
            });
            setFileStatuses(newStatuses);
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      if (isBulk) {
        toast.dismiss('bulk-upload');
        toast.success(`${selectedFiles.length} files uploaded successfully!`, {
          duration: 4000,
        });
      } else {
        toast.success('Upload complete!', { duration: 3000 });
      }

      setUploadDone(true);
      fetchNotifications();

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      console.error('Upload error:', err);
      const newStatuses = {};
      selectedFiles.forEach((_, i) => {
        newStatuses[i] = { status: 'failed', progress: 0 };
      });
      setFileStatuses(newStatuses);

      if (isBulk) {
        toast.dismiss('bulk-upload');
      }
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setFileStatuses({});
    setOverallProgress(0);
    setUploadDone(false);
  };

  const getStatusIcon = (index) => {
    const status = fileStatuses[index]?.status;
    switch (status) {
      case 'uploading':
        return <Loader2 size={16} className="text-primary-500 animate-spin" />;
      case 'complete':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getProgressColor = (index) => {
    const status = fileStatuses[index]?.status;
    switch (status) {
      case 'uploading':
        return 'bg-primary-500';
      case 'complete':
        return 'bg-emerald-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Upload Files</h2>
        <p className="text-gray-500 mt-1">Drag and drop PDF files or click to browse</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${
          isDragOver
            ? 'border-primary-500 bg-primary-50/50 scale-[1.01]'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
          isDragOver
            ? 'bg-primary-100 scale-110'
            : 'bg-gray-100 group-hover:bg-primary-50 group-hover:scale-105'
        }`}>
          <Upload
            size={28}
            className={`transition-colors duration-300 ${
              isDragOver ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
            }`}
          />
        </div>

        <p className="text-base font-medium text-gray-700 mb-1">
          {isDragOver ? 'Drop files here' : 'Drag & drop PDF files here'}
        </p>
        <p className="text-sm text-gray-400">
          or <span className="text-primary-600 font-medium">browse your computer</span>
        </p>
        <p className="text-xs text-gray-300 mt-3">Supports: PDF files only</p>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="flex items-center gap-3">
              {!uploading && (
                <button
                  onClick={clearFiles}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
              {!uploadDone && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    uploading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Uploading... {overallProgress}%
                    </span>
                  ) : (
                    `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
                  )}
                </button>
              )}
              {uploadDone && (
                <button
                  onClick={clearFiles}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  Upload More
                </button>
              )}
            </div>
          </div>

          {/* Overall progress (shown when uploading bulk) */}
          {uploading && selectedFiles.length > 3 && (
            <div className="px-6 py-3 bg-primary-50/50 border-b border-primary-100/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary-700">Overall Progress</span>
                <span className="text-xs font-bold text-primary-700">{overallProgress}%</span>
              </div>
              <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300 progress-stripe"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors"
              >
                {/* Status icon */}
                <div className="flex-shrink-0">{getStatusIcon(index)}</div>

                {/* File icon */}
                <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-red-500" />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">PDF</span>
                  </div>
                </div>

                {/* Progress bar (shown inline for ≤3 files OR always shown) */}
                {fileStatuses[index] && (
                  <div className="w-32 flex-shrink-0">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(index)} ${
                          fileStatuses[index]?.status === 'uploading' ? 'progress-stripe' : ''
                        }`}
                        style={{ width: `${fileStatuses[index]?.progress || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Remove button */}
                {!uploading && !uploadDone && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
