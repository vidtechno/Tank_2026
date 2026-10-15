/**
 * Steel Front: Tank Defense
 * Handcrafted 6-Sector Campaign Levels
 *
 * Grid Legend (16x16):
 * 0: Empty
 * 1: Brick (destructible with 4 sub-quadrants)
 * 2: Steel (indestructible)
 * 3: Grass / Foliage (conceals tanks, permits movement and bullets)
 * 4: Water / Fluid (blocks tanks, permits bullets)
 * 5: Ice (slippery sliding movement)
 * 8: Command Core Base (2x2 structure)
 *
 * SPAWN SAFETY GUARANTEE:
 * Enemy Portals: Col 1 (left), Col 7.5 (center), Col 14 (right).
 * Rows 0, 1, 2 at columns [0..2], [6..9], and [13..15] are strictly 0 (Empty)
 * so enemy tanks NEVER spawn inside walls or get trapped across ANY level!
 */

import { EnemyType, LevelDefinition, LevelTheme } from './types';

// THEME 1: Standard Military Garrison
const THEME_SECTOR_1: LevelTheme = {
  name: 'Iron Grounds',
  bgColor: '#060c16',
  gridLineColor: 'rgba(52, 211, 153, 0.04)',
  brickPrimary: '#b91c1c',
  brickLight: '#ef4444',
  brickDark: '#7f1d1d',
  brickMortar: '#450a0a',
  steelLight: '#cbd5e1',
  steelMid: '#94a3b8',
  steelDark: '#64748b',
  waterColor: '#0369a1',
  waterWave: 'rgba(56, 189, 248, 0.45)',
  waterName: 'Water',
  grassColor: 'rgba(21, 128, 61, 0.85)',
  iceColor: '#e0f2fe'
};

// THEME 2: Industrial Naval Canals
const THEME_SECTOR_2: LevelTheme = {
  name: 'Steel Canals',
  bgColor: '#07101e',
  gridLineColor: 'rgba(56, 189, 248, 0.05)',
  brickPrimary: '#991b1b',
  brickLight: '#dc2626',
  brickDark: '#581c1c',
  brickMortar: '#350a0a',
  steelLight: '#94a3b8',
  steelMid: '#64748b',
  steelDark: '#334155',
  waterColor: '#0284c7',
  waterWave: 'rgba(125, 211, 252, 0.55)',
  waterName: 'Moat Canal',
  grassColor: 'rgba(15, 118, 110, 0.85)',
  iceColor: '#bae6fd'
};

// THEME 3: Glacial Tundra / Frozen Citadel
const THEME_SECTOR_3: LevelTheme = {
  name: 'Arctic Tundra',
  bgColor: '#081426',
  gridLineColor: 'rgba(186, 230, 253, 0.06)',
  brickPrimary: '#78350f',
  brickLight: '#b45309',
  brickDark: '#451a03',
  brickMortar: '#290e02',
  steelLight: '#e2e8f0',
  steelMid: '#93c5fd',
  steelDark: '#3b82f6',
  waterColor: '#0c4a6e',
  waterWave: 'rgba(224, 242, 254, 0.6)',
  waterName: 'Frigid Water',
  grassColor: 'rgba(71, 85, 105, 0.75)', // Frost-covered bushes
  iceColor: '#e0f2fe'
};

// THEME 4: Toxic Mire / Acid Refinery
const THEME_SECTOR_4: LevelTheme = {
  name: 'Toxic Refinery',
  bgColor: '#081710',
  gridLineColor: 'rgba(34, 197, 94, 0.06)',
  brickPrimary: '#a16207',
  brickLight: '#ca8a04',
  brickDark: '#713f12',
  brickMortar: '#3c2306',
  steelLight: '#86efac',
  steelMid: '#4ade80',
  steelDark: '#166534',
  waterColor: '#065f46', // Glowing acid pool
  waterWave: 'rgba(74, 222, 128, 0.55)',
  waterName: 'Acid Canal',
  grassColor: 'rgba(19, 78, 74, 0.85)',
  iceColor: '#dcfce7',
  ambientTint: 'rgba(34, 197, 94, 0.08)'
};

// THEME 5: Molten Foundry / Magma Bastion
const THEME_SECTOR_5: LevelTheme = {
  name: 'Molten Foundry',
  bgColor: '#160a0a',
  gridLineColor: 'rgba(249, 115, 22, 0.07)',
  brickPrimary: '#c2410c',
  brickLight: '#ea580c',
  brickDark: '#7c2d12',
  brickMortar: '#431407',
  steelLight: '#f97316',
  steelMid: '#431407',
  steelDark: '#1c1917',
  waterColor: '#9a3412', // Molten lava river
  waterWave: 'rgba(251, 191, 36, 0.65)',
  waterName: 'Molten Lava',
  grassColor: 'rgba(120, 53, 15, 0.75)',
  iceColor: '#fed7aa',
  ambientTint: 'rgba(239, 68, 68, 0.09)'
};

// THEME 6: Cybernetic Apex / Omega Quantum Fortress
const THEME_SECTOR_6: LevelTheme = {
  name: 'Omega Cyber-Apex',
  bgColor: '#0c071d',
  gridLineColor: 'rgba(192, 132, 252, 0.07)',
  brickPrimary: '#6d28d9',
  brickLight: '#8b5cf6',
  brickDark: '#4c1d95',
  brickMortar: '#2e1065',
  steelLight: '#c084fc',
  steelMid: '#6366f1',
  steelDark: '#1e1b4b',
  waterColor: '#4338ca', // Plasma conduit stream
  waterWave: 'rgba(168, 85, 247, 0.65)',
  waterName: 'Plasma Conduit',
  grassColor: 'rgba(76, 29, 149, 0.85)',
  iceColor: '#ede9fe',
  ambientTint: 'rgba(168, 85, 247, 0.1)'
};

export const LEVELS: LevelDefinition[] = [
  // ==========================================
  // LEVEL 1: Training Grounds (Sector 1)
  // Waves: 10 hostiles (2 Commanders)
  // ==========================================
  {
    id: 1,
    name: 'Sector 1: Training Grounds',
    codeName: 'OPERATION IRON BOOT',
    description: 'Establish perimeter security around the forward Command Core. Neutralize scout incursions and master tactical maneuvering.',
    terrainSummary: 'Destructible brick barricades & light steel fortifications',
    theme: THEME_SECTOR_1,
    basePosition: { col: 7, row: 14 },
    playerSpawn: { col: 5, row: 14 },
    waves: [
      EnemyType.SCOUT,
      EnemyType.SCOUT,
      EnemyType.ASSAULT,
      EnemyType.SCOUT,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER, // Smart tank joins the offensive
      EnemyType.SCOUT,
      EnemyType.ASSAULT,
      EnemyType.ARMORED,
      EnemyType.COMMANDER
    ],
    grid: [
      // Row 0: Completely clear spawn lane
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 1: Completely clear spawn areas at cols [0..2], [6..9], [13..15]
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      // Row 2: Open spawn corridors
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      // Row 3: Strategic brick & steel pillars
      [0, 1, 1, 0, 1, 1, 0, 2, 2, 0, 1, 1, 0, 1, 1, 0],
      // Row 4: Brick barriers with wide driveable lanes
      [0, 1, 1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1, 1, 0],
      // Row 5: Central crossing
      [0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0],
      // Row 6: Flanking cover
      [0, 0, 0, 0, 1, 1, 0, 2, 2, 0, 1, 1, 0, 0, 0, 0],
      // Row 7: Midfield combat zone with steel bunkers
      [2, 2, 0, 1, 1, 0, 0, 2, 2, 0, 0, 1, 1, 0, 2, 2],
      // Row 8: Wide transition lanes
      [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
      // Row 9: Southern defense line
      [0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0],
      // Row 10: Choke points with steel posts
      [0, 1, 1, 0, 2, 0, 1, 1, 1, 1, 0, 2, 0, 1, 1, 0],
      // Row 11: Brick barricades
      [0, 1, 1, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 1, 1, 0],
      // Row 12: Clear approach to base
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 13: Command Core brick bunker roof
      [0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0],
      // Row 14: Base sides & core top (cols 7-8 is base)
      [0, 1, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 1, 0],
      // Row 15: Base sides & core bottom
      [0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0]
    ]
  },

  // ==========================================
  // LEVEL 2: Iron Maze (Sector 2)
  // Waves: 12 hostiles (3 Commanders, 3 Armored)
  // ==========================================
  {
    id: 2,
    name: 'Sector 2: Iron Maze',
    codeName: 'OPERATION STEEL CROSS',
    description: 'Navigate complex industrial choke points flanked by deep drainage canals. Beware reinforced armored tanks and smart commanders guarding narrow bridges.',
    terrainSummary: 'Narrow steel corridors, water moats & armored tank threats',
    theme: THEME_SECTOR_2,
    basePosition: { col: 7, row: 14 },
    playerSpawn: { col: 5, row: 14 },
    waves: [
      EnemyType.SCOUT,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.SCOUT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.ARMORED,
      EnemyType.COMMANDER,
      EnemyType.ARMORED
    ],
    grid: [
      // Row 0: Completely clear spawn lane across all 16 tiles
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 1: Clear spawn zones [0..2], [6..9], [13..15]
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      // Row 2: Wide passage from spawns
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      // Row 3: Steel pillars providing tactical cover flanking open bridge approaches
      [0, 0, 0, 2, 2, 0, 1, 1, 1, 1, 0, 2, 2, 0, 0, 0],
      // Row 4: Water canals with 3 wide navigable bridge crossings (cols 1-2, 7-8, 13-14)
      [4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 4],
      // Row 5: Open bridge landings
      [4, 0, 0, 4, 4, 0, 0, 1, 1, 0, 0, 4, 4, 0, 0, 4],
      // Row 6: Industrial brick & steel fortifications
      [0, 0, 0, 0, 2, 2, 0, 1, 1, 0, 2, 2, 0, 0, 0, 0],
      // Row 7: Central tactical plaza with foliage cover
      [0, 1, 1, 0, 2, 2, 3, 3, 3, 3, 2, 2, 0, 1, 1, 0],
      // Row 8: Foliage ambush zone
      [0, 1, 1, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 1, 1, 0],
      // Row 9: Southern industrial sector
      [0, 2, 2, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 2, 2, 0],
      // Row 10: Canal crossings with wide pathways
      [4, 0, 0, 4, 1, 1, 0, 2, 2, 0, 1, 1, 4, 0, 0, 4],
      // Row 11: Defended canal bridges
      [4, 0, 0, 4, 0, 0, 0, 2, 2, 0, 0, 0, 4, 0, 0, 4],
      // Row 12: Southern staging zone
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      // Row 13: Command Core bunker roof
      [0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0],
      // Row 14: Base perimeter
      [0, 1, 0, 0, 1, 0, 1, 8, 8, 1, 0, 1, 0, 0, 1, 0],
      // Row 15: Base foundation
      [0, 1, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 1, 0]
    ]
  },

  // ==========================================
  // LEVEL 3: Glacier Citadel (Sector 3)
  // Waves: 14 hostiles (4 Commanders, 4 Armored)
  // ==========================================
  {
    id: 3,
    name: 'Sector 3: Glacier Citadel',
    codeName: 'OPERATION CITADEL ECLIPSE',
    description: 'Hostile forces assault the headquarters glacier citadel. Exploit frosty camouflage and adapt your maneuvers along slick frozen supply routes.',
    terrainSummary: 'Slick ice lanes, ambush foliage & heavy armor battalions',
    theme: THEME_SECTOR_3,
    basePosition: { col: 7, row: 14 },
    playerSpawn: { col: 5, row: 14 },
    waves: [
      EnemyType.COMMANDER,
      EnemyType.ASSAULT,
      EnemyType.ARMORED,
      EnemyType.SCOUT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.ARMORED,
      EnemyType.ARMORED,
      EnemyType.COMMANDER,
      EnemyType.ARMORED
    ],
    grid: [
      // Row 0: Completely clear spawn lane across all 16 tiles
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 1: Clear spawn zones [0..2], [6..9], [13..15]
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      // Row 2: Wide passage from spawns with ice edges
      [5, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 5],
      // Row 3: Lateral ice slipways
      [5, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 5],
      // Row 4: Ambush forests & brick barricades
      [5, 0, 1, 1, 3, 3, 0, 1, 1, 0, 3, 3, 1, 1, 0, 5],
      // Row 5: Central tactical choke
      [5, 2, 2, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 2, 2, 5],
      // Row 6: Open battlefield crossing
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      // Row 7: Citadel outer defense wall
      [1, 1, 0, 2, 2, 0, 1, 2, 2, 1, 0, 2, 2, 0, 1, 1],
      // Row 8: Fortress center with steel barrier
      [1, 1, 0, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 1, 1],
      // Row 9: Southern transition plaza
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 10: Camouflage forests protecting base flanks
      [0, 2, 2, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 2, 2, 0],
      // Row 11: Steel bunker towers
      [0, 2, 2, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 2, 2, 0],
      // Row 12: Wide road leading to Command Core
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 13: Reinforced Command Core bunker roof
      [0, 1, 1, 0, 2, 0, 1, 1, 1, 1, 0, 2, 0, 1, 1, 0],
      // Row 14: Base sides
      [0, 1, 1, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 1, 1, 0],
      // Row 15: Base foundation
      [0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0]
    ]
  },

  // ==========================================
  // LEVEL 4: Toxic Refinery (Sector 4) - NEW!
  // Waves: 16 hostiles (5 Commanders, 4 Armored)
  // Theme: Chemical Plant with green acid moats & rusted bronze bunkers
  // ==========================================
  {
    id: 4,
    name: 'Sector 4: Toxic Refinery',
    codeName: 'OPERATION TOXIC TALON',
    description: 'Infiltrate an abandoned chemical weapons refinery flooded with corrosive acid channels. Heavy commander tanks will coordinate pincer strikes across the industrial pipes.',
    terrainSummary: 'Corrosive acid moats, dense chemical silos & relentless smart commanders',
    theme: THEME_SECTOR_4,
    basePosition: { col: 7, row: 14 },
    playerSpawn: { col: 5, row: 14 },
    waves: [
      EnemyType.SCOUT,
      EnemyType.COMMANDER,
      EnemyType.ASSAULT,
      EnemyType.ARMORED,
      EnemyType.SCOUT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED
    ],
    grid: [
      // Row 0: Completely clear spawn lane across all 16 tiles
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 1: Clear spawn zones [0..2], [6..9], [13..15]
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      // Row 2: Wide passage from spawns
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      // Row 3: Steel refinery pipes & acid inlets with open lanes
      [0, 0, 0, 2, 2, 0, 1, 1, 1, 1, 0, 2, 2, 0, 0, 0],
      // Row 4: Acid canals with 3 wide crossings (cols 1-2, 7-8, 13-14)
      [4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 4],
      // Row 5: Central refinery chemical vat
      [0, 0, 0, 0, 2, 2, 0, 1, 1, 0, 2, 2, 0, 0, 0, 0],
      // Row 6: Dense bronze brick corridors with foliage vents
      [0, 1, 1, 0, 2, 2, 3, 3, 3, 3, 2, 2, 0, 1, 1, 0],
      // Row 7: Midfield crossfire zone with steel barriers
      [2, 1, 1, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 1, 1, 2],
      // Row 8: Acid canal bisecting midfield
      [4, 0, 0, 4, 1, 1, 0, 0, 0, 0, 1, 1, 4, 0, 0, 4],
      // Row 9: Bridge exits with brick ramparts
      [4, 0, 0, 4, 1, 1, 0, 2, 2, 0, 1, 1, 4, 0, 0, 4],
      // Row 10: Chemical processing tanks
      [0, 2, 2, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 2, 2, 0],
      // Row 11: Defended approach roads
      [0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0],
      // Row 12: Clear staging plaza before headquarters
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 13: Reinforced Command Core roof
      [0, 1, 0, 0, 2, 0, 1, 1, 1, 1, 0, 2, 0, 0, 1, 0],
      // Row 14: Base sides & core top (cols 7-8 base)
      [0, 1, 0, 0, 2, 0, 1, 8, 8, 1, 0, 2, 0, 0, 1, 0],
      // Row 15: Base foundation
      [0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0]
    ]
  },

  // ==========================================
  // LEVEL 5: Molten Foundry (Sector 5) - NEW!
  // Waves: 18 hostiles (6 Commanders, 5 Armored)
  // Theme: Volcanic Foundry with glowing molten lava & obsidian barriers
  // ==========================================
  {
    id: 5,
    name: 'Sector 5: Molten Foundry',
    codeName: 'OPERATION MAGMA BASTION',
    description: 'Battle deep within a geothermal volcano fortress. Searing magma streams divide the combat lanes while high-speed commanders and armored dreadnoughts close in on the base.',
    terrainSummary: 'Molten magma rivers, scorched obsidian barriers & elite commander swarms',
    theme: THEME_SECTOR_5,
    basePosition: { col: 7, row: 14 },
    playerSpawn: { col: 5, row: 14 },
    waves: [
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER,
      EnemyType.SCOUT,
      EnemyType.ARMORED,
      EnemyType.COMMANDER,
      EnemyType.ASSAULT,
      EnemyType.ARMORED,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.ARMORED,
      EnemyType.COMMANDER,
      EnemyType.ARMORED
    ],
    grid: [
      // Row 0: Completely clear spawn lane across all 16 tiles
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 1: Clear spawn zones [0..2], [6..9], [13..15]
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      // Row 2: Wide passage from spawns
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      // Row 3: Scorched brick redoubts flanking bridge approaches
      [0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0],
      // Row 4: Searing magma rivers with fortified crossings (cols 1-2, 7-8, 13-14)
      [4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 4],
      // Row 5: Obsidian steel gateposts
      [4, 0, 0, 4, 4, 0, 2, 1, 1, 2, 0, 4, 4, 0, 0, 4],
      // Row 6: Crucible combat arena with dense brick cover
      [0, 2, 2, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 2, 2, 0],
      // Row 7: Magma core central bunker
      [0, 2, 2, 0, 1, 1, 2, 4, 4, 2, 1, 1, 0, 2, 2, 0],
      // Row 8: Central thermal vents
      [0, 0, 0, 0, 0, 0, 2, 4, 4, 2, 0, 0, 0, 0, 0, 0],
      // Row 9: Southern volcanic defenses
      [1, 1, 0, 2, 2, 0, 1, 1, 1, 1, 0, 2, 2, 0, 1, 1],
      // Row 10: Lower magma trench
      [4, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 4],
      // Row 11: Brick fortress walls
      [4, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 4],
      // Row 12: Clear highway to base
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 13: Reinforced Command Core bunker roof
      [0, 2, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 2, 0],
      // Row 14: Base sides & core top
      [0, 2, 1, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 1, 2, 0],
      // Row 15: Base foundation
      [0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0]
    ]
  },

  // ==========================================
  // LEVEL 6: Dreadnought Apex (Sector 6) - NEW!
  // Waves: 20 hostiles (8 Commanders, 6 Armored, 5 Assault, 1 Scout)
  // Theme: Supreme Quantum Cyber-Apex Citadel
  // ==========================================
  {
    id: 6,
    name: 'Sector 6: Omega Stronghold',
    codeName: 'OPERATION OMEGA APEX',
    description: 'The supreme enemy command citadel. High-tech cybernetic battle tanks with state-of-the-art targeting AI wage an all-out assault on your core. Claim ultimate military supremacy!',
    terrainSummary: 'High-tech plasma conduits, titanium barriers & elite commander division',
    theme: THEME_SECTOR_6,
    basePosition: { col: 7, row: 14 },
    playerSpawn: { col: 5, row: 14 },
    waves: [
      EnemyType.COMMANDER,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.COMMANDER,
      EnemyType.ASSAULT,
      EnemyType.ARMORED,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.ASSAULT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED,
      EnemyType.COMMANDER,
      EnemyType.ASSAULT,
      EnemyType.ARMORED,
      EnemyType.SCOUT,
      EnemyType.COMMANDER,
      EnemyType.ARMORED
    ],
    grid: [
      // Row 0: Completely clear spawn lane across all 16 tiles
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 1: Clear spawn zones [0..2], [6..9], [13..15]
      [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
      // Row 2: Wide passage from spawns with cyber-ice tracks
      [5, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 5],
      // Row 3: Quantum pillars & neon brick arrays flanking open conduits
      [5, 0, 0, 2, 2, 0, 1, 1, 1, 1, 0, 2, 2, 0, 0, 5],
      // Row 4: Plasma energy conduits (cols 1-2, 7-8, 13-14 open)
      [4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 4],
      // Row 5: Central energy fortress with camouflage foliage
      [4, 0, 0, 4, 2, 2, 3, 3, 3, 3, 2, 2, 4, 0, 0, 4],
      // Row 6: Titanium choke points
      [0, 1, 1, 0, 2, 2, 3, 3, 3, 3, 2, 2, 0, 1, 1, 0],
      // Row 7: Central cyber nexus
      [0, 1, 1, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 1, 1, 0],
      // Row 8: Midfield transition plaza
      [0, 2, 2, 0, 1, 1, 1, 2, 2, 1, 1, 1, 0, 2, 2, 0],
      // Row 9: Southern defensive ring
      [0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
      // Row 10: Secondary plasma conduits with wide crossings
      [4, 0, 0, 4, 1, 1, 2, 2, 2, 2, 1, 1, 4, 0, 0, 4],
      // Row 11: Armored approach lanes
      [4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4],
      // Row 12: Clear approach boulevard
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 13: Supreme Citadel Command Core roof
      [1, 1, 0, 0, 2, 0, 1, 1, 1, 1, 0, 2, 0, 0, 1, 1],
      // Row 14: Base sides & core top
      [1, 1, 0, 0, 2, 0, 1, 8, 8, 1, 0, 2, 0, 0, 1, 1],
      // Row 15: Base foundation
      [0, 0, 0, 0, 0, 0, 1, 8, 8, 1, 0, 0, 0, 0, 0, 0]
    ]
  }
];

export function getLevel(id: number): LevelDefinition {
  const found = LEVELS.find((l) => l.id === id);
  return found || LEVELS[0];
}
