/**
 * GameContext — v3
 * Fixed: WPM tracked via refs, endTime set properly, added combo system.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

const GAME_STATES = {
  MODE_SELECT: 'MODE_SELECT',
  IDLE: 'IDLE',
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
};

const ACTION_TYPES = {
  START_GAME: 'START_GAME',
  SET_PLAYER_NAME: 'SET_PLAYER_NAME',
  INCREMENT_SCORE: 'INCREMENT_SCORE',
  LOSE_LIFE: 'LOSE_LIFE',
  WORD_COMPLETED: 'WORD_COMPLETED',
  KEY_PRESSED: 'KEY_PRESSED',
  CORRECT_KEY: 'CORRECT_KEY',
  GAME_OVER: 'GAME_OVER',
  RESET: 'RESET',
  UPDATE_WPM: 'UPDATE_WPM',
  SET_LEVEL: 'SET_LEVEL',
  SET_GAME_MODE: 'SET_GAME_MODE',
  GOTO_MODE_SELECT: 'GOTO_MODE_SELECT',
  JOIN_LOBBY: 'JOIN_LOBBY',
};

const initialState = {
  gameState: GAME_STATES.MODE_SELECT,
  playerName: '',
  score: 0,
  lives: 3,
  maxLives: 3,
  wordsCompleted: 0,
  totalKeystrokes: 0,
  correctKeystrokes: 0,
  currentStreak: 0,
  highestStreak: 0,
  wpm: 0,
  level: 1,
  startTime: null,
  endTime: null,
  scoreSaved: false, // Prevent duplicate saves
  gameMode: 'SINGLE', // 'SINGLE' or 'MULTI'
};

function gameReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_PLAYER_NAME:
      return { ...state, playerName: action.payload };

    case ACTION_TYPES.SET_GAME_MODE:
      return { ...state, gameMode: action.payload, gameState: action.payload === 'MULTI' ? GAME_STATES.MODE_SELECT : GAME_STATES.IDLE };

    case ACTION_TYPES.GOTO_MODE_SELECT:
      return { ...state, gameState: GAME_STATES.MODE_SELECT };

    case ACTION_TYPES.JOIN_LOBBY:
      return { ...state, gameState: GAME_STATES.LOBBY };

    case ACTION_TYPES.START_GAME:
      return {
        ...initialState,
        gameState: GAME_STATES.PLAYING,
        playerName: state.playerName,
        gameMode: state.gameMode,
        startTime: Date.now(),
      };

    case ACTION_TYPES.INCREMENT_SCORE:
      return { ...state, score: state.score + action.payload };

    case ACTION_TYPES.WORD_COMPLETED: {
      const newStreak = state.currentStreak + 1;
      const scoreMultiplier = Math.min(newStreak, 5);
      const baseScore = action.payload.length * 10;
      const bonusScore = baseScore * scoreMultiplier;
      return {
        ...state,
        score: state.score + bonusScore,
        wordsCompleted: state.wordsCompleted + 1,
        currentStreak: newStreak,
        highestStreak: Math.max(state.highestStreak, newStreak),
      };
    }

    case ACTION_TYPES.LOSE_LIFE: {
      const newLives = state.lives - 1;
      if (newLives <= 0) {
        return {
          ...state,
          lives: 0,
          currentStreak: 0,
          gameState: GAME_STATES.GAME_OVER,
          endTime: Date.now(),
        };
      }
      return { ...state, lives: newLives, currentStreak: 0 };
    }

    case ACTION_TYPES.KEY_PRESSED:
      return { ...state, totalKeystrokes: state.totalKeystrokes + 1 };

    case ACTION_TYPES.CORRECT_KEY:
      return { ...state, correctKeystrokes: state.correctKeystrokes + 1 };

    case ACTION_TYPES.UPDATE_WPM:
      return { ...state, wpm: action.payload };

    case ACTION_TYPES.SET_LEVEL:
      return { ...state, level: action.payload };

    case ACTION_TYPES.GAME_OVER:
      return { ...state, gameState: GAME_STATES.GAME_OVER, endTime: Date.now() };

    case ACTION_TYPES.RESET:
      return { ...initialState, playerName: state.playerName, gameMode: state.gameMode, gameState: state.gameMode === 'SINGLE' ? GAME_STATES.IDLE : GAME_STATES.MODE_SELECT };

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = useMemo(() => ({
    setPlayerName: (name) =>
      dispatch({ type: ACTION_TYPES.SET_PLAYER_NAME, payload: name }),
    startGame: () =>
      dispatch({ type: ACTION_TYPES.START_GAME }),
    wordCompleted: (word) =>
      dispatch({ type: ACTION_TYPES.WORD_COMPLETED, payload: word }),
    loseLife: () =>
      dispatch({ type: ACTION_TYPES.LOSE_LIFE }),
    keyPressed: () =>
      dispatch({ type: ACTION_TYPES.KEY_PRESSED }),
    correctKey: () =>
      dispatch({ type: ACTION_TYPES.CORRECT_KEY }),
    updateWpm: (wpm) =>
      dispatch({ type: ACTION_TYPES.UPDATE_WPM, payload: wpm }),
    setLevel: (level) =>
      dispatch({ type: ACTION_TYPES.SET_LEVEL, payload: level }),
    gameOver: () =>
      dispatch({ type: ACTION_TYPES.GAME_OVER }),
    reset: () =>
      dispatch({ type: ACTION_TYPES.RESET }),
    setGameMode: (mode) => 
      dispatch({ type: ACTION_TYPES.SET_GAME_MODE, payload: mode }),
    gotoModeSelect: () => 
      dispatch({ type: ACTION_TYPES.GOTO_MODE_SELECT }),
    joinLobby: () => 
      dispatch({ type: ACTION_TYPES.JOIN_LOBBY }),
  }), []);

  return (
    <GameContext.Provider value={{ state, actions, GAME_STATES }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

export { GAME_STATES, ACTION_TYPES };
