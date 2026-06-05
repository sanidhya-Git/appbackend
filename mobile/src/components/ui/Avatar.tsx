import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Text } from './Text';
import { ms } from '../../utils/responsive';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ uri, name, size = 40, style }: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.38);

  if (uri) {
    return (
      <FastImage
        source={{ uri, priority: FastImage.priority.normal }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: 'rgba(0,0,0,0.06)',
          },
          style,
        ]}
        resizeMode={FastImage.resizeMode.cover}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#EEF2FF',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: ms(fontSize),
          lineHeight: ms(fontSize) * 1.2,
          fontWeight: '700',
          color: '#6366F1',
          includeFontPadding: false,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
});
