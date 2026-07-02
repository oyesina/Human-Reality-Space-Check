import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, Hammer, Check, Sliders, Globe, ChevronDown, 
  ChevronUp, Download, Sparkles, HelpCircle 
} from 'lucide-react';

interface ProcurementEstimatorProps {
  width: number;
  depth: number;
  height: number;
}

type MaterialGrade = 'economy' | 'premium' | 'bespoke';
type RegionalMarket = 'us_urban' | 'us_suburban' | 'eu_west' | 'uk_london' | 'asia_tokyo';

interface CurrencyInfo {
  symbol: string;
  code: string;
  rate: number; // to base USD
}

interface CostItem {
  name: string;
  category: 'structural' | 'finishes' | 'flooring' | 'coating' | 'labor';
  qty: number;
  unit: string;
  defaultUnitPrice: number; // in base USD
  description: string;
}

const REGIONAL_MARKETS: Record<RegionalMarket, { label: string; multiplier: number; currency: keyof typeof CURRENCIES }> = {
  us_urban: { label: "US - Metro High Complexity (NY/SF)", multiplier: 1.45, currency: 'USD' },
  us_suburban: { label: "US - Standard Regional Baseline", multiplier: 1.00, currency: 'USD' },
  eu_west: { label: "EU - Western Europe (Paris/Berlin)", multiplier: 1.12, currency: 'EUR' },
  uk_london: { label: "UK - Southeastern Corridor (London)", multiplier: 1.25, currency: 'GBP' },
  asia_tokyo: { label: "JP - Kanto Metropolitan (Tokyo)", multiplier: 0.95, currency: 'JPY' },
};

const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', rate: 1.0 },
  EUR: { symbol: '€', code: 'EUR', rate: 0.92 },
  GBP: { symbol: '£', code: 'GBP', rate: 0.79 },
  JPY: { symbol: '¥', code: 'JPY', rate: 156.0 },
};

export default function ProcurementEstimator({ width, depth, height }: ProcurementEstimatorProps) {
  const [grade, setGrade] = useState<MaterialGrade>('premium');
  const [market, setMarket] = useState<RegionalMarket>('us_suburban');
  const [wallSystem, setWallSystem] = useState<'timber' | 'sandcrete' | 'brick'>('sandcrete');
  const [includeRendering, setIncludeRendering] = useState<boolean>(true);
  const [laborSlider, setLaborSlider] = useState<number>(1.0); // modifier
  const [customRates, setCustomRates] = useState<Record<string, number>>({});
  const [showCustomPricing, setShowCustomPricing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const selectedMarket = REGIONAL_MARKETS[market];
  const currency = CURRENCIES[selectedMarket.currency];

  // Helper to trigger transient alerts safely
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  // Dimensional calculation formulas
  const calculations = useMemo(() => {
    const area = width * depth;
    const perimeter = 2 * (width + depth);
    const wallArea = perimeter * height;
    
    // Concrete foundation thickness: 150mm (0.15m)
    const foundationConcreteVol = area * 0.15; 
    
    // Timber Joists spacing: 400mm (0.4m)
    // Timber framing lengths (m)
    const ceilingJoistsMeters = (Math.ceil(width / 0.4) * depth) + (Math.ceil(depth / 0.4) * width);
    const wallStudsMeters = (perimeter / 0.4) * height;
    
    // Gypsum Drywall Boards (standard sheet aspect: 1.2m x 2.4m = 2.88 m2)
    const drywallSheets = wallSystem === 'timber' ? Math.ceil(wallArea / 2.88) : 0;
    
    // Sandcrete walling: 10 blocks (450x225x225mm) per m2
    const sandcreteBlockQty = wallSystem === 'sandcrete' ? Math.ceil(wallArea * 10) : 0;
    
    // Clay Brick walling: 110 bricks (double-skin structure) per m2
    const brickQty = wallSystem === 'brick' ? Math.ceil(wallArea * 110) : 0;
    
    // Cement Mortar Rendering: double-faced (inside & outside rendered space)
    const renderingArea = (wallSystem === 'sandcrete' && includeRendering) ? Math.ceil(wallArea * 2) : 0;
    
    // Flooring sound dampening insulation & boards
    const flooringArea = area;
    
    // Interior paint (dual coat, covering approx 16 m2 per gallon)
    const paintGallons = Math.ceil(wallArea / 16.0); // 16 m2 / gallon for dual coat real coverage
    
    // Labor hours estimate
    const foundationHours = foundationConcreteVol * 4.5;
    
    let wallLaborHours = 0;
    if (wallSystem === 'timber') {
      const totalStructuralTimber = ceilingJoistsMeters + wallStudsMeters;
      wallLaborHours = (totalStructuralTimber * 0.04) + (drywallSheets * 0.35);
    } else if (wallSystem === 'sandcrete') {
      // blocks masonry speed: ~0.15 hr per block, plus rendering speed: ~0.25 hr per m2
      wallLaborHours = (ceilingJoistsMeters * 0.04) + (sandcreteBlockQty * 0.15) + (renderingArea * 0.25);
    } else if (wallSystem === 'brick') {
      // bricklaying speed: ~0.08 hr per brick (more brick joints)
      wallLaborHours = (ceilingJoistsMeters * 0.04) + (brickQty * 0.08);
    }
    
    const flooringHours = flooringArea * 0.25;
    const paintingHours = paintGallons * 1.8;
    const totalLaborHours = foundationHours + wallLaborHours + flooringHours + paintingHours;

    return {
      area,
      perimeter,
      wallArea,
      foundationConcreteVol,
      ceilingJoistsMeters,
      wallStudsMeters,
      drywallSheets,
      sandcreteBlockQty,
      brickQty,
      renderingArea,
      flooringArea,
      paintGallons,
      totalLaborHours,
    };
  }, [width, depth, height, wallSystem, includeRendering]);

  // Material Grade Unit Prices (Base USD)
  const GRADES_PRICE_BOOK: Record<MaterialGrade, Record<string, { price: number; desc: string; unit: string }>> = {
    economy: {
      concrete: { price: 110, desc: "Standard Builder Grade Sand/Slag Mix", unit: "m³" },
      timber: { price: 3.8, desc: "Sourced Spruce-Pine-Fir Utility Wood", unit: "m" },
      drywall: { price: 8.5, desc: "9.5mm Standard Gypsum Wallboard", unit: "sheets" },
      sandcrete: { price: 1.15, desc: "Standard 150mm (6\") Sandcrete Hollow Block", unit: "blocks" },
      brick: { price: 0.38, desc: "Local Wirecut Red Clay Facing Brick", unit: "bricks" },
      rendering: { price: 5.50, desc: "1:4 Cement-Sand Plaster Coat 12mm", unit: "m²" },
      flooring: { price: 18.0, desc: "Resilient Floating Bamboo & Laminate Planks", unit: "m²" },
      paint: { price: 22.0, desc: "Contractor Acrylic White Base Paint", unit: "gallons" },
      labor: { price: 28.0, desc: "Regional Apprentice Carpentry / Masonry", unit: "hrs" },
    },
    premium: {
      concrete: { price: 165, desc: "Reinforced Fiber Portland High Strength Cement", unit: "m³" },
      timber: { price: 8.2, desc: "Pressure Treated Kiln-Dried Larch Joists", unit: "m" },
      drywall: { price: 14.5, desc: "12.5mm Moisture Resistant Multi-Board", unit: "sheets" },
      sandcrete: { price: 1.95, desc: "Load-bearing 150mm Vibrated Sandcrete Block", unit: "blocks" },
      brick: { price: 0.85, desc: "Machine Pressed Smooth Architectural Red Brick", unit: "bricks" },
      rendering: { price: 12.00, desc: "Acrylic Modified Damp-Proof Cement Render 15mm", unit: "m²" },
      flooring: { price: 48.0, desc: "Engineered Oak Hardwood Flooring & Underlay", unit: "m²" },
      paint: { price: 45.0, desc: "Ultra-Premium Scrubbable Matte Finish Tint", unit: "gallons" },
      labor: { price: 48.0, desc: "Experienced Licensed Union Specialists", unit: "hrs" },
    },
    bespoke: {
      concrete: { price: 290, desc: "Micro-cement Polished Architectural Foundation", unit: "m³" },
      timber: { price: 19.5, desc: "Selected Solid Structural Fir & Acoustic Glue-lam", unit: "m" },
      drywall: { price: 28.0, desc: "High-Acoustic Fire-Rated Fiberboard Systems", unit: "sheets" },
      sandcrete: { price: 3.50, desc: "Acoustically-insulated Engineered Block Cores", unit: "blocks" },
      brick: { price: 2.15, desc: "Handmade Reclaimed Waterstruck Clay Facing Brick", unit: "bricks" },
      rendering: { price: 26.00, desc: "Lime-Cement Render with Polished Tadelakt Sealing", unit: "m²" },
      flooring: { price: 115.0, desc: "Eco-certified Solid Teak or Terrazzo Tile Modules", unit: "m²" },
      paint: { price: 85.0, desc: "Ecological Low-VOC Mineral Silicate Paint", unit: "gallons" },
      labor: { price: 85.0, desc: "Master Craftsman & Custom Joinery Team", unit: "hrs" },
    }
  };

  // Compile active prices mapped with region multiplier & currency conversion
  const items = useMemo<CostItem[]>(() => {
    const rawPriceBook = GRADES_PRICE_BOOK[grade];
    const regionalMult = selectedMarket.multiplier;
    const currencyMult = currency.rate;

    const getPrice = (key: string) => {
      if (customRates[key] !== undefined) {
        return customRates[key];
      }
      return parseFloat((rawPriceBook[key].price * regionalMult * currencyMult).toFixed(2));
    };

    const compiled: CostItem[] = [
      {
        name: "Foundation Slab (Concrete Vol.)",
        category: "structural",
        qty: calculations.foundationConcreteVol,
        unit: "m³",
        defaultUnitPrice: getPrice('concrete'),
        description: rawPriceBook.concrete.desc
      }
    ];

    // Structural columns and framing based on system
    if (wallSystem === 'timber') {
      compiled.push({
        name: "Structural Wall & Joist Lumber",
        category: "structural",
        qty: calculations.ceilingJoistsMeters + calculations.wallStudsMeters,
        unit: "m",
        defaultUnitPrice: getPrice('timber'),
        description: rawPriceBook.timber.desc
      });
      compiled.push({
        name: "Gypsum Drywall Cladding Pieces",
        category: "finishes",
        qty: calculations.drywallSheets,
        unit: "pcs",
        defaultUnitPrice: getPrice('drywall'),
        description: rawPriceBook.drywall.desc
      });
    } else {
      // Masonry walls only need ceiling rafters / Joists for structural wood
      compiled.push({
        name: "Ceiling Joists Framing Lumber",
        category: "structural",
        qty: calculations.ceilingJoistsMeters,
        unit: "m",
        defaultUnitPrice: getPrice('timber'),
        description: rawPriceBook.timber.desc
      });

      if (wallSystem === 'sandcrete') {
        compiled.push({
          name: "Heavy Vibrated Sandcrete Blockwork",
          category: "structural",
          qty: calculations.sandcreteBlockQty,
          unit: "blocks",
          defaultUnitPrice: getPrice('sandcrete'),
          description: rawPriceBook.sandcrete.desc
        });

        if (includeRendering) {
          compiled.push({
            name: "Cement Mortar Wall Rendering",
            category: "finishes",
            qty: calculations.renderingArea,
            unit: "m²",
            defaultUnitPrice: getPrice('rendering'),
            description: rawPriceBook.rendering.desc
          });
        }
      } else if (wallSystem === 'brick') {
        compiled.push({
          name: "Structural Clay Brick Walling",
          category: "structural",
          qty: calculations.brickQty,
          unit: "bricks",
          defaultUnitPrice: getPrice('brick'),
          description: rawPriceBook.brick.desc
        });
      }
    }

    // Common flooring, finishes, painting, labor
    compiled.push(
      {
        name: "Premium Finished Floor Planks",
        category: "flooring",
        qty: calculations.flooringArea,
        unit: "m²",
        defaultUnitPrice: getPrice('flooring'),
        description: rawPriceBook.flooring.desc
      },
      {
        name: "Wall Paint & Bonding Primers",
        category: "coating",
        qty: calculations.paintGallons,
        unit: "gal",
        defaultUnitPrice: getPrice('paint'),
        description: rawPriceBook.paint.desc
      },
      {
        name: "On-Site Architectural Labor Force",
        category: "labor",
        qty: calculations.totalLaborHours * laborSlider,
        unit: "hrs",
        defaultUnitPrice: getPrice('labor'),
        description: rawPriceBook.labor.desc
      }
    );

    return compiled;
  }, [calculations, grade, market, wallSystem, includeRendering, laborSlider, customRates, currency.rate, selectedMarket.multiplier]);

  // Total summary tallies
  const tallies = useMemo(() => {
    let subtotal = 0;
    let materialCost = 0;
    let laborCost = 0;

    items.forEach(itm => {
      const lineTotal = itm.qty * itm.defaultUnitPrice;
      subtotal += lineTotal;
      if (itm.category === 'labor') {
        laborCost += lineTotal;
      } else {
        materialCost += lineTotal;
      }
    });

    // Contingency reserve budget (Standard 8.5% for builders risk)
    const contingencyRate = 0.085;
    const contingency = subtotal * contingencyRate;
    const grandTotal = subtotal + contingency;

    return {
      materialCost,
      laborCost,
      subtotal,
      contingency,
      grandTotal,
    };
  }, [items]);

  // Interactive local adjustments reset
  const handleResetCustomPricing = () => {
    setCustomRates({});
    setLaborSlider(1.0);
    triggerNotification("Reset baseline prices back to official spec books!");
  };

  const updateCustomRate = (key: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setCustomRates(prev => ({ ...prev, [key]: num }));
    }
  };

  // CSV Exporter for general contractors or client presentation
  const handleExportCSVReport = () => {
    const header = [
      "Material/Service Item Name",
      "Category",
      "Calculated Qty",
      "Unit",
      `Unit Cost (${currency.code})`,
      `Total Cost (${currency.code})`,
      "Specification Description"
    ].join(",");

    const rows = items.map(itm => {
      const rowTotal = (itm.qty * itm.defaultUnitPrice).toFixed(2);
      return [
        `"${itm.name}"`,
        `"${itm.category.toUpperCase()}"`,
        itm.qty.toFixed(2),
        `"${itm.unit}"`,
        itm.defaultUnitPrice.toFixed(2),
        rowTotal,
        `"${itm.description}"`
      ].join(",");
    });

    // Summary calculations
    const summaryRows = [
      "",
      `"Material Subtotal",,,,"${currency.symbol}${tallies.materialCost.toFixed(2)}"`,
      `"Labor Subtotal",,,,"${currency.symbol}${tallies.laborCost.toFixed(2)}"`,
      `"Builder Risk Contingency (8.5%)",,,,"${currency.symbol}${tallies.contingency.toFixed(2)}"`,
      `"ESTIMATED PROJECT BUDGET",,,,"${currency.symbol}${tallies.grandTotal.toFixed(2)}"`
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows, ...summaryRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `material_estimator_${width}x${depth}x${height}_${grade}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("Procurement ledger exported as .CSV successfully!");
  };

  // Progress percentage breakdowns
  const percentages = useMemo(() => {
    const materialPercent = (tallies.materialCost / (tallies.subtotal || 1)) * 100;
    const laborPercent = (tallies.laborCost / (tallies.subtotal || 1)) * 100;
    return {
      material: materialPercent.toFixed(0),
      labor: laborPercent.toFixed(0)
    };
  }, [tallies]);

  return (
    <div className="w-full bg-white border border-black p-5 md:p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col gap-6 relative select-none">
      {/* Dynamic inline notification feedback */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 right-4 bg-black text-white px-3 py-1.5 text-[9px] uppercase tracking-widest font-mono z-50 border border-white"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-studio-gray block font-mono">
              FINANCIAL VIABILITY ENGINE
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-wider rounded">
              Investor Ready
            </span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-black mt-1 flex items-center gap-2">
            <Coins className="w-5 h-5 stroke-[2] shrink-0" />
            Procurement & Budget Estimator
          </h2>
          <p className="text-[10px] text-studio-gray font-mono uppercase mt-1 leading-snug">
            Spatially Derived Bill of Materials • Real-Time General Contractor Quotation Ledger
          </p>
        </div>

        <button 
          onClick={handleExportCSVReport}
          className="flex items-center justify-center gap-2 border border-black px-3.5 py-2 text-[10px] uppercase font-mono tracking-wider font-extrabold hover:bg-black hover:text-white transition-all bg-white"
          title="Export CSV architectural quotation bill"
        >
          <Download size={12} />
          <span>Export Bill (.CSV)</span>
        </button>
      </div>

      {/* Toggles and Variables Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-stone-50 border border-black p-4 font-mono text-black">
        {/* Material Grade Column */}
        <div className="lg:col-span-5 flex flex-col gap-1.5 justify-center">
          <span className="text-[9px] uppercase font-bold text-studio-gray block">Architectural Material Grade</span>
          <div className="grid grid-cols-3 gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] border border-black bg-white">
            {(['economy', 'premium', 'bespoke'] as MaterialGrade[]).map(g => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`py-1.5 text-[9px] uppercase font-bold tracking-tight transition-all border-r border-black last:border-0 cursor-pointer ${
                  grade === g ? 'bg-black text-white' : 'bg-white text-black hover:bg-stone-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Regional Market Select */}
        <div className="lg:col-span-4 flex flex-col gap-1.5 justify-center">
          <span className="text-[9px] uppercase font-bold text-studio-gray block">Regional Market Multiplier</span>
          <div className="relative border border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as RegionalMarket)}
              className="w-full bg-transparent px-2.5 py-1.5 text-[9px] uppercase font-bold tracking-tight pr-8 outline-none cursor-pointer appearance-none text-black"
            >
              {Object.entries(REGIONAL_MARKETS).map(([key, item]) => (
                <option key={key} value={key} className="text-black bg-white uppercase">
                  {item.label} (x{item.multiplier.toFixed(2)})
                </option>
              ))}
            </select>
            <div className="absolute top-1/2 -translate-y-1/2 right-2.5 pointer-events-none text-black">
              <ChevronDown size={11} />
            </div>
          </div>
        </div>

        {/* Labor Adjuster */}
        <div className="lg:col-span-3 flex flex-col gap-1.5 justify-center">
          <div className="flex justify-between text-[9px] uppercase font-bold text-studio-gray">
            <span>Labor Multiplier</span>
            <span className="text-black font-extrabold">{laborSlider.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={laborSlider}
              onChange={(e) => setLaborSlider(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-black/10 rounded-sm appearance-none cursor-pointer accent-black"
            />
          </div>
        </div>
      </div>

      {/* Walling Material & Plaster Rendering Finishing Selectors */}
      <div id="estimator-materials" className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-black p-4 bg-[#FAF9F5]/70 font-mono text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
        <div>
          <span className="text-[9px] uppercase font-bold text-studio-gray block mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-black rounded-full" /> Walling Material Specification
          </span>
          <div className="grid grid-cols-3 gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] border border-black bg-white">
            <button
              onClick={() => { setWallSystem('sandcrete'); triggerNotification("Switched to load-bearing Sandcrete block masonry configuration."); }}
              className={`py-2 text-[8.5px] uppercase font-bold tracking-tight transition-all border-r border-black last:border-0 cursor-pointer ${
                wallSystem === 'sandcrete' ? 'bg-black text-white' : 'bg-white text-black hover:bg-stone-100'
              }`}
            >
              Sandcrete Blocks
            </button>
            <button
              onClick={() => { setWallSystem('brick'); triggerNotification("Switched to structural Clay Brick masonry configuration."); }}
              className={`py-2 text-[8.5px] uppercase font-bold tracking-tight transition-all border-r border-black last:border-0 cursor-pointer ${
                wallSystem === 'brick' ? 'bg-black text-white' : 'bg-white text-black hover:bg-stone-100'
              }`}
            >
              Clay Bricks
            </button>
            <button
              onClick={() => { setWallSystem('timber'); triggerNotification("Switched to Timber Framing studs + Gypsum drywall sheets."); }}
              className={`py-2 text-[8.5px] uppercase font-bold tracking-tight transition-all border-r border-black last:border-0 cursor-pointer ${
                wallSystem === 'timber' ? 'bg-black text-white' : 'bg-white text-black hover:bg-stone-100'
              }`}
            >
              Timber Studs
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-[9px] uppercase font-bold text-studio-gray block mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-black rounded-full" /> Surface Finishing Option
          </span>
          {wallSystem === 'sandcrete' ? (
            <label className="flex items-center gap-2.5 cursor-pointer bg-white p-2 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] select-none">
              <input
                type="checkbox"
                checked={includeRendering}
                onChange={(e) => {
                  setIncludeRendering(e.target.checked);
                  triggerNotification(e.target.checked ? "Added cement-sand mortar rendering coat (both sides)." : "Exposed Sandcrete masonry surface layout.");
                }}
                className="w-4.5 h-4.5 accent-black cursor-pointer border-black"
              />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-extrabold leading-none text-black">Cement Mortar Plaster Rendering</span>
                <span className="text-[7.5px] text-studio-gray font-normal italic mt-0.5 leading-none">Apply 12-15mm finish plaster to both sides</span>
              </div>
            </label>
          ) : wallSystem === 'brick' ? (
            <div className="bg-white/50 p-2.5 border border-black border-dashed text-[8px] text-studio-gray font-extrabold uppercase italic flex items-center justify-center h-full">
              Clay Brick facing left exposed (Natural pointed joints)
            </div>
          ) : (
            <div className="bg-white/50 p-2.5 border border-black border-dashed text-[8px] text-studio-gray font-extrabold uppercase italic flex items-center justify-center h-full">
              Standard Drywall painted coat system active
            </div>
          )}
        </div>
      </div>

      {/* Bill of Quantities Table */}
      <div className="border border-black overflow-x-auto shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <table className="w-full text-left font-mono text-[9px] border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-black text-white uppercase text-[8px] tracking-widest font-bold">
              <th className="p-2.5 border-r border-white/20">Specification Item Name</th>
              <th className="p-2.5 border-r border-white/20 text-center w-16">Qty</th>
              <th className="p-2.5 border-r border-white/20 text-center w-10">Unit</th>
              <th className="p-2.5 border-r border-white/20 text-right w-24">Unit Rate</th>
              <th className="p-2.5 text-right w-28">Total Estimated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/15 text-black">
            {items.map((itm, idx) => {
              const rowTotal = itm.qty * itm.defaultUnitPrice;
              return (
                <tr key={idx} className="hover:bg-amber-50/20 group transition-colors">
                  <td className="p-2.5 border-r border-black/15">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold uppercase text-black group-hover:underline text-[9.5px]">
                        {idx + 1}. {itm.name}
                      </span>
                      <span className="text-[8px] text-studio-gray italic font-normal line-clamp-1">
                        {itm.description}
                      </span>
                    </div>
                  </td>
                  <td className="p-2.5 border-r border-black/15 text-center font-extrabold bg-stone-50/30">
                    {itm.qty.toFixed(2)}
                  </td>
                  <td className="p-2.5 border-r border-black/15 text-center text-studio-gray">
                    {itm.unit}
                  </td>
                  <td className="p-2.5 border-r border-black/15 text-right font-bold">
                    {currency.symbol}{itm.defaultUnitPrice.toFixed(2)}
                  </td>
                  <td className="p-2.5 text-right font-black bg-stone-50/10 text-[9.5px]">
                    {currency.symbol}{rowTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fine-Tune Rates Panel */}
      <div className="border border-black">
        <button
          onClick={() => setShowCustomPricing(!showCustomPricing)}
          className="w-full flex items-center justify-between p-3 bg-stone-100 hover:bg-stone-200 uppercase font-mono text-[9px] font-extrabold tracking-wider transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" />
            Fine-Tune Cost Rates and Labor Standards
          </span>
          {showCustomPricing ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <AnimatePresence>
          {showCustomPricing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-black bg-stone-50/35"
            >
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-[9px] text-black">
                {/* Custom Concrete */}
                <div className="flex flex-col gap-1">
                  <span className="text-studio-gray uppercase font-bold">Concrete Rate ({currency.symbol}/m³)</span>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      step="1"
                      className="border border-black p-1 text-[10px] w-full bg-white outline-none font-bold text-black"
                      placeholder={GRADES_PRICE_BOOK[grade].concrete.price.toString()}
                      value={customRates['concrete'] || ''}
                      onChange={(e) => updateCustomRate('concrete', e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Timber */}
                <div className="flex flex-col gap-1">
                  <span className="text-studio-gray uppercase font-bold">Timber Joists Rate ({currency.symbol}/m)</span>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      step="0.1"
                      className="border border-black p-1 text-[10px] w-full bg-white outline-none font-bold text-black"
                      placeholder={GRADES_PRICE_BOOK[grade].timber.price.toString()}
                      value={customRates['timber'] || ''}
                      onChange={(e) => updateCustomRate('timber', e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Drywall */}
                {wallSystem === 'timber' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-studio-gray uppercase font-bold">Drywall Panels ({currency.symbol}/sheet)</span>
                    <div className="flex gap-1.5">
                      <input 
                        type="number" 
                        step="0.5"
                        className="border border-black p-1 text-[10px] w-full bg-white outline-none font-bold text-black"
                        placeholder={GRADES_PRICE_BOOK[grade].drywall.price.toString()}
                        value={customRates['drywall'] || ''}
                        onChange={(e) => updateCustomRate('drywall', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Custom Sandcrete Block Rate */}
                {wallSystem === 'sandcrete' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-studio-gray uppercase font-bold">Sandcrete Block Rate ({currency.symbol}/block)</span>
                    <div className="flex gap-1.5">
                      <input 
                        type="number" 
                        step="0.05"
                        className="border border-black p-1 text-[10px] w-full bg-white outline-none font-bold text-black"
                        placeholder={GRADES_PRICE_BOOK[grade].sandcrete.price.toString()}
                        value={customRates['sandcrete'] || ''}
                        onChange={(e) => updateCustomRate('sandcrete', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Custom Plaster Rendering Rate */}
                {wallSystem === 'sandcrete' && includeRendering && (
                  <div className="flex flex-col gap-1">
                    <span className="text-studio-gray uppercase font-bold">Mortar Rendering Rate ({currency.symbol}/m²)</span>
                    <div className="flex gap-1.5">
                      <input 
                        type="number" 
                        step="0.10"
                        className="border border-black p-1 text-[10px] w-full bg-white outline-none font-bold text-black"
                        placeholder={GRADES_PRICE_BOOK[grade].rendering.price.toString()}
                        value={customRates['rendering'] || ''}
                        onChange={(e) => updateCustomRate('rendering', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Custom Brick Rate */}
                {wallSystem === 'brick' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-studio-gray uppercase font-bold">Clay Brick Rate ({currency.symbol}/brick)</span>
                    <div className="flex gap-1.5">
                      <input 
                        type="number" 
                        step="0.05"
                        className="border border-black p-1 text-[10px] w-full bg-white outline-none font-bold text-black"
                        placeholder={GRADES_PRICE_BOOK[grade].brick.price.toString()}
                        value={customRates['brick'] || ''}
                        onChange={(e) => updateCustomRate('brick', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Custom Flooring */}
                <div className="flex flex-col gap-1">
                  <span className="text-studio-gray uppercase font-bold">Wood Flooring Rate ({currency.symbol}/m²)</span>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      step="1"
                      className="border border-black p-1 text-[10px] w-full bg-white outline-none font-bold text-black"
                      placeholder={GRADES_PRICE_BOOK[grade].flooring.price.toString()}
                      value={customRates['flooring'] || ''}
                      onChange={(e) => updateCustomRate('flooring', e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Paint */}
                <div className="flex flex-col gap-1">
                  <span className="text-studio-gray uppercase font-bold">Paint Rate ({currency.symbol}/gallon)</span>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      step="1"
                      className="border border-black p-1 text-[10px] w-full bg-white outline-none font-bold text-black"
                      placeholder={GRADES_PRICE_BOOK[grade].paint.price.toString()}
                      value={customRates['paint'] || ''}
                      onChange={(e) => updateCustomRate('paint', e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Labor */}
                <div className="flex flex-col gap-1">
                  <span className="text-studio-gray uppercase font-bold">Labor Hourly ({currency.symbol}/hr)</span>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      step="1"
                      className="border border-black p-1 text-[10px] w-full bg-white outline-none font-bold text-black"
                      placeholder={GRADES_PRICE_BOOK[grade].labor.price.toString()}
                      value={customRates['labor'] || ''}
                      onChange={(e) => updateCustomRate('labor', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tweak actions */}
              <div className="px-4 pb-4 flex justify-end">
                <button
                  onClick={handleResetCustomPricing}
                  className="px-3 py-1 bg-black text-white hover:bg-neutral-800 transition-colors uppercase tracking-wider font-mono text-[8px] font-bold"
                >
                  Reset to Original Standards
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bill receipt outputs & breakdown ratios */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch font-mono text-black">
        {/* Dynamic breakdown graphics */}
        <div className="md:col-span-5 border border-black p-4 flex flex-col justify-between bg-zinc-50/50 shadow-[2px_2px_0_0_rgba(0,0,0,1)] gap-4">
          <div>
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-studio-gray block mb-2.5">
              Spacial Cost Allocation
            </span>
            <div className="flex flex-col gap-3">
              {/* Material Allocation */}
              <div>
                <div className="flex justify-between text-[8px] uppercase font-bold text-black mb-1">
                  <span>Material Components</span>
                  <span>{percentages.material}%</span>
                </div>
                <div className="h-2 w-full bg-stone-200 border border-black relative overflow-hidden">
                  <div 
                    className="h-full bg-black border-r border-black" 
                    style={{ width: `${percentages.material}%` }}
                  />
                </div>
              </div>

              {/* Labor Allocation */}
              <div>
                <div className="flex justify-between text-[8px] uppercase font-bold text-black mb-1">
                  <span>Framing & Finish Labor Force</span>
                  <span>{percentages.labor}%</span>
                </div>
                <div className="h-2 w-full bg-stone-200 border border-black relative overflow-hidden">
                  <div 
                    className="h-full bg-emerald-700/80 border-r border-black" 
                    style={{ width: `${percentages.labor}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[8px] leading-relaxed text-studio-gray uppercase border-t border-black/10 pt-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-black animate-pulse shrink-0" />
            <span>Spatially optimized under ASTM building standards.</span>
          </div>
        </div>

        {/* Ledger invoice budget card */}
        <div className="md:col-span-7 bg-amber-50/25 border-2 border-black p-4 md:p-5 flex flex-col gap-3.5 relative overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-repeat bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:8px_8px] opacity-10" />
          
          <div className="flex justify-between items-baseline border-b border-dashed border-black pb-2.5 z-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-black">Architectural Quotation Summary</span>
            <span className="text-[8px] text-studio-gray uppercase font-extrabold">SHEET ESTIMATE</span>
          </div>

          <div className="flex flex-col gap-2 z-10 text-[9px]">
            <div className="flex justify-between items-center text-studio-gray font-semibold uppercase">
              <span>A. Materials Ledger Subtotal</span>
              <span className="text-black font-extrabold">{currency.symbol}{tallies.materialCost.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-studio-gray font-semibold uppercase">
              <span>B. Construction Labor Force Subtotal</span>
              <span className="text-black font-extrabold">{currency.symbol}{tallies.laborCost.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-studio-gray font-semibold uppercase">
              <span>C. Raw Project Subtotal (A + B)</span>
              <span className="text-black font-bold">{currency.symbol}{tallies.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-studio-gray font-semibold uppercase">
              <span>D. Builder Risk Contingency / Margin (8.5%)</span>
              <span className="text-black font-bold">{currency.symbol}{tallies.contingency.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline border-t-2 border-black pt-3 mt-1.5 z-10 text-black">
            <span className="text-[11px] uppercase tracking-wider font-black">Estimated Project Budget</span>
            <span className="text-xl font-black tracking-tight underline decoration-2 underline-offset-4 decoration-black/50">
              {currency.symbol}{tallies.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
