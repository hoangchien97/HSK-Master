import { ReactNode } from "react";

interface SectionHeaderProps {
  icon?: ReactNode;
  tag: string;
  title: string;
  description?: string;
  tagColor?: string;
}

export default function SectionHeader({
  icon,
  tag,
  title,
  description,
  tagColor = "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-600 dark:text-orange-400",
}: SectionHeaderProps) {
  return (
    <div className="text-center mb-16 animate-fade-in-up">
      {/* Animated Tag with Pulse Effect */}
      <div
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${tagColor} font-semibold text-sm uppercase tracking-wider mb-6 animate-pulse-soft shadow-sm`}
      >
        {icon && <span className="text-xl animate-float">{icon}</span>}
        <span>{tag}</span>
      </div>

      {/* Title with Gradient Animation */}
      <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text animate-gradient">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
          {description}
        </p>
      )}

      {/* Decorative Line with Shimmer */}
      <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto rounded-full animate-shimmer" />
    </div>
  );
}
