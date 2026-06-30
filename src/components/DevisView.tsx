/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRightLeft,
  Check,
  X,
  Printer,
  ChevronRight,
  Eye,
  FileCheck,
  Search,
  Percent
} from 'lucide-react';
import { Devis, DevisLineItem, Contact, DevisStatus, BusinessSettings } from '../types';
import { INITIAL_SETTINGS } from '../mockData';
import NdemboKinLogo from './NdemboKinLogo';

interface DevisViewProps {
  devisList: Devis[];
  contacts: Contact[];
  onAddDevis: (devis: Devis) => void;
  onUpdateStatus: (id: string, status: DevisStatus) => void;
  onConvertToFacture: (devis: Devis) => void;
  onConvertToProject: (devis: Devis) => void;
  tvaDefault: number;
  settings?: BusinessSettings;
}

export default function DevisView({
  devisList,
  contacts,
  onAddDevis,
  onUpdateStatus,
  onConvertToFacture,
  onConvertToProject,
  tvaDefault,
  settings
}: DevisViewProps) {
  // Navigation & filter states
  const [filterStatus, setFilterStatus] = useState<DevisStatus | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientId, setClientId] = useState('');
  const [dateExpiration, setDateExpiration] = useState('');
  const [notes, setNotes] = useState('Paiement requis à 50% à la signature du mandat. Devis valable 30 jours.');
  const [items, setItems] = useState<Omit<DevisLineItem, 'total'>[]>([
    { id: '1', serviceName: '', description: '', qty: 1, unitPrice: 0 }
  ]);
  const [tvaPercent, setTvaPercent] = useState(tvaDefault);

  // Preview state
  const [previewDevis, setPreviewDevis] = useState<Devis | null>(null);

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

  // Create Quote submission
  const handleCreateDevis = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedContact = contacts.find(c => c.id === clientId);
    if (!selectedContact) return;

    const lineItems: DevisLineItem[] = items.map(it => ({
      ...it,
      total: it.qty * it.unitPrice
    }));

    const newDevis: Devis = {
      id: "dev_" + Date.now(),
      number: `DEV-2026-00${devisList.length + 1}`,
      clientId: selectedContact.id,
      clientName: selectedContact.name,
      dateCreated: new Date().toISOString().split('T')[0],
      dateExpiration: dateExpiration || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: lineItems,
      status: 'En attente',
      tvaPercent: tvaPercent,
      totalHT,
      totalTVA,
      totalTTC,
      notes
    };

    onAddDevis(newDevis);
    setShowCreateModal(false);
    // Reset
    setClientId('');
    setDateExpiration('');
    setItems([{ id: '1', serviceName: '', description: '', qty: 1, unitPrice: 0 }]);
  };

  // PDF Print trigger logic
  const handlePrint = () => {
    window.print();
  };

  // Filter application
  const filteredDevis = devisList.filter(d => {
    const matchesStatus = filterStatus === 'Tous' || d.status === filterStatus;
    const matchesSearch = d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 md:space-y-8" id="devis_management_system">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#bec8d2]/70 p-4 rounded-xl shadow-xs print:hidden">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6f7881]" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
            placeholder="Rechercher devis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters and create trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter checks */}
          {(['Tous', 'En attente', 'Validé', 'Refusé', 'Converti'] as const).map((st) => (
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

          {/* Create trigger */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto sm:ml-2 bg-[#00628f] hover:bg-[#005177] text-white font-heading font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Nouveau Devis</span>
          </button>
        </div>
      </div>

      {/* Quotes Listing */}
      <div className="bg-white border border-[#bec8d2]/70 rounded-2xl overflow-hidden shadow-xs print:hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f9ff] border-b border-[#bec8d2]/70 text-xs font-mono font-bold text-[#6f7881]">
                <th className="p-4 uppercase tracking-wider">Numéro</th>
                <th className="p-4 uppercase tracking-wider">Date Emission</th>
                <th className="p-4 uppercase tracking-wider">Client Destinataire</th>
                <th className="p-4 uppercase tracking-wider text-right">Montant HT</th>
                <th className="p-4 uppercase tracking-wider text-right">Montant TTC</th>
                <th className="p-4 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 uppercase tracking-wider text-right">Actions Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDevis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6f7881] font-sans">
                    Aucun devis ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredDevis.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary">
                      {dev.number}
                    </td>
                    <td className="p-4 text-xs font-mono text-[#6f7881]">
                      {dev.dateCreated}
                    </td>
                    <td className="p-4 font-semibold text-on-surface">
                      {dev.clientName}
                    </td>
                    <td className="p-4 text-right font-mono font-medium">
                      {formatCurrency(dev.totalHT)}
                    </td>
                    <td className="p-4 text-right font-mono font-extrabold text-on-surface">
                      {formatCurrency(dev.totalTTC)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded inline-block text-[10px] font-mono font-extrabold border ${
                        dev.status === 'Validé' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        dev.status === 'En attente' ? 'bg-amber-50 text-[#725c00] border-amber-200' :
                        dev.status === 'Converti' ? 'bg-[#edf4ff] text-[#00628f] border-[#00628f]/30' :
                        'bg-red-50 text-[#ba0a0f] border-red-200'
                      }`}>
                        {dev.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-1.5">
                      {/* Visualizer Print/PDF trigger */}
                      <button
                        onClick={() => setPreviewDevis(dev)}
                        className="bg-slate-100 hover:bg-slate-200 text-[#3f4850] p-1.5 rounded transition-all cursor-pointer"
                        title="Prévisualiser officiel"
                      >
                        <Eye className="w-4 h-4 text-[#3f4850]" />
                      </button>

                      {/* Direct PDF Export button */}
                      <button
                        onClick={() => {
                          setPreviewDevis(dev);
                          setTimeout(() => {
                            window.print();
                          }, 150);
                        }}
                        className="bg-[#00628f]/10 hover:bg-[#00628f]/20 text-[#00628f] p-1.5 rounded transition-all cursor-pointer"
                        title="Exporter en PDF (A4)"
                        id={`export_pdf_btn_devis_${dev.id}`}
                      >
                        <Printer className="w-4 h-4 text-[#00628f]" />
                      </button>

                      {/* Conditionally reveal accept triggers if En attente */}
                      {dev.status === 'En attente' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(dev.id, 'Validé')}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-1.5 rounded transition-all"
                            title="Valider / Accepter le devis"
                          >
                            <Check className="w-4 h-4 text-emerald-800" />
                          </button>
                          <button
                            onClick={() => onUpdateStatus(dev.id, 'Refusé')}
                            className="bg-red-100 hover:bg-red-200 text-[#ba0a0f] p-1.5 rounded transition-all"
                            title="Refuser le devis"
                          >
                            <X className="w-4 h-4 text-[#ba0a0f]" />
                          </button>
                        </>
                      )}

                      {/* Quick conversions if Validé */}
                      {dev.status === 'Validé' && (
                        <div className="flex items-center gap-1 bg-[#f7f9ff] border border-[#bec8d2]/50 p-1 rounded-md">
                          <button
                            onClick={() => onConvertToFacture(dev)}
                            className="text-[10px] uppercase font-mono font-bold bg-[#00628f] hover:bg-[#005177] text-white px-2 py-1 rounded transition-all"
                            title="Convertir en Facture"
                          >
                            → Facture
                          </button>
                          <button
                            onClick={() => onConvertToProject(dev)}
                            className="text-[10px] uppercase font-mono font-bold bg-[#ba0a0f] hover:bg-[#97060a] text-white px-2 py-1 rounded transition-all"
                            title="Convertir en Projet technique"
                          >
                            → Projet
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
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
                <FileText className="w-6 h-6 text-primary" />
                <h3 className="font-heading font-extrabold text-xl text-on-surface">
                  Nouveau Devis Commercial
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#6f7881] hover:text-black font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateDevis} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Client drop-down selector */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Choisir le Client Destinataire</label>
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

                {/* Expiration Date */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Date d'Expiration</label>
                  <input
                    type="date"
                    value={dateExpiration}
                    onChange={(e) => setDateExpiration(e.target.value)}
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
                  <span className="text-xs font-mono font-bold uppercase text-on-surface">Détails des Prestations &amp; Budgets</span>
                  <button
                    type="button"
                    onClick={addItemLine}
                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    <span>Ajouter une ligne</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start bg-[#f7f9ff] p-3 rounded-lg border border-[#bec8d2]/30 relative group">
                      {/* Service inputs */}
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Nom de la prestation (ex: Management)"
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
                      {/* line sum total and trash */}
                      <div className="sm:col-span-1.5 flex items-center justify-between gap-1 col-span-4 text-xs font-mono font-bold text-right py-1">
                        <span>{formatCurrency(item.qty * item.unitPrice)}</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemLine(item.id)}
                            className="text-[#ba0a0f] hover:text-red-700 cursor-pointer"
                            title="Retirer cette ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-[#f7f9ff] border border-[#bec8d2]/70 p-4 rounded-xl flex flex-col items-end space-y-1.5 text-xs text-on-surface font-mono">
                <div>Total HT : <strong className="text-sm text-right font-bold inline-block w-32">{formatCurrency(totalHT)}</strong></div>
                <div>TVA ({tvaPercent}%) : <strong className="text-sm text-right font-bold inline-block w-32">{formatCurrency(totalTVA)}</strong></div>
                <div className="pt-2 border-t border-slate-200 mt-1 font-heading text-on-surface text-base font-extrabold flex justify-between items-center w-full">
                  <span className="font-mono text-xs uppercase font-extrabold text-[#6f7881]">Montant Total TTC (USD) :</span>
                  <span>{formatCurrency(totalTTC)}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Conditions particulières du Devis</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
                  rows={2}
                />
              </div>

              {/* Buttons */}
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
                  Générer mon devis d'offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW/PRINT MODAL */}
      {previewDevis && (
        <div className="fixed inset-0 bg-[#0c1d2b]/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 flex flex-col max-h-[90vh]">
            {/* Modal Controls header */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2 text-on-surface">
                <FileCheck className="w-5 h-5 text-primary" />
                <span className="font-sans font-bold text-sm">Visualisation du document d'offre officiel - {previewDevis.number}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-primary hover:bg-[#005177] text-white px-3.5 py-1.5 rounded text-xs font-bold font-heading flex items-center gap-1.5 transition-transform cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  Imprimer / Exporter PDF
                </button>
                <button
                  onClick={() => setPreviewDevis(null)}
                  className="bg-white hover:bg-slate-200 text-[#3f4850] px-3.5 py-1.5 rounded text-xs font-bold border border-[#bec8d2] cursor-pointer"
                >
                  Quitter
                </button>
              </div>
            </div>

            {/* Document body (Print optimized, doubles border structure style) */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar print:p-0 bg-white" id="printable_devis_document">
              <div className="border-[3px] border-double border-[#00628f] p-6 md:p-8 space-y-8 h-full rounded shadow-inner">
                {/* Header info sheet with watermark */}
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
                    <div className="inline-block bg-[#00628f]/10 text-[#00628f] font-heading font-extrabold text-sm px-3.5 py-1 rounded">
                      DEVIS COMMERCIAL
                    </div>
                    <p className="font-mono text-sm font-bold text-on-surface mt-1">Nº {previewDevis.number}</p>
                    <div className="font-mono text-xs text-[#6f7881] space-y-0.5">
                      <p>Date d'émission : {previewDevis.dateCreated}</p>
                      <p>Date de validité : {previewDevis.dateExpiration}</p>
                    </div>
                  </div>
                </div>

                {/* Sender vs Recipient */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#f7f9ff] border border-[#bec8d2]/40 p-4 rounded-lg">
                  <div>
                    <span className="font-mono text-[10px] tracking-wider text-[#6f7881] font-bold block uppercase mb-1">Émetteur du Document</span>
                    <strong className="font-heading text-sm text-primary block">Ndembo Kin Connect SARL</strong>
                    <span className="font-sans text-xs text-[#3f4850] block">Service de Gestion Athlètes &amp; Partenariats</span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] tracking-wider text-[#6f7881] font-bold block uppercase mb-1">Destinataire / Client</span>
                    <strong className="font-heading text-sm text-[#ba0a0f] block">{previewDevis.clientName}</strong>
                    <span className="font-sans text-xs text-[#3f4850] block">Client enregistré sous ID: {previewDevis.clientId}</span>
                  </div>
                </div>

                {/* Prestations Table */}
                <div className="space-y-2">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-[#00628f] text-white font-mono uppercase font-bold text-[10px]">
                        <th className="p-3">Prestation / Désignation</th>
                        <th className="p-3">Détail des Activités</th>
                        <th className="p-3 text-center">Qté</th>
                        <th className="p-3 text-right">P.U. (USD)</th>
                        <th className="p-3 text-right">Total HT (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewDevis.items.map((line, idx) => (
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

                {/* Money calculations box */}
                <div className="flex justify-between items-start gap-4 pt-4 border-t border-slate-200">
                  <div className="max-w-md">
                    <span className="font-mono text-[10px] tracking-wider text-[#6f7881] font-bold block uppercase mb-1">Mentions Légales &amp; Notes d'Actes</span>
                    <p className="text-[10px] text-[#3f4850] leading-relaxed italic">
                      {previewDevis.notes}
                    </p>
                    <p className="text-[9px] text-[#6f7881] mt-2">
                      Conformément à la législation fiscale congolaise de la Direction Générale des Impôts (DGI), le taux standard de TVA de {previewDevis.tvaPercent}% s'applique comme précisé sur l'assiette totale.
                    </p>
                  </div>

                  <div className="bg-[#f7f9ff] border border-[#bec8d2]/50 p-4 rounded-lg w-72 text-right font-mono space-y-1">
                    <div className="text-xs">Base Imposable Total HT : <strong className="font-bold">{formatCurrency(previewDevis.totalHT)}</strong></div>
                    <div className="text-xs">TVA applicable ({previewDevis.tvaPercent}%) : <strong className="font-bold">{formatCurrency(previewDevis.totalTVA)}</strong></div>
                    <div className="border-t border-slate-300 pt-2 text-sm font-heading font-extrabold text-[#ba0a0f] flex justify-between items-center">
                      <span className="font-mono text-[10px] text-left text-[#3f4850]">TOTAL TTC USD:</span>
                      <span>{formatCurrency(previewDevis.totalTTC)}</span>
                    </div>
                  </div>
                </div>

                {/* Stamps status watermark representation removed as requested */}
                <div className="flex justify-end items-end pt-12">
                  {/* Signatures representations */}
                  <div className="grid grid-cols-2 gap-8 w-80 text-center font-sans text-[10px]">
                    <div className="space-y-8">
                      <span className="font-semibold block border-b border-slate-300 pb-1">Pour {settings?.companyName || "Ndembo Kin Connect"}</span>
                      <strong className="text-primary italic block">{settings?.directorName || "Yannick Ndémbo"} <br/> {settings?.directorTitle || "Directeur Associé"}</strong>
                    </div>
                    <div className="space-y-8">
                      <span className="font-semibold block border-b border-slate-300 pb-1">Signature &amp; Bon pour accord</span>
                      <div className="text-[#6f7881] italic h-10 flex items-center justify-center">[Représentant Client]</div>
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
