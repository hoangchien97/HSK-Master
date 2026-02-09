"use client";

import { motion } from "framer-motion";

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
