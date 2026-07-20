import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/api', '/_next', '/404'],
    },
    sitemap: 'https://brothersmultimarcas.com/sitemap.xml',
  };
}
