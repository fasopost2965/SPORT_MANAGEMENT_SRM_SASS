/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  FolderKanban,
  FileText,
  DollarSign,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Trophy,
  ListTodo
} from 'lucide-react';
import { Contact, Project, Task, Devis, Facture, FinanceTransaction, Contract, NfcCard } from '../types';
import NdemboKinLogo from './NdemboKinLogo';

interface DashboardViewProps {
  contacts: Contact[];
  projects: Project[];
  tasks: Task[];
  devis: Devis[];
  factures: Facture[];
  transactions: FinanceTransaction[];
  contracts: Contract[];
  cards: NfcCard[];
  setView: (view: any) => void;
  onQuickAction: (action: string) => void;
}

export default function DashboardView({
  contacts,
  projects,
  tasks,
  devis,
  factures,
  transactions,
  contracts,
  cards,
  setView,
  onQuickAction
}: DashboardViewProps) {
  // 1. Compute KPIs
  const totalRecettes = transactions
    .filter(t => t.type === 'Recette')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDepenses = transactions
    .filter(t => t.type === 'Dépense')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalRecettes - totalDepenses;

  const totalHTDevisEnAttente = devis
    .filter(d => d.status === 'En attente')
    .reduce((sum, d) => sum + d.totalHT, 0);

  const activeContractsCount = contracts.filter(c => c.status === 'En cours').length;
  const activeProjectsCount = projects.filter(p => p.status === 'En cours').length;
  const lateTasks = tasks.filter(t => t.status !== 'Terminé' && new Date(t.endDate) < new Date());

  // Additional dynamic performance metric calculations:
  const totalAthletes = contacts.filter(c => c.type === 'Athlète').length;
  const athletesWithActiveContract = contacts.filter(c => 
    c.type === 'Athlète' && 
    contracts.some(contract => contract.clientId === c.id && contract.status === 'En cours')
  );
  const athletesWithActiveContractCount = athletesWithActiveContract.length;

  const urgentTasks = tasks.filter(t => t.status !== 'Terminé' && (t.priority === 'Haute' || new Date(t.endDate) < new Date()));
  const urgentTasksCount = urgentTasks.length;

  // 2. Format values
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // 3. Transactions details
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // 4. Critical alerts
  const alertCount = lateTasks.length + factures.filter(f => f.status === 'Échue' || (f.status === 'Non payée' && new Date(f.dateDue) < new Date())).length;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300" id="dashboard_view">
      {/* Welcome Hero Banner */}
      <div className="bg-[#0c1d2b] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-md border border-[#6f7881]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#00628f]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ffe07f]/10 text-[#ffe07f] text-[10px] font-mono rounded-full font-bold uppercase tracking-wider border border-[#ffe07f]/20">
              ⚡ PORTAIL DE MANAGEMENT SPORTIF INTERNE
            </div>
            <h1 className="font-heading text-2xl md:text-3.5xl font-black leading-tight tracking-tight uppercase italic text-[#edf4ff]">
              Ndembo <span className="text-[#0083ca]">Kin</span> Connect
            </h1>
            <p className="text-[#ffe07f] font-heading font-extrabold text-sm md:text-base tracking-wide italic leading-normal">
              « Plateforme de gestion interne Ndembo Kin »
            </p>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl">
              Pilotez votre agence de management sportif avec une suite complète d'outils professionnels : devis, convertisseurs, gestion financière, éditions de contrats standardisés de prestation de service et de management d'athlètes d'élite.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shrink-0 shadow-lg flex flex-col items-center">
            <NdemboKinLogo size="md" showText={true} lightText={true} />
            <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest mt-2 block">
              Kinshasa, RDC
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Status / Banner Alert */}
      {alertCount > 0 && (
        <div className="bg-[#ffdad6] border-l-4 border-secondary p-4 rounded-r-lg flex items-center justify-between mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-secondary shrink-0 animate-bounce" />
            <div>
              <p className="font-semibold text-on-surface text-sm">
                Alerte de gestion : {alertCount} dossiers requièrent votre attention immédiate !
              </p>
              <p className="text-xs text-[#3f4850]">
                {lateTasks.length} tâche(s) en retard et des factures en attente de relance.
              </p>
            </div>
          </div>
          <button
            onClick={() => setView('taches')}
            className="text-secondary hover:underline font-mono text-xs font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <span>RÉSOUDRE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Widgets de performance KPIs en haut du tableau de bord */}
      <div className="space-y-4" id="performance_kpis_section">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="font-heading text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Indicateurs de Performance Stratégique (KPIs)</span>
          </h2>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
            Saison active 2026
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Chiffre d'Affaires */}
          <div className="bg-gradient-to-br from-[#0c1d2b] to-[#122b40] rounded-2xl p-6 text-white relative overflow-hidden shadow-md border border-[#6f7881]/20 flex flex-col justify-between group hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffe07f]/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-extrabold text-[#ffe07f] uppercase tracking-wider block">
                  Chiffre d'Affaires Cumulé
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-black text-white tracking-tight">
                  {formatCurrency(totalRecettes)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#ffe07f] shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Trésorerie nette disponible :</span>
                <span className="font-bold text-white">{formatCurrency(profit)}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#ffe07f] to-emerald-400 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (profit / (totalRecettes || 1)) * 100)}%` }} 
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                Taux de rentabilité brute : {totalRecettes > 0 ? Math.round((profit / totalRecettes) * 100) : 0}% des recettes
              </span>
            </div>
          </div>

          {/* Card 2: Athlètes sous Contrat */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-extrabold text-[#0083ca] uppercase tracking-wider block">
                  Athlètes Actifs sous Contrat
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {athletesWithActiveContractCount} <span className="text-sm font-normal text-slate-500">/ {totalAthletes} managés</span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0083ca] shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Taux de contractualisation d'élite :</span>
                <span className="font-bold text-slate-800">
                  {totalAthletes > 0 ? Math.round((athletesWithActiveContractCount / totalAthletes) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#0083ca] h-full rounded-full" 
                  style={{ width: `${totalAthletes > 0 ? (athletesWithActiveContractCount / totalAthletes) * 100 : 0}%` }} 
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                Athlète vedette : {athletesWithActiveContract[0]?.name || "Aucun athlète sous contrat"}
              </span>
            </div>
          </div>

          {/* Card 3: Tâches Urgentes */}
          <div 
            onClick={() => setView('taches')}
            className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-red-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer animate-pulse-subtle"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-extrabold text-[#ba0a0f] uppercase tracking-wider block">
                  Urgences &amp; Alertes Tâches
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{urgentTasksCount}</span>
                  {urgentTasksCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                      Urgent
                    </span>
                  )}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${urgentTasksCount > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                <ListTodo className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tâches en retard à traiter :</span>
                <span className="font-bold text-red-600 font-mono">{lateTasks.length} en retard</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 h-full rounded-full" 
                  style={{ width: `${tasks.length > 0 ? (urgentTasksCount / tasks.length) * 100 : 0}%` }} 
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono block hover:underline flex items-center justify-between">
                <span>Cliquez pour résoudre les blocages</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Card Revenue */}
        <div className="bento-card border-l-4 border-l-[#00628f] bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00628f]/5 rounded-bl-full group-hover:scale-105 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#00628f]/10 flex items-center justify-center text-[#00628f]">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#6f7881] bg-[#f7f9ff] px-2 py-0.5 rounded border border-[#bec8d2]/30">
              USD LEDGER
            </span>
          </div>
          <span className="text-xs text-[#6f7881] font-sans font-bold uppercase tracking-wider block mb-1">Solde Budgétaire</span>
          <h3 className="font-heading text-xl md:text-2xl font-extrabold text-[#0c1d2b] data-font">
            {formatCurrency(profit)}
          </h3>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-bold font-mono">+{formatCurrency(totalRecettes)}</span>
            <span className="text-[#6f7881] font-mono text-[10px] ml-auto">Recettes</span>
          </div>
        </div>

        {/* Card Active Projects */}
        <div className="bento-card border-l-4 border-l-[#ba0a0f] bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#ba0a0f]/5 rounded-bl-full group-hover:scale-105 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#ba0a0f]/10 flex items-center justify-center text-[#ba0a0f]">
              <FolderKanban className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#ba0a0f] bg-[#ffdad6]/20 px-2 py-0.5 rounded border border-[#ba0a0f]/20">
              ACTIVE PRJ
            </span>
          </div>
          <span className="text-xs text-[#6f7881] font-sans font-bold uppercase tracking-wider block mb-1">Projets en Cours</span>
          <h3 className="font-heading text-xl md:text-2xl font-extrabold text-[#0c1d2b] data-font">
            {activeProjectsCount}
          </h3>
          <p className="text-xs text-[#6f7881] mt-2.5">
            Total de {projects.length} projets initiés dans la saison.
          </p>
        </div>

        {/* Card Active Contracts */}
        <div className="bento-card border-l-4 border-l-[#725c00] bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:scale-105 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              MÉDIAL
            </span>
          </div>
          <span className="text-xs text-[#6f7881] font-sans font-bold uppercase tracking-wider block mb-1">Contrats Homologués</span>
          <h3 className="font-heading text-xl md:text-2xl font-extrabold text-[#0c1d2b] data-font">
            {activeContractsCount}
          </h3>
          <p className="text-xs text-[#6f7881] mt-2.5">
            {contracts.length} actes de management au total.
          </p>
        </div>

        {/* Card Proposed pipe value */}
        <div className="bento-card border-l-4 border-l-[#6f7881] bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full group-hover:scale-105 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              PIPE DEVIS
            </span>
          </div>
          <span className="text-xs text-[#6f7881] font-sans font-bold uppercase tracking-wider block mb-1">Offres en Attente</span>
          <h3 className="font-heading text-xl md:text-2xl font-extrabold text-[#0c1d2b] data-font">
            {formatCurrency(totalHTDevisEnAttente)}
          </h3>
          <p className="text-xs text-[#6f7881] mt-2.5 font-sans">
            Montant estimé HT pour {devis.filter(d => d.status === 'En attente').length} devis.
          </p>
        </div>

        {/* Card NFC Club Cards Count */}
        <div className="bento-card border-l-4 border-l-amber-500 bg-white relative overflow-hidden group cursor-pointer hover:border-amber-600 transition-all" onClick={() => setView('cartes')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full group-hover:scale-105 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ELITE CLUB
            </span>
          </div>
          <span className="text-xs text-[#6f7881] font-sans font-bold uppercase tracking-wider block mb-1">Cartes NFC Émises</span>
          <h3 className="font-heading text-xl md:text-2xl font-extrabold text-[#0c1d2b] data-font">
            {cards.length}
          </h3>
          <p className="text-xs text-[#6f7881] mt-2.5 font-sans">
            Total de {formatCurrency(cards.length * 100)} perçus en adhésions.
          </p>
        </div>
      </div>

      {/* Graphical Panel Area & Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Graphics Panel: Revenue vs Expenses */}
        <div className="bento-card lg:col-span-2 space-y-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-extrabold text-base text-on-surface">
                Flux Financier Annuel Ndembo Kin Connect
              </h3>
              <p className="text-xs text-[#6f7881]">
                Visualisation des Recettes vs Dépenses (en USD accumulés)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 className h-3 bg-primary rounded-xs" />
                <span>RECETTES</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-secondary rounded-xs" />
                <span>DÉPENSES</span>
              </div>
            </div>
          </div>

          {/* High Fidelity Interactive SVG Bar Chart representing the mock data finances */}
          <div className="relative pt-4 h-64">
            <svg viewBox="0 0 600 240" className="w-full h-full text-xs font-mono">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f3f6" strokeWidth="1" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f3f6" strokeWidth="1" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f3f6" strokeWidth="1" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#f1f3f6" strokeWidth="1" />
              <line x1="40" y1="200" x2="580" y2="200" stroke="#bec8d2" strokeWidth="1.5" />

              {/* Y Axis Indicators */}
              <text x="35" y="24" className="fill-[#6f7881] text-right font-semibold" textAnchor="end">80K$</text>
              <text x="35" y="74" className="fill-[#6f7881] text-right" textAnchor="end">50K$</text>
              <text x="35" y="124" className="fill-[#6f7881] text-right" textAnchor="end">25K$</text>
              <text x="35" y="174" className="fill-[#6f7881] text-right" textAnchor="end">5K$</text>
              <text x="35" y="204" className="fill-[#6f7881] text-right" textAnchor="end">0$</text>

              {/* Data Bars */}
              {/* Column 1: Mai (FAC-001 Recette vs Salaries Depense) */}
              {/* Recettes Mai: 40600 (height fraction) */}
              <g className="hover:opacity-85 transition-opacity cursor-pointer">
                <rect x="120" y="80" width="35" height="120" fill="#00628f" rx="3" />
                <rect x="160" y="160" width="35" height="40" fill="#ba0a0f" rx="3" />
                <text x="157" y="220" className="fill-on-surface font-semibold text-center" textAnchor="middle">Mai 2026</text>
                <text x="137" y="72" className="fill-primary font-bold" textAnchor="middle">40.6K$</text>
                <text x="177" y="152" className="fill-[#ba0a0f]" textAnchor="middle">5K$</text>
              </g>

              {/* Column 2: Juin (Recettes sponsor 25K$ / Depenses logistique & promo 4K$) */}
              <g className="hover:opacity-85 transition-opacity cursor-pointer">
                <rect x="320" y="115" width="35" height="85" fill="#00628f" rx="3" />
                <rect x="360" y="170" width="35" height="30" fill="#ba0a0f" rx="3" />
                <text x="357" y="220" className="fill-on-surface font-semibold text-center" textAnchor="middle">Juin 2026</text>
                <text x="337" y="107" className="fill-primary font-bold" textAnchor="middle">25K$</text>
                <text x="377" y="162" className="fill-[#ba0a0f]" textAnchor="middle">4K$</text>
              </g>

              {/* Column 3: Juillet (Forecast - Sponsoring Vodac Recette 43.5K$ / Depenses forecast 15K$) */}
              <g className="hover:opacity-85 transition-opacity cursor-pointer">
                <rect x="490" y="75" width="35" height="125" fill="#00628f" fillOpacity="0.4" stroke="#00628f" strokeDasharray="3,3" rx="3" />
                <rect x="530" y="140" width="35" height="60" fill="#ba0a0f" fillOpacity="0.4" stroke="#ba0a0f" strokeDasharray="3,3" rx="3" />
                <text x="527" y="220" className="fill-[#3f4850] font-sans italic text-center" textAnchor="middle">Juillet (Prev)</text>
                <text x="507" y="67" className="fill-primary font-bold font-mono opacity-70" textAnchor="middle">43.5K$</text>
                <text x="547" y="132" className="fill-[#ba0a0f] opacity-70" textAnchor="middle">15K$</text>
              </g>
            </svg>
          </div>
          <div className="bg-[#f7f9ff] rounded-xl p-3 border border-[#bec8d2]/30 flex items-center justify-between text-xs text-[#3f4850]">
            <span>💡 <strong>Analyse d'activité :</strong> Les transferts d'athlètes d'élites et les contrats de sponsoring télécom structurent 84% de votre excédent budgétaire de ce mois.</span>
            <button onClick={() => setView('finances')} className="text-primary font-bold hover:underline shrink-0 hidden sm:block">DÉTAILS FINANCES →</button>
          </div>
        </div>

        {/* Right Graphics Panel: Project breakdown list / Progress radar */}
        <div className="bento-card space-y-4 bg-white">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-heading font-extrabold text-base text-on-surface">
              Progression des Projets
            </h3>
            <p className="text-xs text-[#6f7881]">
              Statut de livraison des chantiers contractuels
            </p>
          </div>

          <div className="space-y-4">
            {projects.map(prj => (
              <div key={prj.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-sans font-semibold text-on-surface truncate pr-2" title={prj.name}>
                    {prj.name}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-primary">
                    {prj.progress}%
                  </span>
                </div>
                {/* Horizontal Progress bar */}
                <div className="w-full bg-[#edf4ff] h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${
                      prj.status === 'En retard' ? 'bg-[#ba0a0f]' : prj.progress > 80 ? 'bg-emerald-600' : 'bg-primary'
                    }`}
                    style={{ width: `${prj.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-[#6f7881]">
                    Client: {prj.clientName}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    prj.status === 'Terminé' ? 'bg-emerald-50 text-emerald-700 border-emerald-305' :
                    prj.status === 'En cours' ? 'bg-[#edf4ff] text-[#00628f] border-[#00628f]/30' :
                    prj.status === 'En retard' ? 'bg-[#ffdad6] text-[#ba0a0f] border-[#ba0a0f]' :
                    'bg-[#f7f9ff] text-slate-600 border-slate-200'
                  }`}>
                    {prj.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => setView('projets')}
              className="w-full justify-center flex items-center gap-1.5 py-2 px-4 bg-[#edf4ff] hover:bg-[#cae6ff] text-primary rounded-lg font-heading font-extrabold text-xs transition-colors"
            >
              <span>Accéder aux Projets &amp; Gantt</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Tasks lists & Recent Ledger Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Table: Tasks Assigned in active schedule */}
        <div className="bento-card space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-extrabold text-base text-on-surface">
                Tâches Critiques &amp; Prioritaires
              </h3>
              <p className="text-xs text-[#6f7881]">
                {tasks.filter(t => t.status !== 'Terminé').length} tâches en cours de traitement par l'agence
              </p>
            </div>
            <button
              onClick={() => setView('taches')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>TOUT VOIR</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {tasks.slice(0, 4).map(task => (
              <div key={task.id} className="py-2.5 flex items-center justify-between hover:bg-[#f7f9ff] rounded px-1 transition-colors">
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="font-sans font-semibold text-xs text-on-surface block truncate">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-[#6f7881] font-mono">
                    <span className="truncate max-w-[120px]">{task.projectOptionalName || 'Projet global'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3 text-[#6f7881]" />
                      {task.endDate}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    task.priority === 'Haute' ? 'bg-[#ffdad6] text-[#ba0a0f]' :
                    task.priority === 'Moyenne' ? 'bg-amber-100 text-[#725c00]' :
                    'bg-[#e2f1ff] text-[#00628f]'
                  }`}>
                    {task.priority}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    task.status === 'Terminé' ? 'bg-emerald-50 text-emerald-800' :
                    task.status === 'En cours' ? 'bg-amber-50 text-amber-800' :
                    'bg-slate-50 text-slate-750'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Table: Recent Financial Journal Ledger */}
        <div className="bento-card space-y-4 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-heading font-extrabold text-base text-on-surface">
                Flux Bancaires de l'Agence
              </h3>
              <p className="text-xs text-[#6f7881]">
                Dernières opérations de recettes et d'exploitation
              </p>
            </div>
            <button
              onClick={() => setView('finances')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>JOURNAL COMPLET</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between hover:bg-[#f7f9ff] rounded px-1 transition-colors">
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="font-sans font-semibold text-xs text-on-surface block truncate">
                    {tx.description}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-[#6f7881] font-mono">
                    <span className="bg-slate-100 px-1 rounded uppercase font-bold text-[9px]">{tx.category}</span>
                    <span>•</span>
                    <span>{tx.date}</span>
                    {tx.clientName && (
                      <>
                        <span>•</span>
                        <span className="truncate font-semibold">{tx.clientName}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono font-extrabold text-xs block ${
                    tx.type === 'Recette' ? 'text-emerald-600' : 'text-secondary'
                  }`}>
                    {tx.type === 'Recette' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <span className="text-[9px] font-mono text-[#6f7881] block">
                    {tx.projectName ? 'Projet' : 'Général'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Commands / Shortcuts Grid with high fidelity */}
      <div className="bento-card space-y-4 bg-white">
        <div>
          <h3 className="font-heading font-extrabold text-base text-on-surface">
            Raccourcis Opérations Saisons
          </h3>
          <p className="text-xs text-[#6f7881]">
            Actions rapides pour optimiser le travail quotidien de l'administrateur
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button
            onClick={() => onQuickAction('new_contact')}
            className="p-3 bg-[#edf4ff] hover:bg-[#cae6ff] text-[#00628f] rounded-xl text-center transition-all hover:scale-[1.02] border border-[#bec8d2]/40 cursor-pointer"
          >
            <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
            <span className="font-heading text-xs font-bold block">Créer un Contact</span>
            <span className="text-[10px] text-primary/80">Athlète ou Sponsor</span>
          </button>

          <button
            onClick={() => onQuickAction('new_devis')}
            className="p-3 bg-amber-50 hover:bg-amber-100 text-[#725c00] rounded-xl text-center transition-all hover:scale-[1.02] border border-amber-200 cursor-pointer"
          >
            <FileText className="w-5 h-5 mx-auto mb-2 text-amber-600" />
            <span className="font-heading text-xs font-bold block">Créer un Devis</span>
            <span className="text-[10px] text-amber-600/80">Offre commerciale</span>
          </button>

          <button
            onClick={() => onQuickAction('new_invoice')}
            className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-center transition-all hover:scale-[1.02] border border-teal-200 cursor-pointer"
          >
            <DollarSign className="w-5 h-5 mx-auto mb-2 text-teal-600" />
            <span className="font-heading text-xs font-bold block">Émettre Facture</span>
            <span className="text-[10px] text-teal-700">Demande versement</span>
          </button>

          <button
            onClick={() => onQuickAction('new_project')}
            className="p-3 bg-[#ffdad6] hover:bg-red-100 text-[#ba0a0f] rounded-xl text-center transition-all hover:scale-[1.02] border border-red-200 cursor-pointer"
          >
            <FolderKanban className="w-5 h-5 mx-auto mb-2 text-[#ba0a0f]" />
            <span className="font-heading text-xs font-bold block">Nouveau Projet</span>
            <span className="text-[10px] text-secondary">Coordination &amp; Tâches</span>
          </button>
        </div>
      </div>
    </div>
  );
}
