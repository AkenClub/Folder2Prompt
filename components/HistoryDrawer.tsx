import React from 'react';
import { HistoryItem } from '../types';
import { Button } from './Button';
import { Trash2, Copy, X, Clock, FileText } from 'lucide-react';
import { formatBytes } from '../utils/fileProcessing';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  t: any; // Using any for simplicity
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoad,
  onDelete,
  onClear,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md h-full bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t.title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>{t.empty}</p>
              <p className="text-sm">{t.emptyDesc}</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className="group border border-border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 cursor-pointer" onClick={() => onLoad(item)}>
                    <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                  <span className="bg-secondary px-2 py-0.5 rounded">
                    {item.stats.totalFiles} {t.files}
                  </span>
                  <span className="bg-secondary px-2 py-0.5 rounded">
                    {formatBytes(item.stats.totalSize)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onLoad(item)}
                  >
                    <FileText className="w-3 h-3 mr-2" />
                    {t.load}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-border bg-secondary/20">
            <Button variant="destructive" className="w-full" onClick={onClear}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t.clearAll}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};