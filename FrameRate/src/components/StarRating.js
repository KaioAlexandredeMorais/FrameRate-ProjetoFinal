import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STAR_COLOR = '#FFC83D';
const EMPTY_COLOR = '#4A574E';

function StarRating({ value = 0, onChange, size = 20, max = 5 }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < value;
        const star = (
          <Ionicons name={filled ? 'star' : 'star-outline'} size={size} color={filled ? STAR_COLOR : EMPTY_COLOR} />
        );
        return onChange ? (
          <Pressable key={i} onPress={() => onChange(i + 1)} hitSlop={6} style={styles.star}>
            {star}
          </Pressable>
        ) : (
          <View key={i} style={styles.starReadOnly}>
            {star}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { marginRight: 6 },
  starReadOnly: { marginRight: 2 },
});

export default StarRating;
