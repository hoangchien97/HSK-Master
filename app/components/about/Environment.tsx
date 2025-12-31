import Image from "next/image";

export default function Environment() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop",
      alt: "Classroom",
    },
    {
      src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop",
      alt: "Study materials",
    },
    {
      src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
      alt: "Library",
    },
    {
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop",
      alt: "Culture event",
    },
  ];

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Môi trường học tập
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={400}
              height={400}
              className="h-full w-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
