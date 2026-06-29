import { useState, useEffect, useCallback, useRef } from 'react';

export interface CameraConstraints {
  width: number;
  height: number;
  frameRate: number;
}

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);

  const streamRef = useRef<MediaStream | null>(null);

  // Enumerate active video capture devices
  const enumerateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((device) => device.kind === 'videoinput');
      setDevices(videoDevices);
      return videoDevices;
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Could not enumerate video input devices.');
      return [];
    }
  }, []);

  // Stop active camera tracks
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // Request browser video stream
  const startCamera = useCallback(async (deviceId?: string, customConstraints?: Partial<CameraConstraints>) => {
    setIsLoading(true);
    setError(null);
    stopCamera();

    const targetDeviceId = deviceId || activeDeviceId;

    // Standard video constraints with fallback optimization resolutions
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        deviceId: targetDeviceId ? { exact: targetDeviceId } : undefined,
        width: { ideal: customConstraints?.width || 640 },
        height: { ideal: customConstraints?.height || 480 },
        frameRate: { ideal: customConstraints?.frameRate || 30 },
      },
    };

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        if (err.name === 'OverconstrainedError') {
          console.warn('OverconstrainedError encountered, retrying with relaxed camera constraints');
          const fallbackConstraints: MediaStreamConstraints = {
            audio: false,
            video: targetDeviceId ? { deviceId: targetDeviceId } : true,
          };
          mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        } else {
          throw err;
        }
      }
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionStatus('granted');
      
      // Update active device details
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.deviceId) {
          setActiveDeviceId(settings.deviceId);
        }
      }

      // Re-enumerate devices after permissions are granted (allows reading labels)
      await enumerateDevices();
    } catch (err: any) {
      console.error('Error starting camera stream:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setError('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera hardware found on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is in use by another application. Please close other software and retry.');
      } else {
        setError(`Failed to open camera: ${err.message || 'Unknown error'}`);
      }
      setStream(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeDeviceId, stopCamera, enumerateDevices]);

  // Handle switching video sources
  const switchCamera = useCallback((deviceId: string) => {
    setActiveDeviceId(deviceId);
    if (streamRef.current) {
      startCamera(deviceId);
    }
  }, [startCamera]);

  // Toggle local rendering mirror alignment
  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);

  // Poll current permission state if query API is supported
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'camera' as any })
        .then((permissionObj) => {
          const handlePermissionChange = () => {
            if (permissionObj.state === 'granted') {
              setPermissionStatus('granted');
              enumerateDevices();
            } else if (permissionObj.state === 'denied') {
              setPermissionStatus('denied');
              stopCamera();
            } else {
              setPermissionStatus('prompt');
            }
          };

          permissionObj.onchange = handlePermissionChange;
          // Set initial permission state
          if (permissionObj.state === 'granted') {
            setPermissionStatus('granted');
            enumerateDevices();
          } else if (permissionObj.state === 'denied') {
            setPermissionStatus('denied');
          }
        })
        .catch((e) => {
          console.warn('Permissions query check unsupported:', e);
        });
    } else {
      // Fallback: just list available devices
      enumerateDevices();
    }
  }, [enumerateDevices, stopCamera]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    stream,
    devices,
    activeDeviceId,
    isLoading,
    error,
    permissionStatus,
    isMirrored,
    startCamera,
    stopCamera,
    switchCamera,
    toggleMirror,
    enumerateDevices,
  };
};
