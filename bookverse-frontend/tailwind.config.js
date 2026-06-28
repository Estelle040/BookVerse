/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Книжные/библиотечные цвета
                parchment: {
                    50: '#fdf8f0',
                    100: '#f9efdd',
                    200: '#f3deba',
                    300: '#ebc88c',
                    400: '#e2ad5c',
                    500: '#d9953a',
                    600: '#c47b2f',
                    700: '#a36128',
                    800: '#854e26',
                    900: '#6d4123',
                },
                library: {
                    50: '#f7f5f0',
                    100: '#e8e2d4',
                    200: '#d4c9b2',
                    300: '#bfae8b',
                    400: '#a8946b',
                    500: '#8b7355',
                    600: '#6b5744',
                    700: '#54433a',
                    800: '#3d3130',
                    900: '#2c2425',
                },
                ink: {
                    50: '#f4f3f1',
                    100: '#e4e1db',
                    200: '#cbc4b9',
                    300: '#aea18f',
                    400: '#96856f',
                    500: '#87745f',
                    600: '#735e50',
                    700: '#5d4a42',
                    800: '#4d3d3a',
                    900: '#3a2f2e',
                }
            },
            fontFamily: {
                'display': ['Playfair Display', 'serif'],
                'body': ['Inter', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'fade-in': 'fadeIn 0.8s ease-out forwards',
                'glow': 'glow 2s ease-in-out infinite',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'book-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c9b2' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
                'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.15)',
                'book': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                'book-hover': '0 14px 28px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.12)',
            },
        },
    },
    plugins: [],
}