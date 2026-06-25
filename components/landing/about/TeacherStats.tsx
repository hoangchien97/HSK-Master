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
import { TEACHER_STATS } from "@/constants/landing";

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap, Award, Star, Users, Trophy, Target, Heart,
};

export function TeacherStats() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {TEACHER_STATS.map((stat, index) => {
        const IconComponent = ICON_MAP[stat.iconName];
        return (
          <div
            key={index}
            className="group relative bg-linear-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
              {IconComponent && <IconComponent className="w-20 h-20" />}
            </div>
            <div className="relative">
              <div className={`inline-flex h-12 w-12 mb-3 items-center justify-center rounded-xl bg-linear-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
              </div>
              <div className="mb-2">
                <span className={`text-3xl md:text-4xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.number}
                </span>
                <span className={`text-xl md:text-2xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.suffix}
                </span>
                {stat.unit && (
                  <span className="block text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {stat.unit}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
