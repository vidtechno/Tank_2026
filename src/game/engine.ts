/**
 * Steel Front: Tank Defense
 * Master Game Engine Orchestrator
 */

import { Direction, EnemyType, GameState, InputState, LevelDefinition, PowerUpType } from './types';
import { getLevel, LEVELS } from './levels';
import { CANVAS_SIZE, TerrainManager, TILE_SIZE } from './terrain';
import { EnemyTank, PlayerTank, Tank } from './tank';
import { Bullet } from './bullet';
import { FloatingText, Particle } from './particles';
import { Sound } from './audio';
import { Storage } from './storage';
import { PowerUpManager } from './powerups';

export interface EngineCallbacks {
  onStateChange: (state: GameState) => void;
  onStatsUpdate: (stats: {
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
    activePowerUps: { type: PowerUpType; label: string; remaining: number }[];
    comboCount: number;
    comboMultiplier: number;
  }) => void;
  onLevelComplete: (summary: {
    levelId: number;
    score: number;
    enemiesDefeated: number;
    baseBonus: number;
    livesBonus: number;
  }) => void;
  onGameOver: (reason: string, score: number, levelId: number) => void;
  onVictory: (totalScore: number) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: EngineCallbacks;

  public state: GameState = 'menu';
  public currentLevelId: number = 1;
  public score: number = 0;
  public highScore: number = 0;
  public unlockedLevel: number = 1;

  public terrain: TerrainManager = new TerrainManager();
  public player: PlayerTank | null = null;
  public enemies: EnemyTank[] = [];
  public enemyQueue: EnemyType[] = [];
  public bullets: Bullet[] = [];
  public particles: Particle[] = [];
  public floatTexts: FloatingText[] = [];
  public powerups: PowerUpManager = new PowerUpManager();

  // New Combat Power-Up Timers & Combos
  public freezeTimer: number = 0;
  private comboCount: number = 0;
  private comboTimer: number = 0;

  // Spawners (3 top portals)
  private spawnTimers: number[] = [0, 0, 0];
  private spawnPositions = [
    { x: 1 * TILE_SIZE, y: 1 * TILE_SIZE },
    { x: 7 * TILE_SIZE + 16, y: 1 * TILE_SIZE },
    { x: 14 * TILE_SIZE, y: 1 * TILE_SIZE }
  ];
  private spawningPortalIndices: { index: number; timer: number }[] = [];

  private lastTime: number = 0;
  private running: boolean = false;
  private animFrameId: number | null = null;
  private screenShake: number = 0;
  private animClock: number = 0;

  // Level statistics tracking
  private enemiesDefeatedInLevel: number = 0;

  public input: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false
  };

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;

    this.highScore = Storage.getHighScore();
    this.unlockedLevel = Storage.getUnlockedLevel();
    this.currentLevelId = 1;

    // Prepare battlefield preview for Level 1, keeping game in 'menu' state
    this.prepareMenu(1);
  }

  public prepareMenu(levelId: number = 1): void {
    const level: LevelDefinition = getLevel(levelId);
    this.currentLevelId = level.id;
    this.score = 0;
    this.enemiesDefeatedInLevel = 0;
    this.bullets = [];
    this.particles = [];
    this.floatTexts = [];
    this.enemies = [];
    this.powerups.items = [];
    this.spawningPortalIndices = [];
    this.spawnTimers = [0, 0, 0];
    this.freezeTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;

    // Initialize terrain grid so the battlefield is rendered behind menu
    this.terrain.initFromMap(level.grid, level.basePosition, level.theme);
    this.enemyQueue = [...level.waves];

    const px = level.playerSpawn.col * TILE_SIZE;
    const py = level.playerSpawn.row * TILE_SIZE;
    if (!this.player) {
      this.player = new PlayerTank(px, py);
    } else {
      this.player.respawn(px, py);
    }

    this.state = 'menu';
    this.callbacks.onStateChange('menu');
    this.broadcastStats();
  }

  public startLoop(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const frame = (time: number) => {
      if (!this.running) return;
      const dt = Math.min((time - this.lastTime) / 1000, 0.05);
      this.lastTime = time;

      try {
        if (this.state === 'playing') {
          this.update(dt);
        } else {
          // Keep water waves and ambient animations live while in menu or paused
          this.animClock += dt;
        }
        this.render();
      } catch (err) {
        console.error('Game loop error:', err);
      }

      this.animFrameId = requestAnimationFrame(frame);
    };
    this.animFrameId = requestAnimationFrame(frame);
  }

  public stopLoop(): void {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public setInput(input: Partial<InputState>): void {
    this.input = { ...this.input, ...input };
  }

  public loadLevel(levelId: number, preserveScore = false): void {
    const level: LevelDefinition = getLevel(levelId);
    this.currentLevelId = level.id;
    if (!preserveScore) {
      this.score = 0;
    }

    this.enemiesDefeatedInLevel = 0;
    this.bullets = [];
    this.particles = [];
    this.floatTexts = [];
    this.enemies = [];
    this.powerups.items = [];
    this.spawningPortalIndices = [];
    this.spawnTimers = [0, 0, 0];
    this.freezeTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;

    // Initialize terrain grid
    this.terrain.initFromMap(level.grid, level.basePosition, level.theme);

    // Initialize enemy queue
    this.enemyQueue = [...level.waves];

    // Initialize player tank with 2 HP
    const px = level.playerSpawn.col * TILE_SIZE;
    const py = level.playerSpawn.row * TILE_SIZE;
    if (!this.player) {
      this.player = new PlayerTank(px, py);
    } else {
      this.player.respawn(px, py);
    }

    this.state = 'playing';
    this.callbacks.onStateChange('playing');
    Sound.playLevelStart();
    this.broadcastStats();
  }

  public pause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.callbacks.onStateChange('paused');
    }
  }

  public resume(): void {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.lastTime = performance.now();
      this.callbacks.onStateChange('playing');
    }
  }

  public restartCurrentLevel(): void {
    this.loadLevel(this.currentLevelId, true);
  }

  public update(dt: number): void {
    this.animClock += dt;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Freeze Countdown
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
    }

    // Base Fortification Countdown
    this.terrain.updateFortification(dt);

    // Combo Timer Countdown
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // Update Player Tank
    if (this.player && this.player.alive) {
      const otherTanks: Tank[] = this.enemies.filter((e) => e.alive);
      this.player.update(
        dt,
        this.input,
        this.terrain,
        otherTanks,
        (bx, by, dir) => {
          this.bullets.push(new Bullet(bx, by, dir, true));
          this.spawnSparks(bx, by, '#fef08a', 4);
        }
      );

      // Check Player Power-Up Pickup
      this.powerups.checkPlayerPickup(this.player.x, this.player.y, this.player.size, (type) => {
        this.applyPowerUp(type);
      });
    }

    // Update Power-Up Crates
    this.powerups.update(dt);

    // Spawner Management
    this.updateSpawners(dt);

    // Update Enemies (respect freeze state)
    const targetBaseX = (this.terrain.baseCol + 1) * TILE_SIZE;
    const targetBaseY = (this.terrain.baseRow + 1) * TILE_SIZE;
    const playerX = this.player && this.player.alive ? this.player.x : -1;
    const playerY = this.player && this.player.alive ? this.player.y : -1;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.isFrozen = this.freezeTimer > 0;

      const otherTanks: Tank[] = [
        ...(this.player && this.player.alive ? [this.player] : []),
        ...this.enemies.filter((_, idx) => idx !== i)
      ];

      enemy.update(
        dt,
        this.terrain,
        otherTanks,
        targetBaseX,
        targetBaseY,
        playerX,
        playerY,
        (bx, by, dir) => {
          this.bullets.push(new Bullet(bx, by, dir, false));
          this.spawnSparks(bx, by, '#f87171', 4);
        }
      );

      if (!enemy.alive) {
        this.enemies.splice(i, 1);
        this.checkLevelCompletion();
      }
    }

    // Resolve any physical overlap/jam between tanks (Player & Enemies)
    this.resolveTankCollisions();

    // Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.update(dt, this.terrain, {
        onSpawnSparks: (x, y, color, count) => this.spawnSparks(x, y, color, count),
        onExplosion: (x, y, isLarge) => this.spawnExplosion(x, y, isLarge),
        onBaseDamage: (dmg) => this.damageBase(dmg)
      });

      if (!b.active) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check Bullet vs Tanks
      if (b.isPlayer) {
        for (const enemy of this.enemies) {
          if (enemy.alive && Math.abs(enemy.x + 14 - b.x) < 16 && Math.abs(enemy.y + 14 - b.y) < 16) {
            b.active = false;
            enemy.hp -= 1;
            if (enemy.hp <= 0) {
              enemy.alive = false;
              this.enemiesDefeatedInLevel++;
              this.handleEnemyKilled(enemy);
            } else {
              Sound.playBrickDestroy();
              this.spawnSparks(enemy.x + 14, enemy.y + 14, '#ffffff', 8);
              this.floatTexts.push(new FloatingText(enemy.x + 14, enemy.y - 4, 'HIT!', '#ffffff'));
            }
            break;
          }
        }
      } else {
        // Enemy bullet vs Player
        if (this.player && this.player.alive) {
          if (Math.abs(this.player.x + 14 - b.x) < 16 && Math.abs(this.player.y + 14 - b.y) < 16) {
            b.active = false;
            if (this.player.shieldTimer > 0) {
              Sound.playSteelDeflect();
              this.spawnSparks(b.x, b.y, '#38bdf8', 8);
              this.floatTexts.push(new FloatingText(this.player.x + 14, this.player.y - 4, 'SHIELD DEFLECT!', '#38bdf8'));
            } else if (this.player.gracePeriod > 0) {
              Sound.playSteelDeflect();
              this.spawnSparks(b.x, b.y, '#f59e0b', 6);
            } else {
              this.damagePlayer();
            }
          }
        }
      }
    }

    // Bullet vs Bullet clashes
    for (let i = 0; i < this.bullets.length; i++) {
      for (let j = i + 1; j < this.bullets.length; j++) {
        const b1 = this.bullets[i];
        const b2 = this.bullets[j];
        if (b1.active && b2.active && b1.isPlayer !== b2.isPlayer) {
          if (Math.hypot(b1.x - b2.x, b1.y - b2.y) < 12) {
            b1.active = false;
            b2.active = false;
            this.spawnSparks((b1.x + b2.x) / 2, (b1.y + b2.y) / 2, '#ffffff', 8);
            Sound.playSteelDeflect();
          }
        }
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (!this.particles[i].alive) this.particles.splice(i, 1);
    }

    // Update Floating Text
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      this.floatTexts[i].update(dt);
      if (!this.floatTexts[i].alive) this.floatTexts.splice(i, 1);
    }

    this.broadcastStats();
  }

  private handleEnemyKilled(enemy: EnemyTank): void {
    // Track lifetime enemy kills
    Storage.addKills(1);

    // Combo Multiplier
    this.comboCount++;
    this.comboTimer = 3.5;
    const mult = Math.min(4, this.comboCount);
    const pts = enemy.spec.points * mult;

    this.addScore(pts, enemy.x + 14, enemy.y + 14);
    this.spawnExplosion(enemy.x + 14, enemy.y + 14, true);
    Sound.playExplosion(true);

    if (this.comboCount >= 2) {
      this.floatTexts.push(new FloatingText(enemy.x + 14, enemy.y - 14, `COMBO x${mult}!`, '#facc15'));
    }

    // 32% chance to drop a tactical power-up crate!
    if (Math.random() < 0.32) {
      this.powerups.spawnRandom(enemy.x, enemy.y);
    }
  }

  private applyPowerUp(type: PowerUpType): void {
    if (!this.player) return;

    this.addScore(300, this.player.x + 14, this.player.y + 14);

    switch (type) {
      case PowerUpType.SHIELD:
        this.player.shieldTimer = 10.0;
        this.floatTexts.push(new FloatingText(this.player.x + 14, this.player.y - 12, 'TITAN SHIELD 10s!', '#38bdf8'));
        break;

      case PowerUpType.FREEZE:
        this.freezeTimer = 8.0;
        for (const e of this.enemies) e.isFrozen = true;
        this.floatTexts.push(new FloatingText(this.player.x + 14, this.player.y - 12, 'TIME FREEZE 8s!', '#67e8f9'));
        break;

      case PowerUpType.NUKE:
        // Wipe all active enemy tanks on the screen!
        for (const enemy of this.enemies) {
          enemy.alive = false;
          this.spawnExplosion(enemy.x + 14, enemy.y + 14, true);
          this.addScore(enemy.spec.points, enemy.x + 14, enemy.y + 14);
        }
        this.enemies = [];
        this.screenShake = 18;
        Sound.playExplosion(true);
        this.floatTexts.push(new FloatingText(CANVAS_SIZE / 2, CANVAS_SIZE / 2, 'NUKE CLEARED ENEMY SQUAD!', '#ef4444'));
        this.checkLevelCompletion();
        break;

      case PowerUpType.FORTIFY:
        this.terrain.fortifyBase(20.0);
        this.floatTexts.push(
          new FloatingText(this.terrain.baseCol * TILE_SIZE + 32, this.terrain.baseRow * TILE_SIZE - 10, 'BASE FORTIFIED WITH STEEL!', '#94a3b8')
        );
        break;

      case PowerUpType.REPAIR:
        if (this.player.hp < 2) {
          this.player.hp = 2;
          this.floatTexts.push(new FloatingText(this.player.x + 14, this.player.y - 12, 'ARMOR RESTORED! (2/2 HP)', '#22c55e'));
        } else {
          this.player.lives = Math.min(5, this.player.lives + 1);
          this.floatTexts.push(new FloatingText(this.player.x + 14, this.player.y - 12, 'EXTRA TANK LIFE! (+1)', '#22c55e'));
        }
        break;

      case PowerUpType.RAPID:
        this.player.rapidTimer = 12.0;
        this.floatTexts.push(new FloatingText(this.player.x + 14, this.player.y - 12, 'RAPID CANNON (2/s) 12s!', '#f59e0b'));
        break;
    }

    this.broadcastStats();
  }

  private updateSpawners(dt: number): void {
    // Difficulty escalation: As sectors advance, allow more concurrent hostiles and faster deployment
    const MAX_ACTIVE_ENEMIES = this.currentLevelId <= 2 ? 4 : (this.currentLevelId <= 4 ? 5 : 6);
    const spawnThreshold = Math.max(1.1, 2.3 - (this.currentLevelId - 1) * 0.22);
    const portalWarningDuration = Math.max(0.7, 1.2 - (this.currentLevelId - 1) * 0.08);

    if (this.enemies.length >= MAX_ACTIVE_ENEMIES || this.enemyQueue.length === 0) return;

    // Advance warning portal timers
    for (let i = this.spawningPortalIndices.length - 1; i >= 0; i--) {
      const portal = this.spawningPortalIndices[i];
      portal.timer -= dt;
      if (portal.timer <= 0) {
        // Spawn Enemy now
        const pos = this.spawnPositions[portal.index];
        // If the spawn spot is currently occupied by any tank, wait briefly so the tank clears out
        if (this.isAreaBlockedByAnyTank(pos.x, pos.y, 26)) {
          portal.timer = 0.35;
          continue;
        }

        if (this.enemyQueue.length > 0 && this.enemies.length < MAX_ACTIVE_ENEMIES) {
          const type = this.enemyQueue.shift()!;
          this.enemies.push(new EnemyTank(pos.x, pos.y, type));
          this.spawnSparks(pos.x + 14, pos.y + 14, '#38bdf8', 12);
        }
        this.spawningPortalIndices.splice(i, 1);
      }
    }

    // Check if new portals can be activated
    for (let i = 0; i < 3; i++) {
      this.spawnTimers[i] += dt;
      const isAlreadySpawning = this.spawningPortalIndices.some((p) => p.index === i);
      if (
        !isAlreadySpawning &&
        this.spawnTimers[i] >= spawnThreshold &&
        this.enemies.length + this.spawningPortalIndices.length < MAX_ACTIVE_ENEMIES &&
        this.enemyQueue.length > 0
      ) {
        const pos = this.spawnPositions[i];
        const blocked = this.isAreaBlockedByAnyTank(pos.x, pos.y, 28);
        if (!blocked) {
          this.spawningPortalIndices.push({ index: i, timer: portalWarningDuration });
          this.spawnTimers[i] = 0;
        }
      }
    }
  }

  private isAreaBlockedByAnyTank(x: number, y: number, size: number): boolean {
    const allTanks = [...(this.player && this.player.alive ? [this.player] : []), ...this.enemies];
    for (const t of allTanks) {
      if (Math.abs(t.x - x) < size && Math.abs(t.y - y) < size) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resolves physical overlap and clumping between all active tanks.
   * Ensures multiple tanks never get wedged or lock each other in narrow spots.
   */
  private resolveTankCollisions(): void {
    const allTanks: Tank[] = [];
    if (this.player && this.player.alive) {
      allTanks.push(this.player);
    }
    for (const e of this.enemies) {
      if (e.alive) {
        allTanks.push(e);
      }
    }

    if (allTanks.length < 2) return;

    // Run 2 iterations for multi-tank stability
    for (let iter = 0; iter < 2; iter++) {
      for (let i = 0; i < allTanks.length; i++) {
        for (let j = i + 1; j < allTanks.length; j++) {
          const tA = allTanks[i];
          const tB = allTanks[j];

          const cAx = tA.x + tA.size / 2;
          const cAy = tA.y + tA.size / 2;
          const cBx = tB.x + tB.size / 2;
          const cBy = tB.y + tB.size / 2;

          const dx = cAx - cBx;
          const dy = cAy - cBy;
          const minDist = 26; // Threshold for 28px tanks

          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx < minDist && absDy < minDist) {
            const overlapX = minDist - absDx;
            const overlapY = minDist - absDy;

            if (overlapX < overlapY) {
              const sign = dx >= 0 ? 1 : -1;
              const push = overlapX * 0.5 + 0.5;

              const canMoveA = !this.terrain.isSolidForTank(tA.x + sign * push, tA.y, tA.size);
              const canMoveB = !this.terrain.isSolidForTank(tB.x - sign * push, tB.y, tB.size);

              if (canMoveA && canMoveB) {
                tA.x += sign * push;
                tB.x -= sign * push;
              } else if (canMoveA) {
                tA.x += sign * (push * 2);
              } else if (canMoveB) {
                tB.x -= sign * (push * 2);
              }
            } else {
              const sign = dy >= 0 ? 1 : -1;
              const push = overlapY * 0.5 + 0.5;

              const canMoveA = !this.terrain.isSolidForTank(tA.x, tA.y + sign * push, tA.size);
              const canMoveB = !this.terrain.isSolidForTank(tB.x, tB.y - sign * push, tB.size);

              if (canMoveA && canMoveB) {
                tA.y += sign * push;
                tB.y -= sign * push;
              } else if (canMoveA) {
                tA.y += sign * (push * 2);
              } else if (canMoveB) {
                tB.y -= sign * (push * 2);
              }
            }
          }
        }
      }
    }
  }

  private damageBase(dmg: number): void {
    if (!this.terrain.baseAlive) return;

    this.terrain.baseHealth = Math.max(0, this.terrain.baseHealth - dmg);
    this.screenShake = 12;
    Sound.playExplosion(true);
    this.floatTexts.push(new FloatingText(this.terrain.baseCol * TILE_SIZE + 32, this.terrain.baseRow * TILE_SIZE, 'BASE HIT!', '#ef4444'));

    if (this.terrain.baseHealth <= 0) {
      this.terrain.baseAlive = false;
      this.spawnExplosion(this.terrain.baseCol * TILE_SIZE + 32, this.terrain.baseRow * TILE_SIZE + 32, true);
      Sound.playBaseDestroy();
      this.state = 'game_over';
      this.callbacks.onStateChange('game_over');
      this.callbacks.onGameOver('COMMAND CORE DESTROYED', this.score, this.currentLevelId);
    }
  }

  /**
   * Player 2-Hit Armor Damage Logic:
   * 1st hit: Absorbed by armor, 1 HP remains, brief grace period.
   * 2nd hit: Tank explodes, losing 1 life.
   */
  private damagePlayer(): void {
    if (!this.player || !this.player.alive) return;

    this.player.hp -= 1;
    this.screenShake = 10;

    if (this.player.hp > 0) {
      // 1st Hit Taken: Armor absorbs damage!
      this.player.gracePeriod = 0.8;
      Sound.playBrickDestroy();
      this.spawnSparks(this.player.x + 14, this.player.y + 14, '#f59e0b', 16);
      this.floatTexts.push(new FloatingText(this.player.x + 14, this.player.y - 8, 'ARMOR HIT! 1 HP LEFT', '#f59e0b'));
    } else {
      // 2nd Hit Taken: Tank explodes!
      this.killPlayer();
    }

    this.broadcastStats();
  }

  private killPlayer(): void {
    if (!this.player || !this.player.alive) return;
    this.player.alive = false;
    this.player.lives -= 1;
    this.screenShake = 14;
    this.spawnExplosion(this.player.x + 14, this.player.y + 14, true);
    Sound.playPlayerDamage();

    if (this.player.lives > 0) {
      this.state = 'life_lost';
      this.callbacks.onStateChange('life_lost');
      setTimeout(() => {
        if (this.state === 'life_lost') {
          const level = getLevel(this.currentLevelId);
          this.player!.respawn(level.playerSpawn.col * TILE_SIZE, level.playerSpawn.row * TILE_SIZE);
          this.state = 'playing';
          this.callbacks.onStateChange('playing');
        }
      }, 1400);
    } else {
      this.state = 'game_over';
      this.callbacks.onStateChange('game_over');
      this.callbacks.onGameOver('ALL TANK LIVES LOST', this.score, this.currentLevelId);
    }
  }

  private checkLevelCompletion(): void {
    if (this.enemies.length === 0 && this.enemyQueue.length === 0 && this.terrain.baseAlive) {
      this.state = 'level_clear';
      this.callbacks.onStateChange('level_clear');

      const baseBonus = this.terrain.baseHealth * 100;
      const livesBonus = (this.player?.lives || 1) * 500;
      this.score += baseBonus + livesBonus;
      this.updateHighScore();

      // Unlock next level up to final sector
      if (this.currentLevelId < LEVELS.length) {
        const nextLvl = this.currentLevelId + 1;
        Storage.setUnlockedLevel(nextLvl);
        this.unlockedLevel = Storage.getUnlockedLevel();
      }

      Sound.playLevelClear();

      setTimeout(() => {
        if (this.currentLevelId >= LEVELS.length) {
          Storage.addVictory();
          this.state = 'victory';
          this.callbacks.onStateChange('victory');
          Sound.playVictory();
          this.callbacks.onVictory(this.score);
        } else {
          this.callbacks.onLevelComplete({
            levelId: this.currentLevelId,
            score: this.score,
            enemiesDefeated: this.enemiesDefeatedInLevel,
            baseBonus,
            livesBonus
          });
        }
      }, 1200);
    }
  }

  public addScore(pts: number, x: number, y: number): void {
    this.score += pts;
    this.updateHighScore();
    this.floatTexts.push(new FloatingText(x, y, `+${pts}`));
  }

  private updateHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      Storage.setHighScore(this.highScore);
    }
  }

  public spawnSparks(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 80 + 20;
      this.particles.push(
        new Particle(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd, color, Math.random() * 2 + 1.5, 0.25)
      );
    }
  }

  public spawnExplosion(x: number, y: number, isLarge: boolean): void {
    this.screenShake = isLarge ? 12 : 6;
    const count = isLarge ? 24 : 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 110 + 30) * (isLarge ? 1.4 : 1);
      const color = ['#f97316', '#ef4444', '#facc15', '#f8fafc'][Math.floor(Math.random() * 4)];
      this.particles.push(
        new Particle(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd, color, Math.random() * 3.5 + 2, Math.random() * 0.35 + 0.2)
      );
    }
    // Add smoke puffs
    for (let i = 0; i < (isLarge ? 8 : 4); i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 30 + 10;
      this.particles.push(
        new Particle(x, y, Math.cos(angle) * spd, Math.sin(angle) * spd, 'rgba(100, 116, 139, 0.5)', Math.random() * 4 + 4, 0.6, true)
      );
    }
  }

  private broadcastStats(): void {
    const reloadingRatio = this.player
      ? Math.min(1, this.player.fireTimer / (this.player.rapidTimer > 0 ? 0.5 : this.player.fireCooldown))
      : 1;

    const activePowerUps: { type: PowerUpType; label: string; remaining: number }[] = [];
    if (this.player && this.player.shieldTimer > 0) {
      activePowerUps.push({ type: PowerUpType.SHIELD, label: 'TITAN SHIELD', remaining: Math.ceil(this.player.shieldTimer) });
    }
    if (this.freezeTimer > 0) {
      activePowerUps.push({ type: PowerUpType.FREEZE, label: 'TIME FREEZE', remaining: Math.ceil(this.freezeTimer) });
    }
    if (this.terrain.fortifyTimer > 0) {
      activePowerUps.push({ type: PowerUpType.FORTIFY, label: 'STEEL BASE', remaining: Math.ceil(this.terrain.fortifyTimer) });
    }
    if (this.player && this.player.rapidTimer > 0) {
      activePowerUps.push({ type: PowerUpType.RAPID, label: 'RAPID CANNON', remaining: Math.ceil(this.player.rapidTimer) });
    }

    this.callbacks.onStatsUpdate({
      score: this.score,
      highScore: this.highScore,
      currentLevel: this.currentLevelId,
      unlockedLevel: this.unlockedLevel,
      lives: this.player?.lives || 0,
      playerHp: this.player?.hp || 2,
      maxPlayerHp: this.player?.maxHp || 2,
      enemiesRemaining: this.enemyQueue.length + this.enemies.length,
      baseHealth: this.terrain.baseHealth,
      maxBaseHealth: this.terrain.maxBaseHealth,
      activeEnemiesCount: this.enemies.length,
      reloadingRatio,
      activePowerUps,
      comboCount: this.comboCount,
      comboMultiplier: Math.min(4, Math.max(1, this.comboCount))
    });
  }

  public render(): void {
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;

    // Reset and apply device pixel ratio scale
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.save();

    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // Clear dark canvas using current sector's visual theme
    const theme = this.terrain.theme;
    ctx.fillStyle = theme?.bgColor || '#060911';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Subtle tactical grid markings with sector palette tint
    ctx.strokeStyle = theme?.gridLineColor || 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * TILE_SIZE, 0);
      ctx.lineTo(i * TILE_SIZE, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * TILE_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * TILE_SIZE);
      ctx.stroke();
    }

    // Optional atmospheric ambient haze
    if (theme?.ambientTint) {
      ctx.fillStyle = theme.ambientTint;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    // 1. Lower terrain (Water, Ice)
    this.terrain.renderLowerLayer(ctx, this.animClock);

    // 2. Tactical Power-Up Crates
    this.powerups.render(ctx);

    // 3. Spawn Portal warning indicators
    for (const portal of this.spawningPortalIndices) {
      const pos = this.spawnPositions[portal.index];
      const alpha = Math.sin(portal.timer * 15) * 0.4 + 0.5;
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x + 2, pos.y + 2, 28, 28);
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.3})`;
      ctx.fillRect(pos.x + 2, pos.y + 2, 28, 28);
    }

    // 4. Tanks
    if (this.player && this.player.alive) {
      this.player.render(ctx, this.terrain);
    }
    for (const enemy of this.enemies) {
      enemy.render(ctx, this.terrain);
    }

    // 5. Solid terrain (Bricks, Steel, Command Core)
    this.terrain.renderSolidLayer(ctx, this.animClock);

    // 6. Bullets
    for (const b of this.bullets) {
      b.render(ctx);
    }

    // 7. Upper foliage layer (Concealing Grass)
    this.terrain.renderUpperLayer(ctx);

    // 8. Base Alert Beacon if hostile tanks are near Command Core
    const baseNearHostiles = this.enemies.some(
      (e) => e.y > (this.terrain.baseRow - 4) * TILE_SIZE && Math.abs(e.x - this.terrain.baseCol * TILE_SIZE) < 5 * TILE_SIZE
    );
    if (baseNearHostiles && this.terrain.baseAlive) {
      const pulse = Math.sin(this.animClock * 10) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.2})`;
      ctx.fillRect(this.terrain.baseCol * TILE_SIZE - 16, this.terrain.baseRow * TILE_SIZE - 16, 96, 96);
    }

    // 9. Particles & Floating Texts
    for (const p of this.particles) {
      p.render(ctx);
    }
    for (const ft of this.floatTexts) {
      ft.render(ctx);
    }

    ctx.restore();
  }
}
