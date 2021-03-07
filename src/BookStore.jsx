import React, { useEffect, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// context for gloabal book list
const BooksContext = React.createContext();

// global provider for books
const BooksProvider = ({ children }) => {
  const [books, dispatch] = useState([]);

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
  const [books, setBooks] = useContext(BooksContext);

  // add book to list
  function addBook(book, list) {
    setBooks((arr) => [{
      ...book,
      status: list,
      addedOn: Date.now(),
    }, ...arr]);
  }

  // update or remove from list
  function updateBook(book, list) {
    setBooks((arr) => {
      const index = arr.findIndex((b) => b.bookId === book.bookId);
      arr.splice(index, 1);
      return [{ ...book, status: list }, ...arr];
    });
  }

  // remove book from list
  function removeBook(book) {
    setBooks((arr) => {
      const index = arr.findIndex((b) => b.bookId === book.bookId);
      arr.splice(index, 1);
      return [...arr];
    });
  }

  return {
    books, addBook, updateBook, removeBook,
  };
}

export { BooksProvider, BooksContext, useBookStore };
