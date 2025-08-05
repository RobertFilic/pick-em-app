import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔧 MIDDLEWARE: Starting for path:', request.nextUrl.pathname)
  console.log('🔧 MIDDLEWARE: Request method:', request.method)
  console.log('🔧 MIDDLEWARE: Headers:', Object.fromEntries(request.headers.entries()))

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)?.value
          console.log('🔧 MIDDLEWARE: Getting cookie', name, ':', cookie ? 'EXISTS' : 'NOT_FOUND')
          return cookie
        },
        set(name: string, value: string, options) {
          console.log('🔧 MIDDLEWARE: Setting cookie', name, ':', value ? 'HAS_VALUE' : 'EMPTY')
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          console.log('🔧 MIDDLEWARE: Removing cookie', name)
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  console.log('🔧 MIDDLEWARE: Getting user...')
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    console.error('🔧 MIDDLEWARE: Error getting user:', userError)
  }
  
  console.log('🔧 MIDDLEWARE: User result:', user ? `User ID: ${user.id}` : 'No user')

  // Protect the /admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔧 MIDDLEWARE: Admin route detected')
    
    if (!user) {
      console.log('🔧 MIDDLEWARE: No user, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('🔧 MIDDLEWARE: Checking admin status for user:', user.id)
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .limit(1)

    console.log('🔧 MIDDLEWARE: Profile query result:', { 
      profile, 
      error: profileError,
      profileLength: profile?.length 
    })

    // Handle the response as an array and add error handling
    const isAdmin = profile && profile.length > 0 ? profile[0].is_admin : false;
    console.log('🔧 MIDDLEWARE: Is admin:', isAdmin)

    if (profileError) {
      console.error('🔧 MIDDLEWARE: Profile error:', profileError)
    }

    if (profileError || !isAdmin) {
      console.log('🔧 MIDDLEWARE: Not admin or error, redirecting to homepage')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  console.log('🔧 MIDDLEWARE: Completed successfully for:', request.nextUrl.pathname)
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}