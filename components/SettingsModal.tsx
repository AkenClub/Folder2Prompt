import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Settings as SettingsIcon, RotateCcw } from 'lucide-react';
import { DEFAULT_IGNORED_DIRS, DEFAULT_IGNORED_EXTS, IgnoreConfig } from '../utils/fileProcessing';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: IgnoreConfig;
  onSave: (config: IgnoreConfig) => void;
  t: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  t
}) => {
  const [exts, setExts] = useState('');
  const [dirs, setDirs] = useState('');

  // Sync state with props when opened
  useEffect(() => {
    if (isOpen) {
      setExts(config.ignoredExts.join(', '));
      setDirs(config.ignoredDirs.join(', '));
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = () => {
    const cleanList = (str: string) => str.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    
    onSave({
      ignoredExts: cleanList(exts),
      ignoredDirs: cleanList(dirs)
    });
    onClose();
  };

  const handleReset = () => {
    setExts(DEFAULT_IGNORED_EXTS.join(', '));
    setDirs(DEFAULT_IGNORED_DIRS.join(', '));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            {t.title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t.ignoredExtensions}
            </label>
            <p className="text-xs text-muted-foreground">{t.ignoredExtensionsDesc}</p>
            <textarea 
              className="flex min-h-[120px] w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={exts}
              onChange={(e) => setExts(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t.ignoredDirectories}
            </label>
            <p className="text-xs text-muted-foreground">{t.ignoredDirectoriesDesc}</p>
            <textarea 
              className="flex min-h-[120px] w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={dirs}
              onChange={(e) => setDirs(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card flex justify-between items-center">
          <Button variant="ghost" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
             <RotateCcw className="w-4 h-4 mr-2" />
             {t.resetDefaults}
          </Button>
          <Button onClick={handleSave}>
            {t.save}
          </Button>
        </div>
      </div>
    </div>
  );
};