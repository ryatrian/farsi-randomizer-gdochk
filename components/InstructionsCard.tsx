
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function InstructionsCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  const instructions = [
    'فایل اکسل خود را با دکمه "آپلود فایل اکسل" انتخاب کنید',
    'برنامه متن‌های موجود در ستون اول را استخراج می‌کند',
    'با دکمه "انتخاب متن تصادفی" یک متن بدون تکرار انتخاب کنید',
    'متن انتخاب شده خودکار در کلیپ‌بورد کپی می‌شود',
    'با دکمه "ارسال در واتساپ" متن را در واتساپ به اشتراک بگذارید',
    'از تنظیمات خودکار برای زمان‌بندی ارسال استفاده کنید',
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <IconSymbol name="info.circle" size={20} color={colors.primary} />
        <Text style={styles.title}>راهنمای استفاده</Text>
        <IconSymbol
          name={isExpanded ? "chevron.up" : "chevron.down"}
          size={16}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    textAlign: 'right',
    fontFamily: 'Vazirmatn_600SemiBold',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginLeft: 12,
    fontFamily: 'Vazirmatn_600SemiBold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'right',
    fontFamily: 'Vazirmatn_400Regular',
  },
});
