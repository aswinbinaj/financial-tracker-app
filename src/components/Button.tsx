import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  iconName,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { colors, spacing, shadows } = useTheme();

  // Color mapping based on variant
  let backgroundColor = colors.primary;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'secondary') {
    backgroundColor = colors.secondary;
    textColor = colors.background === '#0B0F19' ? '#0F172A' : '#FFFFFF';
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = colors.primary;
    borderColor = colors.primary;
    borderWidth = 1.5;
  } else if (variant === 'danger') {
    backgroundColor = colors.error;
    textColor = '#FFFFFF';
  }

  // Size mapping
  let paddingVertical = spacing.sm;
  let paddingHorizontal = spacing.md;
  let fontSize = 14;
  let height = 44;

  if (size === 'small') {
    paddingVertical = spacing.xs;
    paddingHorizontal = spacing.sm;
    fontSize = 12;
    height = 36;
  } else if (size === 'large') {
    paddingVertical = spacing.md;
    paddingHorizontal = spacing.lg;
    fontSize = 16;
    height = 52;
  }

  const isDarkBg = backgroundColor !== 'transparent' && variant !== 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? colors.border : backgroundColor,
          borderColor: disabled ? colors.border : borderColor,
          borderWidth,
          borderRadius: 12,
          paddingVertical,
          paddingHorizontal,
          height,
        },
        variant === 'primary' && !disabled && shadows,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFFFFF'} size="small" />
      ) : (
        <View style={styles.content}>
          {iconName && iconPosition === 'left' && (
            <Ionicons
              name={iconName}
              size={fontSize + 2}
              color={disabled ? colors.textSecondary : textColor}
              style={{ marginRight: spacing.xs }}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: disabled ? colors.textSecondary : textColor,
                fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconName && iconPosition === 'right' && (
            <Ionicons
              name={iconName}
              size={fontSize + 2}
              color={disabled ? colors.textSecondary : textColor}
              style={{ marginLeft: spacing.xs }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
