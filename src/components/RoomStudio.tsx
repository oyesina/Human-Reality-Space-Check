/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Maximize2, Bed, Bath, ChefHat, Sofa, Info, Play, Pause, Save, Trash2, ChevronRight, X, HelpCircle, Download } from 'lucide-react';
import Room3D from './Room3D';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { 
  generateOBJ, generateSTL, generateSVG, generateDXF, generateJSON, 
  triggerFileDownload, downloadPNGFromSVG, ExportData 
} from '../lib/exportUtils';

const getStudioVibe = (width: number, depth: number, height: number) => {
  const minSide = Math.min(width, depth);
  const ratio = height / minSide;

  if (height < 2.1) {
    return { 
      label: "Oppressive", 
      description: "Extremely low ceiling. Lacks clearance for standard human habitability." 
    };
  }
  if (minSide < 2.0 && ratio > 2.0) {
    return { 
      label: "Chasm Shaft", 
      description: "Extremely narrow and towering vertical chamber." 
    };
  }
  if (ratio > 1.8) {
    return { 
      label: "Monumental", 
      description: "Grand vertical clearance. Evokes historical, civic, or cathedral-like scale." 
    };
  }
  if (ratio > 1.2) {
    return { 
      label: "Aloft / Lofted", 
      description: "Spacious breathing room with high clearances, well-structured loft volume." 
    };
  }
  if (ratio >= 0.8 && ratio <= 1.2) {
    return { 
      label: "Orthodox / Balanced", 
      description: "Golden proportions. Ideal domestic comfort and physical ergonomics." 
    };
  }
  return { 
    label: "Sprawling Section", 
    description: "Low-slung layout with high horizontal expansion. Evokes prairie-style school layout." 
  };
};

interface RoomStudioProps {
  initialWidth: number;
  initialDepth: number;
  initialHeight: number;
  onBack: () => void;
}

type RoomType = 'none' | 'bedroom' | 'toilet' | 'kitchen' | 'lounge';

interface SavedStudio {
  id: string;
  userId: string;
  width: number;
  depth: number;
  height: number;
  roomType: RoomType;
  name: string;
  createdAt: any;
}

export default function RoomStudio({ initialWidth, initialDepth, initialHeight, onBack }: RoomStudioProps) {
  const { user } = useAuth();
  const [width, setWidth] = useState(initialWidth);
  const [depth, setDepth] = useState(initialDepth);
  const [height, setHeight] = useState(initialHeight);
  const [roomType, setRoomType] = useState<RoomType>('none');
  const [showMeta, setShowMeta] = useState(true);

  // Studio Save & Playback / Tour States
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedStudios, setSavedStudios] = useState<SavedStudio[]>([]);
  const [loadingSaves, setLoadingSaves] = useState(true);
  const [isTouring, setIsTouring] = useState(false);

  // Walkthrough Tour States
  const [walkthroughStep, setWalkthroughStep] = useState<number | null>(null);

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<'presets' | 'dimensions' | 'saves'>('presets');
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const getExportParams = (): ExportData => {
    const vibe = getStudioVibe(width, depth, height);
    return {
      width,
      depth,
      height,
      roomType,
      area: width * depth,
      volume: width * depth * height,
      vibeLabel: vibe.label,
      vibeDescription: vibe.description
    };
  };

  const handleExportSVG = () => {
    const raw = generateSVG(getExportParams());
    triggerFileDownload(raw, `geepee_studio_${width}x${depth}x${height}.svg`, 'image/svg+xml');
    setShowExportDropdown(false);
  };

  const handleExportDXF = () => {
    const raw = generateDXF(getExportParams());
    triggerFileDownload(raw, `geepee_studio_${width}x${depth}x${height}.dxf`, 'text/plain');
    setShowExportDropdown(false);
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      try {
        const dataURL = canvas.toDataURL('image/png');
        triggerFileDownload(dataURL, `geepee_studio_3d_${width}x${depth}x${height}.png`, 'image/png');
      } catch (err) {
        console.error("ThreeJS snapshot capture failed:", err);
        const raw = generateSVG(getExportParams());
        downloadPNGFromSVG(raw, `geepee_studio_${width}x${depth}x${height}.png`);
      }
    } else {
      const raw = generateSVG(getExportParams());
      downloadPNGFromSVG(raw, `geepee_studio_${width}x${depth}x${height}.png`);
    }
    setShowExportDropdown(false);
  };

  const handleExportOBJ = () => {
    const raw = generateOBJ(getExportParams());
    triggerFileDownload(raw, `geepee_studio_${width}x${depth}x${height}.obj`, 'text/plain');
    setShowExportDropdown(false);
  };

  const handleExportSTL = () => {
    const raw = generateSTL(getExportParams());
    triggerFileDownload(raw, `geepee_studio_${width}x${depth}x${height}.stl`, 'text/plain');
    setShowExportDropdown(false);
  };

  const handleExportJSON = () => {
    const raw = generateJSON(getExportParams());
    triggerFileDownload(raw, `geepee_studio_${width}x${depth}x${height}.json`, 'application/json');
    setShowExportDropdown(false);
  };

  const headerRef = useRef<HTMLElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);
  const dimensionsRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const saveFormRef = useRef<HTMLDivElement>(null);

  const walkthroughSteps = [
    {
      title: "Interactive Studio",
      desc: "Welcome to the Architectural Studio! This space lets you explore physical layouts, place furniture assets, and observe spatial layouts relative to human scale.",
      target: "studioHeader"
    },
    {
      title: "Spatial Layout Presets",
      desc: "Instantly furnish the room with Bedroom, Lounge, Kitchen, or Sanitary Toilet configurations. Note how our resident scale figure stands beside each object to safeguard circulation paths.",
      target: "roomPresets"
    },
    {
      title: "Material Dimensions",
      desc: "Overrule the defaults with precise sliding dimensions. Watch the bounding walls, custom materials, and furniture units scale in real-time.",
      target: "dimensionSliders"
    },
    {
      title: "Orbital Playback Tour",
      desc: "Examine your workspace configurations from a 360-degree rotational view. Great for displaying structural proposals to investors.",
      target: "orbitTour"
    },
    {
      title: "Studio Saves Archive",
      desc: "Commit your designed studio structures with an identifier. Your designs are synchronized directly with your remote Cloud Firestore portfolio database.",
      target: "savesArchive"
    }
  ];

  const getTargetRef = () => {
    switch (walkthroughSteps[walkthroughStep || 0].target) {
      case 'studioHeader': return headerRef;
      case 'roomPresets': return presetsRef;
      case 'dimensionSliders': return dimensionsRef;
      case 'orbitTour': return orbitRef;
      case 'savesArchive': return saveFormRef;
      default: return headerRef;
    }
  };

  const finishWalkthrough = () => {
    if (user) {
      localStorage.setItem(`walkthrough_studio_seen_${user.uid}`, 'true');
    }
    setWalkthroughStep(null);
  };

  const startWalkthrough = () => {
    setShowMeta(true);
    setWalkthroughStep(0);
  };

  // Auto start Studio Walkthrough guide on first visit
  useEffect(() => {
    if (!user) return;
    const hasSeenStudioWalkthrough = localStorage.getItem(`walkthrough_studio_seen_${user.uid}`);
    if (!hasSeenStudioWalkthrough) {
      const timer = setTimeout(() => {
        setWalkthroughStep(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Set automatic tab based on active walkthrough step to ensure mobile targets are visible
  useEffect(() => {
    if (walkthroughStep === 1) {
      setActiveTab('presets');
    } else if (walkthroughStep === 2) {
      setActiveTab('dimensions');
    } else if (walkthroughStep === 3 || walkthroughStep === 4) {
      setActiveTab('saves');
    }
  }, [walkthroughStep]);

  const Callout = ({ step, targetRef }: { step: number; targetRef: any }) => {
    const [pos, setPos] = useState({ top: 120, left: 300, placement: 'center' });
    const [isMobileOrStacked, setIsMobileOrStacked] = useState(false);
    const currentStep = walkthroughSteps[step];

    useEffect(() => {
      const handleResize = () => {
        setIsMobileOrStacked(window.innerWidth < 1150);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
      const updatePosition = () => {
        if (isMobileOrStacked) {
          // On mobile, tablet, and compact preview windows, center-dock the guide at the bottom
          setPos({ top: 0, left: 0, placement: 'mobile-bottom' });
          return;
        }

        if (targetRef && targetRef.current) {
          const rect = targetRef.current.getBoundingClientRect();
          
          // Desk layout desktop placements
          let rawTop = 120;
          let rawLeft = 300;
          let placement = 'center';

          if (currentStep.target === 'studioHeader') {
            rawTop = rect.bottom + 15;
            rawLeft = rect.left + 120;
            placement = 'bottom';
          } else if (currentStep.target === 'roomPresets') {
            rawTop = rect.top - 15;
            rawLeft = rect.left + rect.width / 2;
            placement = 'top';
          } else if (currentStep.target === 'dimensionSliders') {
            rawTop = rect.top - 15;
            rawLeft = rect.left + rect.width / 2;
            placement = 'top';
          } else if (currentStep.target === 'orbitTour') {
            rawTop = rect.top - 15;
            rawLeft = rect.left + rect.width / 2;
            placement = 'top';
          } else if (currentStep.target === 'savesArchive') {
            rawTop = rect.top - 15;
            rawLeft = rect.left + rect.width / 2;
            placement = 'top';
          } else {
            rawTop = rect.top - 15;
            rawLeft = rect.left + rect.width / 2;
            placement = 'top';
          }

          // Apply robust safety clamping to prevent rendering anything off-screen
          const CALLOUT_WIDTH = 320;
          const CALLOUT_HEIGHT = 240;
          const screenW = window.innerWidth;
          const screenH = window.innerHeight;

          let clampedTop = rawTop;
          let clampedLeft = rawLeft;

          if (placement === 'bottom') {
            clampedTop = Math.max(70, Math.min(rawTop, screenH - CALLOUT_HEIGHT - 16));
            clampedLeft = Math.max(CALLOUT_WIDTH / 2 + 16, Math.min(rawLeft, screenW - CALLOUT_WIDTH / 2 - 16));
          } else if (placement === 'top') {
            clampedTop = Math.max(CALLOUT_HEIGHT + 70, Math.min(rawTop, screenH - 16));
            clampedLeft = Math.max(CALLOUT_WIDTH / 2 + 16, Math.min(rawLeft, screenW - CALLOUT_WIDTH / 2 - 16));
          } else if (placement === 'left') {
            clampedTop = Math.max(CALLOUT_HEIGHT / 2 + 70, Math.min(rawTop, screenH - CALLOUT_HEIGHT / 2 - 16));
            clampedLeft = Math.max(CALLOUT_WIDTH + 16, Math.min(rawLeft, screenW - 16));
          }

          setPos({ top: clampedTop, left: clampedLeft, placement });
        } else {
          setPos({ top: window.innerHeight / 2, left: window.innerWidth / 2, placement: 'center' });
        }
      };

      updatePosition();
      const frameId = requestAnimationFrame(updatePosition);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, { passive: true });
      return () => {
        cancelAnimationFrame(frameId);
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
          zIndex: 160,
        }
      : {
          position: 'fixed' as const,
          top: pos.top,
          left: pos.left,
          zIndex: 160,
          transform: pos.placement === 'center' ? 'translate(-50%, -50%)' : pos.placement === 'top' ? 'translate(-50%, -100%)' : pos.placement === 'bottom' ? 'translateX(-50%)' : 'translate(-100%, -55%)',
        };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: isMobileOrStacked ? 30 : 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: isMobileOrStacked ? 30 : 15 }}
        style={inlineStyles}
        className={`${
          isMobileOrStacked ? 'w-[calc(100vw-32px)]' : 'w-[290px] md:w-80'
        } bg-black text-white p-5 md:p-6 shadow-[0_15px_30px_rgba(0,0,0,0.35)] pointer-events-auto border border-white/15`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">Studio Tip {step + 1}/{walkthroughSteps.length}</span>
            <button onClick={finishWalkthrough} className="hover:text-gray-300 transition-colors font-mono text-xs cursor-pointer p-1">EXIT_</button>
          </div>
          <h4 className="text-sm font-bold uppercase tracking-tight">{currentStep.title}</h4>
          <p className="text-[11px] leading-relaxed text-gray-300">{currentStep.desc}</p>

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
              className="text-[9px] uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors cursor-pointer py-2"
            >
              Skip Guide
            </button>
            <button 
              onClick={() => step < walkthroughSteps.length - 1 ? setWalkthroughStep(step + 1) : finishWalkthrough()}
              className="flex items-center gap-1 group text-[9.5px] uppercase tracking-widest font-extrabold bg-white text-black px-4 py-2.5 hover:bg-zinc-200 transition-colors cursor-pointer rounded-sm"
            >
              <span>{step === walkthroughSteps.length - 1 ? 'Finish' : 'Next Step'}</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        {/* Pointer Triangle - Desktop Only */}
        {!isMobileOrStacked && pos.placement !== 'center' && (
          <div 
            className={`absolute w-3 h-3 bg-black transform rotate-45 border-white/15 ${
              pos.placement === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2 border-r border-t' : 
              pos.placement === 'bottom' ? 'left-1/2 -top-1.5 -translate-x-1/2 border-l border-t' :
              pos.placement === 'top' ? 'left-1/2 -bottom-1.5 -translate-x-1/2 border-r border-b' :
              '-left-1.5 top-1/2 -translate-y-1/2 border-l border-b'
            }`}
          />
        )}
      </motion.div>
    );
  };

  // Fetch Studio Saves specific to current user
  useEffect(() => {
    if (!user) {
      setLoadingSaves(false);
      return;
    }

    const q = query(
      collection(db, 'studio_saves'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedStudio[];
      setSavedStudios(data);
      setLoadingSaves(false);
    }, (error) => {
      console.error("Error fetching studio saves:", error);
      setLoadingSaves(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Save layout design
  const saveStudioDesign = async () => {
    if (!user) return;
    if (!saveName.trim()) {
      alert("Please provide a name for your studio design.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'studio_saves'), {
        userId: user.uid,
        name: saveName.trim(),
        width,
        depth,
        height,
        roomType,
        createdAt: serverTimestamp()
      });
      setSaveName('');
    } catch (error) {
      console.error("Error saving studio design:", error);
      alert("Failed to save. Check system status or rules.");
    } finally {
      setSaving(false);
    }
  };

  // Playback/load design
  const loadStudioSave = (item: SavedStudio) => {
    setWidth(item.width);
    setDepth(item.depth);
    setHeight(item.height);
    setRoomType(item.roomType);
  };

  // Delete saved layout
  const deleteStudioSave = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'studio_saves', id));
    } catch (error) {
      console.error("Error deleting studio save:", error);
    }
  };

  const roomOptions: { id: RoomType; label: string; icon: any; desc: string }[] = [
    { id: 'none', label: 'Empty', icon: Info, desc: 'Bare architectural shell' },
    { id: 'bedroom', label: 'Bedroom', icon: Bed, desc: 'Primary resting quarters' },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat, desc: 'Culinary workspace' },
    { id: 'lounge', label: 'Lounge', icon: Sofa, desc: 'Social and leisure zone' },
    { id: 'toilet', label: 'Toilet', icon: Bath, desc: 'Sanitary facility' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-studio-white flex flex-col">
      {/* Walkthrough Guide Backdrop Container */}
      <AnimatePresence>
        {walkthroughStep !== null && (
          <>
            {/* Dark blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] z-[140] pointer-events-none"
            />
            {/* Guide Interactive Content Box - Elevated above the z-[145] elements */}
            <div className="fixed inset-0 z-[150] pointer-events-none">
              <Callout step={walkthroughStep} targetRef={getTargetRef()} />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Absolute Header Overlay */}
      <header ref={headerRef} className={`absolute top-0 left-0 right-0 z-[145] p-3 sm:p-6 flex items-center justify-between pointer-events-none transition-all duration-300 ${
        walkthroughStep === 0 ? 'bg-white border-b border-black !pointer-events-auto p-4 sm:p-8 shadow-lg' : ''
      }`}>
        <div className="flex items-center gap-2 sm:gap-6 pointer-events-auto">
          <button 
            onClick={onBack}
            className="p-2 sm:p-3 border border-black bg-white hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
            title="Return to scale checker"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
          </button>
          <div className="flex flex-col bg-white/95 backdrop-blur-sm p-2 sm:p-3.5 border border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            <h1 className="text-sm sm:text-lg md:text-2xl font-black md:font-light uppercase tracking-tight md:tracking-tighter leading-none">Architectural Studio</h1>
            <span className="text-[8px] sm:text-[10px] uppercase tracking-wider md:tracking-[0.3em] font-bold text-studio-gray mt-1 font-mono">Sheet 03 / Studio Explore</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto bg-stone-50/50 p-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          {/* Start visual guide guide button explicitly */}
          <button 
            onClick={startWalkthrough}
            className="p-2 sm:p-3 border border-black bg-white hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_rgba(0,0,0,1)] cursor-pointer flex items-center gap-1.5"
            title="Initialize Studio Interactive Walkthrough Tour"
          >
            <HelpCircle size={16} className="sm:w-5 sm:h-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider hidden sm:inline">Guide</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="p-2 sm:p-3 border border-black bg-white hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_rgba(0,0,0,1)] cursor-pointer flex items-center gap-1.5"
              title="Export 3D model blueprint and spatial graphics"
            >
              <Download size={16} className="sm:w-5 sm:h-5" />
              <span className="text-[9px] uppercase font-bold tracking-wider hidden sm:inline">Export Model</span>
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
            onClick={() => setShowMeta(!showMeta)}
            className="p-2 sm:p-3 border border-black bg-white hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_rgba(0,0,0,1)] cursor-pointer"
            title="Toggle Dashboard Control Panel visibility"
          >
            <Maximize2 size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Main 3D Viewport */}
      <div className="flex-1 relative">
        <Room3D width={width} depth={depth} height={height} humanHeight={1.8} roomType={roomType} autoRotate={isTouring} />
      </div>

      {/* Bottom Controls Panel */}
      <AnimatePresence>
        {showMeta && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pb-6 pointer-events-none z-10"
          >
            <div className="max-w-7xl mx-auto pointer-events-auto">
              
              {/* Tab Selector on Mobile */}
              <div className="flex border-2 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-4 lg:hidden">
                <button 
                  onClick={() => setActiveTab('presets')}
                  className={`flex-1 py-3 text-center text-[10px] uppercase tracking-wider font-extrabold transition-colors cursor-pointer ${
                    activeTab === 'presets' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50/50'
                  }`}
                >
                  Layout
                </button>
                <button 
                  onClick={() => setActiveTab('dimensions')}
                  className={`flex-1 py-3 text-center text-[10px] uppercase tracking-wider font-extrabold transition-colors cursor-pointer ${
                    activeTab === 'dimensions' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50/50'
                  }`}
                >
                  Size
                </button>
                <button 
                  onClick={() => setActiveTab('saves')}
                  className={`flex-1 py-3 text-center text-[10px] uppercase tracking-wider font-extrabold transition-colors cursor-pointer ${
                    activeTab === 'saves' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50/50'
                  }`}
                >
                  Archive
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Preset Spatial Layouts & Dimensions overrides */}
                <div className={`lg:col-span-7 bg-white border border-black p-4 md:p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all duration-300 ${
                  walkthroughStep !== null && walkthroughStep !== 1 && walkthroughStep !== 2 
                    ? 'opacity-20 pointer-events-none scale-[0.98]' 
                    : 'opacity-100'
                } ${activeTab === 'saves' ? 'hidden lg:flex lg:flex-col lg:gap-5' : 'flex flex-col gap-5'}`}>
                  
                  {/* Furniture Layout presets */}
                  <div 
                    ref={presetsRef}
                    className={`transition-all duration-300 rounded ${
                      walkthroughStep === 1 ? 'ring-2 ring-black ring-offset-6 p-1 z-[145] bg-white shadow-xl' : ''
                    } ${activeTab !== 'presets' ? 'hidden lg:flex lg:flex-col lg:gap-3' : 'flex flex-col gap-3'}`}
                  >
                    <div className="flex items-center justify-between border-b border-studio-border pb-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-studio-gray">Preset Spatial Layouts</span>
                      <span className="text-[10px] uppercase font-mono">{roomType.toUpperCase()} RESOLVED</span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {roomOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setRoomType(opt.id)}
                          className={`flex flex-col items-center justify-center p-2.5 border transition-all cursor-pointer ${
                            roomType === opt.id 
                              ? 'bg-black text-white border-black shadow-[4px_4px_0_0_rgba(200,200,200,1)]' 
                              : 'bg-white text-black border-studio-border hover:border-black'
                          }`}
                        >
                          <opt.icon size={20} strokeWidth={roomType === opt.id ? 2.5 : 1.5} />
                          <span className="text-[9px] uppercase font-bold tracking-tight mt-1">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Overrides */}
                  <div 
                    ref={dimensionsRef}
                    className={`transition-all duration-300 rounded ${
                      walkthroughStep === 2 ? 'ring-2 ring-black ring-offset-6 p-1 z-[145] bg-white shadow-xl' : ''
                    } ${activeTab !== 'dimensions' ? 'hidden lg:flex lg:flex-col lg:gap-3' : 'flex flex-col gap-3'}`}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-bold text-studio-gray border-b border-studio-border pb-1.5">Continuous Overrides</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <DimensionControl label="W" val={width} set={setWidth} color="bg-red-500" />
                      <DimensionControl label="D" val={depth} set={setDepth} color="bg-blue-500" />
                      <DimensionControl label="H" val={height} set={setHeight} color="bg-green-500" />
                    </div>
                  </div>

                </div>

                {/* Right Column: Studio Presets Playback & Saves */}
                <div className={`lg:col-span-12 xl:col-span-5 bg-white border border-black p-4 md:p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all duration-300 ${
                  walkthroughStep !== null && walkthroughStep !== 3 && walkthroughStep !== 4 
                    ? 'opacity-20 pointer-events-none scale-[0.98]' 
                    : 'opacity-100'
                } ${activeTab !== 'saves' ? 'hidden lg:flex lg:flex-col lg:gap-4 lg:col-span-5' : 'flex flex-col gap-4 lg:col-span-5'}`}>
                  
                  <div 
                    ref={orbitRef}
                    className={`flex items-center justify-between border-b border-studio-border pb-2 transition-all duration-300 rounded ${
                      walkthroughStep === 3 ? 'ring-2 ring-black ring-offset-8 p-1.5 z-[145] bg-white shadow-xl' : ''
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-bold text-studio-gray">Studio Presets Archive</span>
                    
                    {/* Orbit Playback / Tour Toggle */}
                    <button
                      onClick={() => setIsTouring(!isTouring)}
                      className={`flex items-center gap-1.5 border border-black px-2 py-1 text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                        isTouring ? 'bg-green-600 text-white border-green-600' : 'bg-white hover:bg-black hover:text-white'
                      }`}
                      title="Toggle continuous orbital rotation of the studio model"
                    >
                      {isTouring ? <Pause size={10} className="animate-pulse" /> : <Play size={10} />}
                      <span>{isTouring ? 'Touring' : 'Orbit Tour'}</span>
                    </button>
                  </div>

                  <div 
                    ref={saveFormRef}
                    className={`flex-1 flex flex-col gap-4 transition-all duration-300 rounded ${
                      walkthroughStep === 4 ? 'ring-2 ring-black ring-offset-[12px] p-2 z-[145] bg-white shadow-xl' : ''
                    }`}
                  >
                    {/* Save Studio Layout Form */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="NAME THIS LAYOUT..." 
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        className="flex-1 border border-studio-border border-b-black p-2 text-[10px] uppercase font-mono focus:outline-none focus:border-black focus:ring-0"
                        maxLength={32}
                      />
                      <button 
                        onClick={saveStudioDesign}
                        disabled={saving}
                        className="border border-black px-4 py-2 bg-black text-white hover:bg-studio-gray text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 hover:-translate-y-[1px] active:translate-y-0 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Save size={12} />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>

                    {/* Saved Options list */}
                    <div className="flex-1 overflow-y-auto max-h-[140px] border border-studio-border p-2 bg-gray-50/50 flex flex-col gap-2">
                      {loadingSaves ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2 text-studio-gray">
                          <div className="w-4 h-[1px] bg-studio-gray animate-pulse" />
                          <span className="text-[8px] uppercase tracking-widest font-bold font-mono">LOADING PLAYBACK PRESETS...</span>
                        </div>
                      ) : savedStudios.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-1 text-studio-gray">
                          <span className="text-[9px] uppercase tracking-widest font-bold font-mono">ARCHIVE EMPTY</span>
                          <span className="text-[8px] uppercase tracking-wider text-center max-w-[200px] leading-relaxed">Name and save the current layout with the input above.</span>
                        </div>
                      ) : (
                        savedStudios.map((item) => {
                          const isCurrent = Math.abs(width - item.width) < 0.05 && 
                                            Math.abs(depth - item.depth) < 0.05 && 
                                            Math.abs(height - item.height) < 0.05 && 
                                            roomType === item.roomType;
                          return (
                            <div 
                              key={item.id}
                              className={`flex items-center justify-between p-2.5 border transition-all ${
                                isCurrent ? 'bg-black/5 border-black' : 'bg-white border-studio-border hover:border-black'
                              }`}
                            >
                              <button 
                                onClick={() => loadStudioSave(item)}
                                className="flex-1 text-left flex flex-col gap-0.5 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[140px]">{item.name}</span>
                                  <span className="text-[8px] font-mono uppercase bg-black/15 px-1.5 py-0.5 text-black">
                                    {item.roomType}
                                  </span>
                                </div>
                                <span className="text-[8px] font-mono text-studio-gray">
                                  {item.width.toFixed(1)}m x {item.depth.toFixed(1)}m x {item.height.toFixed(1)}m
                                </span>
                              </button>
                              
                              <div className="flex items-center gap-1.5 ml-2">
                                <button
                                  onClick={() => loadStudioSave(item)}
                                  className={`p-1 border transition-all cursor-pointer ${
                                    isCurrent ? 'bg-black text-white border-black' : 'bg-white text-black border-studio-border hover:bg-black hover:text-white'
                                  }`}
                                  title="Play options / Load set up"
                                >
                                  <Play size={10} />
                                </button>
                                <button
                                  onClick={() => deleteStudioSave(item.id)}
                                  className="p-1 border border-studio-border text-red-500 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all cursor-pointer"
                                  title="Delete option"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DimensionControl({ label, val, set, color }: { label: string, val: number, set: (v: number) => void, color: string }) {
  const minVal = label === 'H' ? 1.5 : 1.0;
  const maxVal = 30.0;
  const [inputValue, setInputValue] = useState(val.toString());

  useEffect(() => {
    setInputValue(val.toString());
  }, [val]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputValue(rawVal);
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed) && parsed >= minVal && parsed <= maxVal) {
      set(parsed);
    }
  };

  const handleBlur = () => {
    let parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      parsed = val;
    } else if (parsed < minVal) {
      parsed = minVal;
    } else if (parsed > maxVal) {
      parsed = maxVal;
    }
    set(parsed);
    setInputValue(parsed.toString());
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`w-8 h-8 flex items-center justify-center text-white text-[10px] font-bold ${color} shrink-0`}>
        {label}
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between items-center text-[9px] uppercase font-mono">
          <div className="flex items-center gap-1">
            <input 
              type="number" 
              min={minVal} 
              max={maxVal} 
              step="0.1" 
              value={inputValue} 
              onChange={handleInputChange} 
              onBlur={handleBlur}
              className="w-12 text-right px-1 py-0.5 border border-black text-[10px] font-mono bg-stone-50 focus:bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-stone-500">m</span>
          </div>
          <span className="text-studio-gray">MAX 30m</span>
        </div>
        <input 
          type="range" 
          min={minVal} 
          max={maxVal} 
          step="0.1" 
          value={val} 
          onChange={(e) => set(parseFloat(e.target.value))}
          className="w-full accent-black cursor-pointer h-[1px] bg-studio-border appearance-none"
        />
      </div>
    </div>
  );
}

