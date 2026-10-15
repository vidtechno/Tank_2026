/**
 * Steel Front: Tank Defense
 * Projectile & Collision System
 */

import { Direction, TileType } from './types';
import { CANVAS_SIZE, TILE_SIZE, TerrainManager } from './terrain';
import { Sound } from './audio';

export const DIR_VECTORS = [
  { dx: 0, dy: -1, angle: 0 },
  { dx: 1, dy: 0, angle: Math.PI / 2 },
  { dx: 0, dy: 1, angle: Math.PI },
  { dx: -1, dy: 0, angle: -Math.PI / 2 }
];

export interface BulletCallbacks {
  onSpawnSparks: (x: number, y: number, color: string, count: number) => void;
  onExplosion: (x: number, y: number, isLarge: boolean) => void;
  onBaseDamage: (damage: number) => void;
}

export class Bullet {
  public x: number;
  public y: number;
  public dir: Direction;
  public isPlayer: boolean;
  public speed: number = 220; // Balanced tactical bullet speed
  public active: boolean = true;
  public size: number = 5;

  constructor(x: number, y: number, dir: Direction, isPlayer: boolean) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.isPlayer = isPlayer;
  }

  public update(dt: number, terrain: TerrainManager, cb: BulletCallbacks): void {
    if (!this.active) return;

    const v = DIR_VECTORS[this.dir];
    this.x += v.dx * this.speed * dt;
    this.y += v.dy * this.speed * dt;

    // Boundary check
    if (this.x < 0 || this.x > CANVAS_SIZE || this.y < 0 || this.y > CANVAS_SIZE) {
      this.active = false;
      cb.onSpawnSparks(this.x, this.y, '#94a3b8', 4);
      return;
    }

    // Check collision with terrain
    this.checkTerrainCollision(terrain, cb);
  }

  private checkTerrainCollision(terrain: TerrainManager, cb: BulletCallbacks): void {
    const c = Math.floor(this.x / TILE_SIZE);
    const r = Math.floor(this.y / TILE_SIZE);
    if (r < 0 || r >= 16 || c < 0 || c >= 16) return;

    const cell = terrain.grid[r][c];
    if (!cell) return;

    // Destructible Brick
    if (cell.type === TileType.BRICK && cell.subs) {
      const localX = this.x % TILE_SIZE;
      const localY = this.y % TILE_SIZE;
      const subX = Math.floor(localX / 16);
      const subY = Math.floor(localY / 16);
      const subIdx = subY * 2 + subX;

      if (cell.subs[subIdx]) {
        cell.subs[subIdx] = false;
        this.active = false;
        Sound.playBrickDestroy();
        cb.onSpawnSparks(this.x, this.y, '#ef4444', 6);

        // If all 4 destroyed, clear cell
        if (!cell.subs.some(Boolean)) {
          cell.type = TileType.EMPTY;
          cell.subs = null;
        }
      }
    }
    // Indestructible Steel
    else if (cell.type === TileType.STEEL) {
      this.active = false;
      Sound.playSteelDeflect();
      cb.onSpawnSparks(this.x, this.y, '#f8fafc', 7);
    }
    // Command Core Base
    else if (cell.type === TileType.BASE && terrain.baseAlive) {
      this.active = false;
      cb.onBaseDamage(1);
      cb.onSpawnSparks(this.x, this.y, '#facc15', 10);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = this.isPlayer ? '#fef08a' : '#f87171';
    ctx.shadowColor = this.isPlayer ? 'rgba(250, 204, 21, 0.8)' : 'rgba(239, 68, 68, 0.8)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
