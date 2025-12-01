// utils/seoHelpers.js

/**
 * SEO Helper Functions
 * Structured data ve meta tag içerikleri için yardımcı fonksiyonlar
 */

/**
 * LocalBusiness Schema için structured data oluşturur
 */
export const generateLocalBusinessSchema = (business) => {
  if (!business) return null;

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || window.location.origin;
  const businessUrl = `${baseUrl}/business/${business._id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.businessName,
    description: `${business.businessName} - ${business.businessType} with public toilet facilities. Find and book toilets near you.`,
    url: businessUrl,
    telephone: business.phone || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address?.street || '',
      addressLocality: business.address?.city || '',
      postalCode: business.address?.postalCode || '',
      addressCountry: business.address?.country || 'DE',
    },
    geo: business.location?.coordinates ? {
      '@type': 'GeoCoordinates',
      latitude: business.location.coordinates[1],
      longitude: business.location.coordinates[0],
    } : undefined,
    openingHours: business.openingHours || '',
    priceRange: '€',
    image: `${baseUrl}/og-image.jpg`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '100',
    },
  };
};

/**
 * Organization Schema için structured data oluşturur (ana sayfa için)
 */
export const generateOrganizationSchema = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || window.location.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WCFinder',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'WCFinder - Find clean, accessible toilets near you. Book and reserve public restrooms easily.',
    sameAs: [
      // Social media links can be added here
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['en', 'de', 'tr'],
    },
  };
};

/**
 * WebSite Schema için structured data oluşturur
 */
export const generateWebSiteSchema = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || window.location.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WCFinder',
    url: baseUrl,
    description: 'Find and book public toilets near you. WCFinder helps you locate clean, accessible restrooms.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/home?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
};

/**
 * BreadcrumbList Schema oluşturur
 */
export const generateBreadcrumbSchema = (items) => {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Sayfa için SEO keywords oluşturur
 */
export const generateKeywords = (business, additionalKeywords = []) => {
  const baseKeywords = [
    'toilet',
    'wc',
    'tuvalet',
    'toileten',
    'public restroom',
    'bathroom finder',
    'wc finder',
    'tuvalet bulucu',
    'toilet near me',
    'public toilet',
    'restroom finder',
    'toilet booking',
    'wc booking',
    'toilet reservation',
  ];

  const businessKeywords = business ? [
    business.businessName,
    business.businessType,
    business.address?.city,
    `${business.businessType} toilet`,
    `toilet ${business.address?.city}`,
    `wc ${business.address?.city}`,
  ] : [];

  return [...baseKeywords, ...businessKeywords, ...additionalKeywords]
    .filter(Boolean)
    .join(', ');
};

/**
 * Sayfa için SEO description oluşturur
 */
export const generateDescription = (business, customDescription = '') => {
  if (customDescription) return customDescription;

  if (business) {
    return `${business.businessName} - ${business.businessType} with public toilet facilities in ${business.address?.city}. Find and book clean, accessible toilets near you. WCFinder makes it easy to locate and reserve public restrooms.`;
  }

  return 'Find clean, accessible toilets near you. WCFinder helps you locate public restrooms, WC facilities, and toiletten in your area. Book and reserve toilets easily with our simple booking system.';
};

/**
 * Sayfa için SEO title oluşturur
 */
export const generateTitle = (business, customTitle = '') => {
  if (customTitle) return customTitle;

  if (business) {
    return `${business.businessName} - Toilet Booking | WCFinder`;
  }

  return 'WCFinder - Find Toilets Near You | Tuvalet Bulucu';
};

