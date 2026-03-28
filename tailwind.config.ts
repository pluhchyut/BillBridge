import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Libre Baskerville", "Georgia", "serif"],
        sans:  ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        navy:  "#0F1F3D",
        slate: "#1E3458",
        civic: "#3B6FD4",
        gold:  "#C9973E",
        cream: "#FBF7F0",
        frost: "#EBF3FA",
        mist:  "#C8DDEF",
      },
    },
  },
  plugins: [],
};

export default config;
