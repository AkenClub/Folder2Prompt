<div align="center">
  <h1>Folder2Prompt</h1>
  <h3>为 AI 准备代码上下文</h3>
  <p>可以将您的文件或文件夹转换为适合大语言模型（LLM）阅读的 Prompt 格式。</p>
</div>

## 📖 项目简介

**Folder2Prompt** 是一个基于浏览器的轻量级工具，旨在帮助开发者快速将本地代码库或文档转换为结构化的文本上下文。生成的文本已优化格式，可以直接复制并发送给 ChatGPT、Claude、Gemini 等 AI 助手，从未如此轻松地进行代码问答。

## ✨ 核心特性

- **🔒 隐私优先**：所有文件处理均在浏览器本地完成，**绝不上传**至任何服务器，确保您的代码安全。
- **📂 拖拽便捷**：支持直接拖放文件夹或多个文件，操作直观简单。
- **⚡ 智能过滤**：默认自动忽略 `node_modules`、`.git` 等无关目录及二进制文件，支持自定义忽略规则。
- **📝 实时统计**：直观展示已处理的文件数量、大小及被忽略的文件列表。
- **🌗 界面友好**：支持明亮/暗黑模式切换，以及中英文多语言界面。
- **📋 一键复制**：快速将生成的合并文本复制到剪贴板。

## 🚀 快速开始

### 🌐 在线体验

**立即使用**：[https://akenclub.github.io/Folder2Prompt/](https://akenclub.github.io/Folder2Prompt/)

### 📦 访问源码

GitHub 仓库：[https://github.com/AkenClub/Folder2Prompt](https://github.com/AkenClub/Folder2Prompt)

### 本地开发

如果您希望在本地运行或参与开发：

1. **环境准备**
   确保您的环境中已安装 [Node.js](https://nodejs.org/)。

2. **克隆项目**
   ```bash
   git clone https://github.com/AkenClub/Folder2Prompt.git
   cd Folder2Prompt
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```
   启动后，访问终端显示的本地地址（通常为 `http://localhost:5173`）即可使用。

5. **构建部署**
   ```bash
   npm run build
   ```

## 🛠️ 技术栈

- **前端框架**: React + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS (CDN)
- **图标库**: Lucide React

## 📄 许可证

本项目开源，欢迎 Star 和 Fork！
