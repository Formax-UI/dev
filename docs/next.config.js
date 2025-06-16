/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ['formax-ui'],
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  output: 'export',
}

module.exports = nextConfig 