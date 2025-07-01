/**
 * @fileoverview Chess game state management store
 * @module renderer/stores/useChessStore
 * 
 * Manages chess game state, board position, move navigation,
 * and game loading using Zustand with persistence.
 * 
 * @requires zustand
 * @requires chess.js
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Chess, Square } from 'chess.js';
import { ChessGame, GameState, DragState } from '../../shared/types/chess';

/**
 * Chess store state interface
 */
interface ChessStoreState extends GameState {
  /** Drag and drop state */
  dragState: DragState;
  
  /** All loaded games */
  games: ChessGame[];
  
  /** Actions */
  loadGame: (game: ChessGame) => void;
  addGames: (games: ChessGame[]) => void;
  removeGame: (gameId: string) => void;
  clearGames: () => void;
  goToMove: (moveIndex: number) => void;
  goToStart: () => void;
  goToEnd: () => void;
  nextMove: () => void;
  previousMove: () => void;
  flipBoard: () => void;
  selectSquare: (square: Square) => void;
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  startDrag: (square: Square) => void;
  endDrag: (targetSquare: Square | null) => void;
  clearSelection: () => void;
  resetGame: () => void;
}

/**
 * Creates initial game state
 */
function createInitialState(): GameState {
  return {
    chess: new Chess(),
    currentGame: null,
    currentMoveIndex: -1, // -1 means starting position
    boardFlipped: false,
    selectedSquare: null,
    possibleMoves: [],
    lastMove: null,
    isLoading: false,
  };
}

/**
 * Updates the chess position to a specific move
 */
function updateChessPosition(chess: Chess, game: ChessGame | null, moveIndex: number): void {
  if (!game) return;
  
  // Reset to starting position
  chess.reset();
  
  // Apply moves up to the current index
  for (let i = 0; i <= moveIndex && i < game.moves.length; i++) {
    const move = game.moves[i];
    try {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    } catch (error) {
      console.error(`Failed to apply move ${i}:`, move, error);
      break;
    }
  }
}

/**
 * Gets possible moves for a square
 */
function getPossibleMoves(chess: Chess, square: Square): Square[] {
  const moves = chess.moves({ square, verbose: true });
  return moves.map(move => move.to);
}

/**
 * Gets the last move for highlighting
 */
function getLastMove(game: ChessGame | null, moveIndex: number): { from: Square; to: Square } | null {
  if (!game || moveIndex < 0 || moveIndex >= game.moves.length) {
    return null;
  }
  
  const move = game.moves[moveIndex];
  return { from: move.from, to: move.to };
}

/**
 * Chess game store with persistence and move navigation
 */
export const useChessStore = create<ChessStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createInitialState(),
        games: [],
        dragState: {
          isDragging: false,
          draggedPiece: null,
          sourceSquare: null,
          targetSquare: null,
        },

        /**
         * Loads a new chess game
         */
        loadGame: (game: ChessGame) => {
          const newChess = new Chess();
          set((state) => ({
            chess: newChess,
            currentGame: game,
            currentMoveIndex: -1,
            selectedSquare: null,
            possibleMoves: [],
            lastMove: null,
            isLoading: false,
            // Add game to games list if not already present
            games: state.games.some(g => g.id === game.id) 
              ? state.games 
              : [...state.games, game],
          }));
        },

        /**
         * Adds multiple games to the list
         */
        addGames: (games: ChessGame[]) => {
          set((state) => {
            const existingIds = new Set(state.games.map(g => g.id));
            const newGames = games.filter(g => !existingIds.has(g.id));
            return {
              games: [...state.games, ...newGames],
            };
          });
        },

        /**
         * Removes a game from the list
         */
        removeGame: (gameId: string) => {
          set((state) => ({
            games: state.games.filter(g => g.id !== gameId),
            // Clear current game if it's the one being removed
            currentGame: state.currentGame?.id === gameId ? null : state.currentGame,
          }));
        },

        /**
         * Clears all games
         */
        clearGames: () => {
          set({
            games: [],
            currentGame: null,
            currentMoveIndex: -1,
          });
        },

        /**
         * Navigates to a specific move
         */
        goToMove: (moveIndex: number) => {
          const { chess, currentGame } = get();
          if (!currentGame) return;

          const clampedIndex = Math.max(-1, Math.min(moveIndex, currentGame.moves.length - 1));
          updateChessPosition(chess, currentGame, clampedIndex);

          set({
            currentMoveIndex: clampedIndex,
            lastMove: getLastMove(currentGame, clampedIndex),
            selectedSquare: null,
            possibleMoves: [],
          });
        },

        /**
         * Goes to the starting position
         */
        goToStart: () => {
          get().goToMove(-1);
        },

        /**
         * Goes to the final position
         */
        goToEnd: () => {
          const { currentGame } = get();
          if (currentGame) {
            get().goToMove(currentGame.moves.length - 1);
          }
        },

        /**
         * Goes to the next move
         */
        nextMove: () => {
          const { currentMoveIndex } = get();
          get().goToMove(currentMoveIndex + 1);
        },

        /**
         * Goes to the previous move
         */
        previousMove: () => {
          const { currentMoveIndex } = get();
          get().goToMove(currentMoveIndex - 1);
        },

        /**
         * Flips the board orientation
         */
        flipBoard: () => {
          set((state) => ({
            boardFlipped: !state.boardFlipped,
          }));
        },

        /**
         * Selects a square and shows possible moves
         */
        selectSquare: (square: Square) => {
          const { chess, selectedSquare } = get();
          
          // If clicking the same square, deselect
          if (selectedSquare === square) {
            set({
              selectedSquare: null,
              possibleMoves: [],
            });
            return;
          }

          // If we have a selected square, try to make a move
          if (selectedSquare) {
            const moveSuccess = get().makeMove(selectedSquare, square);
            if (moveSuccess) {
              set({
                selectedSquare: null,
                possibleMoves: [],
              });
              return;
            }
          }

          // Select the new square and show possible moves
          const piece = chess.get(square);
          if (piece && piece.color === chess.turn()) {
            const possibleMoves = getPossibleMoves(chess, square);
            set({
              selectedSquare: square,
              possibleMoves,
            });
          } else {
            set({
              selectedSquare: null,
              possibleMoves: [],
            });
          }
        },

        /**
         * Attempts to make a move
         */
        makeMove: (from: Square, to: Square, promotion?: string) => {
          const { chess } = get();
          
          try {
            const move = chess.move({ from, to, promotion });
            if (move) {
              // Move was successful - we could add this to game history
              // For now, we'll just update the last move highlighting
              set({
                lastMove: { from, to },
                selectedSquare: null,
                possibleMoves: [],
              });
              return true;
            }
          } catch (error) {
            console.warn('Invalid move attempted:', { from, to, promotion }, error);
          }
          
          return false;
        },

        /**
         * Starts drag operation
         */
        startDrag: (square: Square) => {
          const { chess } = get();
          const piece = chess.get(square);
          
          if (piece && piece.color === chess.turn()) {
            const possibleMoves = getPossibleMoves(chess, square);
            set({
              dragState: {
                isDragging: true,
                draggedPiece: piece,
                sourceSquare: square,
                targetSquare: null,
              },
              selectedSquare: square,
              possibleMoves,
            });
          }
        },

        /**
         * Ends drag operation
         */
        endDrag: (targetSquare: Square | null) => {
          const { dragState } = get();
          
          if (dragState.isDragging && dragState.sourceSquare && targetSquare) {
            get().makeMove(dragState.sourceSquare, targetSquare);
          }
          
          set({
            dragState: {
              isDragging: false,
              draggedPiece: null,
              sourceSquare: null,
              targetSquare: null,
            },
            selectedSquare: null,
            possibleMoves: [],
          });
        },

        /**
         * Clears current selection
         */
        clearSelection: () => {
          set({
            selectedSquare: null,
            possibleMoves: [],
          });
        },

        /**
         * Resets the game state
         */
        resetGame: () => {
          set(createInitialState());
        },
      }),
      {
        name: 'chess-storage',
        partialize: (state) => ({
          currentMoveIndex: state.currentMoveIndex,
          boardFlipped: state.boardFlipped,
        }),
      }
    ),
    { name: 'chess-store' }
  )
); 