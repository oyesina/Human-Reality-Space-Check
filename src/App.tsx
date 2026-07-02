/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ruler, Maximize, ArrowUp, Info } from 'lucide-react';

// Average human height in meters
const HUMAN_HEIGHT = 1.8;

type Vibe = {
  label: string;
  description: string;
};

const getVibe = (height: number): Vibe => {
  if (height < 2.1) return { label: "Oppressive", description: "Potentially non-habitable or technical space. Lacks clearance for comfortable human movement." };
  if (height < 2.4) return { label: "Standard", description: "Common residential ceiling height. Functional, though can feel confined in large floor areas." };
  if (height < 3.0) return { label: "Airy", description: "Elevated residential or modern office standard. Provides a sense of dignity and improved air circulation." };
  if (height < 5.0) return { label: "Gallery", description: "Lofty and expansive. Suitable for large-scale art, public gatherings, or industrial repurposing." };
  return { label: "Monumental", description: "Grand architectural scale. Likely a cathedral, atrium, or infrastructure. Human presence is dwarfed." };
};

import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './components/LandingPage';
import RealityCheck from './components/RealityCheck';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-studio-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-[1px] bg-black animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Initializing Studio...</span>
        </div>
      </div>
    );
  }

  return user ? <RealityCheck /> : <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
