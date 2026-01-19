import { getApprovedReviews } from "@/app/services";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import { SectionHeader } from "../shared";

export default async function ReviewsSection() {
  const reviews = await getApprovedReviews();

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <SectionHeader
          icon="⭐"
          tag="Đánh giá từ học viên"
          title="Trải nghiệm thực tế"
          description="Những chia sẻ chân thành từ các học viên đã và đang học tại trung tâm"
          tagColor="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 dark:text-yellow-400"
        />

        {/* Review Form */}
        <div className="mb-16 flex justify-center items-center">
          <ReviewForm />
        </div>

        {/* Review List */}
        <ReviewList reviews={reviews} />
      </div>
    </section>
  );
}
