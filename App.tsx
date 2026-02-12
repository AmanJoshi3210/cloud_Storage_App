import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { StoredFile, ViewMode, CloudinaryConfig } from './types';
import { FileCard } from './components/FileCard';
import { Button } from './components/Button';
import { LayoutGrid, List, Plus, Search, Rocket } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';
import { UploadModal } from './components/UploadModal';
import { ImageViewer } from './components/ImageViewer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/AuthPage';
import { api } from './services/api';

const LOCAL_STORAGE_KEY_CONFIG = 'cloudgem_config';

const Dashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [config, setConfig] = useState<CloudinaryConfig | null>(null);
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<StoredFile | null>(null);

  // Initial Load & Fetch Files
  useEffect(() => {
    // Load config
    const savedConfig = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }

    // Load files for this user
    const loadFiles = async () => {
        if (user && token) {
            try {
                const userFiles = await api.files.list(token, user.id);
                setFiles(userFiles);
            } catch (err) {
                console.error("Failed to load files", err);
            }
        }
    };
    loadFiles();
  }, [user, token]);

  // Save Config
  const handleSaveConfig = (newConfig: CloudinaryConfig) => {
    setConfig(newConfig);
    localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
  };

  // Handle New Upload
  const handleUploadComplete = async (newFile: StoredFile) => {
    // Add file to backend
    if (user && token) {
        try {
            const savedFile = await api.files.create(newFile, token, user.id);
            setFiles(prev => [savedFile, ...prev]);
        } catch (err) {
            console.error("Failed to save file metadata", err);
            // Fallback for visual update even if backend fail (in demo mode shouldn't happen)
            setFiles(prev => [newFile, ...prev]); 
        }
    }
  };

  // Delete File
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this file?')) {
        try {
            if (user && token) {
                await api.files.delete(id, token, user.id);
                setFiles(prev => prev.filter(f => f.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete file");
        }
    }
  };

  // Filtering
  const filteredFiles = useMemo(() => {
    let filtered = files;
    
    if (activeTab === 'images') {
        filtered = filtered.filter(f => f.type.startsWith('image/'));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        f.description?.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [files, activeTab, searchQuery]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        openSettings={() => setIsSettingsOpen(true)} 
        filesCount={files.length}
      />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" onClick={logout}>Sign Out</Button>
             <Button onClick={() => setIsUploadOpen(true)} className="shadow-lg shadow-blue-500/20">
                <Plus size={20} className="mr-2" />
                Upload New
             </Button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text"
                    placeholder="Search files, tags, or descriptions..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutGrid size={20} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <List size={20} />
                </button>
            </div>
        </div>

        {/* Content */}
        {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-32 w-32 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Rocket size={48} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No files found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                    {searchQuery 
                        ? "No files match your search criteria. Try a different keyword." 
                        : "Your cloud storage is empty. Upload your first file to get started."}
                </p>
                {!searchQuery && (
                    <Button onClick={() => setIsUploadOpen(true)}>Upload Files</Button>
                )}
            </div>
        ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                {filteredFiles.map(file => (
                    <FileCard 
                        key={file.id} 
                        file={file} 
                        viewMode={viewMode} 
                        onDelete={handleDelete}
                        onView={setViewingFile}
                    />
                ))}
            </div>
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={config} 
        onSave={handleSaveConfig} 
      />

      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        config={config}
        onUploadComplete={handleUploadComplete}
        openSettings={() => { setIsUploadOpen(false); setIsSettingsOpen(true); }}
      />

      <ImageViewer 
        file={viewingFile}
        onClose={() => setViewingFile(null)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
    
    return user ? <Dashboard /> : <AuthPage />;
};

const App: React.FC = () => {
  return (
      <AuthProvider>
          <AppContent />
      </AuthProvider>
  );
};

export default App;
