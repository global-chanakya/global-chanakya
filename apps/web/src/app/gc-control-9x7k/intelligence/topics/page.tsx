import React from "react";
import GenericList from "@/components/admin/form-engine/GenericList";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Topics | Intelligence Taxonomy",
};

export default function TopicsPage() {
  const schema = SCHEMAS["topics"];
  if (!schema) return <div>Schema not found</div>;
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">Topics</h1>
        <p className="text-white/60 mt-2">Manage the topic entities used by Blogs and Reports.</p>
      </div>
      <GenericList schema={schema} />
    </div>
  );
}
