export const COLORS = {
  light: {
    primary: '#007AFF',
    primaryGradient: ['#007AFF', '#0056CC'],
    secondary: '#5856D6',
    secondaryGradient: ['#5856D6', '#4A47B8'],
    success: '#34C759',
    successGradient: ['#34C759', '#28A745'],
    warning: '#FF9500',
    warningGradient: ['#FF9500', '#E68500'],
    danger: '#FF3B30',
    dangerGradient: ['#FF3B30', '#E63946'],
    info: '#5AC8FA',
    background: '#FAFAFA',
    backgroundGradient: ['#FFFFFF', '#F8F9FA'],
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    card: '#FFFFFF',
    cardGradient: ['#FFFFFF', '#FDFDFD'],
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    placeholder: '#9CA3AF',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    primary: '#0A84FF',
    primaryGradient: ['#0A84FF', '#0066CC'],
    secondary: '#5E5CE6',
    secondaryGradient: ['#5E5CE6', '#4A47C8'],
    success: '#30D158',
    successGradient: ['#30D158', '#28B946'],
    warning: '#FF9F0A',
    warningGradient: ['#FF9F0A', '#E68A00'],
    danger: '#FF453A',
    dangerGradient: ['#FF453A', '#E63946'],
    info: '#64D2FF',
    background: '#000000',
    backgroundGradient: ['#000000', '#0A0A0A'],
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    card: '#1C1C1E',
    cardGradient: ['#1C1C1E', '#242426'],
    text: '#FFFFFF',
    textSecondary: '#A1A1A6',
    textTertiary: '#6D6D80',
    border: '#38383A',
    borderLight: '#2C2C2E',
    placeholder: '#6D6D80',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// 8px grid system
export const SPACING = {
  xs: 4,    // 0.5 units
  sm: 8,    // 1 unit
  md: 16,   // 2 units
  lg: 24,   // 3 units
  xl: 32,   // 4 units
  xxl: 40,  // 5 units
  xxxl: 48, // 6 units
  xxxxl: 56, // 7 units
  xxxxxl: 64, // 8 units
};

// Enhanced typography scale
export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  xxxxl: 34,
  xxxxxl: 41,
  xxxxxxl: 48,
};

// Advanced font weights for premium typography
export const FONT_WEIGHTS = {
  thin: '100' as const,
  ultraLight: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
};

// Animation constants
export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'spring',
  },
};

// Shadow presets for depth
export const SHADOWS = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Border radius for consistent roundedness
export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 9999,
};

export const SOUNDS = [
  'Default',
  'Classic',
  'Gentle',
  'Loud',
  'Nature',
];

export const NAP_PRESETS = [
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

export const STORAGE_KEYS = {
  ALARMS: '@alarms',
  SETTINGS: '@settings',
  SLEEP_RECORDS: '@sleepRecords',
};

export const DAY_LABELS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];
