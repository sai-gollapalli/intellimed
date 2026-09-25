import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FlaskConical, Upload, FileText, Send, CheckCircle2, Clock, Camera } from 'lucide-react';

export const LabDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Laboratory & Radiology Workstation">
      <div className="space-y-6">
        {/* Top Summary Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-5 rounded-xl border-l-4 border-amber-500">
            <p className="text-xs text-slate-500 font-medium">Pending Test Orders</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">14</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">8 Blood, 4 Radiology</span>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-emerald-500">
            <p className="text-xs text-slate-500 font-medium">Reports Generated Today</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">28</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Emailed to Patients</span>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-sky-500">
            <p className="text-xs text-slate-500 font-medium">Radiology Scans Completed</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">6</p>
            <span className="text-[10px] text-sky-600 font-semibold mt-1 block">MRI & CT Scans</span>
          </div>
        </div>

        {/* Upload & Entry Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="glass-card p-6 rounded-2xl space-y-4 col-span-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">New Lab Report Entry</h3>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient ID / Code</label>
                  <input type="text" placeholder="IM-000104" className="input-field font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Test Category</label>
                  <select className="input-field">
                    <option>Complete Blood Count (CBC)</option>
                    <option>Lipid Profile</option>
                    <option>Liver Function Test (LFT)</option>
                    <option>Urine Routine</option>
                    <option>X-Ray / MRI Imaging</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Result Parameters (JSON / Key-Values)</label>
                <textarea rows={4} placeholder="Hemoglobin: 14.5 g/dL (Normal)&#10;WBC Count: 7,200 /uL (Normal)" className="input-field font-mono text-xs"></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Supporting File (PDF / Image / DICOM)</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-sky-500 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Drag & drop report document or click to browse</p>
                  <p className="text-[10px] text-slate-400 mt-1">Supported: PDF, PNG, JPG, DICOM (Max 10MB)</p>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-3">
                <FileText className="w-4 h-4" />
                Generate PDF & Email Report to Patient
              </button>
            </form>
          </div>

          {/* Test Orders Queue */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Pending Orders Queue</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-sky-600">IM-000104 (Alexander Wright)</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">Complete Blood Count (CBC)</p>
                <p className="text-slate-400 text-[11px]">Ordered by: Dr. Sarah Jenkins</p>
                <button className="mt-2 btn-primary py-1 px-3 w-full text-[11px]">Process Test</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
