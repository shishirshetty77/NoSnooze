import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  runOnJS,
  FadeInDown,
  FadeOutUp,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { PanGestureHandler, Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useAlarmStore } from '../stores/alarmStore';
import { AnimatedButton } from '../components/AnimatedButton';
import { AnimatedSwitch } from '../components/AnimatedSwitch';
import { FeatherIcon } from '../components/FeatherIcon';
import { MathChallengeModal } from '../components/MathChallengeModal';
import { Alarm, DayOfWeek, DismissMethod } from '../types';
import { formatTime, getDayName, generateId } from '../utils';
import { 
  SPACING, 
  FONT_SIZES, 
  FONT_WEIGHTS, 
  DAY_LABELS, 
  BORDER_RADIUS, 
  SHADOWS, 
  ANIMATIONS 
} from '../constants';

interface AlarmsScreenProps {
  navigation: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AlarmItemProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onDismiss: (alarm: Alarm) => void;
  index: number;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ 
  alarm, 
  onToggle, 
  onEdit, 
  onDelete, 
  onDismiss, 
  index 
}) => {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  
  const renderRepeatDays = (repeatDays: DayOfWeek[]) => {
    if (repeatDays.length === 0) return 'Once';
    if (repeatDays.length === 7) return 'Every day';
    return repeatDays
      .sort((a, b) => a - b)
      .map(day => DAY_LABELS[day])
      .join(', ');
  };

  const renderRightAction = () => {
    return (
      <Animated.View
        style={[
          {
            backgroundColor: theme.colors.danger,
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
            borderRadius: BORDER_RADIUS.lg,
            marginBottom: SPACING.sm,
            marginLeft: SPACING.sm,
          },
        ]}
      >
        <FeatherIcon name="trash-2" size={24} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontSize: FONT_SIZES.xs, marginTop: SPACING.xs }}>
          Delete
        </Text>
      </Animated.View>
    );
  };

  const handleSwipeDelete = () => {
    onDelete(alarm.id);
  };

  const isPulsing = alarm.isEnabled;

  const pulseStyle = useAnimatedStyle(() => {
    if (isPulsing) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
    
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      exiting={FadeOutUp.springify()}
      style={pulseStyle}
    >
      <Swipeable
        renderRightActions={renderRightAction}
        onSwipeableOpen={handleSwipeDelete}
        rightThreshold={40}
      >
        <Animated.View
          style={[
            {
              backgroundColor: theme.colors.card,
              borderRadius: BORDER_RADIUS.lg,
              marginBottom: SPACING.sm,
              overflow: 'hidden',
              ...SHADOWS.md,
            },
          ]}
        >
          {alarm.isEnabled && (
            <LinearGradient
              colors={[
                `${theme.colors.primary}10`,
                `${theme.colors.primary}05`,
                'transparent'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          )}
          
          <Animated.View
            style={{
              flexDirection: 'row',
              padding: SPACING.lg,
              alignItems: 'center',
            }}
          >
            {/* Status Indicator */}
            <View style={{ marginRight: SPACING.md, alignItems: 'center' }}>
              <FeatherIcon
                name={alarm.isEnabled ? "clock" : "pause-circle"}
                size={24}
                color={alarm.isEnabled ? theme.colors.primary : theme.colors.textTertiary}
                animated={alarm.isEnabled}
                pulse={alarm.isEnabled}
              />
              {alarm.dismissMethod === DismissMethod.MATH && (
                <FeatherIcon
                  name="hash"
                  size={12}
                  color={theme.colors.textSecondary}
                  style={{ marginTop: SPACING.xs }}
                />
              )}
            </View>

            {/* Alarm Info */}
            <Animated.View style={{ flex: 1 }} onTouchEnd={() => onEdit(alarm)}>
              <Text
                style={{
                  fontSize: FONT_SIZES.xxxl,
                  fontWeight: FONT_WEIGHTS.bold,
                  color: alarm.isEnabled ? theme.colors.text : theme.colors.textSecondary,
                  marginBottom: SPACING.xs,
                }}
              >
                {formatTime(alarm.time)}
              </Text>
              
              <Text
                style={{
                  fontSize: FONT_SIZES.md,
                  fontWeight: FONT_WEIGHTS.medium,
                  color: theme.colors.textSecondary,
                  marginBottom: SPACING.xs,
                }}
              >
                {alarm.label || 'Alarm'}
              </Text>
              
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  color: theme.colors.textTertiary,
                }}
              >
                {renderRepeatDays(alarm.repeatDays)}
              </Text>
            </Animated.View>

            {/* Controls */}
            <View style={{ alignItems: 'center', gap: SPACING.md }}>
              <AnimatedSwitch
                value={alarm.isEnabled}
                onValueChange={() => onToggle(alarm.id)}
                size="large"
                gradient
              />
              
              {alarm.isEnabled && alarm.dismissMethod === DismissMethod.MATH && (
                <AnimatedButton
                  title="Test"
                  variant="ghost"
                  size="small"
                  onPress={() => onDismiss(alarm)}
                  icon={<FeatherIcon name="play" size={12} />}
                />
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </Swipeable>
    </Animated.View>
  );
};

export const AlarmsScreen: React.FC<AlarmsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const {
    alarms,
    isLoading,
    recentlyDeleted,
    toggleAlarm,
    deleteAlarm,
    undoDelete,
    clearRecentlyDeleted,
    loadAlarms,
  } = useAlarmStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showMathModal, setShowMathModal] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  
  const headerScale = useSharedValue(1);
  const fabScale = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlarms();
    setRefreshing(false);
  }, [loadAlarms]);

  const handleToggleAlarm = useCallback((id: string) => {
    toggleAlarm(id);
  }, [toggleAlarm]);

  const handleDeleteAlarm = useCallback((id: string) => {
    deleteAlarm(id);
  }, [deleteAlarm]);

  const handleEditAlarm = useCallback((alarm: Alarm) => {
    navigation.navigate('EditAlarm', { alarm });
  }, [navigation]);

  const handleDismissTest = useCallback((alarm: Alarm) => {
    if (alarm.dismissMethod === DismissMethod.MATH) {
      setSelectedAlarm(alarm);
      setShowMathModal(true);
    }
  }, []);

  const createNewAlarm = useCallback(() => {
    navigation.navigate('EditAlarm', { alarm: undefined });
  }, [navigation]);

  const handleMathModalDismiss = useCallback(() => {
    setShowMathModal(false);
    setSelectedAlarm(null);
  }, []);

  const renderAlarmItem = useCallback(({ item, index }: { item: Alarm; index: number }) => (
    <AlarmItem
      alarm={item}
      onToggle={handleToggleAlarm}
      onEdit={handleEditAlarm}
      onDelete={handleDeleteAlarm}
      onDismiss={handleDismissTest}
      index={index}
    />
  ), [handleToggleAlarm, handleEditAlarm, handleDeleteAlarm, handleDismissTest]);

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeInDown.delay(200)}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
      }}
    >
      <FeatherIcon 
        name="clock" 
        size={80} 
        color={theme.colors.textTertiary}
        animated
        pulse
      />
      <Text
        style={{
          fontSize: FONT_SIZES.xxl,
          fontWeight: FONT_WEIGHTS.bold,
          color: theme.colors.text,
          marginTop: SPACING.lg,
          marginBottom: SPACING.sm,
          textAlign: 'center',
        }}
      >
        No Alarms Yet
      </Text>
      <Text
        style={{
          fontSize: FONT_SIZES.md,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
          marginBottom: SPACING.xxl,
        }}
      >
        Create your first alarm to get started with better sleep habits
      </Text>
    </Animated.View>
  );

  const renderUndoSnackbar = () => {
    if (!recentlyDeleted) return null;
    
    return (
      <Animated.View
        entering={SlideInRight}
        exiting={SlideOutLeft}
        style={{
          position: 'absolute',
          bottom: 100,
          left: SPACING.md,
          right: SPACING.md,
          backgroundColor: theme.colors.card,
          padding: SPACING.lg,
          borderRadius: BORDER_RADIUS.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...SHADOWS.lg,
        }}
      >
        <Text style={{ color: theme.colors.text, flex: 1 }}>
          Alarm "{recentlyDeleted.label}" deleted
        </Text>
        <AnimatedButton
          title="Undo"
          variant="primary"
          size="small"
          onPress={undoDelete}
          style={{ marginLeft: SPACING.md }}
        />
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <Animated.View
          style={[
            {
              paddingTop: StatusBar.currentHeight || SPACING.xxxl,
              paddingHorizontal: SPACING.lg,
              paddingBottom: SPACING.lg,
              backgroundColor: theme.colors.surface,
              borderBottomLeftRadius: BORDER_RADIUS.xl,
              borderBottomRightRadius: BORDER_RADIUS.xl,
              ...SHADOWS.sm,
            },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: FONT_SIZES.xxxl,
                  fontWeight: FONT_WEIGHTS.bold,
                  color: theme.colors.text,
                }}
              >
                Alarms
              </Text>
              <Text
                style={{
                  fontSize: FONT_SIZES.md,
                  color: theme.colors.textSecondary,
                  marginTop: SPACING.xs,
                }}
              >
                {alarms.length} active alarm{alarms.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            <AnimatedButton
              title=""
              variant="ghost"
              onPress={createNewAlarm}
              icon={<FeatherIcon name="plus" size={24} color={theme.colors.primary} />}
            />
          </View>
        </Animated.View>

        {/* Content */}
        <View style={{ flex: 1, padding: SPACING.lg }}>
          {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <FeatherIcon 
                name="loader" 
                size={32} 
                color={theme.colors.primary}
                animated
                rotate
              />
              <Text
                style={{
                  fontSize: FONT_SIZES.md,
                  color: theme.colors.textSecondary,
                  marginTop: SPACING.md,
                }}
              >
                Loading alarms...
              </Text>
            </View>
          ) : alarms.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={alarms}
              renderItem={renderAlarmItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ 
                paddingBottom: 100,
              }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
            />
          )}
        </View>
      </LinearGradient>

      {/* FAB */}
      <AnimatedButton
        title=""
        variant="fab"
        onPress={createNewAlarm}
        gradient
        icon={<FeatherIcon name="plus" size={24} color="#FFFFFF" />}
      />
      
      {/* Undo Snackbar */}
      {renderUndoSnackbar()}
      
      {/* Math Challenge Modal */}
      <MathChallengeModal
        visible={showMathModal}
        onDismiss={handleMathModalDismiss}
        alarmLabel={selectedAlarm?.label || 'Alarm'}
      />
    </View>
  );
};
