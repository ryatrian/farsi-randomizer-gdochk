
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '@/styles/commonStyles';

interface ProgressChartProps {
  used: number;
  total: number;
  size?: number;
}

const { width } = Dimensions.get('window');

export default function ProgressChart({ used, total, size = Math.min(width * 0.4, 150) }: ProgressChartProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      <View style={styles.textContainer}>
        <Text style={[styles.percentageText, { fontSize: size * 0.12 }]}>
          {Math.round(percentage)}%
        </Text>
        <Text style={[styles.labelText, { fontSize: size * 0.08 }]}>
          {used} از {total}
        </Text>
        <Text style={[styles.subLabelText, { fontSize: size * 0.06 }]}>
          استفاده شده
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    color: colors.text,
    fontWeight: '800',
    textAlign: 'center',
  },
  labelText: {
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  subLabelText: {
    color: colors.textSecondary,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 1,
  },
});
