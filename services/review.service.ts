"use server";

import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export interface ReviewData {
  studentName: string;
  className: string;
  content: string;
  rating: number;
}

export async function createReview(data: ReviewData) {
  try {
    const review = await prisma.review.create({
      data: {
        studentName: data.studentName,
        className: data.className,
        content: data.content,
        rating: data.rating,
        isApproved: true, // Auto-approve reviews
      },
    });

    return { success: true, review };
  } catch (error) {
    console.error("Error creating review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

export const getApprovedReviews = unstable_cache(
  async () => {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          isApproved: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return reviews;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  },
  ["approved-reviews"],
  { revalidate: 3600, tags: ["reviews"] }
);

export async function getAllReviews() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return reviews;
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return [];
  }
}
