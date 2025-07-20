import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Alarm, DayOfWeek, DismissMethod } from '../types';
import { Button } from '../components/Button';
import { storageService } from '../services/storageService';
import { generateId } from '../utils';
import {
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  SOUNDS,
  DAY_LABELS,
} from '../constants';

interface EditAlarmScreenProps {
  navigation: any;
  route: any;
}

export const EditAlarmScreen: React.FC<EditAlarmScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { alarm } = route.params || {};
  const isEditing = !!alarm;

  const [time, setTime] = useState(alarm?.time || new Date());
  const [label, setLabel] = useState(alarm?.label || '');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(alarm?.repeatDays || []);
  const [sound, setSound] = useState(alarm?.sound || SOUNDS[0]);
  const [dismissMethod, setDismissMethod] = useState<DismissMethod>(
    alarm?.dismissMethod || DismissMethod.BUTTON
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleRepeatDay = (day: DayOfWeek) => {
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
    }
  };

  const handleSave = async () => {
    if (!time) {
      Alert.alert('Error', 'Please set a time for the alarm');
      return;
    }

    setSaving(true);
    try {
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
        await storageService.updateAlarm(alarmData);
      } else {
        await storageService.addAlarm(alarmData);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving alarm:', error);
      Alert.alert('Error', 'Failed to save alarm');
    } finally {
      setSaving(false);
    }
  };

  const renderDayButtons = () => (
    <View style={styles.repeatSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Repeat</Text>
      <View style={styles.dayButtons}>
        {DAY_LABELS.map((dayLabel: string, index: number) => {
          const isSelected = repeatDays.includes(index);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                {
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => toggleRepeatDay(index)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.colors.text,
                    fontWeight: isSelected ? FONT_WEIGHTS.medium : FONT_WEIGHTS.regular,
                  },
                ]}
              >
                {dayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: FONT_WEIGHTS.bold,
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: SPACING.md,
    },
    timeSection: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
      marginBottom: SPACING.lg,
    },
    timeDisplay: {
      fontSize: 48,
      fontWeight: FONT_WEIGHTS.bold,
      color: theme.colors.primary,
      marginBottom: SPACING.md,
    },
    timeButton: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timeButtonText: {
      color: theme.colors.text,
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.medium,
    },
    section: {
      marginBottom: SPACING.lg,
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.semibold,
      marginBottom: SPACING.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      fontSize: FONT_SIZES.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    repeatSection: {
      marginBottom: SPACING.lg,
    },
    dayButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
    },
    dayButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    dayButtonText: {
      fontSize: FONT_SIZES.sm,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionButtonText: {
      fontSize: FONT_SIZES.md,
      color: theme.colors.text,
    },
    optionButtonValue: {
      fontSize: FONT_SIZES.md,
      color: theme.colors.textSecondary,
    },
    dismissMethodSection: {
      marginBottom: SPACING.lg,
    },
    dismissOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
    },
    dismissOptionText: {
      fontSize: FONT_SIZES.md,
      color: theme.colors.text,
      marginLeft: SPACING.sm,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: SPACING.lg,
      width: '80%',
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.semibold,
      color: theme.colors.text,
      marginBottom: SPACING.md,
      textAlign: 'center',
    },
    soundOption: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 8,
      marginBottom: SPACING.xs,
    },
    soundOptionText: {
      fontSize: FONT_SIZES.md,
      color: theme.colors.text,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: SPACING.lg,
    },
    saveButton: {
      margin: SPACING.md,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Alarm' : 'New Alarm'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.timeSection}>
          <Text style={styles.timeDisplay}>
            {time.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeButtonText}>Change Time</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Label</Text>
          <TextInput
            style={styles.input}
            placeholder="Alarm name"
            placeholderTextColor={theme.colors.placeholder}
            value={label}
            onChangeText={setLabel}
            maxLength={50}
          />
        </View>

        {renderDayButtons()}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sound</Text>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setShowSoundPicker(true)}
          >
            <Text style={styles.optionButtonText}>Alarm Sound</Text>
            <Text style={styles.optionButtonValue}>{sound}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dismissMethodSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Dismiss Method
          </Text>
          <TouchableOpacity
            style={styles.dismissOption}
            onPress={() => setDismissMethod(DismissMethod.BUTTON)}
          >
            <Ionicons
              name={dismissMethod === DismissMethod.BUTTON ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.dismissOptionText}>Button Press</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissOption}
            onPress={() => setDismissMethod(DismissMethod.MATH)}
          >
            <Ionicons
              name={dismissMethod === DismissMethod.MATH ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.dismissOptionText}>Math Problem</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Button
        title={isEditing ? 'Update Alarm' : 'Save Alarm'}
        onPress={handleSave}
        loading={saving}
        size="large"
        style={styles.saveButton}
      />

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}

      <Modal visible={showSoundPicker} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Sound</Text>
            <ScrollView>
              {SOUNDS.map((soundOption: string) => (
                <TouchableOpacity
                  key={soundOption}
                  style={[
                    styles.soundOption,
                    {
                      backgroundColor:
                        sound === soundOption ? theme.colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => setSound(soundOption)}
                >
                  <Text
                    style={[
                      styles.soundOptionText,
                      {
                        color: sound === soundOption ? '#FFFFFF' : theme.colors.text,
                      },
                    ]}
                  >
                    {soundOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowSoundPicker(false)}
              />
              <Button
                title="Done"
                onPress={() => setShowSoundPicker(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
