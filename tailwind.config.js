/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./app/**/*.{js,ts,jsx,tsx,mdx}",
	  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./components/**/*.{js,ts,jsx,tsx,mdx}",
	  "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}"
	],
	darkMode: 'class', // Add this line for class-based dark mode
	theme: {
	  extend: {},
	},
	plugins: [],
  }