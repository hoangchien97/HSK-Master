import React from 'react';
import Link from 'next/link';
import Button from '../shared/Button';
import { getCtaStats } from '@/app/services';
import CountUp from './CountUp';

export default async function CTASection() {

  const stats = await getCtaStats();
  return (
    <section className="py-12 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-4">
            <span className="text-base">✨</span>
            <span>Bắt đầu ngay hôm nay</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
            Sẵn sàng bắt đầu{' '}
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent">
              hành trình học
            </span>
            <br className="hidden sm:block" />
            tiếng Trung?
          </h2>

          {/* Description */}
          <p className="text-white/90 text-sm md:text-base mb-6 md:mb-8 max-w-2xl mx-auto">
            Đăng ký ngay để nhận buổi học thử miễn phí và tư vấn lộ trình học phù hợp
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8 md:mb-10">
            <Link href="/courses">
              <Button
                variant="white"
                size="md"
                icon={<span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                className="w-full sm:w-auto"
              >
                Đăng ký học thử miễn phí
              </Button>
            </Link>

            <Link href="/contact">
              <Button
                variant="outline-white"
                size="md"
                className="w-full sm:w-auto"
              >
                Tìm hiểu về cô Ngọc
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-white">
            {stats.map((stat, index) => (
              <React.Fragment key={stat.id}>
                {index > 0 && <div className="hidden sm:block w-px h-10 bg-white/30" />}
                <div className="text-center">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                  <div className="text-white/80 text-xs md:text-sm">{stat.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
