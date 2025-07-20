import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { formatDuration } from '../utils';
import { SPACING, FONT_SIZES, FONT_WEIGHTS, NAP_PRESETS } from '../constants';

export const NapTimerScreen: React.FC = () => {
  const { theme } = useTheme();
  const [duration, setDuration] = useState(20); // in minutes
  const [remaining, setRemaining] = useState(20); // in minutes
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 0.017) { // approximately 1 second in minutes
            setIsActive(false);
            setIsPaused(false);
            Alert.alert('Nap Timer', 'Time\'s up! Hope you had a good nap!', [
              { text: 'OK', onPress: handleReset }
            ]);
            return 0;
          }
          return prev - 0.017; // subtract ~1 second
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    if (remaining <= 0) {
      setRemaining(duration);
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setRemaining(duration);
  };

  const handlePresetSelect = (minutes: number) => {
    if (!isActive) {
      setDuration(minutes);
      setRemaining(minutes);
    }
  };

  const formatTime = (minutes: number): string => {
    const totalSeconds = Math.ceil(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((duration - remaining) / duration) * 100;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
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
    timerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.xl,
    },
    timerCircle: {
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 8,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.xl,
      position: 'relative',
    },
    progressCircle: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 8,
      borderColor: 'transparent',
    },
    timerDisplay: {
      fontSize: 48,
      fontWeight: FONT_WEIGHTS.bold,
      color: theme.colors.primary,
    },
    timerLabel: {
      fontSize: FONT_SIZES.md,
      color: theme.colors.textSecondary,
      marginTop: SPACING.xs,
    },
    controlsSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    controlButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    resetButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.textSecondary,
    },
    presetsSection: {
      marginTop: SPACING.lg,
    },
    presetsTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.semibold,
      color: theme.colors.text,
      marginBottom: SPACING.md,
      textAlign: 'center',
    },
    presetsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      gap: SPACING.sm,
    },
    presetButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 80,
      alignItems: 'center',
    },
    activePresetButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    presetButtonText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.medium,
      color: theme.colors.text,
    },
    activePresetButtonText: {
      color: '#FFFFFF',
    },
    statusSection: {
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    statusText: {
      fontSize: FONT_SIZES.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    activeStatusText: {
      color: theme.colors.primary,
      fontWeight: FONT_WEIGHTS.medium,
    },
  });

  const renderProgressCircle = () => {
    const percentage = getProgressPercentage();
    const circumference = 2 * Math.PI * 112; // radius = 120 - borderWidth/2
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    return (
      <View style={styles.timerCircle}>
        {/* Progress indicator would go here with SVG or similar */}
        <View>
          <Text style={styles.timerDisplay}>{formatTime(remaining)}</Text>
          <Text style={styles.timerLabel}>
            {isActive ? (isPaused ? 'Paused' : 'Running') : 'Ready'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nap Timer</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <Text style={[
            styles.statusText,
            isActive && styles.activeStatusText
          ]}>
            {isActive 
              ? (isPaused ? 'Timer Paused' : 'Timer Running')
              : 'Select duration and start timer'
            }
          </Text>
        </View>

        <View style={styles.timerSection}>
          {renderProgressCircle()}
          
          <View style={styles.controlsSection}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              disabled={!isActive && remaining === duration}
            >
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={isActive ? handlePause : handleStart}
            >
              <Ionicons 
                name={isActive ? (isPaused ? 'play' : 'pause') : 'play'} 
                size={28} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>Quick Select</Text>
          <View style={styles.presetsGrid}>
            {NAP_PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.value}
                style={[
                  styles.presetButton,
                  duration === preset.value && styles.activePresetButton,
                ]}
                onPress={() => handlePresetSelect(preset.value)}
                disabled={isActive}
              >
                <Text style={[
                  styles.presetButtonText,
                  duration === preset.value && styles.activePresetButtonText,
                ]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
