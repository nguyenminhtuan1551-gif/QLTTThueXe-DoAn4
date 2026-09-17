import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/theme';

interface LoadingProps {
  message?: string;
  fullscreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Đang tải dữ liệu...',
  fullscreen = false,
}) => {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
