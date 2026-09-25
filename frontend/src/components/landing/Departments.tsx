import React from 'react';
import { Heart, Brain, Stethoscope, Eye, Baby, Bone, Activity, Dumbbell } from 'lucide-react';

export const Departments: React.FC = () => {
  const depts = [
    { name: "Cardiology", icon: Heart, desc: "Comprehensive heart care, ECG analysis, and cardiac rehab.", doctors: "8 Specialists" },
    { name: "Neurology", icon: Brain, desc: "Brain, spine, and nervous system diagnosis and care.", doctors: "6 Specialists" },
    { name: "Orthopedics", icon: Bone, desc: "Joint replacement, fracture care, and sports medicine.", doctors: "7 Specialists" },
    { name: "Pediatrics", icon: Baby, desc: "Child wellness, neonatal ICU, and adolescent care.", doctors: "9 Specialists" },
    { name: "Ophthalmology", icon: Eye, desc: "Advanced laser eye surgery and vision care.", doctors: "4 Specialists" },
    { name: "General Medicine", icon: Stethoscope, desc: "Internal medicine, routine health checkups, and triage.", doctors: "12 Specialists" }
  ];

  return (
    <section id="departments" className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full">
            Clinical Excellence
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            Hospital Specializations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depts.map((d, idx) => (
            <div key={idx} className="glass-card glass-card-hover p-6 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <d.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                  {d.doctors}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{d.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
