/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],  // ← This line is REQUIRED for NativeWind v4

  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',          // Covers your src/app routes
    './src/components/**/*.{js,jsx,ts,tsx}',   // If you have components folder
    './app/**/*.{js,jsx,ts,tsx}',              // In case of any leftover root app/
    // Add any other folders where you use className=""
  ],

  theme: {
    extend: {
      // Add custom colors/fonts/etc. here if needed
    },
  },

  plugins: [],
};