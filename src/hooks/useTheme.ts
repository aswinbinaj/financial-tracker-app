import { useFinanceStore } from '../store/useFinanceStore';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';

export const useTheme = () => {
  const darkMode = useFinanceStore((state) => state.settings.darkMode);
  const theme = darkMode ? 'dark' : 'light';
  
  return {
    darkMode,
    theme,
    colors: COLORS[theme],
    shadows: SHADOWS[theme],
    spacing: SPACING,
    sizes: SIZES,
    glowShadow: SHADOWS.glow,
  };
};
export type Theme = ReturnType<typeof useTheme>;
