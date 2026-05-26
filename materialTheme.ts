// Generated from Material Theme Builder export 2026-04-08
// Seed: #781E1B

export interface ColorScheme {
  primary: string;
  surfaceTint: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  primaryFixed: string;
  onPrimaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixedVariant: string;
  secondaryFixed: string;
  onSecondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixedVariant: string;
  tertiaryFixed: string;
  onTertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiaryFixedVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
}

export interface ColorPalette {
  "0": string;
  "5": string;
  "10": string;
  "15": string;
  "20": string;
  "25": string;
  "30": string;
  "35": string;
  "40": string;
  "50": string;
  "60": string;
  "70": string;
  "80": string;
  "90": string;
  "95": string;
  "98": string;
  "99": string;
  "100": string;
}

export interface ColorPalettes {
  primary: ColorPalette;
  secondary: ColorPalette;
  tertiary: ColorPalette;
  neutral: ColorPalette;
  neutralVariant: ColorPalette;
}

export type ContrastLevel = "default" | "medium-contrast" | "high-contrast";

export interface ThemeVariant {
  default: ColorScheme;
  "medium-contrast": ColorScheme;
  "high-contrast": ColorScheme;
}

export interface AppTheme {
  light: ThemeVariant;
  dark: ThemeVariant;
  palettes: ColorPalettes;
}

// ─── Schemes ────────────────────────────────────────────────────────────────

const lightDefault: ColorScheme = {
  primary: "#904A44",
  surfaceTint: "#904A44",
  onPrimary: "#FFFFFF",
  primaryContainer: "#FFDAD6",
  onPrimaryContainer: "#73332E",
  secondary: "#775653",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#FFDAD6",
  onSecondaryContainer: "#5D3F3C",
  tertiary: "#725B2E",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#FEDEA6",
  onTertiaryContainer: "#584419",
  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#93000A",
  background: "#FFF8F7",
  onBackground: "#231918",
  surface: "#FFF8F7",
  onSurface: "#231918",
  surfaceVariant: "#F5DDDB",
  onSurfaceVariant: "#534341",
  outline: "#857371",
  outlineVariant: "#D8C2BF",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#392E2D",
  inverseOnSurface: "#FFEDEA",
  inversePrimary: "#FFB4AC",
  primaryFixed: "#FFDAD6",
  onPrimaryFixed: "#3B0908",
  primaryFixedDim: "#FFB4AC",
  onPrimaryFixedVariant: "#73332E",
  secondaryFixed: "#FFDAD6",
  onSecondaryFixed: "#2C1513",
  secondaryFixedDim: "#E7BDB8",
  onSecondaryFixedVariant: "#5D3F3C",
  tertiaryFixed: "#FEDEA6",
  onTertiaryFixed: "#261900",
  tertiaryFixedDim: "#E0C38C",
  onTertiaryFixedVariant: "#584419",
  surfaceDim: "#E8D6D4",
  surfaceBright: "#FFF8F7",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#FFF0EF",
  surfaceContainer: "#FCEAE8",
  surfaceContainerHigh: "#F6E4E2",
  surfaceContainerHighest: "#F1DEDC",
};

const lightMediumContrast: ColorScheme = {
  primary: "#5E231F",
  surfaceTint: "#904A44",
  onPrimary: "#FFFFFF",
  primaryContainer: "#A15852",
  onPrimaryContainer: "#FFFFFF",
  secondary: "#4B2F2C",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#876561",
  onSecondaryContainer: "#FFFFFF",
  tertiary: "#463309",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#816A3B",
  onTertiaryContainer: "#FFFFFF",
  error: "#740006",
  onError: "#FFFFFF",
  errorContainer: "#CF2C27",
  onErrorContainer: "#FFFFFF",
  background: "#FFF8F7",
  onBackground: "#231918",
  surface: "#FFF8F7",
  onSurface: "#180F0E",
  surfaceVariant: "#F5DDDB",
  onSurfaceVariant: "#413331",
  outline: "#5F4F4D",
  outlineVariant: "#7B6967",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#392E2D",
  inverseOnSurface: "#FFEDEA",
  inversePrimary: "#FFB4AC",
  primaryFixed: "#A15852",
  onPrimaryFixed: "#FFFFFF",
  primaryFixedDim: "#84413B",
  onPrimaryFixedVariant: "#FFFFFF",
  secondaryFixed: "#876561",
  onSecondaryFixed: "#FFFFFF",
  secondaryFixedDim: "#6D4D4A",
  onSecondaryFixedVariant: "#FFFFFF",
  tertiaryFixed: "#816A3B",
  onTertiaryFixed: "#FFFFFF",
  tertiaryFixedDim: "#675226",
  onTertiaryFixedVariant: "#FFFFFF",
  surfaceDim: "#D4C3C1",
  surfaceBright: "#FFF8F7",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#FFF0EF",
  surfaceContainer: "#F6E4E2",
  surfaceContainerHigh: "#EBD9D7",
  surfaceContainerHighest: "#DFCECC",
};

const lightHighContrast: ColorScheme = {
  primary: "#511A16",
  surfaceTint: "#904A44",
  onPrimary: "#FFFFFF",
  primaryContainer: "#763631",
  onPrimaryContainer: "#FFFFFF",
  secondary: "#3F2523",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#60423E",
  onSecondaryContainer: "#FFFFFF",
  tertiary: "#3B2902",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#5B461B",
  onTertiaryContainer: "#FFFFFF",
  error: "#600004",
  onError: "#FFFFFF",
  errorContainer: "#98000A",
  onErrorContainer: "#FFFFFF",
  background: "#FFF8F7",
  onBackground: "#231918",
  surface: "#FFF8F7",
  onSurface: "#000000",
  surfaceVariant: "#F5DDDB",
  onSurfaceVariant: "#000000",
  outline: "#362927",
  outlineVariant: "#554544",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#392E2D",
  inverseOnSurface: "#FFFFFF",
  inversePrimary: "#FFB4AC",
  primaryFixed: "#763631",
  onPrimaryFixed: "#FFFFFF",
  primaryFixedDim: "#59201C",
  onPrimaryFixedVariant: "#FFFFFF",
  secondaryFixed: "#60423E",
  onSecondaryFixed: "#FFFFFF",
  secondaryFixedDim: "#472C29",
  onSecondaryFixedVariant: "#FFFFFF",
  tertiaryFixed: "#5B461B",
  onTertiaryFixed: "#FFFFFF",
  tertiaryFixedDim: "#423006",
  onTertiaryFixedVariant: "#FFFFFF",
  surfaceDim: "#C6B5B3",
  surfaceBright: "#FFF8F7",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#FFEDEA",
  surfaceContainer: "#F1DEDC",
  surfaceContainerHigh: "#E2D0CE",
  surfaceContainerHighest: "#D4C3C1",
};

const darkDefault: ColorScheme = {
  primary: "#FFB4AC",
  surfaceTint: "#FFB4AC",
  onPrimary: "#561E1A",
  primaryContainer: "#73332E",
  onPrimaryContainer: "#FFDAD6",
  secondary: "#E7BDB8",
  onSecondary: "#442927",
  secondaryContainer: "#5D3F3C",
  onSecondaryContainer: "#FFDAD6",
  tertiary: "#E0C38C",
  onTertiary: "#3F2D04",
  tertiaryContainer: "#584419",
  onTertiaryContainer: "#FEDEA6",
  error: "#FFB4AB",
  onError: "#690005",
  errorContainer: "#93000A",
  onErrorContainer: "#FFDAD6",
  background: "#1A1110",
  onBackground: "#F1DEDC",
  surface: "#1A1110",
  onSurface: "#F1DEDC",
  surfaceVariant: "#534341",
  onSurfaceVariant: "#D8C2BF",
  outline: "#A08C8A",
  outlineVariant: "#534341",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#F1DEDC",
  inverseOnSurface: "#392E2D",
  inversePrimary: "#904A44",
  primaryFixed: "#FFDAD6",
  onPrimaryFixed: "#3B0908",
  primaryFixedDim: "#FFB4AC",
  onPrimaryFixedVariant: "#73332E",
  secondaryFixed: "#FFDAD6",
  onSecondaryFixed: "#2C1513",
  secondaryFixedDim: "#E7BDB8",
  onSecondaryFixedVariant: "#5D3F3C",
  tertiaryFixed: "#FEDEA6",
  onTertiaryFixed: "#261900",
  tertiaryFixedDim: "#E0C38C",
  onTertiaryFixedVariant: "#584419",
  surfaceDim: "#1A1110",
  surfaceBright: "#423735",
  surfaceContainerLowest: "#140C0B",
  surfaceContainerLow: "#231918",
  surfaceContainer: "#271D1C",
  surfaceContainerHigh: "#322826",
  surfaceContainerHighest: "#3D3231",
};

const darkMediumContrast: ColorScheme = {
  primary: "#FFD2CD",
  surfaceTint: "#FFB4AC",
  onPrimary: "#481310",
  primaryContainer: "#CC7B73",
  onPrimaryContainer: "#000000",
  secondary: "#FED2CD",
  onSecondary: "#381F1C",
  secondaryContainer: "#AD8884",
  onSecondaryContainer: "#000000",
  tertiary: "#F7D8A0",
  onTertiary: "#332300",
  tertiaryContainer: "#A78D5B",
  onTertiaryContainer: "#000000",
  error: "#FFD2CC",
  onError: "#540003",
  errorContainer: "#FF5449",
  onErrorContainer: "#000000",
  background: "#1A1110",
  onBackground: "#F1DEDC",
  surface: "#1A1110",
  onSurface: "#FFFFFF",
  surfaceVariant: "#534341",
  onSurfaceVariant: "#EED7D5",
  outline: "#C2ADAB",
  outlineVariant: "#9F8C8A",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#F1DEDC",
  inverseOnSurface: "#322826",
  inversePrimary: "#74352F",
  primaryFixed: "#FFDAD6",
  onPrimaryFixed: "#2C0102",
  primaryFixedDim: "#FFB4AC",
  onPrimaryFixedVariant: "#5E231F",
  secondaryFixed: "#FFDAD6",
  onSecondaryFixed: "#200B09",
  secondaryFixedDim: "#E7BDB8",
  onSecondaryFixedVariant: "#4B2F2C",
  tertiaryFixed: "#FEDEA6",
  onTertiaryFixed: "#190F00",
  tertiaryFixedDim: "#E0C38C",
  onTertiaryFixedVariant: "#463309",
  surfaceDim: "#1A1110",
  surfaceBright: "#4D4240",
  surfaceContainerLowest: "#0D0605",
  surfaceContainerLow: "#251B1A",
  surfaceContainer: "#302524",
  surfaceContainerHigh: "#3B302F",
  surfaceContainerHighest: "#463B3A",
};

const darkHighContrast: ColorScheme = {
  primary: "#FFECE9",
  surfaceTint: "#FFB4AC",
  onPrimary: "#000000",
  primaryContainer: "#FFAEA6",
  onPrimaryContainer: "#220001",
  secondary: "#FFECE9",
  onSecondary: "#000000",
  secondaryContainer: "#E3B9B4",
  onSecondaryContainer: "#190605",
  tertiary: "#FFEED3",
  onTertiary: "#000000",
  tertiaryContainer: "#DCBF89",
  onTertiaryContainer: "#120A00",
  error: "#FFECE9",
  onError: "#000000",
  errorContainer: "#FFAEA4",
  onErrorContainer: "#220001",
  background: "#1A1110",
  onBackground: "#F1DEDC",
  surface: "#1A1110",
  onSurface: "#FFFFFF",
  surfaceVariant: "#534341",
  onSurfaceVariant: "#FFFFFF",
  outline: "#FFECE9",
  outlineVariant: "#D4BEBB",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#F1DEDC",
  inverseOnSurface: "#000000",
  inversePrimary: "#74352F",
  primaryFixed: "#FFDAD6",
  onPrimaryFixed: "#000000",
  primaryFixedDim: "#FFB4AC",
  onPrimaryFixedVariant: "#2C0102",
  secondaryFixed: "#FFDAD6",
  onSecondaryFixed: "#000000",
  secondaryFixedDim: "#E7BDB8",
  onSecondaryFixedVariant: "#200B09",
  tertiaryFixed: "#FEDEA6",
  onTertiaryFixed: "#000000",
  tertiaryFixedDim: "#E0C38C",
  onTertiaryFixedVariant: "#190F00",
  surfaceDim: "#1A1110",
  surfaceBright: "#5A4D4C",
  surfaceContainerLowest: "#000000",
  surfaceContainerLow: "#271D1C",
  surfaceContainer: "#392E2D",
  surfaceContainerHigh: "#443938",
  surfaceContainerHighest: "#504443",
};

// ─── Palettes ────────────────────────────────────────────────────────────────

const palettes: ColorPalettes = {
  primary: {
    "0": "#000000",
    "5": "#2D0001",
    "10": "#410003",
    "15": "#530205",
    "20": "#630E0E",
    "25": "#731A18",
    "30": "#822622",
    "35": "#92312C",
    "40": "#A23D36",
    "50": "#C2554D",
    "60": "#E26D64",
    "70": "#FF897F",
    "80": "#FFB4AC",
    "90": "#FFDAD6",
    "95": "#FFEDEA",
    "98": "#FFF8F7",
    "99": "#FFFBFF",
    "100": "#FFFFFF",
  },
  secondary: {
    "0": "#000000",
    "5": "#210A08",
    "10": "#2E1412",
    "15": "#3A1E1B",
    "20": "#462825",
    "25": "#533330",
    "30": "#603E3B",
    "35": "#6D4A46",
    "40": "#7A5551",
    "50": "#956D69",
    "60": "#B18782",
    "70": "#CDA19C",
    "80": "#EABBB6",
    "90": "#FFDAD6",
    "95": "#FFEDEA",
    "98": "#FFF8F7",
    "99": "#FFFBFF",
    "100": "#FFFFFF",
  },
  tertiary: {
    "0": "#000000",
    "5": "#190F00",
    "10": "#261900",
    "15": "#332300",
    "20": "#402D00",
    "25": "#4D3806",
    "30": "#5A4311",
    "35": "#664F1C",
    "40": "#735B27",
    "50": "#8E733D",
    "60": "#AA8D54",
    "70": "#C6A76C",
    "80": "#E3C284",
    "90": "#FFDEA3",
    "95": "#FFEFD6",
    "98": "#FFF8F2",
    "99": "#FFFBFF",
    "100": "#FFFFFF",
  },
  neutral: {
    "0": "#000000",
    "5": "#15100F",
    "10": "#201A19",
    "15": "#2B2423",
    "20": "#362F2E",
    "25": "#413A39",
    "30": "#4D4544",
    "35": "#59504F",
    "40": "#655C5B",
    "50": "#7F7574",
    "60": "#998E8D",
    "70": "#B4A9A7",
    "80": "#D0C4C2",
    "90": "#EDE0DE",
    "95": "#FBEEEC",
    "98": "#FFF8F7",
    "99": "#FFFBFF",
    "100": "#FFFFFF",
  },
  neutralVariant: {
    "0": "#000000",
    "5": "#190E0D",
    "10": "#251917",
    "15": "#302321",
    "20": "#3B2D2C",
    "25": "#473836",
    "30": "#534341",
    "35": "#5F4F4D",
    "40": "#6B5A59",
    "50": "#857371",
    "60": "#A08C8A",
    "70": "#BBA6A4",
    "80": "#D8C2BF",
    "90": "#F5DDDB",
    "95": "#FFEDEA",
    "98": "#FFF8F7",
    "99": "#FFFBFF",
    "100": "#FFFFFF",
  },
};

// ─── Theme export ─────────────────────────────────────────────────────────────

export const theme: AppTheme = {
  light: {
    default: lightDefault,
    "medium-contrast": lightMediumContrast,
    "high-contrast": lightHighContrast,
  },
  dark: {
    default: darkDefault,
    "medium-contrast": darkMediumContrast,
    "high-contrast": darkHighContrast,
  },
  palettes,
};

export const seed = "#781E1B";
