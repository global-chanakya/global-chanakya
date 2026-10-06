import React from "react";
import GenericList from "@/components/admin/form-engine/GenericList";
import { SCHEMAS } from "@/components/admin/form-engine/EntitySchemas";

export const metadata = {
  title: "Countries | Intelligence Taxonomy",
};

export default function CountriesPage() {
  const schema = SCHEMAS["countries"];
  if (!schema) return <div>Schema not found</div>;
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">Countries</h1>
        <p className="text-white/60 mt-2">Manage the country entities used by the Live Intelligence Entity Resolver.</p>
      </div>
      <GenericList schema={schema} />
    </div>
  );
}
