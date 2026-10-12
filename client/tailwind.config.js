/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Homepage Dark Surface & Charcoal Neutrals
        navy: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#1e5675',
          700: '#14425b',
          750: '#0c2f42',
          800: '#0a2432',
          850: '#08222f',
          900: '#071c26',
          950: '#051720',
        },
        // Homepage Single Source of Truth Brand Red Accent Palette
        brand: {
          50: '#fff5f0',
          100: '#ffe8dc',
          200: '#ffd0b8',
          300: '#ffb088',
          400: '#ff8d58',
          500: '#ff6f32', // Exact homepage primary red tone
          600: '#ea580c', // Exact hover red tone
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Unified Dark Surfaces Matching Latest Homepage
        hcm: {
          bg: '#051720',        // Deepest canvas
          surface: '#071c26',   // Navbar, Sidebar, Utility bar
          card: '#08222f',      // Standard card and container
          elevated: '#0a2736',  // Hover card, elevated badge
          input: '#051822',     // Inputs, table headers, inset wells
          border: '#14425b',    // Structural dark border
          borderSubtle: '#0e3547', // Inner dividers
          hover: '#0c2f42',     // Hover surface
          red: '#ff6f32',       // Primary red accent
          redHover: '#ea580c',  // Red button hover
          redSubtle: 'rgba(255, 111, 50, 0.12)', // Red highlight tint
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.35)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(20, 66, 91, 0.3)',
        'mega': '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(20, 66, 91, 0.5)',
        'hero': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
