// Central SEO utilities: shared brand constants, JSON-LD builders, and a
// lightweight <Seo> component that manages <title>/<meta>/<link>/JSON-LD tags.
//
// WHY NOT react-helmet-async:
// This app is pure client-side rendered (no SSR), so there's no hydration-order
// problem helmet solves. Plain DOM writes in a useEffect are all that's needed,
// and it avoids an extra dependency.

import { useEffect } from 'react';

export const SITE_NAME = 'Premier Beauty Clinic';
export const SITE_URL = 'https://premierbeautyclinic.com';
export const DEFAULT_TITLE = 'Premier Beauty Clinic | Skincare, Beauty Treatments & Wellness in Nairobi, Kenya';
export const DEFAULT_DESCRIPTION =
  'Premium, dermatologist-approved skincare and beauty treatments in Kilimani, Nairobi, Kenya. Shop skincare, fragrances & wellness products, or book a facial, dermaplaning, or LED therapy session.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const BUSINESS = {
  name: SITE_NAME,
  telephone: '+254768679646',
  email: 'info@premierbeautyclinic.com',
  streetAddress: 'Karibu Square Mall, Kilimani, 1st Floor',
  addressLocality: 'Nairobi',
  addressCountry: 'KE',
  sameAs: [
    'https://www.instagram.com/premier_beauty_clinic',
    'https://www.tiktok.com/@premier_beauty_clinic',
  ],
};

// ─── DOM helpers ────────────────────────────────────────────────────────────

function setMetaByName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSONLD_ATTR = 'data-seo-jsonld';

function setJsonLd(items: object[] | undefined) {
  // Remove previous page's structured data first
  document.querySelectorAll(`script[${JSONLD_ATTR}]`).forEach(el => el.remove());
  if (!items || items.length === 0) return;
  items.forEach(item => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(JSONLD_ATTR, '1');
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
}

// ─── <Seo> component ────────────────────────────────────────────────────────

interface SeoProps {
  title: string;
  description?: string;
  path?: string;              // e.g. "/shop/123" — used for canonical + og:url
  image?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  jsonLd?: object | object[];
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path}`;

    document.title = fullTitle;
    setMetaByName('description', description);
    setMetaByName('robots', noindex ? 'noindex,nofollow' : 'index,follow');
    setLink('canonical', url);

    setMetaByProperty('og:site_name', SITE_NAME);
    setMetaByProperty('og:title', fullTitle);
    setMetaByProperty('og:description', description);
    setMetaByProperty('og:type', type === 'product' ? 'product' : type === 'article' ? 'article' : 'website');
    setMetaByProperty('og:url', url);
    setMetaByProperty('og:image', image);

    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', fullTitle);
    setMetaByName('twitter:description', description);
    setMetaByName('twitter:image', image);

    const items = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : undefined;
    setJsonLd(items);

    return () => {
      // Clear structured data on unmount so it doesn't leak into the next page
      // before that page's own Seo effect runs.
      document.querySelectorAll(`script[${JSONLD_ATTR}]`).forEach(el => el.remove());
    };
  }, [title, description, path, image, type, noindex, jsonLd]);

  return null;
}

// ─── JSON-LD builders ───────────────────────────────────────────────────────

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: BUSINESS.name,
    image: DEFAULT_OG_IMAGE,
    url: SITE_URL,
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    priceRange: 'KES',
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressCountry: BUSINESS.addressCountry,
    },
    sameAs: BUSINESS.sameAs,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function productJsonLd(product: {
  id: number | string;
  name: string;
  description?: string | null;
  price: string | number;
  images?: string[] | null;
  brand?: string | null;
  stock?: number;
  average_rating?: string | number;
  rating_count?: string | number;
}) {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || DEFAULT_DESCRIPTION,
    image: product.images && product.images.length > 0 ? product.images : [DEFAULT_OG_IMAGE],
    sku: String(product.id),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/shop/${product.id}`,
      priceCurrency: 'KES',
      price: String(product.price),
      availability:
        product.stock === undefined || product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };
  const ratingCount = Number(product.rating_count || 0);
  if (ratingCount > 0) {
    json.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(product.average_rating || 0),
      reviewCount: String(ratingCount),
    };
  }
  return json;
}

export function serviceJsonLd(service: {
  id: number | string;
  slug: string;
  name: string;
  description?: string | null;
  base_price: number | string;
  images?: string[] | null;
  average_rating?: string | number;
  rating_count?: string | number;
}) {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.name,
    name: service.name,
    description: service.description || DEFAULT_DESCRIPTION,
    image: service.images && service.images.length > 0 ? service.images : [DEFAULT_OG_IMAGE],
    url: `${SITE_URL}/services/${service.slug}`,
    provider: {
      '@type': 'BeautySalon',
      name: BUSINESS.name,
      telephone: BUSINESS.telephone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS.streetAddress,
        addressLocality: BUSINESS.addressLocality,
        addressCountry: BUSINESS.addressCountry,
      },
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/services/${service.slug}`,
      priceCurrency: 'KES',
      price: String(service.base_price),
    },
  };
  const ratingCount = Number(service.rating_count || 0);
  if (ratingCount > 0) {
    json.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(service.average_rating || 0),
      reviewCount: String(ratingCount),
    };
  }
  return json;
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
