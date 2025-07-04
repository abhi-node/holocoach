/**
 * @fileoverview Interactive Chess Board Component
 * @module renderer/components/chess/ChessBoardComponent
 * 
 * Renders an interactive chess board with piece display, move highlighting,
 * drag-and-drop functionality, and coordinate labels.
 * 
 * @requires react
 * @requires chess.js
 */

import { useCallback, useMemo } from 'react';
import { Square } from 'chess.js';
import { useChessStore } from '../../stores/useChessStore';
import { SquareCoordinates } from '../../../shared/types/chess';
import { ChessPiece } from './ChessPieces';

/**
 * Gets square coordinates for rendering
 */
function getSquareCoordinates(
  square: Square,
  chess: any,
  selectedSquare: Square | null,
  possibleMoves: Square[],
  lastMove: { from: Square; to: Square } | null
): SquareCoordinates {
  const file = square[0];
  const rank = square[1];
  const fileIndex = file.charCodeAt(0) - 97; // a=0, b=1, etc.
  const rankIndex = parseInt(rank) - 1; // 1=0, 2=1, etc.
  
  // Determine if square is light or dark
  // In chess, the bottom-right corner (h1) should be a light square
  // a1 should be dark, h1 should be light
  const isLight = (fileIndex + rankIndex) % 2 === 1;
  
  // Get piece on this square
  const piece = chess.get(square);
  
  return {
    file,
    rank,
    square,
    isLight,
    piece,
    isHighlighted: false, // Can be used for check highlighting
    isSelected: selectedSquare === square,
    isPossibleMove: possibleMoves.includes(square),
    isLastMove: lastMove ? (lastMove.from === square || lastMove.to === square) : false,
  };
}

/**
 * Individual chess square component
 */
interface ChessSquareProps {
  coordinates: SquareCoordinates;
  onSquareClick: (square: Square) => void;
  onDragStart: (square: Square) => void;
  onDragEnd: (square: Square) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (square: Square) => void;
}

function ChessSquare({
  coordinates,
  onSquareClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: ChessSquareProps): JSX.Element {
  const { square, isLight, piece, isSelected, isPossibleMove, isLastMove } = coordinates;

  const squareClasses = [
    'chess-square',
    isLight ? 'light' : 'dark',
    isSelected && 'selected',
    isPossibleMove && 'possible-move',
    isLastMove && 'last-move'
  ].filter(Boolean).join(' ');

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (piece) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', square);
      onDragStart(square);
    }
  }, [piece, square, onDragStart]);

  const handleDragEnd = useCallback(() => {
    onDragEnd(square);
  }, [square, onDragEnd]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onDrop(square);
  }, [square, onDrop]);

  const handleClick = useCallback(() => {
    onSquareClick(square);
  }, [square, onSquareClick]);

  return (
    <div
      className={squareClasses}
      onClick={handleClick}
      onDragOver={onDragOver}
      onDrop={handleDrop}
    >
      {piece && (
        <div
          className="chess-piece-container"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ChessPiece
            piece={piece.type}
            color={piece.color}
            size={50}
            className="chess-piece-svg"
          />
        </div>
      )}
      {isPossibleMove && !piece && (
        <div className="move-indicator" />
      )}
      {isPossibleMove && piece && (
        <div className="capture-indicator" />
      )}
    </div>
  );
}

/**
 * Board coordinates component
 */
interface BoardCoordinatesProps {
  boardFlipped: boolean;
}

function BoardCoordinates({ boardFlipped }: BoardCoordinatesProps): JSX.Element {
  const files = boardFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = boardFlipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <>
      {/* Rank labels (left side) */}
      <div className="rank-coordinates">
        {ranks.map(rank => (
          <div key={rank} className="rank-label">
            {rank}
          </div>
        ))}
      </div>
      
      {/* File labels (bottom) */}
      <div className="file-coordinates">
        {files.map(file => (
          <div key={file} className="file-label">
            {file}
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Main chess board component
 */
export function ChessBoardComponent(): JSX.Element {
  const {
    chess,
    boardFlipped,
    selectedSquare,
    possibleMoves,
    lastMove,
    selectSquare,
    startDrag,
    endDrag,
    flipBoard
  } = useChessStore();

  // Generate all squares in correct order
  const squares = useMemo(() => {
    console.log('Regenerating squares, boardFlipped:', boardFlipped);
    const files = boardFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = boardFlipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    const result: SquareCoordinates[] = [];
    
    for (const rank of ranks) {
      for (const file of files) {
        const square = `${file}${rank}` as Square;
        result.push(getSquareCoordinates(square, chess, selectedSquare, possibleMoves, lastMove));
      }
    }
    
    return result;
  }, [chess, boardFlipped, selectedSquare, possibleMoves, lastMove]);

  const handleSquareClick = useCallback((square: Square) => {
    selectSquare(square);
  }, [selectSquare]);

  const handleDragStart = useCallback((square: Square) => {
    startDrag(square);
  }, [startDrag]);

  const handleDragEnd = useCallback((square: Square) => {
    endDrag(square);
  }, [endDrag]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetSquare: Square) => {
    endDrag(targetSquare);
  }, [endDrag]);

  return (
    <div className="chess-board-container">
      {/* Flip board button positioned above */}
      <div className="chess-board-header">
        <button 
          className="flip-board-button"
          onClick={() => {
            console.log('Flip board button clicked, current boardFlipped:', boardFlipped);
            flipBoard();
          }}
          title="Flip board"
        >
          ⟲ Flip Board {boardFlipped ? '(Flipped)' : '(Normal)'}
        </button>
      </div>
      
      {/* Board wrapper - fixed size */}
      <div className="chess-board-wrapper">
        <BoardCoordinates boardFlipped={boardFlipped} />
        
        <div className="chess-board">
          {squares.map((coordinates) => (
            <ChessSquare
              key={coordinates.square}
              coordinates={coordinates}
              onSquareClick={handleSquareClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 