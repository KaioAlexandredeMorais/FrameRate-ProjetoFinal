// codigo-pedro
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getImageUrl } from '../services/tmdbService';
import { colors } from '../theme';

function PosterThumb({ posterPath, width = 64 }) {
  const [failed, setFailed] = useState(false);
  const uri = getImageUrl(posterPath, 'w185');
  const size = { width, height: width * 1.5 };

  if (!uri || failed) {
    return (
      <View style={[styles.poster, styles.placeholder, size]}>
        <Image source={require('../../assets/no-image-small.png')} style={styles.icon} resizeMode="contain" />
      </View>
    );
  }
  return <Image source={{ uri }} style={[styles.poster, size]} onError={() => setFailed(true)} />;
}

const styles = StyleSheet.create({
  poster: { borderRadius: 8, backgroundColor: colors.surface },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  icon: { width: 28, height: 28, opacity: 0.9 },
});

export default PosterThumb;
