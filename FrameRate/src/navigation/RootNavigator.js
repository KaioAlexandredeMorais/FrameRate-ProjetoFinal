
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';
import MovieDetailsScreen from '../screens/MovieDetailsScreen';

import { colors } from '../theme';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="MovieDetails"
        component={MovieDetailsScreen}
        options={{
          title: 'Detalhes do filme',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

export default RootNavigator;