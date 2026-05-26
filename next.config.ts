import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
    /** 管理后台封面上传（默认 10MB 会导致大图 invalid_form） */
    middlewareClientMaxBodySize: "30mb",
  },
};

export default nextConfig;
