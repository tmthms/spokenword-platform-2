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
    'bg-purple-500',
    'bg-purple-600',
    'bg-purple-700',
    'bg-purple-800',
    'text-purple-500',
    'text-purple-600',
    'text-purple-700',
    'text-purple-800',
    'border-purple-200',
    'border-purple-500',
    'border-purple-700',
    'hover:bg-purple-50',
    'hover:bg-purple-700',
    'hover:bg-purple-800',
    'hover:text-purple-600',
    'hover:text-purple-800',
    // Green colors (badges)
    'bg-green-50',
    'bg-green-100',
    'text-green-700',
    'border-green-200',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
