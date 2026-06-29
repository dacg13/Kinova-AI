import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { Landmark, PoseResults, Pose } from '@/types/mediapipe';

interface PoseContextType {
  landmarks: Landmark[] | null;
  fps: number;
  latency: number;
  isModelLoaded: boolean;
  debugMode: boolean;
  toggleDebugMode: () => void;
  setVideoElement: (video: HTMLVideoElement | null) => void;
  setStreamActive: (active: boolean) => void;
}

const PoseContext = createContext<PoseContextType | undefined>(undefined);

export const PoseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [fps, setFps] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);

  const poseRef = useRef<Pose | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const lastFramePumpTimeRef = useRef<number>(0);
  const processingRef = useRef<boolean>(false);

  // Toggle visual overlays for joint names and debug telemetry window
  const toggleDebugMode = useCallback(() => {
    setDebugMode((prev) => !prev);
  }, []);

  const setVideoElement = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
  }, []);

  const setStreamActive = useCallback((active: boolean) => {
    setIsStreamActive(active);
  }, []);

  // Initialize MediaPipe Pose Client
  useEffect(() => {
    if (!window.Pose) {
      console.error('MediaPipe Pose script is not loaded in window scope.');
      return;
    }

    try {
      const poseInstance = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseInstance.onResults((results: PoseResults) => {
        processingRef.current = false;
        if (results.poseLandmarks) {
          setLandmarks(results.poseLandmarks);
        }

        // Calculate detection latency
        const now = performance.now();
        if (lastFrameTimeRef.current > 0) {
          const delta = now - lastFrameTimeRef.current;
          const currentFps = 1000 / delta;
          // Exponential moving average filter for FPS
          setFps((prev) => Math.round(prev * 0.85 + currentFps * 0.15));
        }
        lastFrameTimeRef.current = now;
      });

      poseRef.current = poseInstance;
      setIsModelLoaded(true);
    } catch (err) {
      console.error('Failed to initialize MediaPipe Pose Engine:', err);
    }

    return () => {
      if (poseRef.current) {
        poseRef.current.close().catch((err: any) => console.warn('Error closing Pose instance:', err));
      }
    };
  }, []);

  // Frame processing loop trigger
  useEffect(() => {
    const processFrame = async () => {
      if (!isStreamActive || !videoRef.current || !poseRef.current || !isModelLoaded) {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        processingRef.current = false;
        return;
      }

      const video = videoRef.current;
      const now = performance.now();
      const elapsed = now - lastFramePumpTimeRef.current;

      // readyState 2 (HAVE_CURRENT_DATA) or higher means video frame is ready to process
      // Limit to 30 FPS to match camera constraints and conserve client CPU
      if (video.readyState >= 2 && !processingRef.current && elapsed >= 33) {
        processingRef.current = true;
        lastFramePumpTimeRef.current = now;
        const t0 = performance.now();
        try {
          await poseRef.current.send({ image: video });
          const t1 = performance.now();
          setLatency(Math.round(t1 - t0));
        } catch (err) {
          console.error('Error pumping frame to MediaPipe:', err);
          processingRef.current = false;
        }
      }

      if (isStreamActive) {
        animationFrameIdRef.current = requestAnimationFrame(processFrame);
      }
    };

    if (isStreamActive && isModelLoaded) {
      lastFrameTimeRef.current = 0;
      animationFrameIdRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isStreamActive, isModelLoaded]);

  return (
    <PoseContext.Provider
      value={{
        landmarks,
        fps,
        latency,
        isModelLoaded,
        debugMode,
        toggleDebugMode,
        setVideoElement,
        setStreamActive,
      }}
    >
      {children}
    </PoseContext.Provider>
  );
};

export const usePose = () => {
  const context = useContext(PoseContext);
  if (!context) {
    throw new Error('usePose must be used within a PoseProvider');
  }
  return context;
};
