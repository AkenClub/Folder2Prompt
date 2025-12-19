import React, { useRef, useState, useCallback } from 'react';
import { Upload, FolderUp, FileUp, Loader2, Plus } from 'lucide-react';
import { Button } from './Button';
import { processFileItems, processFileList, IgnoreConfig } from '../utils/fileProcessing';
import { FileData } from '../types';

interface FileDropZoneProps {
  onFilesAdded: (files: FileData[], skipped: string[]) => void;
  ignoreConfig: IgnoreConfig;
  t: any;
  hasFiles?: boolean;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFilesAdded, ignoreConfig, t, hasFiles = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsProcessing(true);

    try {
      const items = e.dataTransfer.items;
      if (items) {
        const { files, skipped } = await processFileItems(items, ignoreConfig);
        onFilesAdded(files, skipped);
      } else {
        // Fallback for older browsers
        const { files, skipped } = await processFileList(e.dataTransfer.files, ignoreConfig);
        onFilesAdded(files, skipped);
      }
    } catch (err) {
      console.error("Drop processing failed:", err);
      alert(t.error);
    } finally {
      setIsProcessing(false);
    }
  }, [onFilesAdded, ignoreConfig, t]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsProcessing(true);
    try {
      const { files, skipped } = await processFileList(e.target.files, ignoreConfig);
      onFilesAdded(files, skipped);
    } catch (err) {
      console.error("File selection failed:", err);
    } finally {
      setIsProcessing(false);
      // Reset input so same files can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div 
      className={`
        relative border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 ease-in-out
        ${isDragging 
          ? 'border-primary bg-primary/10' 
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        {isProcessing ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-foreground">{t.processing}</p>
            <p className="text-sm text-muted-foreground">{t.processingDesc}</p>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-full bg-secondary text-primary mb-2">
              {hasFiles ? <Plus className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              {hasFiles ? t.dragDropAppend : t.dragDrop}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              {hasFiles ? t.dragDropAppendDesc : t.privacy}
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
              />
              <input 
                type="file" 
                className="hidden" 
                ref={folderInputRef} 
                onChange={handleFileSelect}
                {...{ webkitdirectory: "", directory: "" } as any} 
              />
              
              <Button 
                variant="outline" 
                onClick={() => folderInputRef.current?.click()}
              >
                <FolderUp className="w-4 h-4 mr-2" />
                {t.selectFolder}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="w-4 h-4 mr-2" />
                {t.selectFiles}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};