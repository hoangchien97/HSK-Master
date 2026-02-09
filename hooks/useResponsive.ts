"use client";
import { isMobile, isTablet, isBrowser } from 'react-device-detect';

export function useResponsive() {
  return {
    isMobile,
    isTablet,
    isDesktop: isBrowser && !isMobile && !isTablet,
  };
}

// Helper to get responsive class names
export function getResponsiveClass(config: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  base?: string;
}): string {
  const { mobile = '', tablet = '', desktop = '', base = '' } = config;

  if (isMobile) return `${base} ${mobile}`.trim();
  if (isTablet) return `${base} ${tablet}`.trim();
  return `${base} ${desktop}`.trim();
}
