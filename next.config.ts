import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons", "@supabase/supabase-js"],
    /** 管理后台封面上传（默认 10MB 会导致大图 invalid_form） */
    middlewareClientMaxBodySize: "30mb",
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/.next/**",
          "**/.tmp*",
          "**/*.tmp",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
