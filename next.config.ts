import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  output: "standalone" as const,
  outputFileTracingIncludes: {
    "/api/admin/reindex": ["./src/content/**/*"],
  },
};

export default withNextIntl(nextConfig);