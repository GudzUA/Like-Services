/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["i.ibb.co"],
  },
  // experimental.serverActions більше не потрібен у сучасному Next.js
  output: "standalone",
};

module.exports = nextConfig;
