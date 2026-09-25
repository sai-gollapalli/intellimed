import React, { useState } from 'react';
import { Bell, Moon, Sun, Search, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopbarProps {
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title = "Clinical Dashboard" }) => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
      {/* Title / Search */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 text-xs w-64">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search patient, ID, phone..."
            className="bg-transparent border-none focus:outline-none w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-sky-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 text-xs">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-900 dark:text-white flex justify-between items-center">
                <span>Notifications</span>
                <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-600 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Appointment Confirmed</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Patient IM-000104 checked in at reception.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">5 mins ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Lab Report Ready</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">CBC report generated for Patient IM-000088.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">22 mins ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs">
            {user?.first_name[0]}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
            <p className="text-[10px] text-slate-500">{user?.role.display_name}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
