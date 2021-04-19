import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import getTheme from './src/theme';
import RootNavigator from './src/RootNavigator';

import ToastContainer from './src/components/Toast';
import StatusModal from './src/components/StatusModal';

export default function App() {
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
