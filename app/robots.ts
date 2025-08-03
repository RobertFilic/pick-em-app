// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.playpredix.com'
  const isProduction = process.env.NODE_ENV === 'production' && 
                      process.env.VERCEL_ENV === 'production'

  if (isProduction) {
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/api/',
            '/leagues/*/manage',
            '/admin/',
          ],
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  } else {
    // Staging/development - block all crawlers
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }
}