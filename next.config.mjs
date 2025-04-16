import { join } from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:uuid/:filename',
        destination: '/uploads/:uuid/:filename',
      },
    ]
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default nextConfig
