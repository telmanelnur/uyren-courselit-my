const remotePatterns = [
    { protocol: "https", hostname: "**" }
];
  
/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@workspace/ui", "@workspace/icons", "@workspace/components-library"],
    images: { remotePatterns },
    i18n: {
        locales: ["en", "ru", "kz"],
        defaultLocale: "en",
        localeDetection: false,
    },
    turbopack: {
        rules: {
            '*.svg': {
              loaders: ['@svgr/webpack'],
              as: '*.js',
            },
          }, 
    }
};

export default nextConfig;