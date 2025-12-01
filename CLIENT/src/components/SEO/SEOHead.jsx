// components/SEO/SEOHead.jsx
import { useEffect } from 'react';

/**
 * SEO Head Component
 * Dinamik meta tag yönetimi için custom hook
 * React 19 uyumlu
 */
const SEOHead = ({
  title = 'WCFinder - Find Toilets Near You | Tuvalet Bulucu',
  description = 'Find clean, accessible toilets near you. WCFinder helps you locate public restrooms, WC facilities, and toiletten in your area. Book and reserve toilets easily.',
  keywords = 'toilet, wc, tuvalet, toiletten, public restroom, bathroom finder, wc finder, tuvalet bulucu, toilet near me',
  image = '/og-image.jpg', // Default OG image
  url = '',
  type = 'website',
  locale = 'en_US',
  siteName = 'WCFinder',
  twitterCard = 'summary_large_image',
  noindex = false,
  canonical = '',
  structuredData = null,
}) => {
  useEffect(() => {
    // Base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || window.location.origin;
    const fullUrl = url ? `${baseUrl}${url}` : window.location.href;
    const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
    const canonicalUrl = canonical || fullUrl;

    // Set language attribute dynamically
    const langCode = locale.split('_')[0]; // 'en_US' -> 'en'
    if (document.documentElement.lang !== langCode) {
      document.documentElement.lang = langCode;
    }

    // Title
    const titleTag = document.querySelector('title');
    if (titleTag) {
      titleTag.textContent = title;
    } else {
      const newTitle = document.createElement('title');
      newTitle.textContent = title;
      document.head.appendChild(newTitle);
    }

    // Meta tags helper function
    const setMetaTag = (name, content, attribute = 'name') => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    // Remove existing meta tags first (to avoid duplicates)
    const removeMetaTags = (selector) => {
      const existing = document.querySelectorAll(selector);
      existing.forEach(el => el.remove());
    };

    // Basic Meta Tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonicalLink);
    }

    // Open Graph Tags
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:image', fullImageUrl, 'property');
    setMetaTag('og:url', fullUrl, 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:locale', locale, 'property');
    setMetaTag('og:site_name', siteName, 'property');

    // Twitter Card Tags
    setMetaTag('twitter:card', twitterCard);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', fullImageUrl);

    // Structured Data (JSON-LD)
    if (structuredData) {
      // Remove existing structured data scripts
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => script.remove());

      // Handle both single object and array of objects
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      
      dataArray.forEach((data) => {
        if (data) {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.textContent = JSON.stringify(data);
          document.head.appendChild(script);
        }
      });
    }

    // Cleanup function
    return () => {
      // Cleanup is handled by React's re-rendering
      // Meta tags will be updated on next render
    };
  }, [title, description, keywords, image, url, type, locale, siteName, twitterCard, noindex, canonical, structuredData]);

  return null; // This component doesn't render anything
};

export default SEOHead;

