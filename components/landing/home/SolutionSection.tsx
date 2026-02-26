import SectionHeader from '@/components/landing/shared/SectionHeader';
import Link from 'next/link';
import { Route, BookOpenCheck, Headphones, PenLine } from 'lucide-react';

const SOLUTIONS = [
  {
    icon: Route,
    title: 'Lộ trình chuẩn từ cơ bản đến nâng cao',
    description: 'Từ HSK1 đến HSK6, mỗi cấp độ đều có bài học, từ vựng và mục tiêu đầu ra rõ ràng.',
  },
  {
    icon: BookOpenCheck,
    title: 'Ôn luyện theo cấu trúc đề thi thật',
    description: 'Phân tích dạng đề, luyện tập có hệ thống giúp bạn tự tin bước vào phòng thi.',
  },
  {
    icon: Headphones,
    title: 'Thực hành nghe – đọc – viết – nói đầy đủ',
    description: 'Không bỏ sót kỹ năng nào, đảm bảo nền tảng vững chắc cho mỗi cấp độ.',
  },
  {
    icon: PenLine,
    title: 'Sửa bài chi tiết, hướng dẫn đạt điểm cao',
    description: 'Mỗi bài tập đều được chấm và phản hồi cá nhân, giúp bạn tiến bộ nhanh nhất.',
  },
];

export default function SolutionSection() {
  return (
    <section className="py-8 md:py-12 lg:py-16 bg-linear-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 md:px-6 lg:px-8">
        <SectionHeader
          icon="🚀"
          tag="Giải pháp từ Ruby HSK"
          title="Phương pháp đã giúp 500+ học viên đậu HSK"
          description="Chúng tôi không chỉ dạy để bạn &quot;biết&quot; — chúng tôi dạy để bạn &quot;đạt điểm&quot;"
          tagColor="bg-linear-to-r from-orange-500/20 to-yellow-500/20 text-orange-600 dark:text-orange-400"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {SOLUTIONS.map((solution) => {
            const Icon = solution.icon;
            return (
              <div
                key={solution.title}
                className="group flex gap-4 bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-orange-100 dark:border-orange-900/30 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300"
              >
                <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-linear-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1 md:mb-1.5">
                    {solution.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {solution.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-8 md:mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-3.5 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm md:text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            Bắt đầu học ngay hôm nay
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
