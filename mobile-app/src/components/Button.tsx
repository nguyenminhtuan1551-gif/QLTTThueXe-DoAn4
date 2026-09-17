import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { RADIUS, SPACING } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = () => {
    const base: ViewStyle[] = [styles.base];

    // Sizes
    if (size === 'sm') base.push(styles.sizeSm);
    else if (size === 'lg') base.push(styles.sizeLg);
    else base.push(styles.sizeMd);

    // Variants
    if (variant === 'primary') base.push(styles.primary);
    else if (variant === 'secondary') base.push(styles.secondary);
    else if (variant === 'outline') base.push(styles.outline);
    else if (variant === 'danger') base.push(styles.danger);
    else if (variant === 'ghost') base.push(styles.ghost);

    if (disabled || loading) base.push(styles.disabled);
    if (style) base.push(style);

    return base;
  };

  const getTextStyle = () => {
    const base: TextStyle[] = [styles.textBase];

    if (size === 'sm') base.push(styles.textSm);
    else if (size === 'lg') base.push(styles.textLg);
    else base.push(styles.textMd);

    if (variant === 'outline' || variant === 'ghost') {
      base.push(styles.textOutline);
    } else if (variant === 'secondary') {
      base.push(styles.textSecondary);
    } else {
      base.push(styles.textLight);
    }

    if (textStyle) base.push(textStyle);

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={getContainerStyle()}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sizeLg: {
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
  textBase: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 17,
  },
  textLight: {
    color: COLORS.white,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textSecondary: {
    color: COLORS.white,
  },
});
