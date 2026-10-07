import Link from "next/link";
import { Search, AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 pt-20 pb-20">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-neutral-900 rounded-sm flex items-center justify-center mx-auto mb-8 border border-neutral-800">
          <AlertTriangle className="w-10 h-10 text-neutral-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-neutral-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/blogs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Reports
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-neutral-900 text-neutral-300 font-medium hover:bg-neutral-800 hover:text-white transition-colors border border-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
