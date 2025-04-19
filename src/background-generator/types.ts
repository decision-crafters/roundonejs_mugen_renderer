export interface FalBackground {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
}

export enum BackgroundType {
  DOJO = 'dojo',
  STREET = 'street',
  CASTLE = 'castle',
  FOREST = 'forest',
  BEACH = 'beach',
  CYBERPUNK = 'cyberpunk',
  CUSTOM = 'custom'
}

export const BackgroundPrompts: Record<BackgroundType, string> = {
  [BackgroundType.DOJO]: 'A pixel art dojo interior with wooden floors, paper walls, and weapon racks for a fighting game background',
  [BackgroundType.STREET]: 'A pixel art urban street at night with neon signs and puddles for a fighting game background',
  [BackgroundType.CASTLE]: 'A pixel art medieval castle interior with stone walls and torches for a fighting game background',
  [BackgroundType.FOREST]: 'A pixel art forest clearing with ancient trees and mystical elements for a fighting game background',
  [BackgroundType.BEACH]: 'A pixel art tropical beach with palm trees and crashing waves for a fighting game background',
  [BackgroundType.CYBERPUNK]: 'A pixel art cyberpunk cityscape with holographic billboards and flying vehicles for a fighting game background',
  [BackgroundType.CUSTOM]: ''
};
