/**
 * EquipmentTestScene - Test scene for DNF layered sprite alignment
 */

import Phaser from "phaser";
import { DnfLayeredSprite, AlignmentMode } from "./DnfLayeredSprite.js";

export class EquipmentTestScene extends Phaser.Scene {
  private layeredSprite?: DnfLayeredSprite;
  private currentMode: AlignmentMode = "mode2_500x500_canvas";
  private modeText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;

  private readonly MODES: AlignmentMode[] = [
    "mode1_imganchor_as_offset",
    "mode2_500x500_canvas",
    "mode3_relative_to_body",
    "mode4_ignore_imganchor",
    "mode5_negated_imganchor",
  ];

  constructor() {
    super("equipment-test");
  }

  create(): void {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor("#1a1a2e");

    // Title
    this.add.text(width / 2, 30, "DNF Equipment Layer Alignment Test", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#ffffff",
    }).setOrigin(0.5);

    // Instructions
    this.instructionText = this.add.text(width / 2, 70, "Press SPACE to cycle alignment modes | Arrow keys to change frame", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#aaaaaa",
    }).setOrigin(0.5);

    // Mode indicator
    this.modeText = this.add.text(width / 2, height - 40, "", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#00ff00",
    }).setOrigin(0.5);

    // Load metadata
    const bodyMeta = this.cache.json.get("dnf_swordman_stay_meta");
    if (!bodyMeta) {
      this.add.text(width / 2, height / 2, "ERROR: Body meta not loaded", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ff0000",
      }).setOrigin(0.5);
      return;
    }

    // Load equipment layer metadata
    const layerMetas = new Map<string, any>();
    const layers = ["coat_a", "hair_a", "pants_a", "shoes_a"];
    for (const layer of layers) {
      const meta = this.cache.json.get(`dnf_swordman_stay_${layer}_meta`);
      if (meta) {
        layerMetas.set(layer, meta);
        console.log(`Loaded ${layer} meta:`, meta.frames[0]);
      } else {
        console.log(`${layer} meta not found`);
      }
    }

    if (layerMetas.size === 0) {
      this.add.text(width / 2, height / 2, "ERROR: No equipment layers loaded", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ff0000",
      }).setOrigin(0.5);
      return;
    }

    // Create layered sprite at center
    this.layeredSprite = new DnfLayeredSprite(
      this,
      width / 2,
      height / 2 + 50,
      "dnf_swordman_stay",
      bodyMeta,
      layerMetas
    );

    // Scale up for visibility
    this.layeredSprite.setScale(3);

    // Draw reference crosshair at container origin
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xff0000, 0.5);
    graphics.lineBetween(width / 2 - 20, height / 2 + 50, width / 2 + 20, height / 2 + 50);
    graphics.lineBetween(width / 2, height / 2 + 30, width / 2, height / 2 + 70);

    // Update mode text
    this.updateModeText();

    // Keyboard controls
    this.input.keyboard?.on("keydown-SPACE", () => this.cycleMode());
    this.input.keyboard?.on("keydown-LEFT", () => this.changeFrame(-1));
    this.input.keyboard?.on("keydown-RIGHT", () => this.changeFrame(1));
  }

  private cycleMode(): void {
    const currentIndex = this.MODES.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % this.MODES.length;
    this.currentMode = this.MODES[nextIndex];
    this.layeredSprite?.setAlignmentMode(this.currentMode);
    this.updateModeText();
  }

  private changeFrame(delta: number): void {
    if (!this.layeredSprite) return;
    const bodyMeta = this.cache.json.get("dnf_swordman_stay_meta");
    const maxFrames = bodyMeta.frames.length;
    const currentFrame = (this.layeredSprite as any).currentFrame ?? 0;
    const newFrame = (currentFrame + delta + maxFrames) % maxFrames;
    this.layeredSprite.setFrame(newFrame);
    this.updateModeText();
  }

  private updateModeText(): void {
    const currentFrame = (this.layeredSprite as any)?.currentFrame ?? 0;
    const modeNames: Record<AlignmentMode, string> = {
      mode1_imganchor_as_offset: "Mode 1: imgAnchor as direct offset",
      mode2_500x500_canvas: "Mode 2: 500×500 virtual canvas",
      mode3_relative_to_body: "Mode 3: Relative to body imgAnchor",
      mode4_ignore_imganchor: "Mode 4: Ignore imgAnchor (all same pos)",
      mode5_negated_imganchor: "Mode 5: Negated imgAnchor",
    };
    this.modeText?.setText(`${modeNames[this.currentMode]} | Frame: ${currentFrame}`);
  }
}
