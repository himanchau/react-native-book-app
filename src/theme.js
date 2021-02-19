import Constants from 'expo-constants';
import { useWindowDimensions } from 'react-native';

/* Return the App Theme Object */
export default function getTheme(scheme) {
  const { width, height } = useWindowDimensions();
  const dark = scheme === 'dark';
  const normalize = (size, max) => Math.min(size * (width / 375), max);

  return {
    dark,
    width,
    height,
    margin: normalize(20, 35),
    colors: {
      primary: '#16a085',
      text: dark ? '#f2f2f2' : '#1a1a1a',
      card: dark ? '#000000' : '#ffffff',
      background: dark ? '#1a1a1a' : '#f2f2f2',
      border: dark ? '#f2f2f2dd' : '#1a1a1add',
      button: dark ? '#100f0add' : '#f6f5f0dd',
    },
    status: Constants.statusBarHeight,
    navbar: Constants.statusBarHeight + 44,
    normalize,
  };
}
