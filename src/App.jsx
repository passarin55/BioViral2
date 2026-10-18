import React, { useState, useEffect, useRef } from 'react';
import { Beaker, Microscope, BookOpen, Zap, TrendingUp, Download, Play, Filter, Search, Globe, AlertTriangle, CheckCircle, ChevronDown, BarChart3, Network } from 'lucide-react';
import ProteinEditorAdvanced from './ProteinEditorAdvanced';
import { getMockProteinData } from './proteinAPI';

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

const PathogenDetailsPanel = ({ pathogen, pathogenData, onSelectProtein }) => {
  const [expanded, setExpanded] = useState({});

  if (!pathogen || !pathogenData) return null;

  return (
    <div className="space-y-4">
      {/* Quick Access: Protein Gene Editor */}
      <div className="bg-gradient-to-r from-cyan-950 to-purple-950 border border-cyan-700 rounded-lg p-3">
        <p className="text-cyan-400 font-bold text-sm mb-2">🧬 Protein Gene Editing</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {pathogenData.critical_proteins?.slice(0, 6).map((protein, idx) => (
            <button
              key={idx}
              onClick={() => onSelectProtein(protein)}
              className="bg-cyan-900/50 hover:bg-cyan-700 text-cyan-300 hover:text-white text-xs px-2 py-1.5 rounded transition-all font-semibold"
            >
              {protein}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">↑ Click any protein to open gene editor</p>
      </div>

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
              <button
                key={idx}
                onClick={() => {
                  onSelectProtein(protein);
                }}
                className="bg-slate-800 hover:bg-purple-900/50 rounded p-2 transition-colors text-left"
              >
                <p className="text-xs text-purple-300 font-semibold">{protein}</p>
                <p className="text-xs text-gray-500 mt-1">Click to edit →</p>
              </button>
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
// Protein Editor Wrapper
// ============================================================================

const ProteinEditorWrapper = ({ pathogenName, proteinName }) => {
  const proteinData = getMockProteinData(proteinName);
  return <ProteinEditorAdvanced pathogenName={pathogenName} selectedProtein={proteinName} proteinData={proteinData} />;
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
  const [selectedProtein, setSelectedProtein] = useState(null);
  const [showProteinEditor, setShowProteinEditor] = useState(false);

  // Load pathogens on mount
  useEffect(() => {
    const mockPathogens = [
      { name: 'SARS-CoV-2', family: 'Coronaviridae', genome: '(+)ssRNA', size: 29891, threat_level: 'HIGH', r_naught: 2.7, mortality_rate: 1.4, incubation_days: 5, vaccine_available: true, critical_proteins: ['Spike', 'RdRp', '3CLpro', 'M', 'E', 'N'], druggable_sites: ['RdRp', '3CLpro', 'Spike-RBD', 'spike-fusion', 'nsp5'], pdb_structures: ['6YB7', '6W9Q', '6ZGL', '6ZCS', '7K0N'] },
      { name: 'Dengue', family: 'Flaviviridae', genome: '(+)ssRNA', size: 10723, threat_level: 'MEDIUM', r_naught: 3.0, mortality_rate: 2.5, incubation_days: 4, vaccine_available: true, critical_proteins: ['NS5', 'NS3', 'Envelope', 'prM'], druggable_sites: ['NS5-methyltransferase', 'NS3-protease', 'Envelope-domain'], pdb_structures: ['3J27', '2HHO', '4A0A'] },
      { name: 'Zika', family: 'Flaviviridae', genome: '(+)ssRNA', size: 10794, threat_level: 'MEDIUM', r_naught: 2.0, mortality_rate: 0.1, incubation_days: 3, vaccine_available: false, critical_proteins: ['NS5', 'NS3', 'Envelope'], druggable_sites: ['NS5-polymerase', 'NS3-helicase', 'Envelope'], pdb_structures: ['3J27'] },
      { name: 'Yellow Fever', family: 'Flaviviridae', genome: '(+)ssRNA', size: 11000, threat_level: 'HIGH', r_naught: 2.0, mortality_rate: 15.0, incubation_days: 3, vaccine_available: true, critical_proteins: ['NS5', 'NS3', 'Envelope'], druggable_sites: ['NS5', 'NS3', 'Envelope-domain'], pdb_structures: ['3J27'] },
      { name: 'Measles', family: 'Paramyxoviridae', genome: '(-)ssRNA', size: 15894, threat_level: 'HIGH', r_naught: 12.0, mortality_rate: 0.2, incubation_days: 10, vaccine_available: true, critical_proteins: ['H', 'F', 'L', 'N'], druggable_sites: ['H-protein', 'F-protein-fusion'], pdb_structures: ['3CIW'] },
      { name: 'Mumps', family: 'Paramyxoviridae', genome: '(-)ssRNA', size: 15384, threat_level: 'MEDIUM', r_naught: 5.0, mortality_rate: 0.02, incubation_days: 18, vaccine_available: true, critical_proteins: ['HN', 'F', 'L'], druggable_sites: ['HN-receptor', 'F-fusion'], pdb_structures: ['1EMV'] },
      { name: 'Polio', family: 'Picornaviridae', genome: '(+)ssRNA', size: 7441, threat_level: 'CRITICAL', r_naught: 5.0, mortality_rate: 5.0, incubation_days: 3, vaccine_available: true, critical_proteins: ['3C', '3D', 'VP1', 'VP2', 'VP3'], druggable_sites: ['3C-protease', '3D-polymerase', 'capsid'], pdb_structures: ['4MUD'] },
      { name: 'Rotavirus', family: 'Reoviridae', genome: '(+)ssRNA', size: 18550, threat_level: 'MEDIUM', r_naught: 8.0, mortality_rate: 0.03, incubation_days: 2, vaccine_available: true, critical_proteins: ['VP4', 'VP7', 'VP3', 'RdRp'], druggable_sites: ['VP4-spike', 'VP7-glycan'], pdb_structures: ['1HKL'] },
      { name: 'Influenza A H1N1', family: 'Orthomyxoviridae', genome: '(-)ssRNA', size: 13588, threat_level: 'MEDIUM', r_naught: 1.5, mortality_rate: 0.02, incubation_days: 2, vaccine_available: true, critical_proteins: ['HA', 'NA', 'M1', 'PB1', 'PB2', 'PA'], druggable_sites: ['HA-receptor', 'NA-active-site', 'polymerase-complex'], pdb_structures: ['2ASK', '3BEQ', '3FKU'] },
      { name: 'Influenza B', family: 'Orthomyxoviridae', genome: '(-)ssRNA', size: 14600, threat_level: 'MEDIUM', r_naught: 1.3, mortality_rate: 0.01, incubation_days: 2, vaccine_available: true, critical_proteins: ['HA', 'NA', 'NB', 'M1'], druggable_sites: ['HA-receptor', 'NA-active-site'], pdb_structures: ['3BEC'] },
      { name: 'Ebola', family: 'Filoviridae', genome: '(-)ssRNA', size: 19111, threat_level: 'CRITICAL', r_naught: 2.0, mortality_rate: 50.0, incubation_days: 8, vaccine_available: true, critical_proteins: ['GP', 'VP35', 'VP40', 'L'], druggable_sites: ['GP-receptor-binding', 'VP35-interferon-antagonist'], pdb_structures: ['1EBO'] },
      { name: 'Marburg', family: 'Filoviridae', genome: '(-)ssRNA', size: 19114, threat_level: 'CRITICAL', r_naught: 1.0, mortality_rate: 25.0, incubation_days: 9, vaccine_available: false, critical_proteins: ['GP', 'VP40', 'L'], druggable_sites: ['GP-glycan-cap', 'VP40-matrix'], pdb_structures: ['3UCA'] },
      { name: 'Lassa', family: 'Arenaviridae', genome: '(-)ssRNA', size: 10997, threat_level: 'HIGH', r_naught: 0.8, mortality_rate: 15.0, incubation_days: 10, vaccine_available: false, critical_proteins: ['GP', 'Z', 'L', 'NP'], druggable_sites: ['GP-receptor', 'Z-matrix'], pdb_structures: ['6FRH'] },
      { name: 'Junin', family: 'Arenaviridae', genome: '(-)ssRNA', size: 10948, threat_level: 'HIGH', r_naught: 0.7, mortality_rate: 30.0, incubation_days: 9, vaccine_available: true, critical_proteins: ['GP', 'Z', 'L'], druggable_sites: ['GP-receptor'], pdb_structures: [] },
      { name: 'Smallpox', family: 'Poxviridae', genome: 'dsDNA', size: 186000, threat_level: 'CRITICAL', r_naught: 5.0, mortality_rate: 30.0, incubation_days: 7, vaccine_available: true, critical_proteins: ['A29', 'D8', 'L1', 'D5'], druggable_sites: ['D8-membrane', 'DNA-polymerase'], pdb_structures: [] },
      { name: 'Monkeypox', family: 'Poxviridae', genome: 'dsDNA', size: 196858, threat_level: 'MEDIUM', r_naught: 0.5, mortality_rate: 3.0, incubation_days: 12, vaccine_available: true, critical_proteins: ['A29', 'D8', 'E3', 'K3L'], druggable_sites: ['DNA-polymerase', 'immune-evasion-proteins'], pdb_structures: [] },
      { name: 'Herpes Simplex 1', family: 'Herpesviridae', genome: 'dsDNA', size: 152260, threat_level: 'MEDIUM', r_naught: 1.0, mortality_rate: 0.1, incubation_days: 4, vaccine_available: false, critical_proteins: ['gB', 'gC', 'gD', 'gH', 'gJ', 'gL'], druggable_sites: ['glycoprotein-D-receptor', 'thymidine-kinase'], pdb_structures: ['2BID'] },
      { name: 'Herpes Simplex 2', family: 'Herpesviridae', genome: 'dsDNA', size: 155000, threat_level: 'MEDIUM', r_naught: 1.0, mortality_rate: 0.0, incubation_days: 4, vaccine_available: false, critical_proteins: ['gB', 'gD', 'gH'], druggable_sites: ['glycoprotein-D', 'thymidine-kinase'], pdb_structures: [] },
      { name: 'Cytomegalovirus', family: 'Herpesviridae', genome: 'dsDNA', size: 235646, threat_level: 'LOW', r_naught: 0.0, mortality_rate: 0.0, incubation_days: 28, vaccine_available: false, critical_proteins: ['gH', 'gL', 'gp116', 'pp65'], druggable_sites: ['glycoprotein-complex', 'phosphoprotein-65'], pdb_structures: [] },
      { name: 'Epstein-Barr', family: 'Herpesviridae', genome: 'dsDNA', size: 172282, threat_level: 'LOW', r_naught: 0.5, mortality_rate: 0.5, incubation_days: 30, vaccine_available: false, critical_proteins: ['gp350', 'gp25', 'gp85', 'gp42', 'EBNA1', 'EBNA2', 'LMP1', 'LMP2'], druggable_sites: ['gp350-cr2-binding', 'gp42-HLA-binding', 'EBNA1-DNA-binding', 'LMP1-signaling', 'viral-DNA-polymerase'], pdb_structures: ['1VW1', '3GHG', '5WIY'] },
      { name: 'Human Herpesvirus 6', family: 'Herpesviridae', genome: 'dsDNA', size: 160000, threat_level: 'LOW', r_naught: 1.0, mortality_rate: 0.01, incubation_days: 7, vaccine_available: false, critical_proteins: ['gp116', 'gp55', 'gp105', 'gp25'], druggable_sites: ['glycoprotein-complex', 'DNA-polymerase', 'viral-protease'], pdb_structures: [] },
      { name: 'Human Herpesvirus 7', family: 'Herpesviridae', genome: 'dsDNA', size: 162000, threat_level: 'LOW', r_naught: 0.8, mortality_rate: 0.0, incubation_days: 7, vaccine_available: false, critical_proteins: ['gp116', 'gp55', 'gp105'], druggable_sites: ['glycoprotein-receptor', 'DNA-polymerase'], pdb_structures: [] },
      { name: 'Human Herpesvirus 8', family: 'Herpesviridae', genome: 'dsDNA', size: 165263, threat_level: 'MEDIUM', r_naught: 0.0, mortality_rate: 5.0, incubation_days: 15, vaccine_available: false, critical_proteins: ['K1', 'gp116', 'gp55', 'ORF36'], druggable_sites: ['K1-signaling', 'glycoprotein-complex', 'viral-kinase', 'DNA-polymerase'], pdb_structures: ['5V8P'] },
      { name: 'Human Papillomavirus 16', family: 'Papillomaviridae', genome: 'dsDNA', size: 7945, threat_level: 'MEDIUM', r_naught: 1.0, mortality_rate: 0.0, incubation_days: 60, vaccine_available: true, critical_proteins: ['E6', 'E7', 'L1', 'L2'], druggable_sites: ['L1-capsid', 'E6-oncoprotein'], pdb_structures: ['6D5G'] },
      { name: 'HIV-1', family: 'Retroviridae', genome: 'ssRNA-RT', size: 9749, threat_level: 'CRITICAL', r_naught: 2.0, mortality_rate: 100.0, incubation_days: 14, vaccine_available: false, critical_proteins: ['Env', 'Gag', 'Pol', 'gp120', 'gp41'], druggable_sites: ['gp120-CD4-binding', 'RT-polymerase', 'protease', 'integrase'], pdb_structures: ['1DLO', '1EMV', '3SV6'] },
      { name: 'HIV-2', family: 'Retroviridae', genome: 'ssRNA-RT', size: 9722, threat_level: 'HIGH', r_naught: 1.0, mortality_rate: 100.0, incubation_days: 14, vaccine_available: false, critical_proteins: ['Env', 'Gag', 'Pol'], druggable_sites: ['RT-polymerase', 'protease'], pdb_structures: [] },
      { name: 'HTLV-1', family: 'Retroviridae', genome: 'ssRNA-RT', size: 9032, threat_level: 'MEDIUM', r_naught: 0.0, mortality_rate: 5.0, incubation_days: 365, vaccine_available: false, critical_proteins: ['Env', 'Tax', 'Rex'], druggable_sites: ['protease'], pdb_structures: [] },
      { name: 'Nipah', family: 'Paramyxoviridae', genome: '(-)ssRNA', size: 18246, threat_level: 'CRITICAL', r_naught: 0.4, mortality_rate: 75.0, incubation_days: 4, vaccine_available: false, critical_proteins: ['F', 'G', 'L'], druggable_sites: ['glycoprotein-G', 'fusion-F'], pdb_structures: ['3MKJ'] },
      { name: 'Hendra', family: 'Paramyxoviridae', genome: '(-)ssRNA', size: 18234, threat_level: 'CRITICAL', r_naught: 0.0, mortality_rate: 75.0, incubation_days: 4, vaccine_available: false, critical_proteins: ['F', 'G'], druggable_sites: ['glycoprotein-G'], pdb_structures: ['3MKJ'] },
      { name: 'Chikungunya', family: 'Togaviridae', genome: '(+)ssRNA', size: 11703, threat_level: 'MEDIUM', r_naught: 1.0, mortality_rate: 0.4, incubation_days: 3, vaccine_available: false, critical_proteins: ['E1', 'E2', 'nsP1-4'], druggable_sites: ['nsP2-protease', 'nsP4-polymerase'], pdb_structures: ['3J2W'] },
      { name: 'West Nile', family: 'Flaviviridae', genome: '(+)ssRNA', size: 11050, threat_level: 'MEDIUM', r_naught: 0.5, mortality_rate: 1.0, incubation_days: 3, vaccine_available: false, critical_proteins: ['NS5', 'NS3', 'E'], druggable_sites: ['NS5-polymerase', 'NS3-protease'], pdb_structures: ['2HHO'] },
      { name: 'Respiratory Syncytial', family: 'Paramyxoviridae', genome: '(-)ssRNA', size: 15222, threat_level: 'MEDIUM', r_naught: 3.0, mortality_rate: 0.5, incubation_days: 4, vaccine_available: false, critical_proteins: ['F', 'G', 'M2'], druggable_sites: ['F-protein-fusion', 'G-protein'], pdb_structures: ['2JMT'] },
      { name: 'Coronavirus HCoV-229E', family: 'Coronaviridae', genome: '(+)ssRNA', size: 27317, threat_level: 'LOW', r_naught: 2.0, mortality_rate: 0.0, incubation_days: 3, vaccine_available: false, critical_proteins: ['Spike', 'RdRp', '3CLpro'], druggable_sites: ['RdRp', '3CLpro'], pdb_structures: [] },
      { name: 'Influenza A H3N2', family: 'Orthomyxoviridae', genome: '(-)ssRNA', size: 13588, threat_level: 'MEDIUM', r_naught: 1.3, mortality_rate: 0.1, incubation_days: 2, vaccine_available: true, critical_proteins: ['HA', 'NA', 'M1', 'PB1', 'PB2'], druggable_sites: ['HA-receptor', 'NA-active-site', 'polymerase'], pdb_structures: ['1HGE', '2HU4'] },
      { name: 'Rhinovirus', family: 'Picornaviridae', genome: '(+)ssRNA', size: 7200, threat_level: 'LOW', r_naught: 2.0, mortality_rate: 0.0, incubation_days: 1, vaccine_available: false, critical_proteins: ['VP1', 'VP2', '3C', '3D'], druggable_sites: ['3C-protease', '3D-polymerase', 'capsid'], pdb_structures: ['4RHV'] },
      { name: 'Coxsackievirus', family: 'Picornaviridae', genome: '(+)ssRNA', size: 7400, threat_level: 'LOW', r_naught: 1.5, mortality_rate: 0.05, incubation_days: 3, vaccine_available: false, critical_proteins: ['VP1', 'VP2', '3C', '3D'], druggable_sites: ['3C-protease', 'capsid'], pdb_structures: ['1D4M'] },
      { name: 'Adenovirus', family: 'Adenoviridae', genome: 'dsDNA', size: 36000, threat_level: 'LOW', r_naught: 2.0, mortality_rate: 0.1, incubation_days: 5, vaccine_available: false, critical_proteins: ['Hexon', 'Fiber', 'Penton', 'DBP'], druggable_sites: ['Fiber-knob', 'DNA-binding-protein'], pdb_structures: ['1D4C'] },
      { name: 'Parainfluenza', family: 'Paramyxoviridae', genome: '(-)ssRNA', size: 15600, threat_level: 'LOW', r_naught: 1.0, mortality_rate: 0.01, incubation_days: 3, vaccine_available: false, critical_proteins: ['HN', 'F', 'M', 'L'], druggable_sites: ['HN-receptor', 'F-fusion'], pdb_structures: [] },
      { name: 'Coronavirus HCoV-OC43', family: 'Coronaviridae', genome: '(+)ssRNA', size: 30119, threat_level: 'LOW', r_naught: 2.5, mortality_rate: 0.1, incubation_days: 5, vaccine_available: false, critical_proteins: ['Spike', 'RdRp', 'N'], druggable_sites: ['RdRp', 'Spike-RBD'], pdb_structures: [] },
      { name: 'MERS-CoV', family: 'Coronaviridae', genome: '(+)ssRNA', size: 30119, threat_level: 'HIGH', r_naught: 0.9, mortality_rate: 34.0, incubation_days: 5, vaccine_available: false, critical_proteins: ['Spike', 'RdRp', '3CLpro', 'M'], druggable_sites: ['RdRp', '3CLpro', 'Spike-RBD'], pdb_structures: ['4ZOW', '5W5C'] },
      { name: 'Varicella-Zoster', family: 'Herpesviridae', genome: 'dsDNA', size: 125000, threat_level: 'LOW', r_naught: 10.0, mortality_rate: 0.01, incubation_days: 14, vaccine_available: true, critical_proteins: ['gB', 'gE', 'gI', 'gH'], druggable_sites: ['glycoprotein-complex', 'thymidine-kinase'], pdb_structures: [] },
      { name: 'Human Metapneumovirus', family: 'Paramyxoviridae', genome: '(-)ssRNA', size: 13300, threat_level: 'LOW', r_naught: 1.2, mortality_rate: 0.1, incubation_days: 5, vaccine_available: false, critical_proteins: ['F', 'G', 'M2', 'L'], druggable_sites: ['F-protein-fusion', 'G-protein'], pdb_structures: [] },
      { name: 'Coronavirus HCoV-NL63', family: 'Coronaviridae', genome: '(+)ssRNA', size: 27062, threat_level: 'LOW', r_naught: 2.0, mortality_rate: 0.0, incubation_days: 3, vaccine_available: false, critical_proteins: ['Spike', 'RdRp', '3CLpro'], druggable_sites: ['RdRp', '3CLpro'], pdb_structures: [] },
      { name: 'Parvovirus B19', family: 'Parvoviridae', genome: 'ssDNA', size: 5596, threat_level: 'LOW', r_naught: 0.5, mortality_rate: 0.0, incubation_days: 7, vaccine_available: false, critical_proteins: ['VP1', 'VP2', 'NS1'], druggable_sites: ['capsid-assembly'], pdb_structures: ['1S58'] },
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

    // Simulate analysis with approach-specific results
    await new Promise(resolve => setTimeout(resolve, 3000));

    const approachResults = {
      small_molecule: {
        title: 'Small Molecule Analysis',
        metrics: [
          { label: 'Binding Affinity', value: '-10.2', unit: 'kcal/mol', color: 'emerald' },
          { label: 'Ki (Dissociation)', value: '42', unit: 'nM', color: 'emerald' },
          { label: 'Selectivity Ratio', value: '290', unit: ':1', color: 'emerald' },
          { label: 'Bioavailability', value: '68', unit: '%', color: 'blue' },
          { label: 'Half-life', value: '18.5', unit: 'hours', color: 'purple' },
          { label: 'Synthetic Accessibility', value: '7.2', unit: '/10', color: 'orange' },
        ]
      },
      monoclonal_antibody: {
        title: 'Monoclonal Antibody Design',
        metrics: [
          { label: 'Binding Affinity', value: '-15.8', unit: 'kcal/mol', color: 'emerald' },
          { label: 'Kd (nM)', value: '2.1', unit: 'nM', color: 'emerald' },
          { label: 'Specificity Score', value: '94', unit: '%', color: 'emerald' },
          { label: 'CDR Complexity', value: '8.7', unit: '/10', color: 'blue' },
          { label: 'Thermal Stability', value: '78', unit: '°C', color: 'purple' },
          { label: 'Immunogenicity Risk', value: 'Low', unit: '', color: 'green' },
        ]
      },
      rna_interference: {
        title: 'RNA Interference Analysis',
        metrics: [
          { label: 'Target Accessibility', value: '92', unit: '%', color: 'emerald' },
          { label: 'siRNA Efficacy', value: '89', unit: '%', color: 'emerald' },
          { label: 'Off-target Score', value: '1.2', unit: 'hits', color: 'orange' },
          { label: 'GC Content', value: '48', unit: '%', color: 'blue' },
          { label: 'Secondary Structure', value: 'Minimal', unit: '', color: 'purple' },
          { label: 'Delivery Efficiency', value: '76', unit: '%', color: 'emerald' },
        ]
      },
      vaccine: {
        title: 'Vaccine Epitope Design',
        metrics: [
          { label: 'HLA Binding Score', value: '8.9', unit: '/10', color: 'emerald' },
          { label: 'T-cell Epitopes', value: '12', unit: 'identified', color: 'emerald' },
          { label: 'B-cell Coverage', value: '87', unit: '%', color: 'emerald' },
          { label: 'Conservation', value: '94', unit: 'across variants', color: 'blue' },
          { label: 'Immunogenicity', value: 'High', unit: '', color: 'green' },
          { label: 'Cross-protection', value: '78', unit: '%', color: 'purple' },
        ]
      },
      gene_therapy: {
        title: 'Self-Rewriting Advanced Gene Therapy',
        subtitle: 'Adaptive Multi-Round Editing with Viral Evolution Tracking',
        editingRounds: [
          {
            round: 1,
            name: 'Initial Multi-Target CRISPR-Cas9',
            subtitle: 'Receptor Deletion + Innate Immunity Activation',
            status: 'Primary Defense (Year 0)',
            metrics: [
              { label: 'CRISPR Specificity', value: '99.8', unit: '%', color: 'emerald' },
              { label: 'Off-target Sites', value: '0', unit: 'found', color: 'emerald' },
              { label: 'Guide RNA Efficiency', value: '92', unit: '%', color: 'emerald' },
              { label: 'Delivery Method', value: 'AAV6', unit: '', color: 'blue' },
              { label: 'Target Genes', value: 'CCR5 + CXCL12', unit: '', color: 'purple' },
              { label: 'Efficacy', value: '94', unit: '%', color: 'emerald' },
            ],
            targets: [
              { gene: 'CCR5', mechanism: 'Primary entry receptor deletion', blockade: '60-70%' },
              { gene: 'CXCL12', mechanism: 'Backup entry pathway modification', blockade: '40-50%' }
            ],
            escapePrediction: {
              viralEscapeRate: '5-8% per year',
              dominantMutations: ['Vpr↑', 'Nef↑', 'Env↔'],
              timeToEscape: '2-3 years',
              likelyEscapeGene: 'Envelope X4 shift'
            },
            targetInfo: 'Initial dual-barrier receptor blockade'
          },
          {
            round: 2,
            name: 'Adaptive Base Editing - Escape Response',
            subtitle: 'Self-Triggered on Viral Detection',
            status: 'Secondary Defense (Year 2-3)',
            metrics: [
              { label: 'Base Edit Precision', value: '99.2', unit: '%', color: 'emerald' },
              { label: 'Off-target Edits', value: '0.1', unit: 'per target', color: 'green' },
              { label: 'Editing Efficiency', value: '87', unit: '%', color: 'emerald' },
              { label: 'Delivery Trigger', value: 'Immune-responsive AAV9', unit: '', color: 'blue' },
              { label: 'Target Gene', value: 'TRIM5α insertion', unit: '', color: 'purple' },
              { label: 'Self-Trigger', value: 'PKR/OAS activation', unit: '', color: 'orange' },
            ],
            targets: [
              { gene: 'TRIM5α', mechanism: 'Capsid restriction insertion', blockade: '50-100x resistance' },
              { gene: 'APOBEC3G', mechanism: 'Hypermutation pathway activation', blockade: 'G→A mutation burst' }
            ],
            escapePrediction: {
              viralEscapeRate: '1-2% per year',
              dominantMutations: ['Vif↑↑', 'Vpr↓', 'Nef→'],
              timeToEscape: '4-5 years',
              likelyEscapeGene: 'Vif-APOBEC3G antagonism'
            },
            targetInfo: 'Triggered by IFN-α expression detecting viral replication',
            selfTrigger: {
              mechanism: 'Interferon-stimulated gene (ISG) pathway',
              activation: 'dsRNA from active viral replication',
              delivery: 'Inducible promoter AAV (delayed, but fast-acting)',
              delayToActivation: '48-72 hours after viral detection'
            }
          },
          {
            round: 3,
            name: 'Prime Editing - Multi-Gene Redundancy',
            subtitle: 'Self-Activated by Cumulative Viral Pressure',
            status: 'Tertiary Defense (Year 4-5)',
            metrics: [
              { label: 'Prime Edit Accuracy', value: '99.5', unit: '%', color: 'emerald' },
              { label: 'Multi-edit Capacity', value: '3-4', unit: 'simultaneous edits', color: 'blue' },
              { label: 'Indel Formation', value: '<0.5', unit: '%', color: 'green' },
              { label: 'Delivery Trigger', value: 'Immune-activated LNP-PE', unit: '', color: 'blue' },
              { label: 'Editing Genes', value: 'Tetherin + IL2RG + BST2', unit: '', color: 'purple' },
              { label: 'Self-Repair', value: 'Yes (regenerating)', unit: '', color: 'green' },
            ],
            targets: [
              { gene: 'Tetherin (BST-2)', mechanism: 'Vpu-resistant variant insertion', blockade: 'Viral budding block' },
              { gene: 'IL2RG', mechanism: 'Enhanced T-cell function', blockade: 'Adaptive immunity boost' },
              { gene: 'MHC-I', mechanism: 'Upregulation via base edit', blockade: 'Immune recognition' }
            ],
            escapePrediction: {
              viralEscapeRate: '0.1-0.5% per year',
              dominantMutations: ['Vpu→→', 'Nef↓', 'critical loss'],
              timeToEscape: '7-10+ years',
              likelyEscapeGene: 'Lethal Vpu mutations (fitness cost)'
            },
            targetInfo: 'Triple-redundant membrane trafficking disruption',
            selfTrigger: {
              mechanism: 'Cumulative viral escape signals + PKR hyperactivation',
              activation: 'Combination of: HIGH viral load + Vif upregulation + eIF2α phosphorylation',
              delivery: 'Dual AAV with inducible PE (packaged as split components)',
              delayToActivation: '1-2 weeks after secondary activation'
            }
          },
          {
            round: 4,
            name: 'Epigenetic Editing - Permanent Immune Reprogramming',
            subtitle: 'Ultimate Self-Sustaining Defense',
            status: 'Quaternary Defense (Year 6+)',
            metrics: [
              { label: 'Epigenetic Precision', value: '97.8', unit: '%', color: 'emerald' },
              { label: 'Gene Silencing Target', value: 'Viral antagonists', unit: '', color: 'blue' },
              { label: 'ISG Activation', value: '300+', unit: 'genes sustained', color: 'emerald' },
              { label: 'Delivery Method', value: 'Self-replicating AAV', unit: '', color: 'blue' },
              { label: 'Expression Pattern', value: 'Constitutive antiviral state', unit: '', color: 'purple' },
              { label: 'Self-Regeneration', value: 'Permanent (cell divisions)', unit: '', color: 'green' },
            ],
            targets: [
              { gene: 'H3K4me3 (IFN-α locus)', mechanism: 'Permanent chromatin opening', blockade: 'Sustained ISG' },
              { gene: 'H3K27me3 (HIV genes)', mechanism: 'Viral gene silencing', blockade: 'Transcriptional block' }
            ],
            escapePrediction: {
              viralEscapeRate: '<0.01% per year',
              dominantMutations: ['Genomic integration impossible', 'Latency reactivation rare'],
              timeToEscape: '15-20+ years',
              likelyEscapeGene: 'None (functional cure pathway)'
            },
            targetInfo: 'Permanent antiviral cellular state via chromatin remodeling',
            selfTrigger: {
              mechanism: 'HDAC inhibitor + dCas9-p300 cascade',
              activation: 'Sustained high ISG expression creates feedback loop',
              delivery: 'Trans-generational (persists through cell division)',
              delayToActivation: 'Months (but permanent once established)',
              outcome: 'Functional cure signature'
            }
          }
        ],
        feedbackLoops: [
          {
            loop: 'Immune Sensing → Adaptive Editing',
            trigger: 'Viral RNA detected by RIG-I/MDA5',
            response: 'PKR activation → eIF2α phosphorylation → AAV vector unsilencing',
            outcome: 'Secondary edits deployed automatically'
          },
          {
            loop: 'Escape Mutation Detection → Multi-Target Expansion',
            trigger: 'Vif/Vpr/Nef upregulation detected',
            response: 'IL-15 production → NK cell activation → additional immune genes targeted for editing',
            outcome: 'Dynamic broadening of antiviral defenses'
          },
          {
            loop: 'Viral Load Monitoring → Epigenetic Locking',
            trigger: 'Sustained low viral load (<50 copies/mL)',
            response: 'CREB phosphorylation → HDAC inhibition → permanent chromatin remodeling',
            outcome: 'Transition from active defense to permanent antiviral state'
          }
        ]
      }
    };

    const result = approachResults[approach];

    setAnalysisResults({
      pathogen: selectedPathogen,
      approach: approach,
      title: result.title,
      subtitle: result.subtitle || null,
      metrics: result.metrics || null,
      strategies: result.strategies || null,
      editingRounds: result.editingRounds || null,
      feedbackLoops: result.feedbackLoops || null,
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
                  onSelectProtein={(protein) => {
                    setSelectedProtein(protein);
                    setShowProteinEditor(true);
                  }}
                />

                {showProteinEditor && selectedProtein && (
                  <div className="border-t-2 border-cyan-900 pt-4">
                    <button
                      onClick={() => setShowProteinEditor(false)}
                      className="text-xs text-gray-400 hover:text-gray-200 mb-2"
                    >
                      ← Hide Protein Editor
                    </button>
                    <ProteinEditorWrapper
                      pathogenName={selectedPathogen}
                      proteinName={selectedProtein}
                    />
                  </div>
                )}

                {crossReactivity.length > 0 && !showProteinEditor && (
                  <CrossReactivityPanel crossReactivity={crossReactivity} />
                )}

                {analysisResults && (
                  <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-900/50 rounded-lg p-4 space-y-4">
                    <div>
                      <h3 className="text-emerald-400 font-semibold text-sm mb-1">✓ Analysis Complete</h3>
                      <p className="text-xs text-gray-400">{analysisResults.title}</p>
                      <p className="text-xs text-gray-500 mt-1">Completed at {analysisResults.timestamp}</p>
                    </div>

                    {analysisResults.metrics ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {analysisResults.metrics.map((metric, idx) => {
                          const colorClasses = {
                            emerald: 'text-emerald-400',
                            blue: 'text-blue-400',
                            purple: 'text-purple-400',
                            orange: 'text-orange-400',
                            green: 'text-green-400',
                          };
                          return (
                            <div key={idx} className="bg-slate-800 rounded p-2">
                              <p className="text-xs text-gray-500">{metric.label}</p>
                              <p className={`text-sm font-bold ${colorClasses[metric.color]}`}>
                                {metric.value} {metric.unit}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {analysisResults.editingRounds ? (
                      <div className="space-y-4">
                        <div className="border-l-4 border-cyan-500 pl-3">
                          <p className="text-xs font-bold text-cyan-300">🔄 SELF-REWRITING GENE THERAPY</p>
                          <p className="text-xs text-gray-400 mt-1">Multi-round adaptive editing with viral evolution tracking</p>
                        </div>

                        {analysisResults.editingRounds.map((round, rIdx) => (
                          <div key={rIdx} className="bg-slate-800/70 border border-emerald-800/50 rounded-lg p-3">
                            <div className="mb-3 pb-2 border-b border-slate-700">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-emerald-300">ROUND {round.round}: {round.name}</p>
                                <span className="text-xs px-2 py-1 bg-slate-700 text-gray-300 rounded">{round.status}</span>
                              </div>
                              <p className="text-xs text-gray-400">{round.subtitle}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                              {round.metrics.map((metric, mIdx) => {
                                const colorClasses = {
                                  emerald: 'text-emerald-400',
                                  blue: 'text-blue-400',
                                  purple: 'text-purple-400',
                                  orange: 'text-orange-400',
                                  green: 'text-green-400',
                                };
                                return (
                                  <div key={mIdx} className="bg-slate-900 rounded p-1.5">
                                    <p className="text-xs text-gray-500">{metric.label}</p>
                                    <p className={`text-xs font-bold ${colorClasses[metric.color]}`}>
                                      {metric.value} {metric.unit}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="space-y-2 text-xs">
                              <div>
                                <p className="text-purple-400 font-semibold mb-1">🎯 Target Genes:</p>
                                {round.targets.map((t, tIdx) => (
                                  <p key={tIdx} className="text-gray-400 ml-2">
                                    • <span className="text-cyan-300">{t.gene}</span>: {t.mechanism} ({t.blockade})
                                  </p>
                                ))}
                              </div>

                              {round.escapePrediction && (
                                <div className="bg-slate-900/50 rounded p-2 border-l-2 border-orange-600">
                                  <p className="text-orange-400 font-semibold mb-1">⚠️ Escape Prediction:</p>
                                  <p className="text-gray-400">Escape rate: <span className="text-orange-300">{round.escapePrediction.viralEscapeRate}</span></p>
                                  <p className="text-gray-400">Time to escape: <span className="text-orange-300">{round.escapePrediction.timeToEscape}</span></p>
                                  <p className="text-gray-400">Likely mutation: <span className="text-orange-300">{round.escapePrediction.likelyEscapeGene}</span></p>
                                </div>
                              )}

                              {round.selfTrigger && (
                                <div className="bg-emerald-900/30 rounded p-2 border-l-2 border-emerald-600">
                                  <p className="text-emerald-400 font-semibold mb-1">🔄 Self-Trigger Mechanism:</p>
                                  <p className="text-gray-400">Activation: <span className="text-emerald-300">{round.selfTrigger.activation}</span></p>
                                  <p className="text-gray-400">Delay: <span className="text-emerald-300">{round.selfTrigger.delayToActivation}</span></p>
                                  <p className="text-gray-400">Outcome: <span className="text-emerald-300">{round.selfTrigger.outcome || 'Automatic deployment'}</span></p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {analysisResults.feedbackLoops && (
                          <div className="bg-slate-800/50 border border-cyan-800/50 rounded-lg p-3 mt-4">
                            <p className="text-xs font-bold text-cyan-400 mb-2">🔁 Feedback Loops (Self-Rewriting Engine):</p>
                            <div className="space-y-2">
                              {analysisResults.feedbackLoops.map((loop, lIdx) => (
                                <div key={lIdx} className="text-xs text-gray-400 p-2 bg-slate-900/30 rounded">
                                  <p className="text-cyan-300 font-semibold">{loop.loop}</p>
                                  <p className="mt-1">Trigger: {loop.trigger}</p>
                                  <p>Response: {loop.response}</p>
                                  <p className="text-emerald-300">Outcome: {loop.outcome}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
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
