import React, { useState, useEffect } from 'react';
import { Camera, Volume2, ShieldAlert, Cpu, Save } from 'lucide-react';

interface SettingsState {
  cameraSource: string;
  enableVoice: boolean;
  voiceSpeed: number;
  enableSfx: boolean;
  filterAlpha: number;
  drawSkeleton: boolean;
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    cameraSource: 'integrated',
    enableVoice: true,
    voiceSpeed: 1.0,
    enableSfx: true,
    filterAlpha: 0.5,
    drawSkeleton: true,
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('kinova_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
  }, []);

  const handleChange = (key: keyof SettingsState, value: string | boolean | number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kinova_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Platform Settings</h1>
        <p className="text-xs text-[var(--text-secondary)]">Adjust capture, kinematic feedback parameters, and preferences</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Camera Capture Hardware Settings */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 text-brand-500" />
              Camera Capture Hardware
            </h2>
            
            <div className="space-y-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[var(--text-primary)]">Default Video Source</label>
                <select 
                  value={settings.cameraSource} 
                  onChange={(e) => handleChange('cameraSource', e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500 w-full"
                >
                  <option value="integrated">Integrated Camera (Internal FaceTime HD)</option>
                  <option value="external">External USB Web Camera (HD Pro C920)</option>
                  <option value="virtual">OBS Virtual Camera Stream</option>
                </select>
                <span className="text-[10px] text-[var(--text-secondary)]">Select the camera used for tracking. Minimum suggested resolution: 720p at 30 FPS.</span>
              </div>
            </div>
          </div>

          {/* Voice Coaching and Audio Settings */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Volume2 className="h-4.5 w-4.5 text-brand-500" />
              Audio Coaching Cues (TTS)
            </h2>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="font-bold text-[var(--text-primary)]">Real-time Voice Feedback</label>
                  <p className="text-[10px] text-[var(--text-secondary)] max-w-sm">Use browser Web Speech synthesizers to read form corrections out loud during sets.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.enableVoice} 
                  onChange={(e) => handleChange('enableVoice', e.target.checked)}
                  className="w-4 h-4 text-brand-600 border-[var(--border-color)] rounded-md focus:ring-brand-500 cursor-pointer"
                />
              </div>

              {settings.enableVoice && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-color)]">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-[var(--text-primary)]">Voice Speed Rate</label>
                    <span className="text-[11px] font-bold text-brand-600 dark:text-brand-300">{settings.voiceSpeed}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={settings.voiceSpeed}
                    onChange={(e) => handleChange('voiceSpeed', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                <div className="space-y-0.5">
                  <label className="font-bold text-[var(--text-primary)]">Rep Success Audio Effects (SFX)</label>
                  <p className="text-[10px] text-[var(--text-secondary)]">Play a positive high tone sound effect when a correct rep is logged.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.enableSfx} 
                  onChange={(e) => handleChange('enableSfx', e.target.checked)}
                  className="w-4 h-4 text-brand-600 border-[var(--border-color)] rounded-md focus:ring-brand-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Kinematic Filtering Parameters */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-brand-500" />
              Kinematic Filtering & Algorithms
            </h2>
            
            <div className="space-y-4 text-xs">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-[var(--text-primary)]">Coordinate Smoother Coefficient (Damping Alpha)</label>
                  <span className="text-[11px] font-bold text-brand-600 dark:text-brand-300">{settings.filterAlpha}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.9" 
                  step="0.05" 
                  value={settings.filterAlpha}
                  onChange={(e) => handleChange('filterAlpha', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <span className="text-[10px] text-[var(--text-secondary)]">Low values mean smoother skeleton tracking but introduce higher latency. High values are faster but susceptible to webcam jitter. (Default: 0.5)</span>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                <div className="space-y-0.5">
                  <label className="font-bold text-[var(--text-primary)]">Draw Kinematic Joint Skeleton Overlay</label>
                  <p className="text-[10px] text-[var(--text-secondary)]">Show the green/orange skeleton stick lines overlaid on top of the webcam viewport.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.drawSkeleton} 
                  onChange={(e) => handleChange('drawSkeleton', e.target.checked)}
                  className="w-4 h-4 text-brand-600 border-[var(--border-color)] rounded-md focus:ring-brand-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel Column */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Settings actions</h3>
            
            <button 
              type="submit"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Save Configuration Settings
            </button>

            {isSaved && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center animate-pulse">
                Configuration Saved Successfully!
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5 text-amber-500">
              <ShieldAlert className="h-4 w-4" />
              Compliance Note
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-semibold">
              These settings reside strictly inside this client's web browser local memory (`localStorage`). No system parameter files are sent to remote databases, safeguarding private configurations in accordance with HIPAA standards.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
