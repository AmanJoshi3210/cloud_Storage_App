import React, { useState, useEffect } from 'react';
import { CloudinaryConfig } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { X, Cloud, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CloudinaryConfig | null;
  onSave: (config: CloudinaryConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [cloudName, setCloudName] = useState('');
  const [uploadPreset, setUploadPreset] = useState('');

  useEffect(() => {
    if (config) {
      setCloudName(config.cloudName);
      setUploadPreset(config.uploadPreset);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ cloudName, uploadPreset });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Cloud size={20} className="text-blue-600"/>
            Cloud Storage Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 text-sm text-blue-800">
             <Info className="flex-shrink-0 mt-0.5" size={16} />
             <div>
                <p className="font-medium">Cloudinary Configuration Required</p>
                <p className="mt-1 opacity-90">To enable uploads, you need a free Cloudinary account. Go to Settings &gt; Upload and create an <strong>Unsigned</strong> upload preset.</p>
             </div>
          </div>

          <Input
            label="Cloud Name"
            placeholder="e.g. demo-cloud"
            value={cloudName}
            onChange={(e) => setCloudName(e.target.value)}
            required
          />
          <Input
            label="Upload Preset (Unsigned)"
            placeholder="e.g. my_unsigned_preset"
            value={uploadPreset}
            onChange={(e) => setUploadPreset(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Configuration</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
