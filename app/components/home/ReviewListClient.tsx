"use client";
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ReviewItem from './ReviewItem';

interface Review {
  id: string;
  studentName: string;
  className: string;
  content: string;
  rating: number;
  createdAt: Date | string;
}

interface Props {
  reviews: Review[];
}

export default function ReviewListClient({ reviews }: Props) {
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Chưa có đánh giá nào được phê duyệt
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-4 md:gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex-none w-[85%] sm:w-[300px] md:w-[350px] lg:w-[400px]"
          >
            <ReviewItem {...review} />
          </div>
        ))}
      </div>
    </div>
  );
}
