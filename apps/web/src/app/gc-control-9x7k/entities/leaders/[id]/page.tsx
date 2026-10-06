import React from "react";
import GenericEditor from "@/components/admin/form-engine/GenericEditor";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Edit Leader | Intelligence Taxonomy",
};

export default async function EditLeaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const schema = SCHEMAS["leaders"];

  if (!schema) return <div>Schema not found</div>;

  return <GenericEditor schema={schema} entityId={id} initialData={{}} />;
}
