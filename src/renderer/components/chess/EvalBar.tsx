/**
 * @fileoverview Chess Evaluation Bar Component
 * @module renderer/components/chess/EvalBar
 * 
 * Displays visual evaluation bar showing position advantage
 * based on Stockfish analysis.
 * 
 * @requires react
 */

import React from 'react';

/**
 * Props for EvalBar component
 */
export interface EvalBarProps {
  /** Evaluation in centipawns (positive = white advantage, always from white's perspective) */
  evaluation: number;
  /** Whether a mate is detected */
  mate?: number;
  /** Height of the bar in pixels */
  height?: number;
  /** Orientation (horizontal or vertical) */
  orientation?: 'horizontal' | 'vertical';
  /** Whether the position is currently being analyzed */
  isAnalyzing?: boolean;
}

/**
 * Visual evaluation bar showing position advantage
 */
export const EvalBar: React.FC<EvalBarProps> = ({
  evaluation,
  mate,
  height = 20,
  orientation = 'horizontal',
  isAnalyzing = false
}) => {
  /**
   * Converts centipawns to percentage (capped at ±500 centipawns = ±5 pawns)
   */
  const getPercentage = (): number => {
    if (mate !== undefined) {
      return mate > 0 ? 100 : 0;
    }
    
    // Cap at ±500 centipawns for visual representation
    const cappedEval = Math.max(-500, Math.min(500, evaluation));
    // Convert to 0-100 scale
    return ((cappedEval + 500) / 1000) * 100;
  };
  
  /**
   * Gets the evaluation text to display
   */
  const getEvalText = (): string => {
    if (isAnalyzing || evaluation === 0) {
      return '0.0';
    }
    
    if (mate !== undefined) {
      return `M${Math.abs(mate)}`;
    }
    
    const pawns = Math.abs(evaluation / 100);
    const sign = evaluation > 0 ? '+' : '';
    
    if (pawns >= 1) {
      return `${sign}${pawns.toFixed(1)}`;
    } else {
      return `${sign}${(evaluation / 100).toFixed(2)}`;
    }
  };
  
  const percentage = getPercentage();
  const evalText = getEvalText();
  const isWhiteAdvantage = evaluation > 0 || (mate !== undefined && mate > 0);
  
  const containerStyle: React.CSSProperties = orientation === 'horizontal' 
    ? {
        width: '100%',
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#000000',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '8px',
        marginBottom: '8px',
      }
    : {
        width: `${height}px`,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#000000',
        borderRadius: '4px',
        overflow: 'hidden',
      };
  
  const barStyle: React.CSSProperties = orientation === 'horizontal'
    ? {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: `${percentage}%`,
        backgroundColor: '#FFFFFF',
        transition: 'width 300ms ease-out',
      }
    : {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: `${percentage}%`,
        backgroundColor: '#FFFFFF',
        transition: 'height 300ms ease-out',
      };
  
  const textStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '12px',
    fontWeight: 'bold',
    color: isWhiteAdvantage ? '#000000' : '#FFFFFF',
    mixBlendMode: 'difference',
    zIndex: 2,
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  };
  
  return (
    <div className="eval-bar-container" style={containerStyle}>
      <div className="eval-bar-fill" style={barStyle} />
      <span className="eval-bar-text" style={textStyle}>
        {evalText}
      </span>
    </div>
  );
}; 