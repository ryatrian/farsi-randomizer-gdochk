
import { Linking, Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

export class WhatsAppHelper {
  static async shareText(text: string): Promise<boolean> {
    try {
      console.log('Attempting to share text to WhatsApp:', text.substring(0, 50) + '...');
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      
      // Try to open WhatsApp directly
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        console.log('WhatsApp opened successfully');
        return true;
      } else {
        // Fallback to system sharing
        console.log('WhatsApp not available, using system sharing');
        return await this.shareViaSystem(text);
      }
    } catch (error) {
      console.log('Error sharing to WhatsApp:', error);
      
      // Fallback to system sharing
      try {
        return await this.shareViaSystem(text);
      } catch (fallbackError) {
        console.log('Fallback sharing also failed:', fallbackError);
        return false;
      }
    }
  }

  private static async shareViaSystem(text: string): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        // Show alert with text for manual copy
        Alert.alert(
          'اشتراک‌گذاری',
          'متن زیر را کپی کنید:\n\n' + text,
          [
            { text: 'باشه', style: 'default' }
          ]
        );
        return false;
      }

      // Create a temporary text file to share
      const tempText = text;
      
      // On mobile platforms, we can use the share dialog
      if (Platform.OS !== 'web') {
        // For React Native, we would use react-native's Share API
        // But since we're in Expo, we'll use a different approach
        Alert.alert(
          'اشتراک‌گذاری',
          'متن زیر را کپی کنید و در واتساپ ارسال کنید:\n\n' + text,
          [
            { text: 'باشه', style: 'default' }
          ]
        );
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error in system sharing:', error);
      return false;
    }
  }

  static createWhatsAppUrl(text: string, phoneNumber?: string): string {
    const encodedText = encodeURIComponent(text);
    
    if (phoneNumber) {
      // Remove any non-digit characters from phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      return `https://wa.me/${cleanPhone}?text=${encodedText}`;
    } else {
      return `https://wa.me/?text=${encodedText}`;
    }
  }

  static async openWhatsAppChat(phoneNumber: string, message?: string): Promise<boolean> {
    try {
      const url = this.createWhatsAppUrl(message || '', phoneNumber);
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Error opening WhatsApp chat:', error);
      return false;
    }
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic validation for international phone numbers
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming Iran +98)
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      return '98' + cleanPhone;
    }
    
    if (cleanPhone.length === 11 && cleanPhone.startsWith('09')) {
      return '98' + cleanPhone.substring(1);
    }
    
    return cleanPhone;
  }
}
