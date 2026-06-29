/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  transpilePackages: ['formax-ui'],
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: 'out',
  basePath: '',
  assetPrefix: '',
}

module.exports = nextConfig
