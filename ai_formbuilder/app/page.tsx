import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
        <p className="mt-2 text-gray-500">
          Upload your files to generate an AI-powered report.
        </p>
      </div>

      {/* Upload area — placeholder, feature comes Day 2 */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center transition-colors hover:border-blue-400">
        <Upload className="mx-auto mb-4 h-10 w-10 text-gray-400" />
        <p className="font-medium text-gray-600">
          Drag and drop files here, or click to select
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Supports .txt, .md, .docx, .pptx · Max 10 MB total
        </p>
        <Button className="mt-6" disabled>
          Select Files
        </Button>
      </div>

      <p className="mt-4 text-center text-sm text-gray-400">
        File upload will be implemented in the next step.
      </p>
    </div>
  );
}