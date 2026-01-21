import ReviewListClient from './ReviewListClient';

interface Review {
  id: string;
  studentName: string;
  className: string;
  content: string;
  rating: number;
  createdAt: Date | string;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  return <ReviewListClient reviews={reviews} />;
}

