/**
 * @fileoverview Modern SVG Chess Piece Components
 * @module renderer/components/chess/ChessPieces
 * 
 * Provides crisp, scalable SVG chess pieces that look consistent
 * across all platforms and themes.
 * 
 * @requires react
 */

import { PieceSymbol, Color } from 'chess.js';

interface ChessPieceSVGProps {
  size?: number;
  className?: string;
}

// White pieces
export function WhiteKing({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="none" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6" strokeLinejoin="miter"/>
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="currentColor" strokeLinejoin="miter"/>
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="currentColor"/>
        <path d="M20 8h5" strokeLinejoin="miter"/>
        <path d="M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.906 14 6.997 19.85c-2.497 5.65 4.853 9 4.853 9" stroke="currentColor"/>
        <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="currentColor"/>
      </g>
    </svg>
  );
}

export function WhiteQueen({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/>
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V14l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 14l2 12z" strokeLinecap="butt"/>
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt"/>
        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/>
      </g>
    </svg>
  );
}

export function WhiteRook({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt"/>
        <path d="M34 14l-3 3H14l-3-3" fill="none" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M31 17v12.5H14V17" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" fill="none" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M11 14h23" fill="none" stroke="currentColor" strokeLinejoin="miter"/>
      </g>
    </svg>
  );
}

export function WhiteBishop({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="currentColor">
          <path d="M9 36c3.5-1 10.5-1 13 0 3.5-1 10.5-1 14 0" strokeLinecap="butt"/>
          <path d="M15 32c2.5 1.5 12.5 1.5 15 0 0-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 2 0 .5 0 2z" strokeLinecap="butt"/>
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
          <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" strokeLinecap="butt"/>
        </g>
      </g>
    </svg>
  );
}

export function WhiteKnight({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="currentColor"/>
        <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="currentColor"/>
        <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="currentColor" stroke="currentColor"/>
        <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="currentColor" stroke="currentColor"/>
      </g>
    </svg>
  );
}

export function WhitePawn({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47C27.06 24.84 28 23.03 28 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="currentColor"/>
      </g>
    </svg>
  );
}

// Black pieces
export function BlackKing({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6" strokeLinejoin="miter"/>
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="currentColor" strokeLinejoin="miter"/>
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="currentColor"/>
        <path d="M20 8h5" strokeLinejoin="miter"/>
      </g>
    </svg>
  );
}

export function BlackQueen({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="currentColor" stroke="none">
          <circle cx="6" cy="12" r="2.75"/>
          <circle cx="14" cy="9" r="2.75"/>
          <circle cx="22.5" cy="8" r="2.75"/>
          <circle cx="31" cy="9" r="2.75"/>
          <circle cx="39" cy="12" r="2.75"/>
        </g>
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 7.5 13.5 9 26z" strokeLinecap="butt"/>
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt"/>
        <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" strokeLinecap="butt"/>
        <path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="currentColor"/>
      </g>
    </svg>
  );
}

export function BlackRook({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" fill="currentColor"/>
        <path d="M14 29.5v-13h17v13H14z" fill="currentColor" stroke="currentColor" strokeLinecap="butt" strokeLinejoin="miter"/>
        <path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" fill="currentColor" strokeLinecap="butt"/>
        <path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23" fill="none" stroke="currentColor" strokeLinejoin="miter"/>
      </g>
    </svg>
  );
}

export function BlackBishop({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="currentColor">
          <path d="M9 36c3.5-1 10.5-1 13 0 3.5-1 10.5-1 14 0" strokeLinecap="butt"/>
          <path d="M15 32c2.5 1.5 12.5 1.5 15 0 0-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 2 0 .5 0 2z" strokeLinecap="butt"/>
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
          <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" strokeLinecap="butt" fill="none" stroke="currentColor"/>
        </g>
      </g>
    </svg>
  );
}

export function BlackKnight({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="currentColor"/>
        <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" fill="currentColor"/>
        <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="currentColor" stroke="currentColor"/>
        <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="currentColor" stroke="currentColor" strokeLinecap="butt" strokeLinejoin="miter"/>
      </g>
    </svg>
  );
}

export function BlackPawn({ size = 45, className = '' }: ChessPieceSVGProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 45 45" className={className} fill="currentColor">
      <g fill="currentColor" fillRule="evenodd" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47C27.06 24.84 28 23.03 28 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="currentColor"/>
      </g>
    </svg>
  );
}

// Piece component mapper
const PIECE_COMPONENTS = {
  w: {
    k: WhiteKing,
    q: WhiteQueen,
    r: WhiteRook,
    b: WhiteBishop,
    n: WhiteKnight,
    p: WhitePawn,
  },
  b: {
    k: BlackKing,
    q: BlackQueen,
    r: BlackRook,
    b: BlackBishop,
    n: BlackKnight,
    p: BlackPawn,
  },
};

interface ChessPieceProps {
  piece: PieceSymbol;
  color: Color;
  size?: number;
  className?: string;
}

/**
 * Main chess piece component that renders the appropriate SVG
 */
export function ChessPiece({ piece, color, size = 60, className = '' }: ChessPieceProps): JSX.Element {
  const PieceComponent = PIECE_COMPONENTS[color][piece];
  const pieceClassName = `${className} ${color === 'w' ? 'white-piece' : 'black-piece'}`.trim();
  
  return <PieceComponent size={size} className={pieceClassName} />;
} 