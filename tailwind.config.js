/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#006633", // BUK Green
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFFFFF", // BUK White
          foreground: "#006633",
        },
      },
    },
  },
  plugins: [],
};
