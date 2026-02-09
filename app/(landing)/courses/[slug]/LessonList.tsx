"use client";

import { useState } from "react";
import Button from "@/components/landing/common/Button";

type Lesson = {
  id: string;
  title: string;
  titleChinese: string | null;
  description: string | null;
  order: number;
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
        <h2 className="text-sm text-transparent bg-clip-text bg-gradient-to-r text-[24px] font-bold from-yellow-500 to-red-600 font-bold cursor-pointer hover:from-yellow-600 hover:to-red-700 transition-all">
          Chương trình học
        </h2>
      </div>
      <div className="space-y-4">
        {displayedLessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-primary/40 relative overflow-hidden shadow-sm hover:shadow-lg hover:shadow-red-500/10 hover:border-primary/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-red-500 to-red-700 group-hover:w-1.5 transition-all"></div>

            <div className="flex-shrink-0 size-12 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-br from-yellow-400 to-red-600 text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all">
              {lesson.order}
            </div>

            <div className="flex-grow">
              <h3 className="text-lg font-bold text-[#181111] dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-600 group-hover:to-red-600 transition-all">
                {lesson.title}
                {lesson.titleChinese && (
                  <span className="ml-2">({lesson.titleChinese})</span>
                )}
              </h3>
              <p className="text-sm text-[#896161] dark:text-gray-400 mt-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                {lesson.description}
              </p>
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
            className="border-2 border-primary/20 text-primary cursor-pointer hover:bg-primary/5 hover:border-primary/40 min-w-[200px]"
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
            className="border-2 border-primary/20 text-primary cursor-pointer hover:bg-primary/5 hover:border-primary/40 min-w-[200px]"
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
