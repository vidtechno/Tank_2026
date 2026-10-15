/**
 * Steel Front: Tank Defense
 * Core Game Types and Enums
 */

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  GRASS = 3,
  WATER = 4,
  ICE = 5,
  BASE = 8
}

export enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3
}

export enum EnemyType {
  SCOUT = 'scout',
  ASSAULT = 'assault',
  ARMORED = 'armored',
  COMMANDER = 'commander' // Smart AI tank targeting base & player faster
}

export enum PowerUpType {
  SHIELD = 'shield',   // 10s impenetrable energy barrier
  FREEZE = 'freeze',   // 8s freezes all enemy tanks
  NUKE = 'nuke',       // Wipes out all active enemies
  FORTIFY = 'fortify', // Fortifies Command Core with steel for 20s
  REPAIR = 'repair',   // Restores armor to 2 HP or grants extra life
  RAPID = 'rapid'      // Double-speed cannon (2/s) for 12s
}

export interface PowerUpItem {
  x: number;
  y: number;
  type: PowerUpType;
  life: number;
  bobTimer: number;
}

export type GameState =
  | 'menu'
  | 'level_select'
  | 'playing'
  | 'paused'
  | 'life_lost'
  | 'game_over'
  | 'level_clear'
  | 'victory';

export interface GridCell {
  type: TileType;
  subs?: boolean[] | null; // [TL, TR, BL, BR] for destructible bricks
}

export interface EnemySpec {
  name: string;
  speed: number;
  hp: number;
  maxHp: number;
  points: number;
  fireCooldown: number;
  colorBody: string;
  colorArmor: string;
  colorTurret: string;
}

export interface LevelTheme {
  name: string;
  bgColor: string;
  gridLineColor: string;
  brickPrimary: string;
  brickLight: string;
  brickDark: string;
  brickMortar: string;
  steelLight: string;
  steelMid: string;
  steelDark: string;
  waterColor: string;
  waterWave: string;
  waterName?: string; // e.g. "Acid", "Lava", "Water"
  grassColor: string;
  iceColor: string;
  ambientTint?: string;
}

export interface LevelDefinition {
  id: number;
  name: string;
  codeName: string;
  description: string;
  terrainSummary: string;
  grid: number[][];
  waves: EnemyType[];
  basePosition: { col: number; row: number }; // 2x2 base
  playerSpawn: { col: number; row: number };
  theme?: LevelTheme;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  currentLevel: number;
  unlockedLevel: number;
  lives: number;
  playerHp: number;
  maxPlayerHp: number;
  enemiesRemaining: number;
  baseHealth: number;
  maxBaseHealth: number;
  activeEnemiesCount: number;
  reloadingRatio: number;
  isMuted: boolean;
  activePowerUps: { type: PowerUpType; label: string; remaining: number }[];
  comboCount: number;
  comboMultiplier: number;
}
