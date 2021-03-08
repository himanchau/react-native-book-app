import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppearanceProvider, useColorScheme } from 'react-native-appearance';

import getTheme from './src/theme';
import RootNavigator from './src/RootNavigator';
import { BooksProvider } from './src/BookStore';
import { ModalProvider } from './src/components/StatusModal';

export default function App() {
  const scheme = useColorScheme();

  return (
    <AppearanceProvider>
      <NavigationContainer theme={getTheme(scheme)}>
        <BooksProvider>
          <ModalProvider>
            <StatusBar />
            <RootNavigator />
          </ModalProvider>
        </BooksProvider>
      </NavigationContainer>
    </AppearanceProvider>
  );
}
