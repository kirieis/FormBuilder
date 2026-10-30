"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  Upload,
  FileText,
  File,
  FileCode,
  FileArchive,
  X,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  extractDocument,
  type ExtractedDocument,
} from "@/lib/document-extractor";

const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".txt", ".md", ".docx", ".pptx"];

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  ".txt": ["text/plain", "application/octet-stream"],
  ".md": [
    "text/markdown",
    "text/x-markdown",
    "text/plain",
    "application/octet-stream",
  ],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream",
  ],
  ".pptx": [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream",
  ],
};

type SelectedDocument = {
  id: string;
  document: ExtractedDocument;
};

function getExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : "";
}

function getFileId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(extension: string) {
  switch (extension) {
    case ".txt":
      return FileText;
    case ".md":
      return FileCode;
    case ".docx":
    case ".pptx":
      return FileArchive;
    default:
      return File;
  }
}

async function validateFile(file: File): Promise<void> {
  const extension = getExtension(file.name);

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `"${file.name}" has an unsupported format. Allowed formats: .txt, .md, .docx, .pptx.`,
    );
  }

  if (file.type && !ALLOWED_MIME_TYPES[extension].includes(file.type)) {
    throw new Error(
      `"${file.name}" has a file type that does not match its extension.`,
    );
  }

  if (file.size === 0) {
    throw new Error(`"${file.name}" is empty.`);
  }

  if (extension === ".docx" || extension === ".pptx") {
    const header = new Uint8Array(
      await file.slice(0, 4).arrayBuffer(),
    );

    const isZipFile =
      header.length >= 4 &&
      header[0] === 0x50 &&
      header[1] === 0x4b &&
      [0x03, 0x05, 0x07].includes(header[2]) &&
      [0x04, 0x06, 0x08].includes(header[3]);

    if (!isZipFile) {
      throw new Error(
        `"${file.name}" does not appear to be a valid Office document.`,
      );
    }
  }
}

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<SelectedDocument[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const totalSize = files.reduce((total, file) => total + file.size, 0);

  async function addFiles(selectedFiles: FileList | File[]) {
    const incomingFiles = Array.from(selectedFiles);

    if (incomingFiles.length === 0 || isValidating) return;

    setIsValidating(true);
    setErrors([]);

    const newErrors: string[] = [];
    const acceptedFiles: File[] = [];
    const extractedDocuments: SelectedDocument[] = [];

    let currentSize = files.reduce(
      (total, file) => total + file.size,
      0,
    );

    try {
      for (const file of incomingFiles) {
        const id = getFileId(file);

        try {
          await validateFile(file);

          const alreadyAdded = [...files, ...acceptedFiles].some(
            (existingFile) => getFileId(existingFile) === id,
          );

          if (alreadyAdded) {
            throw new Error(`"${file.name}" has already been added.`);
          }

          if (currentSize + file.size > MAX_TOTAL_SIZE) {
            throw new Error(
              `"${file.name}" exceeds the 50 MB total upload limit. Remove other files or choose a smaller file.`,
            );
          }

          // Extract locally in the browser; no AI API is called.
          const document = await extractDocument(file);

          acceptedFiles.push(file);
          extractedDocuments.push({ id, document });
          currentSize += file.size;
        } catch (error) {
          newErrors.push(
            error instanceof Error
              ? error.message
              : `Could not process "${file.name}".`,
          );
        }
      }

      if (acceptedFiles.length > 0) {
        setFiles((previous) => [...previous, ...acceptedFiles]);
      }

      if (extractedDocuments.length > 0) {
        setDocuments((previous) => [
          ...previous,
          ...extractedDocuments,
        ]);
      }

      setErrors(newErrors);
    } finally {
      setIsValidating(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeFile(fileToRemove: File) {
    const id = getFileId(fileToRemove);

    setFiles((previous) =>
      previous.filter((file) => getFileId(file) !== id),
    );

    setDocuments((previous) =>
      previous.filter((entry) => entry.id !== id),
    );

    setErrors([]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void addFiles(event.dataTransfer.files);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Upload Documents
        </h1>
        <p className="mt-2 text-gray-500">
          Upload documents and preview their extracted text.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".txt,.md,.docx,.pptx"
        className="hidden"
        aria-label="Select documents"
        onChange={(event) => {
          if (event.target.files) {
            void addFiles(event.target.files);
          }
        }}
      />

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();

          if (
            !event.currentTarget.contains(
              event.relatedTarget as Node,
            )
          ) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
        onClick={() => {
          if (!isValidating) inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (
            (event.key === "Enter" || event.key === " ") &&
            !isValidating
          ) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop documents here or select files"
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
          } ${isValidating ? "pointer-events-none opacity-60" : ""}`}
      >
        {isValidating ? (
          <LoaderCircle className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-500" />
        ) : (
          <Upload className="mx-auto mb-4 h-10 w-10 text-gray-400" />
        )}

        <p className="font-medium text-gray-700">
          {isValidating
            ? "Extracting document text..."
            : isDragging
              ? "Drop your files here"
              : "Drag and drop files here, or click to select"}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Supports .txt, .md, .docx, and .pptx
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Maximum total size: 50 MB
        </p>

        <Button
          type="button"
          className="mt-6"
          disabled={isValidating}
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {isValidating ? "Processing..." : "Select Files"}
        </Button>
      </div>

      {errors.length > 0 && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <div className="mb-2 flex items-center gap-2 font-medium text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            Some files could not be processed
          </div>

          <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
            {errors.map((error, index) => (
              <li key={`${error}-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Selected Files ({files.length})
          </h2>

          <span className="text-sm text-gray-500">
            {formatFileSize(totalSize)} / 50 MB
          </span>
        </div>

        {files.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center">
            <File className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            <p className="font-medium text-gray-600">
              No files selected
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Your documents will appear here after extraction.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => {
              const extension = getExtension(file.name);
              const FileIcon = getFileIcon(extension);
              const extracted = documents.some(
                (entry) => entry.id === getFileId(file),
              );

              return (
                <div
                  key={getFileId(file)}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <FileIcon className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-medium text-gray-800"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {extension.slice(1).toUpperCase()} ·{" "}
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {extracted && (
                    <CheckCircle2
                      className="h-5 w-5 shrink-0 text-green-500"
                      aria-label="Text extracted successfully"
                    />
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${file.name}`}
                    title="Remove file"
                    disabled={isValidating}
                    onClick={() => removeFile(file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Extracted Text Preview
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-500">
              The extracted text will appear here after you select a
              supported document.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map(({ id, document }) => (
              <details
                key={id}
                open={documents.length === 1}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <summary className="cursor-pointer list-none p-4 hover:bg-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-gray-900">
                        {document.fileName}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {document.fileType.toUpperCase()} ·{" "}
                        {document.wordCount} words ·{" "}
                        {document.sections.length} sections
                        {document.slideCount !== undefined
                          ? ` · ${document.slideCount} slides`
                          : ""}
                      </p>
                    </div>

                    <span className="text-sm text-blue-600">
                      View preview
                    </span>
                  </div>
                </summary>

                <div className="border-t border-gray-200 p-4">
                  <div className="mb-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Extracted text
                    </p>

                    <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-gray-800">
                      {document.rawText.length > 15000
                        ? `${document.rawText.slice(0, 15000)}\n\n[Preview truncated. The complete text remains available in the extracted document data.]`
                        : document.rawText}
                    </pre>
                  </div>

                  {document.fileType === "pptx" && (
                    <div>
                      <h3 className="mb-3 font-semibold text-gray-800">
                        Text by slide
                      </h3>

                      <div className="space-y-3">
                        {document.sections.map((section) => (
                          <div
                            key={`${id}-${section.index}`}
                            className="rounded-lg border border-gray-200 p-3"
                          >
                            <h4 className="font-medium text-gray-800">
                              {section.title}
                            </h4>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                              {section.text || "(No text on this slide)"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {document.fileType !== "pptx" &&
                    document.sections.length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-medium text-blue-600">
                          View extracted sections (
                          {document.sections.length})
                        </summary>

                        <div className="mt-3 space-y-3">
                          {document.sections.map((section) => (
                            <div
                              key={`${id}-${section.index}`}
                              className="rounded-lg border border-gray-200 p-3"
                            >
                              <h4 className="font-medium text-gray-800">
                                {section.title}
                              </h4>
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                                {section.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        Documents are processed locally in your browser. Their contents are
        not sent to an AI API or uploaded to a server.
      </div>
    </div>
  );
}