import { MetadataRoute } from 'next';
import { getVehicles } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://brothersmultimarcas.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/veiculos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/politica-de-privacidade`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Páginas de veículos ativos
  let vehiclePages: MetadataRoute.Sitemap = [];
  try {
    const result = await getVehicles({ status: 'available', limit: 1000 });
    if (Array.isArray(result.data)) {
      vehiclePages = result.data.map((vehicle) => ({
        url: `${siteUrl}/veiculos/${vehicle.id}`,
        lastModified: vehicle.updatedAt ? new Date(vehicle.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch {
    // Se falhar, retorna só as páginas estáticas
  }

  return [...staticPages, ...vehiclePages];
}
