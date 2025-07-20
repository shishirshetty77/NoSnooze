import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface FeatherIconProps {
  name: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
  style?: ViewStyle;
  animated?: boolean;
  pulse?: boolean;
  bounce?: boolean;
  rotate?: boolean;
}

export const FeatherIcon: React.FC<FeatherIconProps> = ({
  name,
  size = 24,
  color,
  style,
  animated = false,
  pulse = false,
  bounce = false,
  rotate = false,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    }

    if (bounce) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.2, { damping: 2, stiffness: 180 }),
          withSpring(1, { damping: 2, stiffness: 180 })
        ),
        -1,
        true
      );
    }

    if (rotate) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000 }),
        -1,
        false
      );
    }
  }, [pulse, bounce, rotate, scale, rotation, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
      opacity: opacity.value,
    };
  });

  const AnimatedFeather = Animated.createAnimatedComponent(Feather);

  if (animated) {
    return (
      <AnimatedFeather
        name={name}
        size={size}
        color={color || theme.colors.text}
        style={[animatedStyle, style]}
      />
    );
  }

  return (
    <Feather
      name={name}
      size={size}
      color={color || theme.colors.text}
      style={style}
    />
  );
};
