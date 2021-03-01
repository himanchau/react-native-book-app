import React, { useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useImmer } from 'use-immer';

// context for gloabal book list
const BooksContext = React.createContext();

// global provider for books
const BooksProvider = ({ children }) => {
  const [books, dispatch] = useImmer([]);

  // load books from async storage
  async function loadBooks() {
    const json = await AsyncStorage.getItem('@lists');
    const data = json ? JSON.parse(json) : [];
    dispatch(() => data);
  }

  // save books to async storage
  async function saveBooks() {
    await AsyncStorage.setItem('@lists', JSON.stringify(books));
  }

  // load books on initialize
  useEffect(() => {
    loadBooks();
  }, []);

  // save books if changed
  useEffect(() => {
    if (books.length) saveBooks();
  }, [books]);

  // return the provider
  return (
    <BooksContext.Provider value={[books, dispatch]}>
      {children}
    </BooksContext.Provider>
  );
};

// custom bookstore hook
function useBookStore() {
  const [books, dispatch] = useContext(BooksContext);

  // add book to list
  function addBook(book, list) {
    dispatch((draft) => {
      draft.unshift({
        ...book,
        status: list,
        addedOn: Date.now(),
      });
    });
  }

  // update or remove from list
  function updateBook(book, list) {
    dispatch((draft) => {
      const index = draft.findIndex((b) => b.bookId === book.bookId);
      if (index !== -1) draft[index].status = list;
    });
  }

  // remove book from list
  function removeBook(book) {
    dispatch((draft) => {
      const index = draft.findIndex((b) => b.bookId === book.bookId);
      if (index !== -1) draft.splice(index, 1);
    });
  }

  return {
    books, addBook, updateBook, removeBook,
  };
}

export { BooksProvider, BooksContext, useBookStore };
