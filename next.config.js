/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Disable trailing slash redirect to prevent OAuth callback issues
  trailingSlash: false,
  // Skip URL normalization that can cause 307 redirects
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
