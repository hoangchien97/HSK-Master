import Image from "next/image";
import { ImageIcon, Sparkles } from "lucide-react";

export default function Environment() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop",
      alt: "Phòng học hiện đại",
      label: "Phòng học hiện đại",
      color: "from-blue-500 to-cyan-600",
    },
    {
      src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop",
      alt: "Tài liệu học tập",
      label: "Tài liệu học tập",
      color: "from-green-500 to-emerald-600",
    },
    {
      src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
      alt: "Thư viện",
      label: "Thư viện sách",
      color: "from-purple-500 to-violet-600",
    },
    {
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop",
      alt: "Hoạt động văn hóa",
      label: "Hoạt động văn hóa",
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="relative mt-16 md:mt-24">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 rounded-full blur-3xl -z-10" />

      {/* Section Header */}
      <div className="text-center mb-10 md:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800 mb-6">
          <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            Không gian học tập
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Môi trường học tập{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            chuyên nghiệp
          </span>
        </h3>
        <p className="text-sm md:text-base text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
          Không gian học tập hiện đại, thoải mái và đầy đủ trang thiết bị
        </p>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative"
          >
            {/* Glow effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${image.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity rounded-2xl`}></div>
            
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 group-hover:border-transparent shadow-lg hover:shadow-2xl transition-all duration-500">
              {/* Image */}
              <Image
                src={image.src}
                alt={image.alt}
                width={400}
                height={400}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${image.color} opacity-0 group-hover:opacity-80 transition-opacity duration-300`}></div>
              
              {/* Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white mb-3 mx-auto animate-pulse" />
                  <p className="text-white text-base md:text-lg font-bold text-center px-4 drop-shadow-lg">
                    {image.label}
                  </p>
                </div>
              </div>

              {/* Corner badge */}
              <div className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={`text-sm font-bold bg-gradient-to-r ${image.color} bg-clip-text text-transparent`}>
                  {index + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
