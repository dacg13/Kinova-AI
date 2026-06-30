import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Info, Flame, Dumbbell, AlertTriangle, X } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  targetJoint: string;
  targetAngle: string;
  reps: string;
  difficulty: string;
  calories: number;
  muscles: string[];
  assigned: boolean;
  mistakes: string[];
  instructions: string[];
}

export const ExerciseLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const exercises: Exercise[] = [
    {
      id: 'squat',
      name: 'Squat Stability',
      category: 'Knee & Hip',
      targetJoint: 'Knee',
      targetAngle: '90° Flexion',
      reps: '15 Reps x 3 Sets',
      difficulty: 'Moderate',
      calories: 85,
      muscles: ['Quadriceps', 'Gluteus Maximus', 'Hamstrings'],
      assigned: true,
      mistakes: ['Knee Valgus (knees collapsing inward)', 'Torso Lean (leaning forward excessively)', 'Heel Lift (heels lifting off floor)'],
      instructions: [
        'Stand with feet shoulder-width apart, toes pointing slightly outward.',
        'Slowly descend by bending your hips and knees, keeping your chest upright.',
        'Push your knees outward over your toes, keeping your heels flat.',
        'Descend until knees reach a 90° angle, hold for 1 second, then push back up.'
      ]
    },
    {
      id: 'shoulder_raise',
      name: 'Shoulder Abduction',
      category: 'Shoulder',
      targetJoint: 'Shoulder',
      targetAngle: '130° Elevation',
      reps: '12 Reps x 3 Sets',
      difficulty: 'Easy',
      calories: 55,
      muscles: ['Lateral Deltoid', 'Supraspinatus', 'Trapezius'],
      assigned: true,
      mistakes: ['Shoulder Imbalance (shrugging upper traps)', 'Trunk Lean (leaning sideways to compensate)'],
      instructions: [
        'Stand with arms at your side, palms facing inward.',
        'Keep your elbow straight and slowly raise your arm sideways up toward the ceiling.',
        'Avoid shrugging your shoulders or leaning your body sideways.',
        'Hold at peak elevation for 1 second, then slowly return to start.'
      ]
    },
    {
      id: 'sit_to_stand',
      name: 'Sit-To-Stand Pacing',
      category: 'Stroke & Senior',
      targetJoint: 'Hip & Knee',
      targetAngle: '180° Extension',
      reps: '10 Reps x 2 Sets',
      difficulty: 'Easy',
      calories: 45,
      muscles: ['Gluteus Maximus', 'Quadriceps', 'Rectus Abdominis'],
      assigned: true,
      mistakes: ['Incorrect Pacing (standing up too fast/jerking)', 'Asymmetry (pushing off one side only)'],
      instructions: [
        'Sit on a standard firm chair, feet flat on the floor.',
        'Lean slightly forward from your hips, keep your spine aligned.',
        'Push down through your heels and stand up slowly to full extension.',
        'Slowly sit back down under control over 3-4 seconds.'
      ]
    },
    {
      id: 'ankle_flexion',
      name: 'Ankle Dorsiflexion',
      category: 'Ankle',
      targetJoint: 'Ankle',
      targetAngle: '20° Dorsiflexion',
      reps: '20 Reps x 2 Sets',
      difficulty: 'Easy',
      calories: 25,
      muscles: ['Tibialis Anterior'],
      assigned: false,
      mistakes: ['Inversion (turning foot inward)', 'Jerkiness'],
      instructions: [
        'Sit with legs extended, or sit on a chair with feet flat.',
        'Keep your heel on the floor, pull your toes up toward your shin.',
        'Hold at maximum flexion for 2 seconds, then slowly lower foot.'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Routines' },
    { id: 'Knee & Hip', label: 'Knee & Hip' },
    { id: 'Shoulder', label: 'Shoulder' },
    { id: 'Stroke & Senior', label: 'Stroke & Senior' },
    { id: 'Ankle', label: 'Ankle' }
  ];

  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || ex.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || ex.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartWorkout = (id: string) => {
    localStorage.setItem('kinova_active_exercise', id);
    navigate('/patient/workout');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Clinical Exercise Library</h1>
          <p className="text-xs text-[var(--text-secondary)]">Search, filter, and review details of assigned routines.</p>
        </div>
      </div>

      {/* Search & Filter Bar Bar */}
      <div className="sticky top-16 z-20 bg-[var(--bg-primary)]/90 backdrop-blur-md py-3 -mx-4 px-4 md:mx-0 md:px-0 border-b border-[var(--border-color)] md:border-none flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            placeholder="Search exercises by name, body part, or joint..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex overflow-x-auto gap-2 scrollbar-none snap-x snap-mandatory py-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 snap-center ${
                activeCategory === cat.id 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/10' 
                  : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ex) => (
          <div key={ex.id} className="glass-card rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between h-auto min-h-[220px]">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-widest block">{ex.category}</span>
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)] pt-0.5">{ex.name}</h3>
                </div>
                {ex.assigned && (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-350 font-black uppercase tracking-wider">
                    Assigned
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 pt-3 text-[10px] font-semibold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1"><Dumbbell className="h-3.5 w-3.5 text-brand-500" /> {ex.targetJoint}</span>
                <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-500" /> {ex.calories} kcal</span>
              </div>
              <div className="text-[10px] text-brand-500 font-bold pt-2">{ex.targetAngle}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-[var(--border-color)] mt-4">
              <button 
                onClick={() => setSelectedEx(ex)}
                className="w-full sm:flex-grow py-2 border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs rounded-xl hover:bg-slate-500/5 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Info className="h-4 w-4" />
                Details
              </button>
              <button 
                onClick={() => handleStartWorkout(ex.id)}
                className="w-full sm:flex-grow py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-brand-500/10"
              >
                <Play className="h-4 w-4 fill-current" />
                Start
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Dialog Modal */}
      <AnimatePresence>
        {selectedEx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 relative shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedEx(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-500/5 transition-colors text-[var(--text-secondary)] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-brand-500 tracking-widest">{selectedEx.category} Protocol</span>
                <h2 className="text-base font-black text-[var(--text-primary)]">{selectedEx.name}</h2>
              </div>

              {/* Targets Summary */}
              <div className="grid grid-cols-3 gap-3 text-center border-y border-[var(--border-color)] py-3 text-xs">
                <div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Joint Target</div>
                  <div className="font-extrabold text-[var(--text-primary)] pt-1">{selectedEx.targetJoint}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Target ROM</div>
                  <div className="font-extrabold text-brand-500 pt-1">{selectedEx.targetAngle}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Assigned Reps</div>
                  <div className="font-extrabold text-[var(--text-primary)] pt-1">{selectedEx.reps}</div>
                </div>
              </div>

              {/* Muscles Group */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-extrabold text-[var(--text-primary)]">Target Muscle Group:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEx.muscles.map((mus) => (
                    <span key={mus} className="px-2.5 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] font-semibold text-[10px]">
                      {mus}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-extrabold text-[var(--text-primary)]">Step-By-Step Guide:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[var(--text-secondary)] font-semibold leading-relaxed">
                  {selectedEx.instructions.map((ins, idx) => (
                    <li key={idx} className="pl-1">{ins}</li>
                  ))}
                </ol>
              </div>

              {/* Common Mistakes */}
              <div className="space-y-1.5 text-xs bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                <h4 className="font-extrabold text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Common Compensation Mistakes:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)] font-semibold pl-1">
                  {selectedEx.mistakes.map((mis, idx) => (
                    <li key={idx}>{mis}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setSelectedEx(null)}
                  className="flex-grow py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs hover:bg-slate-500/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setSelectedEx(null);
                    handleStartWorkout(selectedEx.id);
                  }}
                  className="flex-grow py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs transition-colors shadow-lg shadow-brand-500/10 cursor-pointer"
                >
                  Initiate Active Session
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
