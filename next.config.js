/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  images: { domains: ['res.cloudinary.com', 'cdn.shopify.com'] },
};

module.exports = nextConfig;
