/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{tsx,html}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Atlassian Neutrals
        N0: "#FFFFFF", N10: "#FAFBFC", N20: "#F4F5F7", N30: "#EBECF0", N40: "#DFE1E6", 
        N50: "#C1C7D0", N60: "#B3BAC5", N70: "#A5ADBA", N80: "#97A0AF", N90: "#8993A4", 
        N100: "#7A869A", N200: "#6B778C", N300: "#5E6C84", N400: "#505F79", N500: "#42526E", 
        N600: "#344563", N700: "#253858", N800: "#172B4D", N900: "#091E42",
        // Atlassian Dark Neutrals
        DN0: "#000000", DN10: "#0E1624", DN20: "#111D2F", DN30: "#16253B", DN40: "#202B3D", 
        DN50: "#2C3E5D", DN60: "#3B4B68", DN70: "#4A5975", DN80: "#5B6A86", DN90: "#6C7A96",
        DN100: "#7B8BA7", DN200: "#8C9CAB", DN300: "#9EB0C2", DN400: "#B1C2D4", DN500: "#C2D2E3", 
        DN600: "#D6E4F3", DN700: "#E9F2FA", DN800: "#F4F5F7", DN900: "#FFFFFF",
        // Atlassian Blues
        B50: "#E6FCFF", B75: "#B3F5FF", B100: "#4C9AFF", B200: "#2684FF", B300: "#0065FF", B400: "#0052CC", B500: "#0747A6",
        // Atlassian Greens
        G50: "#E3FCEF", G100: "#ABF5D1", G200: "#79F2C0", G300: "#57D9A3", G400: "#36B37E", G500: "#00875A",
        // Atlassian Yellows
        Y50: "#FFFAE6", Y100: "#FFF0B3", Y200: "#FFE380", Y300: "#FFC400", Y400: "#FFAB00", Y500: "#FF991F",
        // Atlassian Reds
        R50: "#FFEBE6", R100: "#FFBDAD", R200: "#FF8F73", R300: "#FF7452", R400: "#FF5630", R500: "#DE350B",
        // Atlassian Purples
        P50: "#EAE6FF", P100: "#C0B6F2", P200: "#998DD9", P300: "#8777D9", P400: "#6554C0", P500: "#5243AA",
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Noto Sans"', 'Ubuntu', '"Droid Sans"', '"Helvetica Neue"', 'sans-serif'],
      },
      boxShadow: {
        'atlassian-100': '0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
        'atlassian-200': '0 4px 8px -2px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
        'atlassian-300': '0 8px 16px -4px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
        'atlassian-400': '0 12px 24px -6px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
        'atlassian-500': '0 20px 32px -8px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
      }
    },
  },
  plugins: [],
}
