/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  serverExternalPackages: ["maplibre-gl"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/welcome",
        destination: "/pvg",
        permanent: true,
      },
      {
        source: "/bienvenidos",
        destination: "/pvg",
        permanent: true,
      },
      {
        source: "/bienvenidas",
        destination: "/pvg",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
