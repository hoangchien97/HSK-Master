// Type definitions for HSK Master components

export interface Slide {
  id: number;
  image: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  overlayGradient: string;
}

export interface HSKLevel {
  level: number;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  vocabularyCount: string;
  targetAudience: string;
  targetIcon: string;
  accentColor: string;
  bgGradient: string;
  href: string;
}

export interface Course {
  id: string;
  title: string;
  image: string;
  instructor: string;
  instructorAvatar: string;
  price: string;
  originalPrice?: string;
  students: string;
  rating: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tag?: string;
}

export interface Filter {
  id: string;
  label: string;
  value: string;
}

export interface Album {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string;
  photoCount: number;
  order: number;
  isActive: boolean;
  photos: Photo[];
}

export interface Photo {
  id: string;
  albumId: string;
  url: string;
  title: string | null;
  description: string | null;
  order: number;
}
