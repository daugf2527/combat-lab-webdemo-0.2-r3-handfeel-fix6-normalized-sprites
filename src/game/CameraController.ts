import Phaser from "phaser";

export class CameraController {
  private camera: Phaser.Cameras.Scene2D.Camera | null = null;
  private getTargetX: (() => number) | null = null;

  constructor(private readonly worldWidth = 1024, private readonly worldHeight = 640) {}

  bind(camera: Phaser.Cameras.Scene2D.Camera, getTargetX: () => number): void {
    this.camera = camera;
    this.getTargetX = getTargetX;
    camera.setBounds(0, 0, this.worldWidth, this.worldHeight);
    camera.roundPixels = true;
  }

  tick(): void {
    if (!this.camera || !this.getTargetX) return;
    const camera = this.camera;
    const roomCenterBias = this.worldWidth <= camera.width ? 0 : this.getTargetX() - camera.width * 0.42;
    const targetScrollX = Phaser.Math.Clamp(roomCenterBias, 0, Math.max(0, this.worldWidth - camera.width));
    camera.scrollX = Phaser.Math.Linear(camera.scrollX, targetScrollX, 0.045);
    camera.scrollY = 0;
  }

  shake(intensity: number, durationMs: number): void {
    if (!this.camera) return;
    this.camera.shake(durationMs, intensity / 200);
  }

  flash(color: number, alpha: number, durationMs: number): void {
    if (!this.camera) return;
    const scene = this.camera.scene;
    const cam = scene.cameras.main;
    const rect = scene.add.rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, color, alpha);
    rect.setScrollFactor(0);
    rect.setDepth(300);
    scene.tweens.add({
      targets: rect,
      alpha: 0,
      duration: durationMs,
      ease: "Sine.easeOut",
      onComplete: () => rect.destroy(),
    });
  }
}
