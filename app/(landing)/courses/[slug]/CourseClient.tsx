"use client";

import { motion } from "framer-motion";
import Button from "@/app/components/landing/common/Button";

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

interface CourseStats {
  vocabularyCount: number;
  grammarCount: number;
  lessonCount: number;
  durationHours: number;
}

export function CourseStatsGrid({ stats }: { stats: CourseStats }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 px-0 md:px-4 mb-12"
    >
      <motion.div variants={staggerItem} className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform-gpu hover:-translate-y-1 cursor-pointer">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 inline-flex items-center justify-center size-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110">
            <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
        </div>
        <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
          Từ vựng
        </p>
        <p className="text-center text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {stats.vocabularyCount} từ
        </p>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-bl-[60px] -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>

      <motion.div variants={staggerItem} className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform-gpu hover:-translate-y-1 cursor-pointer">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 inline-flex items-center justify-center size-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110">
            <span className="material-symbols-outlined text-3xl">psychology</span>
          </div>
        </div>
        <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
          Ngữ pháp
        </p>
        <p className="text-center text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
          {stats.grammarCount} điểm
        </p>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/20 dark:to-pink-900/20 rounded-bl-[60px] -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>

      <motion.div variants={staggerItem} className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform-gpu hover:-translate-y-1 cursor-pointer">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 inline-flex items-center justify-center size-14 bg-green-50 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400 transition-all duration-300 group-hover:scale-110">
            <span className="material-symbols-outlined text-3xl">play_lesson</span>
          </div>
        </div>
        <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
          Bài học
        </p>
        <p className="text-center text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-green-600 dark:group-hover:text-green-400">
          {stats.lessonCount} bài
        </p>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-900/20 dark:to-emerald-900/20 rounded-bl-[60px] -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>

      <motion.div variants={staggerItem} className="group relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform-gpu hover:-translate-y-1 cursor-pointer">
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 inline-flex items-center justify-center size-14 bg-orange-50 dark:bg-orange-900/30 rounded-2xl text-orange-600 dark:text-orange-400 transition-all duration-300 group-hover:scale-110">
            <span className="material-symbols-outlined text-3xl">schedule</span>
          </div>
        </div>
        <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-200">
          Thời lượng
        </p>
        <p className="text-center text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
          {stats.durationHours} giờ
        </p>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-900/20 dark:to-red-900/20 rounded-bl-[60px] -mr-6 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </motion.div>
  );
}

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
