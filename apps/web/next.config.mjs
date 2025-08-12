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
}

export default nextConfig
