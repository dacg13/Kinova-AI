import React, { useRef, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';

interface CameraPreviewProps {
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  activeDeviceId: string;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied';
  isMirrored: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onSwitchCamera: (deviceId: string) => void;
  onToggleMirror: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  children?: React.ReactNode;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  stream,
  devices,
  activeDeviceId,
  isLoading,
  error,
  permissionStatus,
  isMirrored,
  onStartCamera,
  onStopCamera,
  onSwitchCamera,
  onToggleMirror,
  videoRef,
  children,
}) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeVideoRef = videoRef || localVideoRef;

  // Bind the active media stream to the video DOM element
  useEffect(() => {
    const videoElement = activeVideoRef.current;
    if (videoElement) {
      if (stream) {
        videoElement.srcObject = stream;
        videoElement.play().catch((err) => {
          console.warn('Auto-play blocked or aborted:', err);
        });
      } else {
        videoElement.srcObject = null;
      }
    }
  }, [stream, activeVideoRef]);

  const hasActiveStream = !!stream;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Viewport Frame */}
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-[var(--border-color)] flex items-center justify-center shadow-inner group">
        
        {/* HTML5 Video Element */}
        <video
          ref={activeVideoRef}
          playsInline
          autoPlay
          muted
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
          style={{
            transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        />

        {/* Dynamic Overlays: Custom Canvas or visual overlays passed from parent */}
        {hasActiveStream && !isLoading && !error && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {children}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm text-white gap-3 p-4">
            <RefreshCw className="h-8 w-8 text-brand-500 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Initializing Media Hardware...</span>
          </div>
        )}

        {/* Permission Blocked Overlay */}
        {permissionStatus === 'denied' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-center p-6 gap-3">
            <div className="p-3 rounded-full bg-red-500/10 text-red-500">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Camera Permissions Blocked</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kinova AI needs camera access to perform postural evaluations. Please unlock camera access in your address bar settings and click retry.
              </p>
            </div>
            <button
              onClick={onStartCamera}
              className="mt-2 px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors shadow-lg cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* General Hardware/Stream Error Overlay */}
        {error && permissionStatus !== 'denied' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-center p-6 gap-3">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 animate-pulse">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Camera Hardware Error</h4>
              <p className="text-xs text-red-400 font-semibold">{error}</p>
            </div>
            <button
              onClick={onStartCamera}
              className="mt-2 px-4 py-2 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors shadow-lg cursor-pointer"
            >
              Retry Initialization
            </button>
          </div>
        )}

        {/* Inactive Standby View */}
        {!hasActiveStream && !isLoading && !error && permissionStatus !== 'denied' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm text-center p-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-300">
              <Camera className="h-7 w-7" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h4 className="text-sm font-bold text-slate-200">Video Pipeline Idle</h4>
              <p className="text-xs text-slate-400">
                Webcam capture is paused. Activate the video pipeline below to start skeleton mapping calibration.
              </p>
            </div>
            <button
              onClick={onStartCamera}
              className="px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/10 cursor-pointer"
            >
              Initialize Camera
            </button>
          </div>
        )}
      </div>

      {/* Floating Operations Menu Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 glass-card rounded-2xl">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Active Device Dropdown */}
          <select
            disabled={devices.length === 0}
            value={activeDeviceId}
            onChange={(e) => onSwitchCamera(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 cursor-pointer shrink-0 max-w-[220px] truncate"
          >
            {devices.length === 0 ? (
              <option value="">No Camera Detected</option>
            ) : (
              devices.map((device, idx) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${idx + 1}`}
                </option>
              ))
            )}
          </select>

          {/* Mirror Flip Mode Toggler */}
          <button
            onClick={onToggleMirror}
            disabled={!hasActiveStream}
            className={`p-2 rounded-xl border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[var(--text-secondary)] disabled:opacity-50 cursor-pointer`}
            title="Toggle Mirror Alignment"
          >
            {isMirrored ? <Eye className="h-4.5 w-4.5" /> : <EyeOff className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Start / Stop Toggle Handler */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {hasActiveStream ? (
            <button
              onClick={onStopCamera}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
            >
              Pause Capture
            </button>
          ) : (
            <button
              onClick={onStartCamera}
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              Start Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
