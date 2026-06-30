/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users2, Plus, Search, Mail, Phone, MapPin, Award, Shield, 
  UserCheck, Star, Activity, PlusCircle, Sliders, Edit2, 
  Save, CheckCircle, X, ShieldAlert, Sparkles, Trophy
} from 'lucide-react';
import { Contact, ContactType, Project, ScoutMetrics } from '../types';

interface ContactsViewProps {
  contacts: Contact[];
  projects: Project[];
  onAddContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
}

export default function ContactsView({ contacts, projects, onAddContact, onUpdateContact }: ContactsViewProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const [filterType, setFilterType] = useState<ContactType | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // Creation modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ContactType>('Athlète');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  // Athlete-specific
  const [sport, setSport] = useState('Football');
  const [level, setLevel] = useState<'Débutant' | 'Intermédiaire' | 'Avancé' | 'Pro' | 'Elite'>('Pro');
  const [currentTeam, setCurrentTeam] = useState('');
  // Corporate-specific
  const [RC_SIRET, setRC_SIRET] = useState('');
  const [sector, setSector] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  // Editing state machine
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLevel, setEditLevel] = useState<'Débutant' | 'Intermédiaire' | 'Avancé' | 'Pro' | 'Elite' | 'Senior' | 'Junior'>('Pro');
  const [editSport, setEditSport] = useState('');
  const [editCurrentTeam, setEditCurrentTeam] = useState('');
  const [editVitesse, setEditVitesse] = useState(80);
  const [editTechnique, setEditTechnique] = useState(80);
  const [editPhysique, setEditPhysique] = useState(80);
  const [editTactique, setEditTactique] = useState(80);
  const [editMental, setEditMental] = useState(80);
  const [editRegularite, setEditRegularite] = useState(80);
  const [editSector, setEditSector] = useState('');
  const [editRC_SIRET, setEditRC_SIRET] = useState('');
  const [editBudgetRange, setEditBudgetRange] = useState('');

  // Selected contact for detail panel
  const [selectedContactId, setSelectedContactId] = useState<string | null>(contacts[0]?.id || null);

  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const selectedContactProjects = projects.filter(p => p.clientId === selectedContactId);

  const startEditing = () => {
    if (!selectedContact) return;
    setIsEditing(true);
    setEditName(selectedContact.name || '');
    setEditEmail(selectedContact.email || '');
    setEditPhone(selectedContact.phone || '');
    setEditAddress(selectedContact.address || '');
    setEditNotes(selectedContact.notes || '');
    setEditSport(selectedContact.sport || 'Football');
    setEditLevel((selectedContact.level as any) || 'Pro');
    setEditCurrentTeam(selectedContact.currentTeam || '');
    setEditSector(selectedContact.sector || '');
    setEditRC_SIRET(selectedContact.RC_SIRET || '');
    setEditBudgetRange(selectedContact.budgetRange || '');

    const metrics = selectedContact.scoutMetrics || {
      vitesse: 80,
      technique: 80,
      physique: 80,
      tactique: 80,
      mental: 80,
      regularite: 80
    };
    setEditVitesse(metrics.vitesse);
    setEditTechnique(metrics.technique);
    setEditPhysique(metrics.physique);
    setEditTactique(metrics.tactique);
    setEditMental(metrics.mental);
    setEditRegularite(metrics.regularite);
  };

  const selectContact = (id: string) => {
    setSelectedContactId(id);
    setIsEditing(false);
  };

  const sanitizeString = (str: string) => {
    return str.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !editName) return;

    const updated: Contact = {
      ...selectedContact,
      name: sanitizeString(editName),
      email: sanitizeString(editEmail),
      phone: sanitizeString(editPhone),
      address: sanitizeString(editAddress),
      notes: sanitizeString(editNotes),
      sport: selectedContact.type === 'Athlète' ? sanitizeString(editSport) : undefined,
      level: selectedContact.type === 'Athlète' ? editLevel : undefined,
      currentTeam: selectedContact.type === 'Athlète' ? sanitizeString(editCurrentTeam) : undefined,
      RC_SIRET: (selectedContact.type === 'Entreprise' || selectedContact.type === 'Sponsor') ? sanitizeString(editRC_SIRET) : undefined,
      sector: (selectedContact.type === 'Entreprise' || selectedContact.type === 'Sponsor' || selectedContact.type === 'Agence partenaire') ? sanitizeString(editSector) : undefined,
      budgetRange: selectedContact.type === 'Sponsor' ? sanitizeString(editBudgetRange) : undefined,
      scoutMetrics: selectedContact.type === 'Athlète' ? {
        vitesse: Math.min(100, Math.max(0, Number(editVitesse))),
        technique: Math.min(100, Math.max(0, Number(editTechnique))),
        physique: Math.min(100, Math.max(0, Number(editPhysique))),
        tactique: Math.min(100, Math.max(0, Number(editTactique))),
        mental: Math.min(100, Math.max(0, Number(editMental))),
        regularite: Math.min(100, Math.max(0, Number(editRegularite)))
      } : undefined
    };

    onUpdateContact(updated);
    setIsEditing(false);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Use sanitization for fields
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeString(email);
    const sanitizedPhone = sanitizeString(phone);
    const sanitizedAddress = sanitizeString(address);
    const sanitizedNotes = sanitizeString(notes);

    const newContact: Contact = {
      id: "cnt_" + Date.now(),
      name: sanitizedName,
      type,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      address: sanitizedAddress,
      notes: sanitizedNotes,
      sport: type === 'Athlète' ? sport : undefined,
      level: type === 'Athlète' ? level : undefined,
      currentTeam: type === 'Athlète' ? currentTeam : undefined,
      RC_SIRET: type === 'Entreprise' || type === 'Sponsor' ? RC_SIRET : undefined,
      sector: type === 'Entreprise' || type === 'Sponsor' || type === 'Agence partenaire' ? sector : undefined,
      budgetRange: type === 'Sponsor' ? budgetRange : undefined,
      dateCreated: new Date().toISOString().split('T')[0],
      scoutMetrics: type === 'Athlète' ? {
        vitesse: 80,
        technique: 80,
        physique: 80,
        tactique: 80,
        mental: 80,
        regularite: 80
      } : undefined
    };

    onAddContact(newContact);
    setShowCreateModal(false);
    setSelectedContactId(newContact.id);
    setIsEditing(false);
    
    // Reset inputs
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
    setCurrentTeam('');
    setRC_SIRET('');
    setSector('');
  };

  const filteredContacts = contacts.filter(c => {
    const matchesType = filterType === 'Tous' || c.type === filterType;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Scouting calculation elements
  const calculateOverallRating = (metrics?: ScoutMetrics) => {
    if (!metrics) return 80;
    const sum = metrics.vitesse + metrics.technique + metrics.physique + metrics.tactique + metrics.mental + metrics.regularite;
    return Math.round(sum / 6);
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 90) return 'text-[#ba0a0f] bg-red-100 border-red-300';
    if (rating >= 80) return 'text-[#725c00] bg-yellow-100 border-yellow-300';
    return 'text-[#00628f] bg-[#edf4ff] border-[#00628f]/30';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-250" id="crm_contacts_view">
      {/* LEFT COLUMN: CONTACT CARDS LIST STACK (col-span-5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-[#bec8d2]/70 p-4 rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-heading font-extrabold text-sm text-[#0c1d2b] uppercase tracking-tight">Registre CRM</span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#00628f] hover:bg-[#005177] text-white p-1.5 rounded transition-transform hover:scale-105 cursor-pointer flex items-center justify-center"
              title="Ajouter un contact"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f7881]" />
            <input
              type="text"
              placeholder="Chercher athlète, sponsor..."
              className="w-full pl-9 pr-3 py-1.5 border border-[#bec8d2] focus:border-[#00628f] focus:ring-1 focus:ring-[#00628f] rounded-lg text-xs bg-[#f7f9ff]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type filters tabs */}
          <div className="flex flex-wrap gap-1">
            {(['Tous', 'Athlète', 'Entreprise', 'Sponsor', 'Agence partenaire'] as const).map(tp => (
              <button
                key={tp}
                onClick={() => setFilterType(tp as any)}
                className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md border transition-all cursor-pointer ${
                  filterType === tp ? 'bg-[#00628f] text-white border-[#00628f]' : 'bg-[#f7f9ff] text-slate-600 border-[#bec8d2]/50 hover:bg-[#edf4ff]'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>

        {/* List scroll panel */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-xs text-[#6f7881] py-8 bg-white border border-[#bec8d2]/40 rounded-lg">Aucun contact trouvé</p>
          ) : (
            filteredContacts.map(c => {
              const isSelected = selectedContactId === c.id;
              const rating = c.type === 'Athlète' ? calculateOverallRating(c.scoutMetrics) : null;
              
              return (
                <div
                  key={c.id}
                  onClick={() => selectContact(c.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center text-left ${
                    isSelected
                      ? 'bg-white border-[#00628f] shadow-md ring-1 ring-[#00628f]'
                      : 'bg-white border-[#bec8d2]/70 hover:border-[#00628f]/50'
                  }`}
                >
                  <div className="space-y-1 max-w-[70%]">
                    <span className="text-[9px] font-mono font-bold uppercase text-[#6f7881]">{c.type}</span>
                    <h4 className="font-heading font-extrabold text-sm text-[#0c1d2b] truncate">{c.name}</h4>
                    <span className="text-xs text-[#6f7881] block truncate">{c.email}</span>
                  </div>

                  {c.type === 'Athlète' ? (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="bg-[#edf4ff] text-[#00628f] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#00628f]/20 uppercase">
                        {c.sport || 'Sport'}
                      </span>
                      {rating !== null && (
                        <span className="text-[10px] font-mono font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          ★ {rating}/100
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50 text-[#725c00] text-[10px] font-mono font-bold px-2 py-1 rounded border border-amber-200 uppercase shrink-0">
                      {c.sector || 'Sponsor'}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CONTACT DETAILED PRESENTATION VIEW or EDITOR (col-span-12 lg:col-span-7) */}
      <div className="lg:col-span-7">
        {selectedContact ? (
          isEditing ? (
            /* EDITING CONTAINER WRAPPER */
            <form onSubmit={handleSaveEdit} className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#00628f]" />
                  <h3 className="font-heading font-extrabold text-base text-[#0c1d2b]">
                    Modifier la fiche : {selectedContact.name}
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="p-1 text-slate-400 hover:text-black rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* General inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#0c1d2b] mb-1.5">Nom Complet / Raison Sociale</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 border border-[#bec8d2] rounded-lg text-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#0c1d2b] mb-1.5">Email professionnel</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2 border border-[#bec8d2] rounded-lg text-sm bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#0c1d2b] mb-1.5">Numéro Tél</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2 border border-[#bec8d2] rounded-lg text-sm bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#0c1d2b] mb-1.5">Adresse physique</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full p-2 border border-[#bec8d2] rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              {/* Conditional parameters based on entity type */}
              {selectedContact.type === 'Athlète' ? (
                <div className="space-y-4 bg-[#f7f9ff] p-4 rounded-xl border border-[#bec8d2]/30">
                  <span className="font-mono text-[10px] text-slate-500 font-bold block uppercase border-b border-dashed border-slate-200 pb-1">Scout d'Athlète Disciplines & Niveau</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">Sport Discipline</label>
                      <input
                        type="text"
                        value={editSport}
                        onChange={(e) => setEditSport(e.target.value)}
                        className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">Niveau détécté</label>
                      <select
                        value={editLevel}
                        onChange={(e) => setEditLevel(e.target.value as any)}
                        className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                      >
                        <option value="Débutant">Débutant (Espoir)</option>
                        <option value="Intermédiaire">Intermédiaire (Cadet)</option>
                        <option value="Avancé">Avancé (Linafoot local)</option>
                        <option value="Pro">Professionnel (Elite locale)</option>
                        <option value="Elite">Elite Internationale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-600 mb-1">Club Actuel</label>
                      <input
                        type="text"
                        value={editCurrentTeam}
                        onChange={(e) => setEditCurrentTeam(e.target.value)}
                        className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Scout Evaluation Performance Scores */}
                  <div className="space-y-3.5 pt-2 border-t border-slate-200">
                    <span className="font-mono text-[10px] text-[#00628f] font-bold block uppercase">Observations Statistiques de Compétences (Scout Rating)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Vitesse & Vélocité</span>
                          <span className="font-mono font-bold">{editVitesse}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={editVitesse}
                          onChange={(e) => setEditVitesse(Number(e.target.value))}
                          className="w-full accent-[#00628f]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Technique & Dribble</span>
                          <span className="font-mono font-bold">{editTechnique}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={editTechnique}
                          onChange={(e) => setEditTechnique(Number(e.target.value))}
                          className="w-full accent-[#00628f]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Physique & Endurance</span>
                          <span className="font-mono font-bold">{editPhysique}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={editPhysique}
                          onChange={(e) => setEditPhysique(Number(e.target.value))}
                          className="w-full accent-[#00628f]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Tactique & Placement</span>
                          <span className="font-mono font-bold">{editTactique}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={editTactique}
                          onChange={(e) => setEditTactique(Number(e.target.value))}
                          className="w-full accent-[#00628f]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Mental & Volonté</span>
                          <span className="font-mono font-bold">{editMental}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={editMental}
                          onChange={(e) => setEditMental(Number(e.target.value))}
                          className="w-full accent-[#00628f]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-700">Régularité & Discipline</span>
                          <span className="font-mono font-bold">{editRegularite}%</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={editRegularite}
                          onChange={(e) => setEditRegularite(Number(e.target.value))}
                          className="w-full accent-[#00628f]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f7f9ff] p-4 rounded-xl border border-[#bec8d2]/30">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Secteur Marché</label>
                    <input
                      type="text"
                      value={editSector}
                      onChange={(e) => setEditSector(e.target.value)}
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Nº Registre CD/RCCM</label>
                    <input
                      type="text"
                      value={editRC_SIRET}
                      onChange={(e) => setEditRC_SIRET(e.target.value)}
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                    />
                  </div>
                  {selectedContact.type === 'Sponsor' && (
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">Budget Sponsoring</label>
                      <input
                        type="text"
                        value={editBudgetRange}
                        onChange={(e) => setEditBudgetRange(e.target.value)}
                        className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Notes block */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#0c1d2b] mb-1.5">Notes administratives d'évaluation</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-white"
                  rows={3}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-[#bec8d2] text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00628f] hover:bg-[#005177] text-white text-xs font-heading font-extrabold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>Enregistrer Modifications</span>
                </button>
              </div>
            </form>
          ) : (
            /* STANDARD READ PROFILE VIEW */
            <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
              {/* Header Profil Card */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-5">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#00628f] text-white flex items-center justify-center font-heading text-lg font-extrabold shadow-sm shrink-0 capitalize">
                    {selectedContact.name.substring(0, 2)}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-[#00628f] uppercase bg-[#edf4ff] px-2 py-0.5 rounded border border-[#00628f]/20">
                      {selectedContact.type}
                    </span>
                    <h3 className="font-heading font-extrabold text-[#0c1d2b] text-lg md:text-xl">
                      {selectedContact.name}
                    </h3>
                    <span className="text-xs text-[#6f7881] block">Inscrit le {selectedContact.dateCreated}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={startEditing}
                    className="bg-white border border-[#bec8d2] text-slate-700 hover:bg-[#f7f9ff] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Modifier les informations"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Modifier</span>
                  </button>
                  
                  {selectedContact.type === 'Athlète' && (
                    <span className="bg-amber-50 text-[#725c00] text-xs font-mono font-bold px-3 py-1 border border-[#725c00]/30 rounded-full flex items-center gap-1 shrink-0">
                      <Star className="w-3.5 h-3.5 text-[#725c00] fill-[#725c00]" />
                      <span>{selectedContact.level?.toUpperCase() || 'PRO'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Profile specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono font-bold uppercase text-[#0c1d2b] tracking-wider mb-1 border-b border-slate-100 pb-1 flex items-center gap-1"><Users2 className="w-3.5 h-3.5 text-[#6f7881]"/> Coordonnées de Contact</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#6f7881] shrink-0" />
                      <span>{selectedContact.email || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#6f7881] shrink-0" />
                      <span>{selectedContact.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#6f7881] shrink-0" />
                      <span>{selectedContact.address || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>

                {/* Specific features depend on Type */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-mono font-bold uppercase text-[#0c1d2b] tracking-wider mb-1 border-b border-slate-100 pb-1 flex items-center gap-1"><Award className="w-3.5 h-3.5 text-[#6f7881]"/> Fiche Professionnelle</h4>
                  {selectedContact.type === 'Athlète' ? (
                    <div className="space-y-2 text-xs font-sans">
                      <p><strong>Discipline :</strong> {selectedContact.sport || 'Football'}</p>
                      <p><strong>Équipe d'Attache :</strong> {selectedContact.currentTeam || 'Fiche libre CD'}</p>
                      <p><strong>Niveau de détection :</strong> {selectedContact.level || 'Pro'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-sans">
                      <p><strong>Secteur métier :</strong> {selectedContact.sector || 'Sponsoring'}</p>
                      <p><strong>CD/RCCM Identifiant :</strong> {selectedContact.RC_SIRET || 'CD/KIN/RCCM/'}</p>
                      {selectedContact.budgetRange && <p><strong>Budget contractuel :</strong> {selectedContact.budgetRange}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* ATHLETE PERFORMANCE STATS RADAR DISPLAY */}
              {selectedContact.type === 'Athlète' && (
                <div className="bg-[#f7f9ff] border border-[#bec8d2]/30 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4.5 h-4.5 text-[#00628f]" />
                      <span className="font-heading font-extrabold text-sm text-[#0c1d2b] uppercase tracking-tight">Compétences Scout de l'Athlète</span>
                    </div>
                    {/* Computed aggregate rating badge */}
                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1 ${getRatingBadgeColor(calculateOverallRating(selectedContact.scoutMetrics))}`}>
                      <Trophy className="w-3.5 h-3.5 text-[#725c00] fill-amber-300" />
                      <span>Note Générale : {calculateOverallRating(selectedContact.scoutMetrics)}/100</span>
                    </div>
                  </div>

                  {/* Rating meters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Speed meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Vitesse & Explosivité</span>
                        <span className="font-mono font-bold text-[#0c1d2b]">{selectedContact.scoutMetrics?.vitesse || 80}%</span>
                      </div>
                      <div className="w-full bg-[#bec8d2]/30 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#00628f] to-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${selectedContact.scoutMetrics?.vitesse ?? 80}%` }}></div>
                      </div>
                    </div>

                    {/* Technique meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Technique & Dribble</span>
                        <span className="font-mono font-bold text-[#0c1d2b]">{selectedContact.scoutMetrics?.technique || 80}%</span>
                      </div>
                      <div className="w-full bg-[#bec8d2]/30 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#00628f] to-[#725c00] h-full rounded-full transition-all duration-500" style={{ width: `${selectedContact.scoutMetrics?.technique ?? 80}%` }}></div>
                      </div>
                    </div>

                    {/* Physique meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Endurance & Force</span>
                        <span className="font-mono font-bold text-[#0c1d2b]">{selectedContact.scoutMetrics?.physique || 80}%</span>
                      </div>
                      <div className="w-full bg-[#bec8d2]/30 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#00628f] to-green-600 h-full rounded-full transition-all duration-500" style={{ width: `${selectedContact.scoutMetrics?.physique ?? 80}%` }}></div>
                      </div>
                    </div>

                    {/* Tactique meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Placement & Vision tactique</span>
                        <span className="font-mono font-bold text-[#0c1d2b]">{selectedContact.scoutMetrics?.tactique || 80}%</span>
                      </div>
                      <div className="w-full bg-[#bec8d2]/30 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#00628f] to-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${selectedContact.scoutMetrics?.tactique ?? 80}%` }}></div>
                      </div>
                    </div>

                    {/* Mental meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Mental & Résilience</span>
                        <span className="font-mono font-bold text-[#0c1d2b]">{selectedContact.scoutMetrics?.mental || 80}%</span>
                      </div>
                      <div className="w-full bg-[#bec8d2]/30 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#00628f] to-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${selectedContact.scoutMetrics?.mental ?? 80}%` }}></div>
                      </div>
                    </div>

                    {/* Consistency meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Régularité & Rigueur</span>
                        <span className="font-mono font-bold text-[#0c1d2b]">{selectedContact.scoutMetrics?.regularite || 80}%</span>
                      </div>
                      <div className="w-full bg-[#bec8d2]/30 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#00628f] to-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${selectedContact.scoutMetrics?.regularite ?? 80}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scouting Notes / Bio block */}
              <div className="bg-[#f7f9ff] border border-[#bec8d2]/40 p-4 rounded-xl space-y-2">
                <span className="font-mono text-[10px] tracking-wider text-[#6f7881] font-bold block uppercase border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Observations & Notes d'Évaluation</span>
                </span>
                <p className="text-xs text-[#0c1d2b] leading-relaxed italic text-justify whitespace-pre-wrap">
                  {selectedContact.notes || 'Aucune note de détection enregistrée. Profil validé conforme aux standards sportifs.'}
                </p>
              </div>

              {/* Associated active projects lists representation */}
              <div className="space-y-3.5 pt-2">
                <span className="font-mono text-[11px] text-[#0c1d2b] font-bold block uppercase pb-1.5 border-b border-slate-100">Dossiers d'affaires actifs ({selectedContactProjects.length})</span>
                {selectedContactProjects.length === 0 ? (
                  <p className="text-xs text-[#6f7881] italic">Aucun projet contractuel actif n'est initié pour ce contact.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedContactProjects.map(prj => (
                      <div key={prj.id} className="p-3 bg-white border border-[#bec8d2]/50 hover:border-[#00628f]/50 rounded-lg flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <strong className="text-on-surface font-semibold">{prj.name}</strong>
                          <span className="text-[10px] text-[#6f7881] block">Budget total: {formatCurrency(prj.budget)}</span>
                        </div>
                        <span className="bg-[#edf4ff] text-[#00628f] text-[10px] font-mono px-2 py-0.5 rounded border border-[#00628f]/20 uppercase">
                          {prj.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-12 text-center text-[#6f7881] shadow-xs">
            Sélectionnez un contact dans la colonne de gauche afin d'éditer sa fiche d'observation et de lister ses mandats d'investissements professionnels.
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#0c1d2b]/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#bec8d2] shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Users2 className="w-6 h-6 text-[#00628f]" />
                <h3 className="font-heading font-extrabold text-xl text-[#0c1d2b]">
                  Ajouter un Contact au Registre CRM
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#6f7881] hover:text-black font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Nom Complet / Raison Sociale</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean-Luc Mukoko"
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Type d'entité</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ContactType)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  >
                    <option value="Athlète">Athlète Mandant d'Élite</option>
                    <option value="Entreprise">Entreprise / Particulier</option>
                    <option value="Sponsor">Sponsor principal (Sponsor)</option>
                    <option value="Agence partenaire">Agence partenaire (Institutionnel)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Email (requis)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@ndembo.kin"
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Numéro Tél (requis)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+243 81..."
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  />
                </div>
              </div>

              {type === 'Athlète' ? (
                /* Athlete Specific Options */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f7f9ff] p-4 rounded-xl border border-[#bec8d2]/30">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-1.5">Sport Discipline</label>
                    <input
                      type="text"
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      placeholder="Football"
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-1.5">Niveau détection</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                    >
                      <option value="Débutant">Débutant (Espoir)</option>
                      <option value="Intermédiaire">Intermédiaire (Cadet)</option>
                      <option value="Avancé">Avancé (Linafoot local)</option>
                      <option value="Pro">Professionnel (A)</option>
                      <option value="Elite">Elite Internationale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-1.5">Club Actuel</label>
                    <input
                      type="text"
                      value={currentTeam}
                      onChange={(e) => setCurrentTeam(e.target.value)}
                      placeholder="TP Mazembe"
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                    />
                  </div>
                </div>
              ) : (
                /* Corporate options */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f7f9ff] p-4 rounded-xl border border-[#bec8d2]/30">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-1.5">Secteur Marché</label>
                    <input
                      type="text"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="Télécom, Mines, Matériel"
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-1.5">Nº Registre CD/RCCM</label>
                    <input
                      type="text"
                      value={RC_SIRET}
                      onChange={(e) => setRC_SIRET(e.target.value)}
                      placeholder="CD/KIN/RCCM/14-B..."
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-1.5">Marge Sponsoring</label>
                    <input
                      type="text"
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      placeholder="10K$ - 50K$"
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Adresse de Résidence</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Avenue Gombe, Kinshasa"
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#0c1d2b] mb-2">Notes administratives d'évaluation</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Spécifications physiques, vitesse, contacts, observations d'image publique..."
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#bec8d2] text-[#3f4850] text-sm font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00628f] hover:bg-[#005177] text-white text-sm font-heading font-extrabold rounded-lg shadow-sm cursor-pointer"
                >
                  Valider et Enregistrer Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
