// Structured Data / Schema.org JSON-LD generators

export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hskmaster.edu.vn';

  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'HSK Master',
    alternateName: 'Trung tâm tiếng Trung HSK Master',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Trung tâm tiếng Trung chuyên đào tạo HSK từ cơ bản đến nâng cao tại Hà Nội',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Số 4 Xóm Cầu Lão, Xã Ô Diên, Huyện Đan Phượng',
      addressLocality: 'Hà Nội',
      addressRegion: 'HN',
      postalCode: '100000',
      addressCountry: 'VN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-965-322-136',
      contactType: 'Customer Service',
      areaServed: 'VN',
      availableLanguage: ['Vietnamese', 'Chinese'],
    },
    sameAs: [
      'https://facebook.com/hskmaster',
      'https://instagram.com/hskmaster',
      'https://linkedin.com/company/hskmaster',
    ],
    founder: {
      '@type': 'Person',
      name: 'Trần Hồng Ngọc',
    },
    foundingDate: '2016',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '10-50',
    },
  };
}

export function generateWebsiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hskmaster.edu.vn';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HSK Master',
    url: baseUrl,
    description: 'Trung tâm tiếng Trung HSK Master - Đào tạo HSK 1-6, giao tiếp, thương mại',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/courses?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateCourseSchema(course: {
  title: string;
  description: string | null;
  image: string | null;
  instructor: string | null;
  durationHours: number;
  level: string | null;
  enrollmentCount: number;
  viewCount: number;
  slug: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hskmaster.edu.vn';

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description || '',
    image: course.image || `${baseUrl}/og-image.jpg`,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'HSK Master',
      url: baseUrl,
    },
    instructor: {
      '@type': 'Person',
      name: course.instructor || 'HSK Master',
    },
    educationalLevel: course.level || 'Beginner to Advanced',
    timeRequired: `PT${course.durationHours}H`,
    inLanguage: 'vi',
    availableLanguage: ['Vietnamese', 'Chinese'],
    coursePrerequisites: 'Không yêu cầu kinh nghiệm',
    teaches: `Tiếng Trung ${course.level || ''}`,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: ['online', 'blended'],
      courseWorkload: `PT${course.durationHours}H`,
    },
    aggregateRating: course.enrollmentCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: course.enrollmentCount,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WriteAction',
      userInteractionCount: course.enrollmentCount,
    },
    offers: {
      '@type': 'Offer',
      category: 'Education',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'VND',
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hskmaster.edu.vn';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateReviewSchema(reviews: Array<{
  studentName: string;
  content: string;
  rating: number;
  createdAt: Date;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hskmaster.edu.vn';

  return reviews.map((review) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'EducationalOrganization',
      name: 'HSK Master',
      url: baseUrl,
    },
    author: {
      '@type': 'Person',
      name: review.studentName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.content,
    datePublished: review.createdAt.toISOString(),
  }));
}
