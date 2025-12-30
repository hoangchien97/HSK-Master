"use server"

import { prisma } from "@/lib/prisma"

export async function submitContact(formData: FormData) {
  const name = formData.get("name")?.toString() || ""
  const email = formData.get("email")?.toString() || ""
  const message = formData.get("message")?.toString() || ""

  if (!name || !email || !message) {
    throw new Error("Missing required fields")
  }

  await prisma.registration.create({
    data: {
      name,
      email,
      phone: "CONTACT_FORM",
      note: message,
    },
  })
}
