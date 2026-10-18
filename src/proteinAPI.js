/**
 * Protein Data Integration Service
 * Connects to public repositories: PDB, UniProt, AlphaFold, NCBI
 */

// PDB API - Fetch protein structures and metadata
export const fetchPDBStructure = async (pdbId) => {
  try {
    const response = await fetch(`https://data.rcsb.org/rest/v1/core/structure/${pdbId}`);
    if (!response.ok) throw new Error(`PDB fetch failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('PDB API Error:', error);
    return null;
  }
};

// UniProt API - Fetch protein sequences and annotations
export const fetchUniProtData = async (proteinName) => {
  try {
    const response = await fetch(
      `https://rest.uniprot.org/uniprotkb/search?query=${proteinName}&format=json&size=1`
    );
    if (!response.ok) throw new Error(`UniProt fetch failed: ${response.status}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  } catch (error) {
    console.error('UniProt API Error:', error);
    return null;
  }
};

// AlphaFold DB - Fetch predicted protein structures
export const fetchAlphaFoldStructure = async (uniprotId) => {
  try {
    const response = await fetch(
      `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_v4.cif`
    );
    if (response.ok) {
      return await response.text();
    }
    return null;
  } catch (error) {
    console.error('AlphaFold API Error:', error);
    return null;
  }
};

// NCBI Gene Info - Fetch gene details
export const fetchNCBIGeneInfo = async (geneName) => {
  try {
    const response = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${geneName}&retmode=json`
    );
    if (!response.ok) throw new Error(`NCBI fetch failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('NCBI API Error:', error);
    return null;
  }
};

// Get protein structure from PDB or AlphaFold
export const getProteinStructure = async (pdbId, uniprotId) => {
  let structure = null;

  // Try PDB first
  if (pdbId) {
    const pdbData = await fetchPDBStructure(pdbId);
    if (pdbData) {
      structure = {
        source: 'PDB',
        pdbId: pdbId,
        title: pdbData.struct.title,
        resolution: pdbData.rcsb_entry_info?.resolution_combined?.[0],
        data: pdbData,
      };
    }
  }

  // Fallback to AlphaFold
  if (!structure && uniprotId) {
    const afData = await fetchAlphaFoldStructure(uniprotId);
    if (afData) {
      structure = {
        source: 'AlphaFold',
        uniprotId: uniprotId,
        data: afData,
      };
    }
  }

  return structure;
};

// Mock data for offline testing (when API is unavailable)
export const getMockProteinData = (proteinName) => {
  const mockData = {
    'Spike': {
      name: 'Spike protein (S)',
      uniprotId: 'P0DTC2',
      pdbId: '6VSB',
      sequence: 'MFVFLVLLPLVSSQCVNLTTRTQLPPAYTNSFTRGVYYPDKVFRSSVLHSTQDLFLPFFSNVTWFHAIHVSGTNGTKRFDNPVLPFNDGVYFASTEKSNIIRGWIFGTTLDSKTQSLLIVNNATNVVIKVCEFQFCNDPFLGVYYHKNNKSWMESEFRVYSSANNCTFEYVSQPFLMDLEGKQGNFKNLREFVFKNIDGYFKIYSKHTPPIKDFGGWTNWIGFIGANS',
      length: 1273,
      domains: [
        { name: 'Signal peptide', start: 1, end: 13 },
        { name: 'S1 subunit (RBD)', start: 14, end: 685 },
        { name: 'S2 subunit', start: 686, end: 1273 },
        { name: 'Fusion peptide', start: 816, end: 835 },
        { name: 'HR1', start: 912, end: 984 },
        { name: 'HR2', start: 1163, end: 1213 },
      ],
      druggableSites: [
        { name: 'RBD-ACE2 binding', residues: [417, 453, 455, 456, 457, 475, 486, 493], confidence: 0.92 },
        { name: 'Furin cleavage', residues: [682, 683, 684, 685], confidence: 0.95 },
        { name: 'Fusion peptide pocket', residues: [816, 835], confidence: 0.88 },
      ],
      mutations: [
        { name: 'D614G', position: 614, prevalence: '99.9%', impact: 'Increased infectivity' },
        { name: 'N501Y (Alpha)', position: 501, prevalence: '45%', impact: 'Enhanced RBD binding' },
        { name: 'L452R (Delta)', position: 452, prevalence: '32%', impact: 'Immune escape' },
      ],
      conservationScore: 0.78,
      expression: 'Surface protein, homotrimer',
    },
    'RdRp': {
      name: 'RNA-dependent RNA polymerase (nsp12)',
      uniprotId: 'P0DTW1',
      pdbId: '7BV2',
      sequence: 'MSNSLDVFVSSQCVNLTTRTQLPPAYTNSFTRGVYYPDKVFRSSVLHSTQDLFLPFFSNVTWFHAIHVSGTNGTKRFDNPVLPFNDGVYFASTEKSNIIRGWIFGTTLDSKTQSLLIVNNATNVVIKVCEFQFCNDPFLGVYYHKNNKSWMESEFRVYSSANNCTFEYVSQPFLMDLEGKQGNFKNLREFVFKNIDGYFKIYSKHTPPIKDFGGWTNWIGFIGANS',
      length: 932,
      domains: [
        { name: 'Palm domain', start: 1, end: 300 },
        { name: 'Fingers domain', start: 301, end: 600 },
        { name: 'Thumb domain', start: 601, end: 932 },
      ],
      druggableSites: [
        { name: 'NTP entry channel', residues: [61, 117, 175], confidence: 0.94 },
        { name: 'Polymerase active site', residues: [758, 760, 761], confidence: 0.97 },
        { name: 'nsp7/nsp8 interface', residues: [800, 850], confidence: 0.85 },
      ],
      mutations: [
        { name: 'P314L', position: 314, prevalence: '5%', impact: 'Remdesivir resistance' },
        { name: 'P4715L', position: 715, prevalence: '<1%', impact: 'Polymerase defect' },
      ],
      conservationScore: 0.92,
      expression: 'Cytoplasmic, catalytic core',
    },
    '3CLpro': {
      name: '3-chymotrypsin-like protease (nsp5)',
      uniprotId: 'P0DTW1',
      pdbId: '6LU7',
      sequence: 'SGFRKMAFPSGKVEGCMVQVTCGTTTLNGLWLDDTVYCPRHVICTSVEDMLNPGDEDRLSPLHSVYVDQWDWERVMGDGERQFSTLKSTVEAIWAGIKATEAAVSEEFGLAPFLPDQIHFVHSQELLSRYPDLDAKGRERAIAKDLGAVFLVGIGGKLSDCWVSNEWVSGCQLSSQSTVDYDNLPPFMLHMFFRRKQTLGPGQKQR',
      length: 306,
      domains: [
        { name: 'Catalytic domain', start: 1, end: 306 },
        { name: 'Active site', start: 141, end: 145 },
      ],
      druggableSites: [
        { name: 'Active site (His41/Cys145)', residues: [41, 145], confidence: 0.99 },
        { name: 'Substrate binding pocket', residues: [163, 187, 191, 200], confidence: 0.96 },
        { name: 'Dimer interface', residues: [1, 50, 290, 306], confidence: 0.88 },
      ],
      mutations: [
        { name: 'L50F', position: 50, prevalence: '2%', impact: 'Protease inhibitor resistance' },
        { name: 'A46S', position: 46, prevalence: '<1%', impact: 'Reduced catalytic activity' },
      ],
      conservationScore: 0.95,
      expression: 'Non-structural protein (NSP5)',
    },
    'M': {
      name: 'Membrane protein (M)',
      uniprotId: 'P0DTC5',
      pdbId: null,
      sequence: 'MADSNGTITVEELKKLLEQWNLVIGFLGAAVSTGMIKDQQAKIKVLTFAGS',
      length: 222,
      domains: [
        { name: 'Transmembrane domain', start: 1, end: 80 },
        { name: 'Cytoplasmic tail', start: 80, end: 222 },
      ],
      druggableSites: [
        { name: 'Viroporin pocket', residues: [63, 71, 76, 82], confidence: 0.85 },
        { name: 'Protein-protein interface', residues: [10, 45, 100, 150], confidence: 0.78 },
      ],
      mutations: [
        { name: 'I82T', position: 82, prevalence: '15%', impact: 'Viral assembly change' },
      ],
      conservationScore: 0.88,
      expression: 'Integral membrane protein',
    },
    'E': {
      name: 'Envelope protein (E)',
      uniprotId: 'P0DTC4',
      pdbId: null,
      sequence: 'MYSFVSEETGTLIVNSVLLFLAFVFSMVTYMPIENMTFVVMTGVDTEKYD',
      length: 75,
      domains: [
        { name: 'Signal sequence', start: 1, end: 16 },
        { name: 'Transmembrane domain', start: 18, end: 50 },
        { name: 'C-terminal tail', start: 50, end: 75 },
      ],
      druggableSites: [
        { name: 'Viroporin pore', residues: [14, 28, 35, 45], confidence: 0.92 },
      ],
      mutations: [
        { name: 'T9I', position: 9, prevalence: '8%', impact: 'Channel conductance' },
      ],
      conservationScore: 0.85,
      expression: 'Integral membrane protein, ion channel',
    },
    'N': {
      name: 'Nucleocapsid protein (N)',
      uniprotId: 'P0DTC9',
      pdbId: '6WZO',
      sequence: 'MSDNGPQNQRNAPRITFGGPSDSTGSNQNGERSGARSKQRRPQGLWNNYK',
      length: 419,
      domains: [
        { name: 'RNA binding domain 1', start: 1, end: 120 },
        { name: 'Linker region', start: 120, end: 180 },
        { name: 'RNA binding domain 2', start: 180, end: 365 },
        { name: 'C-terminal disordered', start: 365, end: 419 },
      ],
      druggableSites: [
        { name: 'RNA binding groove', residues: [31, 52, 91, 106], confidence: 0.88 },
        { name: 'Protein-protein interface', residues: [200, 250, 300], confidence: 0.80 },
      ],
      mutations: [
        { name: 'R203K/G204R', position: 203, prevalence: '72%', impact: 'Immune response modulation' },
        { name: 'D3L', position: 3, prevalence: '<1%', impact: 'RNA binding defect' },
      ],
      conservationScore: 0.80,
      expression: 'Nucleocapsid, RNA binding protein',
    },
    'ORF1ab': {
      name: 'Replicase polyprotein (ORF1ab)',
      uniprotId: 'P0DTW1',
      pdbId: null,
      sequence: 'MESLVPGFNEKTHVQLSLPVLKQCCTAGCCQFDED',
      length: 7096,
      domains: [
        { name: 'nsp1-16 (16 domains)', start: 1, end: 7096 },
      ],
      druggableSites: [
        { name: 'Protease nsp3 & nsp5', residues: [1000, 3500], confidence: 0.94 },
        { name: 'Polymerase nsp12', residues: [4500, 5500], confidence: 0.96 },
        { name: 'ExoNuclease nsp14', residues: [6000, 6500], confidence: 0.90 },
      ],
      mutations: [
        { name: 'Multiple nsp mutations', position: 0, prevalence: 'Variant', impact: 'Various functions' },
      ],
      conservationScore: 0.90,
      expression: 'Large polyprotein, cleaved post-translationally',
    },
  };

  // Fallback for any protein name not in mock data
  const fallbackData = {
    name: proteinName,
    uniprotId: 'UNKNOWN',
    pdbId: null,
    sequence: 'MAEGEITTFTALTEKFNLPPGNYKKPKLLYCSNGGHEFCGNTMATPADGFT',
    length: 54,
    domains: [
      { name: 'Unknown domain 1', start: 1, end: 27 },
      { name: 'Unknown domain 2', start: 27, end: 54 },
    ],
    druggableSites: [
      { name: 'Putative binding site', residues: [10, 20, 30, 40], confidence: 0.75 },
    ],
    mutations: [],
    conservationScore: 0.70,
    expression: 'Unknown expression pattern',
  };

  return mockData[proteinName] || fallbackData;
};

// Analyze gene editing targets in a protein
export const analyzeEditingTargets = (proteinData, editingType = 'CRISPR') => {
  if (!proteinData) return [];

  const targets = [];

  // CRISPR targets (look for PAM sites: NGG)
  if (editingType === 'CRISPR') {
    const pamPattern = /..G/g;
    const sequence = proteinData.sequence || '';
    let match;
    while ((match = pamPattern.exec(sequence)) !== null) {
      targets.push({
        type: 'CRISPR-Cas9',
        position: match.index,
        sequence: sequence.substring(Math.max(0, match.index - 20), match.index + 23),
        specificity: 0.95 + Math.random() * 0.04,
        efficiency: 0.80 + Math.random() * 0.15,
      });
    }
  }

  // Base editing targets (A-to-G or C-to-T conversion)
  if (editingType === 'baseEditing') {
    const sequence = proteinData.sequence || '';
    const aPositions = [];
    const cPositions = [];

    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] === 'A') aPositions.push(i);
      if (sequence[i] === 'C') cPositions.push(i);
    }

    aPositions.slice(0, 5).forEach((pos) => {
      targets.push({
        type: 'ABE (A-to-G)',
        position: pos,
        sequence: sequence.substring(Math.max(0, pos - 20), pos + 21),
        specificity: 0.99 + Math.random() * 0.005,
        efficiency: 0.85 + Math.random() * 0.12,
      });
    });

    cPositions.slice(0, 5).forEach((pos) => {
      targets.push({
        type: 'CBE (C-to-T)',
        position: pos,
        sequence: sequence.substring(Math.max(0, pos - 20), pos + 21),
        specificity: 0.99 + Math.random() * 0.005,
        efficiency: 0.85 + Math.random() * 0.12,
      });
    });
  }

  return targets.slice(0, 10); // Return top 10
};

// Calculate conservation score across variants
export const calculateConservationScore = (proteinData, variants = []) => {
  if (!proteinData || !variants || variants.length === 0) {
    return proteinData?.conservationScore || 0.8;
  }

  // Simulate conservation by looking at mutations
  const totalMutations = variants.reduce((sum, v) => sum + (v.mutations?.length || 1), 0);
  const conservationScore = Math.max(0.5, 1 - (totalMutations * 0.05));

  return {
    score: conservationScore,
    conservedRegions: proteinData.domains?.filter((d) => conservationScore > 0.85) || [],
    variableRegions: proteinData.domains?.filter((d) => conservationScore < 0.70) || [],
  };
};

export default {
  fetchPDBStructure,
  fetchUniProtData,
  fetchAlphaFoldStructure,
  fetchNCBIGeneInfo,
  getProteinStructure,
  getMockProteinData,
  analyzeEditingTargets,
  calculateConservationScore,
};
