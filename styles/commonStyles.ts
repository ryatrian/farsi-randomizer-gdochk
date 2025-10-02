
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  background: '#121212',      // Dark gray, suitable for dark mode
  text: '#F5F5F5',           // Light gray, for readability on dark background
  textSecondary: '#A3A3A3',  // Medium gray, for less important text
  primary: '#3B82F6',        // A vibrant blue for primary actions
  secondary: '#6D28D9',      // A deep purple for secondary actions
  accent: '#EC4899',         // A bright pink for highlights
  card: '#1E1E1E',          // A slightly lighter dark gray for card backgrounds
  highlight: '#FDE68A',      // A soft yellow for highlighting
  success: '#10B981',        // Green for success states
  warning: '#F59E0B',        // Orange for warnings
  error: '#EF4444',          // Red for errors
  border: '#374151',         // Gray for borders
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Vazirmatn_700Bold',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 16,
    writingDirection: 'rtl',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Vazirmatn_500Medium',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Vazirmatn_400Regular',
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  progressContainer: {
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: 8,
    height: 8,
    marginVertical: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  rtlContainer: {
    direction: 'rtl',
    textAlign: 'right',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Vazirmatn_600SemiBold',
    textAlign: 'center',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Vazirmatn_600SemiBold',
    textAlign: 'center',
  },
});
