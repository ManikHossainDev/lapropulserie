/** @type {import('next').NextConfig} */
const nextConfig = {
  // Smaller production image for Docker / EC2
  output: 'standalone',
  // Allow Sobhoy tunnel + LAN IP in dev (required for CSS/JS + HMR over tunnel)
  allowedDevOrigins: [
    'mohaimin8002.sobhoy.com',
    'mohaimin8006.sobhoy.com',
    '*.sobhoy.com',
    '10.10.5.76',
    'localhost',
  ],
};

export default nextConfig;
