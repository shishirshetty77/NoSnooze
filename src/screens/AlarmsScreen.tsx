import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { Alarm, DayOfWeek } from '../types';
import { storageService } from '../services/storageService';
import { formatTime, getDayName, generateId } from '../utils';
import { SPACING, FONT_SIZES, FONT_WEIGHTS, DAY_LABELS } from '../constants';

interface AlarmsScreenProps {
  navigation: any;
}

export const AlarmsScreen: React.FC<AlarmsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlarms = async () => {
    try {
      const loadedAlarms = await storageService.getAlarms();
      setAlarms(loadedAlarms.sort((a, b) => a.time.getTime() - b.time.getTime()));
    } catch (error) {
      console.error('Error loading alarms:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  const toggleAlarm = async (alarmId: string) => {
    try {
      const alarm = alarms.find(a => a.id === alarmId);
      if (alarm) {
        const updatedAlarm = { ...alarm, isEnabled: !alarm.isEnabled };
        await storageService.updateAlarm(updatedAlarm);
        setAlarms(prev =>
          prev.map(a => (a.id === alarmId ? updatedAlarm : a))
        );
      }
    } catch (error) {
      console.error('Error toggling alarm:', error);
      Alert.alert('Error', 'Failed to toggle alarm');
    }
  };

  const deleteAlarm = async (alarmId: string) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteAlarm(alarmId);
              setAlarms(prev => prev.filter(a => a.id !== alarmId));
            } catch (error) {
              console.error('Error deleting alarm:', error);
              Alert.alert('Error', 'Failed to delete alarm');
            }
          },
        },
      ]
    );
  };

  const createNewAlarm = () => {
    navigation.navigate('EditAlarm', { alarm: undefined });
  };

  const editAlarm = (alarm: Alarm) => {
    navigation.navigate('EditAlarm', { alarm });
  };

  const renderRepeatDays = (repeatDays: DayOfWeek[]) => {
    if (repeatDays.length === 0) {
      return 'Once';
    }
    if (repeatDays.length === 7) {
      return 'Every day';
    }
    return repeatDays
      .sort((a, b) => a - b)
      .map(day => DAY_LABELS[day])
      .join(', ');
  };

  const renderAlarmItem = ({ item }: { item: Alarm }) => (
    <TouchableOpacity
      style={[styles.alarmItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={() => editAlarm(item)}
      activeOpacity={0.7}
    >
      <View style={styles.alarmContent}>
        <View style={styles.alarmInfo}>
          <Text style={[styles.alarmTime, { color: theme.colors.text }]}>
            {formatTime(item.time)}
          </Text>
          <Text style={[styles.alarmLabel, { color: theme.colors.textSecondary }]}>
            {item.label || 'Alarm'}
          </Text>
          <Text style={[styles.alarmRepeat, { color: theme.colors.textSecondary }]}>
            {renderRepeatDays(item.repeatDays)}
          </Text>
        </View>
        <View style={styles.alarmControls}>
          <Switch
            value={item.isEnabled}
            onValueChange={() => toggleAlarm(item.id)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={item.isEnabled ? '#FFFFFF' : theme.colors.placeholder}
            style={styles.alarmSwitch}
          />
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.colors.danger }]}
            onPress={() => deleteAlarm(item.id)}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="alarm-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Alarms</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Add your first alarm to get started
      </Text>
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
    alarmItem: {
      borderRadius: 12,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    alarmContent: {
      flexDirection: 'row',
      padding: SPACING.md,
      alignItems: 'center',
    },
    alarmInfo: {
      flex: 1,
    },
    alarmTime: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: FONT_WEIGHTS.bold,
      marginBottom: SPACING.xs,
    },
    alarmLabel: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.medium,
      marginBottom: SPACING.xs,
    },
    alarmRepeat: {
      fontSize: FONT_SIZES.sm,
    },
    alarmControls: {
      alignItems: 'center',
      gap: SPACING.sm,
    },
    alarmSwitch: {
      transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    },
    deleteButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.xl,
    },
    emptyTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: FONT_WEIGHTS.bold,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    emptySubtitle: {
      fontSize: FONT_SIZES.md,
      textAlign: 'center',
      marginBottom: SPACING.xl,
    },
    addButton: {
      margin: SPACING.md,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alarms</Text>
        <TouchableOpacity onPress={createNewAlarm}>
          <Ionicons name="add" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Loading...</Text>
          </View>
        ) : alarms.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={alarms}
            renderItem={renderAlarmItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: SPACING.xl }}
          />
        )}
      </View>

      <Button
        title="Add Alarm"
        onPress={createNewAlarm}
        size="large"
        style={styles.addButton}
      />
    </View>
  );
};
