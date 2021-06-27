import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';

import getTheme from './src/theme';
import RootNavigator from './src/RootNavigator';

import ToastContainer from './src/components/Toast';
import StatusModal from './src/components/StatusModal';

export default function App() {
  enableScreens(false);
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={getTheme(scheme)}>
      <StatusBar />
      <StatusModal />
      <RootNavigator />
      <ToastContainer />
    </NavigationContainer>
  );
}
