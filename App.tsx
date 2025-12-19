import React, { useState, useEffect, useCallback } from 'react';
import { 
  Copy, 
  RotateCcw, 
  Save, 
  History as HistoryIcon, 
  CheckCheck,
  FileCode,
  FolderOpen,
  Languages,
  Settings as SettingsIcon,
  Sun,
  Moon
} from 'lucide-react';
import { FileDropZone } from './components/FileDropZone';
import { Button } from './components/Button';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { 
  generateMergedContent, 
  formatBytes, 
  DEFAULT_IGNORED_DIRS, 
  DEFAULT_IGNORED_EXTS, 
  IgnoreConfig 
} from './utils/fileProcessing';
import { FileData, HistoryItem, ProcessingStats } from './types';
import { translations, Language } from './utils/translations';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [skippedFiles, setSkippedFiles] = useState<string[]>([]);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // History state
  const [isLoadedFromHistory, setIsLoadedFromHistory] = useState(false);
  const [activeHistoryItem, setActiveHistoryItem] = useState<HistoryItem | null>(null);
  const [historyPaths, setHistoryPaths] = useState<string[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');
  
  // Theme state: 'dark' or 'light'
  // Priority: LocalStorage -> System Preference -> Light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      // 1. Check Local Storage
      const saved = localStorage.getItem('folder2prompt_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      
      // 2. Check System Preference
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Ignore errors
    }
    // 3. Default fallback
    return 'light';
  });

  const [ignoreConfig, setIgnoreConfig] = useState<IgnoreConfig>(() => {
    try {
      const saved = localStorage.getItem('folder2prompt_ignore_config');
      return saved ? JSON.parse(saved) : { ignoredDirs: DEFAULT_IGNORED_DIRS, ignoredExts: DEFAULT_IGNORED_EXTS };
    } catch {
      return { ignoredDirs: DEFAULT_IGNORED_DIRS, ignoredExts: DEFAULT_IGNORED_EXTS };
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('folder2prompt_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const t = translations[language];

  // Apply theme class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('folder2prompt_theme', theme);
  }, [theme]);

  // Re-generate output whenever files or language change
  useEffect(() => {
    if (files.length > 0) {
      // If we have active files, we are not in history view mode anymore
      setIsLoadedFromHistory(false);
      setActiveHistoryItem(null);
      setHistoryPaths([]);
      const generated = generateMergedContent(files, t.output);
      setOutput(generated);
    } else if (!isLoadedFromHistory) {
      // Only clear output if we are NOT viewing a history item
      // This prevents clearing the output when loadHistoryItem sets files to []
      setOutput('');
    }
  }, [files, language, t.output, isLoadedFromHistory]);

  // Save history to local storage
  useEffect(() => {
    localStorage.setItem('folder2prompt_history', JSON.stringify(history));
  }, [history]);

  // Save config to local storage
  useEffect(() => {
    localStorage.setItem('folder2prompt_ignore_config', JSON.stringify(ignoreConfig));
  }, [ignoreConfig]);

  const handleFilesAdded = (newFiles: FileData[], newSkipped: string[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setSkippedFiles(prev => [...prev, ...newSkipped]);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setFiles([]);
    setSkippedFiles([]);
    setIsLoadedFromHistory(false);
    setActiveHistoryItem(null);
    setHistoryPaths([]);
    setOutput('');
    setShowResetConfirm(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSaveToHistory = () => {
    if (!files.length) return;

    const stats: ProcessingStats = {
      totalFiles: files.length,
      totalSize: files.reduce((acc, f) => acc + f.size, 0),
      skippedFiles: skippedFiles
    };

    // Create a meaningful name
    const folderNames = new Set(files.map(f => f.path.split('/')[0]).filter(n => n && !n.includes('.')));
    const primaryName = Array.from(folderNames)[0] || t.app.unknownFolder;
    const name = folderNames.size > 1 ? `${primaryName} + ${t.app.others}` : primaryName;

    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      name: `${name} (${files.length} ${t.history.files})`,
      content: output,
      stats
    };

    setHistory(prev => [newItem, ...prev]);
    
    // Show success state
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const extractPathsFromContent = (content: string): string[] => {
    const lines = content.split('\n');
    const paths: string[] = [];
    
    // Simple parser: look for lines starting with "- " before the first code block
    // This assumes the standard format generated by this app
    for (const line of lines) {
      if (line.startsWith('```')) {
        break; // Stop when file contents start
      }
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        paths.push(trimmed.substring(2));
      }
    }
    return paths;
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setFiles([]); // Clear live files
    setIsLoadedFromHistory(true);
    setActiveHistoryItem(item);
    setSkippedFiles(item.stats.skippedFiles);
    setOutput(item.content);
    setHistoryPaths(extractPathsFromContent(item.content));
    setIsHistoryOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Derived state for display
  const hasContent = files.length > 0 || isLoadedFromHistory;
  const displayTotalFiles = isLoadedFromHistory && activeHistoryItem ? activeHistoryItem.stats.totalFiles : files.length;
  const displayTotalSize = isLoadedFromHistory && activeHistoryItem ? activeHistoryItem.stats.totalSize : files.reduce((a, b) => a + b.size, 0);
  const displayPaths = isLoadedFromHistory ? historyPaths : files.map(f => f.path);
  const hasFiles = files.length > 0 || skippedFiles.length > 0;

  return (
    <div className="flex flex-col bg-background min-h-screen lg:h-screen lg:overflow-hidden relative transition-colors duration-300">
      {/* Header */}
      <header className="shrink-0 sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-lg">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t.app.title}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{t.app.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <Button variant="ghost" onClick={toggleTheme} title={theme === 'dark' ? "Switch to Light Mode" : "切换到暗色模式"}>
               {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </Button>
             <Button variant="ghost" onClick={toggleLanguage} title={language === 'zh' ? "Switch to English" : "切换到中文"}>
               <Languages className="w-5 h-5 mr-1" />
               <span className="text-xs font-semibold">{language.toUpperCase()}</span>
             </Button>
            <Button variant="ghost" onClick={() => setIsSettingsOpen(true)}>
              <SettingsIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">{t.app.settingsBtn}</span>
            </Button>
            <Button variant="ghost" onClick={() => setIsHistoryOpen(true)}>
              <HistoryIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">{t.app.historyBtn}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 gap-6 grid lg:grid-cols-[1fr_1.2fr] lg:min-h-0 h-auto">
        
        {/* Left Column: Upload & Controls */}
        <div className="flex flex-col gap-6 lg:overflow-y-auto pr-2 custom-scrollbar lg:h-full">
          
          <FileDropZone 
            onFilesAdded={handleFilesAdded} 
            ignoreConfig={ignoreConfig}
            t={t.dropzone} 
            hasFiles={hasFiles}
          />

          {/* Stats & Actions */}
          <div className="shrink-0 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                <FileCode className="w-5 h-5 mr-2 text-primary" />
                {t.app.sessionStats}
              </h2>
              {hasContent && (
                <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-secondary-foreground">
                  {t.app.total}: {formatBytes(displayTotalSize)}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">{t.app.files}</span>
                <span className="text-2xl font-bold">{displayTotalFiles}</span>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">{t.app.ignored}</span>
                <span className="text-2xl font-bold text-orange-500">{skippedFiles.length}</span>
              </div>
            </div>

            {skippedFiles.length > 0 && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-primary transition-colors">{t.app.viewIgnored}</summary>
                <div className="mt-2 max-h-32 overflow-y-auto p-2 bg-muted rounded border border-border">
                  {skippedFiles.slice(0, 100).map((s, i) => <div key={i} className="py-0.5">{s}</div>)}
                  {skippedFiles.length > 100 && (
                    <div className="py-1 text-muted-foreground/70 italic">
                      ... {t.app.others.replace('others', '')} {skippedFiles.length - 100} {t.history.files}
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-2 pt-2">
               <Button 
                className={`flex-[2] transition-all duration-300 font-semibold ${copied ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' : 'text-primary-foreground'}`} 
                variant={copied ? undefined : 'primary'}
                disabled={!hasContent && output.length === 0}
                onClick={handleCopy}
              >
                {copied ? <CheckCheck className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? t.app.copied : t.app.copy}
              </Button>
              <Button 
                variant="outline" 
                title={t.app.saveHistory}
                disabled={files.length === 0} // Only enable save for active sessions, not loaded history
                onClick={handleSaveToHistory}
                className={saved ? "text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20" : ""}
              >
                {saved ? <CheckCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              </Button>
              <Button 
                variant="destructive" 
                title={t.app.reset}
                disabled={!hasContent && output.length === 0 && skippedFiles.length === 0}
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

           {/* Directory Tree Preview (Mini) */}
           {hasContent && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex-1 flex flex-col min-h-[200px] shrink-0">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">{t.app.dirStructure}</h3>
              <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs overflow-y-auto flex-1 max-h-[400px]">
                 {displayPaths.map((path, idx) => (
                   <div key={idx} className="whitespace-nowrap py-0.5 px-1 hover:bg-white/5 rounded">
                     {path}
                   </div>
                 ))}
                 {displayPaths.length === 0 && (
                   <div className="text-muted-foreground italic p-2">
                     {t.app.unknownFolder}
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden h-[600px] lg:h-full">
          <div className="shrink-0 flex items-center justify-between p-3 border-b border-border bg-secondary/20">
            <span className="text-sm font-medium text-muted-foreground px-2">{t.app.previewOutput}</span>
            <div className="flex gap-2">
               {/* Additional actions could go here */}
            </div>
          </div>
          <div className="relative flex-1 bg-zinc-50 dark:bg-[#1e1e1e] text-zinc-800 dark:text-gray-300 font-mono text-sm overflow-auto transition-colors">
             {output ? (
               <pre className="p-6 min-h-full whitespace-pre-wrap break-all">
                 {output}
               </pre>
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 select-none">
                 <div className="text-center">
                    <FileCode className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>{t.app.placeholder}</p>
                 </div>
               </div>
             )}
          </div>
        </div>

      </main>

      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoad={loadHistoryItem}
        onDelete={(id) => setHistory(prev => prev.filter(h => h.id !== id))}
        onClear={() => setHistory([])}
        t={t.history}
      />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={ignoreConfig}
        onSave={setIgnoreConfig}
        t={t.settings}
      />

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-card border border-border p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
             <h3 className="text-lg font-semibold mb-2">{t.app.reset}</h3>
             <p className="text-muted-foreground mb-6 text-sm">{t.app.confirmReset}</p>
             <div className="flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
                 {t.app.cancel}
               </Button>
               <Button variant="destructive" onClick={confirmReset}>
                 {t.app.confirm}
               </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;