/**
 * Steel Front: Tank Defense
 * Terrain & Battlefield Grid Systems
 */

import { GridCell, TileType, LevelTheme } from './types';

export const GRID_SIZE = 16;
export const TILE_SIZE = 32;
export const CANVAS_SIZE = GRID_SIZE * TILE_SIZE; // 512 x 512

export class TerrainManager {
  public grid: GridCell[][] = [];
  public baseAlive: boolean = true;
  public baseHealth: number = 3; // Command core can withstand up to 3 hits or heavy blast
  public maxBaseHealth: number = 3;
  public baseCol: number = 7;
  public baseRow: number = 14;
  public theme: LevelTheme | null = null;

  constructor() {
    this.createEmptyGrid();
  }

  private createEmptyGrid(): void {
    this.grid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      this.grid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        this.grid[r][c] = { type: TileType.EMPTY, subs: null };
      }
    }
  }

  public fortifyTimer: number = 0;
  private fortifiedCells: { r: number; c: number }[] = [];

  public initFromMap(rawMap: number[][], basePos = { col: 7, row: 14 }, theme?: LevelTheme): void {
    this.baseCol = basePos.col;
    this.baseRow = basePos.row;
    this.baseAlive = true;
    this.baseHealth = this.maxBaseHealth;
    this.fortifyTimer = 0;
    this.fortifiedCells = [];
    this.theme = theme || null;
    this.grid = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      this.grid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const type = rawMap[r][c] as TileType;
        if (type === TileType.BRICK) {
          // 4 sub-quadrants: [TL, TR, BL, BR]
          this.grid[r][c] = {
            type: TileType.BRICK,
            subs: [true, true, true, true]
          };
        } else {
          this.grid[r][c] = {
            type: type,
            subs: null
          };
        }
      }
    }
  }

  public fortifyBase(duration = 20.0): void {
    this.fortifyTimer = duration;
    this.fortifiedCells = [];
    const rStart = Math.max(0, this.baseRow - 1);
    const rEnd = Math.min(GRID_SIZE - 1, this.baseRow + 1);
    const cStart = Math.max(0, this.baseCol - 1);
    const cEnd = Math.min(GRID_SIZE - 1, this.baseCol + 2);

    for (let r = rStart; r <= rEnd; r++) {
      for (let c = cStart; c <= cEnd; c++) {
        // Skip the base nest itself
        if ((r === this.baseRow || r === this.baseRow + 1) && (c === this.baseCol || c === this.baseCol + 1)) {
          continue;
        }
        const cell = this.grid[r]?.[c];
        if (cell && (cell.type === TileType.BRICK || cell.type === TileType.EMPTY)) {
          this.fortifiedCells.push({ r, c });
          this.grid[r][c] = { type: TileType.STEEL, subs: null };
        }
      }
    }
  }

  public updateFortification(dt: number): void {
    if (this.fortifyTimer > 0) {
      this.fortifyTimer -= dt;
      if (this.fortifyTimer <= 0) {
        // Revert surviving steel tiles back to solid brick
        for (const pos of this.fortifiedCells) {
          if (this.grid[pos.r]?.[pos.c]?.type === TileType.STEEL) {
            this.grid[pos.r][pos.c] = {
              type: TileType.BRICK,
              subs: [true, true, true, true]
            };
          }
        }
        this.fortifiedCells = [];
      }
    }
  }

  /**
   * Check if a coordinate is solid to tank movement
   */
  public isSolidForTank(x: number, y: number, size: number): boolean {
    if (x < 0 || x + size > CANVAS_SIZE || y < 0 || y + size > CANVAS_SIZE) {
      return true;
    }

    const testPoints = [
      { x: x + 2, y: y + 2 },
      { x: x + size - 2, y: y + 2 },
      { x: x + 2, y: y + size - 2 },
      { x: x + size - 2, y: y + size - 2 }
    ];

    for (const pt of testPoints) {
      const c = Math.floor(pt.x / TILE_SIZE);
      const r = Math.floor(pt.y / TILE_SIZE);
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return true;

      const cell = this.grid[r][c];
      if (!cell) continue;

      if (cell.type === TileType.STEEL || cell.type === TileType.WATER || cell.type === TileType.BASE) {
        return true;
      }

      if (cell.type === TileType.BRICK && cell.subs) {
        const localX = pt.x % TILE_SIZE;
        const localY = pt.y % TILE_SIZE;
        const subX = Math.floor(localX / 16);
        const subY = Math.floor(localY / 16);
        const subIdx = subY * 2 + subX;
        if (cell.subs[subIdx]) return true;
      }
    }

    return false;
  }

  /**
   * Check if tank is on an ICE tile
   */
  public isOnIce(x: number, y: number, size: number): boolean {
    const cx = Math.floor((x + size / 2) / TILE_SIZE);
    const cy = Math.floor((y + size / 2) / TILE_SIZE);
    if (cy >= 0 && cy < GRID_SIZE && cx >= 0 && cx < GRID_SIZE) {
      return this.grid[cy][cx]?.type === TileType.ICE;
    }
    return false;
  }

  /**
   * Check if tank is concealed inside GRASS
   */
  public isInGrass(x: number, y: number, size: number): boolean {
    const cx = Math.floor((x + size / 2) / TILE_SIZE);
    const cy = Math.floor((y + size / 2) / TILE_SIZE);
    if (cy >= 0 && cy < GRID_SIZE && cx >= 0 && cx < GRID_SIZE) {
      return this.grid[cy][cx]?.type === TileType.GRASS;
    }
    return false;
  }

  /**
   * Render terrain layers
   */
  public renderLowerLayer(ctx: CanvasRenderingContext2D, animTime: number): void {
    if (!this.grid || this.grid.length < GRID_SIZE) return;
    // Water and Ice are on lower layer
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!this.grid[r]) continue;
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = this.grid[r][c];
        if (!cell) continue;
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (cell.type === TileType.WATER) {
          this.renderWater(ctx, x, y, animTime);
        } else if (cell.type === TileType.ICE) {
          this.renderIce(ctx, x, y);
        }
      }
    }
  }

  public renderSolidLayer(ctx: CanvasRenderingContext2D, animTime: number): void {
    if (!this.grid || this.grid.length < GRID_SIZE) return;
    // Bricks, Steel, and Base
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!this.grid[r]) continue;
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = this.grid[r][c];
        if (!cell) continue;
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (cell.type === TileType.BRICK) {
          this.renderBrick(ctx, x, y, cell.subs);
        } else if (cell.type === TileType.STEEL) {
          this.renderSteel(ctx, x, y);
        } else if (cell.type === TileType.BASE) {
          if (r === this.baseRow && c === this.baseCol) {
            this.renderCommandCore(ctx, x, y, animTime);
          }
        }
      }
    }
  }

  public renderUpperLayer(ctx: CanvasRenderingContext2D): void {
    if (!this.grid || this.grid.length < GRID_SIZE) return;
    // Grass/foliage rendered on top of tanks for realistic camouflage concealment
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!this.grid[r]) continue;
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = this.grid[r][c];
        if (cell && cell.type === TileType.GRASS) {
          this.renderGrass(ctx, c * TILE_SIZE, r * TILE_SIZE);
        }
      }
    }
  }

  private renderBrick(ctx: CanvasRenderingContext2D, x: number, y: number, subs?: boolean[] | null): void {
    if (!subs) return;
    const half = TILE_SIZE / 2; // 16px
    const subCoords = [
      { x: x, y: y, active: subs[0] },
      { x: x + half, y: y, active: subs[1] },
      { x: x, y: y + half, active: subs[2] },
      { x: x + half, y: y + half, active: subs[3] }
    ];

    subCoords.forEach((sc) => {
      if (!sc.active) return;
      const primary = this.theme?.brickPrimary || '#b91c1c';
      const light = this.theme?.brickLight || '#ef4444';
      const dark = this.theme?.brickDark || '#7f1d1d';
      const mortar = this.theme?.brickMortar || '#450a0a';

      ctx.fillStyle = primary;
      ctx.fillRect(sc.x, sc.y, half, half);

      // Bevel 3D lighting
      ctx.fillStyle = light;
      ctx.fillRect(sc.x, sc.y, half, 1.5);
      ctx.fillRect(sc.x, sc.y, 1.5, half);

      ctx.fillStyle = dark;
      ctx.fillRect(sc.x, sc.y + half - 1.5, half, 1.5);
      ctx.fillRect(sc.x + half - 1.5, sc.y, 1.5, half);

      // Mortar lines
      ctx.fillStyle = mortar;
      ctx.fillRect(sc.x, sc.y + half / 2 - 1, half, 1);
      ctx.fillRect(sc.x + half / 2 - 1, sc.y, 1, half / 2);
    });
  }

  private renderSteel(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const sLight = this.theme?.steelLight || '#cbd5e1';
    const sMid = this.theme?.steelMid || '#94a3b8';
    const sDark = this.theme?.steelDark || '#64748b';

    const grad = ctx.createLinearGradient(x, y, x + TILE_SIZE, y + TILE_SIZE);
    grad.addColorStop(0, sLight);
    grad.addColorStop(0.5, sMid);
    grad.addColorStop(1, sDark);

    ctx.fillStyle = grad;
    ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

    ctx.strokeStyle = sLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1.5, y + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);

    // Corner rivets
    ctx.fillStyle = sDark;
    const rivets = [
      [x + 5, y + 5],
      [x + TILE_SIZE - 5, y + 5],
      [x + 5, y + TILE_SIZE - 5],
      [x + TILE_SIZE - 5, y + TILE_SIZE - 5]
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private renderWater(ctx: CanvasRenderingContext2D, x: number, y: number, animTime: number): void {
    const wColor = this.theme?.waterColor || '#0369a1';
    const wWave = this.theme?.waterWave || 'rgba(56, 189, 248, 0.45)';

    ctx.fillStyle = wColor;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = wWave;
    const wave = Math.sin(animTime * 3 + x * 0.1) * 3;
    ctx.fillRect(x + 2, y + 7 + wave, TILE_SIZE - 4, 3);
    ctx.fillRect(x + 2, y + 20 - wave, TILE_SIZE - 4, 3);
  }

  private renderIce(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const ice = this.theme?.iceColor || '#e0f2fe';
    ctx.fillStyle = ice;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Subtle frost cracks
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 4);
    ctx.lineTo(x + 18, y + 16);
    ctx.lineTo(x + 26, y + 28);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 4);
  }

  private renderGrass(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const grass = this.theme?.grassColor || 'rgba(21, 128, 61, 0.85)';
    ctx.fillStyle = grass;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
    for (let i = 0; i < 4; i++) {
      const ox = x + (i % 2) * 16 + 8;
      const oy = y + Math.floor(i / 2) * 16 + 8;
      ctx.beginPath();
      ctx.arc(ox, oy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Military Command Core (Original Protected Base)
   */
  private renderCommandCore(ctx: CanvasRenderingContext2D, x: number, y: number, animTime: number): void {
    const size = TILE_SIZE * 2; // 64x64

    // Fortified base concrete apron
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);

    if (this.baseAlive) {
      // Hexagonal Military Bunker
      const cx = x + size / 2;
      const cy = y + size / 2;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const px = cx + Math.cos(ang) * 22;
        const py = cy + Math.sin(ang) * 22;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing Reactor Core
      const pulse = Math.sin(animTime * 4) * 0.2 + 0.8;
      const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
      coreGrad.addColorStop(0, '#fef08a');
      coreGrad.addColorStop(0.5, '#facc15');
      coreGrad.addColorStop(1, '#ca8a04');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 11 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Rotating radar beam
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const rAng = animTime * 3;
      ctx.lineTo(cx + Math.cos(rAng) * 20, cy + Math.sin(rAng) * 20);
      ctx.stroke();

      // Health bar above Command Core
      const hpWidth = (size - 16) * (this.baseHealth / this.maxBaseHealth);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(x + 8, y + 6, size - 16, 4);
      ctx.fillStyle = this.baseHealth > 1 ? '#22c55e' : '#ef4444';
      ctx.fillRect(x + 8, y + 6, hpWidth, 4);
    } else {
      // Destroyed Core Ruins
      ctx.fillStyle = '#020617';
      ctx.fillRect(x + 6, y + 6, size - 12, size - 12);

      // Cracked charred concrete
      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 14, y + 18, 18, 14);
      ctx.fillRect(x + 36, y + 24, 16, 18);
      ctx.fillRect(x + 22, y + 38, 24, 12);

      // Emergency hazard cross
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 18, y + 18);
      ctx.lineTo(x + size - 18, y + size - 18);
      ctx.moveTo(x + size - 18, y + 18);
      ctx.lineTo(x + 18, y + size - 18);
      ctx.stroke();
    }
  }
}
