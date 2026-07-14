/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  webpack: (config) => {
    // react-konva/konva only need the "canvas" package for server-side
    // rendering, which we don't use (Customizer is loaded with ssr:false).
    // Without this alias, webpack fails trying to bundle the native module.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;
