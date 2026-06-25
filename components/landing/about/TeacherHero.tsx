import Image from "next/image";
import { Star, Sparkles } from "lucide-react";
import { TEACHER_INFO } from "@/constants/landing";

export function TeacherHero() {
  return (
    <div className="text-center mb-12 md:mb-16 relative flex flex-row items-center justify-center">
      <div className="flex flex-col justify-center items-center w-fit">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 animate-pulse">
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 opacity-20 blur-xl"></div>
          </div>
          <div className="absolute -inset-3 rounded-full bg-linear-to-r from-yellow-400 via-orange-500 to-red-600 opacity-30 animate-spin-slow blur-md"></div>

          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-linear-to-br from-yellow-400 via-orange-500 to-red-600 shadow-2xl">
            <Image
              src={TEACHER_INFO.avatarUrl}
              alt={TEACHER_INFO.name}
              width={160}
              height={160}
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-surface-dark"
            />
          </div>

          <div className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 bg-linear-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-surface-dark shadow-lg">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-800 mb-8">
          <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
          <span className="text-sm font-semibold text-red-800 dark:text-red-200">
            {TEACHER_INFO.roleLabel}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          {TEACHER_INFO.name}{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-500 to-red-600">
            ({TEACHER_INFO.fullName})
          </span>
        </h2>
        <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto leading-relaxed">
          {TEACHER_INFO.bio.split("hiệu quả").map((part, i) =>
            i === 0 ? (
              <span key={i}>
                {part}
                <span className="font-semibold text-gray-900 dark:text-white">hiệu quả</span>
              </span>
            ) : (
              <span key={i}>
                {part.split("tận tâm").map((seg, j) =>
                  j === 0 ? (
                    <span key={j}>{seg}</span>
                  ) : (
                    <span key={j}>
                      <span className="font-semibold text-transparent bg-clip-text bg-linear-to-r from-red-600 to-orange-600">
                        tận tâm
                      </span>
                      {seg}
                    </span>
                  )
                )}
              </span>
            )
          )}
        </p>
      </div>
    </div>
  );
}
