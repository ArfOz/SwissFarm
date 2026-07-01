import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import FarmDetailsScreen from '../screens/FarmDetailsScreen';
import SuggestScreen from '../screens/SuggestScreen';
import { Farm } from '@helvetfarm/types';
import { colors } from '../theme/colors';
import { LocaleProvider } from '../i18n/LocaleContext';

export type RootStackParamList = {
  Tabs: undefined;
  FarmDetails: { farm: Farm };
  Suggest: { farmId: string; farmName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <LocaleProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerTintColor: colors.textOnPrimary,
            headerStyle: { backgroundColor: colors.primary },
            headerBackTitle: 'Back',
          }}
        >
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FarmDetails"
            component={FarmDetailsScreen}
            options={{ title: 'Farm Details' }}
          />
          <Stack.Screen
            name="Suggest"
            component={SuggestScreen}
            options={{ title: 'Öneri Gönder' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LocaleProvider>
  );
}
