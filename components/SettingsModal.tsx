
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { StorageService } from '@/utils/storage';
import { NotificationService } from '@/utils/notificationService';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: AutoSendSettings) => void;
}

interface AutoSendSettings {
  isEnabled: boolean;
  selectedDays: boolean[];
  timeWindow: { start: string; end: string };
  messagesPerDay: number;
}

const PERSIAN_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

export default function SettingsModal({ visible, onClose, onSave }: SettingsModalProps) {
  const [settings, setSettings] = useState<AutoSendSettings>({
    isEnabled: false,
    selectedDays: [false, false, false, false, false, false, false],
    timeWindow: { start: '09:00', end: '17:00' },
    messagesPerDay: 1,
  });

  useEffect(() => {
    if (visible) {
      loadCurrentSettings();
    }
  }, [visible]);

  const loadCurrentSettings = async () => {
    try {
      const appState = await StorageService.getAppState();
      setSettings({
        isEnabled: appState.isAutoSendEnabled,
        selectedDays: appState.selectedDays,
        timeWindow: appState.timeWindow,
        messagesPerDay: appState.messagesPerDay,
      });
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    const newSelectedDays = [...settings.selectedDays];
    newSelectedDays[dayIndex] = !newSelectedDays[dayIndex];
    setSettings({ ...settings, selectedDays: newSelectedDays });
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    // Basic time validation (HH:MM format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(value) || value === '') {
      setSettings({
        ...settings,
        timeWindow: { ...settings.timeWindow, [type]: value },
      });
    }
  };

  const handleMessagesPerDayChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 10) {
      setSettings({ ...settings, messagesPerDay: numValue });
    }
  };

  const validateSettings = (): boolean => {
    if (settings.isEnabled) {
      // Check if at least one day is selected
      if (!settings.selectedDays.some(day => day)) {
        Alert.alert('خطا', 'حداقل یک روز از هفته را انتخاب کنید');
        return false;
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(settings.timeWindow.start) || !timeRegex.test(settings.timeWindow.end)) {
        Alert.alert('خطا', 'فرمت زمان صحیح نیست (HH:MM)');
        return false;
      }

      // Check if start time is before end time
      const startTime = settings.timeWindow.start.split(':').map(Number);
      const endTime = settings.timeWindow.end.split(':').map(Number);
      const startMinutes = startTime[0] * 60 + startTime[1];
      const endMinutes = endTime[0] * 60 + endTime[1];

      if (startMinutes >= endMinutes) {
        Alert.alert('خطا', 'زمان شروع باید قبل از زمان پایان باشد');
        return false;
      }

      // Validate messages per day
      if (settings.messagesPerDay < 1 || settings.messagesPerDay > 10) {
        Alert.alert('خطا', 'تعداد پیام در روز باید بین ۱ تا ۱۰ باشد');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      return;
    }

    try {
      await StorageService.updateAutoSendSettings(
        settings.isEnabled,
        settings.selectedDays,
        settings.timeWindow,
        settings.messagesPerDay
      );

      // Generate new schedules if auto-send is enabled
      if (settings.isEnabled) {
        await NotificationService.generateSchedules();
        Alert.alert('موفقیت', 'تنظیمات ذخیره شد و زمان‌بندی پیام‌ها تنظیم شد');
      } else {
        // Cancel all notifications if disabled
        await NotificationService.cancelAllNotifications();
        Alert.alert('موفقیت', 'تنظیمات ذخیره شد و ارسال خودکار غیرفعال شد');
      }

      onSave(settings);
      onClose();
    } catch (error) {
      console.log('Error saving settings:', error);
      Alert.alert('خطا', 'خطا در ذخیره تنظیمات');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>تنظیمات ارسال خودکار</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>ذخیره</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Enable/Disable Toggle */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>فعال‌سازی ارسال خودکار</Text>
              <Switch
                value={settings.isEnabled}
                onValueChange={(value) => setSettings({ ...settings, isEnabled: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={settings.isEnabled ? colors.text : colors.textSecondary}
              />
            </View>
            <Text style={styles.settingDescription}>
              با فعال‌سازی این گزینه، پیام‌ها به صورت خودکار در زمان‌های تعیین شده ارسال خواهند شد
            </Text>
          </View>

          {settings.isEnabled && (
            <>
              {/* Days Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>انتخاب روزهای هفته</Text>
                <View style={styles.daysContainer}>
                  {PERSIAN_DAYS.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        settings.selectedDays[index] && styles.dayButtonSelected,
                      ]}
                      onPress={() => handleDayToggle(index)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          settings.selectedDays[index] && styles.dayButtonTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Time Window */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>بازه زمانی</Text>
                <View style={styles.timeContainer}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeLabel}>از ساعت:</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={settings.timeWindow.start}
                      onChangeText={(value) => handleTimeChange('start', value)}
                      placeholder="09:00"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeLabel}>تا ساعت:</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={settings.timeWindow.end}
                      onChangeText={(value) => handleTimeChange('end', value)}
                      placeholder="17:00"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                </View>
                <Text style={styles.settingDescription}>
                  پیام‌ها فقط در این بازه زمانی ارسال خواهند شد
                </Text>
              </View>

              {/* Messages Per Day */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>تعداد پیام در روز</Text>
                <TextInput
                  style={styles.numberInput}
                  value={settings.messagesPerDay.toString()}
                  onChangeText={handleMessagesPerDayChange}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.settingDescription}>
                  حداکثر ۱۰ پیام در روز قابل ارسال است
                </Text>
              </View>

              {/* Warning */}
              <View style={styles.warningContainer}>
                <IconSymbol name="exclamationmark.triangle" size={20} color={colors.warning} />
                <Text style={styles.warningText}>
                  توجه: این قابلیت نیاز به اجازه نوتیفیکیشن دارد و ممکن است در برخی دستگاه‌ها محدودیت داشته باشد.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'right',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  dayButtonTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  timeInputContainer: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  timeInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    minWidth: 80,
  },
  numberInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    alignSelf: 'center',
    minWidth: 80,
    marginBottom: 12,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
  },
  warningText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
