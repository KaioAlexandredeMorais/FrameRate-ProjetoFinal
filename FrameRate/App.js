import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { MoviesProvider } from './src/context/MoviesContext'; // mudou-pedro
import { colors } from './src/theme';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

export default function App() {
  return (
    <AuthProvider>
      {/* mudou-pedro: MoviesProvider envolve o app (estado global de reviews e lista) */}
      <MoviesProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" backgroundColor={colors.background} />
          <RootNavigator />
        </NavigationContainer>
      </MoviesProvider>
    </AuthProvider>
  );
}