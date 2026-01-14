import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const redirectUrl = process.env.REDIRECT_URL || "#";
  
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
      <main className="flex flex-col items-center gap-8 max-w-2xl text-center">
        {/* Logo/Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight">
          Roadmap API Server
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-300 leading-relaxed">
          A feature voting system API for product roadmaps. 
          Use the API endpoints to vote for features and track what users want built next.
        </p>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-emerald-400 font-medium">API Server Running</span>
        </div>

        {/* API Endpoints Info */}
        <div className="w-full mt-4 p-6 bg-slate-800/50 border border-slate-700 rounded-xl text-left">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            API Endpoints
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">GET</span>
              <span className="text-slate-300">/api/features</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">GET</span>
              <span className="text-slate-300">/api/features/:id</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">POST</span>
              <span className="text-slate-300">/api/vote</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">DELETE</span>
              <span className="text-slate-300">/api/vote</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">GET</span>
              <span className="text-slate-300">/api/vote/:featureId/:uuid</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-4">
          {session ? (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                Sign In →
              </Link>
              {redirectUrl !== "#" && (
                <Link
                  href={redirectUrl}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all border border-slate-600"
                >
                  Go to Main App →
                </Link>
              )}
            </>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-sm text-slate-500 mt-8">
          All API endpoints require authentication via <code className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">x-api-key</code> header
        </p>
      </main>
    </div>
  );
}
