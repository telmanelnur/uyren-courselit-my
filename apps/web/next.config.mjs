
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


    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/i,
        use: ["@svgr/webpack"],
      });
  
      return config;
    },
  
    experimental: {
      appDir: true,
      turbo: {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js'
          }
        },
      },
    },
}

export default nextConfig
