export type Language = 'en' | 'zh';

export const translations = {
  en: {
    app: {
      title: "Folder2Prompt",
      subtitle: "Prepare codebase context for AI",
      historyBtn: "History",
      settingsBtn: "Settings",
      sessionStats: "Session Stats",
      total: "Total",
      files: "Files",
      ignored: "Ignored",
      viewIgnored: "View ignored files log",
      copy: "Copy to Clipboard",
      copied: "Copied!",
      saveHistory: "Save to History",
      reset: "Reset All",
      confirmReset: "Are you sure you want to clear the current session?",
      cancel: "Cancel",
      confirm: "Confirm",
      savedMsg: "Saved to history!",
      confirmLoad: "Loading history will clear your current file list. Continue?",
      dirStructure: "Directory Structure",
      previewOutput: "Preview Output",
      placeholder: "Generated prompt will appear here",
      unknownFolder: "Unknown Folder",
      others: "others"
    },
    dropzone: {
      processing: "Processing files...",
      processingDesc: "This might take a moment for large folders.",
      dragDrop: "Drag & Drop Folder or Files Here",
      dragDropAppend: "Drag & Drop to Append Files",
      dragDropAppendDesc: "Files will be added to the current list. To start over, use the Reset button below.",
      privacy: "Your files are processed entirely in your browser. Nothing is uploaded to a server.",
      selectFolder: "Select Folder",
      selectFiles: "Select Files",
      error: "Failed to process files. Please try again."
    },
    history: {
      title: "History",
      empty: "No history yet.",
      emptyDesc: "Processed prompts will appear here.",
      files: "files",
      load: "Load",
      clearAll: "Clear All History"
    },
    settings: {
      title: "Settings",
      ignoredExtensions: "Ignored File Extensions",
      ignoredExtensionsDesc: "Comma separated (e.g., .png, .jpg)",
      ignoredDirectories: "Ignored Directory Names",
      ignoredDirectoriesDesc: "Comma separated (e.g., node_modules, .git)",
      save: "Save Changes",
      resetDefaults: "Reset to Defaults"
    },
    output: {
      projectContext: "# Project Context",
      dirStructure: "## Directory Structure",
      fileContents: "## File Contents"
    }
  },
  zh: {
    app: {
      title: "Folder2Prompt",
      subtitle: "为 AI 准备代码库上下文",
      historyBtn: "历史记录",
      settingsBtn: "设置",
      sessionStats: "会话统计",
      total: "总计",
      files: "文件数",
      ignored: "已忽略",
      viewIgnored: "查看忽略文件日志",
      copy: "复制到剪贴板",
      copied: "已复制！",
      saveHistory: "保存到历史",
      reset: "重置所有",
      confirmReset: "确定要清空当前会话吗？",
      cancel: "取消",
      confirm: "确认",
      savedMsg: "已保存到历史记录！",
      confirmLoad: "加载历史记录将清空当前文件列表。继续吗？",
      dirStructure: "目录结构",
      previewOutput: "预览输出",
      placeholder: "生成的提示词将显示在这里",
      unknownFolder: "未知文件夹",
      others: "其他"
    },
    dropzone: {
      processing: "正在处理文件...",
      processingDesc: "大型文件夹可能需要一些时间。",
      dragDrop: "拖放文件夹或文件到这里",
      dragDropAppend: "拖放更多文件到此处追加",
      dragDropAppendDesc: "新文件将添加到当前列表末尾。如需重新开始，请点击下方的重置按钮。",
      privacy: "您的文件完全在浏览器中处理。不会上传到服务器。",
      selectFolder: "选择文件夹",
      selectFiles: "选择文件",
      error: "处理文件失败，请重试。"
    },
    history: {
      title: "历史记录",
      empty: "暂无历史记录。",
      emptyDesc: "处理过的提示词将显示在这里。",
      files: "个文件",
      load: "加载",
      clearAll: "清除所有历史记录"
    },
    settings: {
      title: "设置",
      ignoredExtensions: "忽略的文件后缀",
      ignoredExtensionsDesc: "用逗号分隔 (例如: .png, .jpg)",
      ignoredDirectories: "忽略的文件夹名",
      ignoredDirectoriesDesc: "用逗号分隔 (例如: node_modules, .git)",
      save: "保存更改",
      resetDefaults: "恢复默认"
    },
    output: {
      projectContext: "# 项目上下文",
      dirStructure: "## 目录结构",
      fileContents: "## 文件内容"
    }
  }
};