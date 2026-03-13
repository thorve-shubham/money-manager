import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type SpinnerSize = 'sm' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'lg',
  color = '#208AEF',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const nativeSize = size === 'sm' ? 'small' : 'large';

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={nativeSize} color={color} />
      </View>
    );
  }

  return <ActivityIndicator size={nativeSize} color={color} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
