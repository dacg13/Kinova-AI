import React, { useState } from 'react';
import { Plus, Save, BookOpen, Trash2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface ProtocolItem {
  id: string;
  name: string;
  reps: number;
  sets: number;
  romTarget: number;
  pacing: number;
}

export const ProtocolBuilder: React.FC = () => {
  const { showNotification } = useNotifications();
  const selectedPatient = 'Dhruv Patel';
  const [items, setItems] = useState<ProtocolItem[]>([
    { id: '1', name: 'Squat Stability', reps: 15, sets: 3, romTarget: 90, pacing: 4.0 },
    { id: '2', name: 'Shoulder Abduction', reps: 12, sets: 3, romTarget: 130, pacing: 3.5 }
  ]);

  const [newName, setNewName] = useState('Squat Stability');
  const [newReps, setNewReps] = useState(15);
  const [newSets, setNewSets] = useState(3);
  const [newRom, setNewRom] = useState(90);
  const [newPacing, setNewPacing] = useState(4.0);

  const handleAddItem = () => {
    const item: ProtocolItem = {
      id: Date.now().toString(),
      name: newName,
      reps: newReps,
      sets: newSets,
      romTarget: newRom,
      pacing: newPacing
    };
    setItems((prev) => [...prev, item]);
    showNotification(`Added ${newName} prescription card to draft.`, 'info');
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    // Write target to local storage so rehabEngine evaluates against this custom ROM!
    items.forEach((item) => {
      if (item.name.toLowerCase().includes('squat')) {
        localStorage.setItem('kinova_target_squat_angle', item.romTarget.toString());
      } else if (item.name.toLowerCase().includes('shoulder')) {
        localStorage.setItem('kinova_target_shoulder_angle', item.romTarget.toString());
      }
    });

    showNotification(`Rehabilitation Protocol successfully assigned to ${selectedPatient}!`, 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[calc(100vh-140px)] pb-12 lg:pb-0">
      
      {/* Editor Panel */}
      <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)] space-y-4 lg:col-span-1 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4 text-xs font-semibold leading-normal">
          <div className="space-y-1">
            <h3 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-extrabold flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-brand-500" />
              Add Routine Card
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)]">Create customized joint targets and set constraints.</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Select Active Routine</label>
            <select 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
            >
              <option value="Squat Stability">Squat Stability</option>
              <option value="Shoulder Abduction">Shoulder Abduction</option>
              <option value="Sit-To-Stand Pacing">Sit-To-Stand Pacing</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Sets</label>
              <input 
                type="number" 
                value={newSets}
                onChange={(e) => setNewSets(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Reps</label>
              <input 
                type="number" 
                value={newReps}
                onChange={(e) => setNewReps(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Target Joint ROM Angle (Degrees)</label>
            <input 
              type="number" 
              value={newRom}
              onChange={(e) => setNewRom(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Minimum Pace Pacing (Seconds)</label>
            <input 
              type="number" 
              step="0.5"
              value={newPacing}
              onChange={(e) => setNewPacing(parseFloat(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
            />
          </div>

          <button 
            onClick={handleAddItem}
            className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="h-4 w-4" />
            Append Routine Card
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-[var(--border-color)] text-[10px] leading-relaxed text-[var(--text-secondary)] font-semibold flex gap-2">
          <BookOpen className="h-4 w-4 text-brand-500 shrink-0" />
          <span>Setting angles writes directly to local configuration caches. The patient pose client will read these targets live.</span>
        </div>
      </div>

      {/* Roster & Assigned Routine lists */}
      <div className="lg:col-span-2 glass-card rounded-2xl border border-[var(--border-color)] flex flex-col overflow-hidden h-full">
        {/* Header Header */}
        <div className="px-5 py-4 border-b border-[var(--border-color)] flex flex-wrap justify-between items-center gap-3 bg-slate-900/10">
          <div>
            <h3 className="font-extrabold text-xs text-[var(--text-primary)]">Rehabilitation Protocol Prescription</h3>
            <span className="text-[9px] text-[var(--text-secondary)] font-semibold block pt-0.5">Assigned Target: {selectedPatient}</span>
          </div>

          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-500/10"
          >
            <Save className="h-4 w-4" />
            Publish Protocol
          </button>
        </div>

        {/* Assigned list */}
        <div className="flex-grow p-5 overflow-y-auto space-y-3.5">
          {items.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-secondary)] font-bold">No routines assigned to this protocol draft.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center text-xs font-semibold text-[var(--text-primary)]">
                <div>
                  <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{item.name}</h4>
                  <div className="flex flex-wrap gap-4 pt-2 text-[10px] text-[var(--text-secondary)] font-semibold">
                    <span>Sets: **{item.sets}**</span>
                    <span>Reps: **{item.reps}**</span>
                    <span>Target Angle: <strong className="text-brand-500">{item.romTarget}°</strong></span>
                    <span>Pacing: **{item.pacing}s**</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors cursor-pointer"
                  aria-label="Delete routine"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
