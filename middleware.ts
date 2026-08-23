import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_TIMEOUT_MS = 3000

/** Antwortet Supabase nicht rechtzeitig, wissen wir nichts über die Session. */
const TIMED_OUT = Symbol('auth-timeout')

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Vercel bricht die Middleware nach 25s ab (MIDDLEWARE_INVOCATION_TIMEOUT).
  // Ist Supabase nicht erreichbar, liefe getUser() genau dort hinein und jede
  // Route würde mit 504 beantwortet. Deshalb hart begrenzen.
  const user = await Promise.race([
    supabase.auth.getUser().then(({ data }) => data.user),
    new Promise<typeof TIMED_OUT>((resolve) =>
      setTimeout(() => resolve(TIMED_OUT), AUTH_TIMEOUT_MS)
    ),
  ]).catch(() => TIMED_OUT)

  const { pathname } = request.nextUrl

  // Bei Timeout ist die Session unbekannt — nicht ausloggen, sondern durchlassen.
  // Die Seiten prüfen serverseitig ohnehin selbst und leiten dann um.
  if (user === TIMED_OUT) {
    console.error(`[middleware] Supabase-Auth-Timeout nach ${AUTH_TIMEOUT_MS}ms für ${pathname}`)
    return supabaseResponse
  }

  // Protect /app, /onboarding, /settings, /tasks
  if (!user && (pathname.startsWith('/app') || pathname.startsWith('/onboarding') || pathname.startsWith('/settings') || pathname.startsWith('/tasks'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return supabaseResponse
}

export const config = {
  // /api ist bewusst ausgenommen: Route Handler sichern sich selbst ab (z.B.
  // /api/cron/keepalive per CRON_SECRET) und dürfen bei einem Supabase-Ausfall
  // nicht mit blockieren.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)',
  ],
}
