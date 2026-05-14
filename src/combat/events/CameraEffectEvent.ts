export interface CameraShakePayload {
  intensity: number;
  durationMs: number;
}

export interface CameraFlashPayload {
  color: number;
  alpha: number;
  durationMs: number;
}
