import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Edit Topic | Intelligence Taxonomy",
};

export default function EditTopicPage({ params }: { params: { id: string } }) {
  const schema = SCHEMAS["topics"];
  if (!schema) return <div>Schema not found</div>;
  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">
          {params.id === "new" ? "New Topic" : "Edit Topic"}
        </h1>
        <p className="text-white/60 mt-2">Manage the properties of this topic.</p>
      </div>
      <GenericEditor schema={schema} entityId={params.id} />
    </div>
  );
}
