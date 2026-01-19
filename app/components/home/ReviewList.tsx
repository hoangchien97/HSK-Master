"use client";

import { Star, Quote } from "lucide-react";
import { Badge, AnimatedSection, Tooltip } from "../shared";

interface Review {
  id: string;
  studentName: string;
  className: string;
  content: string;
  rating: number;
  createdAt: Date;
}

interface ReviewListProps {
  reviews: Review[];
}

// Helper function to format date
function formatReviewDate(date: Date) {
  const now = new Date();
  const reviewDate = new Date(date);
  const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hôm nay";
  } else if (diffDays === 1) {
    return "Hôm qua";
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return reviewDate.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

// Helper function to get badge color
function getBadgeColor(className: string): string {
  if (className.includes("HSK 1")) return "bg-orange-100 !text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
  if (className.includes("HSK 2")) return "bg-orange-100 !text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
  if (className.includes("HSK 3")) return "bg-red-100 !text-red-800 dark:bg-red-900/30 dark:text-red-200";
  if (className.includes("HSK 4")) return "bg-red-100 !text-red-800 dark:bg-red-900/30 dark:text-red-200";
  if (className.includes("HSK 5")) return "bg-indigo-100 !text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200";
  if (className.includes("HSK 6")) return "bg-blue-100 !text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";
  return "bg-purple-100 !text-purple-800 dark:bg-purple-900/30 dark:text-purple-200";
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 mb-6">
          <Star className="h-12 w-12 text-orange-500 dark:text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Chưa có review nào
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-20">
      {/* Header with Stats */}
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Đánh giá từ học viên
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-red-600 dark:text-red-400">
            {reviews.length}
          </span>{" "}
          học viên đã chia sẻ trải nghiệm học tập với cô Ngoc
        </p>
      </div>

      {/* Reviews Grid - Equal Height Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <AnimatedSection
            key={review.id}
            variant="fadeInUp"
            delay={index * 0.1}
          >
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-gradient-to-br hover:from-orange-200 hover:to-red-200 dark:hover:from-orange-900/50 dark:hover:to-red-900/50 overflow-hidden h-full flex flex-col">
              {/* Decorative Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-red-50/50 dark:from-orange-950/20 dark:via-transparent dark:to-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10 flex-1 flex flex-col">
                {/* Header: Rating & Badge */}
                <div className="flex items-start justify-between mb-4">
                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        style={{ transitionDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>

                  {/* Class Badge */}
                  <Badge className={getBadgeColor(review.className)} variant="active">
                    {review.className}
                  </Badge>
                </div>

                {/* Review Content with Tooltip on hover */}
                <blockquote className="mb-5 flex-1">
                  <Tooltip content={review.content} placement="top">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base line-clamp-2 cursor-help">
                      {review.content}
                    </p>
                  </Tooltip>
                </blockquote>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-5" />

                {/* Student Info */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {review.studentName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {review.studentName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatReviewDate(review.createdAt)} •{" "}
                      {new Date(review.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200/20 to-red-200/20 dark:from-orange-900/20 dark:to-red-900/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}
