import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SleepRecord } from '../types';
import { storageService } from '../services/storageService';
import { formatTime, formatDate, formatDuration, isToday, isYesterday } from '../utils';
import { SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants';

export const AnalyticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSleepRecords = async () => {
    try {
      const records = await storageService.getSleepRecords();
      setSleepRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading sleep records:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSleepRecords();
    }, [])
  );

  const getWeeklyAverage = (): number => {
    const lastWeek = sleepRecords.slice(0, 7);
    if (lastWeek.length === 0) return 0;
    const total = lastWeek.reduce((sum, record) => sum + record.totalSleep, 0);
    return Math.round(total / lastWeek.length);
  };

  const getTotalSleep = (): number => {
    return sleepRecords.reduce((sum, record) => sum + record.totalSleep, 0);
  };

  const getLongestSleep = (): number => {
    if (sleepRecords.length === 0) return 0;
    return Math.max(...sleepRecords.map(record => record.totalSleep));
  };

  const getShortestSleep = (): number => {
    if (sleepRecords.length === 0) return 0;
    return Math.min(...sleepRecords.map(record => record.totalSleep));
  };

  const renderDateLabel = (date: string) => {
    const recordDate = new Date(date);
    if (isToday(recordDate)) {
      return 'Today';
    }
    if (isYesterday(recordDate)) {
      return 'Yesterday';
    }
    return formatDate(recordDate);
  };

  const renderSleepRecord = (record: SleepRecord, index: number) => (
    <View key={record.id} style={[styles.recordItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.recordHeader}>
        <Text style={[styles.recordDate, { color: theme.colors.text }]}>
          {renderDateLabel(record.date)}
        </Text>
        <Text style={[styles.recordDuration, { color: theme.colors.primary }]}>
          {formatDuration(record.totalSleep)}
        </Text>
      </View>
      <View style={styles.recordDetails}>
        <View style={styles.recordDetailItem}>
          <Ionicons name="bed-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.recordDetailText, { color: theme.colors.textSecondary }]}>
            Bedtime: {formatTime(record.bedTime)}
          </Text>
        </View>
        <View style={styles.recordDetailItem}>
          <Ionicons name="alarm-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.recordDetailText, { color: theme.colors.textSecondary }]}>
            Wake up: {formatTime(record.wakeTime)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="analytics-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {formatDuration(getWeeklyAverage())}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Weekly Average
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="time-outline" size={24} color={theme.colors.success} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {formatDuration(getTotalSleep())}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total Sleep
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="trending-up-outline" size={24} color={theme.colors.info} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {formatDuration(getLongestSleep())}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Longest Sleep
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="trending-down-outline" size={24} color={theme.colors.warning} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {formatDuration(getShortestSleep())}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Shortest Sleep
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="analytics-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Sleep Data</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Sleep data will appear here once you start using alarms
      </Text>
    </View>
  );

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
    statsSection: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.semibold,
      marginBottom: SPACING.md,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    statCard: {
      width: '48%',
      padding: SPACING.md,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    statValue: {
      fontSize: FONT_SIZES.xl,
      fontWeight: FONT_WEIGHTS.bold,
      marginTop: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      fontSize: FONT_SIZES.sm,
      textAlign: 'center',
    },
    recordsSection: {
      flex: 1,
    },
    recordItem: {
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    recordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    recordDate: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.medium,
    },
    recordDuration: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.bold,
    },
    recordDetails: {
      gap: SPACING.xs,
    },
    recordDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    recordDetailText: {
      fontSize: FONT_SIZES.sm,
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
      lineHeight: 22,
    },
    loadingText: {
      fontSize: FONT_SIZES.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.xl,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : sleepRecords.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {renderStats()}
            <View style={styles.recordsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Sleep History
              </Text>
              {sleepRecords.map((record, index) => renderSleepRecord(record, index))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};
