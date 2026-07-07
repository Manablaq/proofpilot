import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#030712",
        panel: "rgba(15, 23, 42, 0.62)",
        line: "rgba(148, 163, 184, 0.22)",
      },
      boxShadow: {
        glow: "0 0 80px rgba(34, 211, 238, 0.16)",
        glass: "0 20px 80px rgba(2, 6, 23, 0.35)",
      },
      backgroundImage: {
        grid:
          "linear-gradient(rgba(148,163,184,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.09) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
