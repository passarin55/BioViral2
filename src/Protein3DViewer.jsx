import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCw, Download } from 'lucide-react';

const VIEWER_HEIGHT = 400;

const Protein3DViewer = ({ proteinData, selectedTarget, druggableSites }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const canvasRef = useRef(null);
  const viewerIdRef = useRef(`mol-viewer-${Math.random().toString(36).slice(2)}`);

  const [mode, setMode] = useState('loading'); // 'loading' | '3dmol' | 'canvas' | 'error'
  const [rotation, setRotation] = useState({ x: 0.3, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  // ── Canvas rendering ────────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !proteinData?.sequence) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.parentElement?.clientWidth || 700;
    const cssH = VIEWER_HEIGHT;

    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = cssW;
    const H = cssH;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    const seq = proteinData.sequence;
    const N = seq.length;
    const cx = W / 2;
    const cy = H / 2;

    const druggableSet = new Set(
      (druggableSites || []).flatMap((s) => s.residues || [])
    );

    // Build 3D helix points
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i * 100 * Math.PI) / 180;
      const r = 2.3;
      const x0 = r * Math.cos(a);
      const y0 = i * 1.5;
      const z0 = r * Math.sin(a);

      // Rotate Y then X
      const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
      const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);

      const x1 = x0 * cosY + z0 * sinY;
      const z1 = -x0 * sinY + z0 * cosY;
      const y2 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;

      let color = '#60a5fa'; // default blue
      const t = i / N;
      const hue = Math.round(t * 270); // spectrum blue→red
      color = `hsl(${hue}, 80%, 60%)`;

      if (druggableSet.has(i)) color = '#f87171';
      if (selectedTarget && selectedTarget.position === i) color = '#4ade80';

      pts.push({ sx: x1 * zoom, sy: y2 * zoom, z: z2 * zoom, color });
    }

    // Translate to center vertically
    const minSY = Math.min(...pts.map((p) => p.sy));
    const maxSY = Math.max(...pts.map((p) => p.sy));
    const midSY = (minSY + maxSY) / 2;
    const scale = Math.min(30, (H * 0.85) / ((maxSY - minSY) || 1));

    // Sort back→front
    const sorted = [...pts].sort((a, b) => a.z - b.z);

    // Draw backbone ribbon
    ctx.save();
    ctx.strokeStyle = 'rgba(148,163,184,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const sx = cx + p.sx * scale;
      const sy = cy + (p.sy - midSY) * scale;
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();

    // Draw alpha-carbon spheres
    for (const p of sorted) {
      const sx = cx + p.sx * scale;
      const sy = cy + (p.sy - midSY) * scale;
      const depth = (p.z + 3) / 6;
      const size = Math.max(1.5, 4 * depth * zoom);

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // Label
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.font = '11px monospace';
    ctx.fillText(`${proteinData.name}  ·  ${N} aa  ·  drag to rotate  ·  scroll to zoom`, 10, H - 10);
  }, [proteinData, selectedTarget, druggableSites, rotation, zoom]);

  useEffect(() => {
    if (mode === 'canvas') {
      // Let the canvas element mount first
      const t = setTimeout(() => drawCanvas(), 50);
      return () => clearTimeout(t);
    }
  }, [mode, drawCanvas]);

  // ── 3Dmol.js init ────────────────────────────────────────────────────────
  const init3Dmol = useCallback(() => {
    if (!window.$3Dmol || !containerRef.current || !proteinData?.sequence) return;

    try {
      const el = containerRef.current;
      const w = el.clientWidth;
      const h = VIEWER_HEIGHT;
      if (w === 0) { setMode('canvas'); return; }

      const viewer = window.$3Dmol.createViewer(el, {
        backgroundColor: 'white',
        antialias: true,
      });
      if (!viewer) throw new Error('createViewer returned null');

      const pdb = buildPDB(proteinData);
      viewer.addModel(pdb, 'pdb');
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });

      (druggableSites || []).forEach((site) => {
        (site.residues || []).forEach((resi) => {
          viewer.setStyle({ resi }, { cartoon: { color: 'red' }, stick: {} });
        });
      });

      if (selectedTarget?.position !== undefined) {
        viewer.setStyle({ resi: selectedTarget.position + 1 }, {
          cartoon: { color: 'green' }, sphere: { scale: 0.5 },
        });
      }

      viewer.zoomTo();
      viewer.render();
      viewerRef.current = viewer;

      // Confirm canvas actually exists
      setTimeout(() => {
        if (el.querySelector('canvas')) {
          setMode('3dmol');
        } else {
          console.warn('3Dmol created no canvas – switching to canvas renderer');
          setMode('canvas');
        }
      }, 300);
    } catch (e) {
      console.error('3Dmol init failed:', e);
      setMode('canvas');
    }
  }, [proteinData, selectedTarget, druggableSites]);

  // Always use canvas renderer - reliable across all browsers
  useEffect(() => {
    if (!proteinData) return;
    setMode('canvas');
  }, [proteinData]);

  // ── Canvas mouse events ───────────────────────────────────────────────────
  const onMouseDown = (e) => { setIsDragging(true); setLastMouse({ x: e.clientX, y: e.clientY }); };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setRotation((r) => ({ x: r.x + dy * 0.01, y: r.y + dx * 0.01 }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };
  const onMouseUp = () => setIsDragging(false);

  // Handle wheel scroll with non-passive listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      setZoom((z) => Math.max(0.4, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  const handleReset = () => {
    if (mode === '3dmol' && viewerRef.current) {
      viewerRef.current.zoomTo();
      viewerRef.current.render();
    } else {
      setRotation({ x: 0.3, y: 0 });
      setZoom(1);
    }
  };

  const handleDownload = () => {
    if (!proteinData) return;
    const blob = new Blob([buildPDB(proteinData)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${proteinData.name}.pdb`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!proteinData) return null;

  return (
    <div className="space-y-3">
      {/* Viewer */}
      <div style={{ width: '100%', height: VIEWER_HEIGHT, position: 'relative', background: mode === 'canvas' ? '#0f172a' : '#f0f0f0', borderRadius: 8, overflow: 'hidden', border: '1px solid #334155' }}>
        {/* 3Dmol container (always mounted so ref is available) */}
        <div
          ref={containerRef}
          style={{
            position: 'absolute', inset: 0,
            display: mode === 'canvas' ? 'none' : 'block',
          }}
        />
        {/* Canvas fallback */}
        {mode === 'canvas' && (
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{ display: 'block', width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'grab' }}
          />
        )}
        {/* Loading overlay */}
        {mode === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)' }}>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Loading 3D structure…</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-cyan-400 font-semibold text-xs">
            🔬 3D Structure Viewer
          </h4>
          <button onClick={handleReset} className="flex items-center gap-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded">
            <RotateCw size={12} /> Reset
          </button>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'hsl(270,80%,60%)' }} /><span className="text-gray-400">C-terminus</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: 'hsl(0,80%,60%)' }} /><span className="text-gray-400">N-terminus / Druggable site</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: '#4ade80' }} /><span className="text-gray-400">Selected editing target</span></div>
        </div>
        <div className="bg-slate-800/50 rounded p-2 text-xs text-gray-400">
          Drag to rotate · Scroll to zoom · Right-drag to pan
        </div>
        <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-semibold">
          <Download size={12} /> Download PDB
        </button>
      </div>
    </div>
  );
};

// ── PDB builder ─────────────────────────────────────────────────────────────
const AA3 = {
  A:'ALA',C:'CYS',D:'ASP',E:'GLU',F:'PHE',G:'GLY',H:'HIS',I:'ILE',K:'LYS',
  L:'LEU',M:'MET',N:'ASN',P:'PRO',Q:'GLN',R:'ARG',S:'SER',T:'THR',V:'VAL',
  W:'TRP',Y:'TYR',
};

const buildPDB = (proteinData) => {
  const seq = proteinData?.sequence || '';
  let out = `REMARK  ${proteinData.name}\n`;
  let atom = 1;
  for (let i = 0; i < seq.length; i++) {
    const res = AA3[seq[i]] || 'ALA';
    const resi = i + 1;
    const a = (i * 100 * Math.PI) / 180;
    const x = (2.3 * Math.cos(a)).toFixed(3).padStart(8);
    const y = (i * 1.5).toFixed(3).padStart(8);
    const z = (2.3 * Math.sin(a)).toFixed(3).padStart(8);
    out += `ATOM  ${String(atom).padStart(5)}  CA  ${res} A${String(resi).padStart(4)}    ${x}${y}${z}  1.00 50.00           C\n`;
    atom++;
  }
  out += 'END\n';
  return out;
};

export default Protein3DViewer;
