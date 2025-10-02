
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  I18nManager,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, usePathname } from 'expo-router';
import { colors } from '@/styles/commonStyles';

// Enable RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export interface TabBarItem {
  name: string;
  title: string;
  icon: string;
  route: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function FloatingTabBar({
  tabs,
  containerWidth = screenWidth - 40,
  borderRadius = 25,
  bottomMargin = 34,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const animatedValue = useSharedValue(0);

  const handleTabPress = (route: string, index: number) => {
    animatedValue.value = withSpring(index);
    router.push(route as any);
  };

  const getCurrentIndex = () => {
    const currentTab = tabs.findIndex(tab => 
      pathname.includes(tab.name) || pathname === tab.route
    );
    return currentTab >= 0 ? currentTab : 0;
  };

  const animatedStyle = useAnimatedStyle(() => {
    const currentIndex = getCurrentIndex();
    const translateX = interpolate(
      animatedValue.value,
      [0, tabs.length - 1],
      [0, (containerWidth / tabs.length) * (tabs.length - 1)]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <SafeAreaView style={[styles.safeArea, { bottom: bottomMargin }]}>
      <View style={[styles.container, { width: containerWidth }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} style={[styles.tabBar, { borderRadius }]}>
            <View style={styles.tabBarContent}>
              <Animated.View
                style={[
                  styles.activeIndicator,
                  {
                    width: containerWidth / tabs.length,
                    borderRadius: borderRadius - 4,
                  },
                  animatedStyle,
                ]}
              />
              {tabs.map((tab, index) => (
                <TouchableOpacity
                  key={tab.name}
                  style={[styles.tab, { width: containerWidth / tabs.length }]}
                  onPress={() => handleTabPress(tab.route, index)}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    name={tab.icon as any}
                    size={24}
                    color={
                      getCurrentIndex() === index ? colors.primary : colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color:
                          getCurrentIndex() === index ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        ) : (
          <View style={[styles.tabBar, styles.androidTabBar, { borderRadius }]}>
            <Animated.View
              style={[
                styles.activeIndicator,
                styles.androidActiveIndicator,
                {
                  width: containerWidth / tabs.length,
                  borderRadius: borderRadius - 4,
                },
                animatedStyle,
              ]}
            />
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.name}
                style={[styles.tab, { width: containerWidth / tabs.length }]}
                onPress={() => handleTabPress(tab.route, index)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={tab.icon as any}
                  size={24}
                  color={
                    getCurrentIndex() === index ? colors.primary : colors.text
                  }
                />
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        getCurrentIndex() === index ? colors.primary : colors.text,
                    },
                  ]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    overflow: 'hidden',
  },
  androidTabBar: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    height: 60,
    backgroundColor: colors.background,
    opacity: 0.8,
    top: 5,
  },
  androidActiveIndicator: {
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});
