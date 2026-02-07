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
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                // Taxi Fleet Theme
                taxi: {
                    black: '#0A0A0A',
                    dark: '#121212',
                    surface: '#1A1A1A',
                    border: '#2A2A2A',
                    yellow: {
                        DEFAULT: '#FDB813',
                        light: '#FFCE3D',
                        dark: '#D99F0B',
                        glow: '#FFD700',
                    },
                },
                // Legacy support
                background: '#0A0A0A',
                surface: '#1A1A1A',
                primary: '#FDB813',
                secondary: '#2A2A2A',
                gold: '#FFD700',
                silver: '#E0E0E0',
                bronze: '#CD7F32',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(253, 184, 19, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(253, 184, 19, 0.6), 0 0 60px rgba(253, 184, 19, 0.3)' },
                }
            }
        },
    },
    plugins: [],
}
