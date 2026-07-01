import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListScreen from '../screens/ListScreen';
import FarmsMapScreen from '../screens/FarmsMapScreen'; 
import ContactScreen from '../screens/ContactScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import { t } from '../i18n/translations';
import { useLocale } from '../i18n/LocaleContext';

export type TabParamList = {
  Map: undefined;
  List: undefined; 
  Contact: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  // Re-render on locale change so tab labels update
  useLocale();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={FarmsMapScreen}
        options={{
          tabBarLabel: t('tab.map'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{
          tabBarLabel: t('tab.list'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          tabBarLabel: t('tab.contact'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📬</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('tab.settings'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
