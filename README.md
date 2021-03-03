## React Native Book List App

This is a sample application that makes use of reanimateed, shared elements transitions and lottie to deliver a smooth native experience with delightlful animations.

![](book.gif) ![](dbook.gif)

### Goals
- [x] Find and save books in list
- [x] Native app experience
- [x] UI thread 60 fps animations
- [x] Shared element transtions
- [x] Flatlist animations
- [x] Drag to navigate / close (AppStore stlye)
- [x] Reanimated 2 support
- [x] Integrated Lottie animations
- [x] Haptics for nagivation
- [x] Expo without ejecting
- [x] Global themeing with light & dark modes
- [x] AsyncStorage for lists
- [x] Clean code with ES Lint
- [x] iOS + Android support

### Code Structure
There are 3 main screens: list screen, search screen and book details. There's a fun intro / welcome screen with lottie animations as well.  
Important Code:  
`src/screens/...jsx` App Screens  
`src/components/...jsx` Reusable Components  
`src/anims/...json` Lotties Animations  
`src/theme.js` Themes for light and dark  
`src/RootNavigator.jsx` App navigation

### Dependencies
I wanted to keep the dependencies outside of React Native & Expo to a minimum. The app relies on the following libraries as core, others you see in package.json are optional.
```
react-navigation
expo-haptics (remove if you don't want haptics)
lottie-react-native (remove if you don't need lottie)
react-native-reanimated
react-native-shared-element
react-navigation-shared-element
```

### Reference Material
Reanimated 2  
https://docs.swmansion.com/react-native-reanimated/docs

Shared Element Navigation  
https://github.com/IjzerenHein/react-navigation-shared-element/blob/navigation-v5/README.md

Lottie Animations  
https://github.com/lottie-react-native/lottie-react-native

**Android**  
If you're running into issues with Android please make sure to check that reanimated and shared navigation element (v5) are installed properly with the right versions and Layout Animations have been enabled.

**React Native Community**  
Was this helpful? Want to see more code like this? Would you like this as an template? Just want share your thoughts? Catch me at [@himanshuchauu](https://twitter.com/himanchauu).

[Caffeine Appreciation](https://www.buymeacoffee.com/himanchau)

