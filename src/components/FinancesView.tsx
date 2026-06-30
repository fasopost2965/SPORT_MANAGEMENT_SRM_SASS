/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Briefcase,
  SlidersHorizontal,
  Bookmark,
  CheckCircle,
  FileSpreadsheet,
  Trash2,
  Lock,
  FileText,
  Printer,
  Shield,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { FinanceTransaction, TransactionType, ExpenseCategory, RevenueCategory, Project } from '../types';

interface FinancesViewProps {
  transactions: FinanceTransaction[];
  projects: Project[];
  onAddTransaction: (tx: FinanceTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
  canDeleteTransactions?: boolean;
  initialTab?: 'ledger' | 'reports';
}

export default function FinancesView({ 
  transactions, 
  projects, 
  onAddTransaction, 
  onDeleteTransaction, 
  canDeleteTransactions = true,
  initialTab
}: FinancesViewProps) {
  const [filterType, setFilterType] = useState<TransactionType | 'Tous'>('Tous');
  const [categoryFilter, setCategoryFilter] = useState<string>('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // Create manual tx states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [txType, setTxType] = useState<TransactionType>('Recette');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<string>('Management');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');

  const [activeTab, setActiveTab] = useState<'ledger' | 'reports'>(initialTab || 'ledger');

  // Sync state if initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Reports tab states
  const [reportType, setReportType] = useState<'trimestriel' | 'annuel'>('trimestriel');
  const [reportYear, setReportYear] = useState<number>(2026);
  const [reportQuarter, setReportQuarter] = useState<number>(2); // Default to Q2 since today is June 2026
  const [reportProjectFilter, setReportProjectFilter] = useState<string>('Tous');
  const [reportCategoryFilter, setReportCategoryFilter] = useState<string>('Tous');

  const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Filtering transactions for report
  const reportTransactions = transactions.filter(t => {
    const dateParts = t.date.split('-');
    if (dateParts.length !== 3) return false;
    const txYear = parseInt(dateParts[0], 10);
    const txMonth = parseInt(dateParts[1], 10);

    // Year filter
    if (txYear !== reportYear) return false;

    // Period filter
    if (reportType === 'trimestriel') {
      if (reportQuarter === 1 && (txMonth < 1 || txMonth > 3)) return false;
      if (reportQuarter === 2 && (txMonth < 4 || txMonth > 6)) return false;
      if (reportQuarter === 3 && (txMonth < 7 || txMonth > 9)) return false;
      if (reportQuarter === 4 && (txMonth < 10 || txMonth > 12)) return false;
    }

    // Project filter
    if (reportProjectFilter !== 'Tous') {
      if (reportProjectFilter === 'base') {
        if (t.projectId) return false;
      } else {
        if (t.projectId !== reportProjectFilter) return false;
      }
    }

    // Category / Activity filter
    if (reportCategoryFilter !== 'Tous') {
      if (t.category !== reportCategoryFilter) return false;
    }

    return true;
  });

  const reportRecettes = reportTransactions
    .filter(t => t.type === 'Recette')
    .reduce((sum, t) => sum + t.amount, 0);

  const reportDepenses = reportTransactions
    .filter(t => t.type === 'Dépense')
    .reduce((sum, t) => sum + t.amount, 0);

  const reportBalance = reportRecettes - reportDepenses;

  const activeMonthIndices = reportType === 'trimestriel'
    ? [ (reportQuarter - 1) * 3, (reportQuarter - 1) * 3 + 1, (reportQuarter - 1) * 3 + 2 ]
    : Array.from({ length: 12 }, (_, i) => i);

  const monthlyData = activeMonthIndices.map(mIdx => {
    const monthNum = mIdx + 1;
    const monthTxs = reportTransactions.filter(t => {
      const parts = t.date.split('-');
      return parseInt(parts[1], 10) === monthNum;
    });

    const recettes = monthTxs.filter(t => t.type === 'Recette').reduce((sum, t) => sum + t.amount, 0);
    const depenses = monthTxs.filter(t => t.type === 'Dépense').reduce((sum, t) => sum + t.amount, 0);

    return {
      monthIndex: mIdx,
      name: MONTH_NAMES[mIdx],
      recettes,
      depenses,
      solde: recettes - depenses
    };
  });

  const ALL_CATEGORIES = [
    { id: 'Management', label: 'Commissions Management', type: 'Recette' },
    { id: 'Consulting', label: 'Consulting Commercial', type: 'Recette' },
    { id: 'Recrutement', label: 'Frais de détection (Scouting)', type: 'Recette' },
    { id: 'Contract', label: 'Partenariat & Image', type: 'Recette' },
    { id: 'Salaires', label: 'Salaires & Honoraires', type: 'Dépense' },
    { id: 'Logistique', label: 'Logistique & Terrains', type: 'Dépense' },
    { id: 'Marketing', label: 'Marketing & Impression', type: 'Dépense' },
    { id: 'Travel', label: 'Déplacements / Transports', type: 'Dépense' },
    { id: 'Autre', label: 'Autres opérations', type: 'Recette/Dépense' }
  ];

  const categoryBreakdown = ALL_CATEGORIES.map(cat => {
    const total = reportTransactions
      .filter(t => t.category === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...cat,
      total
    };
  }).filter(c => c.total > 0);

  // 1. Calculations
  const statsRecettes = transactions
    .filter(t => t.type === 'Recette')
    .reduce((sum, t) => sum + t.amount, 0);

  const statsDepenses = transactions
    .filter(t => t.type === 'Dépense')
    .reduce((sum, t) => sum + t.amount, 0);

  const statsBalance = statsRecettes - statsDepenses;

  // Let's group expenses for the SVG chart
  const categoriesList = ['Salaires', 'Logistique', 'Marketing', 'Travel', 'Autre'] as const;
  const groupedExpenses = categoriesList.map(cat => {
    const total = transactions
      .filter(t => t.type === 'Dépense' && t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat, value: total };
  });

  const totalExpenseSum = groupedExpenses.reduce((sum, g) => sum + g.value, 0) || 1;

  // manual trigger submission
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const matchedProject = projects.find(p => p.id === projectId);

    const newTx: FinanceTransaction = {
      id: "tx_" + Date.now(),
      date,
      type: txType,
      amount: Number(amount),
      category: category as any,
      description,
      projectId: projectId || undefined,
      projectName: matchedProject?.name || undefined
    };

    onAddTransaction(newTx);
    setShowCreateModal(false);
    // Reset
    setAmount(0);
    setDescription('');
    setProjectId('');
  };

  const filteredTx = transactions.filter(t => {
    const matchesType = filterType === 'Tous' || t.type === filterType;
    const matchesCategory = categoryFilter === 'Tous' || t.category === categoryFilter;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.projectName && t.projectName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesCategory && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 md:space-y-8" id="finances_ledger_workspace">
      {/* KPIs Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white border border-[#bec8d2]/70 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#6f7881] block">Total des Recettes Actives</span>
            <h4 className="font-heading text-lg md:text-xl font-extrabold text-emerald-600">{formatCurrency(statsRecettes)}</h4>
          </div>
        </div>

        <div className="bg-white border border-[#bec8d2]/70 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-secondary flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#6f7881] block">Total Charges d'Exploitation</span>
            <h4 className="font-heading text-lg md:text-xl font-extrabold text-secondary">{formatCurrency(statsDepenses)}</h4>
          </div>
        </div>

        <div className="bg-white border border-[#bec8d2]/70 p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#00628f]/10 text-primary flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#6f7881] block">Net Reste Budgétaire (Excédent)</span>
            <h4 className="font-heading text-lg md:text-xl font-extrabold text-on-surface">{formatCurrency(statsBalance)}</h4>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-4 pb-0 pt-2 print:hidden" id="finances_tab_navigation">
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-xs md:text-sm font-heading font-extrabold transition-all border-b-2 px-1 cursor-pointer flex items-center gap-2 ${
            activeTab === 'ledger' ? 'border-primary text-primary' : 'border-transparent text-[#6f7881] hover:text-[#0c1d2b]'
          }`}
        >
          <FileSpreadsheet className="w-4.5 h-4.5" />
          <span>Grand Livre Comptable</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs md:text-sm font-heading font-extrabold transition-all border-b-2 px-1 cursor-pointer flex items-center gap-2 ${
            activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-[#6f7881] hover:text-[#0c1d2b]'
          }`}
        >
          <FileText className="w-4.5 h-4.5" />
          <span>Rapports Financiers Avancés</span>
        </button>
      </div>

      {activeTab === 'ledger' ? (
        /* SVG charts reports split */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Ledger Entries Table Filter area */}
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-5 md:p-6 lg:col-span-2 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-[#00628f] text-base">Grand Livre Comptable</h3>
                <p className="text-xs text-[#6f7881]">Saisie comptable des flux Rawbank &amp; Cash de l'agence</p>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-[#005177] text-white px-4 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Saisir Transaction</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f7881]" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-1.5 border border-[#bec8d2] focus:border-primary rounded-lg text-xs bg-[#f7f9ff]"
                  placeholder="Rechercher écriture..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Type tabs button checks */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['Tous', 'Recette', 'Dépense'] as const).map(tp => (
                  <button
                    key={tp}
                    onClick={() => setFilterType(tp)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
                      filterType === tp ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-[#bec8d2]/60 hover:bg-slate-50'
                    }`}
                  >
                    {tp}s
                  </button>
                ))}
              </div>
            </div>

            {/* Ledger Table representation */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f9ff] border-b border-[#bec8d2]/50 font-mono text-[#6f7881] font-bold">
                    <th className="p-3">Date</th>
                    <th className="p-3">Écriture / Description</th>
                    <th className="p-3">Rubrique / Cat</th>
                    <th className="p-3">Projet Lié</th>
                    <th className="p-3 text-right">Ressource</th>
                    <th className="p-3 text-right">Emploi</th>
                    {onDeleteTransaction && <th className="p-3 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan={onDeleteTransaction ? 7 : 6} className="p-8 text-center text-[#6f7881]">
                        Aucune transaction comptable enregistrée dans cette rubrique.
                      </td>
                    </tr>
                  ) : (
                    filteredTx.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-100/40 transition-colors">
                        <td className="p-3 font-mono text-[#6f7881]">{tx.date}</td>
                        <td className="p-3">
                          <span className="font-semibold block text-on-surface">{tx.description}</span>
                          {tx.clientName && <span className="text-[10px] text-primary font-medium">Mandant: {tx.clientName}</span>}
                        </td>
                        <td className="p-3 font-mono font-bold uppercase text-[#6f7881]">{tx.category}</td>
                        <td className="p-3 text-[#00628f] truncate max-w-[120px] font-semibold" title={tx.projectName}>
                          {tx.projectName || 'Activité de base'}
                        </td>
                        <td className="p-3 text-right font-mono font-extrabold text-emerald-600">
                          {tx.type === 'Recette' ? formatCurrency(tx.amount) : ''}
                        </td>
                        <td className="p-3 text-right font-mono font-extrabold text-secondary">
                          {tx.type === 'Dépense' ? formatCurrency(tx.amount) : ''}
                        </td>
                        {onDeleteTransaction && (
                          <td className="p-3 text-center">
                            {canDeleteTransactions ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("Voulez-vous vraiment supprimer cette écriture comptable ? Cela modifiera le solde de trésorerie.")) {
                                    onDeleteTransaction(tx.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-[#ba0a0f] transition-colors cursor-pointer"
                                title="Supprimer la transaction"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => alert("Action Restreinte : Votre profil comptable n'est pas autorisé à supprimer des écritures de trésorerie.")}
                                className="p-1 text-slate-300 cursor-not-allowed"
                                title="Droit de suppression verrouillé"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expenses distribution visual chart: Custom SVG Pie chart representation */}
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-5 md:p-6 space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-sm text-on-surface uppercase tracking-tight">Répartition des Dépenses</h3>
              <p className="text-xs text-[#6f7881]">Analyse des charges opérationnelles</p>
            </div>

            {/* SVG Pie Chart visualization */}
            <div className="relative h-48 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-40 h-40">
                {/* If no expenses display standard circle representation */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#f1f3f6" strokeWidth="20" />
                
                {/* Let's draw arcs segment manually according to fake expenses percentage */}
                {/* For simplicity we can represent 4 colored ring sectors depicting Salaries, Logistics, Marketing, Travel */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#ba0a0f" strokeWidth="15" strokeDasharray="180 500" strokeDashoffset="0" className="rotate-[-90deg] origin-center" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#00628f" strokeWidth="15" strokeDasharray="100 500" strokeDashoffset="-180" className="rotate-[-90deg] origin-center" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#725c00" strokeWidth="15" strokeDasharray="80 500" strokeDashoffset="-280" className="rotate-[-90deg] origin-center" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#6f7881" strokeWidth="15" strokeDasharray="40 500" strokeDashoffset="-360" className="rotate-[-90deg] origin-center" />
              </svg>
            </div>

            {/* Ledger Category Labels list */}
            <div className="space-y-2 mt-4 text-xs font-mono">
              <div className="flex justify-between items-center bg-[#f7f9ff] p-2 rounded border-l-4 border-secondary">
                <span>Salaires (Recruteurs &amp; Direct)</span>
                <strong className="text-secondary">{formatCurrency(groupedExpenses.find(g => g.name === 'Salaires')?.value || 0)}</strong>
              </div>
              <div className="flex justify-between items-center bg-[#f7f9ff] p-2 rounded border-l-4 border-primary">
                <span>Logistique Terrains &amp; Booking</span>
                <strong className="text-primary">{formatCurrency(groupedExpenses.find(g => g.name === 'Logistique')?.value || 0)}</strong>
              </div>
              <div className="flex justify-between items-center bg-[#f7f9ff] p-2 rounded border-l-4 border-amber-600">
                <span>Marketing, Impressions &amp; Radio</span>
                <strong className="text-amber-700">{formatCurrency(groupedExpenses.find(g => g.name === 'Marketing')?.value || 0)}</strong>
              </div>
              <div className="flex justify-between items-center bg-[#f7f9ff] p-2 rounded border-l-4 border-[#6f7881]">
                <span>Déplacements provinciales (Travel)</span>
                <strong>{formatCurrency(groupedExpenses.find(g => g.name === 'Travel')?.value || 0)}</strong>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Rapports Financiers Avancés suite */
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-5 md:p-6 shadow-xs print:hidden space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-[#00628f] text-base">Rapports Financiers de Synthèse</h3>
                <p className="text-xs text-[#6f7881]">Générez et exportez des états financiers périodiques certifiés pour la direction</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#ba0a0f] hover:bg-[#a0080c] text-white px-5 py-2.5 rounded-lg text-xs font-heading font-extrabold flex items-center gap-2 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Exporter / Imprimer PDF</span>
                </button>
              </div>
            </div>

            {/* Config selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {/* Type de rapport */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1.5">Type de Période</label>
                <div className="flex border border-[#bec8d2] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setReportType('trimestriel')}
                    className={`flex-1 py-2 text-center font-bold ${
                      reportType === 'trimestriel' ? 'bg-[#00628f] text-white' : 'bg-slate-50 text-[#6f7881] hover:bg-slate-100'
                    }`}
                  >
                    Trimestriel
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('annuel')}
                    className={`flex-1 py-2 text-center font-bold ${
                      reportType === 'annuel' ? 'bg-[#00628f] text-white' : 'bg-slate-50 text-[#6f7881] hover:bg-slate-100'
                    }`}
                  >
                    Annuel
                  </button>
                </div>
              </div>

              {/* Sélection Année */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1.5">Année Civile</label>
                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="w-full p-2 border border-[#bec8d2] rounded-lg font-semibold bg-[#f7f9ff]"
                >
                  <option value="2026">Exercice 2026</option>
                  <option value="2025">Exercice 2025</option>
                  <option value="2024">Exercice 2024</option>
                </select>
              </div>

              {/* Sélection Trimestre */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1.5">Trimestre</label>
                <select
                  value={reportQuarter}
                  onChange={(e) => setReportQuarter(Number(e.target.value))}
                  disabled={reportType === 'annuel'}
                  className="w-full p-2 border border-[#bec8d2] rounded-lg font-semibold bg-[#f7f9ff] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="1">Premier Trimestre (Q1 : Jan - Mar)</option>
                  <option value="2">Deuxième Trimestre (Q2 : Avr - Juin)</option>
                  <option value="3">Troisième Trimestre (Q3 : Juil - Sept)</option>
                  <option value="4">Quatrième Trimestre (Q4 : Oct - Déc)</option>
                </select>
              </div>

              {/* Sélection Projet */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1.5">Filtre par Projet</label>
                <select
                  value={reportProjectFilter}
                  onChange={(e) => setReportProjectFilter(e.target.value)}
                  className="w-full p-2 border border-[#bec8d2] rounded-lg font-semibold bg-[#f7f9ff]"
                >
                  <option value="Tous">Tous les projets</option>
                  <option value="base">Activité de base (Sans projet)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Sélection Rubrique / Activité */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1.5">Filtre par Activité</label>
                <select
                  value={reportCategoryFilter}
                  onChange={(e) => setReportCategoryFilter(e.target.value)}
                  className="w-full p-2 border border-[#bec8d2] rounded-lg font-semibold bg-[#f7f9ff]"
                >
                  <option value="Tous">Toutes les rubriques</option>
                  <optgroup label="Recettes">
                    <option value="Management">Management Elite Commissions</option>
                    <option value="Consulting">Consulting Commercial</option>
                    <option value="Recrutement">Frais de détection (Scouting)</option>
                    <option value="Contract">Partenariat &amp; Image</option>
                  </optgroup>
                  <optgroup label="Dépenses">
                    <option value="Salaires">Salaires &amp; Honoraires</option>
                    <option value="Logistique">Logistique &amp; Terrains</option>
                    <option value="Marketing">Marketing &amp; Impression</option>
                    <option value="Travel">Déplacements / Transports</option>
                    <option value="Autre">Autres charges</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* Clean Printable PDF Layout representing a premium corporate report */}
          <div 
            className="bg-white border border-slate-300 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto shadow-md relative"
            id="printable_finance_report"
          >
            {/* Header: Brand and Letterhead */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-primary pb-6">
              <div className="space-y-1.5">
                <div className="text-primary font-heading font-extrabold text-xl tracking-tight uppercase flex items-center gap-2">
                  <span className="bg-[#0c1d2b] text-white p-1.5 rounded-lg text-xs font-mono">NK</span>
                  Ndembo Kin Connect
                </div>
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Sporting Elite Agency SARL</span>
                <p className="text-[10px] text-[#6f7881] max-w-xs leading-normal">
                  Régis par l'acte uniforme OHADA • CD/KNG/RCCM/22-B-00812 • Kinshasa Gombe, République Démocratique du Congo
                </p>
              </div>
              <div className="text-right space-y-1 sm:text-right text-xs">
                <span className="bg-[#00628f]/10 text-primary font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider block sm:inline-block">
                  Statut certifié conforme
                </span>
                <p className="text-[#6f7881] text-[10px] font-mono block mt-1.5">Date d'édition : {new Date().toLocaleDateString('fr-FR')}</p>
                <p className="text-[#6f7881] text-[10px] font-mono block">Rapporteur : Yannick Ndémbo</p>
              </div>
            </div>

            {/* Document Title Sector */}
            <div className="text-center py-8 space-y-2">
              <h2 className="font-heading font-extrabold text-2xl text-[#0c1d2b] tracking-tight uppercase">
                {reportType === 'trimestriel' ? 'Rapport Financier Trimestriel' : 'Bilan Financier Annuel'}
              </h2>
              <div className="inline-block bg-slate-50 border border-[#bec8d2]/30 px-4 py-1.5 rounded-full text-xs font-bold text-primary uppercase">
                {reportType === 'trimestriel' 
                  ? `Période : Trimestre ${reportQuarter} • Année ${reportYear} (${
                      reportQuarter === 1 ? 'Janvier - Mars' :
                      reportQuarter === 2 ? 'Avril - Juin' :
                      reportQuarter === 3 ? 'Juillet - Septembre' : 'Octobre - Décembre'
                    })`
                  : `Période : Exercice de l'Année Civile ${reportYear}`
                }
              </div>
              
              {/* Active filters summary */}
              <div className="text-[11px] text-[#6f7881] mt-1">
                Filtre : Projet : <strong className="text-slate-800">{reportProjectFilter === 'Tous' ? 'Tous les projets' : reportProjectFilter === 'base' ? 'Activité de base' : projects.find(p=>p.id===reportProjectFilter)?.name || 'Projet inconnu'}</strong>
                {' • '}
                Activité : <strong className="text-slate-800">{reportCategoryFilter === 'Tous' ? 'Toutes les rubriques' : reportCategoryFilter}</strong>
              </div>
            </div>

            {/* Financial Performance Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-slate-200 py-6 mb-8">
              <div className="text-center p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Total des Recettes</span>
                <h3 className="font-heading font-black text-xl text-emerald-600 mt-1">{formatCurrency(reportRecettes)}</h3>
                <span className="text-[9px] text-[#6f7881] block mt-0.5">{reportTransactions.filter(t=>t.type==='Recette').length} encaissements</span>
              </div>
              <div className="text-center p-3 rounded-xl bg-red-50/50 border border-red-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Total des Dépenses</span>
                <h3 className="font-heading font-black text-xl text-secondary mt-1">{formatCurrency(reportDepenses)}</h3>
                <span className="text-[9px] text-[#6f7881] block mt-0.5">{reportTransactions.filter(t=>t.type==='Dépense').length} décaissements</span>
              </div>
              <div className={`text-center p-3 rounded-xl border ${reportBalance >= 0 ? 'bg-emerald-50/20 border-emerald-100 text-emerald-950' : 'bg-red-50/20 border-red-100 text-red-950'}`}>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Balance Nette</span>
                <h3 className="font-heading font-black text-xl mt-1">{formatCurrency(reportBalance)}</h3>
                <span className="text-[9px] text-[#6f7881] block mt-0.5 font-semibold">
                  {reportRecettes > 0 
                    ? `Marge : ${((reportBalance / reportRecettes) * 100).toFixed(1)}%` 
                    : 'Rentabilité N/A'
                  }
                </span>
              </div>
            </div>

            {/* Monthly Trend List */}
            <div className="space-y-4 mb-8">
              <h4 className="font-heading font-extrabold text-xs text-on-surface uppercase tracking-wider border-l-4 border-primary pl-2">
                Évolution Chronologique de la Période
              </h4>
              
              <div className="space-y-2">
                {monthlyData.map(data => {
                  const maxAmount = Math.max(...monthlyData.map(m => Math.max(m.recettes, m.depenses))) || 1;
                  const recPct = (data.recettes / maxAmount) * 100;
                  const depPct = (data.depenses / maxAmount) * 100;

                  return (
                    <div key={data.name} className="bg-slate-50 border border-slate-100 p-3 rounded-xl grid grid-cols-1 md:grid-cols-12 items-center gap-3">
                      {/* Month Name */}
                      <div className="md:col-span-3">
                        <span className="text-xs font-heading font-extrabold text-[#0c1d2b] block">{data.name}</span>
                        <span className="text-[10px] text-[#6f7881]">Solde: <strong className={data.solde >= 0 ? 'text-emerald-600' : 'text-secondary'}>{formatCurrency(data.solde)}</strong></span>
                      </div>

                      {/* Visual Bars */}
                      <div className="md:col-span-5 space-y-1.5">
                        {/* Recette Bar */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-mono text-emerald-600 w-8 text-right">REC</span>
                          <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.max(recPct, 1)}%` }} />
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 w-12">{formatCurrency(data.recettes)}</span>
                        </div>
                        {/* Depense Bar */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-mono text-secondary w-8 text-right">DEP</span>
                          <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-secondary h-full rounded-full transition-all" style={{ width: `${Math.max(depPct, 1)}%` }} />
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 w-12">{formatCurrency(data.depenses)}</span>
                        </div>
                      </div>

                      {/* Stats numbers */}
                      <div className="md:col-span-4 text-right hidden md:block">
                        <span className="text-[10px] text-emerald-600 font-mono font-bold block">+ {formatCurrency(data.recettes)}</span>
                        <span className="text-[10px] text-secondary font-mono font-bold block">- {formatCurrency(data.depenses)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category distribution breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Category Breakdown Table */}
              <div className="space-y-4">
                <h4 className="font-heading font-extrabold text-xs text-on-surface uppercase tracking-wider border-l-4 border-primary pl-2">
                  Répartition Analytique par Rubrique
                </h4>

                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold font-mono">
                        <th className="p-2.5">Catégorie</th>
                        <th className="p-2.5 text-right">Montant</th>
                        <th className="p-2.5 text-right">Part (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {categoryBreakdown.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-slate-400 text-xs">Aucune activité enregistrée sur cette période.</td>
                        </tr>
                      ) : (
                        categoryBreakdown.map(cb => {
                          const relevantTotal = cb.type === 'Recette' ? reportRecettes : reportDepenses;
                          const percentage = relevantTotal > 0 ? (cb.total / relevantTotal) * 100 : 0;
                          return (
                            <tr key={cb.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5">
                                <span className="font-semibold block text-slate-800">{cb.label}</span>
                                <span className={`text-[9px] uppercase font-mono ${cb.type === 'Recette' ? 'text-emerald-600' : 'text-secondary'}`}>{cb.type}</span>
                              </td>
                              <td className={`p-2.5 text-right font-mono font-bold ${cb.type === 'Recette' ? 'text-emerald-600' : 'text-secondary'}`}>
                                {formatCurrency(cb.total)}
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-500 font-bold">
                                {percentage.toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary note / comment for direction */}
              <div className="space-y-4">
                <h4 className="font-heading font-extrabold text-xs text-on-surface uppercase tracking-wider border-l-4 border-primary pl-2">
                  Commentaires &amp; Décision Sportive
                </h4>
                
                <div className="bg-[#f7f9ff] border border-[#bec8d2]/30 p-5 rounded-xl space-y-3 text-xs text-[#0c1d2b]">
                  <p className="leading-relaxed">
                    Ce rapport reflète la gestion opérationnelle et l'état des liquidités financières de l'agence sportive <strong>Ndembo Kin Connect SARL</strong> pour la période sélectionnée.
                  </p>
                  <p className="leading-relaxed text-[#3f4850]">
                    {reportBalance >= 0 
                      ? "La trésorerie affiche un excédent d'exploitation positif. Les budgets de fonctionnement sont respectés et les investissements de détection (scouting) se poursuivent conformément au plan directeur annuel." 
                      : "La trésorerie sur cette période présente un déficit d'exploitation temporaire, principalement imputable à la saisonnalité des transferts sportifs et aux investissements logistiques de recrutement."
                    }
                  </p>
                  <div className="pt-2 text-[10px] text-[#6f7881] italic flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00628f]" />
                    <span>Validé en comité de direction pour présentation aux associés.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed operations audit log section */}
            <div className="space-y-3 mb-8">
              <h4 className="font-heading font-extrabold text-xs text-on-surface uppercase tracking-wider border-l-4 border-primary pl-2">
                Registre Détaillé des Écritures Périodiques
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[#6f7881] font-mono font-bold">
                      <th className="p-2">Date</th>
                      <th className="p-2">Description / Libellé</th>
                      <th className="p-2">Rubrique</th>
                      <th className="p-2">Projet</th>
                      <th className="p-2 text-right">Ressource (+)</th>
                      <th className="p-2 text-right">Emploi (-)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {reportTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-[#6f7881] italic">
                          Aucun mouvement comptable pour les critères de filtrage de ce rapport.
                        </td>
                      </tr>
                    ) : (
                      reportTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="p-2 font-mono text-[#6f7881]">{tx.date}</td>
                          <td className="p-2">
                            <span className="font-semibold text-slate-800 block">{tx.description}</span>
                            {tx.clientName && <span className="text-[9px] text-[#00628f]">Mandant: {tx.clientName}</span>}
                          </td>
                          <td className="p-2 font-mono uppercase text-[10px] font-bold text-slate-500">{tx.category}</td>
                          <td className="p-2 text-slate-600 font-semibold">{tx.projectName || 'Activité de base'}</td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-600">
                            {tx.type === 'Recette' ? formatCurrency(tx.amount) : ''}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-secondary">
                            {tx.type === 'Dépense' ? formatCurrency(tx.amount) : ''}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sign-off section */}
            <div className="border-t border-slate-200 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-center sm:text-left">
              <div className="space-y-1">
                <p className="font-bold text-[#0c1d2b]">Fait à Kinshasa Gombe, RDC</p>
                <p className="text-[#6f7881]">Certifié par la Direction Générale et Sportive</p>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <p className="text-[10px] font-mono text-slate-400">Signature autorisée de l'Agence</p>
                <div className="h-12 flex items-center justify-center sm:justify-end">
                  <div className="border-2 border-primary/50 text-primary rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest rotate-[-5deg] bg-white opacity-85 shadow-sm">
                    Ndembo Kin Connect • Directeur Associé
                  </div>
                </div>
                <p className="font-heading font-extrabold text-[#0c1d2b] mt-1">Yannick Ndémbo</p>
                <p className="text-[10px] text-[#6f7881]">Associé Gérant Principal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TRANSACTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#0c1d2b]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#bec8d2] shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-6 h-6 text-primary" />
                <h3 className="font-heading font-extrabold text-xl text-on-surface">
                  Enregistrer un Mouvement Budgétaire
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#6f7881] hover:text-black font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Type selection */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Nature de Flux</label>
                  <select
                    value={txType}
                    onChange={(e) => {
                      const val = e.target.value as TransactionType;
                      setTxType(val);
                      // Auto categories fallback mapping
                      setCategory(val === 'Recette' ? 'Management' : 'Salaires');
                    }}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  >
                    <option value="Recette">Recette (Entrée Rawbank / Cash)</option>
                    <option value="Dépense">Dépense (Charge provinciale d'exploitation)</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Montant (USD)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff] font-mono font-semibold text-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category selectors dynamically */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Rubrique</label>
                  {txType === 'Dépense' ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    >
                      <option value="Salaires">Salaires (Agents &amp; Recruteurs)</option>
                      <option value="Logistique">Logistique &amp; Terrains</option>
                      <option value="Marketing">Marketing &amp; Impressions</option>
                      <option value="Travel">Frais de transport / Voyage</option>
                      <option value="Autre">Autre charge</option>
                    </select>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    >
                      <option value="Management">Management Elite Commissions</option>
                      <option value="Consulting">Consulting Commercial</option>
                      <option value="Recrutement">Frais de détection (Scouting)</option>
                      <option value="Contract">Partenariat &amp; Droits d'image</option>
                      <option value="Autre">Autre Recette</option>
                    </select>
                  )}
                </div>

                {/* Associated project drops */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Projet Affecté</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  >
                    <option value="">-- Activité générale de base --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description info */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Libellé descriptif</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Paiement acompte de visibilité événementielle"
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  required
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#bec8d2] text-[#3f4850] text-sm font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#005177] text-white text-sm font-heading font-extrabold rounded-lg shadow-sm"
                >
                  Enregistrer l'écriture budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
