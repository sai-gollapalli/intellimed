import React from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <span className="text-xs font-semibold px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full">
              Contact & Support
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Get in Touch with IntelliMed Administration
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Have questions regarding system setup, hardware webcam integrations, or custom role configurations? Reach out to our technical team.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Hospital Address</h4>
                  <p className="text-xs text-slate-500">124 Healthcare Boulevard, Medical District, Tech City</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Helpline & Emergency</h4>
                  <p className="text-xs text-slate-500">+1 (800) 555-INTELLI / Emergency Desk Ext 911</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Email Inquiry</h4>
                  <p className="text-xs text-slate-500">support@intellimed-hospital.local</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Send an Inquiry</h3>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                <input type="text" placeholder="John Doe" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input type="email" placeholder="john@example.com" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea rows={4} placeholder="Describe your inquiry..." className="input-field"></textarea>
              </div>
              <button type="submit" className="w-full btn-primary py-3">
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
