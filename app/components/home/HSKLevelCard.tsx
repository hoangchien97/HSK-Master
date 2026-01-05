"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = levelIcons[level.level as keyof typeof levelIcons] || BookOpen;
  const dotColor = levelColors[level.level as keyof typeof levelColors];

  return (
    <div className={`relative flex items-center gap-8 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      {/* Card Content */}
      <div className={`w-[45%] ${isLeft ? "text-right" : "text-left"}`}>
        <Link
          href={level.href}
          className="group block relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          {/* Title & Badge */}
          <div className={`flex items-center gap-3 mb-4 ${isLeft ? "justify-end" : "justify-start"}`}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {level.title}
            </h3>
            <span className={`inline-flex items-center rounded-full ${level.badgeColor} px-3 py-1 text-xs font-medium whitespace-nowrap`}>
              {level.badge}
            </span>
          </div>

          {/* Stats */}
          <div className={`flex gap-3 text-xs ${isLeft ? "justify-end" : "justify-start"}`}>
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5">
              <BookOpen className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="font-medium text-gray-700 dark:text-gray-200">{level.vocabularyCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5">
              <Users className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="font-medium text-gray-700 dark:text-gray-200">{level.targetAudience}</span>
            </div>
          </div>

          {/* Hover Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </Link>
      </div>

      {/* Timeline Dot with Icon & Tooltip */}
      <div className="relative flex items-center justify-center z-10">
        <Link
          href={level.href}
          className={`w-16 h-16 rounded-full ${dotColor} shadow-2xl flex items-center justify-center border-4 border-white dark:border-gray-900 transition-all hover:scale-125 duration-300 cursor-pointer relative`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
          
          {/* Tooltip */}
          {showTooltip && (
            <div className={`absolute ${isLeft ? 'right-20' : 'left-20'} top-1/2 -translate-y-1/2 w-72 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-${isLeft ? 'right' : 'left'}-2 duration-200`}>
              {/* Arrow */}
              <div className={`absolute ${isLeft ? 'right-[-8px]' : 'left-[-8px]'} top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent ${isLeft ? 'border-r-8 border-r-gray-900 dark:border-r-gray-800' : 'border-l-8 border-l-gray-900 dark:border-l-gray-800'}`} />
              
              <p className="leading-relaxed">{level.description}</p>
            </div>
          )}
        </Link>
      </div>

      {/* Empty Space (opposite side) */}
      <div className="w-[45%]" />
    </div>
  );
}
