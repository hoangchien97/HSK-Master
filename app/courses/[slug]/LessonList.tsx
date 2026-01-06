"use client";

import { useState } from "react";
import Button from "@/app/components/shared/Button";

type Lesson = {
  id: string;
  title: string;
  titleChinese: string | null;
  description: string | null;
  order: number;
  isLocked: boolean;
  progress: number;
};

type LessonListProps = {
  lessons: Lesson[];
  initialDisplayCount?: number;
};

export default function LessonList({
  lessons,
  initialDisplayCount = 3,
}: LessonListProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedLessons = showAll
    ? lessons
    : lessons.slice(0, initialDisplayCount);
  const hasMore = lessons.length > initialDisplayCount;

  return (
    <div className="px-0 md:px-4 mt-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#181111] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
          Chương trình học
        </h2>
        <span className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-600 font-bold cursor-pointer hover:from-yellow-600 hover:to-red-700 transition-all">
          Xem giáo trình
        </span>
      </div>
      <div className="space-y-4">
        {displayedLessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className={`group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl bg-surface-light dark:bg-surface-dark border ${
              !lesson.isLocked
                ? "border-primary/40 relative overflow-hidden"
                : "border-[#e6dbdb] dark:border-white/10 hover:border-primary/40"
            } shadow-sm hover:shadow-md transition-all cursor-pointer`}
          >
            {!lesson.isLocked && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-red-500 to-red-700"></div>
            )}
            <div
              className={`flex-shrink-0 size-12 rounded-full flex items-center justify-center font-bold text-lg ${
                !lesson.isLocked
                  ? "bg-gradient-to-br from-yellow-400 to-red-600 text-white"
                  : "bg-gray-100 dark:bg-white/5 text-gray-500 group-hover:bg-gradient-to-br group-hover:from-yellow-400 group-hover:to-red-600 group-hover:text-white"
              } transition-all`}
            >
              {lesson.order}
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-[#181111] dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-600 group-hover:to-red-600 transition-all">
                {lesson.title}
                {lesson.titleChinese && (
                  <span className="ml-2">({lesson.titleChinese})</span>
                )}
              </h3>
              <p className="text-sm text-[#896161] dark:text-gray-400 mt-1">
                {lesson.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {!lesson.isLocked && lesson.progress > 0 ? (
                <>
                  <div className="hidden md:flex flex-col items-end gap-1 min-w-[100px]">
                    <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-red-600">
                      Đang học
                    </span>
                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-red-600 rounded-full"
                        style={{ width: `${lesson.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="size-10 rounded-full bg-gradient-to-r from-yellow-400 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">
                      play_arrow
                    </span>
                  </button>
                </>
              ) : (
                <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">
                  {lesson.isLocked ? "lock" : "lock_open"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="flex justify-center mt-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowAll(true)}
            className="border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 min-w-[200px]"
            icon={
              <span className="material-symbols-outlined text-[20px]">
                expand_more
              </span>
            }
            iconPosition="right"
          >
            Hiển thị tất cả {lessons.length -3} bài học
          </Button>
        </div>
      )}

      {showAll && hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setShowAll(false);
              // Scroll to the lessons section
              const element = document.querySelector('h2:has-text("Chương trình học")');
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 min-w-[200px]"
            icon={
              <span className="material-symbols-outlined text-[20px]">
                expand_less
              </span>
            }
            iconPosition="right"
          >
            Thu gọn
          </Button>
        </div>
      )}
    </div>
  );
}
