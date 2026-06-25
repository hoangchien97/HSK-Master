/**
 * Teacher profile content — move to a CMS model when ready.
 * Centralised here so copy/data changes don't require touching the component.
 */

export const TEACHER_INFO = {
  name: 'Cô Ngọc',
  fullName: 'Trần Hồng Ngọc',
  roleLabel: 'Giảng viên chính',
  bio: '5 năm kinh nghiệm giảng dạy tiếng Trung HSK với phương pháp hiệu quả và tận tâm',
  avatarUrl: 'https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg',
  /** Hero landscape image for AboutHero. Replace with a proper 4:3 classroom photo when available. */
  heroImageUrl: 'https://ukbeoggejnqgdxqoqkvj.supabase.co/storage/v1/object/public/avatars/cmlzc6puk00065ivu2okymziv/teacher.jpg',
} as const;

export const TEACHER_ACHIEVEMENTS = [
  {
    iconName: 'GraduationCap',
    title: 'Tốt nghiệp bằng giỏi',
    description: 'Đại học Ngoại ngữ - ĐHQG Hà Nội',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    iconName: 'Trophy',
    title: 'HSK 6 & HSK cao cấp',
    description: 'Trình độ cao nhất trong hệ thống HSK',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    iconName: 'Star',
    title: 'Giải nhất cuộc thi',
    description: 'Nghiên cứu khoa học Đổi mới - Sáng tạo',
    color: 'from-purple-500 to-pink-500',
  },
  {
    iconName: 'Award',
    title: 'Đại sứ thủ lĩnh',
    description: 'Đại học Ngoại ngữ - ĐHQG Hà Nội',
    color: 'from-red-500 to-rose-500',
  },
] as const;

export const TEACHER_STATS = [
  {
    iconName: 'Target',
    number: '5',
    suffix: '+',
    unit: 'năm',
    label: 'Kinh nghiệm giảng dạy',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    iconName: 'GraduationCap',
    number: 'HSK',
    suffix: '',
    unit: '1-6',
    label: 'Chuyên môn sâu',
    color: 'from-violet-500 to-purple-500',
  },
  {
    iconName: 'Users',
    number: '200',
    suffix: '+',
    unit: '',
    label: 'Học viên thành công',
    color: 'from-orange-500 to-red-500',
  },
  {
    iconName: 'Heart',
    number: '100',
    suffix: '%',
    unit: '',
    label: 'Tận tâm & Linh hoạt',
    color: 'from-pink-500 to-rose-500',
  },
] as const;
