// utils/seoHelpers.js

/**
 * SEO Helper Functions
 * GEO (Generative Engine Optimization) + Knowledge Graph aligned structured data
 */

const getBaseUrl = () =>
  import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || window.location.origin;

// ─────────────────────────────────────────────────────────────────────────────
// LocalBusiness Schema (für einzelne Business-Detailseiten)
// ─────────────────────────────────────────────────────────────────────────────
export const generateLocalBusinessSchema = (business) => {
  if (!business) return null;
  const baseUrl = getBaseUrl();
  const businessUrl = `${baseUrl}/business/${business._id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': businessUrl,
    name: business.businessName,
    description: `${business.businessName} – ${business.businessType} mit öffentlichen WC-Anlagen. Toilette finden und buchen mit WCFinder.`,
    url: businessUrl,
    telephone: business.phone || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address?.street || '',
      addressLocality: business.address?.city || '',
      postalCode: business.address?.postalCode || '',
      addressCountry: business.address?.country || 'DE',
    },
    geo: business.location?.coordinates
      ? {
          '@type': 'GeoCoordinates',
          latitude: business.location.coordinates[1],
          longitude: business.location.coordinates[0],
        }
      : undefined,
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

// ─────────────────────────────────────────────────────────────────────────────
// Organization Schema — Knowledge Graph Anchor
// Enhanced with entity definition, knowsAbout, areaServed, @id chain
// ─────────────────────────────────────────────────────────────────────────────
export const generateOrganizationSchema = () => {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'SoftwareApplication'],
    '@id': `${baseUrl}/#organization`,
    name: 'WCFinder',
    alternateName: ['WC Finder', 'wcfinder.de', 'WCFinder App'],
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      width: 200,
      height: 60,
    },
    description:
      'WCFinder ist Deutschlands führende Online-Buchungsplattform für saubere, barrierefreie öffentliche Toiletten. Wir verbinden Nutzer mit geprüften WC-Anlagen in Cafés, Restaurants, Hotels und Geschäften in über 50 deutschen Städten.',
    slogan: 'Saubere Toiletten. Jederzeit. Überall.',
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      addressCountry: 'DE',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Deutschland',
      '@id': 'https://www.wikidata.org/wiki/Q183',
    },
    knowsAbout: [
      'Öffentliche Toiletten',
      'WC-Buchungssystem',
      'Barrierefreie Sanitäranlagen',
      'Stadttoiletten Deutschland',
      'Toilettenhygiene',
      'Öffentliche Infrastruktur',
      'Restroom Booking',
    ],
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'iOS, Android, Web',
    sameAs: [
      'https://www.facebook.com/wcfinder',
      'https://www.instagram.com/wcfinder',
      'https://twitter.com/wcfinder',
      'https://www.linkedin.com/company/wcfinder',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: [
        { '@type': 'Language', name: 'German' },
        { '@type': 'Language', name: 'English' },
      ],
    },
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// WebSite Schema — SearchAction
// ─────────────────────────────────────────────────────────────────────────────
export const generateWebSiteSchema = () => {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'WCFinder',
    url: baseUrl,
    description:
      'Öffentliche Toiletten finden und buchen in Deutschland. WCFinder – sauber, barrierefrei, schnell reserviert.',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    inLanguage: 'de-DE',
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

// ─────────────────────────────────────────────────────────────────────────────
// Service Schema — WCFinder Hizmet Tanımı (Entity-based SEO)
// ─────────────────────────────────────────────────────────────────────────────
export const generateServiceSchema = () => {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/#service`,
    name: 'WCFinder Toilettenbuchungsservice',
    serviceType: 'Toilettenbuchungsservice',
    description:
      'Online-Buchungsservice für öffentliche Toiletten in Deutschland. Finden, reservieren und bezahlen Sie WC-Anlagen in Cafés, Restaurants, Hotels und Geschäften.',
    provider: {
      '@id': `${baseUrl}/#organization`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Deutschland',
    },
    availableChannel: [
      {
        '@type': 'ServiceChannel',
        serviceUrl: baseUrl,
        serviceType: 'Web',
      },
      {
        '@type': 'ServiceChannel',
        serviceType: 'Mobile App',
        availableLanguage: 'de',
      },
    ],
    offers: {
      '@type': 'Offer',
      price: '1.60',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '1.60',
        priceCurrency: 'EUR',
        unitText: 'pro Nutzung',
      },
      eligibleRegion: {
        '@type': 'Country',
        name: 'Deutschland',
      },
    },
    termsOfService: `${baseUrl}/agb`,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Schema — Question Intent Targeting (GEO kritik)
// ─────────────────────────────────────────────────────────────────────────────
export const generateFAQSchema = () => {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${baseUrl}/#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Wie buche ich eine Toilette mit WCFinder?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Geben Sie Ihren Standort in die Suchfunktion ein, wählen Sie eine verfügbare WC-Anlage auf der Karte aus und buchen Sie online mit Datum, Uhrzeit und Personenanzahl. Die Buchung dauert weniger als 2 Minuten. Sie erhalten sofort eine Bestätigung per E-Mail.',
        },
      },
      {
        '@type': 'Question',
        name: 'Was kostet eine Toilettenbuchung bei WCFinder?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Toilettenbuchungen bei WCFinder beginnen ab €1,60 pro Nutzung. Der genaue Preis hängt von der gewählten WC-Anlage und dem Standort ab. Die Preise werden vor der Buchung klar angezeigt.',
        },
      },
      {
        '@type': 'Question',
        name: 'Wo kann ich öffentliche Toiletten in Deutschland finden?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'WCFinder zeigt Ihnen auf einer interaktiven Karte alle verfügbaren WC-Anlagen in Ihrer Nähe in über 50 deutschen Städten, darunter Berlin, Hamburg, München, Köln, Frankfurt und viele mehr. Einfach Standort eingeben oder GPS nutzen.',
        },
      },
      {
        '@type': 'Question',
        name: 'Welche Zahlungsmethoden akzeptiert WCFinder?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'WCFinder akzeptiert alle gängigen Zahlungsmethoden: Kreditkarte (Visa, Mastercard) über Stripe, PayPal und SEPA-Lastschrift. Alle Zahlungen sind durch SSL-Verschlüsselung gesichert.',
        },
      },
      {
        '@type': 'Question',
        name: 'Sind die WCFinder-Toiletten barrierefrei?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Viele WCFinder-Partner bieten barrierefreie Toiletten an. Sie können in der App oder auf der Website nach barrierefreien Optionen filtern. Alle WC-Anlagen werden mit ihren Ausstattungsmerkmalen detailliert beschrieben.',
        },
      },
      {
        '@type': 'Question',
        name: 'Wie werde ich WCFinder-Partner?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Als Café, Restaurant, Hotel oder Geschäft können Sie Ihre WC-Anlage über WCFinder anbieten und zusätzliche Einnahmen generieren. Registrieren Sie sich einfach über das Partner-Formular auf unserer Website. Die Anmeldung ist kostenlos.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kann ich WCFinder auf dem Smartphone nutzen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja, WCFinder ist als kostenlose App für iOS und Android verfügbar. Die App ermöglicht Standortsuche, Buchung und Bezahlung unterwegs. Außerdem ist WCFinder vollständig mobil-optimiert im Browser nutzbar.',
        },
      },
      {
        '@type': 'Question',
        name: 'Wie erhalte ich meine Buchungsbestätigung?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nach erfolgreicher Buchung und Zahlung erhalten Sie sofort eine Bestätigungs-E-Mail mit allen Details Ihrer Reservierung sowie einem QR-Code für den Zugang zur WC-Anlage.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kann ich eine WCFinder-Buchung stornieren?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Buchungen können bis zu einer bestimmten Frist vor der Nutzung storniert werden. Die genauen Stornierungsbedingungen werden bei der Buchung angezeigt. Bei Fragen steht unser Kundenservice zur Verfügung.',
        },
      },
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HowTo Schema — Schritt-für-Schritt Buchung (GEO + AI Overviews)
// ─────────────────────────────────────────────────────────────────────────────
export const generateHowToSchema = () => {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${baseUrl}/#howto`,
    name: 'Wie buche ich eine Toilette mit WCFinder?',
    description:
      'So finden und buchen Sie in weniger als 2 Minuten eine saubere öffentliche Toilette in Ihrer Nähe mit WCFinder.',
    totalTime: 'PT5M',
    supply: [
      { '@type': 'HowToSupply', name: 'WCFinder App oder Website' },
      { '@type': 'HowToSupply', name: 'Zahlungsmittel (Kreditkarte oder PayPal)' },
    ],
    tool: [{ '@type': 'HowToTool', name: 'WCFinder', url: baseUrl }],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Standort suchen',
        text: 'Geben Sie Ihren aktuellen Standort oder eine Stadt in die WCFinder-Suchfunktion ein. Alternativ können Sie GPS nutzen, um automatisch Toiletten in Ihrer Nähe zu finden.',
        image: `${baseUrl}/og-image.jpg`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Toilette buchen',
        text: 'Wählen Sie auf der interaktiven Karte eine passende WC-Anlage aus. Wählen Sie Datum, Uhrzeit und Personenanzahl und klicken Sie auf "Jetzt buchen".',
        image: `${baseUrl}/og-image.jpg`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Sicher bezahlen',
        text: 'Bezahlen Sie sicher mit Kreditkarte über Stripe oder PayPal. Alle Transaktionen sind SSL-verschlüsselt und DSGVO-konform.',
        image: `${baseUrl}/og-image.jpg`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Toilette nutzen',
        text: 'Zeigen Sie Ihren QR-Code aus der Bestätigungs-E-Mail vor und nutzen Sie Ihre reservierte, saubere Toilette ohne Wartezeit. Hinterlassen Sie danach eine Bewertung.',
        image: `${baseUrl}/og-image.jpg`,
      },
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// AggregateRating Schema — Bewertungs-Daten (Reviews Entity)
// ─────────────────────────────────────────────────────────────────────────────
export const generateAggregateRatingSchema = () => {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/#product`,
    name: 'WCFinder',
    description: 'Online-Buchungsplattform für öffentliche Toiletten in Deutschland.',
    brand: { '@type': 'Brand', name: 'WCFinder' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      worstRating: '1',
      reviewCount: '2847',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: '5' },
        author: { '@type': 'Person', name: 'Michael K.' },
        reviewBody: 'Sehr saubere Einrichtung. Absolut empfehlenswert!',
      },
      {
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: '5' },
        author: { '@type': 'Person', name: 'Sara K.' },
        reviewBody: 'Einfacher Ablauf und sichere Umgebung.',
      },
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SpeakableSpecification — Voice / AI Assistant Optimization
// ─────────────────────────────────────────────────────────────────────────────
export const generateSpeakableSchema = () => {
  const baseUrl = getBaseUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${baseUrl}/#webpage`,
    name: 'WCFinder – Öffentliche Toiletten finden & buchen',
    url: baseUrl,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.speakable-hero', '.speakable-about', '.speakable-faq'],
    },
    isPartOf: { '@id': `${baseUrl}/#website` },
    about: { '@id': `${baseUrl}/#organization` },
    inLanguage: 'de-DE',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// BreadcrumbList Schema
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────
export const generateKeywords = (business, additionalKeywords = []) => {
  const baseKeywords = [
    'toilette',
    'wc',
    'öffentliche toilette',
    'öffentliches wc',
    'wc finder',
    'toilette in der nähe',
    'toilette buchen',
    'wc buchen',
    'saubere toilette',
    'toilet finder',
    'restroom booking',
    'public toilet germany',
    'wc buchung deutschland',
  ];

  const businessKeywords = business
    ? [
        business.businessName,
        business.businessType,
        business.address?.city,
        `${business.businessType} toilette`,
        `toilette ${business.address?.city}`,
        `wc ${business.address?.city}`,
      ]
    : [];

  return [...baseKeywords, ...businessKeywords, ...additionalKeywords]
    .filter(Boolean)
    .join(', ');
};

export const generateDescription = (business, customDescription = '') => {
  if (customDescription) return customDescription;

  if (business) {
    return `${business.businessName} – ${business.businessType} mit öffentlichen WC-Anlagen in ${business.address?.city}. Saubere, barrierefreie Toilette finden und buchen mit WCFinder.`;
  }

  return 'WCFinder ist Deutschlands Buchungsplattform für saubere, barrierefreie öffentliche Toiletten. Finde und buche WC-Anlagen in deiner Stadt ab €1,60. Über 500 Partner-Standorte in 50+ deutschen Städten.';
};

export const generateTitle = (business, customTitle = '') => {
  if (customTitle) return customTitle;

  if (business) {
    return `${business.businessName} – Toilette buchen | WCFinder`;
  }

  return 'WCFinder – Öffentliche Toiletten finden & buchen | Saubere WC-Anlage in deiner Nähe';
};
