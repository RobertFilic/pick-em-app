import { NextResponse } from 'next/server'

const BASE_URL = 'https://playpredix.com'

type Post = {
  slug: string
}

export async function GET() {
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/posts`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY!,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Supabase fetch failed: ${response.status} ${response.statusText}`)
    }

    const posts = (await response.json()) as Post[]

    const staticPages = ['', 'about', 'contact'].map((page) => `${BASE_URL}/${page}`)

    const dynamicPages = posts.map((post) => `${BASE_URL}/posts/${post.slug}`)

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
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
