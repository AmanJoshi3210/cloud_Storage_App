import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { ENDPOINTS } from '../constants';
import { FileItem } from '../types';
import { FileUpload } from './FileUpload';
import { Button } from './ui/Button';
import { LogOut, FileText, Download, Trash2, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // In a real scenario, this would fetch from the backend
      const data = await apiRequest<FileItem[]>(ENDPOINTS.FILES);
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files", error);
      // Fallback for demo if backend is not actually running locally
      // setFiles([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    await apiRequest(ENDPOINTS.UPLOAD, 'POST', formData, true);
    // Refresh list after upload
    await fetchFiles();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">SecureFileStream</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
              </div>
              <Button variant="ghost" onClick={logout} className="text-gray-600">
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Files</h1>
          <p className="text-gray-600">Securely upload and manage your documents.</p>
        </div>

        <FileUpload onUpload={handleUpload} />

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Files</h2>
            <Button variant="ghost" onClick={fetchFiles} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
            {files.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No files uploaded yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {files.map((file) => (
                  <li key={file.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4 truncate">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Download className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};