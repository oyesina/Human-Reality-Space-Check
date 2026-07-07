/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { 
  ArrowLeft, Users, Box, Hammer, Shield, Calendar, Mail, Ruler, ChevronRight, Activity, 
  TrendingUp, BarChart3, PieChart as PieIcon, Layers, Maximize2, HardHat
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-black p-3.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] font-mono text-[10px] uppercase">
        <p className="font-extrabold border-b border-black/10 pb-1.5 mb-2 text-black">{label}</p>
        {payload.map((pld: any) => (
          <div key={pld.name} className="flex justify-between items-center gap-6 py-0.5">
            <span className="text-studio-gray font-semibold">{pld.name}:</span>
            <span className="text-black font-extrabold">{pld.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-2 border-black p-3.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] font-mono text-[10px] uppercase">
        <p className="font-extrabold border-b border-black/10 pb-1.5 mb-2 text-black">Room Specs Checked</p>
        <div className="flex justify-between items-center gap-6 py-0.5">
          <span className="text-studio-gray">Width:</span>
          <span className="text-black font-extrabold">{data.width.toFixed(1)}m</span>
        </div>
        <div className="flex justify-between items-center gap-6 py-0.5">
          <span className="text-studio-gray">Depth:</span>
          <span className="text-black font-extrabold">{data.depth.toFixed(1)}m</span>
        </div>
        <div className="flex justify-between items-center gap-6 py-0.5">
          <span className="text-studio-gray">Height:</span>
          <span className="text-black font-extrabold">{data.height.toFixed(1)}m</span>
        </div>
        <div className="flex justify-between items-center gap-6 py-0.5 border-t border-dashed border-black/10 mt-2 pt-2">
          <span className="text-studio-gray">Floor Area:</span>
          <span className="text-black font-extrabold">{(data.width * data.depth).toFixed(1)}m²</span>
        </div>
        <div className="flex justify-between items-center gap-6 py-0.5">
          <span className="text-emerald-700 font-bold">Total Volume:</span>
          <span className="text-emerald-700 font-extrabold">{data.volume}m³</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [realityChecks, setRealityChecks] = useState<RealityCheckRecord[]>([]);
  const [studioSaves, setStudioSaves] = useState<StudioSaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'spaces' | 'studios'>('analytics');

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

  // Format timeline data for the daily interaction activity graph
  const timelineData = useMemo(() => {
    const dates: Record<string, { date: string; checks: number; saves: number }> = {};
    
    // Seed the past 7 days with 0 metrics so the chart is always beautifully formatted
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dates[dateStr] = { date: dateStr, checks: 0, saves: 0 };
    }

    // Accumulate actual reality checks from firestore logs
    realityChecks.forEach(c => {
      if (c.createdAt) {
        const dateObj = typeof c.createdAt.toDate === 'function' ? c.createdAt.toDate() : new Date(c.createdAt);
        const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dates[dateStr]) {
          dates[dateStr].checks++;
        } else {
          // If a record exists outside the standard 7 days window, we still map it
          dates[dateStr] = { date: dateStr, checks: 1, saves: 0 };
        }
      }
    });

    // Accumulate studio presets saves
    studioSaves.forEach(s => {
      if (s.createdAt) {
        const dateObj = typeof s.createdAt.toDate === 'function' ? s.createdAt.toDate() : new Date(s.createdAt);
        const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dates[dateStr]) {
          dates[dateStr].saves++;
        } else {
          dates[dateStr] = { date: dateStr, checks: 0, saves: 1 };
        }
      }
    });

    // Sort chronologically by date
    return Object.values(dates).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [realityChecks, studioSaves]);

  // Height comfort levels classification
  const heightDistribution = useMemo(() => {
    const counts = { oppressive: 0, standard: 0, airy: 0, monumental: 0 };
    
    realityChecks.forEach(c => {
      const h = c.height || 0;
      if (h < 2.1) counts.oppressive++;
      else if (h < 2.4) counts.standard++;
      else if (h < 3.0) counts.airy++;
      else counts.monumental++;
    });

    return [
      { name: 'Oppressive (<2.1m)', value: counts.oppressive, color: '#DC2626' },
      { name: 'Standard (2.1-2.4m)', value: counts.standard, color: '#D97706' },
      { name: 'Airy (2.4-3.0m)', value: counts.airy, color: '#047857' },
      { name: 'Monumental (>3.0m)', value: counts.monumental, color: '#2563EB' }
    ];
  }, [realityChecks]);

  // Dimension Scatter points (Width vs Depth vs Height)
  const roomDimensionPoints = useMemo(() => {
    return realityChecks.map((c, index) => ({
      id: c.id,
      width: c.width || 0,
      depth: c.depth || 0,
      volume: parseFloat(((c.width || 0) * (c.depth || 0) * (c.height || 0)).toFixed(1)),
      height: c.height || 0,
      label: `Check #${index + 1}`
    }));
  }, [realityChecks]);

  // Format Studio preset saves
  const presetPopularityData = useMemo(() => {
    return Object.entries(stats.presetCounts).map(([type, count]) => {
      const formattedName = type === 'none' ? 'Empty Space' : type.charAt(0).toUpperCase() + type.slice(1);
      return {
        name: formattedName,
        Saves: count
      };
    });
  }, [stats.presetCounts]);

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
            <div className="flex border-b border-black overflow-x-auto scrollbar-none whitespace-nowrap">
              <TabBtn label="Analytics & Activity Graphs" active={activeTab === 'analytics'} select={() => setActiveTab('analytics')} />
              <TabBtn label="User Profiles Details" active={activeTab === 'users'} select={() => setActiveTab('users')} />
              <TabBtn label="Saved Spaces Log" active={activeTab === 'spaces'} select={() => setActiveTab('spaces')} />
              <TabBtn label="Saved Studio Log" active={activeTab === 'studios'} select={() => setActiveTab('studios')} />
            </div>

            <div className="bg-white border border-black overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              {activeTab === 'analytics' && (
                <div className="p-4 sm:p-6 flex flex-col gap-8 bg-[#FBF9F4]/20">
                  {/* Row 1: Timeline chart & key summary stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Time series Chart */}
                    <div className="lg:col-span-8 border border-black p-5 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between border-b border-black pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} />
                          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-black">Interaction Activity Ledger</span>
                        </div>
                        <span className="font-mono text-[8px] bg-black text-[#FBF9F4] px-1.5 py-0.5 uppercase">Last 7 Days Stream</span>
                      </div>
                      
                      <div className="h-[280px] w-full font-mono text-[9px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#000000" fontSize={8} />
                            <YAxis stroke="#000000" fontSize={8} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase' }} />
                            <Line name="Space Checks" type="monotone" dataKey="checks" stroke="#000000" strokeWidth={2.5} activeDot={{ r: 6 }} />
                            <Line name="Studio Saves" type="monotone" dataKey="saves" stroke="#047857" strokeWidth={2.5} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Vibe and Height Classifications */}
                    <div className="lg:col-span-4 border border-black p-5 bg-[#FAF9F5] shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 border-b border-black pb-3 mb-4">
                          <Layers size={14} />
                          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-black">Room Vibe Classification</span>
                        </div>
                        
                        <div className="h-[170px] w-full flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={heightDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={62}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {heightDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#000000" strokeWidth={1} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-4 border-t border-black/10 mt-2">
                        {heightDistribution.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[9px] font-mono uppercase font-bold">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 border border-black shrink-0" style={{ backgroundColor: item.color }} />
                              <span>{item.name}</span>
                            </div>
                            <span className="text-black font-extrabold bg-white px-1.5 py-0.5 border border-black/10">{item.value} saved</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Room Preset Popularity & Dynamic Footprint Cloud */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Footprint Scatter Map */}
                    <div className="lg:col-span-7 border border-black p-5 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between border-b border-black pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Maximize2 size={14} />
                          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-black">Footprint Boundary Distribution</span>
                        </div>
                        <span className="font-mono text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 uppercase font-bold">Volumetric Spread</span>
                      </div>

                      <p className="text-[10px] text-studio-gray mb-4 font-mono leading-relaxed uppercase">
                        This scatter layout maps Width (X) and Depth (Y) of user tests. Bubble sizes scale proportionally to total space volume (m³).
                      </p>

                      <div className="h-[240px] w-full font-mono text-[8px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -15 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" dataKey="width" name="Width" unit="m" stroke="#000000" domain={[2, 12]} tickCount={6} />
                            <YAxis type="number" dataKey="depth" name="Depth" unit="m" stroke="#000000" domain={[2, 12]} tickCount={6} />
                            <ZAxis type="number" dataKey="volume" range={[60, 450]} name="Volume" unit="m³" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />
                            <Scatter name="Spaces" data={roomDimensionPoints} fill="#000000" stroke="#000000" strokeWidth={1} />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Popularity Bar Chart */}
                    <div className="lg:col-span-5 border border-black p-5 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-black pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <BarChart3 size={14} />
                            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-black">Furnished Layout popularities</span>
                          </div>
                          <span className="font-mono text-[8px] text-studio-gray uppercase">Saves aggregate</span>
                        </div>

                        <div className="h-[220px] w-full font-mono text-[8px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={presetPopularityData} margin={{ left: -20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                              <XAxis dataKey="name" stroke="#000000" />
                              <YAxis stroke="#000000" allowDecimals={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="Saves" fill="#047857" stroke="#000000" strokeWidth={1}>
                                {presetPopularityData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#047857' : '#000000'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-black/10 p-3 mt-4 text-[9px] uppercase font-mono leading-relaxed text-studio-gray">
                        Total {stats.totalStudios} furnished layout models have been compiled. Lounge setups represent primary community focus.
                      </div>
                    </div>
                  </div>

                  {/* Operational diagnostics tips */}
                  <div className="border border-black p-4 bg-yellow-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-[10px] uppercase">
                    <div className="flex items-center gap-2">
                      <HardHat size={14} className="text-amber-700" />
                      <span><strong>Diagnostics Notice:</strong> Average ceiling heights remain high (avg {stats.avgHeight.toFixed(2)}m). Suggest adding custom insulation indicators for tall volumetric layouts in active builder profile.</span>
                    </div>
                    <span className="text-[8px] text-studio-gray font-bold">Diagnostics Ledger Updated Live</span>
                  </div>
                </div>
              )}

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
