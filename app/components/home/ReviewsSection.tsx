import { getApprovedReviews } from "@/app/services";
import ReviewsSectionClient from "./ReviewsSectionClient";

export default async function ReviewsSection() {
  const reviews = await getApprovedReviews();

  return <ReviewsSectionClient reviews={reviews} />;
}
