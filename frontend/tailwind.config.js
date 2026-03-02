/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'Inter', 'sans-serif'],
                display: ['Clash Display', 'Outfit', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#fffdf0',
                    100: '#fff9d6',
                    200: '#fff1ad',
                    300: '#ffe47a',
                    400: '#ffd338',
                    500: '#facc15', // Gold base
                    600: '#eab308',
                    700: '#ca8a04',
                    800: '#a16207',
                    900: '#854d0e',
                },
                accent: {
                    blue: '#00f0ff',
                    red: '#ff003c',
                    green: '#39ff14',
                },
                dark: {
                    900: '#050505',
                    800: '#0a0a0a',
                    700: '#141414',
                    600: '#1e1e1e',
                    500: '#2d2d2d'
                }
            },
            animation: {
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'blob': 'blob 7s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 10px rgba(250, 204, 21, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(250, 204, 21, 0.6), 0 0 30px rgba(250, 204, 21, 0.4)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' }
                }
            }
        },
    },
    plugins: [],
}
