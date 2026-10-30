import Link from "next/link";
import { FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReportPage() {
    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Report Editor</h1>
                <p className="mt-2 text-gray-500">
                    Review and edit your AI-generated report.
                </p>
            </div>

            <div className="rounded-xl border bg-white p-12 text-center">
                <FileText className="mx-auto mb-4 h-10 w-10 text-gray-300" />
                <p className="font-medium text-gray-500">No report generated yet.</p>
                <p className="mt-1 text-sm text-gray-400">
                    Upload a document first to generate a report.
                </p>
                <Link
                    href="/"
                    className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
                >
                    Go to Upload
                </Link>
            </div>
        </div>
    );
}