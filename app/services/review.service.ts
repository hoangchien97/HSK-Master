"use server";

import prisma from "@/app/lib/prisma";

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

export async function getApprovedReviews() {
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
}

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
