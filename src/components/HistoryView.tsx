/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { Trash2, Calendar, Maximize2, ArrowLeft, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SavedCheck {
  id: string;
  width: number;
  depth: number;
  height: number;
  createdAt: any;
}

export default function HistoryView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [checks, setChecks] = useState<SavedCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reality_checks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedCheck[];
      setChecks(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching history:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const deleteCheck = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reality_checks', id));
    } catch (error) {
      console.error("Error deleting check:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between border-b border-black pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 border border-black hover:bg-black hover:text-white transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-light uppercase tracking-tighter">Calculation Archive</h2>
            <span className="text-[10px] uppercase tracking-widest text-studio-gray font-bold">Sheet 02 / Historical Data</span>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-bold text-studio-gray">Total Records</span>
          <span className="font-mono text-xs">{checks.length} cached</span>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-[1px] bg-black animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Retrieving Archive...</span>
        </div>
      ) : checks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-studio-border bg-gray-50/50">
          <Layers size={32} className="text-studio-border mb-4" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-studio-gray">No saved calculations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {checks.map((check) => (
              <motion.div 
                key={check.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="border border-black p-6 bg-white flex flex-col gap-4 group relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-studio-gray">
                    <Calendar size={12} />
                    <span className="text-[10px] font-mono uppercase">
                      {check.createdAt?.toDate().toLocaleDateString() || 'Pending...'}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteCheck(check.id)}
                    className="text-studio-gray hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-studio-border py-4 my-2">
                  <DimensionItem label="Width" val={check.width} />
                  <DimensionItem label="Depth" val={check.depth} />
                  <DimensionItem label="Height" val={check.height} />
                </div>

                <div className="flex justify-between items-end mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-studio-gray">Volume</span>
                    <span className="font-mono text-sm">{(check.width * check.depth * check.height).toFixed(2)}m³</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] uppercase font-bold text-studio-gray">Floor</span>
                    <span className="font-mono text-sm">{(check.width * check.depth).toFixed(2)}m²</span>
                  </div>
                </div>

                {/* Aesthetic Numbering */}
                <span className="absolute -bottom-2 -right-2 text-[40px] font-bold text-black/[0.03] pointer-events-none select-none">
                  #{check.id.slice(0, 2).toUpperCase()}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function DimensionItem({ label, val }: { label: string, val: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase font-bold text-studio-gray mb-1">{label}</span>
      <span className="font-mono text-xs">{val.toFixed(1)}m</span>
    </div>
  );
}
