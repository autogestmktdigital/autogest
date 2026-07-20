import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://brothersmultimarcas.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/api', '/_next', '/404'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
