import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText } from "lucide-react";

export type EntityType = "Blog";

interface EntityRelationCardProps {
  id: string;
  type: EntityType;
  name: string;
  slug: string;
  imageUrl?: string;
  subtitle?: string;
  isActive?: boolean;
}

const getEntityUrl = (type: EntityType, slug: string) => {
  return `/blogs/${slug}`;
};

export function EntityRelationCard({ type, name, slug, imageUrl, subtitle, isActive }: EntityRelationCardProps) {
  const url = getEntityUrl(type, slug);

  return (
    <Link href={url} className={`group flex flex-col items-center p-4 rounded-sm border border-gray-800 bg-gray-900/50  transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/80 ${isActive ? 'ring-2 ring-blue-500/50 border-blue-500/30' : ''}`} aria-label={`${type}: ${name}`}>
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name} 
            fill
            sizes="64px"
            className="object-cover" 
            loading="lazy" 
          />
        ) : (
          <FileText className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-100 text-center line-clamp-1">{name}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1 text-center line-clamp-1">{subtitle}</p>}
    </Link>
  );
}
