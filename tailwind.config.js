/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#7871FE",
                secondary: "#4C2EFF",
                customBlack: "#1E1E1E",
            },
        },
    },
    plugins: [],
};
