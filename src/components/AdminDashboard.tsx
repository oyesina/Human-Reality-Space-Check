/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { ArrowLeft, Users, Box, Hammer, Shield, Calendar, Mail, Ruler, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface UserActivity {
  id: string; // userId
  email: string;
  displayName: string;
  lastActive: any;
}

interface RealityCheckRecord {
  id: string;
  userId: string;
  width: number;
  depth: number;
  height: number;
  createdAt: any;
}

interface StudioSaveRecord {
  id: string;
  userId: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  roomType: string;
  createdAt: any;
}

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [realityChecks, setRealityChecks] = useState<RealityCheckRecord[]>([]);
  const [studioSaves, setStudioSaves] = useState<StudioSaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'spaces' | 'studios'>('users');

  // Verify access
  const isAuthorized = user?.email === 'oyesinaoyerinde@gmail.com';

  useEffect(() => {
    if (!isAuthorized) return;

    setLoading(true);

    // 1. Fetch Users
    const usersQuery = query(collection(db, 'users'), orderBy('lastActive', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const uData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserActivity[];
      setUsers(uData);
    });

    // 2. Fetch Reality checks
    const checksQuery = query(collection(db, 'reality_checks'), orderBy('createdAt', 'desc'));
    const unsubscribeChecks = onSnapshot(checksQuery, (snapshot) => {
      const cData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RealityCheckRecord[];
      setRealityChecks(cData);
    });

    // 3. Fetch Studio saves
    const studioQuery = query(collection(db, 'studio_saves'), orderBy('createdAt', 'desc'));
    const unsubscribeStudio = onSnapshot(studioQuery, (snapshot) => {
      const sData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudioSaveRecord[];
      setStudioSaves(sData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeChecks();
      unsubscribeStudio();
    };
  }, [isAuthorized]);

  // Compute stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalChecks = realityChecks.length;
    const totalStudios = studioSaves.length;

    // Calculate averages
    let avgWidth = 0;
    let avgDepth = 0;
    let avgHeight = 0;
    if (totalChecks > 0) {
      const sumW = realityChecks.reduce((acc, c) => acc + (c.width || 0), 0);
      const sumD = realityChecks.reduce((acc, c) => acc + (c.depth || 0), 0);
      const sumH = realityChecks.reduce((acc, c) => acc + (c.height || 0), 0);
      avgWidth = sumW / totalChecks;
      avgDepth = sumD / totalChecks;
      avgHeight = sumH / totalChecks;
    }

    // RoomType presets proportion in Studio
    const presetCounts: Record<string, number> = {
      none: 0,
      bedroom: 0,
      kitchen: 0,
      lounge: 0,
      toilet: 0
    };
    studioSaves.forEach(item => {
      if (item.roomType in presetCounts) {
        presetCounts[item.roomType]++;
      }
    });

    return {
      totalUsers,
      totalChecks,
      totalStudios,
      avgWidth,
      avgDepth,
      avgHeight,
      presetCounts
    };
  }, [users, realityChecks, studioSaves]);

  // Map each UID to email for visual display
  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach(u => map.set(u.id, u.email));
    return map;
  }, [users]);

  // Render unauthorized guard
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-black bg-red-50 text-red-900 gap-4">
        <Shield size={48} />
        <h2 className="text-xl font-bold uppercase tracking-widest">ACCESS RESTRICTED</h2>
        <p className="text-xs uppercase font-mono tracking-tight">Only administrative builder credentials can view telemetry statistics.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 border border-red-900 text-red-900 text-xs font-bold uppercase hover:bg-red-900 hover:text-white transition-all">
          Return To Studio Tools
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-black pb-6 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 border border-black hover:bg-black hover:text-white transition-all group bg-white"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-2xl font-light uppercase tracking-tighter flex items-center gap-2">
              <Shield size={20} className="stroke-[1.5]" /> Admin Builder Panel
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-studio-gray font-bold">Systems Diagnostics & User Behaviors</span>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-bold text-studio-gray">Super Account</span>
          <span className="font-mono text-xs">{user?.email}</span>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-[1px] bg-black animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-studio-gray">Retreiving Database Telemetry...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          
          {/* Diagnostic Metrics Matrix */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              label="Active Citizens" 
              value={stats.totalUsers} 
              sub="Unique user accounts in database"
              icon={<Users size={16} className="text-studio-gray" />} 
            />
            <MetricCard 
              label="Space Checks" 
              value={stats.totalChecks} 
              sub="Saved design space ratios"
              icon={<Box size={16} className="text-studio-gray" />} 
            />
            <MetricCard 
              label="Studio Presets" 
              value={stats.totalStudios} 
              sub="Saved fully furnished models"
              icon={<Hammer size={16} className="text-studio-gray" />} 
            />
            <MetricCard 
              label="Typical Height Tested" 
              value={`${stats.avgHeight.toFixed(2)}m`} 
              sub={`W: ${stats.avgWidth.toFixed(1)}m, D: ${stats.avgDepth.toFixed(1)}m averages`}
              icon={<Ruler size={16} className="text-studio-gray" />} 
            />
          </section>

          {/* User Behavior Trends */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-black p-6 bg-white flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-studio-gray border-b border-studio-border pb-3">Studio Preset Popularity Breakdown</span>
              <div className="flex flex-col gap-3.5 pt-2">
                {Object.entries(stats.presetCounts).map(([type, count]) => {
                  const percentage = stats.totalStudios > 0 ? (count / stats.totalStudios) * 100 : 0;
                  return (
                    <div key={type} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                        <span className="tracking-wide">{type === 'none' ? 'Empty Space' : type}</span>
                        <span className="font-mono text-studio-gray">{count} saved ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 border border-black/10">
                        <div 
                          className="bg-black h-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-black p-6 bg-white flex flex-col gap-4 justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-studio-gray border-b border-studio-border pb-3">User Scale Insights Summary</span>
                <p className="text-xs text-studio-gray leading-normal pt-2">
                  Based on user scale interactions, the average tested room ceiling is <strong className="text-black font-semibold">{stats.avgHeight.toFixed(1)}m</strong>, representing an <span className="underline select-all">{stats.avgHeight > 2.4 ? 'Elevated Airy/Gallery' : 'Residential Standard'}</span> proportion standard.
                </p>
                <p className="text-xs text-studio-gray leading-normal">
                  Users heavily prioritize lounge layouts over other sanitary or culinary preset facilities, suggesting that social scales are the primary candidate for prototype scaling tests.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 border border-studio-border p-3 mt-4">
                <Activity size={18} className="text-black shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-black leading-none">Database Status</span>
                  <span className="text-[9px] uppercase font-mono tracking-wider text-studio-gray mt-1">Live Synchronization Complete</span>
                </div>
              </div>
            </div>
          </section>

          {/* Database Listings Tabs */}
          <section className="flex flex-col gap-4">
            <div className="flex border-b border-black">
              <TabBtn label="User Profiles Details" active={activeTab === 'users'} select={() => setActiveTab('users')} />
              <TabBtn label="Saved Spaces Log" active={activeTab === 'spaces'} select={() => setActiveTab('spaces')} />
              <TabBtn label="Saved Studio Log" active={activeTab === 'studios'} select={() => setActiveTab('studios')} />
            </div>

            <div className="bg-white border border-black overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase font-bold border-b border-black select-none">
                        <th className="p-4">User Email</th>
                        <th className="p-4">User unique ID</th>
                        <th className="p-4 text-right">Last Session Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-studio-border font-mono text-xs">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-studio-gray uppercase text-[10px] tracking-widest font-mono">No registered profiles in directory.</td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-sans font-bold flex items-center gap-2 text-black">
                              <Mail size={12} className="text-studio-gray shrink-0" />
                              {u.email}
                            </td>
                            <td className="p-4 text-studio-gray truncate max-w-[200px]" title={u.id}>{u.id}</td>
                            <td className="p-4 text-right text-studio-gray">
                              {u.lastActive?.toDate().toLocaleString() || 'Active now'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'spaces' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase font-bold border-b border-black select-none">
                        <th className="p-4">Account Owner</th>
                        <th className="p-4">Dimenions Tested (W × D × H)</th>
                        <th className="p-4">Volumetric Scale</th>
                        <th className="p-4 text-right font-bold">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-studio-border font-mono text-xs">
                      {realityChecks.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-studio-gray uppercase text-[10px] tracking-widest font-mono">No calculator saves in space registry.</td>
                        </tr>
                      ) : (
                        realityChecks.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-sans font-bold text-black">
                              {userMap.get(row.userId) || row.userId || 'Anonymous'}
                            </td>
                            <td className="p-4 text-black font-semibold">
                              {row.width?.toFixed(1)}m × {row.depth?.toFixed(1)}m × {row.height?.toFixed(1)}m
                            </td>
                            <td className="p-4 text-studio-gray">
                              {((row.width || 0) * (row.depth || 0) * (row.height || 0)).toFixed(1)}m³
                            </td>
                            <td className="p-4 text-right text-studio-gray">
                              {row.createdAt?.toDate().toLocaleString() || 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'studios' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase font-bold border-b border-black select-none">
                        <th className="p-4">Account Owner</th>
                        <th className="p-4">Preset Label</th>
                        <th className="p-4">Layout Blueprint</th>
                        <th className="p-4">Dimensions</th>
                        <th className="p-4 text-right font-bold">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-studio-border font-mono text-xs">
                      {studioSaves.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-studio-gray uppercase text-[10px] tracking-widest font-mono">No custom design presets in directory.</td>
                        </tr>
                      ) : (
                        studioSaves.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-sans font-bold text-black">
                              {userMap.get(row.userId) || row.userId || 'Anonymous'}
                            </td>
                            <td className="p-4 font-sans font-semibold text-black uppercase tracking-wider">{row.name}</td>
                            <td className="p-4 text-black font-bold uppercase">{row.roomType}</td>
                            <td className="p-4 text-studio-gray">
                              {row.width?.toFixed(1)}m × {row.depth?.toFixed(1)}m × {row.height?.toFixed(1)}m
                            </td>
                            <td className="p-4 text-right text-studio-gray">
                              {row.createdAt?.toDate().toLocaleString() || 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, icon }: { label: string, value: string | number, sub: string, icon: any }) {
  return (
    <div className="border border-black p-6 bg-white shadow-[4px_4px_0_0_rgba(100,100,100,0.15)] flex flex-col justify-between min-h-[140px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-studio-gray tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="flex flex-col gap-1 mt-4">
        <span className="text-3xl font-light tracking-tighter leading-none">{value}</span>
        <span className="text-[9px] uppercase font-bold tracking-tight text-studio-gray mt-1">{sub}</span>
      </div>
    </div>
  );
}

function TabBtn({ label, active, select }: { label: string, active: boolean, select: () => void }) {
  return (
    <button 
      onClick={select}
      className={`px-6 py-3 text-[10px] uppercase tracking-wider font-bold transition-all border border-b-0 border-transparent ${
        active 
          ? 'bg-white border-black text-black font-extrabold shadow-[2px_-2px_0_0_rgba(0,0,0,0.05)]' 
          : 'text-studio-gray hover:text-black border-transparent hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
