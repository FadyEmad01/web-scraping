/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["archiver", "puppeteer-core", "@sparticuz/chromium"],
  },
};

export default nextConfig;
