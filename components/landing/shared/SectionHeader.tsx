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
    <div className="text-center mb-8 md:mb-12 lg:mb-16 animate-fade-in-up">
      {/* Animated Tag with Pulse Effect */}
      <div
        className={`inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 lg:px-6 lg:py-3 rounded-full ${tagColor} font-semibold text-[10px] md:text-xs lg:text-sm uppercase tracking-wider mb-3 md:mb-4 lg:mb-6 animate-pulse-soft shadow-sm`}
      >
        {icon && <span className="text-base md:text-lg lg:text-xl animate-float">{icon}</span>}
        <span>{tag}</span>
      </div>

      {/* Title with Gradient Animation */}
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 lg:mb-4 gradient-text animate-gradient px-2">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-3 md:mb-4 lg:mb-6 px-4">
          {description}
        </p>
      )}

      {/* Decorative Line with Shimmer */}
      <div className="w-16 md:w-20 lg:w-24 h-0.5 md:h-1 bg-gradient-to-r from-orange-500 to-yellow-500 mx-auto rounded-full" />
    </div>
  );
}
