import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "from-[#FFB88C]",
    "via-[#FF9A6B]",
    "to-[#FF7AAE]",
    "from-orange-400",
    "via-[#FF6B6B]",
    "to-rose-500",
    "from-violet-400",
    "via-[#FF7AAE]",
    "to-[#FFC46B]",
    "from-[#FF6B6B]",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
      },
    },
  },
  plugins: [],
};

export default config;
