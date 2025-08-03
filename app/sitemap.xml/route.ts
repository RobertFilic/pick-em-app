import { NextResponse } from 'next/server'

export async function GET() {
  const BASE_URL = 'https://yourdomain.com'

  const staticPages = ['', 'about', 'contact'].map(
    (page) => `${BASE_URL}/${page}`
  )

  // Fetch dynamic content from Supabase
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/posts`, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY!,
    },
    cache: 'no-store', // optional: prevents caching
  })

  const posts = await response.json()

  const dynamicPages = posts.map((post: any) => `${BASE_URL}/posts/${post.slug}`)

  const allPages = [...staticPages, ...dynamicPages]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allPages
      .map((url) => {
        return `
      <url>
        <loc>${url}</loc>
      </url>
    `
      })
      .join('')}
  </urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
