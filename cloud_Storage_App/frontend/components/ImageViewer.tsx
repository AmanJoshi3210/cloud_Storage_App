import React from 'react';
import { StoredFile } from '../types';
import { X, Calendar, HardDrive, Tag, Info, ExternalLink } from 'lucide-react';

interface ImageViewerProps {
  file: StoredFile | null;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ file, onClose }) => {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
      >
        <X size={24} />
      </button>

      <div className="flex flex-col md:flex-row w-full max-w-6xl h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex-1 bg-black flex items-center justify-center p-4 relative">
             {isImage ? (
              <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain" />
             ) : (
              <div className="text-center text-white/80 max-w-md">
                <p className="text-xl font-semibold mb-2">Preview unavailable for this file type</p>
                <p className="text-sm text-white/60 mb-6">Open the file in a new tab to access it.</p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Open File
                </a>
              </div>
             )}
        </div>
        
        <div className="w-full md:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{file.name}</h2>
                </div>

                {file.description && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                            <Info size={16} />
                            <span>AI Analysis</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            {file.description}
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Details</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Calendar size={18} />
                            <div>
                                <p className="text-xs text-slate-400">Created</p>
                                <p className="text-sm font-medium">{new Date(file.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <HardDrive size={18} />
                            <div>
                                <p className="text-xs text-slate-400">Size</p>
                                <p className="text-sm font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Tag size={18} />
                             <div>
                                <p className="text-xs text-slate-400">Type</p>
                                <p className="text-sm font-medium">{file.type}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {file.tags && file.tags.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {file.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50">
                <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    Download Original
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};