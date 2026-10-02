"use client";

import React from "react";
import { EntityRelationCard, EntityType } from "./EntityRelationCard";
import { GraphConnection } from "./GraphConnection";

export interface GraphNode {
  id: string;
  type: EntityType;
  name: string;
  slug: string;
  imageUrl?: string;
  subtitle?: string;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  label: string;
}

interface EntityGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  title?: string;
  layout?: "horizontal" | "grid";
}

export function EntityGraph({ nodes, edges, title = "Geopolitical Connections", layout = "horizontal" }: EntityGraphProps) {
  if (!nodes || nodes.length === 0) return null;

  // Simple sequential layout for horizontal paths (e.g. India -> Modi -> QUAD)
  if (layout === "horizontal") {
    return (
      <section className="my-8 p-6 bg-gray-950 rounded-sm border border-gray-800/50" aria-label="Entity Graph">
        <h2 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          {title}
        </h2>
        
        <div className="flex flex-col md:flex-row items-center justify-start overflow-x-auto pb-4 gap-y-4 md:gap-y-0 scrollbar-thin scrollbar-thumb-gray-800">
          {nodes.map((node, index) => {
            // Find edge connecting this node to the next one
            const nextNode = nodes[index + 1];
            const edge = nextNode ? edges.find(e => e.sourceId === node.id && e.targetId === nextNode.id) : null;

            return (
              <React.Fragment key={node.id}>
                <EntityRelationCard {...node} />
                {edge && nextNode && (
                  <GraphConnection label={edge.label} direction="horizontal" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Machine readable AI block */}
        <div className="sr-only" itemProp="hasPart" itemScope itemType="https://schema.org/ItemList">
          {edges.map((edge, i) => {
            const source = nodes.find(n => n.id === edge.sourceId);
            const target = nodes.find(n => n.id === edge.targetId);
            return source && target ? (
              <span key={i} itemProp="itemListElement">
                {source.name} is connected to {target.name} through {edge.label}.
              </span>
            ) : null;
          })}
        </div>
      </section>
    );
  }

  // Fallback for grid layout
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      {nodes.map(node => (
        <EntityRelationCard key={node.id} {...node} />
      ))}
    </div>
  );
}
