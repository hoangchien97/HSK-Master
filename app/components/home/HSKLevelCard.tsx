"use client";

import Link from "next/link";
import { Tooltip } from "@/app/components/shared";
import {
  Sparkles,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Star,
  Brain,
  BookOpen,
  Users,
} from "lucide-react";

export interface HSKLevel {
  level: number;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  vocabularyCount: string;
  targetAudience: string;
  targetIcon: string;
  accentColor: string;
  bgGradient: string;
  href: string;
}

interface HSKLevelCardProps {
  level: HSKLevel;
  isLeft: boolean;
}

// Icon mapping for each HSK level
const levelIcons = {
  1: Sparkles,
  2: TrendingUp,
  3: GraduationCap,
  4: Briefcase,
  5: Star,
  6: Brain,
};

// Color mapping for timeline dots
const levelColors = {
  1: "bg-gradient-to-br from-orange-400 to-yellow-300 shadow-orange-400/50",
  2: "bg-gradient-to-br from-orange-500 to-yellow-400 shadow-orange-500/50",
  3: "bg-gradient-to-br from-red-400 to-orange-400 shadow-red-400/50",
  4: "bg-gradient-to-br from-red-500 to-red-400 shadow-red-500/50",
  5: "bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-500/50",
  6: "bg-gradient-to-br from-indigo-600 to-blue-600 shadow-indigo-600/50",
};

export default function HSKLevelCard({ level, isLeft }: HSKLevelCardProps) {
  const Icon = levelIcons[level.level as keyof typeof levelIcons] || BookOpen;
  const dotColor = levelColors[level.level as keyof typeof levelColors];

  return (
    <div className={`relative flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      {/* Card Content */}
      <div className={`w-[45%] ${isLeft ? "text-right" : "text-left"}`}>
        <Link
          href={level.href}
          className="group block relative overflow-hidden rounded-lg md:rounded-xl lg:rounded-2xl bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-5 lg:p-6 shadow-md md:shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl md:hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          {/* Title & Badge */}
          <div className={`flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4 ${isLeft ? "justify-end" : "justify-start"}`}>
            <h3 className="text-[14px] sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {level.title}
            </h3>
            <span className={`inline-flex items-center rounded-full ${level.badgeColor} px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-medium whitespace-nowrap`}>
              {level.badge}
            </span>
          </div>

          {/* Stats */}
          <div className={`flex flex-col sm:flex-row gap-1.5 sm:gap-2 md:gap-3 text-[10px] sm:text-xs ${isLeft ? "items-end sm:justify-end" : "items-start sm:justify-start"}`}>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 sm:px-3 sm:py-1.5">
              <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-red-600 dark:text-red-400" />
              <span className="font-medium text-gray-700 dark:text-gray-200">{level.vocabularyCount}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 sm:px-3 sm:py-1.5">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-red-600 dark:text-red-400" />
              <span className="font-medium text-gray-700 dark:text-gray-200">{level.targetAudience}</span>
            </div>
          </div>

          {/* Hover Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </Link>
      </div>

      {/* Timeline Dot with Icon & Tooltip */}
      <div className="relative flex items-center justify-center z-10">
        <Tooltip
          content={level.description}
          placement={!isLeft ? 'left' : 'right'}
          arrow={true}
          animation="scale"
          duration={200}
        >
          <Link
            href={level.href}
            className={`w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full ${dotColor} shadow-lg md:shadow-xl lg:shadow-2xl flex items-center justify-center border-2 md:border-3 lg:border-4 border-white dark:border-gray-900 transition-all hover:scale-110 md:hover:scale-125 duration-300 cursor-pointer relative`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.5} />
          </Link>
        </Tooltip>
      </div>

      {/* Empty Space (opposite side) */}
      <div className="w-[45%]" />
    </div>
  );
}
