/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "am-blue": "#8bcaf9",
      },
      keyframes: {
        moveRobot: {
          "0%": { transform: "translateX(-40px)" },
          "100%": { transform: "translateX(40px)" },
        },
        sweepArm: {
          "0%": { transform: "rotate(-10deg)" },
          "100%": { transform: "rotate(25deg)" },
        },
        sweepBroom: {
          "0%": { transform: "rotate(-15deg)" },
          "100%": { transform: "rotate(15deg)" },
        },
        cleanDust: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        blink: {
          "0%, 90%, 100%": { transform: "scaleY(1)" },
          "95%": { transform: "scaleY(0.1)" },
        },
        pulseBall: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
      },
      animation: {
        "move-robot": "moveRobot 4s ease-in-out infinite alternate",
        "sweep-arm": "sweepArm 0.8s ease-in-out infinite alternate",
        "sweep-broom": "sweepBroom 0.8s ease-in-out infinite alternate",
        "clean-dust": "cleanDust 0.8s ease-in-out infinite",
        blink: "blink 3s infinite",
        "pulse-ball": "pulseBall 1.5s infinite",
      },
    },
  },
  plugins: [],
};