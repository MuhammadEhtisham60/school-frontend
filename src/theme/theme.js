import { getButtonStyles } from "./overridebutton";

export const theme = {
  palette: {
    primary: {
      main: "oklch(0.52 0.22 280)",
      light: "oklch(0.7 0.2 310)", // primary-glow
      contrastText: "oklch(0.99 0 0)",
    },
    secondary: {
      main: "oklch(0.96 0.015 270)",
      contrastText: "oklch(0.22 0.04 265)",
    },
    success: {
      main: "oklch(0.65 0.16 155)",
      contrastText: "oklch(0.99 0 0)",
    },
    error: {
      main: "oklch(0.6 0.23 25)",
      contrastText: "oklch(0.99 0 0)",
    },
    warning: {
      main: "oklch(0.78 0.16 75)",
      contrastText: "oklch(0.2 0.04 75)",
    },
    info: {
      main: "oklch(0.65 0.15 235)",
      contrastText: "oklch(0.99 0 0)",
    },
    background: {
      default: "oklch(0.985 0.005 270)",
      paper: "oklch(1 0 0)",
    },
    text: {
      primary: "oklch(0.18 0.04 265)",
      secondary: "oklch(0.5 0.03 265)", // muted-foreground
    },
    divider: "oklch(0.92 0.012 270)",
    grey: {
      50: "oklch(0.99 0.005 270)",
      100: "oklch(0.965 0.012 270)",
      200: "oklch(0.92 0.012 270)",
      300: "oklch(0.85 0.02 270)",
      400: "oklch(0.7 0.02 270)",
      500: "oklch(0.5 0.03 265)",
      600: "oklch(0.35 0.03 265)",
      700: "oklch(0.25 0.04 265)",
      800: "oklch(0.18 0.04 265)",
      900: "oklch(0.1 0.04 265)",
    },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", sans-serif',
    h1: { fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.2 },
    h2: { fontSize: "1.875rem", fontWeight: 800, lineHeight: 1.25 },
    h3: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.35 },
    h5: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.5 },
    body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.57 },
    caption: { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.66 },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: {
      xs: "calc(0.875rem - 6px)", // 8px
      sm: "calc(0.875rem - 4px)", // 10px
      md: "calc(0.875rem - 2px)", // 12px
      lg: "0.875rem", // 14px
      xl: "calc(0.875rem + 4px)", // 18px
      xxl: "calc(0.875rem + 8px)", // 22px
      xxxl: "calc(0.875rem + 12px)", // 26px
    },
  },
  shadows: {
    sm: "0 1px 2px 0 oklch(0.2 0.05 280 / 0.05)",
    md: "0 4px 12px -2px oklch(0.2 0.05 280 / 0.08)",
    lg: "0 10px 30px -8px oklch(0.2 0.05 280 / 0.12)",
    glow: "0 8px 32px -4px oklch(0.55 0.22 280 / 0.35)",
    card: "0 1px 3px oklch(0.2 0.05 280 / 0.04), 0 8px 24px -8px oklch(0.2 0.05 280 / 0.08)",
  },
  spacing: (factor) => `${factor * 0.25}rem`, // 4px baseline
  breakpoints: {
    mobile: "320px",
    tablet: "640px",
    laptop: "1024px",
    desktop: "1280px",
  },
  components: {
    button: {
      getButtonStyles,
    },
  },
};
