/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.js",
    "./src/**/*.js"
  ],
  safelist: [
    // Purple colors (design system)
    'bg-purple-50',
    'bg-purple-100',
    'bg-purple-200',
    'bg-purple-300',
    'bg-purple-400',
    'bg-purple-500',
    'bg-purple-600',
    'bg-purple-700',
    'bg-purple-800',
    'text-purple-300',
    'text-purple-400',
    'text-purple-500',
    'text-purple-600',
    'text-purple-700',
    'text-purple-800',
    'border-purple-200',
    'border-purple-500',
    'border-purple-700',
    'hover:bg-purple-50',
    'hover:bg-purple-500',
    'hover:bg-purple-700',
    'hover:bg-purple-800',
    'hover:text-purple-600',
    'hover:text-purple-800',
    'hover:text-white',
    // Green colors (badges)
    'bg-green-50',
    'bg-green-100',
    'bg-green-600',
    'text-green-700',
    'border-green-200',
    // Pink colors
    'bg-pink-500',
    // Gray dark mode colors
    'bg-gray-50',
    'bg-gray-100',
    'bg-gray-200',
    'bg-gray-600',
    'bg-gray-700',
    'bg-gray-800',
    'bg-gray-900',
    'bg-gray-950',
    'text-gray-200',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'border-gray-700',
    'border-gray-800',
    'hover:bg-gray-700',
    'hover:bg-gray-800',
    // Blue colors
    'bg-blue-600',
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.snap-x': {
          'scroll-snap-type': 'x mandatory',
        },
        '.snap-mandatory': {
          'scroll-snap-type': 'x mandatory',
        },
        '.snap-start': {
          'scroll-snap-align': 'start',
        }
      })
    }
  ],
}
