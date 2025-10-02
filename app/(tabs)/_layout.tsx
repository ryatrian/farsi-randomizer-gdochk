
import React from 'react';
import { Platform, I18nManager } from 'react-native';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

// Enable RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const tabs: TabBarItem[] = [
  {
    name: '(home)',
    title: 'خانه',
    icon: 'house',
    route: '/(home)',
  },
  {
    name: 'profile',
    title: 'پروفایل',
    icon: 'person',
    route: '/profile',
  },
];

export default function TabLayout() {
  if (Platform.OS === 'web') {
    return (
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'پروفایل' }} />
      </Stack>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
