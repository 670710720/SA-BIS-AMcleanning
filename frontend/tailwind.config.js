/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ตั้งชื่อสีตามใจชอบ เช่น am-blue
        'am-blue': '#8bcaf9', 
      },
    },
  },
  plugins: [],
}
