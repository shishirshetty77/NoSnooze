import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { AppSettings, DismissMethod } from '../types';
import { storageService } from '../services/storageService';
import { SPACING, FONT_SIZES, FONT_WEIGHTS, SOUNDS } from '../constants';

export const SettingsScreen: React.FC = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    isDarkMode: false,
    defaultSound: 'Default',
    defaultDismissMethod: DismissMethod.BUTTON,
    notificationsEnabled: true,
    vibrationEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await storageService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await storageService.saveSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all alarms, settings, and sleep records. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared');
              // Reset settings to default
              setSettings({
                isDarkMode: false,
                defaultSound: 'Default',
                defaultDismissMethod: DismissMethod.BUTTON,
                notificationsEnabled: true,
                vibrationEnabled: true,
              });
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name={icon as any} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          {description && (
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      {rightElement && (
        <View style={styles.settingRight}>
          {rightElement}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSoundPicker = () => {
    return (
      <View style={styles.pickerContainer}>
        {SOUNDS.map(sound => (
          <TouchableOpacity
            key={sound}
            style={[
              styles.pickerOption,
              {
                backgroundColor: settings.defaultSound === sound
                  ? theme.colors.primary
                  : theme.colors.surface,
              },
            ]}
            onPress={() => updateSetting('defaultSound', sound)}
          >
            <Text
              style={[
                styles.pickerOptionText,
                {
                  color: settings.defaultSound === sound
                    ? '#FFFFFF'
                    : theme.colors.text,
                },
              ]}
            >
              {sound}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
    section: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.semibold,
      color: theme.colors.text,
      marginBottom: SPACING.md,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.medium,
    },
    settingDescription: {
      fontSize: FONT_SIZES.sm,
      marginTop: SPACING.xs,
      lineHeight: 18,
    },
    settingRight: {
      alignItems: 'center',
    },
    settingValue: {
      fontSize: FONT_SIZES.sm,
      color: theme.colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    pickerContainer: {
      marginTop: SPACING.md,
      gap: SPACING.xs,
    },
    pickerOption: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    pickerOptionText: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.medium,
    },
    dismissMethodContainer: {
      marginTop: SPACING.md,
    },
    dismissMethodOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.xs,
    },
    dismissMethodText: {
      fontSize: FONT_SIZES.md,
      color: theme.colors.text,
      marginLeft: SPACING.sm,
    },
    dangerSection: {
      marginTop: SPACING.xl,
      paddingTop: SPACING.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    clearDataButton: {
      marginTop: SPACING.md,
    },
    appInfo: {
      alignItems: 'center',
      paddingVertical: SPACING.lg,
    },
    appVersion: {
      fontSize: FONT_SIZES.sm,
      color: theme.colors.textSecondary,
    },
    loadingText: {
      fontSize: FONT_SIZES.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.xl,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem(
            'moon',
            'Dark Mode',
            'Switch between light and dark theme',
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={isDarkMode ? '#FFFFFF' : theme.colors.placeholder}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Alarm Settings</Text>
          
          {renderSettingItem(
            'musical-notes',
            'Default Sound',
            `Currently: ${settings.defaultSound}`,
          )}
          {renderSoundPicker()}

          {renderSettingItem(
            'hand-right',
            'Default Dismiss Method',
            'How alarms are dismissed by default',
          )}
          <View style={styles.dismissMethodContainer}>
            <TouchableOpacity
              style={styles.dismissMethodOption}
              onPress={() => updateSetting('defaultDismissMethod', DismissMethod.BUTTON)}
            >
              <Ionicons
                name={settings.defaultDismissMethod === DismissMethod.BUTTON ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.dismissMethodText}>Button Press</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dismissMethodOption}
              onPress={() => updateSetting('defaultDismissMethod', DismissMethod.MATH)}
            >
              <Ionicons
                name={settings.defaultDismissMethod === DismissMethod.MATH ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.dismissMethodText}>Math Problem</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            'notifications',
            'Enable Notifications',
            'Show alarm notifications',
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => updateSetting('notificationsEnabled', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.notificationsEnabled ? '#FFFFFF' : theme.colors.placeholder}
            />
          )}

          {renderSettingItem(
            'phone-portrait',
            'Vibration',
            'Vibrate when alarm rings',
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) => updateSetting('vibrationEnabled', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.vibrationEnabled ? '#FFFFFF' : theme.colors.placeholder}
            />
          )}
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          {renderSettingItem(
            'trash',
            'Clear All Data',
            'Delete all alarms, settings, and sleep records',
          )}
          <Button
            title="Clear All Data"
            variant="danger"
            onPress={handleClearData}
            style={styles.clearDataButton}
          />
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Alarm App v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};
