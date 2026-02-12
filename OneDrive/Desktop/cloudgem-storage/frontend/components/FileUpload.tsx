import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { MAX_FILE_SIZE } from '../constants';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setMessage(null);
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: 'File is too large. Max 10MB.' });
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setMessage(null);
    try {
      await onUpload(selectedFile);
      setMessage({ type: 'success', text: 'File uploaded successfully!' });
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 bg-white hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
        />

        {!selectedFile ? (
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              Drag and drop your file here
            </p>
            <p className="mt-2 text-sm text-gray-500">
              or <button onClick={() => inputRef.current?.click()} className="text-primary-600 font-semibold hover:text-primary-700">browse</button> to choose a file
            </p>
            <p className="mt-1 text-xs text-gray-400">Max file size: 10MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
             <div className="flex items-center w-full bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <div className="bg-primary-100 p-2 rounded-lg mr-4">
                    <File className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
                <button 
                    onClick={() => setSelectedFile(null)}
                    className="ml-4 p-1 rounded-full hover:bg-gray-200 text-gray-500"
                    disabled={uploading}
                >
                    <X className="h-5 w-5" />
                </button>
             </div>
             
             <div className="flex gap-3">
                 <Button onClick={handleUpload} isLoading={uploading}>
                    Upload File
                 </Button>
                 <Button variant="secondary" onClick={() => setSelectedFile(null)} disabled={uploading}>
                    Cancel
                 </Button>
             </div>
          </div>
        )}
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2"/> : <X className="h-5 w-5 mr-2"/>}
          {message.text}
        </div>
      )}
    </div>
  );
};