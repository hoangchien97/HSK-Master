"use client";

import { HeroUIProvider as UIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface UIProviderProps {
  children: ReactNode;
}

export function HeroUIProvider({ children }: UIProviderProps) {
  const router = useRouter();

  return <UIProvider navigate={router.push}>{children}</UIProvider>;
}
