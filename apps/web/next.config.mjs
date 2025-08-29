
const remotePatterns = [
  {
    protocol: "https",
    hostname: "**",
  },
];


/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/icons", "@workspace/components-library"],


  images: {
    remotePatterns,
  },

  i18n: {
    defaultLocale: 'en-US',
    locales: ['en-US', 'ru', 'kz'],
    localeDetection: false
  },
}

export default nextConfig
