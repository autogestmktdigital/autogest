import { MetadataRoute } from 'next';
import { getVehicles } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://brothersmultimarcas.com';

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/veiculos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Páginas de veículos ativos
  let vehiclePages: MetadataRoute.Sitemap = [];
  try {
    const result = await getVehicles({ status: 'available', limit: 1000 });
    if (Array.isArray(result.data)) {
      vehiclePages = result.data.map((vehicle) => ({
        url: `${baseUrl}/veiculos/${vehicle.id}`,
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
