"use client";
import React from "react";
import { Eye, Calendar, User, Tag, Info } from "lucide-react";

export default function BlogPreview() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 p-6 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <Eye className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Live Preview</h2>
            <p className="text-sm text-slate-600">
              See how your blog will appear
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Preview Article */}
        <article className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                Technology
              </span>
              <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-semibold">
                Tutorial
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
              Your Blog Title Will Appear Here
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Author Name</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="aspect-video bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">Cover Image Preview</p>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl">
            <p className="text-slate-700 italic">
              Your excerpt or summary will appear here. This is what readers see before clicking to read more.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed">
              Your main content will be displayed here. This is where you'll write your blog post, share your thoughts, and engage with your readers.
            </p>
            <p className="text-slate-700 leading-relaxed">
              The content area supports rich text formatting and will preserve your paragraph breaks and formatting.
            </p>
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                #react
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                #javascript
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                #webdev
              </span>
            </div>
          </div>

          {/* Author Bio */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                A
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">About the Author</h4>
                <p className="text-sm text-slate-600">
                  Author information and bio will appear here.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Preview Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Preview Mode
            </p>
            <p className="text-xs text-blue-700">
              This is a static preview. Your actual content will replace the placeholder text as you fill in the form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}