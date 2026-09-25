import React from 'react';
import { Award } from 'lucide-react';
import { Avatar } from '../common/Avatar';

export const Doctors: React.FC = () => {
  const doctorsList = [
    {
      name: "Dr. Sarah Jenkins",
      spec: "Chief of Cardiology",
      qual: "MD, FACC - 14 Yrs Exp",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Dr. Marcus Vance",
      spec: "Senior Neurologist",
      qual: "MD, DM (Neuro) - 12 Yrs Exp",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Dr. Elena Rostova",
      spec: "Pediatric Specialist",
      qual: "MD (Peds) - 9 Yrs Exp",
      image: "https://images.unsplash.com/photo-1594824813566-88855ce7890b?q=80&w=300&auto=format&fit=crop"
    },
    {
      name: "Dr. Rajesh Sharma",
      spec: "Orthopedic Surgeon",
      qual: "MS (Ortho) - 16 Yrs Exp",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop"
    }
  ];

  return (
    <section id="doctors" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full">
            Expert Staff
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            Our Senior Medical Specialists
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctorsList.map((doc, idx) => (
            <div key={idx} className="glass-card glass-card-hover rounded-xl overflow-hidden text-center p-6 space-y-4">
              <Avatar
                name={doc.name}
                imageUrl={doc.image}
                size="lg"
                className="mx-auto border-4 border-sky-100 dark:border-sky-950"
              />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{doc.name}</h3>
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">{doc.spec}</p>
                <p className="text-xs text-slate-500 mt-1">{doc.qual}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Verified License & Specialist</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
