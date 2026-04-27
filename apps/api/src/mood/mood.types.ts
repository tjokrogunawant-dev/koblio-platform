export enum MoodState {
  FLOW = 'FLOW',
  FRUSTRATED = 'FRUSTRATED',
  CONFUSED = 'CONFUSED',
  BORED = 'BORED',
}

export interface MoodWeights {
  fsrsWeight: number;
  bktWeight: number;
  noveltyWeight: number;
  difficultyOffset: number; // -2 to +1
}
