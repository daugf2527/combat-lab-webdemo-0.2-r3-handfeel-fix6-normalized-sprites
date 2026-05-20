/**
 * DnfLayeredSprite - Multi-layer sprite rendering for DNF characters
 *
 * Renders body + equipment layers (coat, hair, pants, shoes, weapon) with proper alignment.
 * Supports multiple alignment modes for debugging/testing.
 */

import Phaser from "phaser";

export type AlignmentMode =
  | "mode1_imganchor_as_offset"      // imgAnchor as direct offset from feet
  | "mode2_500x500_canvas"           // imgAnchor in 500×500 virtual canvas
  | "mode3_relative_to_body"         // Equipment relative to body's imgAnchor
  | "mode4_ignore_imganchor"         // All layers at same position (aniOffset only)
  | "mode5_negated_imganchor";       // Negated imgAnchor values

interface LayerFrameMeta {
  width: number;
  height: number;
  imgAnchor: { x: number; y: number };
  maxWidth?: number;
  maxHeight?: number;
}

interface BodyFrameMeta extends LayerFrameMeta {
  aniOffset: { x: number; y: number };
}

export class DnfLayeredSprite extends Phaser.GameObjects.Container {
  private bodySprite: Phaser.GameObjects.Image;
  private layerSprites: Map<string, Phaser.GameObjects.Image> = new Map();

  private currentFrame: number = 0;
  private alignmentMode: AlignmentMode = "mode2_500x500_canvas";

  // Layer rendering order (bottom to top in z, drawn back→front)
  // shoes/pants on top of body legs, coat on top of body torso, hair on top of body head
  private static readonly LAYER_ORDER = ["body", "shoes_a", "pants_a", "coat_a", "hair_a"];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private actionKey: string,
    private bodyMeta: { frames: BodyFrameMeta[] },
    private layerMetas: Map<string, { frames: LayerFrameMeta[] }>
  ) {
    super(scene, x, y);

    // Create body sprite
    this.bodySprite = scene.add.image(0, 0, `${actionKey}_00`);
    this.bodySprite.setOrigin(0, 0);
    this.add(this.bodySprite);

    // Create layer sprites
    for (const [layerName, meta] of layerMetas) {
      if (meta.frames[0]) {
        const sprite = scene.add.image(0, 0, `${actionKey}_${layerName}_00`);
        sprite.setOrigin(0, 0);
        this.layerSprites.set(layerName, sprite);
        this.add(sprite);
      }
    }

    // Sort children by layer order
    this.sortLayers();

    // Initial alignment
    this.updateAlignment();

    scene.add.existing(this);
  }

  private sortLayers(): void {
    this.list.sort((a, b) => {
      const aName = a === this.bodySprite ? "body" :
        Array.from(this.layerSprites.entries()).find(([_, s]) => s === a)?.[0] ?? "";
      const bName = b === this.bodySprite ? "body" :
        Array.from(this.layerSprites.entries()).find(([_, s]) => s === b)?.[0] ?? "";

      const aIndex = DnfLayeredSprite.LAYER_ORDER.indexOf(aName);
      const bIndex = DnfLayeredSprite.LAYER_ORDER.indexOf(bName);

      return aIndex - bIndex;
    });
  }

  public setAlignmentMode(mode: AlignmentMode): void {
    this.alignmentMode = mode;
    this.updateAlignment();
  }

  public setFrame(frameIndex: number): void {
    this.currentFrame = frameIndex;

    // Update body texture
    const bodyKey = `${this.actionKey}_${String(frameIndex).padStart(2, "0")}`;
    if (this.scene.textures.exists(bodyKey)) {
      this.bodySprite.setTexture(bodyKey);
    }

    // Update layer textures
    for (const [layerName, sprite] of this.layerSprites) {
      const layerKey = `${this.actionKey}_${layerName}_${String(frameIndex).padStart(2, "0")}`;
      if (this.scene.textures.exists(layerKey)) {
        sprite.setTexture(layerKey);
      }
    }

    this.updateAlignment();
  }

  private updateAlignment(): void {
    const bodyFrame = this.bodyMeta.frames[this.currentFrame];
    if (!bodyFrame) return;

    const aniOffset = bodyFrame.aniOffset;

    switch (this.alignmentMode) {
      case "mode1_imganchor_as_offset":
        this.alignMode1(bodyFrame, aniOffset);
        break;
      case "mode2_500x500_canvas":
        this.alignMode2(bodyFrame, aniOffset);
        break;
      case "mode3_relative_to_body":
        this.alignMode3(bodyFrame, aniOffset);
        break;
      case "mode4_ignore_imganchor":
        this.alignMode4(bodyFrame, aniOffset);
        break;
      case "mode5_negated_imganchor":
        this.alignMode5(bodyFrame, aniOffset);
        break;
    }
  }

  // Mode 1: imgAnchor as direct offset from feet
  private alignMode1(bodyFrame: BodyFrameMeta, aniOffset: { x: number; y: number }): void {
    this.bodySprite.setPosition(
      bodyFrame.imgAnchor.x,
      bodyFrame.imgAnchor.y
    );

    for (const [layerName, sprite] of this.layerSprites) {
      const layerMeta = this.layerMetas.get(layerName);
      const layerFrame = layerMeta?.frames[this.currentFrame];
      if (layerFrame) {
        sprite.setPosition(
          layerFrame.imgAnchor.x,
          layerFrame.imgAnchor.y
        );
      }
    }
  }

  // Mode 2: imgAnchor in 500×500 virtual canvas (feet at origin)
  private alignMode2(bodyFrame: BodyFrameMeta, aniOffset: { x: number; y: number }): void {
    const feetX = -aniOffset.x;
    const feetY = -aniOffset.y;

    this.bodySprite.setPosition(
      bodyFrame.imgAnchor.x - feetX,
      bodyFrame.imgAnchor.y - feetY
    );

    for (const [layerName, sprite] of this.layerSprites) {
      const layerMeta = this.layerMetas.get(layerName);
      const layerFrame = layerMeta?.frames[this.currentFrame];
      if (layerFrame) {
        sprite.setPosition(
          layerFrame.imgAnchor.x - feetX,
          layerFrame.imgAnchor.y - feetY
        );
      }
    }
  }

  // Mode 3: Equipment relative to body's imgAnchor
  private alignMode3(bodyFrame: BodyFrameMeta, aniOffset: { x: number; y: number }): void {
    this.bodySprite.setPosition(0, 0);

    for (const [layerName, sprite] of this.layerSprites) {
      const layerMeta = this.layerMetas.get(layerName);
      const layerFrame = layerMeta?.frames[this.currentFrame];
      if (layerFrame) {
        sprite.setPosition(
          layerFrame.imgAnchor.x - bodyFrame.imgAnchor.x,
          layerFrame.imgAnchor.y - bodyFrame.imgAnchor.y
        );
      }
    }
  }

  // Mode 4: Ignore imgAnchor, all at same position
  private alignMode4(bodyFrame: BodyFrameMeta, aniOffset: { x: number; y: number }): void {
    this.bodySprite.setPosition(0, 0);

    for (const sprite of this.layerSprites.values()) {
      sprite.setPosition(0, 0);
    }
  }

  // Mode 5: Negated imgAnchor values
  private alignMode5(bodyFrame: BodyFrameMeta, aniOffset: { x: number; y: number }): void {
    this.bodySprite.setPosition(
      -bodyFrame.imgAnchor.x,
      -bodyFrame.imgAnchor.y
    );

    for (const [layerName, sprite] of this.layerSprites) {
      const layerMeta = this.layerMetas.get(layerName);
      const layerFrame = layerMeta?.frames[this.currentFrame];
      if (layerFrame) {
        sprite.setPosition(
          -layerFrame.imgAnchor.x,
          -layerFrame.imgAnchor.y
        );
      }
    }
  }
}
