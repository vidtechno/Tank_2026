/**
 * Steel Front: Tank Defense
 * Tactical Power-Up Crates System
 */

import { PowerUpItem, PowerUpType } from './types';
import { TILE_SIZE } from './terrain';
import { Sound } from './audio';

export class PowerUpManager {
  public items: PowerUpItem[] = [];

  public spawnRandom(x: number, y: number): void {
    const types = [
      PowerUpType.SHIELD,
      PowerUpType.FREEZE,
      PowerUpType.NUKE,
      PowerUpType.FORTIFY,
      PowerUpType.REPAIR,
      PowerUpType.RAPID
    ];
    const chosen = types[Math.floor(Math.random() * types.length)];

    // Snap within canvas boundaries
    const px = Math.max(TILE_SIZE, Math.min(512 - TILE_SIZE * 2, x));
    const py = Math.max(TILE_SIZE, Math.min(512 - TILE_SIZE * 2, y));

    this.items.push({
      x: px,
      y: py,
      type: chosen,
      life: 20.0,
      bobTimer: 0
    });

    Sound.playSteelDeflect();
  }

  public update(dt: number): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.life -= dt;
      item.bobTimer += dt * 5;
      if (item.life <= 0) {
        this.items.splice(i, 1);
      }
    }
  }

  public checkPlayerPickup(
    px: number,
    py: number,
    size: number,
    onPickup: (type: PowerUpType) => void
  ): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      const dist = Math.hypot(item.x + 14 - (px + size / 2), item.y + 14 - (py + size / 2));
      if (dist < 24) {
        onPickup(item.type);
        Sound.playVictory();
        this.items.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    for (const item of this.items) {
      // Blink when expiring
      if (item.life < 4 && Math.floor(item.life * 6) % 2 === 0) {
        continue;
      }

      ctx.save();
      const bob = Math.sin(item.bobTimer) * 2;
      ctx.translate(item.x + 14, item.y + 14 + bob);

      // Outer glowing ring
      const glowGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 18);
      glowGrad.addColorStop(0, 'rgba(250, 204, 21, 0.4)');
      glowGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Crate box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-11, -11, 22, 22);

      let borderColor = '#facc15';
      let iconColor = '#ffffff';

      switch (item.type) {
        case PowerUpType.SHIELD:
          borderColor = '#38bdf8';
          iconColor = '#38bdf8';
          break;
        case PowerUpType.FREEZE:
          borderColor = '#67e8f9';
          iconColor = '#a5f3fc';
          break;
        case PowerUpType.NUKE:
          borderColor = '#ef4444';
          iconColor = '#f87171';
          break;
        case PowerUpType.FORTIFY:
          borderColor = '#94a3b8';
          iconColor = '#cbd5e1';
          break;
        case PowerUpType.REPAIR:
          borderColor = '#22c55e';
          iconColor = '#4ade80';
          break;
        case PowerUpType.RAPID:
          borderColor = '#f59e0b';
          iconColor = '#fbbf24';
          break;
      }

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(-11, -11, 22, 22);

      // Icon graphics
      ctx.fillStyle = iconColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 12px monospace';

      let symbol = '★';
      if (item.type === PowerUpType.SHIELD) symbol = '🛡';
      else if (item.type === PowerUpType.FREEZE) symbol = '❄';
      else if (item.type === PowerUpType.NUKE) symbol = '💣';
      else if (item.type === PowerUpType.FORTIFY) symbol = '🧱';
      else if (item.type === PowerUpType.REPAIR) symbol = '➕';
      else if (item.type === PowerUpType.RAPID) symbol = '⚡';

      ctx.fillText(symbol, 0, 1);

      ctx.restore();
    }
  }
}
