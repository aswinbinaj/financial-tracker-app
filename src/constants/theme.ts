import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Dynamic viewport indicators
export const isSmallDevice = SCREEN_WIDTH < 375; // e.g. iPhone SE/mini
export const isTablet = SCREEN_WIDTH >= 768;

// Responsive Scaling functions
export const scaleFont = (size: number): number => {
  if (isSmallDevice) {
    return Math.round(size * 0.88); // shrink font sizes by 12% on narrow devices
  }
  if (isTablet) {
    return Math.round(size * 1.08); // scale up on tablets
  }
  return size;
};

export const scaleSpacing = (size: number): number => {
  if (isSmallDevice) {
    return Math.round(size * 0.8); // decrease margins/padding by 20% on small devices
  }
  return size;
};

export const COLORS = {
  light: {
    primary: '#059669', // Emerald Green brand color
    secondary: '#10B981', // Mint Green accent
    background: '#F8FAFC', // Crisp white slate
    surface: '#FFFFFF',
    text: '#090D16', // Dark slate black
    textSecondary: '#64748B', // Cool grey
    border: '#E2E8F0',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    info: '#2563EB',
    cardBg: '#FFFFFF',
    overlay: 'rgba(9, 13, 22, 0.4)',
    accent: '#34D399',
  },
  dark: {
    primary: '#10B981', // Glowing Mint Emerald
    secondary: '#34D399',
    background: '#08090A', // Pure obsidian black
    surface: '#111214', // Sleek charcoal card surface
    text: '#F8FAFC', // Slate 50
    textSecondary: '#8A8F98', // Soft neutral grey
    border: '#1B1C1E', // Very dark border to blend in
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    cardBg: '#111214',
    overlay: 'rgba(0, 0, 0, 0.7)',
    accent: '#059669',
  },
};

export const SPACING = {
  xs: scaleSpacing(4),
  sm: scaleSpacing(8),
  md: scaleSpacing(16),
  lg: scaleSpacing(24),
  xl: scaleSpacing(32),
  xxl: scaleSpacing(40),
};

export const SIZES = {
  h1: scaleFont(26),
  h2: scaleFont(22),
  h3: scaleFont(19),
  h4: scaleFont(16),
  bodyLarge: scaleFont(15),
  bodyMedium: scaleFont(13.5),
  bodySmall: scaleFont(11.5),
  caption: scaleFont(10),
};

export const SHADOWS = {
  light: {
    shadowColor: '#090D16',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  glow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  }
};
