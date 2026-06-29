# Kinova AI
> **Recover Smarter. Move Better.**

**Kinova AI** is a state-of-the-art **AI-Powered Rehabilitation Intelligence Platform** designed to modernize physical therapy. Using standard browser-based computer vision, real-time 3D pose estimation, and deterministic explainable AI, Kinova AI empowers patients to execute rehabilitation exercises safely at home while providing clinicians with rigorous, analytics-driven recovery insights.

---

## 🌟 Key Features

* **3D Kinematic Geometry Solver:** Computes precise joint flexions and extensions in real-time (Knee, Hip, Shoulder, Elbow, Ankle, Torso, and Neck) using WebRTC camera streams and 3D coordinates.
* **Clinical FSM Movement Tracker:** Tracks repetitions dynamically using finite state machines. Evaluates exercise posture for common faults such as *Knee Valgus*, *Heel Lift*, *Torso Forward Lean*, *Shoulder Imbalance*, and *Incorrect Pacing/Tempo*.
* **Real-time Vocal Coach Biofeedback:** Delivers verbal cues (Web Speech Synthesis) for posture adjustments, throttled to prevent audio clutter.
* **Recovery Scorer Analytics:** Computes deterministic metrics upon session completion (Form Accuracy, Consistency ratings, Peak Range of Motion) and produces clinical insight reports.
* **Clinician Therapist Hub:** Allows physical therapists to monitor patient compliance charts, review historical mistakes logs, and customize target parameters and range of motion prescriptions.
* **Privacy-First Client Processing:** Pose estimation and kinematic calculations occur entirely client-side in the browser.

---

## 🛠️ Local Development & Running

### Prerequisites
- Node.js (v18+)
- NPM

### Installation
```bash
# Clone the repository
cd rehab

# Install dependencies
npm install
```

### Run Dev Server
```bash
npm run dev
```

### Run Unit Tests
```bash
npx vitest run
```

### Compile Production Build
```bash
npm run build
```

---

## 📐 Architecture Overview
The platform uses:
1. **MediaPipe BlazePose (CDN):** Real-time 33 3D landmark extraction.
2. **React 19 & TypeScript:** Strict type-safe UI modules and components.
3. **Tailwind CSS v4:** Modern styles, loading skeletons, and ambient radial glow designs.
4. **Framer Motion:** Staggered card layouts and smooth route change transitions.
5. **Recharts:** Client compliance, mistake distribution, and recovery history visualization.
