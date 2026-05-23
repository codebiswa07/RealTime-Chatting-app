/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        base:    "#0d0e14",
        surface: "#13141c",
        elevated:"#1a1b26",
        hover:   "#20212e",
        active:  "#252636",
        border:  "#2a2b3d",
        accent:  {
          DEFAULT: "#5b5bd6",
          hover:   "#6e6ee0",
          dim:     "rgba(91,91,214,0.18)",
          dim2:    "rgba(91,91,214,0.08)",
        },
        tx: {
          primary:   "#e8e8f0",
          secondary: "#8b8cad",
          muted:     "#4e4f6e",
        },
        online: "#22c55e",
        away:   "#eab308",
        busy:   "#ef4444",
      },
      animation: {
        "fade-up":  "fadeUp 0.3s ease both",
        "slide-in": "slideIn 0.2s ease both",
        "notif-in": "notifIn 0.3s ease both",
        "blink":    "blink 1.2s infinite",
        "pulse-soft":"pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:    { from:{ opacity:0, transform:"translateY(8px)" }, to:{ opacity:1, transform:"translateY(0)" } },
        slideIn:   { from:{ opacity:0, transform:"translateX(-8px)" }, to:{ opacity:1, transform:"translateX(0)" } },
        notifIn:   { from:{ opacity:0, transform:"translateX(120%)" }, to:{ opacity:1, transform:"translateX(0)" } },
        blink:     { "0%,80%,100%":{ opacity:0 }, "40%":{ opacity:1 } },
        pulseSoft: { "0%,100%":{ opacity:1 }, "50%":{ opacity:0.4 } },
      },
      boxShadow: {
        glow:  "0 0 40px rgba(91,91,214,0.15)",
        card:  "0 4px 24px rgba(0,0,0,0.4)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};
