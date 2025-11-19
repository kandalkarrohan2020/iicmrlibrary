const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // React-specific content paths
  theme: {
    extend: {}, // Extend default Tailwind configurations if needed
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        /* Hide X-axis scrollbar */
        ".scrollbar-x-hidden": {
          "overflow-x": "hidden", /* Hides horizontal scrollbar */
        },
        ".scrollbar-y-hidden": {
          "overflow-y": "hidden", /* Hides horizontal scrollbar */
        },
        ".scrollbar-x-hide::-webkit-scrollbar": {
          display: "None",
        },
        ".scrollbar-y-hide::-webkit-scrollbar": {
          display: "None",
        },
        ".scrollbar-y-visible": {
          "overflow-y": "scroll", /* Ensures vertical scrollbar is visible */
          "scrollbar-width": "thin", /* Thin scrollbar for Firefox */
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "None",
        },
        ".scrollbar-y-visible::-webkit-scrollbar": {
          width: "6px", /* Y-axis scrollbar width */
        },
        ".scrollbar-y-visible::-webkit-scrollbar-thumb": {
          background: "rgba(0, 0, 0, 0.2)", /* Thumb color */
          "border-radius": "4px", /* Rounded corners */
        },
        ".scrollbar-y-visible::-webkit-scrollbar-track": {
          background: "transparent", /* Track color */
        },
        ".scrollbar-y-visible::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0, 0, 0, 0.4)", /* Thumb hover effect */
        },
      });
    }),
  ],
};