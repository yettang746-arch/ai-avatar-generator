/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['open.bigmodel.cn'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.bigmodel.cn',
        pathname: '/api/paas/v4/images/generations/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_ZHIPU_API_KEY: process.env.NEXT_PUBLIC_ZHIPU_API_KEY,
    NEXT_PUBLIC_ZHIPU_MODEL: process.env.NEXT_PUBLIC_ZHIPU_MODEL,
  },
}

export default nextConfig
