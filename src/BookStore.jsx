import React, { useEffect, useReducer, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// context for gloabal book list
const StateContext = React.createContext();
const DispatchContext = React.createContext();

// load books from async storage
async function loadBooks(dispatch) {
  const json = await AsyncStorage.getItem('@lists');
  const data = json ? JSON.parse(json) : [];
  dispatch({ type: 'SET_BOOKS', payload: data });
}

// save books to async storage
async function saveBooks(state) {
  AsyncStorage.setItem('@lists', JSON.stringify(state));
}

// reducer for state
function reducer(state, { type, payload }) {
  let newState = [];
  let index = -1;

  // update books state
  switch (type) {
    case 'SET_BOOKS':
      newState = payload;
      break;
    case 'ADD_BOOK':
      newState = [{
        ...payload.book,
        status: payload.list,
        addedOn: Date.now(),
      }, ...state];
      break;
    case 'UPDATE_BOOK':
      index = state.findIndex((b) => b.bookId === payload.book.bookId);
      state.splice(index, 1);
      newState = [{
        ...payload.book,
        status: payload.list,
      }, ...state];
      break;
    case 'REMOVE_BOOK':
      index = state.findIndex((b) => b.bookId === payload.book.bookId);
      state.splice(index, 1);
      newState = [...state];
      break;
    default:
      throw new Error('Invalid action!');
  }

  // save to store & return
  saveBooks(newState);
  return newState;
}

// context provider with default state
export function BooksProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, []);

  // load books on initialize
  useEffect(() => {
    loadBooks(dispatch);
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// state consumer hook
export function useBookState() {
  const context = useContext(StateContext);
  if (context === undefined) throw new Error('useBookState must be used within a Provider');
  return context;
}

// state dispatcher hook
export function useBookDispatch() {
  const context = useContext(DispatchContext);
  if (context === undefined) throw new Error('useBookDispatch must be used within a Provider');
  return context;
}

// combine as [state, dispatch]
export function useBookStore() {
  return [useBookState(), useBookDispatch()];
}
