"use client";
import { useState } from "react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import SectionHeader from "@/components/landing/shared/SectionHeader";

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

export default function ReviewsSectionClient({
  reviews: initialReviews,
}: Props) {
  const [reviews, setReviews] = useState(initialReviews);

  const handleReviewAdded = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <section className="py-8 md:py-12 lg:py-16 xl:py-20 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <SectionHeader
          icon="⭐"
          tag="Đánh giá từ học viên"
          title="Trải nghiệm thực tế"
          description="Những chia sẻ chân thành từ các học viên đã và đang học tại trung tâm"
          tagColor="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 dark:text-yellow-400"
        />

        {/* Review Form */}
        <div className="mb-6 md:mb-10 lg:mb-16 flex justify-center items-center">
          <ReviewForm onReviewAdded={handleReviewAdded} />
        </div>

        {/* Review List */}
        <ReviewList reviews={reviews} />

        {/* Hint for mobile drag */}
        <div className="md:hidden text-center mt-3 md:mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            👉 Vuốt để xem thêm đánh giá
          </p>
        </div>
      </div>
    </section>
  );
}
