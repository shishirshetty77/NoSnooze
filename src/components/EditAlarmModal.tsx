import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useAlarmStore } from '../stores/alarmStore';
import { AnimatedButton } from './AnimatedButton';
import { AnimatedSwitch } from './AnimatedSwitch';
import { FeatherIcon } from './FeatherIcon';
import { Alarm, DayOfWeek, DismissMethod } from '../types';
import { generateId } from '../utils';
import {
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  DAY_LABELS,
  SOUNDS,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATIONS,
} from '../constants';

interface EditAlarmModalProps {
  visible: boolean;
  onClose: () => void;
  alarm?: Alarm | null;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const EditAlarmModal: React.FC<EditAlarmModalProps> = ({
  visible,
  onClose,
  alarm,
}) => {
  const { theme } = useTheme();
  const { addAlarm, updateAlarm } = useAlarmStore();
  const isEditing = !!alarm;

  // Form state
  const [time, setTime] = useState(alarm?.time || new Date());
  const [label, setLabel] = useState(alarm?.label || '');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(alarm?.repeatDays || []);
  const [sound, setSound] = useState(alarm?.sound || SOUNDS[0]);
  const [dismissMethod, setDismissMethod] = useState<DismissMethod>(
    alarm?.dismissMethod || DismissMethod.BUTTON
  );
  
  // UI state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);
  const scale = useSharedValue(0);
  const contentScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      
      // Reset form when opening with new alarm
      if (!alarm) {
        setTime(new Date());
        setLabel('');
        setRepeatDays([]);
        setSound(SOUNDS[0]);
        setDismissMethod(DismissMethod.BUTTON);
      }
    } else {
      scale.value = withTiming(0, { duration: ANIMATIONS.duration.normal });
    }
  }, [visible, alarm, scale]);

  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const toggleRepeatDay = async (day: DayOfWeek) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRepeatDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    if (!time) return;

    setSaving(true);
    
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const alarmData: Alarm = {
        id: alarm?.id || generateId(),
        time,
        label: label || 'Alarm',
        isEnabled: alarm?.isEnabled ?? true,
        repeatDays,
        sound,
        dismissMethod,
        createdAt: alarm?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (isEditing) {
        await updateAlarm(alarm.id, alarmData);
      } else {
        await addAlarm(alarmData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving alarm:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const renderTimeSection = () => (
    <Animated.View
      entering={FadeInDown.delay(100)}
      style={{
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        marginBottom: SPACING.lg,
      }}
    >
      <Text
        style={{
          fontSize: FONT_SIZES.xxxxxxl,
          fontWeight: FONT_WEIGHTS.bold,
          color: theme.colors.primary,
          marginBottom: SPACING.md,
        }}
      >
        {time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}
      </Text>
      
      <AnimatedButton
        title="Change Time"
        variant="secondary"
        onPress={() => setShowTimePicker(true)}
        icon={<FeatherIcon name="clock" size={18} />}
      />
    </Animated.View>
  );

  const renderLabelSection = () => (
    <Animated.View
      entering={FadeInDown.delay(200)}
      style={{ marginBottom: SPACING.xl }}
    >
      <Text
        style={{
          fontSize: FONT_SIZES.lg,
          fontWeight: FONT_WEIGHTS.semibold,
          color: theme.colors.text,
          marginBottom: SPACING.md,
        }}
      >
        Label
      </Text>
      
      <TextInput
        ref={inputRef}
        style={{
          borderWidth: 2,
          borderColor: activeSection === 'label' ? theme.colors.primary : theme.colors.border,
          borderRadius: BORDER_RADIUS.lg,
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          fontSize: FONT_SIZES.md,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
          ...SHADOWS.sm,
        }}
        placeholder="Alarm name"
        placeholderTextColor={theme.colors.placeholder}
        value={label}
        onChangeText={setLabel}
        maxLength={50}
        onFocus={() => setActiveSection('label')}
        onBlur={() => setActiveSection(null)}
      />
    </Animated.View>
  );

  const renderRepeatSection = () => (
    <Animated.View
      entering={FadeInDown.delay(300)}
      style={{ marginBottom: SPACING.xl }}
    >
      <Text
        style={{
          fontSize: FONT_SIZES.lg,
          fontWeight: FONT_WEIGHTS.semibold,
          color: theme.colors.text,
          marginBottom: SPACING.md,
        }}
      >
        Repeat
      </Text>
      
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: SPACING.sm,
        }}
      >
        {DAY_LABELS.map((dayLabel, index) => {
          const isSelected = repeatDays.includes(index);
          return (
            <TouchableOpacity
              key={index}
              style={{
                width: 44,
                height: 44,
                borderRadius: BORDER_RADIUS.round,
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                borderWidth: 2,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                ...SHADOWS.sm,
              }}
              onPress={() => toggleRepeatDay(index)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: isSelected ? '#FFFFFF' : theme.colors.text,
                }}
              >
                {dayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderSoundSection = () => (
    <Animated.View
      entering={FadeInDown.delay(400)}
      style={{ marginBottom: SPACING.xl }}
    >
      <Text
        style={{
          fontSize: FONT_SIZES.lg,
          fontWeight: FONT_WEIGHTS.semibold,
          color: theme.colors.text,
          marginBottom: SPACING.md,
        }}
      >
        Sound
      </Text>
      
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          backgroundColor: theme.colors.surface,
          borderRadius: BORDER_RADIUS.lg,
          borderWidth: 2,
          borderColor: theme.colors.border,
          ...SHADOWS.sm,
        }}
        onPress={() => setShowSoundPicker(true)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FeatherIcon name="volume-2" size={20} color={theme.colors.primary} />
          <Text
            style={{
              fontSize: FONT_SIZES.md,
              color: theme.colors.text,
              marginLeft: SPACING.md,
            }}
          >
            {sound}
          </Text>
        </View>
        <FeatherIcon name="chevron-right" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderDismissMethodSection = () => (
    <Animated.View
      entering={FadeInDown.delay(500)}
      style={{ marginBottom: SPACING.xl }}
    >
      <Text
        style={{
          fontSize: FONT_SIZES.lg,
          fontWeight: FONT_WEIGHTS.semibold,
          color: theme.colors.text,
          marginBottom: SPACING.md,
        }}
      >
        Dismiss Method
      </Text>
      
      <View style={{ gap: SPACING.md }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
            backgroundColor: dismissMethod === DismissMethod.BUTTON ? theme.colors.primary + '20' : theme.colors.surface,
            borderRadius: BORDER_RADIUS.lg,
            borderWidth: 2,
            borderColor: dismissMethod === DismissMethod.BUTTON ? theme.colors.primary : theme.colors.border,
          }}
          onPress={() => setDismissMethod(DismissMethod.BUTTON)}
          activeOpacity={0.7}
        >
          <FeatherIcon 
            name="square" 
            size={20} 
            color={dismissMethod === DismissMethod.BUTTON ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={{
              fontSize: FONT_SIZES.md,
              color: theme.colors.text,
              marginLeft: SPACING.md,
              flex: 1,
            }}
          >
            Button Press
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              color: theme.colors.textSecondary,
            }}
          >
            Simple tap to dismiss
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
            backgroundColor: dismissMethod === DismissMethod.MATH ? theme.colors.primary + '20' : theme.colors.surface,
            borderRadius: BORDER_RADIUS.lg,
            borderWidth: 2,
            borderColor: dismissMethod === DismissMethod.MATH ? theme.colors.primary : theme.colors.border,
          }}
          onPress={() => setDismissMethod(DismissMethod.MATH)}
          activeOpacity={0.7}
        >
          <FeatherIcon 
            name="hash" 
            size={20} 
            color={dismissMethod === DismissMethod.MATH ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text
            style={{
              fontSize: FONT_SIZES.md,
              color: theme.colors.text,
              marginLeft: SPACING.md,
              flex: 1,
            }}
          >
            Math Problem
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              color: theme.colors.textSecondary,
            }}
          >
            Solve to dismiss
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSoundPickerModal = () => (
    <Modal visible={showSoundPicker} transparent animationType="fade">
      <BlurView intensity={50} tint={theme.isDark ? 'dark' : 'light'} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SPACING.xl,
          }}
        >
          <Animated.View
            entering={SlideInRight}
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: BORDER_RADIUS.xxl,
              padding: SPACING.xl,
              width: '100%',
              maxWidth: 320,
              ...SHADOWS.xl,
            }}
          >
            <Text
              style={{
                fontSize: FONT_SIZES.xl,
                fontWeight: FONT_WEIGHTS.bold,
                color: theme.colors.text,
                textAlign: 'center',
                marginBottom: SPACING.lg,
              }}
            >
              Select Sound
            </Text>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {SOUNDS.map((soundOption) => (
                <TouchableOpacity
                  key={soundOption}
                  style={{
                    paddingVertical: SPACING.md,
                    paddingHorizontal: SPACING.lg,
                    borderRadius: BORDER_RADIUS.md,
                    marginBottom: SPACING.xs,
                    backgroundColor: sound === soundOption ? theme.colors.primary : 'transparent',
                  }}
                  onPress={() => setSound(soundOption)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: FONT_SIZES.md,
                      color: sound === soundOption ? '#FFFFFF' : theme.colors.text,
                      fontWeight: sound === soundOption ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular,
                    }}
                  >
                    {soundOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginTop: SPACING.lg,
                gap: SPACING.md,
              }}
            >
              <AnimatedButton
                title="Cancel"
                variant="secondary"
                onPress={() => setShowSoundPicker(false)}
                style={{ flex: 1 }}
              />
              <AnimatedButton
                title="Done"
                onPress={() => setShowSoundPicker(false)}
                style={{ flex: 1 }}
              />
            </View>
          </Animated.View>
        </View>
      </BlurView>
    </Modal>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <BlurView
        intensity={80}
        tint={theme.isDark ? 'dark' : 'light'}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          <Animated.View
            style={[
              modalAnimatedStyle,
              {
                backgroundColor: theme.colors.card,
                borderTopLeftRadius: BORDER_RADIUS.xxl,
                borderTopRightRadius: BORDER_RADIUS.xxl,
                maxHeight: screenHeight * 0.9,
                ...SHADOWS.xl,
              },
            ]}
          >
            {/* Handle */}
            <View
              style={{
                alignItems: 'center',
                paddingTop: SPACING.md,
                paddingBottom: SPACING.sm,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: theme.colors.border,
                  borderRadius: 2,
                }}
              />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: SPACING.xl,
                paddingBottom: SPACING.lg,
              }}
            >
              <AnimatedButton
                title="Cancel"
                variant="ghost"
                onPress={onClose}
                disabled={saving}
              />
              
              <Text
                style={{
                  fontSize: FONT_SIZES.xl,
                  fontWeight: FONT_WEIGHTS.bold,
                  color: theme.colors.text,
                }}
              >
                {isEditing ? 'Edit Alarm' : 'New Alarm'}
              </Text>
              
              <AnimatedButton
                title="Save"
                onPress={handleSave}
                loading={saving}
                disabled={!time}
              />
            </View>

            {/* Content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: SPACING.xl,
                paddingBottom: SPACING.xl,
              }}
              showsVerticalScrollIndicator={false}
            >
              {renderTimeSection()}
              {renderLabelSection()}
              {renderRepeatSection()}
              {renderSoundSection()}
              {renderDismissMethodSection()}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </BlurView>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}

      {/* Sound Picker Modal */}
      {renderSoundPickerModal()}
    </Modal>
  );
};
