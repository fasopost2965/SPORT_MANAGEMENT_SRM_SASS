/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle,
  Eye,
  Printer,
  ChevronRight,
  Search,
  Percent,
  Check
} from 'lucide-react';
import { Facture, DevisLineItem, Contact, FactureStatus, BusinessSettings } from '../types';
import { INITIAL_SETTINGS } from '../mockData';
import NdemboKinLogo from './NdemboKinLogo';

interface FacturesViewProps {
  factures: Facture[];
  contacts: Contact[];
  onAddFacture: (facture: Facture) => void;
  onMarkAsPaid: (id: string) => void;
  onConvertToProject: (facture: Facture) => void;
  tvaDefault: number;
  settings?: BusinessSettings;
}

export default function FacturesView({
  factures,
  contacts,
  onAddFacture,
  onMarkAsPaid,
  onConvertToProject,
  tvaDefault,
  settings
}: FacturesViewProps) {
  // Filters
  const [filterStatus, setFilterStatus] = useState<FactureStatus | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // Create modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientId, setClientId] = useState('');
  const [dateDue, setDateDue] = useState('');
  const [notes, setNotes] = useState('Paiement par virement Rawbank requis à échéance. Titulaire Ndembo Kin Connect.');
  const [items, setItems] = useState<Omit<DevisLineItem, 'total'>[]>([
    { id: '1', serviceName: '', description: '', qty: 1, unitPrice: 0 }
  ]);
  const [tvaPercent, setTvaPercent] = useState(tvaDefault);

  // Preview state
  const [previewFacture, setPreviewFacture] = useState<Facture | null>(null);

  // Line item change handlers
  const handleItemChange = (index: number, field: keyof Omit<DevisLineItem, 'total'>, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'qty' || field === 'unitPrice' ? Number(value) : value
    };
    setItems(updatedItems);
  };

  const addItemLine = () => {
    setItems([...items, { id: Date.now().toString(), serviceName: '', description: '', qty: 1, unitPrice: 0 }]);
  };

  const removeItemLine = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Live calculations for form
  const getFormCalculations = () => {
    const totalHT = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const totalTVA = Math.round(totalHT * (tvaPercent / 100));
    const totalTTC = totalHT + totalTVA;
    return { totalHT, totalTVA, totalTTC };
  };

  const { totalHT, totalTVA, totalTTC } = getFormCalculations();

  // Create Invoice submission
  const handleCreateFacture = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedContact = contacts.find(c => c.id === clientId);
    if (!selectedContact) return;

    const lineItems: DevisLineItem[] = items.map(it => ({
      ...it,
      total: it.qty * it.unitPrice
    }));

    const newFacture: Facture = {
      id: "fac_" + Date.now(),
      number: `FAC-2026-00${factures.length + 1}`,
      clientId: selectedContact.id,
      clientName: selectedContact.name,
      dateCreated: new Date().toISOString().split('T')[0],
      dateDue: dateDue || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: lineItems,
      status: 'Non payée',
      tvaPercent: tvaPercent,
      totalHT,
      totalTVA,
      totalTTC,
      notes
    };

    onAddFacture(newFacture);
    setShowCreateModal(false);
    // Reset
    setClientId('');
    setDateDue('');
    setItems([{ id: '1', serviceName: '', description: '', qty: 1, unitPrice: 0 }]);
  };

  // Preview triggers printable window
  const handlePrint = () => {
    window.print();
  };

  // Filter list
  const filteredFactures = factures.filter(f => {
    const matchesStatus = filterStatus === 'Tous' || f.status === filterStatus;
    const matchesSearch = f.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 md:space-y-8" id="factures_management_system">
      {/* Search and filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#bec8d2]/70 p-4 rounded-xl shadow-xs print:hidden">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6f7881]" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
            placeholder="Rechercher facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters and action triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Tous', 'Non payée', 'En cours', 'Payée', 'Échue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filterStatus === st
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-white text-[#3f4850] border-[#bec8d2] hover:bg-[#f7f9ff]'
              }`}
            >
              {st}
            </button>
          ))}

          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto sm:ml-2 bg-[#00628f] hover:bg-[#005177] text-white font-heading font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Créer Facture</span>
          </button>
        </div>
      </div>

      {/* Invoices List representation */}
      <div className="bg-white border border-[#bec8d2]/70 rounded-2xl overflow-hidden shadow-xs print:hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f9ff] border-b border-[#bec8d2]/70 text-xs font-mono font-bold text-[#6f7881]">
                <th className="p-4 uppercase tracking-wider">Numéro</th>
                <th className="p-4 uppercase tracking-wider">Date Création</th>
                <th className="p-4 uppercase tracking-wider">Date Échéance</th>
                <th className="p-4 uppercase tracking-wider">Client Actif</th>
                <th className="p-4 uppercase tracking-wider text-right">Montant HT</th>
                <th className="p-4 uppercase tracking-wider text-right">Montant TTC</th>
                <th className="p-4 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 uppercase tracking-wider text-right">Operations Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredFactures.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6f7881] font-sans">
                    Aucune facture enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                filteredFactures.map((fac) => {
                  const isOverdue = new Date(fac.dateDue) < new Date() && fac.status !== 'Payée';
                  return (
                    <tr key={fac.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">
                        {fac.number}
                      </td>
                      <td className="p-4 text-xs font-mono text-[#6f7881]">
                        {fac.dateCreated}
                      </td>
                      <td className="p-4 text-xs font-mono text-[#6f7881]">
                        <span className={isOverdue ? 'text-[#ba0a0f] font-bold' : ''}>
                          {fac.dateDue}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-on-surface">
                        {fac.clientName}
                      </td>
                      <td className="p-4 text-right font-mono font-medium">
                        {formatCurrency(fac.totalHT)}
                      </td>
                      <td className="p-4 text-right font-mono font-extrabold text-on-surface">
                        {formatCurrency(fac.totalTTC)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded inline-block text-[10px] font-mono font-extrabold border ${
                          fac.status === 'Payée' ? 'bg-emerald-50 text-emerald-850 border-emerald-250' :
                          fac.status === 'Non payée' ? 'bg-amber-50 text-[#725c00] border-amber-250' :
                          fac.status === 'Échue' || isOverdue ? 'bg-red-50 text-[#ba0a0f] border-red-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {isOverdue ? 'LATE / ÉCHUE' : fac.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-1.5">
                        {/* Eye visualizer trigger */}
                        <button
                          onClick={() => setPreviewFacture(fac)}
                          className="bg-slate-100 hover:bg-slate-200 text-[#3f4850] p-1.5 rounded transition-all cursor-pointer"
                          title="Prévisualiser officielle"
                        >
                          <Eye className="w-4 h-4 text-[#3f4850]" />
                        </button>

                        {/* Direct PDF Export button */}
                        <button
                          onClick={() => {
                            setPreviewFacture(fac);
                            setTimeout(() => {
                              window.print();
                            }, 150);
                          }}
                          className="bg-[#00628f]/10 hover:bg-[#00628f]/20 text-[#00628f] p-1.5 rounded transition-all cursor-pointer"
                          title="Exporter en PDF (A4)"
                          id={`export_pdf_btn_facture_${fac.id}`}
                        >
                          <Printer className="w-4 h-4 text-[#00628f]" />
                        </button>

                        {/* Liquidate invoice trigger */}
                        {fac.status !== 'Payée' && (
                          <button
                            onClick={() => onMarkAsPaid(fac.id)}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-1.5 rounded transition-all flex items-center gap-1 text-[10px] uppercase font-mono font-bold font-heading cursor-pointer"
                            title="Indiquer de versement liquidé"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-850" />
                            <span>Payer</span>
                          </button>
                        )}

                        {/* Convert to Project action */}
                        {!fac.convertedToProjectId && (
                          <button
                            onClick={() => onConvertToProject(fac)}
                            className="bg-[#edf4ff] hover:bg-[#cae6ff] text-[#00628f] px-2 py-1 rounded text-[10px] font-mono font-bold transition-all uppercase"
                            title="Créer le projet technique d'après cette facture"
                          >
                            + Projet
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#0c1d2b]/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#bec8d2] shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-6 h-6 text-primary" />
                <h3 className="font-heading font-extrabold text-xl text-on-surface">
                  Émettre Nouvelle Facture / Demande de Fonds
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#6f7881] hover:text-black font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateFacture} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Client drop-down selector */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Client d'Imputation</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  >
                    <option value="">-- Sélectionnez un client --</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Échéance de Règlement</label>
                  <input
                    type="date"
                    value={dateDue}
                    onChange={(e) => setDateDue(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  />
                </div>

                {/* TVA standard selection */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">TVA Aplicable (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={tvaPercent}
                      onChange={(e) => setTvaPercent(Number(e.target.value))}
                      className="w-full p-2.5 pr-8 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff] font-mono font-semibold"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f7881]" />
                  </div>
                </div>
              </div>

              {/* Line Items Grid layout list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-mono font-bold uppercase text-on-surface">Détails des Prestations &amp; Montants</span>
                  <button
                    type="button"
                    onClick={addItemLine}
                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5 animate-pulse"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    <span>Ajouter une ligne</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start bg-[#f7f9ff] p-3 rounded-lg border border-[#bec8d2]/30 relative group">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Nom de la prestation (ex: Representation)"
                          value={item.serviceName}
                          onChange={(e) => handleItemChange(index, 'serviceName', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#bec8d2] rounded text-xs bg-white"
                          required
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <textarea
                          placeholder="Description détaillée"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#bec8d2] rounded text-xs bg-white h-8"
                          required
                        />
                      </div>
                      <div className="sm:col-span-1.5 col-span-4">
                        <input
                          type="number"
                          placeholder="Qté"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                          className="w-full px-2 py-1.5 border border-[#bec8d2] rounded text-xs font-mono bg-white"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 col-span-4">
                        <input
                          type="number"
                          placeholder="P.U. USD"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1.5 border border-[#bec8d2] rounded text-xs font-mono bg-white"
                          required
                        />
                      </div>
                      <div className="sm:col-span-1.5 flex items-center justify-between gap-1 col-span-4 text-xs font-mono font-bold text-right py-1">
                        <span>{formatCurrency(item.qty * item.unitPrice)}</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemLine(item.id)}
                            className="text-[#ba0a0f] hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total calculations */}
              <div className="bg-[#f7f9ff] border border-[#bec8d2]/70 p-4 rounded-xl flex flex-col items-end space-y-1.5 text-xs text-on-surface font-mono">
                <div>Total HT : <strong className="text-sm text-right font-bold inline-block w-32">{formatCurrency(totalHT)}</strong></div>
                <div>TVA ({tvaPercent}%) : <strong className="text-sm text-right font-bold inline-block w-32">{formatCurrency(totalTVA)}</strong></div>
                <div className="pt-2 border-t border-slate-200 mt-1 font-heading text-[#ba0a0f] text-base font-extrabold flex justify-between items-center w-full">
                  <span className="font-mono text-xs uppercase font-extrabold text-[#6f7881]">Net À Payer TTC (USD) :</span>
                  <span>{formatCurrency(totalTTC)}</span>
                </div>
              </div>

              {/* Terms notes */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Conditions Générales de Règlement</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
                  rows={2}
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#bec8d2] text-[#3f4850] text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00628f] hover:bg-[#005177] text-white text-sm font-heading font-extrabold rounded-lg shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  Générer et Enregistrer la Facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW/PRINT MODAL */}
      {previewFacture && (
        <div className="fixed inset-0 bg-[#0c1d2b]/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2 text-on-surface">
                <Receipt className="w-5 h-5 text-primary" />
                <span className="font-sans font-bold text-sm">Visualisation Facture Officielle - {previewFacture.number}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-[#00628f] hover:bg-[#005177] text-white px-3.5 py-1.5 rounded text-xs font-bold font-heading flex items-center gap-1.5 transition-transform cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  Imprimer / PDF
                </button>
                <button
                  onClick={() => setPreviewFacture(null)}
                  className="bg-white hover:bg-slate-200 text-[#3f4850] px-3.5 py-1.5 rounded text-xs font-bold border border-[#bec8d2] cursor-pointer"
                >
                  Quitter
                </button>
              </div>
            </div>

            {/* Print Body with dual border decoration and stamps */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar print:p-0 bg-white" id="printable_facture_document">
              <div className="border-[3px] border-double border-[#00628f] p-6 md:p-8 space-y-8 h-full rounded shadow-inner">
                {/* Header corporate sheet */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 border-b-2 border-[#00628f] pb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <NdemboKinLogo size="sm" showText={false} />
                      <span className="font-heading font-extrabold text-[#00628f] text-2xl tracking-tighter">{settings?.companyName || "Ndembo Kin Connect"}</span>
                    </div>
                    <div className="font-mono text-[10px] text-[#3f4850] space-y-0.5">
                      <p>SARL Unipersonnelle • RC: {settings?.rcNumber || INITIAL_SETTINGS.rcNumber}</p>
                      <p>{settings?.address || INITIAL_SETTINGS.address}</p>
                      <p>Kinshasa, Gombe • RDC</p>
                      <p>Email: {settings?.email || INITIAL_SETTINGS.email} • Tél: {settings?.phone || INITIAL_SETTINGS.phone}</p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="inline-block bg-[#ba0a0f]/10 text-[#ba0a0f] font-heading font-extrabold text-sm px-3.5 py-1 rounded">
                      FACTURE D'HONORAIRES
                    </div>
                    <p className="font-mono text-sm font-bold text-on-surface mt-1">Nº {previewFacture.number}</p>
                    <div className="font-mono text-xs text-[#6f7881] space-y-0.5">
                      <p>Date d'émission : {previewFacture.dateCreated}</p>
                      <p>Date d'échéance : <strong className="text-on-surface">{previewFacture.dateDue}</strong></p>
                    </div>
                  </div>
                </div>

                {/* Client info card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#f7f9ff] border border-[#bec8d2]/40 p-4 rounded-lg">
                  <div>
                    <span className="font-mono text-[10px] tracking-wider text-[#6f7881] font-bold block uppercase mb-1">Société Émettrice</span>
                    <strong className="font-heading text-sm text-primary block">{settings?.companyName || "Ndembo Kin Connect SARL"}</strong>
                    <span className="font-sans text-xs text-[#3f4850] block">Numéro RC: {settings?.rcNumber || INITIAL_SETTINGS.rcNumber}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] tracking-wider text-[#6f7881] font-bold block uppercase mb-1">Débiteur / Client</span>
                    <strong className="font-heading text-sm text-[#ba0a0f] block">{previewFacture.clientName}</strong>
                    <span className="font-sans text-xs text-[#3f4850] block">Réf Client: {previewFacture.clientId}</span>
                  </div>
                </div>

                {/* Detailed Prestations table */}
                <div className="space-y-2">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-[#00628f] text-white font-mono uppercase font-bold text-[10px]">
                        <th className="p-3">Désignation des Prestations</th>
                        <th className="p-3">Description Technique</th>
                        <th className="p-3 text-center">Quantité</th>
                        <th className="p-3 text-right">P.U. (USD)</th>
                        <th className="p-3 text-right">Total Net HT (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewFacture.items.map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-on-surface">{line.serviceName}</td>
                          <td className="p-3 text-[#3f4850] max-w-xs">{line.description}</td>
                          <td className="p-3 text-center font-mono">{line.qty}</td>
                          <td className="p-3 text-right font-mono">{formatCurrency(line.unitPrice)}</td>
                          <td className="p-3 text-right font-mono font-bold text-on-surface">{formatCurrency(line.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bank account details represent and totals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                  <div className="bg-[#f7f9ff] border border-[#bec8d2]/40 p-4 rounded-lg space-y-2">
                    <span className="font-mono text-[9px] tracking-wider text-[#6f7881] font-bold block uppercase">Informations de Réglement Bancaire</span>
                    <div className="font-mono text-[9px] text-[#3f4850] space-y-0.5">
                      <p><strong>Banque :</strong> {settings?.bankName || "RAWBANK S.A. Kinshasa RDC"}</p>
                      <p><strong>Intitulé Compte :</strong> {settings?.bankAccountName || "Ndembo Kin Connect SARL"}</p>
                      <p><strong>Numéro RIF Compte :</strong> {settings?.bankAccountNumber || "05100-382941-8374-02 USD"}</p>
                      <p><strong>Code Swift SWIFT :</strong> {settings?.bankSwift || "RAWBCD KI XXX"}</p>
                    </div>
                    <p className="text-[9px] text-[#6f7881] italic mt-2">
                      Veuillez mentionner le numéro de facture <strong>{previewFacture.number}</strong> en motif de votre transfert bancaire.
                    </p>
                  </div>

                  <div className="bg-[#f7f9ff] border border-[#bec8d2]/50 p-4 rounded-lg text-right font-mono space-y-1 my-auto">
                    <div className="text-xs">Base Imposable Total HT : <strong className="font-bold">{formatCurrency(previewFacture.totalHT)}</strong></div>
                    <div className="text-xs">TVA applicable ({previewFacture.tvaPercent}%) : <strong className="font-bold">{formatCurrency(previewFacture.totalTVA)}</strong></div>
                    <div className="border-t border-slate-350 pt-2 text-sm font-heading font-extrabold text-[#ba0a0f] flex justify-between items-center">
                      <span className="font-mono text-[10px] text-left text-[#3f4850]">TOTAL À PAYER TTC:</span>
                      <span>{formatCurrency(previewFacture.totalTTC)}</span>
                    </div>
                  </div>
                </div>

                {/* Stamp visual representation removed as requested */}
                <div className="flex justify-end items-end pt-8">
                  {/* Signatures representations */}
                  <div className="grid grid-cols-2 gap-8 w-80 text-center font-sans text-[10px]">
                    <div className="space-y-8">
                      <span className="font-semibold block border-b border-slate-300 pb-1">{settings?.directorTitle || "Le Directeur Général"}</span>
                      <strong className="text-primary italic block">{settings?.directorName || "Yannick Ndémbo"} <br/> {settings?.companyName || "Ndembo Kin Connect"}</strong>
                    </div>
                    <div className="space-y-8">
                      <span className="font-semibold block border-b border-slate-300 pb-1">La Direction Comptable</span>
                      <strong className="text-[#6f7881] italic block">[Signature Électronique]</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
