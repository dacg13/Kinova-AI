export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResults {
  poseLandmarks?: Landmark[];
  pose3dLandmarks?: Landmark[];
  image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;
}

export interface PoseConfig {
  locateFile: (file: string) => string;
}

export interface PoseOptions {
  modelComplexity?: 0 | 1 | 2;
  smoothLandmarks?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  enableSegmentation?: boolean;
  smoothSegmentation?: boolean;
}

export declare class Pose {
  constructor(config: PoseConfig);
  setOptions(options: PoseOptions): void;
  onResults(callback: (results: PoseResults) => void): void;
  send(input: { image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement }): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    Pose: typeof Pose;
  }
}
