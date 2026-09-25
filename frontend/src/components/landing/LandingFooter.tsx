import React from 'react';
import { Activity, Heart, Shield } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">IntelliMed</span>
            </div>
            <p className="text-xs leading-relaxed">
              AI Smart Hospital Management & Biometric Patient Identification System.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" className="hover:text-sky-400">About System</a></li>
              <li><a href="#features" className="hover:text-sky-400">Core Features</a></li>
              <li><a href="#ai-features" className="hover:text-sky-400">AI Recognition</a></li>
              <li><a href="#departments" className="hover:text-sky-400">Departments</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">User Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/login" className="hover:text-sky-400">Doctor Portal</a></li>
              <li><a href="/login" className="hover:text-sky-400">Reception Desk</a></li>
              <li><a href="/login" className="hover:text-sky-400">Lab Technician</a></li>
              <li><a href="/login" className="hover:text-sky-400">Patient Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Security & Compliance</h4>
            <p className="text-xs leading-relaxed mb-3">
              Built with local PostgreSQL data sovereignty, JWT role-based access, and anti-spoofing facial recognition.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              Local Private Deployment
            </span>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} IntelliMed Hospital Management System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Healthcare Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
