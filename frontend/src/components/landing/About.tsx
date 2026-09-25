import React from 'react';
import { ShieldCheck, Cpu, UserCheck, HeartPulse } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-semibold px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full">
              About IntelliMed
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Transforming Healthcare Operations with Artificial Intelligence
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Traditional hospital check-in processes suffer from long queues, misidentified patient records, and delayed emergency response. IntelliMed bridges physical arrival with instant digital health records through biometrics and secure workflow automation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Cpu className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">AI Biometric Core</h4>
                  <p className="text-xs text-slate-500 mt-0.5">InsightFace embeddings + MediaPipe liveness detection.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Enterprise Security</h4>
                  <p className="text-xs text-slate-500 mt-0.5">JWT, bcrypt, session control & audit trails.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <UserCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">7 Role Portals</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Customized dashboards for doctors, receptionists, labs, etc.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <HeartPulse className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">360° EMR Records</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Vitals, diagnosis, pharmacy, and billing in one timeline.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-video rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-1 shadow-2xl">
              <div className="w-full h-full bg-slate-950 rounded-xl p-6 flex flex-col justify-between text-white overflow-hidden relative">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs font-mono text-slate-400 ml-2">IntelliMed AI Face Scanner</span>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">MATCH FOUND (99.8%)</span>
                </div>

                <div className="my-6 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400">Patient ID</p>
                    <p className="font-bold text-sky-400">IM-000104</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400">Blood Group</p>
                    <p className="font-bold text-red-400">O +ve</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-400">Allergies</p>
                    <p className="font-bold text-amber-400">Penicillin</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Assigned Doctor: Dr. Sarah Jenkins</span>
                  <span>Visit: Today, 10:30 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
