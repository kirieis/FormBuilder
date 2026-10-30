import Link from "next/link";
import { Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Report History</h1>
                <p className="mt-2 text-gray-500">
                    Access and manage your previously generated reports.
                </p>
            </div>

            {/* Empty state */}
            <div className="rounded-xl border bg-white p-12 text-center">
                <Clock className="mx-auto mb-4 h-10 w-10 text-gray-300" />
                <p className="font-medium text-gray-500">No reports saved yet.</p>
                <p className="mt-1 text-sm text-gray-400">
                    Generated reports will appear here after you save them.
                </p>
                <Link
                    href="/"
                    className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
                >
                    Create your first report
                </Link>
            </div>
        </div>
    );
}