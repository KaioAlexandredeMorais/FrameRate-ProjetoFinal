import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components';

import TabNavigator from './TabNavigator';
import MovieDetailsScreen from '../screens/MovieDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) return <Loading />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} options={{ title: 'Detalhes' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
        </>
      )}
    </Stack.Navigator>
  );
}