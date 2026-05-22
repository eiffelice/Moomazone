// src/utils/structuredData.js
// Generate JSON-LD structured data for product review pages

/**
 * @param {Object} opts
 * @param {string} opts.title - Page title (H1)
 * @param {string} opts.description - Meta description
 * @param {string} opts.url - Full canonical URL
 * @param {string} opts.image - Primary product image URL
 * @param {string} opts.datePublished - ISO date (e.g. "2026-05-21")
 * @param {string} opts.dateModified - ISO date
 * @param {string} [opts.authorName] - Author name
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
  authorName = 'mooma.online',
  faqs = [],
  breadcrumbs = [],
}) {
  const schemas = [];

  // 1. Article schema (BlogPosting for review articles)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: image,
    url: url,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: 'https://mooma.online',
    },
    publisher: {
      '@type': 'Organization',
      name: 'mooma.online',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mooma.online/og-default.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  });

  // 2. FAQ schema (if FAQs exist)
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

  // 3. BreadcrumbList schema
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
 * Organization schema for homepage
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'mooma.online',
    url: 'https://mooma.online',
    description: 'รีวิวสินค้าสัตว์เลี้ยง อุปกรณ์สัตว์เลี้ยง อาหารสุนัข อาหารแมว — เลือกซื้ออย่างมั่นใจ',
    foundingDate: '2026',
    sameAs: [],
  };
}
