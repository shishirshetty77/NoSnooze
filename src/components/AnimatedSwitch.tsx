import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { ANIMATIONS, SHADOWS } from '../constants';

interface AnimatedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  hapticFeedback?: boolean;
  gradient?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedSwitch: React.FC<AnimatedSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  hapticFeedback = true,
  gradient = true,
}) => {
  const { theme } = useTheme();
  const translateX = useSharedValue(value ? 1 : 0);
  const scale = useSharedValue(1);
  const thumbScale = useSharedValue(1);

  const dimensions = (() => {
    switch (size) {
      case 'small':
        return { width: 36, height: 20, thumbSize: 16 };
      case 'large':
        return { width: 60, height: 34, thumbSize: 28 };
      default:
        return { width: 48, height: 28, thumbSize: 24 };
    }
  })();

  const padding = (dimensions.height - dimensions.thumbSize) / 2;
  const translateDistance = dimensions.width - dimensions.thumbSize - padding * 2;

  useEffect(() => {
    translateX.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [value, translateX]);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [0, 1],
      [theme.colors.borderLight, theme.colors.primary]
    );

    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value * translateDistance },
        { scale: thumbScale.value }
      ],
    };
  });

  const gradientColors = value 
    ? (theme.colors.primaryGradient as readonly [string, string])
    : ([theme.colors.borderLight, theme.colors.border] as const);

  const handlePress = () => {
    if (disabled) return;

    if (hapticFeedback) {
      runOnJS(Haptics.impactAsync)(
        value ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
      );
    }

    // Animation feedback
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    thumbScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      thumbScale.value = withSpring(1, { damping: 12, stiffness: 150 });
    }, 100);

    onValueChange(!value);
  };

  if (gradient) {
    return (
      <AnimatedPressable onPress={handlePress} disabled={disabled}>
        <Animated.View
          style={[
            {
              width: dimensions.width,
              height: dimensions.height,
              borderRadius: dimensions.height / 2,
              padding,
              justifyContent: 'center',
              opacity: disabled ? 0.5 : 1,
            },
            trackAnimatedStyle,
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: dimensions.height / 2,
            }}
          />
          <Animated.View
            style={[
              {
                width: dimensions.thumbSize,
                height: dimensions.thumbSize,
                borderRadius: dimensions.thumbSize / 2,
                backgroundColor: '#FFFFFF',
                ...SHADOWS.md,
              },
              thumbAnimatedStyle,
            ]}
          />
        </Animated.View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[
          {
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: dimensions.height / 2,
            padding,
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1,
          },
          trackAnimatedStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: dimensions.thumbSize,
              height: dimensions.thumbSize,
              borderRadius: dimensions.thumbSize / 2,
              backgroundColor: '#FFFFFF',
              ...SHADOWS.md,
            },
            thumbAnimatedStyle,
          ]}
        />
      </Animated.View>
    </AnimatedPressable>
  );
};
