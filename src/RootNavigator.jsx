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

  return (
    <BookStack.Navigator
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
        sharedElements={(route) => [route.params?.book.bookId]}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: fadeScreen,
        }}
      />
      <BookStack.Screen
        name="BookSearch"
        component={BookSearchScreen}
        sharedElements={() => ['search']}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: fadeScreen,
        }}
      />
    </BookStack.Navigator>
  );
}

export default RootNavigator;
