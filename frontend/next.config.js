/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://projeto_novo_backend_1:3001/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig 