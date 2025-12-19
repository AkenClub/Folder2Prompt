export interface FileData {
  path: string;
  content: string;
  size: number;
}

export interface ProcessingStats {
  totalFiles: number;
  totalSize: number;
  skippedFiles: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  name: string; // e.g., "src + 5 files"
  content: string;
  stats: ProcessingStats;
}
