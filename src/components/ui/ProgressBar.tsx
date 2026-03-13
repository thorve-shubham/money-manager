import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

interface ProgressBarProps {
  /** A value between 0 and 1 representing the fill percentage */
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  color = '#208AEF',
  height = 8,
  showLabel = false,
}: ProgressBarProps) {
  const theme = useTheme();
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const fillWidth = useSharedValue(0);

  useEffect(() => {
    fillWidth.value = withTiming(clampedProgress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress, fillWidth]);

  const animatedFill = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%`,
  }));

  return (
    <View>
      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: theme.backgroundSelected,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            animatedFill,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {Math.round(clampedProgress * 100)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
