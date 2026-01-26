"use client";

import { useState } from "react";
import { createReview } from "@/app/services";
import { Button, Input, Textarea, Select } from "../shared";
import { MessageCircle, Send, Star } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useResponsive } from "@/app/hooks/useResponsive";

const HSK_LEVELS = [
  { value: "HSK 1", label: "HSK 1" },
  { value: "HSK 2", label: "HSK 2" },
  { value: "HSK 3", label: "HSK 3" },
  { value: "HSK 4", label: "HSK 4" },
  { value: "HSK 5", label: "HSK 5" },
  { value: "HSK 6", label: "HSK 6" },
];

interface ReviewFormProps {
  onReviewAdded?: (review: {
    id: string;
    studentName: string;
    className: string;
    content: string;
    rating: number;
    createdAt: Date | string;
  }) => void;
}

export default function ReviewForm({ onReviewAdded }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    className: "",
    content: "",
    rating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const { isMobile } = useResponsive();
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Validation
    if (!formData.studentName || !formData.className || !formData.content) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      setIsSubmitting(false);
      return;
    }

    if (formData.rating === 0) {
      toast.error("Vui lòng chọn đánh giá");
      setIsSubmitting(false);
      return;
    }

    const result = await createReview(formData);

    if (result.success) {
      toast.success(
        "Cảm ơn bạn đã chia sẻ! Review của bạn đã được đăng thành công 🎉"
      );
      setFormData({ studentName: "", className: "", content: "", rating: 0 });

      // Add review to list without reloading
      if (result.review && onReviewAdded) {
        onReviewAdded(result.review);
      }
    } else {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-gradient-to-br from-white via-red-50/30 to-orange-50/50 dark:from-gray-900 dark:via-red-950/20 dark:to-orange-950/20 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl border border-red-100 dark:border-red-900/30">
      {/* Header */}
      <div className="text-center mb-4 md:mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 mb-3 md:mb-4">
          <MessageCircle className="h-3 w-3 md:h-4 md:w-4 text-red-600 dark:text-red-400" />
          <span className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400">
            Chia sẻ trải nghiệm
          </span>
        </div>

        <h3 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2">
          Học viên nói gì về cô Ngoc?
        </h3>
        <p className="text-xs md:text-sm lg:text-base text-gray-600 dark:text-gray-400">
          Những chia sẻ chân thật từ các học viên đã thành công
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Student Name */}
          <div>
            <Input
              label="Tên học viên"
              type="text"
              placeholder="Nhập tên của bạn"
              value={formData.studentName}
              onChange={(e) =>
                setFormData({ ...formData, studentName: e.target.value })
              }
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Class Selection */}
          <div>
            <Select
              label="Lớp học"
              placeholder="VD: HSK 1, HSK 2..."
              options={HSK_LEVELS}
              value={formData.className}
              onChange={(value) =>
                setFormData({ ...formData, className: value })
              }
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        {/* Review Content */}
        <div>
          <Textarea
            label="Nội dung review"
            rows={5}
            placeholder="Chia sẻ trải nghiệm học tập của bạn với cô Ngoc... 😊 Ban có thể thêm emoji vào review!"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            maxLength={500}
            disabled={isSubmitting}
            helperText={`Có thể sử dụng emoji để làm review sinh động hơn (${formData.content.length}/500)`}
            required
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
            Đánh giá
          </label>
          <div className="flex items-center gap-1.5 md:gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setFormData({ ...formData, rating: star })}
                disabled={isSubmitting}
                className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
              >
                <Star
                  className={`h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 ${
                    star <= (hoveredStar || formData.rating)
                      ? "fill-yellow-400 text-yellow-400 cursor-pointer"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Chọn đánh giá
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="button"
          onClick={handleSubmit}
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          <Send className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
          {isSubmitting ? "Đang gửi..." : "Gửi dánh giá ngay"}
        </Button>
      </div>
    </div>
  );
}
