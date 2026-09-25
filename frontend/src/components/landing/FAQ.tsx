import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does AI face recognition work for patient identification?",
      a: "When a patient approaches reception, the webcam captures their face. IntelliMed runs MediaPipe liveness detection to prevent photo spoofing, extracts a 512-dimensional facial embedding via InsightFace, and compares it against stored DB vectors using cosine similarity. If matched, their medical record opens automatically."
    },
    {
      q: "What happens if a patient's face cannot be identified?",
      a: "IntelliMed provides instant fallback search options. Reception staff can instantly look up patients by Patient ID (e.g., IM-000104), QR Health Card code, registered phone number, or full name."
    },
    {
      q: "Is biometric face data securely stored?",
      a: "Yes. Biometric embeddings are stored locally as encrypted vector buffers in the PostgreSQL database. Raw facial images are stored locally in restricted upload directories."
    },
    {
      q: "What user roles are supported by IntelliMed?",
      a: "IntelliMed features 7 dedicated role portals: Super Admin, Hospital Admin, Receptionist, Doctor, Lab Technician, Pharmacist, and Patient."
    },
    {
      q: "How does automatic email notification work?",
      a: "The system integrates with Gmail SMTP to automatically trigger welcome emails, OTP verification codes, appointment confirmations, lab report PDFs, and digital invoice receipts."
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-slate-900 dark:text-white flex justify-between items-center text-sm sm:text-base hover:text-sky-600 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-sky-600 shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-800/50 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
