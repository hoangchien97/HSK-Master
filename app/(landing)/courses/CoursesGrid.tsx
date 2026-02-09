"use client";

import { motion } from "framer-motion";
import { CourseCard } from "@/components/landing/courses";

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

interface Course {
  id: string;
  [key: string]: any;
}

export function CoursesGrid({ courses }: { courses: Course[] }) {
  return (
    <motion.div
      key={courses.map(c => c.id).join(',')}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      {courses.length > 0 ? (
        courses.map((course: any) => (
          <motion.div key={course.id} variants={staggerItem}>
            <CourseCard course={course} />
          </motion.div>
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
            search_off
          </span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Không tìm thấy khóa học
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Vui lòng thử lại với bộ lọc khác
          </p>
        </div>
      )}
    </motion.div>
  );
}
