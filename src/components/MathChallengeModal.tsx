import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Vibration,
  Alert,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { AnimatedButton } from './AnimatedButton';
import { FeatherIcon } from './FeatherIcon';
import { generateMathProblem } from '../utils';
import { 
  SPACING, 
  FONT_SIZES, 
  FONT_WEIGHTS, 
  BORDER_RADIUS, 
  SHADOWS, 
  ANIMATIONS 
} from '../constants';

interface MathChallengeModalProps {
  visible: boolean;
  onDismiss: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  alarmLabel?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const MathChallengeModal: React.FC<MathChallengeModalProps> = ({
  visible,
  onDismiss,
  difficulty = 'easy',
  alarmLabel = 'Alarm',
}) => {
  const { theme } = useTheme();
  const [mathProblem, setMathProblem] = useState(generateMathProblem());
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const scale = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      
      // Auto-focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);

      // Start pulse animation for urgency
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(0, { duration: ANIMATIONS.duration.normal });
      pulseScale.value = withTiming(1);
    }
  }, [visible, scale, pulseScale]);

  useEffect(() => {
    if (isShaking) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withRepeat(
          withSequence(
            withTiming(10, { duration: 100 }),
            withTiming(-10, { duration: 100 })
          ),
          3,
          true
        ),
        withTiming(0, { duration: 50 })
      );
      
      setTimeout(() => setIsShaking(false), 600);
    }
  }, [isShaking, shakeX]);

  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: shakeX.value }
      ],
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const handleSubmit = async () => {
    const answer = parseInt(userAnswer);
    
    if (isNaN(answer)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsShaking(true);
      return;
    }

    if (answer === mathProblem.answer) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scale.value = withTiming(0, { duration: ANIMATIONS.duration.normal });
      setTimeout(() => {
        onDismiss();
        resetModal();
      }, ANIMATIONS.duration.normal);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setIsShaking(true);
      setUserAnswer('');
      
      if (newAttempts >= 3) {
        // Generate new problem after 3 wrong attempts
        setMathProblem(generateMathProblem());
        setAttempts(0);
      }
      
      // Vibration for wrong answer
      Vibration.vibrate([0, 200, 100, 200]);
    }
  };

  const resetModal = () => {
    setMathProblem(generateMathProblem());
    setUserAnswer('');
    setAttempts(0);
    setIsShaking(false);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'hard':
        return theme.colors.danger;
      default:
        return theme.colors.primary;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {}} // Prevent back button dismissal
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={{ flex: 1 }}>
        <BlurView
          intensity={80}
          tint={theme.isDark ? 'dark' : 'light'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.3)',
            'rgba(0, 0, 0, 0.6)',
            'rgba(0, 0, 0, 0.8)',
          ]}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SPACING.xl,
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%', alignItems: 'center' }}
          >
            <Animated.View style={[containerAnimatedStyle]}>
              <Animated.View
                style={[
                  modalAnimatedStyle,
                  {
                    backgroundColor: theme.colors.card,
                    borderRadius: BORDER_RADIUS.xxl,
                    padding: SPACING.xxxl,
                    width: screenWidth - SPACING.xxxxl,
                    maxWidth: 400,
                    alignItems: 'center',
                    ...SHADOWS.xl,
                  },
                ]}
              >
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
                  <FeatherIcon
                    name="clock"
                    size={48}
                    color={getDifficultyColor()}
                    animated
                    pulse
                  />
                  <Text
                    style={{
                      fontSize: FONT_SIZES.xl,
                      fontWeight: FONT_WEIGHTS.bold,
                      color: theme.colors.text,
                      textAlign: 'center',
                      marginTop: SPACING.md,
                    }}
                  >
                    {alarmLabel}
                  </Text>
                  <Text
                    style={{
                      fontSize: FONT_SIZES.md,
                      fontWeight: FONT_WEIGHTS.medium,
                      color: theme.colors.textSecondary,
                      textAlign: 'center',
                      marginTop: SPACING.xs,
                    }}
                  >
                    Solve to dismiss
                  </Text>
                </View>

                {/* Math Problem */}
                <View
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: BORDER_RADIUS.lg,
                    padding: SPACING.xl,
                    marginBottom: SPACING.xl,
                    width: '100%',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: getDifficultyColor(),
                  }}
                >
                  <Text
                    style={{
                      fontSize: FONT_SIZES.xxxxl,
                      fontWeight: FONT_WEIGHTS.bold,
                      color: theme.colors.text,
                      textAlign: 'center',
                      marginBottom: SPACING.md,
                    }}
                  >
                    {mathProblem.question}
                  </Text>
                </View>

                {/* Answer Input */}
                <TextInput
                  ref={inputRef}
                  style={{
                    width: '100%',
                    height: 60,
                    borderWidth: 2,
                    borderColor: theme.colors.border,
                    borderRadius: BORDER_RADIUS.lg,
                    paddingHorizontal: SPACING.lg,
                    fontSize: FONT_SIZES.xxl,
                    fontWeight: FONT_WEIGHTS.semibold,
                    textAlign: 'center',
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    marginBottom: SPACING.lg,
                  }}
                  placeholder="Your answer"
                  placeholderTextColor={theme.colors.placeholder}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  autoFocus
                  selectTextOnFocus
                />

                {/* Attempts indicator */}
                {attempts > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: SPACING.lg,
                    }}
                  >
                    <FeatherIcon
                      name="alert-circle"
                      size={16}
                      color={theme.colors.danger}
                    />
                    <Text
                      style={{
                        fontSize: FONT_SIZES.sm,
                        color: theme.colors.danger,
                        marginLeft: SPACING.xs,
                      }}
                    >
                      {attempts} incorrect attempt{attempts > 1 ? 's' : ''}
                      {attempts >= 3 ? ' - New problem generated' : ''}
                    </Text>
                  </View>
                )}

                {/* Submit Button */}
                <AnimatedButton
                  title="Dismiss Alarm"
                  onPress={handleSubmit}
                  variant="primary"
                  size="large"
                  gradient
                  icon={
                    <FeatherIcon
                      name="check"
                      size={20}
                      color="#FFFFFF"
                    />
                  }
                  style={{ width: '100%' }}
                  disabled={!userAnswer}
                />

                {/* Help Text */}
                <Text
                  style={{
                    fontSize: FONT_SIZES.xs,
                    color: theme.colors.textTertiary,
                    textAlign: 'center',
                    marginTop: SPACING.lg,
                    lineHeight: 16,
                  }}
                >
                  After 3 incorrect attempts, a new problem will be generated
                </Text>
              </Animated.View>
            </Animated.View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </Modal>
  );
};
