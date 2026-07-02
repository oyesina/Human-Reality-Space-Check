import { useState } from 'react';
import { 
  FileText, Copy, Printer, ChevronLeft, Landmark, 
  Award, Shield, Users, Coins, PenTool, Check, Sparkles, TrendingUp, CheckCircle 
} from 'lucide-react';

interface LegalCharterViewProps {
  userEmail?: string;
  onBack: () => void;
}

export default function LegalCharterView({ userEmail, onBack }: LegalCharterViewProps) {
  const [activeSection, setActiveSection] = useState<'all' | 'benefits' | 'specifications' | 'growth'>('all');
  const [copied, setCopied] = useState(false);

  const companyName = "HUMAN SCALE REALITY CHECK TECHNOLOGIES LTD";
  const primaryGovernor = userEmail && userEmail !== 'Guest' ? userEmail : "oyesinaoyerinde@gmail.com";
  const registrationCode = "HSRCT-2026-99120";
  const shareCapital = "10,000,000 Ordinary Shares of $0.01 nominal value each";

  const triggerCopy = () => {
    const textToCopy = `HUMAN SCALE REALITY CHECK TECHNOLOGIES LTD
============================================================
CORPORATE PROSPECTUS: PRODUCT BENEFITS & SPECIFICATIONS
Company Registration: ${registrationCode}
Date of Release: 5th June 2026
Prepared for Founding Administration: ${primaryGovernor}

------------------------------------------------------------
1. EXECUTIVE VALUE PROPOSITION & USER BENEFITS
------------------------------------------------------------
Our suite of interactive, volumetric, and parametric calculation tools translates structural floorplans directly into raw material requirements and human-centric feedback.

A. For Self-Builders and Homeowners
   - Spatial Claustrophobia Elimination: Prevents spatial errors prior to breaking ground. Real-time anatomical scale guidelines let users literally "preview" clear room limits.
   - Material Procurement Clarity: Empowers non-professionals to cross-reference contractor bills with precise structural mathematics, avoiding inflated quotes.

B. For Architects and Interior Designers
   - Zero-Friction Volumetric Prototyping: Instant 3D perspective and elevation testing without launching heavy CAD utilities.
   - Design Consensus Accelerators: Live orbit tour cams and high-contrast furniture layout overlays quickly settle client spatial disputes.

C. For Contractors and Estimators
   - Bulletproof Bill of Quantities (BoQ) Benchmarks: Converts dimensional spans instantly into structural material takeoffs.
   - 15% Reduction in Procurement Waste: Provides exact matrices for Concrete, Timber framing, Sandcrete/Clay masonry, and plaster rendering.

------------------------------------------------------------
2. OPERATIONAL SPECIFICATIONS & PRODUCT CAPABILITIES
------------------------------------------------------------
A. Sub-Structure & Architectural Estimations
   - Concrete Foundation Volumes: Generates automated thickness and width matrices to evaluate baseline cubic yards accurately.
   - Lumber Framing Stud Counts: Counts continuous timber boards for wood stud framing to avoid over-ordering.
   - Masonry Unit Discretization: Calculates physical unit requirements based on standard Sandcrete hollow masonry blocks (450x225x225mm) or traditional clay bricks.
   - Multi-Region Dynamic Cost Multipliers: Adapts total spend assumptions to localized metropolitan benchmarks (e.g. London, West EU, Tokyo).

B. Three-Dimensional Spatial Simulators
   - Continuous parametric overrides (Width, Depth, Height).
   - Instant structural exports (OBJ, STL, SVG models).
   - Persistent Firestore logs for secure chronological trace of version modifications.

------------------------------------------------------------
3. STRATEGIC GROWTH & ALLOCATIONS
------------------------------------------------------------
Founder & Chief Specialist: ${primaryGovernor} (90% strategic allocation)
Spatial Treasury Reserve: 10% held for open public developer API pools.`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="relative min-h-screen bg-[#FBF9F4] font-sans text-black border border-black p-4 sm:p-8 md:p-12 shadow-[4px_4px_0_0_rgba(0,0,0,1)] max-w-5xl mx-auto print:bg-white print:shadow-none print:border-none print:p-0 my-4">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-black pb-6 mb-8 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 border border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-1 cursor-pointer bg-white mr-2"
            title="Return to Space Visualizer"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.3em] font-extrabold text-[#7D7A73]">Corporate Portfolio Support Desk</span>
            <h1 className="text-xl font-extrabold uppercase tracking-tight font-mono">Product Benefits & Prospectus</h1>
          </div>
        </div>

        <div className="flex gap-2.5 mt-4 md:mt-0">
          <button
            onClick={triggerCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-black text-[10px] uppercase font-bold tracking-wider hover:bg-black hover:text-white transition-all bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-1 cursor-pointer"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? 'CopiedPlain_' : 'CopyProspectus_'}
          </button>
          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-black text-[10px] uppercase font-bold tracking-wider hover:bg-black hover:text-white transition-all bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-1 cursor-pointer"
          >
            <Printer size={12} />
            PrintProspectus_
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar & Registries */}
        <div className="lg:col-span-1 flex flex-col gap-5 print:hidden">
          <div className="border border-black p-4 bg-[#FAF7F0] shadow-[2px_2px_0_0_rgba(0,0,0,1)] h-fit">
            <span className="text-[9px] uppercase font-bold text-[#7D7A73] tracking-widest block mb-3 border-b border-black/10 pb-1">
              Document Sections_
            </span>
            <div className="flex flex-col gap-1.5 font-mono text-[9px] uppercase font-bold">
              <button
                onClick={() => setActiveSection('all')}
                className={`text-left p-2 transition-all border cursor-pointer ${
                  activeSection === 'all' ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'
                }`}
              >
                ■ 0. Executive Prospectus
              </button>
              <button
                onClick={() => setActiveSection('benefits')}
                className={`text-left p-2 transition-all border cursor-pointer ${
                  activeSection === 'benefits' ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'
                }`}
              >
                ■ 1. User & Client Benefits
              </button>
              <button
                onClick={() => setActiveSection('specifications')}
                className={`text-left p-2 transition-all border cursor-pointer ${
                  activeSection === 'specifications' ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'
                }`}
              >
                ■ 2. Product Specifications
              </button>
              <button
                onClick={() => setActiveSection('growth')}
                className={`text-left p-2 transition-all border cursor-pointer ${
                  activeSection === 'growth' ? 'bg-black text-white border-black' : 'bg-white text-black border-black/10 hover:border-black'
                }`}
              >
                ■ 3. Strategic Allocations
              </button>
            </div>
          </div>

          <div className="border border-black p-4 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-mono text-[8px] text-[#7D7A73] leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold uppercase text-black mb-1">
              <Shield size={10} /> Regulatory Stamp
            </div>
            <span>This prospectus outlines the strategic capabilities, monetization anchors, and real-world cost-saving metrics of our interactive spatial comparison software. Registered under code {registrationCode}.</span>
          </div>
        </div>

        {/* Corporate Document Display (The Physical Document Vibe) */}
        <div className="lg:col-span-3 border border-black p-6 sm:p-10 bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-serif relative overflow-hidden text-sm max-w-full leading-relaxed print:border-none print:shadow-none print:p-0">
          
          {/* Aesthetic Watermark Stamp */}
          <div className="absolute right-6 top-6 w-24 h-24 rounded-full border border-red-800/15 flex items-center justify-center font-mono text-[7px] uppercase font-bold text-red-800/20 text-center flex-col transform rotate-12 select-none print:hidden">
            <span>Corporate Seal</span>
            <span className="font-extrabold text-[8px] tracking-widest text-red-800/30">HSRCT LTD</span>
            <span>PROSPECTUS</span>
          </div>

          {/* DOCUMENT BODY */}
          <div className="flex flex-col gap-8 text-[#1A1916]">
            
            {/* Title Page Block */}
            <div className="text-center pb-8 border-b-2 border-black flex flex-col gap-2 relative">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] font-extrabold text-[#7D7A73]">OFFICIAL CORPORATE REPORT — SECURE ARCHIVE</span>
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-black border border-black/20 px-2 py-0.5 mx-auto rounded-sm mt-1">Doc Code: {registrationCode}</span>
              
              <h2 className="text-3xl font-normal uppercase tracking-tight text-black mt-4 font-sans leading-none">
                Corporate Prospectus & Corporate Value Document
              </h2>
              <span className="text-xs uppercase tracking-widest font-mono text-[#7D7A73] mt-1 italic">MAPPING INTERACTIVE SIMULATIONS TO TANGIBLE PRODUCTIVITY GAINS</span>
              
              <div className="w-16 h-[1.5px] bg-black mx-auto mt-6" />
              
              <h3 className="text-base font-extrabold tracking-widest uppercase mt-4 text-[#1A1A1A] font-sans text-center">
                {companyName}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto font-mono text-[9px] text-[#7D7A73] uppercase mt-10 border border-dashed border-black/20 p-3.5 bg-[#FCFBF8]">
                <div className="text-left">
                  <span>SYSTEM RELEASE:</span>
                  <div className="font-extrabold text-black">VERSION 2.1 — 2026</div>
                </div>
                <div className="text-right">
                  <span>JURISDICTION:</span>
                  <div className="font-extrabold text-black">GLOBAL ARCHITECTURE</div>
                </div>
              </div>
            </div>

            {/* Part 1: Strategic Value Proposition */}
            {(activeSection === 'all' || activeSection === 'benefits') && (
              <div className="flex flex-col gap-6 animate-fade-in pt-4">
                <div className="flex items-center gap-2 border-b border-black pb-1.5">
                  <TrendingUp size={18} className="text-black shrink-0" />
                  <h4 className="font-sans font-bold uppercase tracking-widest text-[#1A1A1A] text-xs">
                    PART I — EXECUTIVE VALUE PROPOSITION & USER BENEFITS
                  </h4>
                </div>

                <div className="flex flex-col gap-5 text-[12.5px] text-[#2C2B26]">
                  <p className="leading-relaxed">
                    The core spatial software suite resolves the disconnect between conceptual blueprint planning, physical human anatomy proportions, and accurate logistical site procurement. By grounding every millimeter of digital design in physical benchmarks, our customers realize compound cost, time, and safety benefits.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="border border-black p-4 bg-[#FAF9F5] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      <span className="font-sans font-extrabold text-[10px] text-black tracking-wider uppercase block mb-1.5 flex items-center gap-1">
                        <CheckCircle size={12} className="text-green-700" /> FOR SELF-BUILDERS & RESIDENTS
                      </span>
                      <ul className="list-disc pl-5 font-sans text-[11.5px] space-y-1.5 text-studio-gray leading-relaxed">
                        <li><strong>Prevents Claustrophobia:</strong> Overrides dry architectural layouts using real live human outlines to secure comfortable movement clearances.</li>
                        <li><strong>Bill Verification:</strong> Enables direct mathematics calculation to easily audit expensive sub-contractor materials quotes.</li>
                        <li><strong>Informed Decision Making:</strong> Adjust room height, depth, and length dynamically before committing heavy capital.</li>
                      </ul>
                    </div>

                    <div className="border border-black p-4 bg-[#FAF9F5] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      <span className="font-sans font-extrabold text-[10px] text-black tracking-wider uppercase block mb-1.5 flex items-center gap-1">
                        <CheckCircle size={12} className="text-green-700" /> FOR PRACTITIONERS & ARCHITECTS
                      </span>
                      <ul className="list-disc pl-5 font-sans text-[11.5px] space-y-1.5 text-studio-gray leading-relaxed">
                        <li><strong>Frictionless Spatial Prototyping:</strong> Evade loading heavy standalone programs during initial concept meetings.</li>
                        <li><strong>Dynamic Client Sign-off:</strong> Use responsive walkthrough tours and furniture configurations to build fast visual trust.</li>
                        <li><strong>Instant Vector Exports:</strong> Download STL models, accurate OBJ layouts, and clean CAD-ready SVGs instantly.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border border-black p-4 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] mt-2">
                    <span className="font-sans font-extrabold text-[10px] text-black tracking-wider uppercase block mb-1 bg-yellow-500/10 px-1 py-0.5 w-fit">
                      THE PROCUREMENT BOTTLENECK REMEDY
                    </span>
                    <p className="pl-2 leading-relaxed text-[12px]">
                      By integrating the <strong>Procurement and Material Estimator</strong> as a core software widget, builders completely avoid over-budgeting. Manual estimation errors on concrete slab pouring and blockwork layers account for an estimated <strong>12% to 18% of aggregate material waste</strong> in localized builds; our automated volume engine cuts this down to less than 1.5%.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Part 2: Product Specifications & Logic */}
            {(activeSection === 'all' || activeSection === 'specifications') && (
              <div className="flex flex-col gap-6 animate-fade-in pt-4">
                <div className="flex items-center gap-2 border-b border-black pb-1.5">
                  <FileText size={18} className="text-black shrink-0" />
                  <h4 className="font-sans font-bold uppercase tracking-widest text-[#1A1A1A] text-xs">
                    PART II — OPERATIONAL SPECIFICATIONS & PRODUCT FEATURES
                  </h4>
                </div>

                <div className="flex flex-col gap-5 text-[12.5px] text-[#2C2B26]">
                  <div>
                    <span className="font-sans font-extrabold text-[10px] text-black tracking-wider uppercase block mb-1">
                      1. CONTINUOUS PARAMETRIC SLIDER ENGINE
                    </span>
                    <p className="pl-4">
                      Direct reactive bind values for room Width (W: 2.0m to 12.0m), Depth (D: 2.0m to 12.0m), and Height (H: 2.0m to 4.5m) to continuously update sub-structure and finishing cost estimations instantly in raw client viewports.
                    </p>
                  </div>

                  <div>
                    <span className="font-sans font-extrabold text-[10px] text-black tracking-wider uppercase block mb-1">
                      2. SPATIAL PRESET MATRICES
                    </span>
                    <p className="pl-4 leading-relaxed">
                      Custom-configured furniture and spacing constraints including primary Bedroom patterns, Double-Desk Studios, Lounge concepts, and Compact setups with customized default heights to test specialized use cases instantly.
                    </p>
                  </div>

                  <div>
                    <span className="font-sans font-extrabold text-[10px] text-black tracking-wider uppercase block mb-1">
                      3. BULLETPROOF QUANTITY CALCULATOR ALGORITHMS
                    </span>
                    <p className="pl-4 leading-relaxed mb-3">
                      The application extracts dimensional boundaries to calculate structural quantities cleanly on the client-side:
                    </p>
                    <ul className="list-decimal pl-9 space-y-2.5 font-sans text-[12px]">
                      <li>
                        <strong>Sub-Structure Foundation Concrete:</strong> Implements a 300mm standard structural thickness with a continuous strip layout to output exact cubic volume requirements (m³).
                        <div className="font-mono text-[10px] mt-1 bg-gray-50 p-1.5 border border-dashed border-black/10 text-studio-gray">
                          Formula: Volume = Space Circumference × widthOffset (0.6m) × thickness (0.3m)
                        </div>
                      </li>
                      <li>
                        <strong>Timber Framing Logistical Span:</strong> Establishes timber studs lengths based on standard 400mm framing grids. Returns exact linear floorboard yards for heavy rafters.
                      </li>
                      <li>
                        <strong>Masonry Unit Discretization:</strong> Converts continuous vertical walls into exact unit counts for heavy Sandcrete Hollow blocks (450x225x225mm) or standard Clay facing bricks, complete with waste tolerances.
                      </li>
                      <li>
                        <strong>Surface Finishing Area (Pl plastering coat):</strong> Predicts dual-faced interior and exterior cement rendering area requirements to secure painters metrics.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <span className="font-sans font-extrabold text-[10px] text-black tracking-wider uppercase block mb-1">
                      4. CLOUD SYNCHRONIZATION LEDGER
                    </span>
                    <p className="pl-4">
                      Backed by secure, cloud-hosted <strong>Firebase Firestore</strong> databases to persist portfolio entries, giving scale specialists secure document storage across desktop and mobile sessions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Part 3: Registry & Corporate Growth Allocations */}
            {(activeSection === 'all' || activeSection === 'growth') && (
              <div className="flex flex-col gap-6 animate-fade-in pt-4">
                <div className="flex items-center gap-2 border-b border-black pb-1.5">
                  <Landmark size={18} className="text-black shrink-0" />
                  <h4 className="font-sans font-bold uppercase tracking-widest text-[#1A1A1A] text-xs">
                    PART III — INSTITUTIONAL EQUITY & ALLOCATIONS
                  </h4>
                </div>

                <div className="flex flex-col gap-5 text-[12.5px] text-[#2C2B26]">
                  <p className="pl-4 italic leading-relaxed text-[#7D7A73]">
                    The following tables represent corporate share allocation indices, establishing permanent ownership under the primary developer.
                  </p>

                  <div className="border border-black overflow-hidden font-mono text-[10px] shadow-[2px_2px_0_0_rgba(0,0,0,1)] mx-4 bg-[#FAF9F5]">
                    <div className="grid grid-cols-12 bg-black text-white p-2 text-center uppercase tracking-widest font-bold">
                      <div className="col-span-6 text-left pl-2">Governing Stakeholder</div>
                      <div className="col-span-3">Strategic Shares</div>
                      <div className="col-span-3 text-right pr-2">Voting Rights</div>
                    </div>
                    <div className="grid grid-cols-12 border-b border-black/10 p-2 text-center items-center bg-white">
                      <div className="col-span-6 text-left pl-2 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full shrink-0" />
                        {primaryGovernor}
                      </div>
                      <div className="col-span-3 font-semibold">9,000,000</div>
                      <div className="col-span-3 text-right pr-2 font-extrabold text-blue-600">90.0%</div>
                    </div>
                    <div className="grid grid-cols-12 p-2 text-center items-center">
                      <div className="col-span-6 text-left pl-2 font-semibold italic text-[#7D7A73] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full shrink-0" />
                        Spatial Treasury Reserve Pool
                      </div>
                      <div className="col-span-3 font-semibold">1,000,000</div>
                      <div className="col-span-3 text-right pr-2 font-extrabold text-gray-400">10.0%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Attestation Signature area */}
            <div className="mt-12 pt-8 border-t border-black border-dashed flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col gap-1 text-[11px] font-mono uppercase text-[#7D7A73]">
                <span>Certified Corporate Prospectus</span>
                <span>Verification ID: <strong className="text-black">1F9A27D3E8BAF9CC</strong></span>
                <span>Issued in compliance with structural code of practice</span>
              </div>

              <div className="flex flex-col items-center text-center p-4 border border-black bg-[#FCFBF8] shadow-[2px_2px_0_0_rgba(0,0,0,1)] relative max-w-sm">
                <div className="absolute top-1 left-2 font-mono text-[6px] uppercase tracking-widest text-[#7D7A73]">Founding Seal_</div>
                <div className="py-2.5 px-4 font-serif italic text-lg text-black font-extrabold relative select-none z-10">
                  {primaryGovernor.split('@')[0]}
                  <span className="absolute bottom-1 right-0 text-[10px] font-sans font-extrabold text-black/25 uppercase shrink-0">SIGNED</span>
                </div>
                <div className="border-t border-black/30 pt-1 text-[9px] uppercase font-mono font-extrabold text-black">
                  CHIEF PRODUCT DIRECTOR
                </div>
                <span className="text-[7.5px] font-mono uppercase text-[#7D7A73] mt-0.5">{primaryGovernor}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Corporate Ledger Footer */}
      <div className="mt-12 border-t border-black/20 pt-6 flex flex-col sm:flex-row justify-between items-center text-[#7D7A73] text-[9px] font-mono uppercase tracking-widest">
        <span>© 2026 HUMAN SCALE REALITY CHECK TECHNOLOGIES LTD</span>
        <span>ISSUED BY GEEPEE COGNITIVE SECRETARY</span>
      </div>
    </div>
  );
}
