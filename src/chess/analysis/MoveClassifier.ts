/**
 * @fileoverview Move Classifier
 * @module chess/analysis/MoveClassifier
 * 
 * Classifies chess moves based on engine evaluation differences.
 * Implements a 4-tier system: best, okay, inaccuracy, blunder.
 * 
 * @requires ../engine/StockfishService
 */

import { MoveQuality } from '../../shared/types/chess';

/**
 * Classification thresholds in centipawns (more intuitive than pawns)
 */
const CLASSIFICATION_THRESHOLDS = {
  /** Move is considered best if within this many centipawns of engine's top choice */
  BEST_LOSS_THRESHOLD: 50,
  /** Move is considered okay if loss <= this */
  OKAY_LOSS_THRESHOLD: 120,
  /** Move is considered inaccuracy if loss <= this */
  INACCURACY_LOSS_THRESHOLD: 250,
  /** Cap mate scores at this value to prevent huge gaps */
  MATE_CAP: 1000,
  /** Treat tiny sign flips as inaccuracies if delta < this */
  TINY_SIGN_FLIP_THRESHOLD: 250,
  /** Otherwise it's a blunder */
} as const;

/**
 * Move classifier for chess positions
 */
export class MoveClassifier {
  /**
   * Implements the simplified single-loss move classification system
   * 
   * This algorithm uses a single key metric: how much evaluation was lost
   * compared to the engine's best move, with special handling for sign flips
   * and mate positions. Works directly in centipawns for intuitive thresholds.
   * 
   * @param evaluationBefore - Evaluation before the move (from White's perspective, in centipawns)
   * @param evaluationAfter - Evaluation after the played move (from White's perspective, in centipawns)
   * @param evaluationBest - Evaluation after the best move (from White's perspective, in centipawns)
   * @returns The move quality classification
   */
  static classifyMove(
    evaluationBefore: number,
    evaluationAfter: number,
    evaluationBest: number
  ): MoveQuality {
    // Work directly in centipawns - no conversion needed
    const eBefore = evaluationBefore;
    let eAfter = evaluationAfter;
    let eBest = evaluationBest;

    // Cap mate scores to prevent huge gaps in mate positions
    eAfter = Math.max(-CLASSIFICATION_THRESHOLDS.MATE_CAP, Math.min(CLASSIFICATION_THRESHOLDS.MATE_CAP, eAfter));
    eBest = Math.max(-CLASSIFICATION_THRESHOLDS.MATE_CAP, Math.min(CLASSIFICATION_THRESHOLDS.MATE_CAP, eBest));

    const delta = eAfter - eBefore;               // + if White improved
    const loss = Math.abs(eBest - eAfter);        // Single key metric: loss compared to best
    const signBefore = Math.sign(eBefore);
    const signAfter = Math.sign(eAfter);
    const hasSignFlip = signBefore !== signAfter;

    // Debug logging (occasional)
    if (Math.random() < 0.05) { // Log ~5% of moves for debugging
      console.log(`Move Classification:
        Before: ${eBefore}cp
        After: ${eAfter}cp  
        Best: ${eBest}cp
        Delta: ${delta}cp
        Loss: ${loss}cp
        Sign flip: ${hasSignFlip}`);
    }

    // Handle tiny sign flips leniently - treat as inaccuracies
    if (hasSignFlip && Math.abs(delta) < CLASSIFICATION_THRESHOLDS.TINY_SIGN_FLIP_THRESHOLD) {
      return 'inaccuracy';
    }

    // Single loss-based classification
    if (loss <= CLASSIFICATION_THRESHOLDS.BEST_LOSS_THRESHOLD) {
      return 'best';
    }

    if (loss <= CLASSIFICATION_THRESHOLDS.OKAY_LOSS_THRESHOLD) {
      return 'okay';
    }

    if (loss <= CLASSIFICATION_THRESHOLDS.INACCURACY_LOSS_THRESHOLD) {
      return 'inaccuracy';
    }

    // Otherwise it's a blunder
    return 'blunder';
  }

  /**
   * Gets a human-readable description of the move quality
   */
  static getQualityDescription(quality: MoveQuality): string {
    switch (quality) {
      case 'best':
        return 'Best move - the engine\'s top choice';
      case 'okay':
        return 'Okay move - reasonable but not optimal';
      case 'inaccuracy':
        return 'Inaccuracy - slightly worsens the position';
      case 'blunder':
        return 'Blunder - significantly worsens the position';
    }
  }

  /**
   * Gets the evaluation loss range for a quality level
   */
  static getQualityRange(quality: MoveQuality): string {
    switch (quality) {
      case 'best':
        return `≤${CLASSIFICATION_THRESHOLDS.BEST_LOSS_THRESHOLD}cp lost from best`;
      case 'okay':
        return `≤${CLASSIFICATION_THRESHOLDS.OKAY_LOSS_THRESHOLD}cp lost from best`;
      case 'inaccuracy':
        return `≤${CLASSIFICATION_THRESHOLDS.INACCURACY_LOSS_THRESHOLD}cp lost from best`;
      case 'blunder':
        return `>${CLASSIFICATION_THRESHOLDS.INACCURACY_LOSS_THRESHOLD}cp lost from best or major sign flip (>${CLASSIFICATION_THRESHOLDS.TINY_SIGN_FLIP_THRESHOLD}cp)`;
    }
  }

  /**
   * Converts mate score to finite centipawn value
   */
  private static mateScore(mateIn: number): number {
    return 10000 - 100 * Math.abs(mateIn);
  }

  /**
   * Converts Average Centipawn Loss (ACPL) to Chess.com-like accuracy percentage
   * Uses logistic curve to mimic the 0-100 scale
   */
  static acplToAccuracy(acpl: number): number {
    // Parameters are empirical fit to match Chess.com's distribution
    const A = 8;      // scale (≈ where curve crosses 80%)
    const B = 0.6;    // shape (steepness)
    const raw = 100 / (1 + Math.pow(acpl / A, B));
    return Math.max(0, Math.min(100, Math.round(raw)));
  }

  /**
   * Computes game accuracy from move evaluations
   * @param moves - Array of moves with evaluation data
   * @returns Accuracy percentage (0-100)
   */
  static computeGameAccuracy(moves: Array<{
    evaluationBefore: number;
    evaluationAfter: number;
    evaluationBest: number;
    mateBefore?: number;
    mateAfter?: number;
    mateBest?: number;
    isBook?: boolean;
  }>): number {
    let lossSum = 0;
    let moveCount = 0;

    for (const move of moves) {
      // Skip book moves (optional - uncomment if needed)
      // if (move.isBook) continue;

      // Handle mate scores by converting to finite centipawn values
      const bestCp = move.mateBest !== undefined 
        ? this.mateScore(move.mateBest)
        : move.evaluationBest;
      
      const afterCp = move.mateAfter !== undefined
        ? this.mateScore(move.mateAfter)
        : move.evaluationAfter;

      // Cap extreme values to prevent single blunder from dominating
      const cappedBest = Math.max(-CLASSIFICATION_THRESHOLDS.MATE_CAP, 
                                  Math.min(CLASSIFICATION_THRESHOLDS.MATE_CAP, bestCp));
      const cappedAfter = Math.max(-CLASSIFICATION_THRESHOLDS.MATE_CAP, 
                                   Math.min(CLASSIFICATION_THRESHOLDS.MATE_CAP, afterCp));

      const loss = Math.abs(cappedBest - cappedAfter);
      lossSum += loss;
      moveCount++;
    }

    if (moveCount === 0) return 100;

    const acpl = lossSum / moveCount;
    return this.acplToAccuracy(acpl);
  }

  /**
   * Computes accuracy from move quality classifications (alternative method)
   * @param qualities - Array of move qualities
   * @returns Accuracy percentage (0-100)
   */
  static computeAccuracyFromQualities(qualities: MoveQuality[]): number {
    if (qualities.length === 0) return 100;

    const weights = {
      best: 1.0,
      okay: 0.8,
      inaccuracy: 0.5,
      blunder: 0.0
    };

    const totalWeight = qualities.reduce((sum, quality) => sum + weights[quality], 0);
    return Math.round((totalWeight / qualities.length) * 100);
  }

  /**
   * Gets accuracy description based on percentage
   */
  static getAccuracyDescription(accuracy: number): string {
    if (accuracy >= 95) return 'Excellent';
    if (accuracy >= 90) return 'Great';
    if (accuracy >= 80) return 'Good';
    if (accuracy >= 70) return 'Decent';
    if (accuracy >= 60) return 'Okay';
    return 'Needs work';
  }
} 