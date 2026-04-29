/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
          "on-tertiary-fixed-variant": "#005236",
          "surface-variant": "#d3e4fe",
          "on-tertiary-container": "#bdffdb",
          "surface-container-low": "#eff4ff",
          "primary-fixed": "#dbe1ff",
          "on-surface": "#0b1c30",
          "outline": "#737686",
          "tertiary-fixed-dim": "#4edea3",
          "on-primary-fixed-variant": "#003ea8",
          "error": "#ba1a1a",
          "secondary-fixed": "#ffdbca",
          "surface-tint": "#0053db",
          "on-secondary-fixed": "#341100",
          "background": "#f8f9ff",
          "tertiary-fixed": "#6ffbbe",
          "on-primary-container": "#eeefff",
          "on-primary-fixed": "#00174b",
          "on-tertiary": "#ffffff",
          "inverse-surface": "#213145",
          "tertiary-container": "#007d55",
          "surface-container-highest": "#d3e4fe",
          "on-error": "#ffffff",
          "surface-container": "#e5eeff",
          "primary": "#004ac6",
          "tertiary": "#006242",
          "on-surface-variant": "#434655",
          "surface-container-high": "#dce9ff",
          "secondary-container": "#fd761a",
          "on-background": "#0b1c30",
          "on-secondary-container": "#5c2400",
          "surface": "#f8f9ff",
          "on-tertiary-fixed": "#002113",
          "surface-container-lowest": "#ffffff",
          "primary-fixed-dim": "#b4c5ff",
          "on-secondary-fixed-variant": "#783200",
          "surface-dim": "#cbdbf5",
          "primary-container": "#2563eb",
          "error-container": "#ffdad6",
          "on-primary": "#ffffff",
          "inverse-primary": "#b4c5ff",
          "inverse-on-surface": "#eaf1ff",
          "secondary": "#9d4300",
          "outline-variant": "#c3c6d7",
          "on-secondary": "#ffffff",
          "surface-bright": "#f8f9ff",
          "secondary-fixed-dim": "#ffb690",
          "on-error-container": "#93000a"
      },
      "borderRadius": {
          "DEFAULT": "1rem",
          "lg": "2rem",
          "xl": "3rem",
          "full": "9999px"
      },
      "spacing": {
          "md": "24px",
          "gutter": "24px",
          "xs": "4px",
          "xl": "80px",
          "margin": "32px",
          "lg": "48px",
          "base": "8px",
          "sm": "12px"
      },
      "fontFamily": {
          "h3": ["Plus Jakarta Sans", "sans-serif"],
          "h1": ["Plus Jakarta Sans", "sans-serif"],
          "body-md": ["Work Sans", "sans-serif"],
          "h2": ["Plus Jakarta Sans", "sans-serif"],
          "body-lg": ["Work Sans", "sans-serif"],
          "label-sm": ["Work Sans", "sans-serif"]
      },
      "fontSize": {
          "h3": ["24px", { "lineHeight": "1.4", "letterSpacing": "0", "fontWeight": "700" }],
          "h1": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800" }],
          "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
          "h2": ["32px", { "lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "700" }],
          "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
          "label-sm": ["14px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }]
      }
    }
  },
  plugins: [forms, containerQueries],
}
