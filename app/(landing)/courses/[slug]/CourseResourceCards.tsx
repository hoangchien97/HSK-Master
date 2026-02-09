"use client";

import { motion } from "framer-motion";
import Button from "@/components/landing/common/Button";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

interface ResourceCard {
  vocabularyCount: number;
  grammarCount: number;
  level: string;
  grammarPoints: Array<{ id: string; title: string }>;
}

export function CourseResourceCards({ course }: { course: ResourceCard }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 px-0 md:px-4 mt-4"
    >
      {/* Vocabulary Card */}
      <motion.div variants={staggerItem} className="relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark border border-[#e6dbdb] dark:border-white/10 p-6 flex flex-col justify-between h-full min-h-[240px] group hover:border-yellow-500/30 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/20 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
              translate
            </span>
            <h3 className="text-xl font-bold text-[#181111] dark:text-white">
              Danh sách từ vựng
            </h3>
          </div>
          <p className="text-[#896161] dark:text-gray-300 mb-6">
            Xem lại tất cả {course.vocabularyCount} từ vựng cần thiết cho{" "}
            {course.level}. Bao gồm phát âm, pinyin và câu ví dụ.
          </p>
          {/* Mini Preview List */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
              我 (wǒ)
            </span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
              你 (nǐ)
            </span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-700 transition-colors">
              好 (hǎo)
            </span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 text-xs">
              +{course.vocabularyCount - 3} từ khác
            </span>
          </div>
        </div>
        <Button
          variant="secondary"
          className="relative z-10 w-full border-2 border-yellow-500/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
          icon={<span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          iconPosition="right"
        >
          Xem danh sách đầy đủ
        </Button>
      </motion.div>

      {/* Grammar Card */}
      <motion.div variants={staggerItem} className="relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark border border-[#e6dbdb] dark:border-white/10 p-6 flex flex-col justify-between h-full min-h-[240px] group hover:border-primary/30 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 dark:bg-red-900/20 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">
              history_edu
            </span>
            <h3 className="text-xl font-bold text-[#181111] dark:text-white">
              Điểm ngữ pháp
            </h3>
          </div>
          <p className="text-[#896161] dark:text-gray-300 mb-6">
            Nắm vững cấu trúc câu. Giải thích ngắn gọn cho tất cả{" "}
            {course.grammarCount} điểm ngữ pháp với ngữ cảnh thực tế.
          </p>
          <ul className="space-y-2 mb-6">
            {course.grammarPoints.slice(0, 3).map((gp: { id: string; title: string }) => (
              <li
                key={gp.id}
                className="flex items-center gap-2 text-sm text-[#555] dark:text-gray-400 hover:text-primary transition-colors"
              >
                <span className="size-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-red-600"></span>
                {gp.title}
              </li>
            ))}
          </ul>
        </div>
        <Button
          variant="secondary"
          className="relative z-10 w-full border-2 border-primary/20 text-primary hover:bg-primary/5"
          icon={<span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          iconPosition="right"
        >
          Xem hướng dẫn ngữ pháp
        </Button>
      </motion.div>
    </motion.div>
  );
}
