/**
 * Utility functions for exporting room models to 2D and 3D physical formats
 */

export interface ExportData {
  width: number;
  depth: number;
  height: number;
  roomType: 'none' | 'bedroom' | 'toilet' | 'kitchen' | 'lounge';
  area: number;
  volume: number;
  vibeLabel: string;
  vibeDescription: string;
}

// Helper to format numeric strings in STL/OBJ
const f = (val: number) => val.toFixed(4);

// Box helper for OBJ (returns vertices text and faces text appended with a vertex offset)
function getBoxOBJ(
  x: number, y: number, z: number, 
  w: number, h: number, d: number, 
  vOffset: number, 
  name: string
): { verts: string; faces: string; count: number } {
  const halfW = w / 2;
  const halfD = d / 2;

  // 8 vertices of the box centered around (x, y + h/2, z)
  const verts = [
    `# Box: ${name}`,
    `v ${f(x - halfW)} ${f(y)} ${f(z - halfD)}`, // 1
    `v ${f(x + halfW)} ${f(y)} ${f(z - halfD)}`, // 2
    `v ${f(x + halfW)} ${f(y)} ${f(z + halfD)}`, // 3
    `v ${f(x - halfW)} ${f(y)} ${f(z + halfD)}`, // 4
    `v ${f(x - halfW)} ${f(y + h)} ${f(z - halfD)}`, // 5
    `v ${f(x + halfW)} ${f(y + h)} ${f(z - halfD)}`, // 6
    `v ${f(x + halfW)} ${f(y + h)} ${f(z + halfD)}`, // 7
    `v ${f(x - halfW)} ${f(y + h)} ${f(z + halfD)}`, // 8
  ].join('\n') + '\n';

  // 6 faces
  const faces = [
    `f ${vOffset + 4} ${vOffset + 3} ${vOffset + 2} ${vOffset + 1}`, // bottom
    `f ${vOffset + 1} ${vOffset + 2} ${vOffset + 6} ${vOffset + 5}`, // front
    `f ${vOffset + 2} ${vOffset + 3} ${vOffset + 7} ${vOffset + 6}`, // right
    `f ${vOffset + 3} ${vOffset + 4} ${vOffset + 8} ${vOffset + 7}`, // back
    `f ${vOffset + 4} ${vOffset + 1} ${vOffset + 5} ${vOffset + 8}`, // left
    `f ${vOffset + 5} ${vOffset + 6} ${vOffset + 7} ${vOffset + 8}`, // top
  ].join('\n') + '\n';

  return { verts, faces, count: 8 };
}

// Add box to STL helper (ASCII triangles, 12 triangles per box)
function getBoxSTL(
  x: number, y: number, z: number, 
  w: number, h: number, d: number, 
  name: string
): string {
  const hw = w / 2;
  const hd = d / 2;

  const v = [
    [x - hw, y, z - hd], // 0
    [x + hw, y, z - hd], // 1
    [x + hw, y, z + hd], // 2
    [x - hw, y, z + hd], // 3
    [x - hw, y + h, z - hd], // 4
    [x + hw, y + h, z - hd], // 5
    [x + hw, y + h, z + hd], // 6
    [x - hw, y + h, z + hd], // 7
  ];

  // Helper to add a triangle facet to STL
  const trinBox = (p1: number[], p2: number[], p3: number[]) => {
    // Normal calculation (cross product of edges)
    const ux = p2[0] - p1[0], uy = p2[1] - p1[1], uz = p2[2] - p1[2];
    const vx = p3[0] - p1[0], vy = p3[1] - p1[1], vz = p3[2] - p1[2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    
    return [
      `  facet normal ${f(nx / len)} ${f(ny / len)} ${f(nz / len)}`,
      `    outer loop`,
      `      vertex ${f(p1[0])} ${f(p1[1])} ${f(p1[2])}`,
      `      vertex ${f(p2[0])} ${f(p2[1])} ${f(p2[2])}`,
      `      vertex ${f(p3[0])} ${f(p3[1])} ${f(p3[2])}`,
      `    endloop`,
      `  endfacet`
    ].join('\n');
  };

  // 12 triangles (2 per face)
  return [
    `# Box Facets: ${name}`,
    // bottom
    trinBox(v[3], v[2], v[1]), trinBox(v[3], v[1], v[0]),
    // front
    trinBox(v[0], v[1], v[5]), trinBox(v[0], v[5], v[4]),
    // right
    trinBox(v[1], v[2], v[6]), trinBox(v[1], v[6], v[5]),
    // back
    trinBox(v[2], v[3], v[7]), trinBox(v[2], v[7], v[6]),
    // left
    trinBox(v[3], v[0], v[4]), trinBox(v[3], v[4], v[7]),
    // top
    trinBox(v[4], v[5], v[6]), trinBox(v[4], v[6], v[7]),
  ].join('\n') + '\n';
}

/**
 * 1. GENERATE OBJ (3D Wavefront Mesh Format)
 */
export function generateOBJ(data: ExportData): string {
  let output = `# Human Scale Studio OBJ Export\n`;
  output += `# Date: ${new Date().toISOString()}\n`;
  output += `# Room Dimensions: ${data.width}m x ${data.depth}m x ${data.height}m\n`;
  output += `# Volume Vibe: ${data.vibeLabel}\n\n`;

  let vOffset = 0;
  let vertsStr = '';
  let facesStr = '';

  // A. Room Envelope (Outer shell)
  const room = getBoxOBJ(0, 0, 0, data.width, data.height, data.depth, vOffset, 'Room Bounds');
  vertsStr += room.verts;
  facesStr += room.faces;
  vOffset += room.count;

  // B. Human silhouette structure (1.75m scaled tall figure placeholder)
  // Let us model a physical torso block, a head block, and legs block for cool export styling
  const legs = getBoxOBJ(0, 0, 0, 0.4, 0.7, 0.2, vOffset, 'Human Legs');
  vertsStr += legs.verts;
  facesStr += legs.faces;
  vOffset += legs.count;

  const torso = getBoxOBJ(0, 0.7, 0, 0.5, 0.75, 0.25, vOffset, 'Human Torso');
  vertsStr += torso.verts;
  facesStr += torso.faces;
  vOffset += torso.count;

  const head = getBoxOBJ(0, 1.45, 0, 0.3, 0.3, 0.3, vOffset, 'Human Head');
  vertsStr += head.verts;
  facesStr += head.faces;
  vOffset += head.count;

  // C. Furniture Preset meshes depending on room type
  if (data.roomType === 'bedroom') {
    // Bed frame
    const bed = getBoxOBJ(0, 0, -data.depth * 0.1, 2.0, 0.5, 2.0, vOffset, 'Bed Frame');
    vertsStr += bed.verts;
    facesStr += bed.faces;
    vOffset += bed.count;

    // Pillow
    const pillow = getBoxOBJ(0, 0.5, -data.depth * 0.1 - 0.75, 1.5, 0.15, 0.4, vOffset, 'Pillow');
    vertsStr += pillow.verts;
    facesStr += pillow.faces;
    vOffset += pillow.count;
    
    // Nightstand
    const stand = getBoxOBJ(1.2, 0, -data.depth * 0.1 - 0.75, 0.5, 0.6, 0.5, vOffset, 'Nightstand');
    vertsStr += stand.verts;
    facesStr += stand.faces;
    vOffset += stand.count;
  } else if (data.roomType === 'toilet') {
    // Toilet vanity bowl
    const bowl = getBoxOBJ(-data.width * 0.2, 0, -data.depth * 0.3, 0.5, 0.4, 0.5, vOffset, 'Sanitary Bowl');
    vertsStr += bowl.verts;
    facesStr += bowl.faces;
    vOffset += bowl.count;

    const tank = getBoxOBJ(-data.width * 0.2, 0.4, -data.depth * 0.3 - 0.2, 0.5, 0.5, 0.25, vOffset, 'Sanitary Water Tank');
    vertsStr += tank.verts;
    facesStr += tank.faces;
    vOffset += tank.count;

    // Sink console
    const sink = getBoxOBJ(data.width * 0.2, 0, -data.depth * 0.3, 0.7, 0.8, 0.5, vOffset, 'Vanity Sink');
    vertsStr += sink.verts;
    facesStr += sink.faces;
    vOffset += sink.count;
  } else if (data.roomType === 'kitchen') {
    // Kitchen counter run
    const counter = getBoxOBJ(-data.width * 0.3, 0, 0, 0.6, 0.9, data.depth * 0.6, vOffset, 'Kitchen Counter');
    vertsStr += counter.verts;
    facesStr += counter.faces;
    vOffset += counter.count;

    // Refrigerator
    const fridge = getBoxOBJ(data.width * 0.3, 0, data.depth * 0.3, 0.7, 1.8, 0.7, vOffset, 'Refrigerator Unit');
    vertsStr += fridge.verts;
    facesStr += fridge.faces;
    vOffset += fridge.count;
  } else if (data.roomType === 'lounge') {
    // Sofa unit
    const sofa = getBoxOBJ(0, 0, -data.depth * 0.2, 2.8, 0.6, 1.1, vOffset, 'Lounge Sofa');
    vertsStr += sofa.verts;
    facesStr += sofa.faces;
    vOffset += sofa.count;

    // TV unit
    const tv = getBoxOBJ(0, 0, data.depth * 0.3, 2.2, 0.5, 0.4, vOffset, 'Media Console');
    vertsStr += tv.verts;
    facesStr += tv.faces;
    vOffset += tv.count;
  }

  output += vertsStr + '\n' + facesStr;
  return output;
}

/**
 * 2. GENERATE STL (3D Print Model stereolithography in ASCII format)
 */
export function generateSTL(data: ExportData): string {
  let output = `solid HumanScaleRoomBlueprint\n`;

  // A. Room bounding box
  output += getBoxSTL(0, 0, 0, data.width, data.height, data.depth, 'Room Outside Wireframe');

  // B. Stylized human figure
  output += getBoxSTL(0, 0, 0, 0.4, 0.7, 0.2, 'Human Silhouette Legs');
  output += getBoxSTL(0, 0.7, 0, 0.5, 0.75, 0.25, 'Human Silhouette Torso');
  output += getBoxSTL(0, 1.45, 0, 0.3, 0.3, 0.3, 'Human Silhouette Head');

  // C. Furniture details
  if (data.roomType === 'bedroom') {
    output += getBoxSTL(0, 0, -data.depth * 0.1, 2.0, 0.5, 2.0, 'Double Bed Content');
    output += getBoxSTL(0, 0.5, -data.depth * 0.1 - 0.75, 1.5, 0.15, 0.4, 'Bed Pillow Component');
    output += getBoxSTL(1.2, 0, -data.depth * 0.1 - 0.75, 0.5, 0.6, 0.5, 'Side Drawer Unit');
  } else if (data.roomType === 'toilet') {
    output += getBoxSTL(-data.width * 0.2, 0, -data.depth * 0.3, 0.5, 0.4, 0.5, 'Plumbed Commode Bowl');
    output += getBoxSTL(-data.width * 0.2, 0.4, -data.depth * 0.3 - 0.2, 0.5, 0.5, 0.25, 'Commode Integrated Cistern');
    output += getBoxSTL(data.width * 0.2, 0, -data.depth * 0.3, 0.7, 0.8, 0.5, 'Bathroom Washing Basin');
  } else if (data.roomType === 'kitchen') {
    output += getBoxSTL(-data.width * 0.3, 0, 0, 0.6, 0.9, data.depth * 0.6, 'Utility Counter Setup');
    output += getBoxSTL(data.width * 0.3, 0, data.depth * 0.3, 0.7, 1.8, 0.7, 'Storage Cooling Locker');
  } else if (data.roomType === 'lounge') {
    output += getBoxSTL(0, 0, -data.depth * 0.2, 2.8, 0.6, 1.1, 'Padded Sitting Couch');
    output += getBoxSTL(0, 0, data.depth * 0.3, 2.2, 0.5, 0.4, 'Flat Screen Cabinet');
  }

  output += `endsolid HumanScaleRoomBlueprint\n`;
  return output;
}

/**
 * 3. GENERATE SVG (High-Fidelity 2D Section Graphic)
 */
export function generateSVG(data: ExportData): string {
  // Let's create an excellent 1200x800 blueprint board
  const w = 1200;
  const h = 800;
  
  // Calculate rendering scale
  // Room width/height will be centered on board
  const marginX = 200;
  const marginY = 150;
  const drawAreaW = w - marginX * 2;
  const drawAreaH = h - marginY * 2;
  
  const scaleX = drawAreaW / Math.max(data.width, 10);
  const scaleY = drawAreaH / Math.max(data.height, 5);
  const scale = Math.min(scaleX, scaleY); // uniform pixels per meter

  const roomDrawW = data.width * scale;
  const roomDrawH = data.height * scale;

  const roomX = (w - roomDrawW) / 2;
  const roomY = h - marginY - roomDrawH; // aligns with floor

  // Scale silhouette relative to height (1.75m tall)
  const humanH = 1.75 * scale;
  const humanW = (100 / 240) * humanH;
  const humanX = (w - humanW) / 2;
  const humanY = h - marginY - humanH;

  // XML Header
  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="background-color: #fafaf9; font-family: 'Courier New', Courier, monospace;">\n`;

  // Blueprint Title block card
  svg += `  <!-- Border & Frames -->\n`;
  svg += `  <rect x="20" y="20" width="${w - 40}" height="${h - 40}" fill="none" stroke="#000" stroke-width="2" />\n`;
  svg += `  <line x1="20" y1="90" x2="${w - 20}" y2="90" stroke="#000" stroke-width="1.5" />\n`;
  svg += `  <line x1="${w - 320}" y1="20" x2="${w - 320}" y2="90" stroke="#000" stroke-width="1.5" />\n`;

  // Core Header labels
  svg += `  <text x="40" y="52" font-size="18" font-weight="bold" fill="#000" style="font-family: inherit;">GEEPEE SCALE STUDIO BLUEPRINT</text>\n`;
  svg += `  <text x="40" y="74" font-size="10" fill="#666">ARCHITECTURAL DESIGN & HUMAN SCALE REALITY CHECK</text>\n`;
  svg += `  <text x="${w - 300}" y="48" font-size="12" font-weight="bold" fill="#000">SHEET NO: BP-101</text>\n`;
  svg += `  <text x="${w - 300}" y="70" font-size="10" fill="#666">SCALE: 1:${Math.round(100 / (scale / 50))}</text>\n`;

  // Draw Grid lines inside Room Draw Bounds
  svg += `  <!-- Drafting Grids -->\n`;
  for (let gridX = 0; gridX <= data.width; gridX += 1.0) {
    const gx = roomX + gridX * scale;
    svg += `  <line x1="${gx}" y1="${roomY}" x2="${gx}" y2="${roomY + roomDrawH}" stroke="#e5e5e0" stroke-width="1" stroke-dasharray="2,2" />\n`;
    if (gridX > 0 && gridX < data.width) {
      svg += `  <text x="${gx}" y="${h - marginY + 14}" font-size="8" fill="#a3a39e" text-anchor="middle">${gridX}m</text>\n`;
    }
  }

  for (let gridY = 0; gridY <= data.height; gridY += 1.0) {
    const gy = roomY + roomDrawH - gridY * scale;
    svg += `  <line x1="${roomX}" y1="${gy}" x2="${roomX + roomDrawW}" y2="${gy}" stroke="#e5e5e0" stroke-width="1" stroke-dasharray="2,2" />\n`;
    if (gridY > 0 && gridY < data.height) {
      svg += `  <text x="${roomX - 10}" y="${gy + 3}" font-size="8" fill="#a3a39e" text-anchor="end">${gridY}m</text>\n`;
    }
  }

  // Draw Primary Room Sections Wall outline
  svg += `  <!-- Room Bound Outlines -->\n`;
  svg += `  <rect x="${roomX}" y="${roomY}" width="${roomDrawW}" height="${roomDrawH}" fill="none" stroke="#000000" stroke-width="4" />\n`;

  // Draw Earth/Hatching ground plane underneath matching modern visual layout
  svg += `  <!-- Ground Hatching -->\n`;
  svg += `  <line x1="${roomX - 30}" y1="${h - marginY}" x2="${roomX + roomDrawW + 30}" y2="${h - marginY}" stroke="#000" stroke-width="4" />\n`;
  for (let i = roomX - 25; i < roomX + roomDrawW + 25; i += 12) {
    svg += `  <line x1="${i}" y1="${h - marginY}" x2="${i - 6}" y2="${h - marginY + 10}" stroke="#78716c" stroke-width="1" />\n`;
  }

  // Draw Human Silhouette inside Room Vector
  svg += `  <!-- Human Standard 1.75m Scale Entity -->\n`;
  svg += `  <g transform="translate(${humanX}, ${humanY}) scale(${(humanH / 240)})" fill="#000000">\n`;
  svg += `    <circle cx="50" cy="25" r="20" />\n`;
  svg += `    <path d="M30 50 L70 50 L75 140 L25 140 Z" />\n`;
  svg += `    <rect x="30" y="145" width="16" height="90" />\n`;
  svg += `    <rect x="54" y="145" width="16" height="90" />\n`;
  svg += `    <rect x="18" y="55" width="10" height="80" rx="5" />\n`;
  svg += `    <rect x="72" y="55" width="10" height="80" rx="5" />\n`;
  svg += `  </g>\n`;
  svg += `  <text x="${w / 2}" y="${humanY - 10}" font-size="10" fill="#000" text-anchor="middle" font-weight="bold">HUMAN SCALE (1.75m)</text>\n`;

  // Annotations/Ticks to show values
  svg += `  <!-- Dimensions & CAD Indicators -->\n`;
  // Width Label Bottom
  svg += `  <line x1="${roomX}" y1="${h - marginY + 30}" x2="${roomX + roomDrawW}" y2="${h - marginY + 30}" stroke="#000" stroke-width="1" />\n`;
  svg += `  <line x1="${roomX}" y1="${h - marginY + 25}" x2="${roomX}" y2="${h - marginY + 35}" stroke="#000" stroke-width="1.5" />\n`;
  svg += `  <line x1="${roomX + roomDrawW}" y1="${h - marginY + 25}" x2="${roomX + roomDrawW}" y2="${h - marginY + 35}" stroke="#000" stroke-width="1.5" />\n`;
  svg += `  <rect x="${w / 2 - 50}" y="${h - marginY + 20}" width="100" height="20" fill="#fafaf9" />\n`;
  svg += `  <text x="${w / 2}" y="${h - marginY + 34}" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">${data.width} m (WIDTH)</text>\n`;

  // Height Label Left
  svg += `  <line x1="${roomX - 35}" y1="${roomY}" x2="${roomX - 35}" y2="${roomY + roomDrawH}" stroke="#000" stroke-width="1" />\n`;
  svg += `  <line x1="${roomX - 40}" y1="${roomY}" x2="${roomX - 30}" y2="${roomY}" stroke="#000" stroke-width="1.5" />\n`;
  svg += `  <line x1="${roomX - 40}" y1="${roomY + roomDrawH}" x2="${roomX - 30}" y2="${roomY + roomDrawH}" stroke="#000" stroke-width="1.5" />\n`;
  svg += `  <g transform="translate(${roomX - 45}, ${roomY + roomDrawH / 2}) rotate(-90)">\n`;
  svg += `    <rect x="-80" y="-10" width="160" height="20" fill="#fafaf9" />\n`;
  svg += `    <text x="0" y="4" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">${data.height} m (HEIGHT)</text>\n`;
  svg += `  </g>\n`;

  // Depth / Floor plane info box
  svg += `  <!-- Blueprint metadata specification box -->\n`;
  const metaBoxX = w - 300;
  const metaBoxY = 120;
  svg += `  <rect x="${metaBoxX}" y="${metaBoxY}" width="260" height="250" fill="#fafaf9" stroke="#000" stroke-width="1.5" />\n`;
  svg += `  <rect x="${metaBoxX}" y="${metaBoxY}" width="260" height="30" fill="#000" />\n`;
  svg += `  <text x="${metaBoxX + 15}" y="${metaBoxY + 20}" font-size="10" font-weight="bold" fill="#fff">VOLUME & VIBE DATA</text>\n`;

  let itemY = metaBoxY + 55;
  const addMetric = (label: string, value: string) => {
    svg += `  <text x="${metaBoxX + 15}" y="${itemY}" font-size="11" font-weight="bold" fill="#666">${label}:</text>\n`;
    svg += `  <text x="${metaBoxX + 245}" y="${itemY}" font-size="11" font-weight="bold" fill="#000" text-anchor="end">${value}</text>\n`;
    svg += `  <line x1="${metaBoxX + 15}" y1="${itemY + 8}" x2="${metaBoxX + 245}" y2="${itemY + 8}" stroke="#e5e5e0" stroke-width="1" />\n`;
    itemY += 28;
  };

  addMetric('ROOM PRESET', data.roomType.toUpperCase());
  addMetric('FLOOR WIDTH', `${data.width} m`);
  addMetric('FLOOR DEPTH', `${data.depth} m`);
  addMetric('CEILING HEIGHT', `${data.height} m`);
  addMetric('FLOOR AREA', `${data.area.toFixed(2)} sq m`);
  addMetric('TOTAL VOLUME', `${data.volume.toFixed(2)} cu m`);
  addMetric('CEILING RATIO', `${(data.height / 1.75).toFixed(1)}x human`);

  // Spatial atmosphere stamp
  const stampY = h - 180;
  svg += `  <!-- Spatial Stamp -->\n`;
  svg += `  <rect x="${metaBoxX}" y="${stampY}" width="260" height="130" fill="none" stroke="#000" stroke-width="1.5" />\n`;
  svg += `  <text x="${metaBoxX + 15}" y="${stampY + 24}" font-size="10" fill="#78716c" font-weight="bold">ATMOSPHERIC EVALUATION</text>\n`;
  svg += `  <text x="${metaBoxX + 15}" y="${stampY + 54}" font-size="20" fill="#000" font-weight="extrabold">${data.vibeLabel.toUpperCase()}</text>\n`;
  
  // Wrap Vibe descriptions beautifully
  const words = data.vibeDescription.split(' ');
  let line1 = '', line2 = '';
  for (let word of words) {
    if ((line1 + word).length < 35) {
      line1 += word + ' ';
    } else {
      line2 += word + ' ';
    }
  }
  svg += `  <text x="${metaBoxX + 15}" y="${stampY + 82}" font-size="9" fill="#57534e">${line1}</text>\n`;
  svg += `  <text x="${metaBoxX + 15}" y="${stampY + 98}" font-size="9" fill="#57534e">${line2}</text>\n`;

  // Draw structural room indicator
  svg += `</svg>\n`;

  return svg;
}

/**
 * 4. GENERATE DXF (2D Drafting Format AutoCAD text layout)
 */
export function generateDXF(data: ExportData): string {
  let dxf = [
    '  0', 'SECTION',
    '  2', 'HEADER',
    '  9', '$ACADVER',
    '  1', 'AC1006',
    '  0', 'ENDSEC',
    '  0', 'SECTION',
    '  2', 'ENTITIES'
  ];

  // Helper macro to append lines
  const writeLine = (x1: number, y1: number, x2: number, y2: number, layer: string) => {
    dxf.push(
      '  0', 'LINE',
      '  8', layer,
      ' 10', f(x1),
      ' 20', f(y1),
      ' 30', '0.0',
      ' 11', f(x2),
      ' 21', f(y2),
      ' 31', '0.0'
    );
  };

  // Outline (Walls)
  writeLine(0, 0, data.width, 0, 'FLOOR'); // Floor length
  writeLine(0, 0, 0, data.height, 'LEFT_WALL'); // Left wall
  writeLine(0, data.height, data.width, data.height, 'CEILING'); // Ceiling
  writeLine(data.width, 0, data.width, data.height, 'RIGHT_WALL'); // Right wall

  // A geometric representation of a human (center)
  // Box of human frame: center is width/2 = cx
  const cx = data.width / 2;
  // Outer silhouette boundaries
  writeLine(cx - 0.2, 0, cx - 0.2, 1.45, 'HUMAN_OUTLINE'); // Left torso/legs
  writeLine(cx - 0.2, 1.45, cx - 0.15, 1.45, 'HUMAN_OUTLINE'); // Shoulder left
  writeLine(cx - 0.15, 1.45, cx - 0.15, 1.75, 'HUMAN_OUTLINE'); // Left head
  writeLine(cx - 0.15, 1.75, cx + 0.15, 1.75, 'HUMAN_OUTLINE'); // Top head
  writeLine(cx + 0.15, 1.75, cx + 0.15, 1.45, 'HUMAN_OUTLINE'); // Right head
  writeLine(cx + 0.15, 1.45, cx + 0.2, 1.45, 'HUMAN_OUTLINE'); // Shoulder right
  writeLine(cx + 0.2, 1.45, cx + 0.2, 0, 'HUMAN_OUTLINE'); // Right torso/legs

  // Feet
  writeLine(cx - 0.2, 0, cx + 0.2, 0, 'HUMAN_OUTLINE');

  // DXF ending sequences
  dxf.push('  0', 'ENDSEC', '  0', 'EOF');
  return dxf.join('\n');
}

/**
 * 5. GENERATE JSON (Blueprint Schema Parameters)
 */
export function generateJSON(data: ExportData): string {
  const blueprint = {
    blueprintId: `GP-${Math.floor(Math.random() * 1000000)}`,
    exportTimestamp: new Date().toISOString(),
    designer: "Human Scale Reality Check User",
    dimensions: {
      widthMeters: data.width,
      depthMeters: data.depth,
      heightMeters: data.height,
      heightHumanRatio: parseFloat((data.height / 1.75).toFixed(2))
    },
    metrics: {
      floorAreaSqMeters: data.area,
      volumeCuMeters: data.volume,
    },
    classification: {
      roomPresetType: data.roomType,
      atmosphericVibe: data.vibeLabel,
      description: data.vibeDescription
    },
    schemaSpecification: "GEEPEE BLUEPRINT PROTOCOL v1"
  };
  return JSON.stringify(blueprint, null, 2);
}

/**
 * TRIGGER FILE DOWNLOAD WINDOWS
 */
export function triggerFileDownload(content: string, fileName: string, contentType: string) {
  let url = '';
  const isDataUrl = content.startsWith('data:');

  if (isDataUrl) {
    // If it is already a base64 DataURL (e.g., from 3D canvas screenshot), use it directly!
    url = content;
  } else {
    // Otherwise, create a downloadable standard Blob
    try {
      const blob = new Blob([content], { type: contentType });
      url = URL.createObjectURL(blob);
    } catch (e) {
      console.error("Error creating download blob:", e);
      return;
    }
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (!isDataUrl && url) {
    URL.revokeObjectURL(url);
  }
}

/**
 * CONVERT SVG TO RASTER PNG IMAGE (USING CANVAS REDIRECTS)
 */
export function downloadPNGFromSVG(svgContent: string, fileName: string) {
  // To avoid sandboxed XML parsing errors, parse without external CSS imports that trigger network blocks in sandboxed canvases
  const sanitizedSvg = svgContent.replace(/@import url\('[^']+'\);/g, '');
  
  // Safe base64 encoding to prevent encoding quirks in sandboxed contexts
  const svgBase64 = btoa(unescape(encodeURIComponent(sanitizedSvg)));
  const dataUri = `data:image/svg+xml;base64,${svgBase64}`;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  // Fallback if image loading fails or is blocked by sandbox policy
  const fallbackTimeout = setTimeout(() => {
    // Trigger download of the high-fidelity vector SVG as fallback and notify user
    console.warn("SVG to PNG conversion timed out. Falling back to high-fidelity SVG vector download.");
    const svgFilename = fileName.replace('.png', '.svg');
    triggerFileDownload(svgContent, svgFilename, 'image/svg+xml');
    alert(`Your browser's sandboxed environment restricted on-the-fly PNG rasterization. We downloaded the equivalent high-fidelity Vector Blueprint (.SVG) which can be opened in any browser or design software!`);
  }, 1800);

  img.onload = () => {
    clearTimeout(fallbackTimeout);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fafaf9'; // stone-50 background corresponding to the blueprint card
        ctx.fillRect(0, 0, 1200, 800);
        ctx.drawImage(img, 0, 0, 1200, 800);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
          } else {
            // Fallback
            triggerFileDownload(svgContent, fileName.replace('.png', '.svg'), 'image/svg+xml');
          }
        }, 'image/png');
      } else {
        triggerFileDownload(svgContent, fileName.replace('.png', '.svg'), 'image/svg+xml');
      }
    } catch (err) {
      console.error("Canvas SVG draw error under sandbox:", err);
      // Fallback
      triggerFileDownload(svgContent, fileName.replace('.png', '.svg'), 'image/svg+xml');
    }
  };

  img.onerror = () => {
    clearTimeout(fallbackTimeout);
    console.error("Failed to load SVG Image in-memory.");
    triggerFileDownload(svgContent, fileName.replace('.png', '.svg'), 'image/svg+xml');
  };

  img.src = dataUri;
}
