import React, { useState, useEffect } from 'react';
import { Brain, Download, Copy } from 'lucide-react';
import {
  suggestEditingTargets,
  analyzeConservation,
  predictOffTargets,
  designEditingStrategy,
  analyzProteinWithLLM,
} from './enhancedProteinAPI';
import Protein3DViewer from './Protein3DViewer';
import LLMSettings from './LLMSettings';

const ProteinEditorAdvanced = ({ pathogenName, selectedProtein, proteinData }) => {
  const [editingType, setEditingType] = useState('CRISPR');
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [conservation, setConservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [llmAnalysis, setLlmAnalysis] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [error, setError] = useState(null);

  // Load analysis on protein change
  useEffect(() => {
    if (!proteinData) return;
    loadAnalysis();
  }, [proteinData]);

  // Load targets for current editing type
  useEffect(() => {
    if (!proteinData) return;
    loadTargets();
  }, [editingType, proteinData]);

  const loadTargets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading targets for:', editingType);
      const newTargets = await suggestEditingTargets(proteinData, editingType);
      console.log('Targets loaded:', newTargets?.length || 0, newTargets);
      setTargets(newTargets || []);
    } catch (e) {
      console.error('Error loading targets:', e);
      setError(`Failed to load targets: ${e.message}`);
      setTargets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load conservation
      const cons = await analyzeConservation(proteinData);
      setConservation(cons);

      // Load LLM analysis (optional, may fail if Ollama unavailable)
      try {
        const llm = await analyzProteinWithLLM(proteinData);
        if (llm) setLlmAnalysis(llm);
      } catch (e) {
        console.warn('LLM analysis unavailable:', e);
      }
    } catch (e) {
      console.error('Error loading analysis:', e);
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const loadStrategy = async () => {
    try {
      setLoading(true);
      setError(null);
      const strat = await designEditingStrategy(proteinData);
      setStrategy(strat);
    } catch (e) {
      console.error('Error loading strategy:', e);
      setError('Failed to design strategy');
    } finally {
      setLoading(false);
    }
  };

  const getOffTargetInfo = (target) => {
    if (!target.sequence) return null;
    try {
      return predictOffTargets(target.sequence);
    } catch (e) {
      console.warn('Off-target prediction failed:', e);
      return null;
    }
  };

  if (!proteinData) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
        <p className="text-gray-400">Select a protein to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-900/50 rounded-lg p-4">
        <h2 className="text-cyan-400 font-bold text-lg mb-2">🧬 {proteinData.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Length</p>
            <p className="text-cyan-300">{proteinData.length} aa</p>
          </div>
          <div>
            <p className="text-gray-500">Domains</p>
            <p className="text-cyan-300">{proteinData.domains?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-500">Conservation</p>
            <p className="text-purple-300">
              {conservation ? `${(conservation.overall * 100).toFixed(0)}%` : 'Loading...'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className={loading ? 'text-yellow-300' : 'text-emerald-300'}>
              {loading ? 'Analyzing...' : 'Ready'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
          <p className="text-red-300 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* 3D Viewer */}
      <div className="bg-slate-900 border border-cyan-900/50 rounded-lg p-4">
        <h3 className="text-cyan-400 font-bold text-sm mb-3">🔬 3D Structure</h3>
        <Protein3DViewer
          proteinData={proteinData}
          selectedTarget={selectedTarget}
          druggableSites={proteinData.druggableSites}
        />
      </div>

      {/* LLM Settings */}
      <LLMSettings />

      {/* AI Wizard Button */}
      <button
        onClick={() => setShowWizard(!showWizard)}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
      >
        <Brain size={20} />
        {showWizard ? 'Hide' : 'Launch'} AI Editing Wizard
      </button>

      {/* AI Wizard Panel */}
      {showWizard && (
        <div className="bg-slate-800 border border-purple-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-purple-400 font-bold flex items-center gap-2">
              <Brain size={16} /> Smart Gene Editing Strategy
            </h3>
            <button
              onClick={loadStrategy}
              disabled={loading}
              className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-1 rounded"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {strategy && (
            <div className="space-y-3">
              {/* Overall Score */}
              <div className="bg-slate-700/50 rounded p-3">
                <div className="text-xs text-gray-400 mb-2">Overall Assessment</div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-cyan-300">
                      Editability: {(strategy.overall.editabilityScore * 100).toFixed(0)}%
                    </span>
                    <div className="bg-slate-600 h-2 rounded mt-1">
                      <div
                        className="bg-cyan-500 h-2 rounded"
                        style={{ width: `${strategy.overall.editabilityScore * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    💡 <strong>Recommended:</strong> {strategy.overall.recommendedStrategy}
                  </p>
                  <p className="text-xs text-orange-300">
                    ⚠️ <strong>Escape Risk:</strong> {(strategy.overall.riskOfEscape * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* LLM Analysis */}
              {strategy.llmAnalysis && (
                <div className="bg-slate-700/50 rounded p-3 border border-purple-500/20">
                  <p className="text-xs text-purple-400 font-semibold mb-2">🤖 AI Analysis:</p>
                  <p className="text-xs text-gray-300 whitespace-pre-wrap">{strategy.llmAnalysis}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editing Type Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <p className="text-cyan-400 font-semibold text-sm mb-3">🔧 Gene Editing Strategy</p>
        <div className="grid grid-cols-3 gap-2">
          {['CRISPR', 'baseEditing', 'primeEditing'].map((type) => (
            <button
              key={type}
              onClick={() => setEditingType(type)}
              disabled={loading}
              className={`p-2 rounded text-xs font-bold transition-all disabled:opacity-50 ${
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

      {/* Conservation by Domain */}
      {conservation?.byDomain && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <p className="text-emerald-400 font-semibold text-sm mb-3">🧩 Domain Conservation</p>
          <div className="space-y-2">
            {conservation.byDomain.map((domain, idx) => (
              <div key={idx} className="bg-slate-800 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">
                    {domain.name} ({domain.start}-{domain.end})
                  </span>
                  <span className="text-xs font-bold text-cyan-300">
                    {(domain.conservationScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded"
                    style={{ width: `${domain.conservationScore * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {domain.editingFriendly ? '✓ Good for editing' : '⚠ Variable region'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <p className="text-cyan-400 font-semibold text-sm mb-3">
          🎯 {editingType} Targets ({targets.length})
        </p>

        {loading && <div className="text-center py-4 text-gray-400 text-sm">⏳ Loading targets...</div>}

        {!loading && targets.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            <p>No targets generated</p>
            <p className="text-xs text-gray-500 mt-2">Check browser console for details</p>
          </div>
        )}

        {!loading && targets.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {targets.map((target, idx) => {
              const isSelected = selectedTarget?.position === target.position;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedTarget(target)}
                  className={`w-full text-left p-3 rounded cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-600/30 border-2 border-emerald-500'
                      : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-bold text-cyan-300">Pos {target.position}</span>
                    <div className="flex gap-2">
                      <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-0.5 rounded">
                        {(target.specificity * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs bg-purple-600 text-purple-100 px-2 py-0.5 rounded">
                        {(target.efficiency * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 font-mono break-all">{target.sequence}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Target Details */}
      {selectedTarget && (
        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-emerald-400 font-bold text-sm">✓ Target Selected</h4>
            <button
              onClick={() => navigator.clipboard.writeText(selectedTarget.sequence)}
              className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
            >
              <Copy size={12} /> Copy
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <p className="text-gray-400">Sequence</p>
              <p className="text-emerald-300 font-mono break-all">{selectedTarget.sequence}</p>
            </div>
            <div>
              <p className="text-gray-400">Specificity: {(selectedTarget.specificity * 100).toFixed(2)}%</p>
              <div className="w-full bg-slate-700 rounded h-1.5 mt-1">
                <div
                  className="bg-emerald-500 h-1.5 rounded"
                  style={{ width: `${selectedTarget.specificity * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Protein Structure Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-cyan-400 font-bold text-sm mb-3">📋 Full Protein Structure</h3>

        {/* Protein Sequence with Highlighting */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <p className="text-cyan-400 font-semibold text-xs mb-3">📝 Amino Acid Sequence (with Targets Highlighted)</p>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500"></div>
              <span className="text-gray-400">CRISPR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500"></div>
              <span className="text-gray-400">Base Edit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500"></div>
              <span className="text-gray-400">Druggable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500"></div>
              <span className="text-gray-400">Selected</span>
            </div>
          </div>

          {/* Sequence Display */}
          <div className="bg-slate-700 rounded p-3 font-mono text-xs max-h-48 overflow-y-auto">
            {(proteinData.sequence || '').split('').map((aa, idx) => {
              let bgColor = 'transparent';
              let textColor = 'text-gray-300';

              // Highlight selected target
              if (selectedTarget?.position === idx) {
                bgColor = 'bg-emerald-600';
                textColor = 'text-white font-bold';
              }
              // Highlight druggable sites
              else if (proteinData.druggableSites?.some((site) =>
                site.residues?.includes(idx)
              )) {
                bgColor = 'bg-red-600/50';
                textColor = 'text-red-100';
              }
              // Highlight editing targets
              else if (targets.some((t) => t.position === idx)) {
                if (editingType === 'baseEditing') {
                  bgColor = 'bg-purple-600/50';
                  textColor = 'text-purple-100';
                } else {
                  bgColor = 'bg-cyan-600/50';
                  textColor = 'text-cyan-100';
                }
              }

              return (
                <span
                  key={idx}
                  className={`${bgColor} ${textColor} px-0.5 py-0.5 rounded cursor-pointer hover:opacity-80`}
                  onClick={() =>
                    setSelectedTarget({
                      position: idx,
                      sequence: proteinData.sequence.substring(
                        Math.max(0, idx - 10),
                        Math.min(proteinData.sequence.length, idx + 11)
                      ),
                    })
                  }
                  title={`Position ${idx + 1}: ${aa}`}
                >
                  {aa}
                </span>
              );
            })}
          </div>
        </div>

        {/* Druggable Sites */}
        {proteinData.druggableSites && proteinData.druggableSites.length > 0 && (
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-4 mb-4">
            <p className="text-emerald-400 font-semibold text-xs mb-3">💊 Druggable Sites</p>
            <div className="space-y-2">
              {proteinData.druggableSites.map((site, idx) => (
                <div key={idx} className="bg-slate-800 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-emerald-300 font-bold">{site.name}</span>
                    <span className="text-xs text-gray-400">{(site.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded h-1">
                    <div
                      className="bg-emerald-500 h-1 rounded"
                      style={{ width: `${site.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mutations */}
        {proteinData.mutations && proteinData.mutations.length > 0 && (
          <div className="bg-orange-950/30 border border-orange-900/50 rounded-lg p-4">
            <p className="text-orange-400 font-semibold text-xs mb-3">⚠️ Known Escape Mutations</p>
            <div className="space-y-1 text-xs">
              {proteinData.mutations.map((mut, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-gray-300">
                    <span className="text-orange-300 font-bold">{mut.name}</span> @ pos {mut.position}
                  </span>
                  <span className="text-gray-500">{mut.prevalence}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProteinEditorAdvanced;
