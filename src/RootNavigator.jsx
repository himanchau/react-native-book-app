import React from 'react';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';

import BooksScreen from './screens/BooksScreen';
import BookListScreen from './screens/BookListScreen';
import BookDetailsScreen from './screens/BookDetailsScreen';
import BookSearchScreen from './screens/BookSearchScreen';

// Root Stack of App
function RootNavigator() {
  const BookStack = createSharedElementStackNavigator();

  const fadeScreen = ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });

  const bookTransition = {
    animation: 'spring',
    config: {
      mass: 4,
      damping: 100,
      stiffness: 900,
    },
  };

  const searchTranstion = {
    animation: 'spring',
    config: {
      mass: 3,
      damping: 200,
      stiffness: 600,
    },
  };

  return (
    <BookStack.Navigator
      initialRouteName="BookList"
      screenOptions={{
        headerShown: false,
        cardOverlayEnabled: true,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <BookStack.Screen name="Books" component={BooksScreen} />
      <BookStack.Screen name="BookList" component={BookListScreen} />
      <BookStack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        sharedElements={(route, otherRoute) => (['BookList', 'BookSearch', 'BookDetails'].includes(otherRoute.name) ? [route.params.book.bookId] : [])}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: fadeScreen,
          transitionSpec: {
            open: bookTransition,
            close: bookTransition,
          },
        }}
      />
      <BookStack.Screen
        name="BookSearch"
        component={BookSearchScreen}
        sharedElements={(_, otherRoute) => (otherRoute.name === 'BookList' ? [{
          id: 'search',
          animation: 'fade',
        }] : [])}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: fadeScreen,
          transitionSpec: {
            open: searchTranstion,
            close: searchTranstion,
          },
        }}
      />
    </BookStack.Navigator>
  );
}

export default RootNavigator;
