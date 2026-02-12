import React, { useState, useRef, useCallback } from 'react';
import { UploadStatus, FileUploadState, CloudinaryConfig } from '../types';
import { Button } from './Button';
import { UploadCloud, X, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { analyzeImage } from '../services/geminiService';
import { StoredFile } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CloudinaryConfig | null;
  onUploadComplete: (file: StoredFile) => void;
  openSettings: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  config,
  onUploadComplete,
  openSettings,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    if (!config) return;

    const newUploads = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: UploadStatus.IDLE,
      progress: 0,
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Process sequentially to manage resources
    for (let i = 0; i < newUploads.length; i++) {
       const uploadState = newUploads[i];
       const currentIndex = uploads.length + i; // Current index in global state (approximated)
       
       // Update Status: Uploading
       setUploads(prev => prev.map(u => u.file === uploadState.file ? { ...u, status: UploadStatus.UPLOADING } : u));

       try {
           // 1. Upload to Cloudinary
           const uploadedData = await uploadToCloudinary(uploadState.file, config, (progress) => {
                setUploads(prev => prev.map(u => u.file === uploadState.file ? { ...u, progress } : u));
           });

           // 2. AI Analysis (if image)
           let aiData = { description: '', tags: [] as string[] };
           if (uploadState.file.type.startsWith('image/')) {
                setUploads(prev => prev.map(u => u.file === uploadState.file ? { ...u, status: UploadStatus.ANALYZING } : u));
                
                // Convert file to base64 for Gemini
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(uploadState.file);
                });
                
                aiData = await analyzeImage(base64, uploadState.file.type);
           }

           // 3. Complete
           const newFile: StoredFile = {
               id: uuidv4(),
               url: uploadedData.url,
               name: uploadState.file.name,
               size: uploadState.file.size,
               type: uploadState.file.type,
               createdAt: Date.now(),
               width: uploadedData.width,
               height: uploadedData.height,
               description: aiData.description,
               tags: aiData.tags,
           };

           onUploadComplete(newFile);
           setUploads(prev => prev.map(u => u.file === uploadState.file ? { ...u, status: UploadStatus.SUCCESS, progress: 100 } : u));

       } catch (error) {
           console.error(error);
           setUploads(prev => prev.map(u => u.file === uploadState.file ? { ...u, status: UploadStatus.ERROR, error: (error as Error).message } : u));
       }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, onUploadComplete]); // Removed 'uploads' dependency to avoid loop, using functional updates

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [processFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(Array.from(e.target.files));
    }
  }, [processFiles]);

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(u => u.file !== file));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Upload Files</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!config ? (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
                    <AlertCircle size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-slate-900">Configuration Missing</h3>
                    <p className="text-slate-500 mt-1 max-w-sm mx-auto">Please configure your Cloudinary credentials to enable file uploads.</p>
                </div>
                <Button onClick={openSettings}>Open Settings</Button>
             </div>
          ) : (
            <div className="space-y-6">
               <div 
                 className={`border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center cursor-pointer ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                 }`}
                 onDragEnter={handleDrag}
                 onDragLeave={handleDrag}
                 onDragOver={handleDrag}
                 onDrop={handleDrop}
                 onClick={() => fileInputRef.current?.click()}
               >
                 <UploadCloud className={`mb-4 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} size={48} />
                 <p className="text-lg font-medium text-slate-900">Click to upload or drag and drop</p>
                 <p className="text-sm text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
                 <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleChange} 
                    accept="image/*"
                 />
               </div>

               {uploads.length > 0 && (
                   <div className="space-y-3">
                       <h3 className="text-sm font-medium text-slate-700">Upload Queue</h3>
                       {uploads.map((upload, idx) => (
                           <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                               <div className="h-12 w-12 bg-white rounded border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                   {upload.file.type.startsWith('image/') ? (
                                       <img src={upload.preview} alt="" className="h-full w-full object-cover" />
                                   ) : (
                                       <FileText className="text-slate-400" />
                                   )}
                               </div>
                               <div className="flex-1 min-w-0">
                                   <div className="flex justify-between mb-1">
                                       <span className="text-sm font-medium text-slate-700 truncate">{upload.file.name}</span>
                                       <span className="text-xs text-slate-500 capitalize">{upload.status === UploadStatus.ANALYZING ? 'Analyzing with AI...' : upload.status.toLowerCase()}</span>
                                   </div>
                                   <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                       <div 
                                         className={`h-full transition-all duration-300 ${upload.status === UploadStatus.ERROR ? 'bg-red-500' : 'bg-blue-500'}`}
                                         style={{ width: `${upload.progress}%` }}
                                       />
                                   </div>
                                   {upload.error && <p className="text-xs text-red-500 mt-1">{upload.error}</p>}
                               </div>
                               {upload.status === UploadStatus.SUCCESS ? (
                                   <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                               ) : (
                                   <button onClick={() => removeUpload(upload.file)} className="text-slate-400 hover:text-slate-600">
                                       <X size={18} />
                                   </button>
                               )}
                           </div>
                       ))}
                   </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
