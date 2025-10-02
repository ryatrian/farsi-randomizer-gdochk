
import { SystemBars } from "react-native-edge-to-edge";
import { Stack, router } from "expo-router";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { useNetworkState } from "expo-network";
import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert, I18nManager } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Vazirmatn_400Regular,
  Vazirmatn_500Medium,
  Vazirmatn_600SemiBold,
  Vazirmatn_700Bold,
} from '@expo-google-fonts/vazirmatn';
import { colors } from "@/styles/commonStyles";
import { NotificationService } from "@/utils/notificationService";
import ErrorBoundary from "@/components/ErrorBoundary";

// Enable RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom dark theme with our colors
const CustomDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Vazirmatn_400Regular,
    Vazirmatn_500Medium,
    Vazirmatn_600SemiBold,
    Vazirmatn_700Bold,
  });
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Initialize notification service
      NotificationService.setupNotificationHandlers();
      NotificationService.startPeriodicCheck();
    }
  }, [loaded]);

  useEffect(() => {
    if (networkState.isConnected === false) {
      Alert.alert(
        'اتصال اینترنت',
        'اتصال اینترنت شما قطع شده است. برخی از ویژگی‌ها ممکن است کار نکنند.',
        [{ text: 'متوجه شدم', style: 'default' }]
      );
    }
  }, [networkState.isConnected]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <WidgetProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={CustomDarkTheme}>
            <SystemBars style="light" />
            <StatusBar style="light" backgroundColor={colors.background} />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerTitleAlign: 'center',
                headerTitleStyle: {
                  fontWeight: '600',
                  fontSize: 18,
                  fontFamily: 'Vazirmatn_600SemiBold',
                },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="modal" 
                options={{ 
                  presentation: 'modal',
                  title: 'مودال',
                }} 
              />
              <Stack.Screen 
                name="formsheet" 
                options={{ 
                  presentation: 'formSheet',
                  title: 'فرم',
                }} 
              />
              <Stack.Screen 
                name="transparent-modal" 
                options={{ 
                  presentation: 'transparentModal',
                  title: 'مودال شفاف',
                }} 
              />
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      </WidgetProvider>
    </ErrorBoundary>
  );
}
