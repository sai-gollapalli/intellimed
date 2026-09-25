import React from 'react';
import { Star, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: "Dr. Amanda Ross",
      role: "Chief Medical Officer",
      quote: "IntelliMed has cut down our patient check-in bottlenecks at emergency reception from 15 minutes to under 5 seconds. The face recognition match speed is unbelievable."
    },
    {
      name: "Robert Sterling",
      role: "Hospital Administrator",
      quote: "Managing 7 different role permissions securely was our biggest headache. IntelliMed solved RBAC, automated GST invoicing, and lab report delivery in a single platform."
    },
    {
      name: "Priya Sharma",
      role: "Lead Receptionist",
      quote: "The webcam face scanner automatically pulls up patient records as soon as they step to the desk. Patients are so impressed with the modern experience!"
    }
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full">
            Customer Feedback
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            Trusted by Modern Clinical Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, idx) => (
            <div key={idx} className="glass-card p-8 rounded-2xl relative space-y-4">
              <Quote className="w-8 h-8 text-sky-500/20 absolute top-6 right-6" />
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "{r.quote}"
              </p>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{r.name}</p>
                <p className="text-xs text-sky-600 dark:text-sky-400">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
