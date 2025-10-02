
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import React, { useState, useEffect } from "react";
import { useTheme } from "@react-navigation/native";
import { View, Text, StyleSheet, ScrollView, Platform, I18nManager, TouchableOpacity, Alert } from "react-native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { StorageService, AppState } from "@/utils/storage";
import { NotificationService } from "@/utils/notificationService";
import SettingsModal from "@/components/SettingsModal";

// Enable RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function ProfileScreen() {
  const { colors: themeColors } = useTheme();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const state = await StorageService.getAppState();
      setAppState(state);
    } catch (error) {
      console.log('Error loading profile data:', error);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'حذف تمام داده‌ها',
      'آیا مطمئن هستید که می‌خواهید تمام داده‌ها را حذف کنید؟ این عمل قابل بازگشت نیست.',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await NotificationService.cancelAllNotifications();
              await loadData();
              Alert.alert('موفقیت', 'تمام داده‌ها حذف شدند');
            } catch (error) {
              Alert.alert('خطا', 'خطا در حذف داده‌ها');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol name="person.circle" size={80} color={colors.primary} />
          </View>
          <Text style={commonStyles.title}>درباره برنامه</Text>
          <Text style={commonStyles.textSecondary}>
            انتخابگر متن تصادفی فارسی
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <IconSymbol name="info.circle" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>نسخه برنامه</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <IconSymbol name="doc.text" size={24} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>نوع فایل پشتیبانی شده</Text>
              <Text style={styles.infoValue}>Excel (.xlsx, .xls)</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <IconSymbol name="globe" size={24} color={colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>زبان</Text>
              <Text style={styles.infoValue}>فارسی (راست به چپ)</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <IconSymbol name="phone" size={24} color={colors.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>پلتفرم</Text>
              <Text style={styles.infoValue}>
                {Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'وب'}
              </Text>
            </View>
          </View>

          {appState?.whatsappPhoneNumber && (
            <View style={styles.infoCard}>
              <IconSymbol name="message" size={24} color={colors.success} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>شماره واتساپ ذخیره شده</Text>
                <Text style={styles.infoValue}>{appState.whatsappPhoneNumber}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>ویژگی‌های برنامه</Text>
          
          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>آپلود و پردازش فایل‌های اکسل</Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>انتخاب تصادفی متن بدون تکرار</Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>کپی خودکار در کلیپ‌بورد</Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>اشتراک‌گذاری در واتساپ</Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>ذخیره شماره واتساپ برای ارسال مستقیم</Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>ذخیره‌سازی محلی داده‌ها</Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>نمایش پیشرفت و آمار</Text>
          </View>

          <View style={styles.featureItem}>
            <IconSymbol name="checkmark.circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>پشتیبانی کامل از RTL</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>عملیات</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <IconSymbol name="gear" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>تنظیمات</Text>
            <IconSymbol name="chevron.left" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearAllData}
          >
            <IconSymbol name="trash" size={24} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>
              حذف تمام داده‌ها
            </Text>
            <IconSymbol name="chevron.left" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>آمار استفاده</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{appState?.allTexts.length || 0}</Text>
              <Text style={styles.statLabel}>کل متن‌ها</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{appState?.availableTexts.length || 0}</Text>
              <Text style={styles.statLabel}>باقی‌مانده</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{appState?.usedTexts.length || 0}</Text>
              <Text style={styles.statLabel}>استفاده شده</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>توضیحات</Text>
          <Text style={styles.descriptionText}>
            این برنامه برای انتخاب تصادفی متن از فایل‌های اکسل طراحی شده است. 
            شما می‌توانید فایل اکسل خود را آپلود کنید و برنامه متن‌های موجود در ستون اول را استخراج می‌کند. 
            سپس با فشردن دکمه انتخاب تصادفی، یک متن بدون تکرار انتخاب شده و در کلیپ‌بورد کپی می‌شود. 
            همچنین امکان اشتراک‌گذاری مستقیم در واتساپ و ذخیره شماره تلفن برای ارسال مستقیم نیز فراهم است.
          </Text>
        </View>
      </ScrollView>
      
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={(settings) => {
          console.log('Settings saved:', settings);
          loadData();
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
  iconContainer: {
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 12,
    color: colors.textSecondary,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    writingDirection: 'rtl',
    textAlign: 'right',
    flex: 1,
  },
  actionsSection: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    textAlign: 'right',
    fontFamily: 'Vazirmatn_500Medium',
  },
  dangerButton: {
    borderColor: colors.error,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontFamily: 'Vazirmatn_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Vazirmatn_400Regular',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'justify',
    writingDirection: 'rtl',
    fontFamily: 'Vazirmatn_400Regular',
  },
});
