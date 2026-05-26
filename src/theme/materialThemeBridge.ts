import type { CSSProperties } from "react";
import { theme } from "../../materialTheme";

export const materialSchemes = {
  light: theme.light.default,
  dark: theme.dark.default,
};

export type MaterialMode = keyof typeof materialSchemes;

export function schemeToCssVars(mode: MaterialMode = "light") {
  const scheme = materialSchemes[mode];

  return {
    "--md-primary": scheme.primary,
    "--md-on-primary": scheme.onPrimary,
    "--md-primary-container": scheme.primaryContainer,
    "--md-on-primary-container": scheme.onPrimaryContainer,
    "--md-secondary": scheme.secondary,
    "--md-on-secondary": scheme.onSecondary,
    "--md-secondary-container": scheme.secondaryContainer,
    "--md-on-secondary-container": scheme.onSecondaryContainer,
    "--md-tertiary": scheme.tertiary,
    "--md-on-tertiary": scheme.onTertiary,
    "--md-tertiary-container": scheme.tertiaryContainer,
    "--md-on-tertiary-container": scheme.onTertiaryContainer,
    "--md-error": scheme.error,
    "--md-on-error": scheme.onError,
    "--md-error-container": scheme.errorContainer,
    "--md-on-error-container": scheme.onErrorContainer,
    "--md-background": scheme.background,
    "--md-on-background": scheme.onBackground,
    "--md-surface": scheme.surface,
    "--md-on-surface": scheme.onSurface,
    "--md-surface-variant": scheme.surfaceVariant,
    "--md-on-surface-variant": scheme.onSurfaceVariant,
    "--md-surface-container-lowest": scheme.surfaceContainerLowest,
    "--md-surface-container-low": scheme.surfaceContainerLow,
    "--md-surface-container": scheme.surfaceContainer,
    "--md-surface-container-high": scheme.surfaceContainerHigh,
    "--md-surface-container-highest": scheme.surfaceContainerHighest,
    "--md-outline": scheme.outline,
    "--md-outline-variant": scheme.outlineVariant,
    "--md-inverse-surface": scheme.inverseSurface,
    "--md-inverse-on-surface": scheme.inverseOnSurface,
  } as CSSProperties;
}
