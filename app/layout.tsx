import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WebVitals, ScrollToTop, ContactBubbles } from "./components/shared";
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import NextTopLoader from 'nextjs-toploader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateOrganizationSchema, generateWebsiteSchema } from './lib/structured-data';
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hskmaster.edu.vn";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HSK Master - Trung tâm tiếng Trung uy tín tại Hà Nội",
    template: "%s | HSK Master",
  },
  description:
    "Trung tâm tiếng Trung HSK Master - Đào tạo HSK 1-6, giao tiếp, thương mại. Giáo viên 8+ năm kinh nghiệm. Cam kết đầu ra.",
  keywords: ["học tiếng Trung", "HSK", "trung tâm tiếng Trung Hà Nội", "luyện thi HSK", "học tiếng Trung online"],
  authors: [{ name: "HSK Master" }],
  creator: "HSK Master",
  publisher: "HSK Master",
  applicationName: "HSK Master",
  category: "Education",
  classification: "Education",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Thẻ Icons & Manifest
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",

  // Open Graph - Enhanced
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "HSK Master",
    title: "HSK Master - Trung tâm tiếng Trung uy tín tại Hà Nội",
    description: "Trung tâm tiếng Trung HSK Master - Đào tạo HSK 1-6, giao tiếp, thương mại. Cam kết đầu ra.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "HSK Master - Trung tâm tiếng Trung",
        type: "image/jpeg",
      },
    ],
  },

  // Twitter Card - Enhanced
  twitter: {
    card: "summary_large_image",
    site: "@hskmaster",
    creator: "@hskmaster",
    title: "HSK Master - Trung tâm tiếng Trung uy tín",
    description: "Đào tạo HSK 1-6, giao tiếp, thương mại. Cam kết đầu ra.",
    images: [`${siteUrl}/og-image.jpg`],
  },

  // Robots - Enhanced
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification Codes
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    // yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
    // bing: process.env.NEXT_PUBLIC_BING_VERIFICATION || "",
  },

  // Thông tin bổ sung
  alternates: {
    canonical: siteUrl,
  },

  // Thông tin ứng dụng (PWA ready)
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HSK Master",
  },

  // Other metadata
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "theme-color": "#ec131e",
    "msapplication-TileColor": "#ec131e",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data - Organization & Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark flex flex-col`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <NextTopLoader
            color="#ec131e"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #ec131e,0 0 5px #ec131e"
            zIndex={1600}
            showAtBottom={false}
          />
          <TooltipPrimitive.Provider delayDuration={200} skipDelayDuration={100}>
            <Suspense fallback={null}>
              <WebVitals />
            </Suspense>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
            <ScrollToTop />
            <ContactBubbles />
          </TooltipPrimitive.Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
