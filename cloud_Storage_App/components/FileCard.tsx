import React from 'react';
import { StoredFile } from '../types';
import { FileIcon, ImageIcon, MoreVertical, ExternalLink, Trash2, Tag, Info } from 'lucide-react';

interface FileCardProps {
  file: StoredFile;
  viewMode: 'grid' | 'list';
  onDelete: (id: string) => void;
  onView: (file: StoredFile) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, viewMode, onDelete, onView }) => {
  const isImage = file.type.startsWith('image/');
  const formattedSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  const formattedDate = new Date(file.createdAt).toLocaleDateString();

  if (viewMode === 'list') {
    return (
      <div className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="h-10 w-10 flex-shrink-0 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 overflow-hidden">
             {isImage ? (
                <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
             ) : (
                <FileIcon size={20} />
             )}
          </div>
          <div className="min-w-0 flex-1">
             <h3 className="text-sm font-medium text-slate-900 truncate" title={file.name}>{file.name}</h3>
             <div className="flex items-center text-xs text-slate-500 space-x-2 mt-0.5">
               <span>{formattedSize}</span>
               <span>•</span>
               <span>{formattedDate}</span>
               {file.tags && file.tags.length > 0 && (
                 <>
                    <span>•</span>
                    <span className="flex items-center"><Tag size={10} className="mr-1"/> {file.tags.slice(0, 2).join(', ')}</span>
                 </>
               )}
             </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(file)} className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
            <ExternalLink size={18} />
          </button>
          <button onClick={() => onDelete(file.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onView(file)}>
        {isImage ? (
          <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <FileIcon size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <button
                onClick={(e) => { e.stopPropagation(); onView(file); }}
                className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-blue-600 hover:scale-110 transition-transform"
            >
                <ExternalLink size={20} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                className="p-2 bg-white/90 rounded-full text-slate-700 hover:text-red-600 hover:scale-110 transition-transform"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 truncate" title={file.name}>{file.name}</h3>
        <p className="text-xs text-slate-500 mt-1">{formattedSize} • {formattedDate}</p>
        
        {file.description && (
             <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
               <span className="font-semibold text-blue-600 flex items-center gap-1 mb-0.5"><Info size={10} /> AI Analysis</span>
               {file.description}
             </p>
        )}

        <div className="mt-auto pt-3 flex flex-wrap gap-1">
            {file.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                    {tag}
                </span>
            ))}
             {file.tags && file.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    +{file.tags.length - 3}
                </span>
            )}
        </div>
      </div>
    </div>
  );
};
