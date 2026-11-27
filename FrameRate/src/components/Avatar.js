import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

function Avatar({ photo, size = 88, onPress }) {
  const radius = size / 2;
  const content = photo ? (
    <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={{ width: size, height: size, borderRadius: radius }} />
  ) : (
    <View style={[styles.empty, { width: size, height: size, borderRadius: radius }]}>
      <Ionicons name="person" size={size / 2} color={colors.primary} />
    </View>
  );

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.wrapper}>
      <View style={[styles.ring, { borderRadius: radius + 3 }]}>{content}</View>
      {onPress && (
        <View style={styles.badge}>
          <Ionicons name="camera" size={14} color={colors.text} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'center' },
  ring: { borderWidth: 2, borderColor: colors.primary, padding: 1 },
  empty: { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
});

export default Avatar;
