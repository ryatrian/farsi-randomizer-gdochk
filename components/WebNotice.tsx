
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function WebNotice() {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <IconSymbol name="info.circle" size={24} color={colors.warning} />
      <Text style={styles.text}>
        این اپلیکیشن برای موبایل طراحی شده است. برخی ویژگی‌ها مانند نوتیفیکیشن‌های خودکار در وب کار نمی‌کنند.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    marginLeft: 12,
    fontFamily: 'Vazirmatn_400Regular',
    lineHeight: 20,
  },
});
