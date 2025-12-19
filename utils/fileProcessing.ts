import { FileData, ProcessingStats } from '../types';

export const DEFAULT_IGNORED_DIRS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  '__pycache__',
  '.DS_Store',
  '.idea',
  '.vscode'
];

export const DEFAULT_IGNORED_EXTS = [
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', // Images
  '.mp4', '.mov', '.avi', '.webm', // Videos
  '.mp3', '.wav', '.ogg', // Audio
  '.zip', '.tar', '.gz', '.7z', '.rar', // Archives
  '.exe', '.dll', '.so', '.dylib', '.bin', // Binaries
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', // Documents
  '.pyc', '.class', '.o', // Compiled
  '.eot', '.ttf', '.woff', '.woff2' // Fonts
];

export interface IgnoreConfig {
  ignoredDirs: string[];
  ignoredExts: string[];
}

// Helper to check if we should process a file based on extension
const shouldProcessFile = (fileName: string, ignoredExts: Set<string>): boolean => {
  if (fileName.startsWith('.')) return false; 
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  // Check if extension matches, or if the filename itself is in the ignore list (unlikely for exts but safe)
  return !ignoredExts.has(ext);
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// --- Webkit Directory Entry API Types (Not in standard TS lib) ---
interface FileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
}

interface FileSystemFileEntry extends FileSystemEntry {
  file: (successCallback: (file: File) => void, errorCallback?: (error: Error) => void) => void;
}

interface FileSystemDirectoryEntry extends FileSystemEntry {
  createReader: () => FileSystemDirectoryReader;
}

interface FileSystemDirectoryReader {
  readEntries: (
    successCallback: (entries: FileSystemEntry[]) => void,
    errorCallback?: (error: Error) => void
  ) => void;
}

// Promisified readEntries for a directory reader
const readEntriesPromise = (reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> => {
  return new Promise((resolve, reject) => {
    reader.readEntries(resolve, reject);
  });
};

// Promisified file read
const readFileEntry = (entry: FileSystemFileEntry): Promise<File> => {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
};

// Promisified text content read
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file); // Assume text.
  });
};

// Recursive scanner
const scanEntry = async (
  entry: FileSystemEntry, 
  pathPrefix: string = '',
  config: { dirs: Set<string>, exts: Set<string> }
): Promise<{ files: FileData[], skipped: string[] }> => {
  let files: FileData[] = [];
  let skipped: string[] = [];

  if (entry.isFile) {
    if (shouldProcessFile(entry.name, config.exts)) {
      try {
        const file = await readFileEntry(entry as FileSystemFileEntry);
        // Basic check for huge files to prevent crashing (e.g. > 2MB)
        if (file.size > 2 * 1024 * 1024) {
          skipped.push(`${pathPrefix}${entry.name} (Too large > 2MB)`);
        } else {
          const content = await readFileContent(file);
          // Simple heuristic for binary content (null bytes)
          if (content.includes('\0')) {
             skipped.push(`${pathPrefix}${entry.name} (Binary detected)`);
          } else {
            files.push({
              path: pathPrefix + entry.name,
              content,
              size: file.size
            });
          }
        }
      } catch (e) {
        skipped.push(`${pathPrefix}${entry.name} (Read Error)`);
      }
    } else {
      skipped.push(`${pathPrefix}${entry.name} (Ignored extension)`);
    }
  } else if (entry.isDirectory) {
    if (config.dirs.has(entry.name)) {
       // Explicitly log skipped directories
       return { files: [], skipped: [`${pathPrefix}${entry.name}/`] };
    }
    
    const dirReader = (entry as FileSystemDirectoryEntry).createReader();
    let entries: FileSystemEntry[] = [];
    
    // readEntries might need to be called multiple times
    let batch: FileSystemEntry[];
    try {
        do {
        batch = await readEntriesPromise(dirReader);
        entries = entries.concat(batch);
        } while (batch.length > 0);

        for (const childEntry of entries) {
        const result = await scanEntry(childEntry, `${pathPrefix}${entry.name}/`, config);
        files = files.concat(result.files);
        skipped = skipped.concat(result.skipped);
        }
    } catch (e) {
         skipped.push(`${pathPrefix}${entry.name}/ (Access Denied/Error)`);
    }
  }

  return { files, skipped };
};

export const processFileItems = async (
    items: DataTransferItemList, 
    config: IgnoreConfig = { ignoredDirs: DEFAULT_IGNORED_DIRS, ignoredExts: DEFAULT_IGNORED_EXTS }
): Promise<{ files: FileData[], skipped: string[] }> => {
  const allFiles: FileData[] = [];
  const allSkipped: string[] = [];

  // Convert config arrays to Sets for O(1) lookup
  const configSets = {
      dirs: new Set(config.ignoredDirs),
      exts: new Set(config.ignoredExts.map(e => e.toLowerCase()))
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        const result = await scanEntry(entry, '', configSets);
        allFiles.push(...result.files);
        allSkipped.push(...result.skipped);
      }
    }
  }
  return { files: allFiles, skipped: allSkipped };
};

export const processFileList = async (
    fileList: FileList,
    config: IgnoreConfig = { ignoredDirs: DEFAULT_IGNORED_DIRS, ignoredExts: DEFAULT_IGNORED_EXTS }
): Promise<{ files: FileData[], skipped: string[] }> => {
  const files: FileData[] = [];
  const skipped: string[] = [];

  const configSets = {
    dirs: new Set(config.ignoredDirs),
    exts: new Set(config.ignoredExts.map(e => e.toLowerCase()))
};

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    // file.webkitRelativePath is populated if webkitdirectory is used
    const path = file.webkitRelativePath || file.name;
    const pathSegments = path.split('/');
    
    // Basic filter for ignored dirs in path if using webkitdirectory
    // Check if any segment of the path matches an ignored directory
    // Note: for fileList (flat list), we can only check segments.
    // We ignore the file name itself in this check, only directories.
    let hasIgnoredDir = false;
    // Iterate up to length-1 to skip filename
    for(let j=0; j < pathSegments.length - 1; j++) {
        if (configSets.dirs.has(pathSegments[j])) {
            hasIgnoredDir = true;
            break;
        }
    }

    if (hasIgnoredDir) {
        skipped.push(path);
        continue;
    }

    if (shouldProcessFile(file.name, configSets.exts)) {
        if (file.size > 2 * 1024 * 1024) {
            skipped.push(`${path} (Too large)`);
            continue;
        }

        try {
            const content = await readFileContent(file);
             if (content.includes('\0')) {
                skipped.push(`${path} (Binary detected)`);
             } else {
                 files.push({
                    path: path,
                    content,
                    size: file.size
                 });
             }
        } catch (e) {
            skipped.push(`${path} (Error)`);
        }
    } else {
      skipped.push(`${path} (Ignored)`);
    }
  }

  return { files, skipped };
};

export const generateMergedContent = (files: FileData[], headers?: { projectContext: string, dirStructure: string, fileContents: string }): string => {
  if (files.length === 0) return '';
  
  const h = headers || {
      projectContext: "# Project Context",
      dirStructure: "## Directory Structure",
      fileContents: "## File Contents"
  };

  const tree = files.map(f => `- ${f.path}`).join('\n');
  const fileContents = files.map(f => {
    const ext = f.path.split('.').pop() || 'txt';
    return `### ${f.path}\n\`\`\`${ext}\n${f.content}\n\`\`\``;
  }).join('\n\n');

  return `${h.projectContext}

${h.dirStructure}
${tree}

${h.fileContents}

${fileContents}
`;
};