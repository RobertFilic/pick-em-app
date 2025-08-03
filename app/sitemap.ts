// app/sitemap.ts
import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pick-em-app.vercel.app' // Update to your domain

  try {
    // Get competitions for dynamic URLs
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
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]

    // Dynamic competition pages
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