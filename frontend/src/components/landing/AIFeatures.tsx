import React from 'react';
import { Camera, Eye, Cpu, Database, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AIFeatures: React.FC = () => {
  return (
    <section id="ai-features" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full">
            AI Technology Stack
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            InsightFace & MediaPipe Liveness Pipeline
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Biometric identification engineered specifically for hospital reception kiosks and emergency triage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-800/10 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Face Detection & Alignment</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              OpenCV & InsightFace detect facial landmarks, align eyes, and compensate for tilt or ambient lighting in hospital waiting rooms.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Multi-angle face normalization
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Auto-crop & thumbnail extraction
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-800/10 border border-indigo-200 dark:border-indigo-900/50 space-y-4 shadow-lg ring-1 ring-indigo-500/20">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">MediaPipe Liveness Check</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Prevents spoofing using printed photos or phone screens by checking micro-movements, eye blinks, and facial depth cues in real-time.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Anti-spoofing attack defense
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Real-time webcam feedback
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-800/10 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cosine Vector Matching</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates a 512-dimensional vector embedding and compares against stored patient database records using high-performance NumPy math.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Configurable threshold (default 0.5)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Instant fallback search (ID/QR)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
