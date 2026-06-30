/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Trophy, TrendingUp, Sparkles, Plus, Search, 
  Calendar, Award, Activity, ShieldAlert, CheckCircle2,
  HeartPulse, Printer, Save, Sliders, ChevronRight, User, Info, AlertTriangle
} from 'lucide-react';
import { Contact, ScoutMetrics } from '../types';
import NdemboKinLogo from './NdemboKinLogo';

interface PerformancesViewProps {
  contacts: Contact[];
  onUpdateContact: (updatedContact: Contact) => void;
  canEditScoutingMetrics?: boolean;
}

export default function PerformancesView({ contacts, onUpdateContact, canEditScoutingMetrics = true }: PerformancesViewProps) {
  const athletes = contacts.filter(c => c.type === 'Athlète');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
  
  // Evaluation match form states
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalMatchName, setEvalMatchName] = useState('');
  const [evalDate, setEvalDate] = useState(new Date().toISOString().split('T')[0]);
  const [evalNote, setEvalNote] = useState<number>(7);
  const [evalGoals, setEvalGoals] = useState<number>(0);
  const [evalAssists, setEvalAssists] = useState<number>(0);
  const [evalMinutes, setEvalMinutes] = useState<number>(90);
  const [evalComment, setEvalComment] = useState('');

  // Pro export mode
  const [isExporting, setIsExporting] = useState(false);

  // Filter athletes list
  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.sport || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.currentTeam || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);

  // Helper to draw a clean customized SVG Radar Chart
  const renderRadarChart = (metrics: ScoutMetrics | undefined) => {
    if (!metrics) return null;

    const keys: Array<keyof ScoutMetrics> = ['vitesse', 'technique', 'physique', 'tactique', 'mental', 'regularite'];
    const labels = ['Vitesse', 'Technique', 'Physique', 'Tactique', 'Mental', 'Régularité'];
    
    const size = 300;
    const center = size / 2;
    const rMax = 100;

    // Generate points for polygon
    const points: string[] = [];
    keys.forEach((key, index) => {
      const val = metrics[key] || 50;
      const angle = index * (2 * Math.PI / 6) - Math.PI / 2;
      const r = (val / 100) * rMax;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push(`${x},${y}`);
    });

    // Helper to generate reference background concentric hexagons
    const bgHexagons = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale, hIdx) => {
      const hexPoints: string[] = [];
      for (let index = 0; index < 6; index++) {
        const angle = index * (2 * Math.PI / 6) - Math.PI / 2;
        const r = scale * rMax;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        hexPoints.push(`${x},${y}`);
      }
      return (
        <polygon 
          key={hIdx}
          points={hexPoints.join(' ')} 
          fill="none" 
          stroke="#bec8d2" 
          strokeWidth="1" 
          strokeDasharray={scale === 1 ? 'none' : '3,3'}
        />
      );
    });

    // Outer label positions
    const labelElements = keys.map((key, index) => {
      const angle = index * (2 * Math.PI / 6) - Math.PI / 2;
      const rLabel = rMax + 22;
      const x = center + rLabel * Math.cos(angle);
      const y = center + rLabel * Math.sin(angle);
      const val = metrics[key] || 50;

      // Adjust text anchor alignment based on quadrant
      let textAnchor = "middle";
      if (Math.cos(angle) > 0.1) textAnchor = "start";
      if (Math.cos(angle) < -0.1) textAnchor = "end";

      return (
        <g key={key}>
          <text 
            x={x} 
            y={y} 
            textAnchor={textAnchor}
            className="text-[11px] font-heading font-extrabold fill-[#0c1d2b]"
          >
            {labels[index]}
          </text>
          <text 
            x={x} 
            y={y + 11} 
            textAnchor={textAnchor}
            className="text-[10px] font-mono font-bold fill-[#00628f]"
          >
            {val}%
          </text>
        </g>
      );
    });

    // Diagonal lines
    const lineElements = Array.from({ length: 6 }).map((_, index) => {
      const angle = index * (2 * Math.PI / 6) - Math.PI / 2;
      const x = center + rMax * Math.cos(angle);
      const y = center + rMax * Math.sin(angle);
      return (
        <line 
          key={index}
          x1={center} 
          y1={center} 
          x2={x} 
          y2={y} 
          stroke="#bec8d2" 
          strokeWidth="1.5" 
          opacity="0.5"
        />
      );
    });

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="mx-auto" id="custom_scouting_radar">
        {/* Concentric helper grids */}
        {bgHexagons}
        
        {/* Diagonal axis */}
        {lineElements}

        {/* The Filled Active Scouting Polygon */}
        <polygon 
          points={points.join(' ')} 
          fill="#0083ca" 
          fillOpacity="0.32" 
          stroke="#00628f" 
          strokeWidth="3.5"
          className="transition-all duration-300 ease-in-out"
        />

        {/* Small circle connectors at the vertices */}
        {points.map((pt, idx) => {
          const [x, y] = pt.split(',');
          return (
            <circle 
              key={idx}
              cx={x} 
              cy={y} 
              r="4.5" 
              fill="#ffe07f" 
              stroke="#00628f" 
              strokeWidth="2.5" 
              className="cursor-help"
            />
          );
        })}

        {/* Labels text */}
        {labelElements}
      </svg>
    );
  };

  const handleMetricChange = (key: keyof ScoutMetrics, val: number) => {
    if (!selectedAthlete) return;
    if (!canEditScoutingMetrics) {
      alert("Droits Restreints : Votre profil de rôle actuel ne vous permet pas de modifier les métriques scouting.");
      return;
    }
    
    const updatedMetrics = {
      ...(selectedAthlete.scoutMetrics || { vitesse: 70, technique: 70, physique: 70, tactique: 70, mental: 70, regularite: 70 }),
      [key]: val
    };

    onUpdateContact({
      ...selectedAthlete,
      scoutMetrics: updatedMetrics
    });
  };

  const handleStatusChange = (status: 'Disponible' | 'Blessé' | 'En réhabilitation') => {
    if (!selectedAthlete) return;
    if (!canEditScoutingMetrics) {
      alert("Droits Restreints : Votre profil de rôle actuel ne vous permet pas de modifier la disponibilité physique.");
      return;
    }
    onUpdateContact({
      ...selectedAthlete,
      injuryStatus: status
    });
  };

  const handleBiometricsChange = (field: 'taille' | 'poids' | 'piedFort' | 'poste', value: any) => {
    if (!selectedAthlete) return;
    if (!canEditScoutingMetrics) {
      alert("Droits Restreints : Votre profil de rôle actuel ne vous permet pas de modifier les constantes biométriques.");
      return;
    }
    const currentBio = selectedAthlete.biometrics || { taille: 180, poids: 75, piedFort: 'Droit', poste: 'Joueur' };
    
    onUpdateContact({
      ...selectedAthlete,
      biometrics: {
        ...currentBio,
        [field]: value
      }
    });
  };

  const handleAddMatchReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || !evalMatchName) return;

    const currentHistory = selectedAthlete.performanceHistory || [];
    const newReport = {
      id: `match_${Date.now()}`,
      date: evalDate.split('-').reverse().join('-'), // formats to DD-MM-YYYY
      matchName: evalMatchName,
      note: Number(evalNote),
      goals: Number(evalGoals),
      assists: Number(evalAssists),
      minutesPlayed: Number(evalMinutes),
      comment: evalComment
    };

    const updatedHistory = [newReport, ...currentHistory];

    onUpdateContact({
      ...selectedAthlete,
      performanceHistory: updatedHistory
    });

    // Reset and close
    setEvalMatchName('');
    setEvalGoals(0);
    setEvalAssists(0);
    setEvalMinutes(90);
    setEvalComment('');
    setShowEvalModal(false);
  };

  return (
    <div className="space-y-6" id="scouting_dashboard_view">
      {/* HEADER CONTROLS */}
      {!isExporting && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100" id="scouting_header_card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#e6f4fa] rounded-xl text-[#00628f]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-[#0c1d2b]">Scouting & Suivi de Performances</h2>
              <p className="text-xs text-slate-500">Gestion des profils athlétiques, des radars de compétences et des fiches d'évaluation de l'agence.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedAthlete && (
              <button
                onClick={() => setIsExporting(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0c1d2b] rounded-xl text-xs font-heading font-extrabold transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Générer Fiche Recruteur</span>
              </button>
            )}
            <button
              onClick={() => selectedAthlete && setShowEvalModal(true)}
              disabled={!selectedAthlete}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00628f] hover:bg-[#005278] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-heading font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Rapport Match</span>
            </button>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE */}
      {!isExporting ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="scouting_workspace_grid">
          {/* LEFT SIDEBAR: ATHLETES SELECTOR */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm" id="athlete_selector_panel">
              <span className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                Sélection Athlète ({athletes.length})
              </span>
              
              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                />
              </div>

              {/* Athletes List */}
              <div className="space-y-1 max-h-[420px] overflow-y-auto custom-scrollbar">
                {filteredAthletes.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">Aucun athlète trouvé</p>
                ) : (
                  filteredAthletes.map(a => {
                    const isSelected = a.id === selectedAthleteId;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAthleteId(a.id)}
                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#00628f]/10 border border-[#00628f]/30 text-[#00628f]' 
                            : 'hover:bg-slate-50 border border-transparent text-[#0c1d2b]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-[#00628f] text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {a.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-extrabold text-xs truncate">{a.name}</h4>
                          <span className="text-[10px] text-slate-500 block truncate font-medium">
                            {a.sport} • {a.currentTeam || 'Sans Club'}
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#00628f]' : 'text-slate-300'}`} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* MAIN COLUMN: SELECTED ATHLETE DASHBOARD */}
          {selectedAthlete ? (
            <div className="lg:col-span-9 space-y-6" id="athlete_dashboard_workspace">
              {/* GENERAL ATHLETE BANNER */}
              <div className="bg-gradient-to-r from-[#0c1d2b] to-[#00628f] p-6 rounded-2xl text-white relative overflow-hidden shadow-md" id="athlete_profile_hero">
                {/* Visual Congo colors stripes background */}
                <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#e1251b] via-[#fecb00] to-[#0083ca]" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-4.5">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-heading font-black text-2xl text-white border border-white/20">
                      {selectedAthlete.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-black text-2xl tracking-tight italic uppercase">{selectedAthlete.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#fecb00] text-[#0c1d2b] font-heading font-black text-[9px] uppercase tracking-wider">
                          {selectedAthlete.level || 'Pro'}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 font-medium">
                        {selectedAthlete.sport} • {selectedAthlete.currentTeam || 'Sans Équipe'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span>Id: {selectedAthlete.id}</span>
                        <span>•</span>
                        <span>Membre depuis: {selectedAthlete.dateCreated}</span>
                      </div>
                    </div>
                  </div>

                  {/* Market Value Box */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl min-w-[160px] text-center md:text-right md:self-stretch flex flex-col justify-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffe07f] font-bold">Valeur Marchande Estimée</span>
                    <h4 className="font-heading font-black text-2xl text-white mt-1">
                      {(selectedAthlete.marketValue || 50000).toLocaleString('fr-FR')} €
                    </h4>
                    <span className="text-[9px] text-[#22c55e] font-bold flex items-center justify-center md:justify-end gap-1 mt-0.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>+15% ce trimestre</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* THREE COLUMN GRID: METRICS RADAR, HEALTH & SLIDERS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* 1. Radar Chart */}
                <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[320px]">
                  <span className="self-start text-[10px] font-mono font-bold text-[#00628f] uppercase tracking-wider mb-2">
                    Scouting Radar Graph
                  </span>
                  <div className="w-full max-w-[240px] h-[240px] flex items-center justify-center">
                    {renderRadarChart(selectedAthlete.scoutMetrics)}
                  </div>
                </div>

                {/* 2. Sliders & Metrics Configurator */}
                <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="scouting_sliders_panel">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#00628f] uppercase tracking-wider">
                      Ajuster les Métriques
                    </span>
                    <Sliders className="w-4 h-4 text-slate-400" />
                  </div>

                  {selectedAthlete.scoutMetrics ? (
                    <div className="space-y-3">
                      {(Object.keys(selectedAthlete.scoutMetrics) as Array<keyof ScoutMetrics>).map((key, idx) => {
                        const labels = ['Vitesse', 'Technique', 'Physique', 'Tactique', 'Mental', 'Régularité'];
                        const val = selectedAthlete.scoutMetrics ? selectedAthlete.scoutMetrics[key] : 70;
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-[#0c1d2b]">{labels[idx]}</span>
                              <span className="text-[#00628f] font-mono">{val}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={val}
                              onChange={(e) => handleMetricChange(key, Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00628f]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs text-slate-400">Aucune métrique de scouting disponible</p>
                      <button 
                        onClick={() => handleMetricChange('vitesse', 70)}
                        className="mt-3 px-4 py-2 bg-[#00628f] text-white text-xs rounded-xl font-heading font-extrabold cursor-pointer"
                      >
                        Initialiser les Métriques
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Biometrics, Injury & Tools */}
                <div className="md:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="scouting_biometrics_panel">
                  <span className="block text-[10px] font-mono font-bold text-[#00628f] uppercase tracking-wider">
                    Suivi Biométrique & Santé
                  </span>

                  {/* Injury status */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase">Disponibilité Physique</label>
                    <div className="flex gap-1" id="injury_status_selector">
                      {(['Disponible', 'Blessé', 'En réhabilitation'] as const).map(status => {
                        const isSelected = selectedAthlete.injuryStatus === status;
                        const statusColors = {
                          Disponible: isSelected ? 'bg-green-100 text-green-700 border-green-300 font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-transparent',
                          Blessé: isSelected ? 'bg-red-100 text-red-700 border-red-300 font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-transparent',
                          'En réhabilitation': isSelected ? 'bg-yellow-100 text-yellow-700 border-yellow-300 font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-transparent',
                        }[status];

                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleStatusChange(status)}
                            className={`flex-1 text-[9px] py-1.5 border rounded text-center transition-all cursor-pointer truncate ${statusColors}`}
                          >
                            {status === 'Disponible' && 'Forme'}
                            {status === 'Blessé' && 'Blessé'}
                            {status === 'En réhabilitation' && 'Réhab'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Biometric Stats inputs */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Taille (cm)</label>
                        <input
                          type="number"
                          value={selectedAthlete.biometrics?.taille || 180}
                          onChange={(e) => handleBiometricsChange('taille', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:bg-white text-center font-mono font-bold text-[#0c1d2b]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Poids (kg)</label>
                        <input
                          type="number"
                          value={selectedAthlete.biometrics?.poids || 75}
                          onChange={(e) => handleBiometricsChange('poids', Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:bg-white text-center font-mono font-bold text-[#0c1d2b]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Pied / Main Fort(e)</label>
                      <select
                        value={selectedAthlete.biometrics?.piedFort || 'Droit'}
                        onChange={(e) => handleBiometricsChange('piedFort', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-[#0c1d2b] font-medium"
                      >
                        <option value="Droit">Droit</option>
                        <option value="Gauche">Gauche</option>
                        <option value="Ambidextre">Ambidextre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase text-slate-400 mb-0.5">Poste / Spécialité</label>
                      <input
                        type="text"
                        value={selectedAthlete.biometrics?.poste || 'Avant-centre'}
                        onChange={(e) => handleBiometricsChange('poste', e.target.value)}
                        placeholder="e.g. Meneur, Pivot..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-[#0c1d2b] font-medium focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* EVALUATIONS HISTORY TABLE */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm" id="scouting_evaluations_panel">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00628f]" />
                    <h4 className="font-heading font-extrabold text-[#0c1d2b] text-sm">Rapports d'Évaluations & Performance Matches</h4>
                  </div>
                  <button
                    onClick={() => setShowEvalModal(true)}
                    className="flex items-center gap-1 bg-[#00628f]/10 text-[#00628f] px-3 py-1.5 rounded-lg text-xs font-heading font-extrabold hover:bg-[#00628f]/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase">Événement / Match</th>
                        <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase text-center">Note</th>
                        <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase text-center">Stats</th>
                        <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase">Date</th>
                        <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase">Commentaire de l'Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(!selectedAthlete.performanceHistory || selectedAthlete.performanceHistory.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-xs text-slate-400">
                            Aucun match ou évaluation enregistré pour cet athlète.
                          </td>
                        </tr>
                      ) : (
                        selectedAthlete.performanceHistory.map(report => (
                          <tr key={report.id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 pr-4">
                              <span className="font-heading font-extrabold text-xs text-[#0c1d2b] block">{report.matchName}</span>
                              <span className="text-[10px] text-slate-500 font-medium">Évaluation technique</span>
                            </td>
                            <td className="py-3.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                report.note >= 8 
                                  ? 'bg-green-50 text-green-700' 
                                  : report.note >= 6.5 
                                  ? 'bg-yellow-50 text-yellow-700' 
                                  : 'bg-red-50 text-red-700'
                              }`}>
                                {report.note.toFixed(1)}/10
                              </span>
                            </td>
                            <td className="py-3.5 text-center pr-3">
                              {selectedAthlete.sport === 'Basketball' ? (
                                <span className="font-mono text-xs text-slate-700 font-bold block">
                                  {report.goals} Pts • {report.assists} Ass
                                </span>
                              ) : selectedAthlete.sport === 'Football' ? (
                                <span className="font-mono text-xs text-slate-700 font-bold block">
                                  {report.goals} B • {report.assists} A
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">-</span>
                              )}
                              <span className="text-[9px] font-mono text-slate-400 block">{report.minutesPlayed > 0 ? `${report.minutesPlayed} min` : 'Athlétisme'}</span>
                            </td>
                            <td className="py-3.5 text-xs font-mono font-medium text-slate-500">{report.date}</td>
                            <td className="py-3.5 text-xs text-slate-600 max-w-[280px] truncate-2-lines">{report.comment}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-9 bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <Trophy className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="font-heading font-extrabold text-[#0c1d2b] text-base">Aucun Athlète géré</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Ajoutez d'abord des contacts de type "Athlète" dans le CRM ou créez-en un nouveau pour pouvoir suivre ses performances.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* PRO EXPORT SCOUTING PROFILE PAGE (PRINT DESIGN) */
        selectedAthlete && (
          <div className="bg-white p-8 max-w-[850px] mx-auto border-2 border-slate-200 rounded-3xl shadow-lg relative print:shadow-none print:border-none" id="exportable_scouting_sheet">
            {/* Control buttons inside print sheet (hidden during printer prompt) */}
            <div className="absolute right-6 top-6 flex gap-2 print:hidden" id="export_controls">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#00628f] hover:bg-[#005278] text-white text-xs font-heading font-extrabold rounded-xl shadow transition-all cursor-pointer"
              >
                Imprimer / PDF
              </button>
              <button 
                onClick={() => setIsExporting(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-heading font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Retour
              </button>
            </div>

            {/* HEADER SHEET */}
            <div className="flex items-start justify-between border-b-2 border-[#00628f] pb-6 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <NdemboKinLogo size="sm" showText={false} />
                  <span className="font-heading font-black text-2xl text-[#0c1d2b] tracking-tight">Ndembo Kin Connect</span>
                </div>
                <div className="font-mono text-[9px] text-slate-500 space-y-0.5 leading-none">
                  <p>DEPT. MANAGEMENT SPORTIF & SCOUTING ÉLITE</p>
                  <p>RDC • KINSHASA • LUBUMBASHI</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-[10px] font-mono font-bold rounded uppercase tracking-wider">
                  PROFIL RECRUTEUR CONFIDENTIEL
                </span>
                <p className="text-[10px] font-mono text-slate-400 mt-2">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* ATHLETE IDENTITY & PHOTO BLOCK */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#f7f9ff] p-5 rounded-2xl border border-slate-200 mb-6">
              <div className="md:col-span-8 space-y-3">
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#00628f] uppercase tracking-widest block">Athlète Professionnel sous Mandat</span>
                  <h1 className="font-heading font-black text-3xl text-[#0c1d2b] uppercase tracking-tight italic mt-0.5">{selectedAthlete.name}</h1>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1.5">
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">Discipline</span>
                    <span className="text-xs font-heading font-bold text-[#0c1d2b]">{selectedAthlete.sport}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">Club Actuel</span>
                    <span className="text-xs font-heading font-bold text-[#0c1d2b]">{selectedAthlete.currentTeam || 'Sans Club'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">Poste Principal</span>
                    <span className="text-xs font-heading font-bold text-[#0c1d2b]">{selectedAthlete.biometrics?.poste || 'Attaquant'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">Niveau Certifié</span>
                    <span className="text-xs font-heading font-bold text-[#0c1d2b]">{selectedAthlete.level || 'Pro'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 border-t border-slate-200/50">
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">Taille</span>
                    <span className="text-xs font-mono font-bold text-[#0c1d2b]">{selectedAthlete.biometrics?.taille || 180} cm</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">Poids</span>
                    <span className="text-xs font-mono font-bold text-[#0c1d2b]">{selectedAthlete.biometrics?.poids || 75} kg</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">Latéralité</span>
                    <span className="text-xs font-heading font-bold text-[#0c1d2b]">{selectedAthlete.biometrics?.piedFort || 'Droit'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-mono text-slate-400 uppercase font-bold">État Physique</span>
                    <span className="text-xs font-heading font-bold text-[#0c1d2b]">{selectedAthlete.injuryStatus || 'Disponible'}</span>
                  </div>
                </div>
              </div>

              {/* ESTIMATED VALUATION MARK */}
              <div className="md:col-span-4 bg-[#0c1d2b] text-white p-4.5 rounded-xl flex flex-col justify-center items-center text-center">
                <span className="text-[9px] font-mono text-[#ffe07f] uppercase tracking-wider font-extrabold leading-none">Estimation Transfert</span>
                <span className="font-heading font-black text-2xl text-white mt-1.5">
                  {(selectedAthlete.marketValue || 50000).toLocaleString('fr-FR')} €
                </span>
                <div className="w-full h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full mt-3 opacity-80" />
                <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase">Validé par Ndembo Kin Board</span>
              </div>
            </div>

            {/* TECHNICAL & GRAPHICAL REPORT DIVISION */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
              {/* Radar diagram SVG representation */}
              <div className="md:col-span-6 border border-slate-200 p-4 rounded-2xl flex flex-col items-center">
                <span className="text-[9px] font-mono font-bold text-[#00628f] uppercase tracking-wider mb-2 align-self-start">
                  Évaluation Tactico-Technique (Radar)
                </span>
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  {renderRadarChart(selectedAthlete.scoutMetrics)}
                </div>
              </div>

              {/* Agent's Notes */}
              <div className="md:col-span-6 border border-slate-200 p-4 rounded-2xl space-y-3 flex flex-col">
                <span className="text-[9px] font-mono font-bold text-[#00628f] uppercase tracking-wider block">
                  Rapport de Présentation Agent
                </span>
                <div className="flex-1 text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedAthlete.notes || "Pas de notes de présentation spécifiques. L'athlète fait preuve d'un potentiel athlétique de premier plan et d'une rigueur tactique au dessus de la moyenne pour sa division."}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-[#e6f4fa] p-2 rounded-lg text-center text-[#00628f] font-bold">
                    Potentiel Élite
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg text-center text-green-700 font-bold">
                    Visas à jour
                  </div>
                </div>
              </div>
            </div>

            {/* SCOUTING HISTORY DATA SHEET */}
            <div className="border border-slate-200 p-4 rounded-2xl">
              <span className="text-[9px] font-mono font-bold text-[#00628f] uppercase tracking-wider block mb-3">
                Derniers Matches d'Observation Officiels
              </span>
              <div className="space-y-3">
                {(!selectedAthlete.performanceHistory || selectedAthlete.performanceHistory.length === 0) ? (
                  <p className="text-center text-slate-400 text-xs py-3">Aucune donnée de match officielle disponible.</p>
                ) : (
                  selectedAthlete.performanceHistory.slice(0, 3).map(match => (
                    <div key={match.id} className="p-3 bg-[#f7f9ff] border border-slate-150 rounded-xl grid grid-cols-12 gap-3 text-xs">
                      <div className="col-span-4">
                        <span className="font-heading font-extrabold text-[#0c1d2b] block leading-snug">{match.matchName}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">{match.date}</span>
                      </div>
                      <div className="col-span-2 text-center flex flex-col justify-center items-center">
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Note Match</span>
                        <span className="font-mono font-bold text-[#00628f]">{match.note.toFixed(1)}/10</span>
                      </div>
                      <div className="col-span-2 text-center flex flex-col justify-center items-center">
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Statistiques</span>
                        <span className="font-mono font-bold text-[#0c1d2b]">
                          {selectedAthlete.sport === 'Basketball' ? `${match.goals} pts` : `${match.goals} buts`}
                        </span>
                      </div>
                      <div className="col-span-4 text-slate-600 text-[11px] flex items-center leading-relaxed font-medium">
                        "{match.comment}"
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* STAMP OF THE AGENCY & SIGNATURE */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8">
              <div className="text-left font-mono text-[9px] text-slate-400">
                <p>Ndembo Kin Connect SARL • No. RCCM CD/KIN/RCCM/22-B-10352</p>
                <p>Données certifiées de bonne foi par l'agence sportive</p>
              </div>
              <div className="text-right border-t border-slate-300 w-44 pt-1.5 mt-4">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Cachet & Signature Agent</span>
                <span className="font-heading font-extrabold text-[#00628f] text-xs leading-none italic block mt-1">Yannick Ndémbo</span>
              </div>
            </div>
          </div>
        )
      )}

      {/* EVALUATION INPUT MODAL */}
      {showEvalModal && selectedAthlete && (
        <div className="fixed inset-0 bg-[#0c1d2b]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="evaluation_input_modal">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00628f]" />
                <h4 className="font-heading font-black text-base text-[#0c1d2b]">Rapport de Match - {selectedAthlete.name}</h4>
              </div>
              <button 
                onClick={() => setShowEvalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMatchReportSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                  Nom du Match / Événement *
                </label>
                <input
                  type="text"
                  value={evalMatchName}
                  onChange={(e) => setEvalMatchName(e.target.value)}
                  placeholder="e.g. TP Mazembe vs V.Club, Meeting de Gombe..."
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={evalDate}
                    onChange={(e) => setEvalDate(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                    Note Technique (0-10) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={evalNote}
                    onChange={(e) => setEvalNote(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                    {selectedAthlete.sport === 'Basketball' ? 'Points' : 'Buts'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={evalGoals}
                    onChange={(e) => setEvalGoals(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                    {selectedAthlete.sport === 'Basketball' ? 'Assists' : 'Passes Déc.'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={evalAssists}
                    onChange={(e) => setEvalAssists(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                    Minutes Jouées
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={evalMinutes}
                    onChange={(e) => setEvalMinutes(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-xs font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                  Observations de l'Agent (Points clés) *
                </label>
                <textarea
                  value={evalComment}
                  onChange={(e) => setEvalComment(e.target.value)}
                  placeholder="Rédiger votre rapport technique..."
                  rows={3}
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEvalModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-heading font-extrabold cursor-pointer hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00628f] hover:bg-[#005278] text-white rounded-lg text-xs font-heading font-extrabold shadow cursor-pointer"
                >
                  Valider le Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
