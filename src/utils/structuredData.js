// src/utils/structuredData.js
// Generate JSON-LD structured data for SEO pages.

const SITE_URL = 'https://mooma.online';
const SITE_NAME = 'mooma.online';
const LOGO_URL = `${SITE_URL}/og-default-v2.png`;

function absoluteUrl(pathOrUrl = '') {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

function listItemFromProduct(product, position) {
  return {
    '@type': 'ListItem',
    position,
    url: absoluteUrl(`/products/${product.slug}`),
    name: product.title,
    image: product.image,
  };
}

/**
 * @param {Object} opts
 * @param {string} opts.title - Page title (H1)
 * @param {string} opts.description - Meta description
 * @param {string} opts.url - Full canonical URL
 * @param {string} opts.image - Primary product image URL
 * @param {string} opts.datePublished - ISO date (e.g. "2026-05-21")
 * @param {string} opts.dateModified - ISO date
 * @param {string} [opts.authorName] - Author name
 * @param {Object} [opts.product] - Product facts for Product schema (no price/offer data)
 * @param {Object[]} opts.faqs - [{question: string, answer: string}]
 * @param {Object[]} opts.breadcrumbs - [{name: string, url: string}]
 * @returns {Object} JSON-LD object ready to stringify
 */
export function productArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = SITE_NAME,
  product,
  faqs = [],
  breadcrumbs = [],
}) {
  const schemas = [];

  // 1. Article schema (BlogPosting for review articles)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  });

  // 2. Product schema without fake price/offer/rating claims.
  // We intentionally avoid AggregateRating unless a verified source is stored.
  if (product) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name || title,
      description: product.description || description,
      image: product.image || image,
      category: product.category,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      url,
      sameAs: product.sameAs,
      review: {
        '@type': 'Review',
        name: title,
        reviewBody: description,
        author: {
          '@type': 'Organization',
          name: authorName,
          url: SITE_URL,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
        datePublished,
      },
    });
  }

  // 3. FAQ schema (if FAQs exist)
  if (faqs.length > 0) {
    schemas.push({
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
    });
  }

  // 4. BreadcrumbList schema
  if (breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }

  // Return as @graph if multiple, or single object
  if (schemas.length === 1) return schemas[0];
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}

/**
 * Organization + WebSite schema for homepage and global identity.
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: LOGO_URL,
        description: 'รีวิวสินค้าสัตว์เลี้ยง อุปกรณ์สัตว์เลี้ยง อาหารสุนัข อาหารแมว — เลือกซื้ออย่างมั่นใจ',
        foundingDate: '2026',
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: 'th-TH',
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
      },
    ],
  };
}

/**
 * Homepage schema: Organization/WebSite + featured product ItemList.
 */
export function homePageSchema(products = []) {
  const base = organizationSchema()['@graph'];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...base,
      {
        '@type': 'ItemList',
        name: 'สินค้าแนะนำ mooma.online',
        itemListElement: products.map((product, index) => listItemFromProduct(product, index + 1)),
      },
    ],
  };
}

/**
 * Category or review listing page schema.
 */
export function itemListSchema({ name, description, url, products = [], breadcrumbs = [] }) {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name,
      description,
      url,
      inLanguage: 'th-TH',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
      },
      mainEntity: {
        '@type': 'ItemList',
        name,
        itemListElement: products.map((product, index) => listItemFromProduct(product, index + 1)),
      },
    },
  ];

  if (breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }

  return schemas.length === 1 ? schemas[0] : { '@context': 'https://schema.org', '@graph': schemas };
}
