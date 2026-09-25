import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, ShieldCheck, Zap, Users, ArrowRight, Activity, Calendar, FileText, HeartPulse, Stethoscope, Microscope, Sparkles, TrendingUp, Lock } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-20 pb-40 overflow-hidden bg-gradient-to-b from-teal-50/90 via-white to-emerald-50/70 dark:from-slate-900/90 dark:via-slate-900 dark:to-teal-950/50 medical-pattern">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 opacity-8 dark:opacity-4 animate-pulse-slow">
        <HeartPulse className="w-40 h-40 text-teal-500" />
      </div>
      <div className="absolute bottom-32 right-10 opacity-8 dark:opacity-4 animate-pulse-slow" style={{ animationDelay: '1s' }}>
        <Stethoscope className="w-40 h-40 text-emerald-500" />
      </div>
      <div className="absolute top-1/3 right-20 opacity-6 dark:opacity-3 animate-float">
        <Microscope className="w-24 h-24 text-cyan-500" />
      </div>
      <div className="absolute bottom-1/4 left-20 opacity-6 dark:opacity-3 animate-float" style={{ animationDelay: '2s' }}>
        <Sparkles className="w-24 h-24 text-purple-500" />
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-tr from-teal-400/20 to-emerald-500/15 rounded-full blur-3xl -z-10 pointer-events-none animate-glow" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-400/15 to-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-950/60 dark:to-emerald-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold tracking-widest uppercase border border-teal-200/80 dark:border-teal-800/80 shadow-lg shadow-teal-500/20 animate-fade-in-up">
            <Zap className="w-4 h-4 text-teal-600" />
            AI-Powered Healthcare Intelligence
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Next-Gen{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 animate-gradient">
              Healthcare
            </span>
            <br />
            <span className="text-5xl sm:text-6xl lg:text-7xl">Platform</span>
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Transform patient care with{' '}
            <span className="font-semibold text-teal-600 dark:text-teal-400">AI face recognition</span>,{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">real-time EMR access</span>,{' '}
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">intelligent scheduling</span>, and comprehensive clinical workflows in one secure platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register" className="w-full sm:w-auto btn-medical text-lg px-10 py-5 shadow-2xl shadow-teal-600/40 hover:shadow-teal-600/60 transform hover:-translate-y-1 transition-all duration-300">
              <Activity className="w-6 h-6" />
              Patient Registration
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link to="/login" className="flex-1 sm:flex-initial btn-outline text-base px-7 py-5 border-teal-300/70 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-teal-700 dark:text-teal-300 transform hover:-translate-y-0.5 transition-all duration-300">
                <ShieldCheck className="w-5 h-5" />
                Patient Login
              </Link>
              <Link to="/staff-register" className="flex-1 sm:flex-initial btn-primary text-base px-7 py-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transform hover:-translate-y-0.5 transition-all duration-300">
                <Stethoscope className="w-5 h-5" />
                Staff Registration
              </Link>
              <Link to="/staff-login" className="flex-1 sm:flex-initial btn-outline text-base px-7 py-5 border-emerald-300/70 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 transform hover:-translate-y-0.5 transition-all duration-300">
                <Lock className="w-5 h-5" />
                Staff Login
              </Link>
            </div>
          </div>

          {/* Enhanced Healthcare Metrics */}
          <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="glass-card p-8 rounded-3xl text-center group hover:border-teal-400/70 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-950/40 dark:to-teal-950/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-7 h-7 text-teal-600" />
              </div>
              <p className="text-4xl font-extrabold text-teal-600 group-hover:scale-105 transition-transform duration-300">99.8%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-2">Face Recognition</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Accuracy Rate</p>
            </div>
            <div className="glass-card p-8 rounded-3xl text-center group hover:border-emerald-400/70 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-950/40 dark:to-emerald-950/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-4xl font-extrabold text-emerald-600 group-hover:scale-105 transition-transform duration-300">&lt; 1s</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-2">Patient ID</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Verification Time</p>
            </div>
            <div className="glass-card p-8 rounded-3xl text-center group hover:border-cyan-400/70 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-950/40 dark:to-cyan-950/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-7 h-7 text-cyan-600" />
              </div>
              <p className="text-4xl font-extrabold text-cyan-600 group-hover:scale-105 transition-transform duration-300">HIPAA</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-2">Compliant</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Security Standards</p>
            </div>
            <div className="glass-card p-8 rounded-3xl text-center group hover:border-green-400/70 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950/40 dark:to-green-950/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-4xl font-extrabold text-green-600 group-hover:scale-105 transition-transform duration-300">7+</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-2">Clinical</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Staff Roles</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
