import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ja'],
  defaultLocale: 'ja'
});

export const config = {
  matcher: ['/', '/(en|ja)/:path*']
};