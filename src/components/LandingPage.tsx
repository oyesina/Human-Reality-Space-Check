import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ruler, Maximize, User, Map, ChevronRight, ArrowRight, Lock, Mail, FileText, 
  Compass, Shield, Activity, Info, HelpCircle, Send, Check, X, ExternalLink, 
  Globe, Users, Briefcase, Newspaper, BookOpen, Terminal, Code, Award, 
  Twitter, Instagram, Facebook, Youtube, Linkedin, Star, Sliders, Server
} from 'lucide-react';
import Auth from './Auth';

// Articles Data
interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  readTime: string;
  content: string;
}

const ARTICLES: Article[] = [
  {
    id: "art-01",
    title: "The Claustrophobia Threshold in Modern Habitation",
    subtitle: "Mapping volume-to-area proportions for human dignity in micro-dwellings.",
    category: "Spatial Science",
    date: "June 25, 2026",
    readTime: "6 min read",
    content: "In high-density metropolitan zones, residential heights have steadily descended to the standard 2.4-meter limit. However, psychological comfort depends directly on the ratio of clear volume to floor area. Our research shows that standard 2D layouts fail to register spatial confinement. By testing spatial heights parametrically relative to the human body outline (1.8m average), architects can prevent structural claustrophobia before breaking ground. Optimal height is not just a structural standard—it is a baseline cognitive human right."
  },
  {
    id: "art-02",
    title: "Computational Material Takeoffs for Self-Builders",
    subtitle: "Reducing masonry and plaster waste by 15% using direct parametric calculations.",
    category: "Procurement Logic",
    date: "May 18, 2026",
    readTime: "8 min read",
    content: "Standard contractor bills of quantities often include a 15% to 20% safety margin for concrete pours and masonry blocks, resulting in massive landfill waste and inflated client budgets. By discretizing standard sandcrete blocks (450x225x225mm) directly against continuous parametric wall elevations, builders can purchase materials with sub-millimeter margins. This study demonstrates how simple, client-side digital twins of foundation volumes eliminate contractor padding and foster financial trust in localized architectural builds."
  },
  {
    id: "art-03",
    title: "The Human Scale Manifesto",
    subtitle: "Restoring the physical reference of the human observer to automated CAD designs.",
    category: "Design Philosophy",
    date: "April 02, 2026",
    readTime: "5 min read",
    content: "Modern architecture has lost its scale-reference to the human observer, shifting instead to real-estate optimization and corporate standardized templates. By placing a standard 1.8-meter human body in the center of volumetric calculations, we restore architectural dignity to residential layouts. This manifesto outlines how micro-studios can feel spacious and luxurious through clever vertical clearance, window height alignment, and anatomical motion paths."
  }
];

// Customer Stories
interface Story {
  name: string;
  role: string;
  location: string;
  quote: string;
  saving: string;
  metric: string;
}

const CUSTOMER_STORIES: Story[] = [
  {
    name: "Elena Rostova",
    role: "Self-Builder & Artist",
    location: "Berlin, DE",
    quote: "I designed my backyard art studio using the Human Scale tool. By adjusting the room height to exactly 3.2m with a compact desk setup, I settled spatial doubts instantly and built with absolute peace of mind.",
    saving: "€4,500 Saved",
    metric: "15% Timber Waste Reduction"
  },
  {
    name: "Kenji Sato",
    role: "Lead Architect, Sato Design",
    location: "Tokyo, JP",
    quote: "During client concept briefings, I launch the simulator. Showing customers standard human references inside different room volumes settles design disputes in seconds. It is clean, minimalist, and extremely tactile.",
    saving: "12+ Hours Saved",
    metric: "98% Faster Client Sign-offs"
  },
  {
    name: "Marcus Vance",
    role: "Quantity Estimator",
    location: "London, UK",
    quote: "By using the Procurement Estimator widget to check a sub-contractor's masonry quote, I caught a significant overestimation on sandcrete block counts. The math was indisputable.",
    saving: "£3,800 Saved",
    metric: "Zero Masonry Over-ordering"
  }
];

// Careers List
interface Job {
  id: string;
  title: string;
  dept: string;
  location: string;
  salary: string;
  desc: string;
}

const OPEN_ROLES: Job[] = [
  {
    id: "job-01",
    title: "Volumetric Frontend Developer",
    dept: "Product Engineering",
    location: "Remote / Berlin",
    salary: "€110k - €130k",
    desc: "Scale our custom vector geometry engines and interactive SVG/3D rendering systems. Requires solid experience in modern React, TypeScript, and vector math optimization."
  },
  {
    id: "job-02",
    title: "Spatial UX Researcher",
    dept: "Human-Centric Design",
    location: "Hybrid / Tokyo",
    salary: "$95k - $115k",
    desc: "Conduct behavioral studies on cognitive response to varying ceiling heights and micro-spatial volumes. Guide the evolution of our spatial vibe algorithms."
  },
  {
    id: "job-03",
    title: "Material Logic Intern",
    dept: "Quantity & Materials Research",
    location: "Remote / London",
    salary: "£45k - £55k",
    desc: "Help map and configure sub-structure materials, brick formats, and cement mix ratios for regional construction benchmarks worldwide."
  }
];

// Newsroom Posts
interface PressRelease {
  date: string;
  title: string;
  excerpt: string;
}

const NEWSROOM_ITEMS: PressRelease[] = [
  {
    date: "June 2026",
    title: "HSRCT Ltd launches spatial core v2.1 engine",
    excerpt: "Introducing immediate OBJ/STL mesh export capabilities and direct Firestore secure synchronization for local builders."
  },
  {
    date: "May 2026",
    title: "Spatial Treasury Reserve established",
    excerpt: "Our corporate constitution officially locks 10% of total share capital for public developer API pools and opensource architecture."
  }
];

// Subjective Vibe Calculator for Hero
const getVibe = (height: number): { label: string; desc: string; color: string } => {
  if (height < 2.1) return { label: "Oppressive", desc: "Confined space. Lacks comfort clearance.", color: "text-red-600 bg-red-50 border-red-200" };
  if (height < 2.4) return { label: "Standard", desc: "Common residential scale. Functional, though snug.", color: "text-amber-600 bg-amber-50 border-amber-200" };
  if (height < 3.0) return { label: "Airy", desc: "Spacious modern standard. Excellent dignity.", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  return { label: "Monumental", desc: "Grand ceiling. Human presence is dwarfed.", color: "text-blue-600 bg-blue-50 border-blue-200" };
};

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  
  // Hero Interactive Simulator State
  const [simWidth, setSimWidth] = useState(4.0);
  const [simDepth, setSimDepth] = useState(5.0);
  const [simHeight, setSimHeight] = useState(2.8);

  // Support Form State
  const [supportEmail, setSupportEmail] = useState('');
  const [supportCategory, setSupportCategory] = useState('General Help');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportTicketId, setSupportTicketId] = useState<string | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Calculate volume
  const volume = (simWidth * simDepth * simHeight).toFixed(1);
  const vibeInfo = getVibe(simHeight);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEmail || !supportMessage) return;
    
    setIsSubmittingTicket(true);
    
    // Generate organic Ticket ID
    setTimeout(() => {
      const generatedId = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Save locally to represent active ledger status
      const savedTickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
      savedTickets.push({
        id: generatedId,
        email: supportEmail,
        category: supportCategory,
        message: supportMessage,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('support_tickets', JSON.stringify(savedTickets));

      setSupportTicketId(generatedId);
      setIsSubmittingTicket(false);
      
      // Reset form
      setSupportEmail('');
      setSupportMessage('');
    }, 1000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-black font-sans selection:bg-black selection:text-[#FBF9F4] overflow-x-hidden">
      
      {/* 🏛️ HEADER / NAVIGATION */}
      <nav className="sticky top-0 z-40 bg-[#FBF9F4]/90 backdrop-blur-md border-b border-black py-4 px-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border border-black flex items-center justify-center font-mono font-bold text-[10px] bg-white">
            H
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] font-mono leading-none">Human Scale</span>
            <span className="text-[7.5px] uppercase text-studio-gray font-mono tracking-widest mt-0.5">Reality Check Technologies</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center gap-8 font-mono text-[10px] uppercase font-bold">
          <button onClick={() => scrollToSection('explore-section')} className="hover:text-studio-gray cursor-pointer">Explore</button>
          <button onClick={() => scrollToSection('about-section')} className="hover:text-studio-gray cursor-pointer">About Tool</button>
          <button onClick={() => scrollToSection('security-section')} className="hover:text-studio-gray cursor-pointer">Security & Support</button>
        </div>

        {/* Trigger Login Modal */}
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="px-4 py-2 border border-black text-[10px] uppercase tracking-wider font-bold bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-1 cursor-pointer transition-all"
        >
          Access Studio
        </button>
      </nav>

      {/* 🚀 HERO SECTION WITH INTERACTIVE SIMULATOR */}
      <section className="border-b border-black py-12 px-6 sm:px-10 lg:py-20 flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
        
        {/* Hero Left Content */}
        <div className="flex-1 flex flex-col justify-between gap-8 lg:max-w-xl">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-studio-gray font-mono">
              ★ Active Edition 2.1 — Built for Builders
            </span>
            <h1 className="text-5xl sm:text-6xl font-extralight uppercase leading-[0.9] tracking-tighter text-black">
              PROPORTION ROOM VOLUMES <br />
              <span className="font-bold">& ESTIMATE MATERIAL QUANTITIES</span>
            </h1>
            <p className="text-lg text-studio-gray leading-snug mt-2 font-serif italic">
              "Before you pour the concrete slab or frame the timber rafters, execute a real-time volumetric reality check."
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap gap-4 mt-2">
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-black text-[#FBF9F4] text-xs uppercase font-extrabold tracking-widest hover:bg-neutral-800 transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] active:scale-95 cursor-pointer"
            >
              Launch Space Studio <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => scrollToSection('explore-section')}
              className="px-6 py-4 border border-black text-xs uppercase font-extrabold tracking-widest bg-white hover:bg-neutral-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-1 transition-all cursor-pointer"
            >
              Read Project Documents
            </button>
          </div>

          {/* Quick Specifications Banner */}
          <div className="grid grid-cols-3 border-t border-black pt-6 font-mono text-[9px] text-studio-gray uppercase gap-4">
            <div>
              <span className="font-bold text-black block mb-1">Volumetric Engine</span>
              <span>Parametric 3D OBJ & STL Export</span>
            </div>
            <div>
              <span className="font-bold text-black block mb-1">Architectural Accuracy</span>
              <span>Continuous 400mm Framing Grid</span>
            </div>
            <div>
              <span className="font-bold text-black block mb-1">Material Logic</span>
              <span>Sandcrete & Clay Masonry Estimations</span>
            </div>
          </div>
        </div>

        {/* Hero Right: Interactive Minimalist Tool Playground */}
        <div className="flex-1 border border-black p-6 sm:p-8 bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] relative flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-black pb-3">
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-black" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Minimalist Architectural Tool (Live)</span>
            </div>
            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest">Interactive Playground</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Play Sliders */}
            <div className="flex flex-col gap-4 font-mono text-[10px] uppercase font-bold">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span>Width (m)</span>
                  <span className="text-black">{simWidth.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" 
                  min="2.0" 
                  max="12.0" 
                  step="0.1" 
                  value={simWidth} 
                  onChange={(e) => setSimWidth(parseFloat(e.target.value))} 
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span>Depth (m)</span>
                  <span className="text-black">{simDepth.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" 
                  min="2.0" 
                  max="12.0" 
                  step="0.1" 
                  value={simDepth} 
                  onChange={(e) => setSimDepth(parseFloat(e.target.value))} 
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span>Ceiling Height (m)</span>
                  <span className="text-black">{simHeight.toFixed(1)}m</span>
                </div>
                <input 
                  type="range" 
                  min="2.0" 
                  max="4.5" 
                  step="0.1" 
                  value={simHeight} 
                  onChange={(e) => setSimHeight(parseFloat(e.target.value))} 
                  className="w-full"
                />
              </div>

              {/* Dynamic Readout */}
              <div className="border border-black p-3 bg-[#FAF9F5] flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between items-center text-[9px]">
                  <span>Total Space Volume:</span>
                  <span className="text-black font-extrabold text-xs">{volume} m³</span>
                </div>
                <div className={`p-2 border text-[9px] rounded leading-snug ${vibeInfo.color}`}>
                  <strong>VIBE: {vibeInfo.label}</strong> — {vibeInfo.desc}
                </div>
              </div>
            </div>

            {/* Wireframe Spatial Perspective Rendering */}
            <div className="border border-black bg-neutral-50 aspect-square relative flex items-center justify-center overflow-hidden">
              
              {/* Dynamic room wireframe box */}
              <div 
                className="border border-black bg-white/40 shadow-inner flex items-end justify-center relative transition-all duration-150"
                style={{
                  width: `${60 + (simWidth - 4) * 3}%`,
                  height: `${60 + (simHeight - 2.8) * 12}%`,
                  maxWidth: '90%',
                  maxHeight: '90%',
                }}
              >
                {/* Simulated 1.8m human standing inside */}
                <div 
                  className="absolute bottom-0 z-10 transition-all duration-150 flex flex-col items-center justify-end"
                  style={{
                    // height proportion relative to room ceiling height
                    height: `${(1.8 / simHeight) * 100}%`,
                  }}
                >
                  <span className="text-[6.5px] uppercase font-mono font-bold text-studio-gray mb-1">Human (1.8m)</span>
                  <svg viewBox="0 0 100 240" className="h-[75%] w-auto text-black/80" fill="currentColor">
                    <circle cx="50" cy="25" r="20" />
                    <path d="M30 50 L70 50 L75 140 L25 140 Z" />
                    <rect x="32" y="145" width="14" height="90" />
                    <rect x="54" y="145" width="14" height="90" />
                    <rect x="18" y="55" width="10" height="80" rx="5" />
                    <rect x="72" y="55" width="10" height="80" rx="5" />
                  </svg>
                </div>

                {/* Perspective depth grid lines */}
                <div className="absolute inset-0 border-r border-b border-black/10 border-dashed pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center">
                  <div className="w-[85%] h-[85%] border border-black/5 border-dashed" />
                </div>
              </div>

              {/* Metric Labels on visualizer */}
              <div className="absolute bottom-2 left-2 font-mono text-[8px] text-studio-gray bg-white/95 px-1.5 py-0.5 border border-black/10 uppercase">
                W: {simWidth.toFixed(1)}m × D: {simDepth.toFixed(1)}m
              </div>
              <div className="absolute top-2 right-2 font-mono text-[8px] text-studio-gray bg-white/95 px-1.5 py-0.5 border border-black/10 uppercase">
                H: {simHeight.toFixed(1)}m
              </div>
            </div>

          </div>

          <p className="text-[9px] uppercase font-mono text-studio-gray leading-tight border-t border-black/10 pt-3">
            Note: Standard visualizer loads real furniture overlays and OBJ export blueprints upon entering your spatial dashboard profile.
          </p>
        </div>

      </section>

      {/* 🧭 EXPLORE SECTION */}
      <section id="explore-section" className="border-b border-black bg-white py-16 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black pb-4 gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] text-studio-gray uppercase font-bold tracking-[0.2em] block">
                Section 01 / Spatial Exploration
              </span>
              <h2 className="text-3xl font-extrabold uppercase tracking-tight font-mono">
                Explore The Workspace_
              </h2>
            </div>
            <p className="text-xs text-studio-gray uppercase font-mono max-w-sm">
              Read peer-reviewed spatial guidelines, view structural nodes, and audit real customer savings records.
            </p>
          </div>

          {/* Sub-grid of Explore Elements: Articles, Sitemap, Customer Stories */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Column 1: Articles List (col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-black/20 pb-2">
                <BookOpen size={14} />
                <h3 className="font-mono text-[11px] uppercase font-bold tracking-wider">Spatial Studies & Articles</h3>
              </div>

              <div className="flex flex-col gap-4">
                {ARTICLES.map((article) => (
                  <div 
                    key={article.id}
                    onClick={() => setActiveArticle(article)}
                    className="border border-black p-5 hover:bg-[#FAF9F4] transition-all cursor-pointer group shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono text-studio-gray uppercase font-semibold mb-1">
                      <span>{article.category}</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h4 className="font-sans font-bold text-sm text-black group-hover:underline leading-snug">
                      {article.title}
                    </h4>
                    <p className="text-[11px] text-studio-gray line-clamp-2 mt-1.5 font-serif">
                      {article.subtitle}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-black mt-3">
                      <span>Read Document</span>
                      <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Sitemap (col-span-3) */}
            <div className="lg:col-span-3 border border-black p-6 bg-[#FAF9F5] shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-black/10 pb-2 mb-4">
                  <Terminal size={14} />
                  <h3 className="font-mono text-[11px] uppercase font-bold tracking-wider">System Node Sitemap</h3>
                </div>

                <div className="flex flex-col gap-4 font-mono text-[10px] uppercase leading-normal">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-black">01 / Space Simulator</span>
                    <span className="text-studio-gray text-[9px]">Parametric width & height matrices</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-black">02 / Procurement BoQ</span>
                    <span className="text-studio-gray text-[9px]">Concrete slab & brick counts calculator</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-black">03 / Visual Scale Logs</span>
                    <span className="text-studio-gray text-[9px]">Chronological Firestore archives</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-black">04 / Charter & Articles</span>
                    <span className="text-studio-gray text-[9px]">Founder share prospectus report</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-black">05 / Admin Diagnostics</span>
                    <span className="text-studio-gray text-[9px]">Database logs (super-admin view)</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/10 pt-4 mt-6 text-[8px] font-mono text-studio-gray">
                <span>SECURE SSL CONNECTIONS HOSTED ON CLOUD RUN INGRESS NODE.</span>
              </div>
            </div>

            {/* Column 3: Customer Stories (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-black/20 pb-2">
                <Users size={14} />
                <h3 className="font-mono text-[11px] uppercase font-bold tracking-wider">Customer Stories & Savings</h3>
              </div>

              <div className="flex flex-col gap-4">
                {CUSTOMER_STORIES.map((story, idx) => (
                  <div key={idx} className="border border-black p-5 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                    <p className="font-serif italic text-xs leading-relaxed text-[#2C2B26]">
                      "{story.quote}"
                    </p>
                    <div className="flex justify-between items-end mt-4 pt-3 border-t border-black/10 font-mono text-[10px] uppercase">
                      <div>
                        <span className="font-bold text-black block leading-none">{story.name}</span>
                        <span className="text-studio-gray text-[8px]">{story.role} — {story.location}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-green-700 block leading-none">{story.saving}</span>
                        <span className="text-studio-gray text-[8px]">{story.metric}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 💼 ABOUT SECTION */}
      <section id="about-section" className="border-b border-black py-16 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black pb-4 gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] text-studio-gray uppercase font-bold tracking-[0.2em] block">
                Section 02 / Corporate Philosophy
              </span>
              <h2 className="text-3xl font-extrabold uppercase tracking-tight font-mono">
                About Human Scale_
              </h2>
            </div>
            <p className="text-xs text-studio-gray uppercase font-mono max-w-sm">
              Learn how we restore fundamental human reference to modern design and check our latest career postings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Column 1: Minimalist Architectural Tool Philosophy (col-span-5) */}
            <div className="lg:col-span-5 border border-black p-8 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-5">
              <div className="w-12 h-12 border border-black flex items-center justify-center bg-yellow-50">
                <Code size={18} />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight font-mono">Minimalist Architectural Philosophy</h3>
              <p className="text-xs text-studio-gray leading-relaxed font-serif">
                Traditional CAD softwares are designed for full-scale commercial developers, requiring weeks of certification and training. They optimize floor space in dry, structural percentages, leaving homeowners and micro-builders locked out of spatial comprehension.
              </p>
              <p className="text-xs text-studio-gray leading-relaxed font-serif">
                Our tools operate on a simple humanistic principle: **the body is the measure of the architecture.** By pairing continuous slider arrays to immediate live silhouette projections, anyone can perceive spatial limitations instantly. No complex installations. No hidden metrics.
              </p>
            </div>

            {/* Column 2: Open Careers (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-black/20 pb-2">
                <Briefcase size={14} />
                <h3 className="font-mono text-[11px] uppercase font-bold tracking-wider">Careers at Human Scale</h3>
              </div>

              <div className="flex flex-col gap-4 font-mono">
                {OPEN_ROLES.map((job) => (
                  <div key={job.id} className="border border-black p-5 bg-[#FAF9F5] shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-center text-[8px] text-studio-gray mb-1 font-bold">
                        <span>{job.dept}</span>
                        <span>{job.location}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-black uppercase leading-tight">{job.title}</h4>
                      <p className="text-[10px] text-studio-gray leading-normal mt-2 lowercase border-t border-dashed border-black/10 pt-2 font-serif">
                        {job.desc}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-black/10 text-[9px] font-bold">
                      <span className="text-neutral-900">{job.salary}</span>
                      <button 
                        onClick={() => alert(`Apply for ${job.title}: Please transmit your curriculum vitae directly to specialist@oyesinaoyerinde.com with ID ${job.id}`)}
                        className="px-2.5 py-1 border border-black bg-white hover:bg-black hover:text-[#FBF9F4] uppercase tracking-wider text-[8px] font-extrabold transition-all cursor-pointer"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Newsroom (col-span-3) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-black/20 pb-2">
                <Newspaper size={14} />
                <h3 className="font-mono text-[11px] uppercase font-bold tracking-wider">Corporate Newsroom</h3>
              </div>

              <div className="flex flex-col gap-4 font-mono text-[10px]">
                {NEWSROOM_ITEMS.map((news, idx) => (
                  <div key={idx} className="border border-black p-4 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex flex-col gap-2">
                    <span className="text-[8px] uppercase font-extrabold text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.5 w-fit rounded">
                      {news.date}
                    </span>
                    <h4 className="font-bold text-black uppercase leading-tight">{news.title}</h4>
                    <p className="text-[9px] text-studio-gray leading-relaxed font-serif mt-1 lowercase">
                      {news.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🔒 SECURITY, PRIVACY & SUPPORT SECTION */}
      <section id="security-section" className="border-b border-black bg-white py-16 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black pb-4 gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] text-studio-gray uppercase font-bold tracking-[0.2em] block">
                Section 03 / Operations & Governance
              </span>
              <h2 className="text-3xl font-extrabold uppercase tracking-tight font-mono">
                Security & Support Ticket Ledger_
              </h2>
            </div>
            <p className="text-xs text-studio-gray uppercase font-mono max-w-sm">
              We manage structural models with rigorous secure data boundaries. File a ticket below if you require spatial scale assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Column 1: Privacy & Guidelines (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex flex-col gap-5 border border-black p-6 bg-[#FAF9F5] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                  <Shield size={14} className="text-black" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Privacy Protocol</span>
                </div>
                <p className="text-[11px] text-studio-gray leading-relaxed font-mono uppercase">
                  All metrics, custom width calculations, and bedroom layout presets stored in our cloud are partitioned securely. We implement Firebase Attribute-Based Access Controls (ABAC). No contractor or third-party entity can access your private portfolio logs.
                </p>
              </div>

              <div className="flex flex-col gap-5 border border-black p-6 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                  <Activity size={14} className="text-black" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">User Guidelines</span>
                </div>
                <p className="text-[11px] text-studio-gray leading-relaxed font-serif">
                  1. **Verify Local Codes:** Digital twin measurements should always be cross-referenced with your municipality's structural building codes. <br />
                  2. **No High-Risk Structuring:** Do not utilize visual scale results for critical heavy seismic framing without consulting a registered structural engineer.
                </p>
              </div>
            </div>

            {/* Column 2: Terms & Social Impact (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6 font-mono text-[10px]">
              
              <div className="border border-black p-6 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 border-b border-black/10 pb-2 mb-3">
                  <FileText size={14} />
                  <span className="uppercase font-bold tracking-wider">Software Terms</span>
                </div>
                <p className="text-studio-gray uppercase text-[9px] leading-relaxed mb-2">
                  Our standard spatial simulator is provided "as is" under the human scale open documentation license. Standard share reserves are locked under registration code HSRCT-2026-99120.
                </p>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert("Detailed Terms of Service: Issued under the primary control of founder oyesinaoyerinde@gmail.com. All reverse-engineering of spatial indices strictly forbidden."); }}
                  className="font-bold underline uppercase text-black block mt-2 hover:text-studio-gray"
                >
                  View full license code ■
                </a>
              </div>

              <div className="border border-black p-6 bg-[#FAF9F5] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 border-b border-black/10 pb-2 mb-3">
                  <Globe size={14} />
                  <span className="uppercase font-bold tracking-wider">Social Impact (10% Treasury)</span>
                </div>
                <p className="text-studio-gray leading-relaxed text-[9px] uppercase">
                  10% of our company share capital is locked permanently in the **Spatial Treasury Reserve Pool**. These funds support community micro-dwellings, open-source building rendering scripts, and global spatial dignity campaigns for low-income residents.
                </p>
              </div>

            </div>

            {/* Column 3: Interactive Support Form (col-span-4) */}
            <div className="lg:col-span-4 border border-black p-6 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 border-b border-black pb-3 mb-4">
                <HelpCircle size={14} className="text-black" />
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Support Desk / Ticket Ledger</span>
              </div>

              {supportTicketId ? (
                <div className="flex flex-col gap-4 font-mono text-[10px] text-center p-6 bg-emerald-50 border border-emerald-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mx-auto">
                    <Check size={16} />
                  </div>
                  <div>
                    <span className="font-extrabold text-black block uppercase">Ticket Submitted Successfully</span>
                    <span className="text-studio-gray text-[9px] uppercase mt-1 block">Your inquiry is secured in our local database</span>
                  </div>
                  <div className="p-2 border border-dashed border-emerald-300 bg-white text-xs font-bold text-emerald-800">
                    ID: {supportTicketId}
                  </div>
                  <p className="text-[8px] text-studio-gray uppercase leading-relaxed mt-1">
                    An architectural scale representative will transmit instructions to your registered email address.
                  </p>
                  <button 
                    onClick={() => setSupportTicketId(null)}
                    className="mt-2 text-[9px] uppercase tracking-widest text-black underline font-extrabold hover:text-studio-gray cursor-pointer"
                  >
                    File another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="flex flex-col gap-4 font-mono text-[10px] uppercase">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-800">Registered Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="ENTER EMAIL ADDRESS"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full border border-black p-2.5 text-[9px] focus:outline-none focus:bg-neutral-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-800">Support Category</label>
                    <select 
                      value={supportCategory}
                      onChange={(e) => setSupportCategory(e.target.value)}
                      className="w-full border border-black p-2.5 text-[9px] focus:outline-none bg-white font-mono"
                    >
                      <option value="General Help">General Support</option>
                      <option value="Technical Bug">Spatial Bug Report</option>
                      <option value="Feature Request">Request Feature Widget</option>
                      <option value="Consulting">Consulting Advisory</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-800">Your Inquiry</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="DESCRIBE ROOM STRUCTURAL CONCERN..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="w-full border border-black p-2.5 text-[9px] focus:outline-none focus:bg-neutral-50 font-sans normal-case"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="flex items-center justify-center gap-2 w-full bg-black text-[#FBF9F4] p-3 text-[10px] font-bold tracking-widest hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingTicket ? 'Dispersing...' : 'File Ticket In Ledger'}
                    <Send size={10} />
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 🌐 SOCIAL CHANNELS SECTION */}
      <section className="bg-black text-white py-12 px-6 sm:px-10 border-t border-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 font-mono text-[10px] uppercase">
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-white flex items-center justify-center font-bold text-[10px] bg-black text-white">
              H
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-wider leading-none">HSRCT LTD — SOCIAL LEDGER</span>
              <span className="text-gray-400 text-[8px] tracking-widest mt-0.5">ESTABLISHED ON THE SYSTEM DIST PANEL</span>
            </div>
          </div>

          {/* Social Links Grid */}
          <div className="flex flex-wrap gap-5 justify-center">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-gray-400 transition-all border border-neutral-800 hover:border-neutral-500 px-3 py-1.5 bg-neutral-950">
              <Twitter size={12} />
              <span>Twitter</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-gray-400 transition-all border border-neutral-800 hover:border-neutral-500 px-3 py-1.5 bg-neutral-950">
              <Instagram size={12} />
              <span>Instagram</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-gray-400 transition-all border border-neutral-800 hover:border-neutral-500 px-3 py-1.5 bg-neutral-950">
              <Facebook size={12} />
              <span>Facebook</span>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-gray-400 transition-all border border-neutral-800 hover:border-neutral-500 px-3 py-1.5 bg-neutral-950">
              <Youtube size={12} />
              <span>YouTube</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-gray-400 transition-all border border-neutral-800 hover:border-neutral-500 px-3 py-1.5 bg-neutral-950">
              <Linkedin size={12} />
              <span>LinkedIn</span>
            </a>
          </div>

          <div className="text-gray-500 text-[8px] text-right md:text-left">
            <span>METRIC NODES SECURED CONTINUOUSLY IN THE CLOUD.</span>
          </div>
        </div>
      </section>

      {/* 💼 BALANCED LOGIN MODAL OVERLAY */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#FBF9F4] p-1 border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] z-10"
            >
              {/* Decorative top ribbon */}
              <div className="bg-black text-[#FBF9F4] py-1.5 px-3 flex justify-between items-center font-mono text-[8px] uppercase tracking-widest">
                <span>SECURE USER SIGN-IN TERMINAL</span>
                <span>REG: HSRCT-2026</span>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setIsLoginOpen(false)}
                className="absolute top-8 right-6 p-1 border border-black hover:bg-black hover:text-white transition-all bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer z-20"
                title="Close Authentication View"
              >
                <X size={14} />
              </button>

              <div className="p-4 sm:p-6 bg-white border border-black/20 m-1">
                {/* Embedded Auth Widget */}
                <Auth />
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* 📚 ARTICLE DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white p-6 sm:p-10 border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] z-10 font-serif text-sm leading-relaxed"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveArticle(null)}
                className="absolute top-6 right-6 p-1 border border-black hover:bg-black hover:text-white transition-all bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                title="Close Article"
              >
                <X size={14} />
              </button>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 font-mono text-[9px] text-studio-gray uppercase font-bold tracking-widest border-b border-black/10 pb-2">
                  <span>{activeArticle.category}</span>
                  <span>•</span>
                  <span>{activeArticle.date}</span>
                  <span>•</span>
                  <span>{activeArticle.readTime}</span>
                </div>

                <h3 className="font-sans text-2xl font-extrabold uppercase tracking-tight text-black mt-2 leading-tight">
                  {activeArticle.title}
                </h3>
                <h4 className="text-studio-gray font-serif italic text-base leading-snug">
                  {activeArticle.subtitle}
                </h4>

                <div className="w-12 h-[1px] bg-black my-2" />

                <p className="text-neutral-800 leading-relaxed text-[13.5px] whitespace-pre-line lowercase first-letter:uppercase">
                  {activeArticle.content}
                </p>

                <div className="border-t border-black/10 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center font-mono text-[8px] uppercase tracking-widest text-studio-gray">
                  <span>Human Scale Spatial Research Network</span>
                  <span>Published under Open License 2026</span>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* 📚 SYSTEM FOOTER */}
      <footer className="border-t border-black py-8 px-6 sm:px-10 text-center font-mono text-[9px] uppercase tracking-widest text-studio-gray bg-[#FBF9F4]">
        <span>© 2026 Human Scale Reality Check / Document Sheet 00 / Released for Local Administrators</span>
      </footer>

    </div>
  );
}
