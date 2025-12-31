import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold uppercase tracking-wider mb-6 animate-fade-in">
            <span className="text-xl animate-bounce-slow">✨</span>
            <span>Bắt đầu ngay hôm nay</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight animate-slide-up">
            Sẵn sàng bắt đầu{' '}
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-white bg-clip-text text-transparent animate-gradient">
              hành trình học
            </span>
            <br className="hidden sm:block" />
            tiếng Trung?
          </h2>

          {/* Description */}
          <p className="text-white/90 text-base md:text-lg lg:text-xl mb-8 md:mb-10 max-w-3xl mx-auto font-medium">
            Đăng ký ngay để nhận buổi học thử miễn phí và tư vấn lộ trình học phù hợp
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/courses"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-white text-red-600 font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all w-full sm:w-auto"
            >
              <span>Đăng ký học thử miễn phí</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-transparent text-white font-bold border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all w-full sm:w-auto"
            >
              <span>Tìm hiểu về cô Ngọc</span>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-10 md:mt-12 flex flex-wrap justify-center items-center gap-6 md:gap-12 text-white">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold mb-1">10,000+</div>
              <div className="text-white/80 text-sm">Học viên</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold mb-1">5 năm</div>
              <div className="text-white/80 text-sm">Kinh nghiệm</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold mb-1">98%</div>
              <div className="text-white/80 text-sm">Hài lòng</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
