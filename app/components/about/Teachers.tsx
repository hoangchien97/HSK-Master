import Image from "next/image";

export default function Teachers() {
  const teachers = [
    {
      name: "Cô Lan Anh",
      title: "Thạc sĩ GD Hán ngữ",
      description:
        "5 năm kinh nghiệm giảng dạy tại các trường Đại học lớn. Chuyên gia luyện thi HSK 5-6 và kỹ năng biên phiên dịch.",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    },
    {
      name: "Thầy Vương",
      title: "Giảng viên bản xứ",
      description:
        "Đến từ Bắc Kinh, thầy Vương mang đến ngữ điệu chuẩn xác và phương pháp dạy khẩu ngữ thực tế, sinh động.",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    },
    {
      name: "Cô Ngọc",
      title: "Cử nhân ĐH Ngoại ngữ",
      description:
        "Chuyên gia dạy tiếng Trung thương mại và giao tiếp văn phòng. Phong cách dạy hiện đại, tập trung vào ứng dụng.",
      image:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop",
    },
    {
      name: "Thầy Minh",
      title: "Tiến sĩ Ngôn ngữ học",
      description:
        "Với hơn 15 năm nghiên cứu, thầy Minh giúp học viên hiểu sâu về ngữ pháp và văn hóa Trung Hoa qua từng bài giảng.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
  ];

  return (
    <div className="mb-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
          Đội ngũ giảng viên
        </h2>
        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark">
          Những người thầy, người cô tận tâm sẽ đồng hành cùng bạn trên con
          đường chinh phục tiếng Trung.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {teachers.map((teacher, index) => (
          <div
            key={index}
            className="group relative flex flex-col items-center p-6 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark hover:border-red-200 dark:hover:border-red-900 hover:shadow-lg transition-all text-center"
          >
            <div className="relative w-32 h-32 mb-4 rounded-full p-1 bg-gradient-to-br from-red-500 to-yellow-500">
              <Image
                src={teacher.image}
                alt={teacher.name}
                width={128}
                height={128}
                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-surface-dark"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {teacher.name}
            </h3>
            <p className="text-sm font-medium text-primary mb-2">
              {teacher.title}
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark line-clamp-3">
              {teacher.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
