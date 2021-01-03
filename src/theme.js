import Constants from 'expo-constants';
import { useWindowDimensions } from 'react-native';

/* Return the App Theme Object */
export default function getTheme(scheme) {
  const { width, height } = useWindowDimensions();
  const dark = scheme === 'dark';

  return {
    dark,
    width,
    height,
    margin: 20,
    colors: {
      primary: '#2ecc71',
      text: dark ? '#f6f5f0' : '#100f0a',
      card: dark ? '#000000' : '#ffffff',
      background: dark ? '#100f0a' : '#f6f5f0',
      border: dark ? '#f6f5f033' : '#100f0add',
      button: dark ? '#100f0add' : '#f6f5f0dd',
      shadow: dark ? '#739ff2' : '#1660e9',
    },
    status: Constants.statusBarHeight,
    navbar: Constants.statusBarHeight + 44,
    normalize: (size, max) => Math.min(size * (width / 375), max),
  };
}
