import {
  GraduationCap,
  Award,
  Star,
  Users,
  Trophy,
  Target,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { TEACHER_ACHIEVEMENTS } from "@/constants/landing";

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap, Award, Star, Users, Trophy, Target, Heart,
};

export function TeacherAchievements() {
  return (
    <div className="mb-12 md:mb-16">
      <div className="text-center mb-8">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Học vấn & Thành tích
        </h3>
        <div className="w-24 h-1 bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 mx-auto rounded-full"></div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {TEACHER_ACHIEVEMENTS.map((item, index) => {
          const IconComponent = ICON_MAP[item.iconName];
          return (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-linear-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              <div className={`relative inline-flex h-14 w-14 mx-auto mb-4 items-center justify-center rounded-xl bg-linear-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform`}>
                {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
              </div>
              <h4 className="relative font-bold text-sm md:text-base text-gray-900 dark:text-white mb-2">
                {item.title}
              </h4>
              <p className="relative text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
