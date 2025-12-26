import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { Dungeon, Player } from '../types';

export interface AnalysisContextValue {
  dungeon: Dungeon;
  player: Player;
  dungeonDuration: number; // In seconds
  hoveredTime: number | null; // Number of seconds
  setHoveredTime: (time: number | null) => void;
}

export const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function useAnalysis(): AnalysisContextValue {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisContext.Provider');
  }
  return context;
}
