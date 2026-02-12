import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  //  output: 'standalone',

  // Añade esta configuración para permitir imágenes de YouTube
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'www.dailymotion.com',
        port: '',
        pathname: '/thumbnail/video/**',
      },
    ],
  },


 experimental: {
    proxyClientMaxBodySize: '100mb',
  },

};

export default nextConfig;