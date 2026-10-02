import React from "react";

export const metadata = {
  title: "Entity Resolution | Intelligence Taxonomy",
};

export default function EntityResolutionPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">Entity Resolution Engine</h1>
        <p className="text-white/60 mt-2">Manage the entity resolution pipeline rules and view backfill status.</p>
      </div>
      <div className="bg-gc-dark/50 border border-white/10 rounded-sm p-8">
        <h2 className="text-xl font-bold text-white mb-4">Pipeline Status</h2>
        <p className="text-white/70 mb-4">
          The Entity Resolution Engine is active and running inline during the Live Ingestion Pipeline.
          All incoming RSS events are automatically scanned and cross-referenced with your active taxonomy
          (Countries, Leaders, Conflicts) using exact matches, aliases, and bounded token matching.
        </p>
        
        <h2 className="text-xl font-bold text-white mb-4 mt-8">Historical Backfill</h2>
        <p className="text-white/70 mb-4">
          The Phase 6.2 backfill has been successfully completed. 
          To re-run the backfill manually in dry-run mode, execute the following command in the server environment:
        </p>
        <code className="bg-black/50 p-3 rounded block text-gc-primary font-mono text-sm border border-white/5">
          npx tsx scripts/backfill-intelligence-taxonomy-dry.ts
        </code>
      </div>
    </div>
  );
}
