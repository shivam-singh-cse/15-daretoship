import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        mist: "#f8fafc",
        peach: "#fff3e9",
        mint: "#e8fff8",
        sky: "#e9f3ff",
      },
      boxShadow: {
        glow: "0 18px 45px rgba(30, 41, 59, 0.08)",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top left, rgba(255, 214, 186, 0.9), transparent 35%), radial-gradient(circle at top right, rgba(191, 219, 254, 0.8), transparent 30%), linear-gradient(180deg, #fffdf8 0%, #f8fbff 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        confetti: {
          "0%": { transform: "translateY(-12vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "100%": { transform: "translateY(120vh) rotate(540deg)", opacity: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.7s ease forwards",
        confetti: "confetti linear infinite",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
