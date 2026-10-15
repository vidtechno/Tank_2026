/**
 * Steel Front: Tank Defense
 * Particle Effects & Combat Floating Text
 */

export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public color: string;
  public size: number;
  public life: number;
  public maxLife: number;
  public isSmoke: boolean;
  public alive: boolean = true;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    life: number,
    isSmoke = false
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = life;
    this.life = life;
    this.isSmoke = isSmoke;
  }

  public update(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.isSmoke) {
      this.size += dt * 8;
      this.vy -= dt * 10; // Smoke floats upward
    }
    this.life -= dt;
    if (this.life <= 0) {
      this.alive = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    if (this.isSmoke) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
    ctx.restore();
  }
}

export class FloatingText {
  public x: number;
  public y: number;
  public text: string;
  public color: string;
  public life: number = 0.8;
  public maxLife: number = 0.8;
  public alive: boolean = true;

  constructor(x: number, y: number, text: string, color = '#facc15') {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
  }

  public update(dt: number): void {
    this.y -= 26 * dt;
    this.life -= dt;
    if (this.life <= 0) {
      this.alive = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}
