import React from 'react';
import { Camera, QrCode, FileText, Pill, CreditCard, Bell, Shield, Activity, Users, Clock } from 'lucide-react';

export const Features: React.FC = () => {
  const featuresList = [
    {
      icon: Camera,
      title: "Face Identification",
      desc: "Instant patient lookup via webcam with live liveness verification and duplicate detection."
    },
    {
      icon: QrCode,
      title: "QR Digital Health Cards",
      desc: "Auto-generated QR code cards for instant scan check-in at reception or pharmacy kiosks."
    },
    {
      icon: FileText,
      title: "Automated PDF Reports",
      desc: "ReportLab engine builds branded prescriptions, lab reports, invoices, and medical summaries."
    },
    {
      icon: Pill,
      title: "Pharmacy & Allergy Alerts",
      desc: "Drug inventory tracking, batch expiry warnings, and patient allergy cross-check alerts."
    },
    {
      icon: CreditCard,
      title: "GST Billing & Insurance",
      desc: "Itemized billing, 18% GST calculation, insurance claim processing, and payment status."
    },
    {
      icon: Bell,
      title: "Email & OTP System",
      desc: "Gmail SMTP triggers welcome emails, appointment reminders, OTP verification, and lab reports."
    },
    {
      icon: Users,
      title: "7 Role-Based Portals",
      desc: "Tailored experience for Super Admin, Hospital Admin, Reception, Doctor, Lab, Pharmacy, and Patient."
    },
    {
      icon: Shield,
      title: "Security & Audit Logs",
      desc: "JWT auth, bcrypt password hashing, session management, rate limiting, and action logs."
    }
  ];

  return (
    <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full">
            Core Modules
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            Everything Required for Hospital Operations
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Designed for high-throughput clinical workflows with speed and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((f, idx) => (
            <div key={idx} className="glass-card glass-card-hover p-6 rounded-xl space-y-3">
              <div className="w-12 h-12 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{f.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
