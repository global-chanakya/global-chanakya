"use client";

import React, { useState } from "react";
import { MessageSquare, ShieldCheck } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  isVerifiedAnalyst: boolean;
  content: string;
  likes: number;
  timeAgo: string;
}

export function AnalystComments({ articleId }: { articleId: string }) {
  const [comments] = useState<Comment[]>([
    {
      id: "c1",
      author: "Dr. S. Jaishankar (Mock)",
      isVerifiedAnalyst: true,
      content: "This breakdown accurately reflects the multi-aligned posture India is taking in the Indo-Pacific region.",
      likes: 124,
      timeAgo: "2h ago"
    },
    {
      id: "c2",
      author: "Strategic Watcher",
      isVerifiedAnalyst: false,
      content: "What about the economic implications on the semiconductor supply chain?",
      likes: 15,
      timeAgo: "5h ago"
    }
  ]);

  return (
    <section className="my-16 border-t border-gray-800 pt-12" id="analyst-insights">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-gray-400" />
        <h3 className="text-2xl font-bold text-gray-100">Analyst Insights & Discussion</h3>
        <span className="bg-gray-800 text-gray-300 text-xs font-bold px-2 py-1 rounded-full">{comments.length}</span>
      </div>

      {/* Auth Gate for Commenting */}
      <div className="p-4 rounded-sm border border-gray-800 bg-gray-900/50 mb-8 flex items-center justify-between">
        <p className="text-sm text-gray-400">Join the discussion with global strategists.</p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
          Sign In to Contribute
        </button>
      </div>

      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className={`p-5 rounded-sm border ${comment.isVerifiedAnalyst ? 'bg-blue-500/5 border-blue-500/20' : 'bg-transparent border-gray-800'}`}>
            <header className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-200">{comment.author}</span>
                {comment.isVerifiedAnalyst && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    <ShieldCheck className="w-3 h-3" /> Verified Analyst
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{comment.timeAgo}</span>
            </header>
            <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
            <footer className="mt-4 flex items-center gap-4">
              <button className="text-xs text-gray-500 hover:text-gray-300 font-bold">Reply</button>
              <button className="text-xs text-gray-500 hover:text-blue-400 font-bold flex items-center gap-1">
                ▲ {comment.likes}
              </button>
            </footer>
          </div>
        ))}
      </div>
    </section>
  );
}
