import React from 'react';
import {
  Pressable,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS, SHADOWS, ANIMATIONS } from '../constants';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'fab';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  icon?: React.ReactNode;
  gradient?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  hapticFeedback = true,
  icon,
  gradient = false,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 200,
    });
    opacity.value = withTiming(0.8, {
      duration: ANIMATIONS.duration.fast,
    });

    if (hapticFeedback && !disabled) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
    });
    opacity.value = withTiming(1, {
      duration: ANIMATIONS.duration.fast,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      overflow: 'hidden',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = SPACING.md;
        baseStyle.paddingVertical = SPACING.sm;
        baseStyle.minHeight = 36;
        baseStyle.borderRadius = BORDER_RADIUS.md;
        break;
      case 'large':
        baseStyle.paddingHorizontal = SPACING.xl;
        baseStyle.paddingVertical = SPACING.lg;
        baseStyle.minHeight = 54;
        baseStyle.borderRadius = BORDER_RADIUS.xl;
        break;
      case 'medium':
      default:
        baseStyle.paddingHorizontal = SPACING.lg;
        baseStyle.paddingVertical = SPACING.md;
        baseStyle.minHeight = 44;
        baseStyle.borderRadius = BORDER_RADIUS.lg;
    }

    // FAB specific styles
    if (variant === 'fab') {
      baseStyle.width = 56;
      baseStyle.height = 56;
      baseStyle.borderRadius = BORDER_RADIUS.round;
      baseStyle.paddingHorizontal = 0;
      baseStyle.paddingVertical = 0;
      baseStyle.minHeight = 56;
      baseStyle.position = 'absolute';
      baseStyle.bottom = SPACING.xl;
      baseStyle.right = SPACING.xl;
      baseStyle.zIndex = 1000;
      Object.assign(baseStyle, SHADOWS.lg);
    }

    // Variant styles
    switch (variant) {
      case 'primary':
      case 'fab':
        if (!gradient) {
          baseStyle.backgroundColor = disabled ? theme.colors.textTertiary : theme.colors.primary;
        }
        Object.assign(baseStyle, variant === 'fab' ? SHADOWS.xl : SHADOWS.md);
        break;
      case 'secondary':
        baseStyle.backgroundColor = theme.colors.surface;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.border;
        Object.assign(baseStyle, SHADOWS.sm);
        break;
      case 'danger':
        if (!gradient) {
          baseStyle.backgroundColor = disabled ? theme.colors.textTertiary : theme.colors.danger;
        }
        Object.assign(baseStyle, SHADOWS.md);
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: FONT_WEIGHTS.semibold,
      textAlign: 'center',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = FONT_SIZES.sm;
        break;
      case 'large':
        baseStyle.fontSize = FONT_SIZES.lg;
        baseStyle.fontWeight = FONT_WEIGHTS.bold;
        break;
      default:
        baseStyle.fontSize = FONT_SIZES.md;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'fab':
        baseStyle.color = '#FFFFFF';
        break;
      case 'secondary':
        baseStyle.color = theme.colors.text;
        break;
      case 'ghost':
        baseStyle.color = theme.colors.primary;
        break;
    }

    if (disabled) {
      baseStyle.color = theme.colors.textSecondary;
    }

    return baseStyle;
  };

  const shouldUseGradient = gradient && (variant === 'primary' || variant === 'danger' || variant === 'fab');
  const gradientColors = (() => {
    if (disabled) return [theme.colors.textTertiary, theme.colors.textTertiary] as const;
    switch (variant) {
      case 'primary':
      case 'fab':
        return theme.colors.primaryGradient as readonly [string, string];
      case 'danger':
        return theme.colors.dangerGradient as readonly [string, string];
      default:
        return [theme.colors.primary, theme.colors.primary] as const;
    }
  })();

  const buttonContent = (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' || variant === 'fab' ? '#FFFFFF' : theme.colors.primary}
          style={{ marginRight: title ? SPACING.sm : 0 }}
        />
      )}
      {icon && !loading && (
        <Animated.View style={{ marginRight: title ? SPACING.sm : 0 }}>
          {icon}
        </Animated.View>
      )}
      {title && (
        <Text style={[getTextStyle(), textStyle]} numberOfLines={1}>
          {title}
        </Text>
      )}
    </>
  );

  if (shouldUseGradient) {
    return (
      <AnimatedPressable
        style={[animatedStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getButtonStyle()}
        >
          {buttonContent}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[animatedStyle, getButtonStyle(), style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      {buttonContent}
    </AnimatedPressable>
  );
};
