import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import FarmDetailsScreen from '../screens/FarmDetailsScreen';
import { Farm } from '@swissfarm/types';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Tabs: undefined;
  FarmDetails: { farm: Farm };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
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
          options={({ route }) => ({ title: route.params.farm.name })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}