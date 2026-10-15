/**
 * Steel Front: Tank Defense
 * Tank Entities: Player & Enemy Specializations
 */

import { Direction, EnemySpec, EnemyType, InputState } from './types';
import { DIR_VECTORS } from './bullet';
import { TerrainManager } from './terrain';
import { Sound } from './audio';

export const ENEMY_SPECS: Record<EnemyType, EnemySpec> = {
  [EnemyType.SCOUT]: {
    name: 'Scout Tank',
    speed: 80,
    hp: 1,
    maxHp: 1,
    points: 100,
    fireCooldown: 2.2,
    colorBody: '#cbd5e1',
    colorArmor: '#64748b',
    colorTurret: '#f1f5f9'
  },
  [EnemyType.ASSAULT]: {
    name: 'Assault Tank',
    speed: 62,
    hp: 2,
    maxHp: 2,
    points: 200,
    fireCooldown: 1.8,
    colorBody: '#f87171',
    colorArmor: '#991b1b',
    colorTurret: '#fca5a5'
  },
  [EnemyType.ARMORED]: {
    name: 'Heavy Armored Tank',
    speed: 46,
    hp: 4,
    maxHp: 4,
    points: 400,
    fireCooldown: 2.0,
    colorBody: '#38bdf8',
    colorArmor: '#0369a1',
    colorTurret: '#0284c7'
  },
  [EnemyType.COMMANDER]: {
    name: 'Commander Smart Tank',
    speed: 74,
    hp: 3,
    maxHp: 3,
    points: 500,
    fireCooldown: 1.4,
    colorBody: '#f43f5e',
    colorArmor: '#9f1239',
    colorTurret: '#fbbf24'
  }
};

export class Tank {
  public x: number;
  public y: number;
  public dir: Direction;
  public size: number = 28;
  public isPlayer: boolean;
  public alive: boolean = true;
  public moving: boolean = false;
  public treadAnim: number = 0;
  public hp: number;
  public maxHp: number;
  public speed: number;
  public shieldTimer: number = 0;
  public fireCooldown: number = 0.32;
  public fireTimer: number = 0;

  // Ice sliding inertia
  public slideVx: number = 0;
  public slideVy: number = 0;

  constructor(x: number, y: number, dir: Direction, isPlayer: boolean) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.isPlayer = isPlayer;
    this.hp = 1;
    this.maxHp = 1;
    this.speed = 100;
  }

  public updateTreads(dt: number): void {
    if (this.moving) {
      this.treadAnim = (this.treadAnim + dt * 16) % 4;
    }
  }

  public canMoveTo(newX: number, newY: number, terrain: TerrainManager, otherTanks: Tank[]): boolean {
    if (terrain.isSolidForTank(newX, newY, this.size)) {
      return false;
    }

    const MIN_DIST = this.size - 2; // 26px threshold

    for (const ot of otherTanks) {
      if (ot !== this && ot.alive) {
        const curDistX = Math.abs(ot.x - this.x);
        const curDistY = Math.abs(ot.y - this.y);
        const newDistX = Math.abs(ot.x - newX);
        const newDistY = Math.abs(ot.y - newY);

        // If currently overlapping or touching with another tank:
        if (curDistX < MIN_DIST && curDistY < MIN_DIST) {
          // If moving deeper into overlap, block it.
          // But if moving AWAY from other tank (hypothetical distance increases), permit movement!
          const curDist = Math.hypot(ot.x - this.x, ot.y - this.y);
          const newDist = Math.hypot(ot.x - newX, ot.y - newY);
          if (newDist < curDist - 0.001) {
            return false;
          }
          continue;
        }

        // Standard collision when not already overlapping:
        if (newDistX < MIN_DIST && newDistY < MIN_DIST) {
          return false;
        }
      }
    }

    return true;
  }
}

export class PlayerTank extends Tank {
  public lives: number = 3;
  public autoFireInterval: number = 1.0; // Exactly 1 bullet every 1 second
  public gracePeriod: number = 0; // Brief invulnerability buffer after taking hit
  public rapidTimer: number = 0; // Rapid cannon powerup duration

  constructor(x: number, y: number) {
    super(x, y, Direction.UP, true);
    this.speed = 76; // Crisp tactical movement speed
    this.shieldTimer = 3.0; // 3-second spawn shield
    this.hp = 2; // Can withstand 2 bullet hits!
    this.maxHp = 2;
    this.fireCooldown = 1.0;
    this.fireTimer = 0;
  }

  public respawn(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.dir = Direction.UP;
    this.alive = true;
    this.hp = 2; // Respawn with full 2 HP armor!
    this.maxHp = 2;
    this.shieldTimer = 3.0;
    this.gracePeriod = 0;
    this.rapidTimer = 0;
    this.slideVx = 0;
    this.slideVy = 0;
    this.fireTimer = 0;
  }

  public update(
    dt: number,
    input: InputState,
    terrain: TerrainManager,
    otherTanks: Tank[],
    onFireBullet: (x: number, y: number, dir: Direction) => void
  ): void {
    if (!this.alive) return;

    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
    }
    if (this.gracePeriod > 0) {
      this.gracePeriod -= dt;
    }
    if (this.rapidTimer > 0) {
      this.rapidTimer -= dt;
    }

    // Auto-fire interval (0.5s when rapid powerup is active, otherwise 1.0s)
    const currentInterval = this.rapidTimer > 0 ? 0.5 : this.autoFireInterval;
    this.fireTimer += dt;
    if (this.fireTimer >= currentInterval) {
      this.fireTimer = 0;
      const v = DIR_VECTORS[this.dir];
      const bx = this.x + this.size / 2 + v.dx * 18;
      const by = this.y + this.size / 2 + v.dy * 18;
      onFireBullet(bx, by, this.dir);
    }

    // Movement direction determination
    let nextDir: Direction | null = null;
    if (input.up) nextDir = Direction.UP;
    else if (input.right) nextDir = Direction.RIGHT;
    else if (input.down) nextDir = Direction.DOWN;
    else if (input.left) nextDir = Direction.LEFT;

    const onIce = terrain.isOnIce(this.x, this.y, this.size);

    if (nextDir !== null) {
      this.moving = true;
      this.dir = nextDir;
      const v = DIR_VECTORS[this.dir];

      // Corner alignment assist for crisp navigation in corridors
      if (v.dx !== 0) {
        const targetY = Math.round(this.y / 16) * 16;
        if (Math.abs(this.y - targetY) <= 7) {
          const testY = this.y + (targetY - this.y) * 0.22;
          if (this.canMoveTo(this.x, testY, terrain, otherTanks)) {
            this.y = testY;
          }
        }
      } else if (v.dy !== 0) {
        const targetX = Math.round(this.x / 16) * 16;
        if (Math.abs(this.x - targetX) <= 7) {
          const testX = this.x + (targetX - this.x) * 0.22;
          if (this.canMoveTo(testX, this.y, terrain, otherTanks)) {
            this.x = testX;
          }
        }
      }

      const dist = this.speed * dt;
      const nextX = this.x + v.dx * dist;
      const nextY = this.y + v.dy * dist;

      if (this.canMoveTo(nextX, nextY, terrain, otherTanks)) {
        this.x = nextX;
        this.y = nextY;
        if (onIce) {
          this.slideVx = v.dx * this.speed * 0.6;
          this.slideVy = v.dy * this.speed * 0.6;
        }
      }
    } else {
      this.moving = false;
    }

    // Ice sliding inertia
    if (onIce && (Math.abs(this.slideVx) > 5 || Math.abs(this.slideVy) > 5)) {
      const slideX = this.x + this.slideVx * dt;
      const slideY = this.y + this.slideVy * dt;
      if (this.canMoveTo(slideX, slideY, terrain, otherTanks)) {
        this.x = slideX;
        this.y = slideY;
      }
      this.slideVx *= 0.94;
      this.slideVy *= 0.94;
    } else {
      this.slideVx = 0;
      this.slideVy = 0;
    }

    this.updateTreads(dt);
  }

  public render(ctx: CanvasRenderingContext2D, terrain: TerrainManager): void {
    if (!this.alive) return;
    const inGrass = terrain.isInGrass(this.x, this.y, this.size);

    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(DIR_VECTORS[this.dir].angle);

    if (inGrass) {
      ctx.globalAlpha = 0.55; // Camouflage transparency
    }

    const half = this.size / 2;

    // Treads
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-half - 1, -half, 5, this.size);
    ctx.fillRect(half - 4, -half, 5, this.size);

    // Tread links
    ctx.fillStyle = '#334155';
    for (let i = 0; i < 4; i++) {
      const ty = -half + ((i * 7 + this.treadAnim) % this.size);
      ctx.fillRect(-half - 1, ty, 5, 2);
      ctx.fillRect(half - 4, ty, 5, 2);
    }

    // Golden / Yellow Tank Chassis (or damaged amber if 1 HP)
    const isDamaged = this.hp === 1;
    const bodyColor1 = isDamaged ? '#f59e0b' : '#facc15';
    const bodyColor2 = isDamaged ? '#b45309' : '#ca8a04';

    const grad = ctx.createLinearGradient(-half, -half, half, half);
    grad.addColorStop(0, bodyColor1);
    grad.addColorStop(1, bodyColor2);
    ctx.fillStyle = grad;
    ctx.fillRect(-half + 4, -half + 2, this.size - 8, this.size - 4);

    // Chassis bevel highlight
    ctx.fillStyle = isDamaged ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(-half + 4, -half + 2, this.size - 8, 2);

    // Battle damage crack on armor when at 1 HP
    if (isDamaged) {
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-half + 6, -half + 5);
      ctx.lineTo(-half + 11, -half + 9);
      ctx.lineTo(-half + 16, -half + 7);
      ctx.stroke();
    }

    // Cannon Barrel
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-2.5, -half - 5, 5, half + 4);
    // Muzzle Brake
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3.5, -half - 6, 7, 2.5);

    // Turret Dome
    ctx.fillStyle = isDamaged ? '#fed7aa' : '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 1, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Spawn Shield or Grace Period Bubble
    if (this.shieldTimer > 0 || this.gracePeriod > 0) {
      const time = performance.now() * 0.008;
      const shieldColor = this.shieldTimer > 0 ? 'rgba(56, 189, 248' : 'rgba(245, 158, 11';
      ctx.strokeStyle = `${shieldColor}, ${0.5 + Math.sin(time) * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Mini 2-Pip Armor indicator above player tank
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8, -half - 8, 16, 3);
    for (let p = 0; p < 2; p++) {
      ctx.fillStyle = p < this.hp ? (this.hp === 2 ? '#22c55e' : '#f59e0b') : '#334155';
      ctx.fillRect(-7 + p * 8, -half - 7, 6, 2);
    }

    ctx.restore();
  }
}

export class EnemyTank extends Tank {
  public enemyType: EnemyType;
  public spec: EnemySpec;
  public isFrozen: boolean = false;
  private aiTimer: number = 0;
  private unstuckTimer: number = 0;
  private scanAngle: number = 0;

  constructor(x: number, y: number, enemyType: EnemyType) {
    super(x, y, Direction.DOWN, false);
    this.enemyType = enemyType;
    this.spec = ENEMY_SPECS[enemyType];
    this.speed = this.spec.speed;
    this.hp = this.spec.hp;
    this.maxHp = this.spec.hp;
    this.fireCooldown = this.spec.fireCooldown;
    this.fireTimer = Math.random() * 0.8;
    this.aiTimer = Math.random() * 1.0 + 0.5;
  }

  public getClearDirections(terrain: TerrainManager, otherTanks: Tank[], testDist: number = 6): Direction[] {
    const allDirs = [Direction.DOWN, Direction.RIGHT, Direction.LEFT, Direction.UP];
    return allDirs.filter((d) => {
      const v = DIR_VECTORS[d];
      return this.canMoveTo(this.x + v.dx * testDist, this.y + v.dy * testDist, terrain, otherTanks);
    });
  }

  public getOppositeDir(d: Direction): Direction {
    switch (d) {
      case Direction.UP:
        return Direction.DOWN;
      case Direction.DOWN:
        return Direction.UP;
      case Direction.LEFT:
        return Direction.RIGHT;
      case Direction.RIGHT:
        return Direction.LEFT;
    }
  }

  public update(
    dt: number,
    terrain: TerrainManager,
    otherTanks: Tank[],
    targetBaseX: number,
    targetBaseY: number,
    playerX: number,
    playerY: number,
    onFireBullet: (x: number, y: number, dir: Direction) => void
  ): void {
    if (!this.alive) return;
    if (this.isFrozen) return; // Frozen tanks cannot move or fire!

    this.scanAngle += dt * 5;

    this.fireTimer += dt;
    if (this.fireTimer >= this.fireCooldown) {
      this.fireTimer = 0;
      const v = DIR_VECTORS[this.dir];
      const bx = this.x + this.size / 2 + v.dx * 18;
      const by = this.y + this.size / 2 + v.dy * 18;
      onFireBullet(bx, by, this.dir);
    }

    // AI Direction Selection
    this.aiTimer -= dt;

    if (this.enemyType === EnemyType.COMMANDER) {
      // SMART COMMANDER AI: Actively targets Command Core or Player
      let targetX = targetBaseX;
      let targetY = targetBaseY;

      if (playerX >= 0 && playerY >= 0) {
        const distToPlayer = Math.hypot(playerX - this.x, playerY - this.y);
        // If player is close, engage player; otherwise advance towards Command Core
        if (distToPlayer < 200) {
          targetX = playerX;
          targetY = playerY;
        }
      }

      if (this.aiTimer <= 0) {
        this.aiTimer = 0.35 + Math.random() * 0.35;
        const dx = targetX - this.x;
        const dy = targetY - this.y;

        const candidateDirs = [Direction.DOWN, Direction.UP, Direction.RIGHT, Direction.LEFT];
        // Rank directions by progress towards target (dot product)
        candidateDirs.sort((a, b) => {
          const va = DIR_VECTORS[a];
          const vb = DIR_VECTORS[b];
          const scoreA = va.dx * dx + va.dy * dy;
          const scoreB = vb.dx * dx + vb.dy * dy;
          return scoreB - scoreA;
        });

        // Find open directions
        const clearDirs = this.getClearDirections(terrain, otherTanks, 8);
        const bestClear = candidateDirs.find((d) => clearDirs.includes(d));
        if (bestClear !== undefined) {
          this.dir = bestClear;
        } else if (clearDirs.length > 0) {
          this.dir = clearDirs[0];
        }
      }
    } else {
      // STANDARD ENEMY AI (Scout, Assault, Armored)
      if (this.aiTimer <= 0) {
        this.aiTimer = Math.random() * 1.5 + 0.8;
        const clearDirs = this.getClearDirections(terrain, otherTanks, 8);
        if (clearDirs.length > 0) {
          // Weighted towards advance (DOWN towards Command Core) or flanking
          if (clearDirs.includes(Direction.DOWN) && this.y < targetBaseY && Math.random() < 0.55) {
            this.dir = Direction.DOWN;
          } else {
            this.dir = clearDirs[Math.floor(Math.random() * clearDirs.length)];
          }
        }
      }
    }

    const v = DIR_VECTORS[this.dir];

    // Corner alignment assist for crisp navigation through corridors (with collision guard)
    if (v.dx !== 0) {
      const targetGridY = Math.round(this.y / 16) * 16;
      if (Math.abs(this.y - targetGridY) <= 6) {
        const testY = this.y + (targetGridY - this.y) * 0.22;
        if (this.canMoveTo(this.x, testY, terrain, otherTanks)) {
          this.y = testY;
        }
      }
    } else if (v.dy !== 0) {
      const targetGridX = Math.round(this.x / 16) * 16;
      if (Math.abs(this.x - targetGridX) <= 6) {
        const testX = this.x + (targetGridX - this.x) * 0.22;
        if (this.canMoveTo(testX, this.y, terrain, otherTanks)) {
          this.x = testX;
        }
      }
    }

    const dist = this.speed * dt;
    const nextX = this.x + v.dx * dist;
    const nextY = this.y + v.dy * dist;

    if (this.canMoveTo(nextX, nextY, terrain, otherTanks)) {
      this.x = nextX;
      this.y = nextY;
      this.moving = true;
      this.unstuckTimer = 0;
    } else {
      this.moving = false;
      this.unstuckTimer += dt;

      // When blocked by obstacle or brick ahead, blast cannon to clear obstruction
      if (this.fireTimer >= this.fireCooldown * 0.7) {
        const bx = this.x + this.size / 2 + v.dx * 18;
        const by = this.y + this.size / 2 + v.dy * 18;
        onFireBullet(bx, by, this.dir);
        this.fireTimer = 0;
      }

      // Fast unstuck response (after 0.10s of being blocked)
      if (this.unstuckTimer > 0.10) {
        // Find clear directions other than current blocked direction
        const clearDirs = this.getClearDirections(terrain, otherTanks, 6).filter((d) => d !== this.dir);

        if (clearDirs.length > 0) {
          if (this.enemyType === EnemyType.COMMANDER) {
            const dx = targetBaseX - this.x;
            const dy = targetBaseY - this.y;
            clearDirs.sort((a, b) => {
              const va = DIR_VECTORS[a];
              const vb = DIR_VECTORS[b];
              return vb.dx * dx + vb.dy * dy - (va.dx * dx + va.dy * dy);
            });
            this.dir = clearDirs[0];
          } else {
            // Pick clear direction (preferring perpendicular movement or backing away)
            this.dir = clearDirs[Math.floor(Math.random() * clearDirs.length)];
          }
          this.aiTimer = 0.5 + Math.random() * 0.5;
          this.unstuckTimer = 0;
        } else {
          // If 6px is blocked, test reverse direction with small clearance to disengage from jam
          const oppDir = this.getOppositeDir(this.dir);
          const vOpp = DIR_VECTORS[oppDir];
          if (this.canMoveTo(this.x + vOpp.dx * 3, this.y + vOpp.dy * 3, terrain, otherTanks)) {
            this.dir = oppDir;
            this.aiTimer = 0.4;
            this.unstuckTimer = 0;
          } else {
            // Still tightly confined: try any other direction to trigger search in next frames
            const dirs = [Direction.DOWN, Direction.RIGHT, Direction.LEFT, Direction.UP].filter((d) => d !== this.dir);
            this.dir = dirs[Math.floor(Math.random() * dirs.length)];
            this.unstuckTimer = 0;
          }
        }
      }
    }

    this.updateTreads(dt);
  }

  public render(ctx: CanvasRenderingContext2D, terrain: TerrainManager): void {
    if (!this.alive) return;
    const inGrass = terrain.isInGrass(this.x, this.y, this.size);

    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(DIR_VECTORS[this.dir].angle);

    if (inGrass) {
      ctx.globalAlpha = 0.55;
    }

    const half = this.size / 2;

    // Treads
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-half - 1, -half, 5, this.size);
    ctx.fillRect(half - 4, -half, 5, this.size);

    // Tread links
    ctx.fillStyle = '#334155';
    for (let i = 0; i < 4; i++) {
      const ty = -half + ((i * 7 + this.treadAnim) % this.size);
      ctx.fillRect(-half - 1, ty, 5, 2);
      ctx.fillRect(half - 4, ty, 5, 2);
    }

    // Chassis
    const grad = ctx.createLinearGradient(-half, -half, half, half);
    grad.addColorStop(0, this.spec.colorBody);
    grad.addColorStop(1, this.spec.colorArmor);
    ctx.fillStyle = grad;
    ctx.fillRect(-half + 4, -half + 2, this.size - 8, this.size - 4);

    // Barrel
    ctx.fillStyle = this.enemyType === EnemyType.COMMANDER ? '#f43f5e' : '#475569';
    ctx.fillRect(-2.5, -half - 5, 5, half + 4);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3.5, -half - 6, 7, 2.5);

    // Turret Dome
    ctx.fillStyle = this.hp < this.maxHp ? '#ea580c' : this.spec.colorTurret;
    ctx.beginPath();
    ctx.arc(0, 1, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // SPECIAL: Commander Tank Radar Dish & Laser Scanner
    if (this.enemyType === EnemyType.COMMANDER) {
      // Golden Command Antenna
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(3, -2);
      ctx.lineTo(6, -6);
      ctx.stroke();

      // Pulsing radar emitter
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(6, -6, 2, 0, Math.PI * 2);
      ctx.fill();

      // Targeting reticle cone
      const radarPulse = Math.sin(this.scanAngle) * 0.3 + 0.4;
      ctx.strokeStyle = `rgba(244, 63, 94, ${radarPulse})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -half - 8, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Health pips above tank (3 pips)
      for (let i = 0; i < this.maxHp; i++) {
        ctx.fillStyle = i < this.hp ? '#f43f5e' : '#334155';
        ctx.fillRect(-7 + i * 5, -half - 8, 4, 2.5);
      }
    }

    // Heavy Armored plates visual indicators
    if (this.enemyType === EnemyType.ARMORED) {
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      ctx.strokeRect(-half + 5, -half + 4, this.size - 10, this.size - 8);

      // Health pips above tank
      for (let i = 0; i < this.maxHp; i++) {
        ctx.fillStyle = i < this.hp ? '#38bdf8' : '#334155';
        ctx.fillRect(-8 + i * 4.5, -half - 8, 3.5, 2.5);
      }
    }

    // Freeze ice crystalline overlay
    if (this.isFrozen) {
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 2;
      ctx.strokeRect(-half - 2, -half - 2, this.size + 4, this.size + 4);
      ctx.fillStyle = 'rgba(103, 232, 249, 0.4)';
      ctx.fillRect(-half - 2, -half - 2, this.size + 4, this.size + 4);
    }

    ctx.restore();
  }
}
