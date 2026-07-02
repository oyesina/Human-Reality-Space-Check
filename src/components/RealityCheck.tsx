/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, Save, History as HistoryIcon, Calculator, ChevronRight, X, Info, Box, 
  Square, Maximize2, Users, Shield, Compass, Landmark, Pyramid, Castle, Building, 
  Warehouse, Sofa, Bed, Lamp, DoorOpen, Grid, BrickWall, School, HardHat, 
  Paintbrush, Trees, Layers, MoreVertical, HelpCircle, Download, FileText
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import HistoryView from './HistoryView';
import Room3D from './Room3D';
import RoomStudio from './RoomStudio';
import AdminDashboard from './AdminDashboard';
import ProcurementEstimator from './ProcurementEstimator';
import LegalCharterView from './LegalCharterView';
import { 
  generateOBJ, generateSTL, generateSVG, generateDXF, generateJSON, 
  triggerFileDownload, downloadPNGFromSVG, ExportData 
} from '../lib/exportUtils';

const HUMAN_HEIGHT = 1.8;

type Vibe = {
  label: string;
  description: string;
};

const getVibe = (width: number, depth: number, height: number): Vibe => {
  const minSide = Math.min(width, depth);
  const area = width * depth;
  const ratio = height / minSide;

  if (height < 2.1) {
    return { 
      label: "Oppressive", 
      description: "Extremely low ceiling. Lacks clearance for standard human habitability, functioning only as a crawlspace or service void." 
    };
  }
  
  if (minSide < 2.0 && ratio > 2.0) {
    return { 
      label: "Chasm Shaft", 
      description: "Extremely narrow and towering vertical chamber. Evokes being at the bottom of a chimney, staircase shaft, or deep lightwell. Dramatic but highly restrictive." 
    };
  }

  if (minSide < 2.0) {
    return { 
      label: "Confined Slot", 
      description: "Constricted width makes this a highly directional, corridor-like slot. Effective for simple circulation, closets, or utility runs." 
    };
  }

  if (height < 2.4) {
    return { 
      label: "Standard", 
      description: "Typical baseline residential ceiling. Cozy, intimate, and highly efficient, though it can feel compressed in larger floorplans." 
    };
  }

  if (height < 3.0) {
    return { 
      label: "Airy / Noble", 
      description: "Excellent transitional proportion. Generous clear height offers visual breathing room and a refined, upscale spatial value." 
    };
  }

  if (height < 5.0) {
    if (area < 15) {
      return { 
        label: "Tower Loft", 
        description: "Tall with a modest footprint. Evokes a cozy vertical turret, focal study, or micro-gallery celebrating verticality over floor area." 
      };
    }
    return { 
      label: "Gallery Atelier", 
      description: "Cabinet loft proportions with plenty of headroom. Perfect for high-density shelving, art exhibition, or light industrial space." 
    };
  }

  // height >= 5.0
  if (area < 30) {
    return { 
      label: "Sanctuary Spire", 
      description: "A soaring vertical slot with a dense footprint, directing all visual focus upward like a private chapel, library spire, or lightwell." 
    };
  }

  return { 
    label: "Monumental", 
    description: "Grand architectural volume of epic proportions. Typical of museum halls, cathedrals, or modern terminal hubs. Human scale is fully dwarfed." 
  };
};

const ARCHITECTURAL_ICONS = [
  { id: 'Compass', icon: Compass, label: 'Architect Compass', desc: 'Precision drafting & spatial planning tool' },
  { id: 'Landmark', icon: Landmark, label: 'Classical Temple', desc: 'Symmetrical columns and historical proportions' },
  { id: 'Pyramid', icon: Pyramid, label: 'Great Pyramid', desc: 'Ancient gravity-defying monumental masonry' },
  { id: 'Castle', icon: Castle, label: 'Forte Tower', desc: 'Medieval defense design and stone fortifications' },
  { id: 'Building', icon: Building, label: 'Skyscraper Pillar', desc: 'Modern steel, glass, and vertical density' },
  { id: 'Warehouse', icon: Warehouse, label: 'Industrial Loft', desc: 'Minimalist exposed layouts with massive volumes' },
  { id: 'Sofa', icon: Sofa, label: 'Lounge Divan', desc: 'Ergonomic curves for premium interior seating' },
  { id: 'Bed', icon: Bed, label: 'Sanctuary Bed', desc: 'Private resting module optimized for circulation' },
  { id: 'Lamp', icon: Lamp, label: 'Bauhaus Luminaire', desc: 'Ambient lighting fixture celebrating pure geometry' },
  { id: 'DoorOpen', icon: DoorOpen, label: 'Threshold Portal', desc: 'The architectural boundary between inside and out' },
  { id: 'Grid', icon: Grid, label: 'Modular Grid', desc: 'The infinite coordinate system of the blueprint font-sans font-medium tracking-tight' },
  { id: 'BrickWall', icon: BrickWall, label: 'Tectonic Masonry', desc: 'Raw material textures and rhythmic brick bonds' },
  { id: 'School', icon: School, label: 'Civic Pavilion', desc: 'Modernist educational hub with airy galleries' },
  { id: 'HardHat', icon: HardHat, label: 'Tectonic Helmet', desc: 'Pragmatic safety and structural implementation' },
  { id: 'Paintbrush', icon: Paintbrush, label: 'Color Wash', desc: 'Surface treatment and interior finish application' },
  { id: 'Trees', icon: Trees, label: 'Landscape Forest', desc: 'Natural integration and outdoor context scales' },
  { id: 'Layers', icon: Layers, label: 'Horizontal Planes', desc: 'Multi-level stack of floorplates and elevations' },
];

const ARCHITECTURAL_QUOTES = [
  "\"The measure of architecture is the scale of the human body and the proportions between its parts.\"",
  "\"Space and light and order. Those are the things that humans need just as much as they need bread.\"",
  "\"Architecture belongs to culture, not to commerce. True space resonates with the soul.\"",
  "\"By order of scale, a room is the starting point of architectural society.\"",
  "\"The details are not the details. They construct the gravity of the design.\"",
  "\"Architecture is the learned game, correct and magnificent, of forms assembled in the light.\"",
  "\"Light is the most noble and atmospheric medium of three-dimensional architecture.\"",
  "\"A house is a machine for living in, structured precisely around human circulation.\"",
  "\"God is in the details. Precise measurements define the boundary of habitability.\"",
  "\"Architecture should speak of its time and place, but yearn for mathematical timelessness.\"",
  "\"We shape our buildings; thereafter they shape our spatial experiences.\"",
  "\"To provide meaningful architecture is to articulate the scale of human existence.\""
];

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Compass, Landmark, Pyramid, Castle, Building, Warehouse, Sofa, Bed, Lamp, DoorOpen, Grid, BrickWall, School, HardHat, Paintbrush, Trees, Layers
};

interface NavRowProps {
  number: string;
  label: string;
  desc: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}

function NavRow({ number, label, desc, active, icon, onClick }: NavRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 border border-black transition-all flex items-center justify-between cursor-pointer group select-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none ${
        active 
          ? 'bg-black text-white border-black' 
          : 'bg-white text-black border-studio-border hover:border-black'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className={`font-mono text-xs font-bold shrink-0 ${active ? 'text-white/40' : 'text-slate-400'}`}>
          {number}
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] uppercase font-bold tracking-wider leading-none truncate group-hover:underline">
            {label}
          </span>
          <span className={`text-[8.5px] uppercase tracking-tight mt-1 truncate ${active ? 'text-white/60' : 'text-studio-gray'}`}>
            {desc}
          </span>
        </div>
      </div>
      
      <div className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${active ? 'text-white' : 'text-black'}`}>
        {icon}
      </div>
    </button>
  );
}

export default function RealityCheck() {
  const { user } = useAuth();
  const [view, setView] = useState<'calculator' | 'history' | 'studio' | 'admin' | 'legal'>('calculator');
  const [is3D, setIs3D] = useState(false);
  const [width, setWidth] = useState(4.0);
  const [depth, setDepth] = useState(5.0);
  const [height, setHeight] = useState(2.7);
  const [zoom2D, setZoom2D] = useState(1.0);
  const [autoZoom, setAutoZoom] = useState(true);
  const [saving, setSaving] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState<number | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [profileIcon, setProfileIcon] = useState<string>('Compass');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(() => {
    const idx = Math.floor(Math.random() * ARCHITECTURAL_QUOTES.length);
    return ARCHITECTURAL_QUOTES[idx];
  });

  useEffect(() => {
    if (!user) return;

    // Pick a randomized quote for this login session
    const idx = Math.floor(Math.random() * ARCHITECTURAL_QUOTES.length);
    setCurrentQuote(ARCHITECTURAL_QUOTES[idx]);

    // Register active user session logs in users directory
    const recordSession = async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email || 'Anonymous',
          displayName: user.displayName || '',
          lastActive: serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.error("Error setting session profile:", err);
      }
    };
    recordSession();

    // Subscribe to user's profile icon config in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.profileIcon) {
          setProfileIcon(data.profileIcon);
        }
      }
    }, (err) => {
      console.error("Error listening to user doc:", err);
    });

    const hasSeenWalkthrough = localStorage.getItem(`walkthrough_seen_${user.uid}`);
    if (!hasSeenWalkthrough) {
      // Delay slightly to ensure layout is settled
      const timer = setTimeout(() => setWalkthroughStep(0), 1000);
      return () => {
        clearTimeout(timer);
        unsubscribeUser();
      };
    }
    return () => unsubscribeUser();
  }, [user]);

  const saveSelectedIcon = async (iconId: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        profileIcon: iconId
      }, { merge: true });
    } catch (err) {
      console.error("Error updating profile icon:", err);
    }
  };

  const startWalkthrough = () => {
    setIsSidePanelOpen(false);
    setWalkthroughStep(0);
  };

  const finishWalkthrough = () => {
    if (user) {
      localStorage.setItem(`walkthrough_seen_${user.uid}`, 'true');
    }
    setWalkthroughStep(null);
  };

  const area = useMemo(() => width * depth, [width, depth]);
  const volume = useMemo(() => area * height, [area, height]);
  const humanRatio = useMemo(() => (height / HUMAN_HEIGHT).toFixed(1), [height]);
  const vibe = useMemo(() => getVibe(width, depth, height), [width, depth, height]);

  const MAX_METERS = 30;
  
  const getRoom2DDimensions = () => {
    if (autoZoom) {
      const roomAspect = width / height;
      const viewportAspect = 2.1; // aspect ratio approximation for landscape visualizer frame
      
      if (roomAspect > viewportAspect) {
        // Room is wider than viewport. Limit by width.
        const wPercent = 85 * zoom2D;
        const hPercent = (wPercent / roomAspect) * viewportAspect;
        return { width: `${wPercent}%`, height: `${hPercent}%` };
      } else {
        // Room is taller than viewport. Limit by height.
        const hPercent = 82 * zoom2D; // slightly lower than 85 to account for ceiling and floor padding
        const wPercent = (hPercent * roomAspect) / viewportAspect;
        return { width: `${wPercent}%`, height: `${hPercent}%` };
      }
    } else {
      // Absolute comparative scale mode
      const viewportAspect = 2.1;
      const wPercent = (width / MAX_METERS) * 100 * zoom2D;
      const hPercent = (height / MAX_METERS) * 100 * viewportAspect * zoom2D;
      return { width: `${wPercent}%`, height: `${hPercent}%` };
    }
  };

  const handleLogout = () => auth.signOut();

  const getExportParams = (): ExportData => ({
    width,
    depth,
    height,
    roomType: 'none',
    area,
    volume,
    vibeLabel: vibe.label,
    vibeDescription: vibe.description
  });

  const handleExportSVG = () => {
    const raw = generateSVG(getExportParams());
    triggerFileDownload(raw, `geepee_blueprint_${width}x${depth}x${height}.svg`, 'image/svg+xml');
    setShowExportDropdown(false);
  };

  const handleExportDXF = () => {
    const raw = generateDXF(getExportParams());
    triggerFileDownload(raw, `geepee_draft_${width}x${depth}x${height}.dxf`, 'text/plain');
    setShowExportDropdown(false);
  };

  const handleExportPNG = () => {
    if (is3D) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        try {
          const dataURL = canvas.toDataURL('image/png');
          triggerFileDownload(dataURL, `geepee_3d_render_${width}x${depth}x${height}.png`, 'image/png');
        } catch (err) {
          console.error("ThreeJS snapshot capture failed:", err);
          const raw = generateSVG(getExportParams());
          downloadPNGFromSVG(raw, `geepee_view_${width}x${depth}x${height}.png`);
        }
      } else {
        const raw = generateSVG(getExportParams());
        downloadPNGFromSVG(raw, `geepee_view_${width}x${depth}x${height}.png`);
      }
    } else {
      const raw = generateSVG(getExportParams());
      downloadPNGFromSVG(raw, `geepee_view_${width}x${depth}x${height}.png`);
    }
    setShowExportDropdown(false);
  };

  const handleExportOBJ = () => {
    const raw = generateOBJ(getExportParams());
    triggerFileDownload(raw, `geepee_model_${width}x${depth}x${height}.obj`, 'text/plain');
    setShowExportDropdown(false);
  };

  const handleExportSTL = () => {
    const raw = generateSTL(getExportParams());
    triggerFileDownload(raw, `geepee_print_${width}x${depth}x${height}.stl`, 'text/plain');
    setShowExportDropdown(false);
  };

  const handleExportJSON = () => {
    const raw = generateJSON(getExportParams());
    triggerFileDownload(raw, `geepee_specs_${width}x${depth}x${height}.json`, 'application/json');
    setShowExportDropdown(false);
  };

  const saveCheck = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'reality_checks'), {
        userId: user.uid,
        width,
        depth,
        height,
        createdAt: serverTimestamp()
      });
      alert("Check saved to your profile.");
    } catch (error) {
      console.error("Error saving check:", error);
    } finally {
      setSaving(false);
    }
  };

  const walkthroughSteps = [
    {
      title: "Navigation Control Room",
      desc: "Pivot your workspace view seamlessly. Explore our dynamic 3D furnished pre-sets under 'Studio', manage calculations under 'History', or toggle specialized platform attributes.",
      target: "actions"
    },
    {
      title: "Parametric Control Panel",
      desc: "Specify your exact wall boundary heights, room depths, and interior width metrics. Real-time updates process calculations instantly up to 30 meters.",
      target: "controls"
    },
    {
      title: "Interactive Space Visualizer",
      desc: "Toggle between 2D physical orthographic cross-sections and interactive, responsive 3D perspective models. Drag to pivot or view spatial ratios in real-time.",
      target: "visualizer"
    },
    {
      title: "Volumetric Telemetry Stream",
      desc: "Review your immediate surface floor area index and net airspace volume tracking metrics. See precisely how many standard human heights scale to your layout.",
      target: "data"
    },
    {
      title: "Material Specifications",
      desc: "Customize the physical build details. Toggle dynamically between Sandcrete block masonry, Clay brick layers, or Timber studs framing, and apply dual-faced mortar rendering to estimate exact raw element requirements.",
      target: "estimator-materials"
    },
    {
      title: "Procurement & Cost Estimator",
      desc: "Analyze concrete foundational cubic volumes, timber lengths, brick/sandcrete masonry item counts, and localized budget multipliers directly under your spatial limits.",
      target: "estimator"
    }
  ];

  const Callout = ({ step, targetRef }: { step: number; targetRef: any }) => {
    const [pos, setPos] = useState({ top: 0, left: 0, placement: 'side' });
    const [isMobileOrStacked, setIsMobileOrStacked] = useState(false);
    const currentStep = walkthroughSteps[step];

    useEffect(() => {
      const handleResize = () => {
        setIsMobileOrStacked(window.innerWidth < 1024);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
      const updatePosition = () => {
        if (isMobileOrStacked) {
          // On mobile & stacked layouts (e.g. tablet), keep it fixed centered at the bottom
          setPos({ top: 0, left: 0, placement: 'mobile-bottom' });
          return;
        }

        let targetEl = targetRef?.current;
        if (!targetEl && typeof currentStep.target === 'string') {
          targetEl = document.getElementById(currentStep.target);
        }

        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          
          if (currentStep.target === 'controls' || currentStep.target === 'data') {
            setPos({ top: rect.top + rect.height / 2, left: rect.right + 24, placement: 'right' });
          } else if (currentStep.target === 'visualizer') {
            setPos({ top: rect.bottom - 100, left: rect.left + rect.width / 2 - 144, placement: 'center' });
          } else if (currentStep.target === 'estimator' || currentStep.target === 'estimator-materials') {
            setPos({ top: rect.top + 140, left: rect.left + rect.width / 2 - 144, placement: 'center' });
          } else {
            setPos({ top: rect.bottom + 12, left: rect.left + rect.width / 2 - 150, placement: 'bottom' });
          }
        } else {
          setPos({ top: window.innerHeight / 2, left: window.innerWidth / 2, placement: 'center' });
        }
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, { passive: true });
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }, [step, targetRef, isMobileOrStacked]);

    const inlineStyles = isMobileOrStacked 
      ? {
          position: 'fixed' as const,
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '420px',
          zIndex: 101,
        }
      : {
          position: 'fixed' as const,
          top: pos.top,
          left: pos.left,
          zIndex: 101,
          transform: pos.placement === 'center' ? 'translate(-50%, -50%)' : pos.placement === 'bottom' ? '' : 'translateY(-50%)',
        };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: isMobileOrStacked ? 30 : 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: isMobileOrStacked ? 30 : 10 }}
        style={inlineStyles}
        className={`${
          isMobileOrStacked ? 'w-[calc(100vw-32px)]' : 'w-[280px] md:w-72'
        } bg-black text-white p-5 md:p-6 shadow-[20px_20px_0_0_rgba(0,0,0,0.25)] pointer-events-auto border border-white/20`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-studio-gray">System Tip {step + 1}/{walkthroughSteps.length}</span>
            <button onClick={finishWalkthrough} className="hover:text-studio-gray transition-colors font-mono text-xs cursor-pointer p-1">EXIT_</button>
          </div>
          <h4 className="text-sm font-bold uppercase tracking-tight">{currentStep.title}</h4>
          <p className="text-[11px] leading-relaxed text-studio-gray">{currentStep.desc}</p>
          
          {/* Progress Indicators/Dots */}
          <div className="flex gap-1.5 py-1">
            {walkthroughSteps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? 'w-5 bg-white' : 'w-1 bg-white/30'
                }`} 
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/10">
            <button 
              onClick={finishWalkthrough}
              className="text-[9px] uppercase tracking-widest font-bold text-studio-gray hover:text-white transition-colors py-2"
            >
              Skip Guide
            </button>
            <button 
              onClick={() => step < walkthroughSteps.length - 1 ? setWalkthroughStep(step + 1) : finishWalkthrough()}
              className="flex items-center gap-1 group text-[9.5px] uppercase tracking-widest font-extrabold bg-white text-black px-4 py-2.5 hover:bg-studio-gray transition-colors rounded-sm cursor-pointer"
            >
              <span>{step === walkthroughSteps.length - 1 ? 'Finish' : 'Next Step'}</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        {/* Pointer Triangle - Desktop Only */}
        {!isMobileOrStacked && pos.placement !== 'center' && (
          <div 
            className={`absolute w-3 h-3 bg-black transform rotate-45 border-white/20 ${
              pos.placement === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2 border-r border-t' : 
              pos.placement === 'bottom' ? 'left-1/2 -top-1.5 -translate-x-1/2 border-l border-t' :
              '-left-1.5 top-1/2 -translate-y-1/2 border-l border-b'
            }`}
          />
        )}
      </motion.div>
    );
  };

  const controlsRef = useRef<HTMLElement>(null);
  const visualizerRef = useRef<HTMLElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const estimatorRef = useRef<HTMLDivElement>(null);

  const getTargetRef = () => {
    switch (walkthroughSteps[walkthroughStep || 0].target) {
      case 'controls': return controlsRef;
      case 'visualizer': return visualizerRef;
      case 'data': return dataRef;
      case 'actions': return actionsRef;
      case 'estimator': return estimatorRef;
      case 'estimator-materials': return null;
      default: return controlsRef;
    }
  };

  const IconComponent = ICON_MAP[profileIcon] || Compass;

  return (
    <div className="relative min-h-screen bg-studio-white p-6 md:p-12 lg:p-20 flex flex-col gap-12 max-w-6xl mx-auto">
      {/* Walkthrough Overlay Container */}
      <AnimatePresence>
        {walkthroughStep !== null && (
          <div className="fixed inset-0 z-[100] pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            />
            <Callout step={walkthroughStep} targetRef={getTargetRef()} />
          </div>
        )}
      </AnimatePresence>

      {/* Collapsible Architectural Side Panel Menu */}
      <AnimatePresence>
        {isSidePanelOpen && (
          <>
            {/* Backdrop Dark Tint */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidePanelOpen(false)}
              className="fixed inset-0 bg-black z-[120] cursor-pointer"
            />

            {/* Side Panel Drawer */}
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] bg-studio-white border-l-2 border-black z-[130] p-6 flex flex-col justify-between shadow-[-10px_0_30px_rgba(0,0,0,0.15)] overflow-y-auto font-sans text-black"
            >
              <div className="flex flex-col gap-8">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b-2 border-dashed border-black pb-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.3em] font-extrabold text-studio-gray leading-none mb-1">PORTFOLIO INDEX</span>
                    <h3 className="text-lg font-light uppercase tracking-tighter text-black leading-none">Studio Director</h3>
                  </div>
                  <button 
                    onClick={() => setIsSidePanelOpen(false)}
                    className="p-2 border border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-1 active:translate-y-1 bg-white cursor-pointer flex items-center justify-center font-bold"
                    title="Close Navigator"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Profile Personalizer Section */}
                <div className="flex flex-col gap-3 py-2">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-studio-gray border-b border-studio-border pb-1.5 mb-1 block">
                    Spatial Identity
                  </span>
                  
                  <div className="flex gap-4 items-center animate-fade-in">
                    {/* Active profile icon frame */}
                    <div 
                      onClick={() => setIsPickerOpen(!isPickerOpen)}
                      className="w-16 h-16 border-2 border-black flex items-center justify-center bg-white cursor-pointer select-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group shrink-0 relative"
                      title="Adjust Spatial profile avatar"
                    >
                      <IconComponent size={34} className="stroke-[1.3] text-black group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-studio-gray">Active Resident</span>
                      <span className="font-mono text-sm truncate text-black font-extrabold max-w-full leading-snug" title={user?.email || 'Guest'}>
                        {user?.email || 'Guest'}
                      </span>
                      <button 
                        onClick={() => setIsPickerOpen(!isPickerOpen)}
                        className="text-[9px] uppercase tracking-wider font-extrabold text-left underline hover:text-studio-gray transition-colors mt-1 hover:no-underline cursor-pointer"
                      >
                        {isPickerOpen ? 'Hide Picker' : 'Choose Spatial Icon'}
                      </button>
                    </div>
                  </div>

                  {/* Icon Selection Gallery */}
                  <AnimatePresence>
                    {isPickerOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50 border border-black p-4 mt-2 shadow-inner"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] uppercase tracking-widest font-extrabold text-studio-gray">
                            Architectural Icon Base
                          </span>
                          <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-black/5 text-studio-gray text-[8px] tracking-widest">
                            {ARCHITECTURAL_ICONS.length} PRESETS
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                          {ARCHITECTURAL_ICONS.map((cur) => {
                            const CurComponent = cur.icon;
                            const isSelected = profileIcon === cur.id;
                            return (
                              <button
                                key={cur.id}
                                onClick={async () => {
                                  setProfileIcon(cur.id);
                                  await saveSelectedIcon(cur.id);
                                }}
                                className={`p-2.5 border-2 flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer ${
                                  isSelected 
                                    ? 'bg-black text-white border-black' 
                                    : 'bg-white text-black border-studio-border hover:border-black'
                                }`}
                                title={`${cur.label} - ${cur.desc}`}
                              >
                                <CurComponent size={18} className="stroke-[1.3] group-hover:scale-110 transition-transform animate-scale-up" />
                                <span className="text-[8px] uppercase font-bold tracking-tighter truncate w-full text-center mt-0.5">
                                  {cur.id}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[8px] leading-relaxed text-studio-gray/80 mt-3 uppercase tracking-wider text-center font-mono py-1 border-t border-black/5">
                          Click to set profile avatar & sync database profile.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Spatial Mode Navigator */}
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-studio-gray border-b border-studio-border pb-1.5 block">
                    Mode Navigator
                  </span>
                  
                  <div className="flex flex-col gap-3">
                    {/* Calculator mode button */}
                    <NavRow 
                      number="01" 
                      label="Human Calculator" 
                      desc="Core Volume & Section Tool" 
                      active={view === 'calculator'} 
                      icon={<Calculator size={18} />}
                      onClick={() => {
                        setView('calculator');
                        setIsSidePanelOpen(false);
                      }} 
                    />

                    {/* Studio mode button */}
                    <NavRow 
                      number="02" 
                      label="Architectural Studio" 
                      desc="Furnished spatial 3D workshops" 
                      active={view === 'studio'} 
                      icon={<Maximize2 size={18} />}
                      onClick={() => {
                        setView('studio');
                        setIsSidePanelOpen(false);
                      }} 
                    />

                     {/* History archive mode button */}
                    <NavRow 
                      number="03" 
                      label="Spatial Scale Logs" 
                      desc="History of saved calculation sheets" 
                      active={view === 'history'} 
                      icon={<HistoryIcon size={18} />}
                      onClick={() => {
                        setView('history');
                        setIsSidePanelOpen(false);
                      }} 
                    />

                    {/* Memorandum and Articles button */}
                    <NavRow 
                      number="04" 
                      label="Charter & Articles" 
                      desc="Memorandum & Corporate Constitution" 
                      active={view === 'legal'} 
                      icon={<FileText size={18} />}
                      onClick={() => {
                        setView('legal');
                        setIsSidePanelOpen(false);
                      }} 
                    />

                    {/* Admin Dashboard mode button (only visible to super admin oyesinaoyerinde@gmail.com) */}
                    {user?.email === 'oyesinaoyerinde@gmail.com' && (
                      <NavRow 
                        number="05" 
                        label="Admin Diagnostics" 
                        desc="Database telemetry & users log" 
                        active={view === 'admin'} 
                        icon={<Shield size={18} />}
                        onClick={() => {
                          setView('admin');
                          setIsSidePanelOpen(false);
                        }} 
                      />
                    )}
                  </div>
                </div>

                {/* System Guided Tour trigger */}
                {view === 'calculator' && (
                  <button
                    onClick={() => {
                      setIsSidePanelOpen(false);
                      startWalkthrough();
                    }}
                    className="flex items-center justify-between border-2 border-dashed border-black hover:border-solid hover:bg-black/5 p-3 text-left transition-all mt-2 cursor-pointer group"
                    title="Initialize Walkthrough Guide"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle size={18} className="text-black stroke-[1.5]" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-black">Start Visual Guide</span>
                        <span className="text-[8px] uppercase tracking-tight text-studio-gray mt-0.5">Interactive Tour overlay</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex flex-col gap-4 mt-8 pt-4 border-t border-studio-border">
                <button 
                  onClick={() => {
                    setIsSidePanelOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 border-2 border-black bg-red-50 text-red-950 py-3 uppercase text-[10px] tracking-widest font-extrabold hover:bg-red-900 hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                  title="Secure logout session"
                >
                  <LogOut size={14} />
                  <span>Terminate Session [Esc]</span>
                </button>

                <div className="flex justify-between items-center text-[7.5px] uppercase font-mono text-studio-gray leading-relaxed">
                  <span>GEEPEE STUDIO V1.0</span>
                  <span>SHEET REF [DWR_03]</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-black pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="z-10">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-studio-gray block mb-1">
            GEEPEE STUDIO SCALE TOOLS
          </span>
          <h1 className="text-3xl md:text-4xl font-light tracking-tighter uppercase mb-2">
            The Human Scale Reality Check
          </h1>
          <p className="text-studio-gray text-[10px] uppercase tracking-widest font-medium">
            Architectural Volume & Proportion Tool / v1.0
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-studio-gray mb-1">Scale Specialist</span>
            <span className="font-mono text-xs truncate max-w-[150px] font-semibold text-black">{user?.email || 'Guest'}</span>
          </div>
          
          <div 
            ref={actionsRef}
            className={`flex items-center gap-2 px-1 py-1 bg-white border border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all ${
              walkthroughStep === 0 ? 'ring-2 ring-black ring-offset-4 z-[101]' : ''
            }`}
          >
            {/* Ellipsis trigger */}
            <button 
              onClick={() => setIsSidePanelOpen(true)}
              className="p-2 text-black hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer"
              title="Open Scale Studio Menu (Ellipsis)"
            >
              <MoreVertical size={18} />
            </button>
            <div className="w-[1.5px] h-5 bg-black/15 self-center" />
            {/* User Profile Avatar trigger */}
            <button 
              onClick={() => setIsSidePanelOpen(true)}
              className="p-1 px-2 flex items-center gap-2 text-black hover:bg-gray-100 transition-colors cursor-pointer group"
              title="Open Profile Settings & Tool Navigator"
            >
              <div className="w-8 h-8 rounded bg-black/5 hover:bg-black/10 flex items-center justify-center border border-black/10 transition-colors">
                <IconComponent size={18} className="stroke-[1.5] text-black group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none hidden sm:inline select-none">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {view === 'calculator' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* 1. Visualizer Block (Spans full 12 columns for a larger workspace canvas) */}
            <section 
              ref={visualizerRef} 
              className={`lg:col-span-12 flex flex-col gap-4 transition-opacity duration-300 ${
                walkthroughStep !== null && walkthroughStep !== 2 ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <div className={`relative aspect-video lg:aspect-[21/9] bg-white border border-black flex flex-col ${
                walkthroughStep === 2 ? 'ring-2 ring-black ring-offset-4' : ''
              }`}>
                <div className="flex items-center justify-between border-b border-black p-2 bg-gray-50/50 relative">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-black" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-studio-gray">
                      {is3D ? 'Volumetric Perspective' : 'Space Section (Front Facing)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Export Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="flex items-center gap-1.5 border border-black px-3 py-1 text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all bg-white cursor-pointer"
                        title="Export blueprint specifications and models"
                      >
                        <Download size={12} />
                        <span>Export Grid</span>
                      </button>

                      <AnimatePresence>
                        {showExportDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute right-0 mt-2 w-64 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-50 flex flex-col font-mono text-[9px] text-black"
                          >
                            <div className="bg-gray-100 border-b border-black p-2.5 font-bold text-studio-gray text-[8px] uppercase tracking-wider">
                              2D Drafting formats
                            </div>
                            <button 
                              onClick={handleExportSVG}
                              className="px-3.5 py-2.5 text-left hover:bg-zinc-100 border-b border-black last:border-0 transition-colors uppercase cursor-pointer flex items-center justify-between"
                            >
                              <span>1. Vector Blueprint (.SVG)</span>
                              <span className="text-[7.5px] bg-emerald-100 text-emerald-800 px-1 py-0.5 font-bold">Standard</span>
                            </button>
                            <button 
                              onClick={handleExportDXF}
                              className="px-3.5 py-2.5 text-left hover:bg-zinc-100 border-b border-black last:border-0 transition-colors uppercase cursor-pointer flex items-center justify-between"
                            >
                              <span>2. AutoCAD Draft (.DXF)</span>
                              <span className="text-[7.5px] bg-sky-100 text-sky-800 px-1 py-0.5 font-bold">CAD Line</span>
                            </button>
                            <button 
                              onClick={handleExportPNG}
                              className="px-3.5 py-2.5 text-left hover:bg-zinc-100 border-b border-black last:border-0 transition-colors uppercase cursor-pointer flex items-center justify-between"
                            >
                              <span>3. Raster Image (.PNG)</span>
                              <span className="text-[7.5px] bg-purple-100 text-purple-800 px-1 py-0.5 font-bold">Render</span>
                            </button>

                            <div className="bg-gray-100 border-t border-b border-black p-2.5 font-bold text-studio-gray text-[8px] uppercase tracking-wider">
                              3D Modeling formats
                            </div>
                            <button 
                              onClick={handleExportOBJ}
                              className="px-3.5 py-2.5 text-left hover:bg-zinc-100 border-b border-black last:border-0 transition-colors uppercase cursor-pointer flex items-center justify-between"
                            >
                              <span>4. Wavefront Mesh (.OBJ)</span>
                              <span className="text-[7.5px] bg-neutral-100 text-neutral-800 px-1 py-0.5 font-bold">Polygons</span>
                            </button>
                            <button 
                              onClick={handleExportSTL}
                              className="px-3.5 py-2.5 text-left hover:bg-zinc-100 border-b border-black last:border-0 transition-colors uppercase cursor-pointer flex items-center justify-between"
                            >
                              <span>5. 3D Print Mesh (.STL)</span>
                              <span className="text-[7.5px] bg-orange-100 text-orange-800 px-1 py-0.5 font-bold">Slicer</span>
                            </button>

                            <div className="bg-gray-100 border-t border-b border-black p-2.5 font-bold text-studio-gray text-[8px] uppercase tracking-wider">
                              Specifications
                            </div>
                            <button 
                              onClick={handleExportJSON}
                              className="px-3.5 py-2.5 text-left hover:bg-zinc-100 transition-colors uppercase cursor-pointer flex items-center justify-between"
                            >
                              <span>6. Architectural Specs (.JSON)</span>
                              <span className="text-[7.5px] bg-yellow-100 text-yellow-800 px-1 py-0.5 font-bold">Data</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      onClick={() => setIs3D(!is3D)}
                      className="flex items-center gap-2 border border-black px-3 py-1 text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all bg-white cursor-pointer"
                    >
                      {is3D ? <><Square size={12} /> View Section</> : <><Box size={12} /> View 3D</>}
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative flex items-end justify-center p-8 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                  <AnimatePresence mode="wait">
                    {!is3D ? (
                      <motion.div 
                        key="2d"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex items-end justify-center relative select-none"
                      >
                        {/* Interactive Zoom Map Overlay */}
                        <div className="absolute top-2 left-2 z-30 flex items-center gap-2 bg-white/95 border border-black p-1.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-mono text-[9px] text-black">
                          <button 
                            onClick={() => setAutoZoom(!autoZoom)}
                            className={`px-2 py-0.5 border border-black text-[8px] font-bold uppercase transition-colors ${
                              autoZoom ? 'bg-black text-white hover:bg-neutral-800' : 'bg-white hover:bg-gray-100 text-black'
                            }`}
                            title="Automatically zoom/fit current dimensions into on-screen canvas"
                          >
                            Auto-Fit
                          </button>
                          
                          <div className="h-3 w-[1.5px] bg-black/15" />
                          
                          <button
                            onClick={() => {
                              setAutoZoom(false);
                              setZoom2D(prev => Math.max(0.2, parseFloat((prev - 0.1).toFixed(1))));
                            }}
                            className="w-4 h-4 flex items-center justify-center border border-black bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors font-bold text-[10px]"
                            title="Zoom Out"
                          >
                            -
                          </button>
                          
                          <span className="min-w-[32px] text-center font-bold text-[8px]">
                            {Math.round(zoom2D * 100)}%
                          </span>
                          
                          <button
                            onClick={() => {
                              setAutoZoom(false);
                              setZoom2D(prev => Math.min(3.0, parseFloat((prev + 0.1).toFixed(1))));
                            }}
                            className="w-4 h-4 flex items-center justify-center border border-black bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors font-bold text-[10px]"
                            title="Zoom In"
                          >
                            +
                          </button>

                          <button
                            onClick={() => {
                              setZoom2D(1.0);
                              setAutoZoom(true);
                            }}
                            className="px-1.5 py-0.5 border border-black bg-white hover:bg-gray-100 text-[8px] font-bold uppercase transition-colors"
                            title="Reset zoom variables"
                          >
                            Reset
                          </button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-studio-border z-0" />
                        
                        <motion.div 
                          className="relative border border-black bg-white/50 z-10 flex items-end justify-center"
                          initial={false}
                          animate={getRoom2DDimensions()}
                          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                        >
                          <div className="absolute top-2 right-2 flex flex-col text-[10px] text-studio-gray font-mono uppercase text-right leading-tight">
                            <span>{width}m w</span>
                            <span>{height}m h</span>
                          </div>

                          <div 
                            className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center"
                            style={{ height: `${(HUMAN_HEIGHT / height) * 100}%` }}
                          >
                            <HumanSilhouette className="h-full w-auto text-black transition-all" />
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="3d"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                      >
                        <Room3D width={width} depth={depth} height={height} humanHeight={HUMAN_HEIGHT} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* 2. Controls, Volumetric Data & Actions Block (Left Column) */}
            <div className="lg:col-span-8 flex flex-col gap-6 justify-between">
              {/* Sliders/Text Controls */}
              <section 
                ref={controlsRef} 
                className={`transition-opacity duration-300 ${
                  walkthroughStep !== null && walkthroughStep !== 1 ? 'opacity-30' : 'opacity-100'
                }`}
              >
                <div className={`flex flex-col gap-6 bg-white border border-black p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] ${
                  walkthroughStep === 1 ? 'ring-2 ring-black ring-offset-8' : ''
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ControlGroup label="Width" value={width} min={1} max={30} step={0.1} onChange={setWidth} unit="m" />
                    <ControlGroup label="Depth" value={depth} min={1} max={30} step={0.1} onChange={setDepth} unit="m" />
                    <ControlGroup label="Height" value={height} min={1.5} max={30} step={0.1} onChange={setHeight} unit="m" />
                  </div>
                </div>
              </section>

              {/* Volumetric Data Strip (Placed directly under the controls card as a horizontal strip) */}
              <div 
                ref={dataRef} 
                className={`bg-white border border-black p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-300 ${
                  walkthroughStep !== null && walkthroughStep !== 3 ? 'opacity-30' : 'opacity-100'
                } ${walkthroughStep === 3 ? 'ring-2 ring-black ring-offset-8' : ''}`}
              >
                <DataPoint label="Floor Area" value={area.toFixed(2)} unit="m²" />
                <DataPoint label="Volume" value={volume.toFixed(2)} unit="m³" />
                <DataPoint 
                  label="Human Ratio" 
                  value={`${humanRatio}x`} 
                  unit="pers." 
                  hint={`Ceiling is ${humanRatio} times human height`}
                />
              </div>

              {/* Lower Section (Architectural Quote on the left, Save Button on the right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="border border-black p-5 flex flex-col justify-center bg-white/50 shadow-[4px_4px_0_0_rgba(0,0,0,1)] h-full">
                  <p className="text-[10px] text-studio-gray uppercase leading-normal italic font-mono">
                    {currentQuote}
                  </p>
                </div>

                <div className="h-full">
                  <button 
                    onClick={saveCheck}
                    disabled={saving}
                    className="w-full h-full min-h-[64px] flex items-center justify-center gap-2 border-2 border-black py-4 bg-black text-white uppercase text-[10.5px] tracking-widest font-extrabold hover:bg-studio-gray hover:border-studio-gray transition-all shadow-[4px_4px_0_0_rgba(200,200,200,1)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer active:translate-y-[1.5px] active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : <><Save size={14} /> Save Calculation</>}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Vibe Box (Right Column) - Stretches to match left side height */}
            <div className="lg:col-span-4 flex">
              <div className="w-full h-full bg-white border border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-between gap-6 min-h-[300px] lg:min-h-0">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-studio-gray block mb-3 font-mono">
                    Spatial Atmosphere Vibe
                  </span>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tighter text-black leading-none break-words">
                      {vibe.label}
                    </span>
                    <span className="h-2.5 w-2.5 bg-black rounded-full mb-1 inline-block shrink-0" />
                  </div>
                  <p className="text-sm text-studio-gray leading-relaxed font-normal">
                    {vibe.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-dashed border-black/15 flex justify-between items-center text-[9px] uppercase font-mono text-studio-gray/80">
                  <span>SCALE PROFILE</span>
                  <span>GEEPEE BLUEPRINT v1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investor-Appealing Procurement & Real-Time Cost Estimator */}
          <div 
            ref={estimatorRef} 
            className={`mt-8 transition-all duration-300 ${
              walkthroughStep !== null && walkthroughStep !== 4 && walkthroughStep !== 5 ? 'opacity-30 scale-[0.99] blur-[0.2px]' : 'opacity-100 scale-100'
            } ${walkthroughStep === 5 ? 'ring-2 ring-black ring-offset-8 z-[101]' : ''}`}
          >
            <ProcurementEstimator width={width} depth={depth} height={height} />
          </div>
          </>
        ) : view === 'history' ? (
          <HistoryView onBack={() => setView('calculator')} />
        ) : view === 'legal' ? (
          <LegalCharterView userEmail={user?.email || undefined} onBack={() => setView('calculator')} />
        ) : view === 'admin' ? (
          <AdminDashboard onBack={() => setView('calculator')} />
        ) : (
          <RoomStudio 
            initialWidth={width} 
            initialDepth={depth} 
            initialHeight={height} 
            onBack={() => setView('calculator')} 
          />
        )}
      </main>

      <footer className="mt-auto border-t border-studio-border pt-8 flex justify-between items-center text-[10px] uppercase tracking-widest text-studio-gray">
        <span>© 2026 Human Scale Reality Check / Sheet 00</span>
        <span>GEEPEE STUDIO</span>
      </footer>
    </div>
  );
}

function ControlGroup({ label, value, min, max, step, onChange, unit }: any) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputValue(rawVal);
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      parsed = value;
    } else if (parsed < min) {
      parsed = min;
    } else if (parsed > max) {
      parsed = max;
    }
    onChange(parsed);
    setInputValue(parsed.toString());
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] uppercase font-bold tracking-widest text-studio-gray">{label}</label>
        <div className="flex items-center gap-1.5">
          <input 
            type="number" 
            min={min} 
            max={max} 
            step={step} 
            value={inputValue} 
            onChange={handleInputChange} 
            onBlur={handleBlur}
            className="w-16 text-right px-2 py-0.5 border border-black text-xs font-mono bg-stone-50 focus:bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[10px] uppercase text-studio-gray font-mono">{unit}</span>
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
        className="w-full accent-black cursor-pointer" 
      />
    </div>
  );
}

function DataPoint({ label, value, unit, hint }: any) {
  return (
    <div className="flex justify-between items-center group relative cursor-help">
      <span className="text-[11px] uppercase font-medium tracking-tight border-b border-dotted border-studio-border">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-xl tabular-nums tracking-tighter">{value}</span>
        <span className="text-[10px] font-bold text-studio-gray lowercase">{unit}</span>
      </div>
      {hint && (
        <div className="absolute left-0 -top-10 bg-black text-white p-2 text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {hint}
        </div>
      )}
    </div>
  );
}

function HumanSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 240" className={className} fill="currentColor">
      <circle cx="50" cy="25" r="20" />
      <path d="M30 50 L70 50 L75 140 L25 140 Z" />
      <rect x="30" y="145" width="16" height="90" />
      <rect x="54" y="145" width="16" height="90" />
      <rect x="18" y="55" width="10" height="80" rx="5" />
      <rect x="72" y="55" width="10" height="80" rx="5" />
    </svg>
  );
}
