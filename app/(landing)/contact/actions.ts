"use server"

import { prisma } from "@/lib/prisma"

export async function submitContact(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? ""
  const phone = formData.get("phone")?.toString().trim() ?? ""
  const email = formData.get("email")?.toString().trim() ?? ""
  const message = formData.get("message")?.toString().trim() ?? ""

  if (!name || !phone) {
    throw new Error("Thiếu thông tin bắt buộc")
  }

  await prisma.registration.create({
    data: {
      name,
      email: email || "N/A",
      phone,
      note: message || undefined,
    },
  })
}
