import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Menu, X, User as UserIcon, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardPathForUser } from '../../lib/navigation';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const getDashboardPath = () => getDashboardPathForUser(user);

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Intelli<span className="text-sky-600">Med</span></span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full">AI Smart Hospital</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#about" className="hover:text-sky-600 transition-colors">About</a>
          <a href="#features" className="hover:text-sky-600 transition-colors">Features</a>
          <a href="#ai-features" className="hover:text-sky-600 transition-colors">AI Recognition</a>
          <a href="#departments" className="hover:text-sky-600 transition-colors">Departments</a>
          <a href="#doctors" className="hover:text-sky-600 transition-colors">Doctors</a>
          <a href="#contact" className="hover:text-sky-600 transition-colors">Contact</a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to={getDashboardPath()} className="btn-primary">
                <UserIcon className="w-4 h-4" />
                Dashboard ({user?.role.display_name})
              </Link>
              <button onClick={logout} className="btn-outline text-xs">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline">
                <LogIn className="w-4 h-4" />
                Log In
              </Link>
              <Link to="/register" className="btn-primary">
                Register Patient
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <a href="#about" className="block text-slate-600 dark:text-slate-300 font-medium py-1">About</a>
          <a href="#features" className="block text-slate-600 dark:text-slate-300 font-medium py-1">Features</a>
          <a href="#ai-features" className="block text-slate-600 dark:text-slate-300 font-medium py-1">AI Recognition</a>
          <a href="#departments" className="block text-slate-600 dark:text-slate-300 font-medium py-1">Departments</a>
          <a href="#doctors" className="block text-slate-600 dark:text-slate-300 font-medium py-1">Doctors</a>
          <a href="#contact" className="block text-slate-600 dark:text-slate-300 font-medium py-1">Contact</a>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link to={getDashboardPath()} className="btn-primary w-full text-center">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-outline w-full text-center">Log In</Link>
                <Link to="/register" className="btn-primary w-full text-center">Register Patient</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
