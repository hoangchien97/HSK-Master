"use client";

import { Star, Quote, GraduationCap } from "lucide-react";

interface ReviewItemProps {
  id: string;
  studentName: string;
  className: string;
  content: string;
  rating: number;
  createdAt: Date | string;
}

export default function ReviewItem({
  studentName,
  className,
  content,
  rating,
}: ReviewItemProps) {
  return (
    <div className="group relative bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 md:p-6 lg:p-7 h-full border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-red-400/40 dark:hover:border-red-500/40 cursor-pointer overflow-hidden">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/5 to-red-500/5 rounded-bl-[100px] transition-all duration-300 group-hover:w-24 group-hover:h-24 group-hover:from-yellow-400/10 group-hover:to-red-500/10" />

      {/* Rating Stars */}
      <div className="flex items-center gap-1 mb-3 md:mb-4 relative z-10">
        <div className="flex gap-0.5 md:gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110 ${
                i < rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600'
              }`}
            />
          ))}
        </div>
        <span className="ml-1 text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400">
          {rating}/5
        </span>
      </div>

      {/* Review Content */}
      <div className="mb-4 md:mb-5 relative z-10">
        <div className="flex items-start gap-2 mb-2">
          <Quote className="text-red-500 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
          <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-5 flex-1">
            {content}
          </p>
        </div>
      </div>

      {/* Student Info */}
      <div className="flex items-center gap-3 md:gap-4 pt-4 border-t-2 border-gray-200/50 dark:border-gray-700/50 group-hover:border-red-500/30 transition-colors duration-300 relative z-10">
        <div className="relative">
          {/* Avatar with gradient border */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-orange-500 animate-pulse group-hover:animate-none" />
          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-white font-bold shadow-lg m-0.5">
            <span className="text-base md:text-lg">
              {studentName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base mb-0.5 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {studentName}
          </p>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
            <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              {className}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
