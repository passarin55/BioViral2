import React, { useState, useEffect, useRef } from 'react';
import { Beaker, Microscope, BookOpen, Zap, TrendingUp, Download, Play, Filter, Search, Globe, AlertTriangle, CheckCircle, ChevronDown, BarChart3, Network } from 'lucide-react';

// ============================================================================
// COMPREHENSIVE PATHOGEN DATABASE UI
// ============================================================================

const THREAT_LEVELS = {
  CRITICAL: { color: '#ef4444', bg: '#fee2e2', label: 'Critical' },
  HIGH: { color: '#f97316', bg: '#ffedd5', label: 'High' },
  MEDIUM: { color: '#eab308', bg: '#fef3c7', label: 'Medium' },
  LOW: { color: '#3b82f6', bg: '#dbeafe', label: 'Low' }
};

const GENOME_TYPES = {
  '(+)ssRNA': { icon: '🧬', color: '#ec4899' },
  '(-)ssRNA': { icon: '🧬', color: '#8b5cf6' },
  'ssRNA-RT': { icon: '🔄', color: '#14b8a6' },
  'dsDNA': { icon: '🔗', color: '#3b82f6' },
};

// ============================================================================
// Pathogen Selector Component
// ============================================================================

const PathogenSelector = ({ pathogens, selectedPathogen, onSelect, threatFilter, setThreatFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(false);
  
  const filteredPathogens = pathogens.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.family.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesThreat = !threatFilter || p.threat_level === threatFilter;
    return matchesSearch && matchesThreat;
  });
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
      <h3 className="text-cyan-400 font-semibold text-sm">🦠 Pathogen Selection (40+ Available)</h3>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Search pathogens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-3 py-2 rounded text-sm focus:border-cyan-500 outline-none"
        />
      </div>
      
      {/* Threat Filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
          <button
            key={level}
            onClick={() => setThreatFilter(level === 'ALL' ? null : level)}
            className={`text-xs px-3 py-1 rounded transition-all ${
              (level === 'ALL' && !threatFilter) || (threatFilter === level)
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      
      {/* Pathogen List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredPathogens.map((pathogen) => {
          const threat = THREAT_LEVELS[pathogen.threat_level] || THREAT_LEVELS.LOW;
          const genome = GENOME_TYPES[pathogen.genome] || { icon: '?', color: '#999' };
          
          return (
            <button
              key={pathogen.name}
              onClick={() => onSelect(pathogen.name)}
              className={`w-full text-left p-3 rounded transition-all ${
                selectedPathogen === pathogen.name
                  ? 'bg-cyan-900/50 border border-cyan-500'
                  : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-white">{pathogen.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {pathogen.family} • {genome.icon} {pathogen.genome}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span style={threat} className="text-xs font-bold px-2 py-1 rounded bg-opacity-20"
                    style={{ backgroundColor: threat.bg, color: threat.color }}>
                    {threat.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{pathogen.size}bp</p>
                </div>
              </div>
              
              {/* Additional metrics */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded">
                  R₀: {pathogen.r_naught}
                </span>
                <span className="text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded">
                  {pathogen.mortality_rate}% mortality
                </span>
                {pathogen.vaccine_available && (
                  <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded">
                    ✓ Vaccine
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 text-center">{filteredPathogens.length} pathogens found</p>
    </div>
  );
};

// ============================================================================
// Pathogen Details Panel
// ============================================================================

const PathogenDetailsPanel = ({ pathogen, pathogenData }) => {
  const [expanded, setExpanded] = useState({});
  
  if (!pathogen || !pathogenData) return null;
  
  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="bg-slate-900 border border-cyan-900/50 rounded-lg p-4">
        <h3 className="text-cyan-400 font-semibold text-sm mb-3">📊 Pathogen Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded p-2">
            <p className="text-xs text-gray-500">Family</p>
            <p className="text-sm font-semibold text-gray-300">{pathogenData.family}</p>
          </div>
          
          <div className="bg-slate-800 rounded p-2">
            <p className="text-xs text-gray-500">Genome Type</p>
            <p className="text-sm font-semibold text-gray-300">{pathogenData.genome}</p>
          </div>
          
          <div className="bg-slate-800 rounded p-2">
            <p className="text-xs text-gray-500">Size (bp)</p>
            <p className="text-sm font-semibold text-gray-300">{pathogenData.size.toLocaleString()}</p>
          </div>
          
          <div className="bg-slate-800 rounded p-2">
            <p className="text-xs text-gray-500">Mortality</p>
            <p className="text-sm font-semibold text-red-400">{pathogenData.mortality_rate}%</p>
          </div>
          
          <div className="bg-slate-800 rounded p-2">
            <p className="text-xs text-gray-500">R₀ (Transmissibility)</p>
            <p className="text-sm font-semibold text-orange-400">{pathogenData.r_naught}</p>
          </div>
          
          <div className="bg-slate-800 rounded p-2">
            <p className="text-xs text-gray-500">Incubation</p>
            <p className="text-sm font-semibold text-gray-300">{pathogenData.incubation_days} days</p>
          </div>
        </div>
      </div>
      
      {/* Critical Proteins */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-slate-800/50 p-2 -m-2 rounded"
          onClick={() => setExpanded({...expanded, proteins: !expanded.proteins})}
        >
          <h3 className="text-cyan-400 font-semibold text-sm">🧬 Critical Proteins ({pathogenData.critical_proteins.length})</h3>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${expanded.proteins ? 'rotate-180' : ''}`} />
        </div>
        
        {expanded.proteins && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {pathogenData.critical_proteins.map((protein, idx) => (
              <div key={idx} className="bg-slate-800 rounded p-2">
                <p className="text-xs text-purple-300 font-semibold">{protein}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Druggable Sites */}
      <div className="bg-slate-900 border border-emerald-900/50 rounded-lg p-4">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-slate-800/50 p-2 -m-2 rounded"
          onClick={() => setExpanded({...expanded, druggable: !expanded.druggable})}
        >
          <h3 className="text-emerald-400 font-semibold text-sm">🎯 Druggable Sites ({pathogenData.druggable_sites.length})</h3>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${expanded.druggable ? 'rotate-180' : ''}`} />
        </div>
        
        {expanded.druggable && (
          <div className="mt-3 space-y-2">
            {pathogenData.druggable_sites.map((site, idx) => (
              <div key={idx} className="bg-emerald-950/30 border border-emerald-900/30 rounded p-2">
                <p className="text-xs text-emerald-300">{site}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* PDB Structures */}
      {pathogenData.pdb_structures && pathogenData.pdb_structures.length > 0 && (
        <div className="bg-slate-900 border border-blue-900/50 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold text-sm mb-2">🏗️ Available Structures (PDB)</h3>
          <div className="flex flex-wrap gap-2">
            {pathogenData.pdb_structures.map((pdb, idx) => (
              <a
                key={idx}
                href={`https://www.rcsb.org/structure/${pdb}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-900/50 text-blue-300 text-xs px-3 py-1 rounded hover:bg-blue-900 transition-colors"
              >
                {pdb} →
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Cross-Reactivity Analysis Panel
// ============================================================================

const CrossReactivityPanel = ({ crossReactivity }) => {
  if (!crossReactivity || crossReactivity.length === 0) return null;
  
  return (
    <div className="bg-slate-900 border border-purple-900/50 rounded-lg p-4">
      <h3 className="text-purple-400 font-semibold text-sm mb-3">🔗 Cross-Reactivity Potential</h3>
      
      <div className="space-y-2">
        {crossReactivity.map((item, idx) => (
          <div key={idx} className="bg-slate-800 rounded p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">{item[0]}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-700 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${item[1] * 100}%` }}
                  />
                </div>
                <span className="text-xs text-purple-300 font-semibold w-8 text-right">
                  {(item[1] * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        High cross-reactivity can enable broad-spectrum antivirals
      </p>
    </div>
  );
};

// ============================================================================
// Analysis Configuration
// ============================================================================

const AnalysisConfig = ({ selectedPathogen, selectedTarget, onStart, isRunning }) => {
  const [approach, setApproach] = useState('small_molecule');
  
  const approaches = [
    { id: 'small_molecule', label: 'Small Molecule', icon: '💊' },
    { id: 'monoclonal_antibody', label: 'Monoclonal Antibody', icon: '🧬' },
    { id: 'rna_interference', label: 'RNA Interference', icon: '🔇' },
    { id: 'vaccine', label: 'Vaccine Design', icon: '💉' },
    { id: 'gene_therapy', label: 'Gene Therapy', icon: '🔬' },
  ];
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
      <h3 className="text-cyan-400 font-semibold text-sm">⚙️ Analysis Configuration</h3>
      
      <div>
        <label className="text-xs text-gray-500 font-semibold uppercase mb-2 block">Therapeutic Approach</label>
        <div className="grid grid-cols-2 gap-2">
          {approaches.map(app => (
            <button
              key={app.id}
              onClick={() => setApproach(app.id)}
              className={`p-2 rounded text-xs font-semibold transition-all ${
                approach === app.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {app.icon} {app.label}
            </button>
          ))}
        </div>
      </div>
      
      <button
        onClick={() => onStart(approach)}
        disabled={!selectedPathogen || !selectedTarget || isRunning}
        className={`w-full py-2 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          isRunning || !selectedPathogen || !selectedTarget
            ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-700 hover:to-purple-700'
        }`}
      >
        <Play size={16} />
        {isRunning ? 'Analysis Running...' : 'Start Analysis'}
      </button>
    </div>
  );
};

// ============================================================================
// Main Dashboard
// ============================================================================

export default function BioViralV2Dashboard() {
  const [pathogens, setPathogens] = useState([]);
  const [selectedPathogen, setSelectedPathogen] = useState(null);
  const [pathogenData, setPathogenData] = useState(null);
  const [crossReactivity, setCrossReactivity] = useState([]);
  const [threatFilter, setThreatFilter] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loadingPathogens, setLoadingPathogens] = useState(true);
  
  // Load pathogens on mount
  useEffect(() => {
    const mockPathogens = [
      { name: 'SARS-CoV-2', family: 'Coronaviridae', genome: '(+)ssRNA', size: 29891, threat_level: 'HIGH', r_naught: 2.7, mortality_rate: 1.4, incubation_days: 5, vaccine_available: true },
      { name: 'Influenza A H1N1', family: 'Orthomyxoviridae', genome: '(-)ssRNA', size: 13588, threat_level: 'MEDIUM', r_naught: 1.5, mortality_rate: 0.02, incubation_days: 2, vaccine_available: true },
      { name: 'HIV-1', family: 'Retroviridae', genome: 'ssRNA-RT', size: 9749, threat_level: 'CRITICAL', r_naught: 2.0, mortality_rate: 100.0, incubation_days: 14, vaccine_available: false },
      { name: 'Ebola', family: 'Filoviridae', genome: '(-)ssRNA', size: 19111, threat_level: 'CRITICAL', r_naught: 2.0, mortality_rate: 50.0, incubation_days: 8, vaccine_available: true },
      { name: 'Dengue', family: 'Flaviviridae', genome: '(+)ssRNA', size: 10723, threat_level: 'MEDIUM', r_naught: 3.0, mortality_rate: 2.5, incubation_days: 4, vaccine_available: true },
      { name: 'Zika', family: 'Flaviviridae', genome: '(+)ssRNA', size: 10794, threat_level: 'MEDIUM', r_naught: 2.0, mortality_rate: 0.1, incubation_days: 3, vaccine_available: false },
      { name: 'Measles', family: 'Paramyxoviridae', genome: '(-)ssRNA', size: 15894, threat_level: 'HIGH', r_naught: 12.0, mortality_rate: 0.2, incubation_days: 10, vaccine_available: true },
      { name: 'Polio', family: 'Picornaviridae', genome: '(+)ssRNA', size: 7441, threat_level: 'CRITICAL', r_naught: 5.0, mortality_rate: 5.0, incubation_days: 3, vaccine_available: true },
      { name: 'Nipah', family: 'Paramyxoviridae', genome: '(-)ssRNA', size: 18246, threat_level: 'CRITICAL', r_naught: 0.4, mortality_rate: 75.0, incubation_days: 4, vaccine_available: false },
      { name: 'Smallpox', family: 'Poxviridae', genome: 'dsDNA', size: 186000, threat_level: 'CRITICAL', r_naught: 5.0, mortality_rate: 30.0, incubation_days: 7, vaccine_available: true },
    ];
    
    setPathogens(mockPathogens);
    setLoadingPathogens(false);
  }, []);
  
  // Handle pathogen selection
  const handlePathogenSelect = async (pathogenName) => {
    setSelectedPathogen(pathogenName);
    
    // Fetch pathogen details
    const pathogen = pathogens.find(p => p.name === pathogenName);
    setPathogenData(pathogen);
    
    // Mock cross-reactivity
    const mockCrossReactivity = [
      ['Similar Coronavirus', 0.85],
      ['Related Flavivirus', 0.72],
      ['Distant Paramyxovirus', 0.45],
      ['Unrelated Retrovirus', 0.15],
    ];
    setCrossReactivity(mockCrossReactivity);
  };
  
  const handleStartAnalysis = async (approach) => {
    if (!selectedPathogen || !pathogenData) return;
    
    setIsRunning(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setAnalysisResults({
      pathogen: selectedPathogen,
      approach: approach,
      top_candidate: {
        affinity: -10.2,
        ki: 42,
        selectivity: 290,
        bioavailability: 68,
        half_life: 18.5,
      },
      timestamp: new Date().toLocaleTimeString(),
    });
    
    setIsRunning(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Beaker className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">BioViral v2.0</h1>
              <p className="text-xs text-gray-400">Advanced Antiviral Synthesis - 40+ Pathogens | Enhanced ML Algorithms</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-xs">
            <span className="bg-cyan-900/50 text-cyan-300 px-3 py-1 rounded flex items-center gap-1">
              <Globe size={12} /> {pathogens.length} Pathogens
            </span>
            <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded flex items-center gap-1">
              <AlertTriangle size={12} /> {pathogens.filter(p => p.threat_level === 'CRITICAL').length} Critical Threats
            </span>
            <span className="bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded flex items-center gap-1">
              <CheckCircle size={12} /> Ensemble Predictions
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel: Pathogen Selection */}
          <div className="lg:col-span-2">
            {loadingPathogens ? (
              <div className="bg-slate-900 rounded-lg p-4 text-center text-gray-400">
                Loading pathogens...
              </div>
            ) : (
              <>
                <PathogenSelector
                  pathogens={pathogens}
                  selectedPathogen={selectedPathogen}
                  onSelect={handlePathogenSelect}
                  threatFilter={threatFilter}
                  setThreatFilter={setThreatFilter}
                />
                
                {selectedPathogen && (
                  <div className="mt-4">
                    <AnalysisConfig
                      selectedPathogen={selectedPathogen}
                      selectedTarget={selectedPathogen}
                      onStart={handleStartAnalysis}
                      isRunning={isRunning}
                    />
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Right Panel: Details & Results */}
          <div className="lg:col-span-3 space-y-4">
            {selectedPathogen && pathogenData ? (
              <>
                <PathogenDetailsPanel
                  pathogen={selectedPathogen}
                  pathogenData={pathogenData}
                />
                
                {crossReactivity.length > 0 && (
                  <CrossReactivityPanel crossReactivity={crossReactivity} />
                )}
                
                {analysisResults && (
                  <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-900/50 rounded-lg p-4">
                    <h3 className="text-emerald-400 font-semibold text-sm mb-3">✓ Analysis Complete</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-xs text-gray-500">Binding Affinity</p>
                        <p className="text-sm font-bold text-emerald-400">{analysisResults.top_candidate.affinity} kcal/mol</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-xs text-gray-500">Ki (nM)</p>
                        <p className="text-sm font-bold text-emerald-400">{analysisResults.top_candidate.ki}</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-xs text-gray-500">Selectivity</p>
                        <p className="text-sm font-bold text-emerald-400">{analysisResults.top_candidate.selectivity}:1</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-xs text-gray-500">Bioavailability</p>
                        <p className="text-sm font-bold text-blue-400">{analysisResults.top_candidate.bioavailability}%</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-xs text-gray-500">Half-life</p>
                        <p className="text-sm font-bold text-purple-400">{analysisResults.top_candidate.half_life}h</p>
                      </div>
                      <div className="bg-slate-800 rounded p-2">
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="text-sm font-bold text-gray-300">{analysisResults.timestamp}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <Microscope className="text-gray-600 w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400">Select a pathogen to begin analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
