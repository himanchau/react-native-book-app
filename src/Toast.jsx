import React, { useContext, useState } from 'react';
import { View } from 'react-native';

import Text from './components/Text';

const ToastContext = React.createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState('Hello There');

  return (
    <ToastContext.Provider value={[toast, setToast]}>
      <View style={{
        position: 'absolute', zIndex: 100, backgroundColor: 'red', width: 100, height: 100,
      }}
      >
        <Text>{toast}</Text>
      </View>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) throw new Error('Toast provider not found!');

  const [toast, setToast] = context;

  return {
    toast,
    setToast,
  };
}
