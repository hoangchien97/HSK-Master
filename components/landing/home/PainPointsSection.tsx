import SectionHeader from '@/components/landing/shared/SectionHeader';
import { HelpCircle, Brain, Map, RotateCcw } from 'lucide-react';

const PAIN_POINTS = [
  {
    icon: Brain,
    title: 'Học từ vựng nhưng nhanh quên?',
    description: 'Bạn dành hàng giờ để học thuộc từ vựng nhưng chỉ sau vài ngày đã quên sạch.',
  },
  {
    icon: HelpCircle,
    title: 'Không hiểu cấu trúc đề thi?',
    description: 'Làm đề HSK nhưng không biết cách tiếp cận từng phần nghe, đọc, viết.',
  },
  {
    icon: Map,
    title: 'Không biết bắt đầu từ đâu?',
    description: 'Quá nhiều tài liệu, quá nhiều lời khuyên, nhưng thiếu lộ trình rõ ràng.',
  },
  {
    icon: RotateCcw,
    title: 'Thi nhiều lần vẫn chưa đạt?',
    description: 'Đã thi lại HSK nhưng điểm không cải thiện vì chưa có phương pháp phù hợp.',
  },
];

export default function PainPointsSection() {
  return (
    <section className="py-8 md:py-12 lg:py-16 bg-linear-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 md:px-6 lg:px-8">
        <SectionHeader
          icon="🤔"
          tag="Vấn đề thường gặp"
          title="Bạn có đang gặp phải những điều này?"
          description="Hàng trăm học viên đã từng như bạn — và đã tìm được giải pháp tại Ruby HSK"
          tagColor="bg-linear-to-r from-red-500/20 to-orange-500/20 text-red-600 dark:text-red-400"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {PAIN_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="group relative bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-5 md:p-6 shadow-sm border border-red-100 dark:border-red-900/30 hover:shadow-lg hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-red-50 dark:bg-red-900/20 rounded-xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2">
                  {point.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Closing message */}
        <p className="text-center mt-6 md:mt-8 text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Việc học HSK không khó —{' '}
          <span className="font-semibold text-red-600 dark:text-red-400">
            nhưng bạn cần một lộ trình đúng và phương pháp phù hợp.
          </span>
        </p>
      </div>
    </section>
  );
}
