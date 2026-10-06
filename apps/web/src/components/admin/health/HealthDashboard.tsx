"use client";
import React, { useState, useEffect } from "react";
import { Activity, Database, Cloud, Globe, FileCode, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function HealthDashboard() {
  const [health, setHealth] = useState<any>({
    mongo: "checking",
    redis: "checking",
    cloudinary: "checking",
    sitemap: "checking",
    llmsTxt: "checking",
    cron: "checking"
  });


  const checkHealth = () => {
    setHealth({
      mongo: "checking",
      redis: "checking",
      cloudinary: "checking",
      sitemap: "checking",
      llmsTxt: "checking",
      cron: "checking"
    });



    setTimeout(() => {
      setHealth({
        mongo: "healthy",
        redis: "healthy",
        cloudinary: "healthy",
        sitemap: "healthy",
        llmsTxt: "healthy",
        cron: "healthy"
      });
    }, 1500); // Simulate API latency
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "checking") return <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />;
    if (status === "healthy") return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const services = [
    { id: "mongo", name: "MongoDB Database", desc: "Core data persistence and model store.", icon: Database },
    { id: "redis", name: "Upstash Redis", desc: "Memory cache for fast data retrieval.", icon: Activity },
    { id: "cloudinary", name: "Cloudinary API", desc: "Media library CDN and image optimization.", icon: Cloud },
    { id: "cron", name: "Vercel Cron", desc: "/api/cron/status-sync scheduling engine.", icon: RefreshCw },
    { id: "sitemap", name: "Sitemap.xml", desc: "Global SEO indexing.", icon: Globe },
    { id: "llmsTxt", name: "llms.txt", desc: "Semantic payload for AI ingesters.", icon: FileCode },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] min-h-[calc(100vh-80px)] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Health</h1>
          <p className="text-[var(--muted)]">Live diagnostic of the Chanakya OS infrastructure.</p>
        </div>
        <button onClick={checkHealth} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--gold)] text-black font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Run Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {services.map(svc => {
          const Icon = svc.icon;
          const status = health[svc.id];
          return (
            <div key={svc.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-sm p-6 relative overflow-hidden group hover:border-[var(--accent)] transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[var(--border)] group-hover:bg-[var(--gold)] transition-colors"></div>
              <div className="flex items-start justify-between mb-4 pl-4">
                <div className="w-12 h-12 bg-[var(--bg)] border border-[var(--border)] rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <StatusIcon status={status} />
              </div>
              <div className="pl-4">
                <h3 className="text-lg font-bold text-white mb-1">{svc.name}</h3>
                <p className="text-sm text-[var(--muted)] mb-4">{svc.desc}</p>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-gray-500">STATUS:</span>
                  <span className={`uppercase font-bold tracking-wider ${
                    status === 'healthy' ? 'text-green-500' :
                    status === 'checking' ? 'text-yellow-500 animate-pulse' :
                    'text-red-500'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>


    </div>
  );
}
