import { TeacherHero } from "./TeacherHero";
import { TeacherAchievements } from "./TeacherAchievements";
import { TeacherStats } from "./TeacherStats";

export default function TeacherProfile() {
  return (
    <div className="relative mb-16 md:mb-24">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-r from-yellow-200/20 via-orange-200/20 to-red-200/20 rounded-full blur-3xl -z-10" />
      <TeacherHero />
      <TeacherAchievements />
      <TeacherStats />
    </div>
  );
}
