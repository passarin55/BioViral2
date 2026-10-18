import React, { useState, useEffect } from 'react';
import {
  Zap, Download, Copy, AlertCircle, CheckCircle,
  ChevronDown, Search, BarChart3, Layers
} from 'lucide-react';
import { getMockProteinData, analyzeEditingTargets, calculateConservationScore } from './proteinAPI';
import Protein3DViewer from './Protein3DViewer';

/**
 * Protein Structure Visualizer & Gene Editing Tool
 * Shows protein sequences, domains, and optimal editing sites
 */

const ProteinSequenceViewer = ({ sequence, editingTargets, selectedTarget }) => {
  const chunkSize = 50;
  const chunks = [];

  for (let i = 0; i < sequence.length; i += chunkSize) {
    chunks.push(sequence.slice(i, i + chunkSize));
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs space-y-2 max-h-64 overflow-y-auto">
      {chunks.map((chunk, idx) => (
        <div key={idx} className="flex gap-4">
          <span className="text-gray-500 w-12">{idx * chunkSize + 1}</span>
          <span className="text-gray-300 tracking-wider">
            {chunk.split('').map((aa, aaIdx) => {
              const globalPos = idx * chunkSize + aaIdx;
              const isEditTarget = selectedTarget && selectedTarget.position === globalPos;
              return (
                <span
                  key={aaIdx}
                  className={`${
                    isEditTarget
                      ? 'bg-emerald-500 text-white font-bold'
                      : editingTargets?.some((t) => t.position === globalPos)
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-300'
                  }`}
                >
                  {aa}
                </span>
              );
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

const ProteinDomainVisualizer = ({ domains, length, editingTargets }) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 font-semibold">Protein Domains & Structure</p>

      {/* Domain bar */}
      <div className="relative h-12 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        {domains?.map((domain, idx) => {
          const start = (domain.start / length) * 100;
          const width = ((domain.end - domain.start) / length) * 100;
          const colors = [
            'bg-cyan-600',
            'bg-purple-600',
            'bg-emerald-600',
            'bg-orange-600',
            'bg-pink-600',
          ];

          return (
            <div
              key={idx}
              className={`${colors[idx % colors.length]} absolute h-full flex items-center justify-center text-xs font-bold text-white`}
              style={{ left: `${start}%`, width: `${width}%` }}
              title={`${domain.name} (${domain.start}-${domain.end})`}
            >
              {width > 10 && <span className="truncate">{domain.name}</span>}
            </div>
          );
        })}
      </div>

      {/* Domain labels */}
      <div className="space-y-1 text-xs">
        {domains?.map((domain, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{
              backgroundColor: ['#06b6d4', '#a855f7', '#10b981', '#f97316', '#ec4899'][idx % 5]
            }}></div>
            <span className="text-gray-300">
              {domain.name}: {domain.start}-{domain.end}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EditingTargetsList = ({ targets, editingType, onSelectTarget, selectedTarget }) => {
  if (!targets || targets.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 font-semibold">
        🎯 {editingType} Editing Targets ({targets.length} found)
      </p>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {targets.map((target, idx) => (
          <button
            key={idx}
            onClick={() => onSelectTarget(target)}
            className={`w-full text-left p-2 rounded text-xs transition-all ${
              selectedTarget?.position === target.position
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>
                Position {target.position} | {target.type}
              </span>
              <div className="flex gap-2">
                <span className="text-cyan-300">{(target.specificity * 100).toFixed(1)}% spec</span>
                <span className="text-purple-300">{(target.efficiency * 100).toFixed(1)}% eff</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1 font-mono">
              {target.sequence}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const MutationAnalysis = ({ mutations }) => {
  if (!mutations || mutations.length === 0) return null;

  return (
    <div className="bg-slate-800/50 border border-orange-800/30 rounded-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-orange-400">⚠️ Known Escape Mutations</p>

      <div className="space-y-1">
        {mutations.map((mut, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-gray-300">
              <span className="text-cyan-300 font-bold">{mut.name}</span> at position {mut.position}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-purple-300">{mut.prevalence}</span>
              <span className="text-gray-500">{mut.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ProteinEditor({ pathogenName, selectedProtein }) {
  const [proteinData, setProteinData] = useState(null);
  const [editingType, setEditingType] = useState('CRISPR');
  const [editingTargets, setEditingTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [conservationData, setConservationData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load protein data when protein is selected
  useEffect(() => {
    if (selectedProtein) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const data = getMockProteinData(selectedProtein);
        if (data) {
          setProteinData(data);
          const targets = analyzeEditingTargets(data, editingType);
          setEditingTargets(targets);
          const conservation = calculateConservationScore(data, data.mutations);
          setConservationData(conservation);
        }
        setLoading(false);
      }, 300);
    }
  }, [selectedProtein]);

  // Update targets when editing type changes
  useEffect(() => {
    if (proteinData) {
      const targets = analyzeEditingTargets(proteinData, editingType);
      setEditingTargets(targets);
      setSelectedTarget(null);
    }
  }, [editingType, proteinData]);

  if (!selectedProtein) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Select a protein from pathogen details to view structure</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Loading protein data from repositories...</p>
      </div>
    );
  }

  if (!proteinData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Protein data not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-900/50 rounded-lg p-4">
        <h3 className="text-cyan-400 font-bold text-sm mb-2">🧬 {proteinData.name}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <p className="text-gray-500">UniProt ID</p>
            <p className="text-cyan-300 font-mono">{proteinData.uniprotId}</p>
          </div>
          <div>
            <p className="text-gray-500">PDB Structure</p>
            <p className="text-cyan-300 font-mono">
              {proteinData.pdbId ? (
                <a href={`https://www.rcsb.org/structure/${proteinData.pdbId}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {proteinData.pdbId}
                </a>
              ) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Length</p>
            <p className="text-emerald-300">{proteinData.length} aa</p>
          </div>
          <div>
            <p className="text-gray-500">Conservation</p>
            <p className="text-purple-300">{(conservationData?.score * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* 3D Structure Viewer */}
      <div className="bg-slate-900 border border-cyan-900/50 rounded-lg p-4">
        <h3 className="text-cyan-400 font-bold text-sm mb-3">🔬 3D Structure Viewer</h3>
        <Protein3DViewer
          proteinData={proteinData}
          selectedTarget={selectedTarget}
          druggableSites={proteinData.druggableSites}
        />
      </div>

      {/* Protein Domains */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <ProteinDomainVisualizer
          domains={proteinData.domains}
          length={proteinData.length}
          editingTargets={editingTargets}
        />
      </div>

      {/* Druggable Sites */}
      {proteinData.druggableSites && proteinData.druggableSites.length > 0 && (
        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4">
          <p className="text-emerald-400 font-semibold text-sm mb-3">💊 Druggable Sites</p>
          <div className="space-y-2">
            {proteinData.druggableSites.map((site, idx) => (
              <div key={idx} className="bg-slate-800 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-emerald-300 font-bold">{site.name}</span>
                  <span className="text-xs text-gray-400">{(site.confidence * 100).toFixed(0)}% confidence</span>
                </div>
                <div className="w-full bg-slate-700 rounded h-1">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-1 rounded"
                    style={{ width: `${site.confidence * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gene Editing Type Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <p className="text-cyan-400 font-semibold text-sm mb-3">🔧 Gene Editing Strategy</p>
        <div className="grid grid-cols-3 gap-2">
          {['CRISPR', 'baseEditing', 'primeEditing'].map((type) => (
            <button
              key={type}
              onClick={() => setEditingType(type)}
              className={`p-2 rounded text-xs font-bold transition-all ${
                editingType === type
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {type === 'CRISPR' ? '🔪 CRISPR' : type === 'baseEditing' ? '⚛️ Base Edit' : '🎯 Prime Edit'}
            </button>
          ))}
        </div>
      </div>

      {/* Editing Targets */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <EditingTargetsList
          targets={editingTargets}
          editingType={editingType}
          onSelectTarget={setSelectedTarget}
          selectedTarget={selectedTarget}
        />
      </div>

      {/* Protein Sequence */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <p className="text-cyan-400 font-semibold text-sm mb-3">📝 Protein Sequence</p>
        <ProteinSequenceViewer
          sequence={proteinData.sequence}
          editingTargets={editingTargets}
          selectedTarget={selectedTarget}
        />
      </div>

      {/* Mutation Analysis */}
      {proteinData.mutations && proteinData.mutations.length > 0 && (
        <MutationAnalysis mutations={proteinData.mutations} />
      )}

      {/* Selected Target Details */}
      {selectedTarget && (
        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-emerald-400 font-bold text-sm">✓ Target Selected</h4>
            <button
              onClick={() => navigator.clipboard.writeText(selectedTarget.sequence)}
              className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
            >
              <Copy size={12} /> Copy Sequence
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <p className="text-gray-400">Position</p>
              <p className="text-emerald-300 font-bold">{selectedTarget.position}</p>
            </div>
            <div>
              <p className="text-gray-400">Target Sequence</p>
              <p className="text-cyan-300 font-mono">{selectedTarget.sequence}</p>
            </div>
            <div>
              <p className="text-gray-400">Specificity</p>
              <div className="w-full bg-slate-700 rounded h-2 mt-1">
                <div
                  className="bg-emerald-500 h-2 rounded"
                  style={{ width: `${selectedTarget.specificity * 100}%` }}
                />
              </div>
              <p className="text-emerald-300">{(selectedTarget.specificity * 100).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-gray-400">Efficiency</p>
              <div className="w-full bg-slate-700 rounded h-2 mt-1">
                <div
                  className="bg-purple-500 h-2 rounded"
                  style={{ width: `${selectedTarget.efficiency * 100}%` }}
                />
              </div>
              <p className="text-purple-300">{(selectedTarget.efficiency * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
