import React from "react";

export const metadata = {
  title: "Navigation Manager | Admin",
};

export default function NavigationManagerPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Navigation Manager</h1>
          <p className="text-gray-400">Manage navbar and footer links.</p>
        </div>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm p-8 flex flex-col items-center justify-center text-center h-64">
        <p className="text-gray-500 italic">Module scaffolded and ready for implementation.</p>
      </div>
    </div>
  );
}
