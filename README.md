# 📄 AI Report Builder

> An intelligent web application that generates reports from your files — just upload your documents and let AI handle the rest.

---

## 🌟 Introduction

**AI Report Builder** is a tool that automatically generates professional reports from existing content. Simply upload a document, select your desired report type, and let AI analyze and summarize the content into a well-structured report — ready to edit and export to PDF instantly.

---

## ✨ Key Features

- **📁 Multiple File Formats** — Supports `.txt`, `.md`, `.docx`, and `.pptx` files; upload documents via drag and drop or file selection.
- **🤖 AI-Powered Generation** — Uses Claude AI to analyze content and generate professionally structured reports.
- **📝 Built-in Editor** — Edit reports directly using a Markdown editor with a formatting toolbar.
- **🎨 Report Templates** — Choose from academic reports, business reports, content summaries, or custom templates.
- **📥 PDF Export** — Export reports as well-formatted PDF files with Vietnamese language support and instant downloads.
- **💾 Report History** — Save and reopen previously generated reports.
- **🔄 Real-Time Streaming** — Watch AI generate reports in real time.

---

## 🚀 Quick Start

```bash
# Clone the repository and install dependencies
git clone https://github.com/your-username/ai-report-builder.git
cd ai-report-builder
npm install

# Configure environment variables
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| AI | Anthropic Claude API (Streaming) |
| File Parsing | mammoth.js · pptxgenjs |
| State Management | Zustand + IndexedDB |
| PDF Export | @react-pdf/renderer |
| Deployment | Vercel |

---

## 📁 Project Structure

```bash
├── app/
│   ├── page.tsx              # File upload page
│   ├── report/page.tsx       # Report generation and editing page
│   ├── history/page.tsx      # Report history page
│   └── api/generate-report/  # API route for AI processing
├── components/
│   ├── FileUploader.tsx      # Drag-and-drop file uploader
│   ├── ReportEditor.tsx      # Markdown editor
│   └── PDFExporter.tsx       # PDF export component
├── lib/
│   ├── ai-client.ts          # Anthropic SDK wrapper
│   ├── file-parsers