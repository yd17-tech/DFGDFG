/**
 * ChemEscape - Game Types & Interfaces
 */

export type ElementSymbol = 'H' | 'C' | 'O' | 'N' | 'S' | 'Cl' | 'Na';

export interface ChemicalElement {
  symbol: ElementSymbol;
  nameKo: string;
  nameEn: string;
  atomicNumber: number;
  atomicMass: number;
  valency: number[];
  color: string;
  bgColor: string;
  description: string;
  hint: string;
}

export type CompoundId = 'HCl' | 'CH4' | 'NH3' | 'H2SO4' | 'O2' | 'H2O' | 'NaCl' | 'CO2';

export interface ChemicalCompound {
  id: CompoundId;
  formula: string;
  nameKo: string;
  nameEn: string;
  description: string;
  tacticalEffect: string;
  iconName: string;
  requiredElements: { [key in ElementSymbol]?: number };
  reactionEquation: string;
  scienceFact: string;
  type: 'OFFENSE' | 'DEBUFF' | 'UTILITY' | 'OBJECTIVE';
}

export type GameStage = 
  | 'LAB_CELL'           // Stage 1: 수용실에서 원소 탐색 및 첫 합성
  | 'DARK_CORRIDOR'      // Stage 2: 칠흑 같은 복도와 외눈 거인 추적
  | 'EXIT_BLAST'         // Stage 3: 방폭벽 도달 및 메탄 폭파 준비
  | 'ESCAPED'            // Victory
  | 'GAME_OVER';         // Failure

export interface StudentProgress {
  studentCode: string;
  studentName: string;
  stage: GameStage;
  oxygen: number;        // 0 to 100
  heartRate: number;     // 60 to 180 bpm
  monsterDistance: number; // 0 to 50 meters
  elements: { [key in ElementSymbol]?: number };
  craftedCompounds: CompoundId[];
  chemicalLog: string[];
  wallIntegrity: number; // 0 to 100%
  monsterStunnedTime: number; // seconds left
  monsterSlowedTime: number;  // seconds left
  monsterDistractedTime: number; // seconds left
  updatedAt: string;
}

export interface LeaderboardEntry {
  studentCode: string;
  studentName: string;
  escapeTimeSeconds: number;
  remainingOxygen: number;
  synthesizedCount: number;
  score: number;
  compoundsUsed: string[];
  escapedAt: string;
}
