"use client"

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600 mb-4 animate-bounce">
            404
          </h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. The content may
            have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 w-full justify-center"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200 w-full justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            You might be looking for:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/blog"
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Blog
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/products"
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Courses
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/dashboard"
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
