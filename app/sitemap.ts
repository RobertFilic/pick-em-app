// app/sitemap.ts
import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.playpredix.com'

  try {
    // Get competitions for public pages
    const { data: competitions } = await supabase
      .from('competitions')
      .select('id, updated_at')

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${baseUrl}/signup`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]

    // Public competition pages
    const competitionPages: MetadataRoute.Sitemap = competitions?.map((comp) => ({
      url: `${baseUrl}/competitions/${comp.id}`,
      lastModified: comp.updated_at ? new Date(comp.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

    return [...staticPages, ...competitionPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback to just static pages
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}