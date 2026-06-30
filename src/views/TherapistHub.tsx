import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  AlertTriangle, 
  ChevronRight, 
  UserCheck, 
  ClipboardList,
  ArrowLeft,
  Save,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Dumbbell
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { useNotifications } from '@/context/NotificationContext';
import { CardSkeleton, ChartSkeleton, ListSkeleton } from '@/components/ui/Skeleton';

// Global mock patient datasets
interface PatientSession {
  sessionNum: string;
  date: string;
  exerciseName: string;
  reps: number;
  accuracy: number;
  rom: number;
  mistakes: number;
  durationSec: number;
}

interface PatientProfile {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  exercise: 'squat' | 'shoulder_raise' | 'sit_to_stand';
  defaultReps: number;
  defaultAngle: number;
  compliance: number;
  status: 'good' | 'warning' | 'critical';
  lastSession: string;
  trend: 'improving' | 'stable' | 'declining';
  mistakeCounts: { name: string; count: number }[];
  sessions: PatientSession[];
}

const initialPatients: PatientProfile[] = [
  {
    id: 'p-1',
    name: 'Sarah Jenkins',
    age: 42,
    diagnosis: 'Left Shoulder Rotator Cuff Tear Recovery',
    exercise: 'shoulder_raise',
    defaultReps: 15,
    defaultAngle: 90,
    compliance: 94,
    status: 'good',
    lastSession: 'Today, 10:15 AM',
    trend: 'improving',
    mistakeCounts: [
      { name: 'Shoulder Imbalance', count: 4 },
      { name: 'Torso Lean', count: 2 },
      { name: 'Incorrect Tempo', count: 1 },
      { name: 'Knee Valgus', count: 0 },
      { name: 'Heel Lift', count: 0 },
      { name: 'Poor Depth', count: 0 }
    ],
    sessions: [
      { sessionNum: 'S1', date: 'June 10, 2026', exerciseName: 'Shoulder Abduction', reps: 15, accuracy: 70, rom: 78, mistakes: 4, durationSec: 45 },
      { sessionNum: 'S2', date: 'June 13, 2026', exerciseName: 'Shoulder Abduction', reps: 15, accuracy: 74, rom: 82, mistakes: 3, durationSec: 42 },
      { sessionNum: 'S3', date: 'June 17, 2026', exerciseName: 'Shoulder Abduction', reps: 15, accuracy: 80, rom: 85, mistakes: 2, durationSec: 48 },
      { sessionNum: 'S4', date: 'June 20, 2026', exerciseName: 'Shoulder Abduction', reps: 15, accuracy: 86, rom: 88, mistakes: 2, durationSec: 40 },
      { sessionNum: 'S5', date: 'June 24, 2026', exerciseName: 'Shoulder Abduction', reps: 15, accuracy: 92, rom: 90, mistakes: 1, durationSec: 44 },
      { sessionNum: 'S6', date: 'Today, 10:15 AM', exerciseName: 'Shoulder Abduction', reps: 15, accuracy: 95, rom: 92, mistakes: 0, durationSec: 41 }
    ]
  },
  {
    id: 'p-2',
    name: 'Liam Patel',
    age: 58,
    diagnosis: 'Right Total Knee Arthroplasty (Replacement)',
    exercise: 'squat',
    defaultReps: 10,
    defaultAngle: 100,
    compliance: 78,
    status: 'warning',
    lastSession: 'Yesterday, 3:45 PM',
    trend: 'stable',
    mistakeCounts: [
      { name: 'Poor Depth', count: 5 },
      { name: 'Knee Valgus', count: 3 },
      { name: 'Heel Lift', count: 2 },
      { name: 'Torso Lean', count: 1 },
      { name: 'Incorrect Tempo', count: 1 },
      { name: 'Shoulder Imbalance', count: 0 }
    ],
    sessions: [
      { sessionNum: 'S1', date: 'June 12, 2026', exerciseName: 'Squat Posture Drill', reps: 10, accuracy: 60, rom: 118, mistakes: 4, durationSec: 62 },
      { sessionNum: 'S2', date: 'June 15, 2026', exerciseName: 'Squat Posture Drill', reps: 10, accuracy: 68, rom: 112, mistakes: 3, durationSec: 58 },
      { sessionNum: 'S3', date: 'June 19, 2026', exerciseName: 'Squat Posture Drill', reps: 10, accuracy: 72, rom: 108, mistakes: 2, durationSec: 65 },
      { sessionNum: 'S4', date: 'June 22, 2026', exerciseName: 'Squat Posture Drill', reps: 10, accuracy: 76, rom: 105, mistakes: 2, durationSec: 55 },
      { sessionNum: 'S5', date: 'Yesterday, 3:45 PM', exerciseName: 'Squat Posture Drill', reps: 10, accuracy: 78, rom: 102, mistakes: 2, durationSec: 60 }
    ]
  },
  {
    id: 'p-3',
    name: 'Emily Vance',
    age: 31,
    diagnosis: 'Acromioclavicular (AC) Joint Sprain',
    exercise: 'shoulder_raise',
    defaultReps: 12,
    defaultAngle: 55,
    compliance: 52,
    status: 'critical',
    lastSession: 'June 25, 2026',
    trend: 'declining',
    mistakeCounts: [
      { name: 'Incorrect Tempo', count: 6 },
      { name: 'Shoulder Imbalance', count: 4 },
      { name: 'Torso Lean', count: 3 },
      { name: 'Knee Valgus', count: 0 },
      { name: 'Heel Lift', count: 0 },
      { name: 'Poor Depth', count: 0 }
    ],
    sessions: [
      { sessionNum: 'S1', date: 'June 15, 2026', exerciseName: 'Shoulder Abduction', reps: 12, accuracy: 50, rom: 42, mistakes: 5, durationSec: 25 },
      { sessionNum: 'S2', date: 'June 18, 2026', exerciseName: 'Shoulder Abduction', reps: 12, accuracy: 58, rom: 48, mistakes: 4, durationSec: 22 },
      { sessionNum: 'S3', date: 'June 21, 2026', exerciseName: 'Shoulder Abduction', reps: 12, accuracy: 55, rom: 46, mistakes: 4, durationSec: 24 },
      { sessionNum: 'S4', date: 'June 25, 2026', exerciseName: 'Shoulder Abduction', reps: 12, accuracy: 52, rom: 45, mistakes: 4, durationSec: 20 }
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
};

export const TherapistHub: React.FC = () => {
  const [patients, setPatients] = useState<PatientProfile[]>(() => {
    return initialPatients.map((p) => {
      const savedReps = localStorage.getItem(`prescription_${p.id}_reps`);
      const savedAngle = localStorage.getItem(`prescription_${p.id}_angle`);
      return {
        ...p,
        defaultReps: savedReps ? parseInt(savedReps) : p.defaultReps,
        defaultAngle: savedAngle ? parseInt(savedAngle) : p.defaultAngle,
      };
    });
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Prescription editing form states
  const [editReps, setEditReps] = useState(15);
  const [editAngle, setEditAngle] = useState(90);
  const [editExercise, setEditExercise] = useState<'squat' | 'shoulder_raise' | 'sit_to_stand'>('shoulder_raise');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { showNotification } = useNotifications();
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Simulate cohort fetching loading animations
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, [selectedPatientId]);

  // Initialize prescription editing values when patient details open
  useEffect(() => {
    if (selectedPatient) {
      setEditReps(selectedPatient.defaultReps);
      setEditAngle(selectedPatient.defaultAngle);
      setEditExercise(selectedPatient.exercise);
      setSaveSuccess(false);
    }
  }, [selectedPatientId, selectedPatient]);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
  };

  const handleBackToCohort = () => {
    setSelectedPatientId(null);
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedPatient) return;

    // Persist to local storage
    localStorage.setItem(`prescription_${selectedPatientId}_reps`, editReps.toString());
    localStorage.setItem(`prescription_${selectedPatientId}_angle`, editAngle.toString());
    localStorage.setItem(`prescription_${selectedPatientId}_exercise`, editExercise);

    // Update state variables
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatientId
          ? {
              ...p,
              defaultReps: editReps,
              defaultAngle: editAngle,
              exercise: editExercise,
            }
          : p
      )
    );

    setSaveSuccess(true);
    showNotification(`Saved prescription for ${selectedPatient.name}.`, 'success');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Filter roster by search input
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cohort summaries
  const meanCompliance = Math.round(
    patients.reduce((acc, curr) => acc + curr.compliance, 0) / patients.length
  );
  const criticalCasesCount = patients.filter((p) => p.status === 'critical').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="h-6 w-48 bg-slate-300 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-60 bg-slate-300 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ListSkeleton rows={3} />
          </div>
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* COHORT ROSTER VIEW */}
      {!selectedPatientId ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Clinician Monitoring Hub</h1>
              <p className="text-xs text-[var(--text-secondary)] font-semibold">Manage assigned patient cohorts and evaluate recovery trends</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients or diagnosis..." 
                  className="pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500 w-48 sm:w-60 transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Cohort Statistics Overview */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Active Cohort Size</span>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">{patients.length} Patients</h3>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Mean Compliance Rate</span>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">{meanCompliance}%</h3>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Attention Flags Active</span>
                <h3 className="text-2xl font-black text-amber-500">{criticalCasesCount} Critical Cases</h3>
              </div>
            </div>
          </motion.div>

          {/* Charts and Cohort Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Patient Roster */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h2 className="text-base font-bold text-[var(--text-primary)]">Patient Roster Registry</h2>
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-300 uppercase tracking-widest px-2 py-0.5 rounded bg-brand-500/10">
                  Dr. Robert Chen's Cohort
                </span>
              </div>

              <div className="divide-y divide-[var(--border-color)]">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => handleSelectPatient(p.id)}
                      className="py-4 first:pt-0 last:pb-0 group cursor-pointer hover:bg-slate-500/5 transition-colors rounded-xl px-2 -mx-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-brand-500 transition-colors">
                              {p.name}
                            </h3>
                            <span className="text-[10px] text-[var(--text-secondary)]">Age {p.age}</span>
                            <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded tracking-wider ${
                              p.status === 'good' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                              p.status === 'warning' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                              'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}>
                              {p.status}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] font-medium">
                            <span className="font-semibold text-[var(--text-primary)]">Diagnosis:</span> {p.diagnosis}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 font-bold">
                            <ClipboardList className="h-3.5 w-3.5 text-brand-500" />
                            {p.exercise === 'shoulder_raise' ? 'Shoulder Abduction' : p.exercise === 'squat' ? 'Squat' : 'Sit-to-Stand'} ({p.defaultReps} reps, {p.defaultAngle}° target)
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border-color)]">
                          <div className="text-right">
                            <span className="text-[10px] block text-[var(--text-secondary)] font-medium">Compliance</span>
                            <span className={`text-sm font-extrabold ${
                              p.status === 'good' ? 'text-emerald-500' :
                              p.status === 'warning' ? 'text-amber-500' :
                              'text-red-500'
                            }`}>{p.compliance}%</span>
                          </div>

                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] block text-[var(--text-secondary)] font-medium">Last Session</span>
                            <span className="text-xs font-semibold text-[var(--text-primary)]">{p.lastSession}</span>
                          </div>

                          <ChevronRight className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-brand-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-semibold text-[var(--text-secondary)] text-center py-6">No patient records match the search terms.</p>
                )}
              </div>
            </div>

            {/* Compliance Distribution Charts Panel */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-[var(--text-primary)]">Compliance Comparison</h2>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Patient compliance distribution profile (%)</p>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patients} layout="vertical" margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} stroke="var(--border-color)" />
                    <YAxis type="category" dataKey="name" tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderColor: 'var(--border-color)', 
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="compliance" radius={[0, 8, 8, 0]} barSize={12}>
                      {patients.map((entry, index) => {
                        let barColor = '#8b5cf6'; // default brand color
                        if (entry.status === 'warning') barColor = '#f59e0b';
                        if (entry.status === 'critical') barColor = '#ef4444';
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2 border-t border-[var(--border-color)]">
                <p className="flex gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-red-500 shrink-0 mt-0.5"></span>
                  <span>
                    <span className="font-bold text-[var(--text-primary)]">Critical Alert:</span> Emily Vance requires contact. Compliance has dropped below threshold levels (52%).
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        /* INDIVIDUAL PATIENT DETAILS VIEW */
        selectedPatient && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Navigation back and header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBackToCohort}
                  className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">{selectedPatient.name}</h1>
                  <p className="text-xs text-[var(--text-secondary)] font-semibold">Age {selectedPatient.age} | Dx: {selectedPatient.diagnosis}</p>
                </div>
              </div>
              <span className={`text-xs uppercase font-extrabold px-3 py-1 rounded-xl text-center self-start sm:self-center tracking-wider ${
                selectedPatient.status === 'good' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                selectedPatient.status === 'warning' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                Compliance status: {selectedPatient.status}
              </span>
            </div>

            {/* KPIs grid */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="glass-card rounded-2xl p-4 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block">Avg Recovery Score</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[var(--text-primary)]">
                    {Math.round(selectedPatient.sessions.reduce((acc, curr) => acc + curr.accuracy, 0) / selectedPatient.sessions.length)}%
                  </span>
                  <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block">Sessions Completed</span>
                <span className="text-2xl font-black text-[var(--text-primary)]">{selectedPatient.sessions.length} sessions</span>
              </div>

              <div className="glass-card rounded-2xl p-4 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block">Compliance Rate</span>
                <span className={`text-2xl font-black ${
                  selectedPatient.status === 'good' ? 'text-emerald-500' :
                  selectedPatient.status === 'warning' ? 'text-amber-500' : 'text-red-500'
                }`}>{selectedPatient.compliance}%</span>
              </div>

              <div className="glass-card rounded-2xl p-4 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block">Prescribed target</span>
                <span className="text-base font-black text-[var(--text-primary)] leading-tight block truncate pt-1">
                  {selectedPatient.defaultReps} reps @ {selectedPatient.defaultAngle}°
                </span>
              </div>
            </motion.div>

            {/* Charts Section */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Recovery Trend Line Chart */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Patient Recovery Trend</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Session-over-session scoring (%) & ROM accuracy profile</p>
                </div>
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedPatient.sessions} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                      <XAxis dataKey="sessionNum" tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} stroke="var(--border-color)" />
                      <YAxis domain={[0, 100]} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} stroke="var(--border-color)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-secondary)', 
                          borderColor: 'var(--border-color)', 
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          fontSize: '11px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                      <Line type="monotone" name="Recovery Rating" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 6 }} />
                      <Line type="monotone" name="Angle Peak ROM" dataKey="rom" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Biomechanical Mistake Profile Histogram */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Biomechanical Mistake Profile</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Cumulative occurrences of postural faults in previous sessions</p>
                </div>
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedPatient.mistakeCounts} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                      <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 8, fill: 'var(--text-secondary)' }} stroke="var(--border-color)" />
                      <YAxis allowDecimals={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} stroke="var(--border-color)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-secondary)', 
                          borderColor: 'var(--border-color)', 
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Bottom details: Session Log table & prescription editor */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Session History Table */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-500" />
                  Cohort Session History Logs
                </h3>

                <div className="overflow-x-auto">
                  {/* Desktop/Tablet Table Layout */}
                  <table className="w-full text-xs text-left border-collapse hidden md:table">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Exercise</th>
                        <th className="py-2.5 text-center">Reps</th>
                        <th className="py-2.5 text-center">Accuracy</th>
                        <th className="py-2.5 text-center">Peak ROM</th>
                        <th className="py-2.5 text-center">Faults</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] font-semibold">
                      {selectedPatient.sessions.map((session, idx) => (
                        <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3 text-[var(--text-primary)] font-bold">{session.date}</td>
                          <td className="py-3 text-[var(--text-secondary)]">{session.exerciseName}</td>
                          <td className="py-3 text-center text-[var(--text-primary)]">{session.reps}</td>
                          <td className="py-3 text-center text-emerald-500">{session.accuracy}%</td>
                          <td className="py-3 text-center text-[var(--text-primary)]">{session.rom}°</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                              session.mistakes === 0 
                                ? 'bg-emerald-500/10 text-emerald-600' 
                                : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {session.mistakes === 0 ? 'None' : `${session.mistakes} errors`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Cards Layout */}
                  <div className="space-y-3 block md:hidden">
                    {selectedPatient.sessions.map((session, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-3 text-xs font-semibold">
                        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
                          <span className="font-extrabold text-[var(--text-primary)]">{session.date}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                            session.mistakes === 0 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {session.mistakes === 0 ? 'Perfect' : `${session.mistakes} errors`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[8.5px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Exercise</span>
                            <span className="font-bold text-[var(--text-primary)] block mt-0.5">{session.exerciseName}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Reps Prescribed</span>
                            <span className="font-bold text-[var(--text-primary)] block mt-0.5">{session.reps} reps</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Form Accuracy</span>
                            <span className="font-bold text-emerald-500 block mt-0.5">{session.accuracy}%</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Peak ROM</span>
                            <span className="font-bold text-brand-500 block mt-0.5">{session.rom}°</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prescription Editor Form */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3 flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-brand-500" />
                  Prescription Editor
                </h3>

                <form onSubmit={handleSavePrescription} className="space-y-4 text-xs font-semibold leading-normal">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Target Exercise</label>
                    <select
                      value={editExercise}
                      onChange={(e) => setEditExercise(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="shoulder_raise">Shoulder Abduction (Shoulder Raise)</option>
                      <option value="squat">Squat Posture Drill</option>
                      <option value="sit_to_stand">Sit-to-Stand Drills</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Repetition Targets</label>
                    <input 
                      type="number"
                      min={5}
                      max={25}
                      value={editReps}
                      onChange={(e) => setEditReps(parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block font-bold">Peak Flexion/Abduction Target Angle (°)</label>
                    <input 
                      type="number"
                      min={45}
                      max={120}
                      value={editAngle}
                      onChange={(e) => setEditAngle(parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Prescription updated successfully!
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Save Active Prescription
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )
      )}
    </div>
  );
};
