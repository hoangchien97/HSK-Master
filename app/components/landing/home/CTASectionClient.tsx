"use client";
import React from 'react';
import Link from 'next/link';
import Button from '@/app/components/landing/common/Button';
import CountUp from './CountUp';

interface CtaStat {
  id: string;
  value: number;
  suffix?: string;
  label: string;
}

interface Props {
  stats: CtaStat[];
}

export default function CTASectionClient({ stats }: Props) {
  return (
    <section className="py-8 md:py-12 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      <div className="hidden md:block absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48" />

      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 md:mb-4">
            <span className="text-sm md:text-base">✨</span>
            <span>Bắt đầu ngay hôm nay</span>
          </div>

          {/* Heading */}
          <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 md:mb-3 leading-tight">
            Sẵn sàng bắt đầu{' '}
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent">
              hành trình học
            </span>
            <br className="hidden sm:block" />
            tiếng Trung?
          </h2>

          {/* Description */}
          <p className="text-white/90 text-xs md:text-sm lg:text-base mb-4 md:mb-6 lg:mb-8 max-w-2xl mx-auto px-2 md:px-0">
            Đăng ký ngay để nhận buổi học thử miễn phí và tư vấn lộ trình học phù hợp
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center items-center mb-6 md:mb-8 lg:mb-10">
            <Link href="/courses" className="w-full sm:w-auto">
              <Button
                variant="white"
                size="md"
                icon={<span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                className="w-full sm:w-auto text-xs md:text-sm"
              >
                Đăng ký học thử miễn phí
              </Button>
            </Link>

            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                variant="outline-white"
                size="md"
                className="w-full sm:w-auto text-xs md:text-sm"
              >
                Tìm hiểu về cô Ngọc
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 lg:gap-10 text-white">
            {stats.length > 0 ? (
              stats.map((stat, index) => (
                <React.Fragment key={stat.id}>
                  {index > 0 && <div className="hidden sm:block w-px h-10 bg-white/30" />}
                  <div className="text-center min-w-[80px]">
                    <CountUp
                      value={stat.value}
                      suffix={stat.suffix}
                      stiffness={100}
                      damping={20}
                    />
                    <div className="text-white/90 text-[10px] md:text-xs lg:text-sm font-medium">
                      {stat.label}
                    </div>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="flex gap-6 md:gap-10">
                <div className="text-center min-w-[80px]">
                  <CountUp value={500} suffix="+" />
                  <div className="text-white/90 text-[10px] md:text-xs lg:text-sm font-medium">
                    Học viên
                  </div>
                </div>
                <div className="hidden sm:block w-px h-10 bg-white/30" />
                <div className="text-center min-w-[80px]">
                  <CountUp value={10} suffix="+" />
                  <div className="text-white/90 text-[10px] md:text-xs lg:text-sm font-medium">
                    Năm kinh nghiệm
                  </div>
                </div>
                <div className="hidden sm:block w-px h-10 bg-white/30" />
                <div className="text-center min-w-[80px]">
                  <CountUp value={95} suffix="%" />
                  <div className="text-white/90 text-[10px] md:text-xs lg:text-sm font-medium">
                    Học viên hài lòng
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
