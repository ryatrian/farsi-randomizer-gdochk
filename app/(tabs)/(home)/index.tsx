
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  I18nManager,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { StorageService, AppState } from '@/utils/storage';
import { ExcelParser } from '@/utils/excelParser';
import { WhatsAppHelper } from '@/utils/whatsappHelper';
import { IconSymbol } from '@/components/IconSymbol';
import SettingsModal from '@/components/SettingsModal';
import ProgressChart from '@/components/ProgressChart';
import WebNotice from '@/components/WebNotice';
import InstructionsCard from '@/components/InstructionsCard';

// Enable RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function HomeScreen() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadAppState();
  }, []);

  const loadAppState = async () => {
    try {
      const state = await StorageService.getAppState();
      setAppState(state);
      setCurrentText(state.currentText);
      console.log('App state loaded:', state);
    } catch (error) {
      console.log('Error loading app state:', error);
    }
  };

  const handleFileUpload = async () => {
    try {
      setLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const file = result.assets[0];
      
      if (!ExcelParser.validateFileType(file.name)) {
        Alert.alert('خطا', 'لطفاً فایل اکسل معتبر (.xlsx یا .xls) انتخاب کنید');
        setLoading(false);
        return;
      }

      console.log('Selected file:', file);
      
      const parseResult = await ExcelParser.parseFile(file.uri);
      
      if (!parseResult.success) {
        Alert.alert('خطا', parseResult.error || 'خطا در خواندن فایل');
        setLoading(false);
        return;
      }

      const addResult = await StorageService.addTexts(parseResult.texts);
      
      let message = `${addResult.added} متن جدید اضافه شد`;
      if (addResult.duplicates > 0) {
        message += `\n${addResult.duplicates} متن تکراری نادیده گرفته شد`;
      }

      Alert.alert('موفقیت', message);
      await loadAppState();
      
    } catch (error) {
      console.log('Error uploading file:', error);
      Alert.alert('خطا', 'خطا در آپلود فایل');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRandomText = async () => {
    try {
      setLoading(true);
      
      const randomText = await StorageService.getRandomText();
      
      if (!randomText) {
        Alert.alert('اطلاع', 'هیچ متن موجودی باقی نمانده است. لطفاً فایل جدید آپلود کنید یا پیشرفت را ریست کنید.');
        setLoading(false);
        return;
      }

      setCurrentText(randomText);
      
      // Copy to clipboard
      await Clipboard.setStringAsync(randomText);
      
      await loadAppState();
      
      Alert.alert('کپی شد', 'متن در کلیپ‌بورد کپی شد');
      
    } catch (error) {
      console.log('Error getting random text:', error);
      Alert.alert('خطا', 'خطا در انتخاب متن تصادفی');
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!currentText) {
      Alert.alert('خطا', 'هیچ متنی انتخاب نشده است');
      return;
    }

    try {
      const success = await WhatsAppHelper.shareText(currentText);
      if (!success) {
        Alert.alert('خطا', 'خطا در ارسال به واتساپ');
      }
    } catch (error) {
      console.log('Error sharing to WhatsApp:', error);
      Alert.alert('خطا', 'خطا در ارسال به واتساپ');
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      'تأیید ریست',
      'آیا مطمئن هستید که می‌خواهید پیشرفت را ریست کنید؟ تمام متن‌ها دوباره در دسترس قرار خواهند گرفت.',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'ریست',
          style: 'destructive',
          onPress: async () => {
            await StorageService.resetProgress();
            await loadAppState();
            setCurrentText(null);
            Alert.alert('موفقیت', 'پیشرفت با موفقیت ریست شد');
          },
        },
      ]
    );
  };

  const getProgressPercentage = () => {
    if (!appState || appState.allTexts.length === 0) return 0;
    return (appState.usedTexts.length / appState.allTexts.length) * 100;
  };

  const renderProgressSection = () => {
    return (
      <View style={styles.progressSection}>
        <Text style={[commonStyles.text, styles.progressText]}>
          پیشرفت استفاده از متن‌ها
        </Text>
        <ProgressChart
          used={appState?.usedTexts.length || 0}
          total={appState?.allTexts.length || 0}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <Stack.Screen 
        options={{ 
          title: 'انتخابگر متن تصادفی',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={commonStyles.title}>انتخابگر متن تصادفی</Text>
          <Text style={commonStyles.textSecondary}>
            فایل اکسل خود را آپلود کنید و متن‌های تصادفی دریافت کنید
          </Text>
          <WebNotice />
          <InstructionsCard />
        </View>

        {renderProgressSection()}

        <View style={styles.mainActions}>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.uploadButton]}
            onPress={handleFileUpload}
            disabled={loading}
          >
            <IconSymbol name="upload" size={24} color="#FFFFFF" />
            <Text style={[commonStyles.buttonTextPrimary, styles.buttonText]}>
              {loading ? 'در حال آپلود...' : 'آپلود فایل اکسل'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              buttonStyles.secondary, 
              styles.randomButton,
              (!appState?.availableTexts.length || loading) && styles.disabledButton
            ]}
            onPress={handleGetRandomText}
            disabled={!appState?.availableTexts.length || loading}
          >
            <IconSymbol name="shuffle" size={24} color="#FFFFFF" />
            <Text style={[commonStyles.buttonTextPrimary, styles.buttonText]}>
              {loading ? 'در حال انتخاب...' : 'انتخاب متن تصادفی'}
            </Text>
          </TouchableOpacity>
        </View>

        {currentText && (
          <View style={styles.currentTextSection}>
            <Text style={styles.currentTextLabel}>متن انتخاب شده:</Text>
            <View style={styles.textCard}>
              <Text style={styles.currentTextValue}>{currentText}</Text>
            </View>
            
            <TouchableOpacity
              style={[buttonStyles.accent, styles.whatsappButton]}
              onPress={handleShareWhatsApp}
            >
              <IconSymbol name="share" size={20} color="#FFFFFF" />
              <Text style={[commonStyles.buttonTextPrimary, styles.buttonText]}>
                ارسال در واتساپ
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[buttonStyles.outline, styles.resetButton]}
            onPress={handleResetProgress}
            disabled={!appState?.usedTexts.length}
          >
            <IconSymbol name="refresh" size={20} color={colors.primary} />
            <Text style={[styles.outlineButtonText, styles.buttonText]}>
              ریست پیشرفت
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[buttonStyles.accent, styles.settingsButton]}
            onPress={() => setShowSettingsModal(true)}
          >
            <IconSymbol name="gear" size={20} color="#FFFFFF" />
            <Text style={[commonStyles.buttonTextPrimary, styles.buttonText]}>
              تنظیمات خودکار
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appState?.allTexts.length || 0}</Text>
            <Text style={styles.statLabel}>کل متن‌ها</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appState?.availableTexts.length || 0}</Text>
            <Text style={styles.statLabel}>متن‌های موجود</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appState?.usedTexts.length || 0}</Text>
            <Text style={styles.statLabel}>متن‌های استفاده شده</Text>
          </View>
        </View>
      </ScrollView>
      
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={(settings) => {
          console.log('Settings saved:', settings);
          // Reload app state to reflect changes
          loadAppState();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Space for floating tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressSection: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  mainActions: {
    width: '100%',
    marginBottom: 30,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 16,
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  currentTextSection: {
    width: '100%',
    marginBottom: 30,
  },
  currentTextLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    writingDirection: 'rtl',
  },
  textCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentTextValue: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    writingDirection: 'rtl',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryActions: {
    width: '100%',
    marginBottom: 30,
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
