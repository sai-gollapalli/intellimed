import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { About } from '../components/landing/About';
import { Features } from '../components/landing/Features';
import { AIFeatures } from '../components/landing/AIFeatures';
import { Departments } from '../components/landing/Departments';
import { Doctors } from '../components/landing/Doctors';
import { Testimonials } from '../components/landing/Testimonials';
import { FAQ } from '../components/landing/FAQ';
import { Contact } from '../components/landing/Contact';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <About />
        <Features />
        <AIFeatures />
        <Departments />
        <Doctors />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <LandingFooter />
    </div>
  );
};
