
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
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';

import { ExcelParser } from '@/utils/excelParser';
import { StorageService, AppState } from '@/utils/storage';
import { WhatsAppHelper } from '@/utils/whatsappHelper';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import InstructionsCard from '@/components/InstructionsCard';
import ProgressChart from '@/components/ProgressChart';
import SettingsModal from '@/components/SettingsModal';
import WebNotice from '@/components/WebNotice';

// Enable RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function HomeScreen() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadAppState();
  }, []);

  const loadAppState = async () => {
    try {
      const state = await StorageService.getAppState();
      setAppState(state);
      console.log('App state loaded:', {
        totalTexts: state.allTexts.length,
        availableTexts: state.availableTexts.length,
        usedTexts: state.usedTexts.length,
        whatsappNumber: state.whatsappPhoneNumber ? 'Set' : 'Not set'
      });
    } catch (error) {
      console.log('Error loading app state:', error);
      Alert.alert('خطا', 'خطا در بارگذاری داده‌ها');
    }
  };

  const handleFileUpload = async () => {
    try {
      setIsLoading(true);
      console.log('Starting file upload process...');

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('File selection cancelled');
        setIsLoading(false);
        return;
      }

      console.log('File selected:', result.assets[0].name);

      const file = result.assets[0];
      const texts = await ExcelParser.parseExcel(file.uri);

      if (texts.length === 0) {
        Alert.alert('خطا', 'هیچ متنی در فایل یافت نشد');
        setIsLoading(false);
        return;
      }

      console.log(`Parsed ${texts.length} texts from Excel file`);

      const { added, duplicates } = await StorageService.addTexts(texts);
      
      let message = `${added} متن جدید اضافه شد`;
      if (duplicates > 0) {
        message += `\n${duplicates} متن تکراری نادیده گرفته شد`;
      }

      Alert.alert('موفقیت', message);
      await loadAppState();
    } catch (error) {
      console.log('Error uploading file:', error);
      Alert.alert('خطا', 'خطا در پردازش فایل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRandomText = async () => {
    try {
      setIsLoading(true);
      console.log('Getting random text...');

      const randomText = await StorageService.getRandomText();

      if (!randomText) {
        Alert.alert(
          'تمام شد!',
          'تمام متن‌ها استفاده شده‌اند. آیا می‌خواهید پیشرفت را ریست کنید؟',
          [
            { text: 'خیر', style: 'cancel' },
            { text: 'بله', onPress: handleResetProgress },
          ]
        );
        setIsLoading(false);
        return;
      }

      console.log('Random text selected:', randomText.substring(0, 50) + '...');

      // Copy to clipboard
      await Clipboard.setStringAsync(randomText);
      console.log('Text copied to clipboard');

      await loadAppState();
      
      Alert.alert(
        'متن انتخاب شد',
        'متن در کلیپ‌بورد کپی شد',
        [
          { text: 'باشه', style: 'default' },
          { 
            text: 'ارسال در واتساپ', 
            style: 'default',
            onPress: () => handleShareWhatsApp(randomText)
          },
        ]
      );
    } catch (error) {
      console.log('Error getting random text:', error);
      Alert.alert('خطا', 'خطا در انتخاب متن');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWhatsApp = async (text?: string) => {
    try {
      const textToShare = text || appState?.currentText;
      
      if (!textToShare) {
        Alert.alert('خطا', 'متنی برای اشتراک‌گذاری وجود ندارد');
        return;
      }

      console.log('Sharing text to WhatsApp:', textToShare.substring(0, 50) + '...');

      // Get saved WhatsApp phone number
      const savedPhoneNumber = await StorageService.getWhatsAppPhoneNumber();
      
      if (savedPhoneNumber) {
        console.log('Using saved WhatsApp number:', savedPhoneNumber);
        const success = await WhatsAppHelper.openWhatsAppChat(savedPhoneNumber, textToShare);
        
        if (!success) {
          Alert.alert('خطا', 'خطا در باز کردن واتساپ. لطفاً مطمئن شوید که واتساپ نصب شده است.');
        }
      } else {
        // Fallback to general WhatsApp sharing
        console.log('No saved number, using general WhatsApp sharing');
        const success = await WhatsAppHelper.shareText(textToShare);
        
        if (!success) {
          Alert.alert(
            'راهنمایی',
            'برای ارسال مستقیم به شخص خاص، شماره واتساپ را در تنظیمات ذخیره کنید.',
            [
              { text: 'باشه', style: 'default' },
              { 
                text: 'تنظیمات', 
                style: 'default',
                onPress: () => setShowSettingsModal(true)
              },
            ]
          );
        }
      }
    } catch (error) {
      console.log('Error sharing to WhatsApp:', error);
      Alert.alert('خطا', 'خطا در اشتراک‌گذاری');
    }
  };

  const handleResetProgress = async () => {
    try {
      await StorageService.resetProgress();
      await loadAppState();
      Alert.alert('موفقیت', 'پیشرفت ریست شد');
    } catch (error) {
      console.log('Error resetting progress:', error);
      Alert.alert('خطا', 'خطا در ریست کردن پیشرفت');
    }
  };

  const getProgressPercentage = (): number => {
    if (!appState || appState.allTexts.length === 0) return 0;
    return (appState.usedTexts.length / appState.allTexts.length) * 100;
  };

  const renderProgressSection = () => {
    if (!appState || appState.allTexts.length === 0) {
      return null;
    }

    return (
      <View style={styles.progressSection}>
        <Text style={commonStyles.subtitle}>پیشرفت</Text>
        <ProgressChart
          used={appState.usedTexts.length}
          total={appState.allTexts.length}
          size={120}
        />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{appState.allTexts.length}</Text>
            <Text style={styles.statLabel}>کل متن‌ها</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{appState.availableTexts.length}</Text>
            <Text style={styles.statLabel}>باقی‌مانده</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{appState.usedTexts.length}</Text>
            <Text style={styles.statLabel}>استفاده شده</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <Stack.Screen 
        options={{ 
          title: 'انتخابگر متن تصادفی',
          headerShown: false 
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
            فایل اکسل خود را آپلود کنید و متن تصادفی دریافت کنید
          </Text>
          
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <IconSymbol name="gear" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <WebNotice />

        <InstructionsCard />

        {renderProgressSection()}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[buttonStyles.primary, isLoading && buttonStyles.disabled]}
            onPress={handleFileUpload}
            disabled={isLoading}
          >
            <IconSymbol name="doc.badge.plus" size={24} color={colors.text} />
            <Text style={buttonStyles.primaryText}>
              {isLoading ? 'در حال پردازش...' : 'آپلود فایل اکسل'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              buttonStyles.secondary,
              (!appState?.availableTexts.length || isLoading) && buttonStyles.disabled,
            ]}
            onPress={handleGetRandomText}
            disabled={!appState?.availableTexts.length || isLoading}
          >
            <IconSymbol name="shuffle" size={24} color={colors.text} />
            <Text style={buttonStyles.secondaryText}>انتخاب متن تصادفی</Text>
          </TouchableOpacity>

          {appState?.currentText && (
            <TouchableOpacity
              style={buttonStyles.accent}
              onPress={() => handleShareWhatsApp()}
            >
              <IconSymbol name="paperplane" size={24} color={colors.text} />
              <Text style={buttonStyles.accentText}>ارسال در واتساپ</Text>
            </TouchableOpacity>
          )}

          {appState && appState.allTexts.length > 0 && (
            <TouchableOpacity
              style={buttonStyles.warning}
              onPress={handleResetProgress}
            >
              <IconSymbol name="arrow.clockwise" size={24} color={colors.text} />
              <Text style={buttonStyles.warningText}>ریست پیشرفت</Text>
            </TouchableOpacity>
          )}
        </View>

        {appState?.currentText && (
          <View style={styles.currentTextContainer}>
            <Text style={styles.currentTextLabel}>متن انتخاب شده:</Text>
            <View style={styles.currentTextBox}>
              <Text style={styles.currentText}>{appState.currentText}</Text>
            </View>
          </View>
        )}

        {appState?.whatsappPhoneNumber && (
          <View style={styles.whatsappInfoContainer}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
            <Text style={styles.whatsappInfoText}>
              شماره واتساپ ذخیره شده: {appState.whatsappPhoneNumber}
            </Text>
          </View>
        )}
      </ScrollView>

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={(settings) => {
          console.log('Settings saved:', settings);
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
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: 30,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
    fontFamily: 'Vazirmatn_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Vazirmatn_400Regular',
  },
  actionsContainer: {
    gap: 16,
    marginVertical: 20,
  },
  currentTextContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentTextLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'right',
    fontFamily: 'Vazirmatn_600SemiBold',
  },
  currentTextBox: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'Vazirmatn_400Regular',
  },
  whatsappInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.success,
  },
  whatsappInfoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    textAlign: 'right',
    flex: 1,
    fontFamily: 'Vazirmatn_400Regular',
  },
});
