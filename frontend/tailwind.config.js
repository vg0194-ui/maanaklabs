/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#115c3d",
          blue: "#1f6da8",
          mist: "#eef4f2",
          ink: "#18323b",
        },
      },
      fontFamily: {
        display: ["'Manrope'", "ui-sans-serif", "system-ui"],
        body: ["'DM Sans'", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top left, rgba(27, 111, 167, 0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(17, 92, 61, 0.24), transparent 30%), linear-gradient(135deg, #f7fbfa 0%, #eef4f2 48%, #ffffff 100%)",
      },
    },
  },
  plugins: [],
};

