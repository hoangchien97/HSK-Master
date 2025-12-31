import Image from "next/image";

export default function AboutHero() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
      <div className="order-2 lg:order-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-6 leading-tight">
          Cầu nối ngôn ngữ <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
            Kiến tạo tương lai
          </span>
        </h1>
        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-8 leading-relaxed">
          HSK Master không chỉ là nơi dạy tiếng Trung, chúng tôi xây dựng cộng
          đồng học tập đam mê, nơi văn hóa và ngôn ngữ giao thoa. Sứ mệnh của
          chúng tôi là giúp người Việt chinh phục tiếng Trung một cách tự nhiên
          và hiệu quả nhất.
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1 pr-6 border-r border-border-light dark:border-border-dark">
            <span className="text-3xl font-bold text-primary">5+</span>
            <span className="text-sm text-text-secondary-light">
              Năm hoạt động
            </span>
          </div>
          <div className="flex flex-col gap-1 px-6 border-r border-border-light dark:border-border-dark">
            <span className="text-3xl font-bold text-primary">10k+</span>
            <span className="text-sm text-text-secondary-light">Học viên</span>
          </div>
          <div className="flex flex-col gap-1 pl-6">
            <span className="text-3xl font-bold text-primary">98%</span>
            <span className="text-sm text-text-secondary-light">
              Đậu HSK/HSKK
            </span>
          </div>
        </div>
      </div>
      <div className="order-1 lg:order-2 relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-red-600 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition duration-500"></div>
        <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/3]">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
            alt="Students learning Chinese together"
            width={800}
            height={600}
            className="object-cover w-full h-full transform transition duration-700 group-hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}
