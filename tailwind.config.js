/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            screens: {
                tablet: "813px",
            },
            colors: {
                primary: "#7871FE",
                secondary: "#4C2EFF",
                customBlack: "#1E1E1E",
            },
            keyframes: {
                "bounce-subtle": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                },
            },
            animation: {
                "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};
