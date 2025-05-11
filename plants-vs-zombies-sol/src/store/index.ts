import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import { GameState } from '../types/game';

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
});

export type RootState = {
  game: GameState;
};

export type AppDispatch = typeof store.dispatch; 