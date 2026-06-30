/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, Wifi, QrCode, Award, Shield, Plus, Search, 
  Users2, CheckCircle, RefreshCw, TrendingUp, Sparkles, Trophy, 
  Pocket, Zap, HeartHandshake, Eye, MapPin, Contact as ContactIcon
} from 'lucide-react';
import { Contact as CrmContact, NfcCard, FinanceTransaction } from '../types';
import NdemboKinLogo from './NdemboKinLogo';

interface CardsViewProps {
  contacts: CrmContact[];
  cards: NfcCard[];
  onIssueCard: (card: NfcCard, transaction: FinanceTransaction) => void;
  onAddContact?: (contact: CrmContact) => void;
  canIssueCards?: boolean;
}

export default function CardsView({ contacts, cards, onIssueCard, onAddContact, canIssueCards = true }: CardsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [cardStatus, setCardStatus] = useState<'Active' | 'En attente'>('Active');
  
  // States for creating a contact on the fly
  const [isCreatingNewContact, setIsCreatingNewContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactType, setNewContactType] = useState<string>('Athlète');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');

  // Scanner states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner'>('dashboard');
  const [scanningCardId, setScanningCardId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<NfcCard | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Active card preview state
  const [previewCardId, setPreviewCardId] = useState<string | null>(cards[0]?.id || null);
  const activePreviewCard = cards.find(c => c.id === previewCardId) || cards[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // crisp high pitched beep
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (err) {
      console.log("Audio play blocked or not supported by container sandbox");
    }
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canIssueCards) {
      alert("Droits Restreints : Votre profil de rôle actuel ne vous permet pas d'émettre des cartes NFC.");
      return;
    }

    let matchedContact: CrmContact | undefined = undefined;

    if (isCreatingNewContact) {
      if (!newContactName) return;
      const newId = `contact_${Date.now()}`;
      const newlyCreated: CrmContact = {
        id: newId,
        name: newContactName,
        type: newContactType as any,
        email: newContactEmail || `${newContactName.toLowerCase().replace(/\s+/g, '.')}@ndembokin.com`,
        phone: newContactPhone || 'N/A',
        address: newContactAddress || 'Kinshasa, Gombe',
        dateCreated: new Date().toISOString().split('T')[0]
      };
      
      if (onAddContact) {
        onAddContact(newlyCreated);
      }
      matchedContact = newlyCreated;
    } else {
      if (!selectedContactId) return;
      matchedContact = contacts.find(c => c.id === selectedContactId);
    }

    if (!matchedContact) return;

    // Generate random card UID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cardUid = `NK-NFC-${randomSuffix}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const newCard: NfcCard = {
      id: `card_${Date.now()}`,
      cardUid,
      contactId: matchedContact.id,
      contactName: matchedContact.name,
      dateIssued: dateStr,
      status: cardStatus,
      pricePaid: 100
    };

    // Accounting dynamic double ledger log
    const newTx: FinanceTransaction = {
      id: `tx_nfc_${Date.now()}`,
      date: dateStr,
      type: 'Recette',
      amount: 100,
      category: 'Contract',
      description: `Achat d'adhésion Elite Club - Carte NFC unique #${cardUid}`,
      clientName: matchedContact.name
    };

    onIssueCard(newCard, newTx);
    setPreviewCardId(newCard.id);
    setShowIssueModal(false);
    
    // Reset form states
    setSelectedContactId('');
    setIsCreatingNewContact(false);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactAddress('');
    
    playBeep();
  };

  // Simulate NFC TAP scanning action
  const handleSimulateScan = (cardId: string) => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult(null);
    setScanSuccess(false);
    setScanningCardId(cardId);

    setTimeout(() => {
      const foundCard = cards.find(c => c.id === cardId);
      setIsScanning(false);
      if (foundCard) {
        setScanResult(foundCard);
        setScanSuccess(true);
        playBeep();
      }
    }, 1200);
  };

  const filteredCards = cards.filter(c => {
    return c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.cardUid.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate cumulative NFC financial sales revenue
  const totalNfcSalesRevenue = cards.reduce((sum, c) => sum + c.pricePaid, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="nfc_cards_module">
      
      {/* HEADER SECTION METADATA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0c1d2b] to-[#16354f] p-6 rounded-2xl border border-[#6f7881]/30 text-white shadow-lg">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 text-xs font-mono rounded-full border border-amber-500/20 uppercase font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Statut de Membre privilégie
          </span>
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight italic">
            Elite Club <span className="text-[#ffe07f]">Ndembo Kin NFC</span>
          </h2>
          <p className="text-slate-300 text-xs font-sans max-w-xl leading-relaxed">
            Votre badge premium exclusif d'appartenance au cercle d'excellence sportive congolaise. Chaque carte est un laissez-passer physique avec une puce NFC intégrée sécurisée, vendue à $100 et connectée directement au grand livre.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-white/5 border border-white/10 p-4 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[#ffe07f] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Recettes NFC Générées</span>
            <span className="font-mono text-xl font-extrabold text-[#ffe07f]">{formatCurrency(totalNfcSalesRevenue)}</span>
            <span className="text-[10px] text-slate-400 block font-sans italic">{cards.length} cartes de membre actives</span>
          </div>
        </div>
      </div>

      {/* MODULE SWITCH TABS */}
      <div className="flex border-b border-slate-200 gap-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 font-heading font-extrabold text-sm transition-all relative ${
            activeTab === 'dashboard' 
              ? 'text-[#00628f] border-b-2 border-[#00628f]' 
              : 'text-[#6f7881] hover:text-[#0c1d2b]'
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Gestion des Cartes &amp; Adhésions</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-4 py-2.5 font-heading font-extrabold text-sm transition-all relative ${
            activeTab === 'scanner' 
              ? 'text-[#00628f] border-b-2 border-[#00628f]' 
              : 'text-[#6f7881] hover:text-[#0c1d2b]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>Simulateur de Lecteur NFC Physique</span>
          </div>
        </button>
      </div>

      {/* MAIN LAYOUT */}
      {activeTab === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: LIVE PHYSICAL CARD RENDER PREVIEW (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-heading font-extrabold text-sm uppercase text-[#0c1d2b] tracking-wider">Aperçu de la Carte NFC Physique</h3>
            
            {activePreviewCard ? (
              <div className="space-y-4">
                {/* INTERACTIVE SHINY PREMIUM CARD */}
                <div className="relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-[#0c1d2b] via-[#10273a] to-[#ba0a0f]/20 p-6 text-white shadow-2xl border border-amber-400/30 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  
                  {/* Subtle radial sheen lighting overlay */}
                  <div className="absolute -inset-20 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[120%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                  
                  {/* Decorative faint patterns */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#ba0a0f]/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="h-full flex flex-col justify-between relative z-10">
                    
                    {/* TOP LOGO AND NFC CHIP */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <NdemboKinLogo size="sm" showText={false} />
                        <div>
                          <h4 className="font-heading font-black text-xs leading-none tracking-tight text-[#edf4ff]">NDEMBO<span className="text-[#ffe07f]">KIN</span></h4>
                          <span className="text-[6px] font-mono tracking-widest text-[#6f7881] block uppercase">Elite Club</span>
                        </div>
                      </div>

                      {/* Shiny golden NFC contact chip */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-5 rounded-md bg-gradient-to-r from-[#ffe07f] via-yellow-200 to-amber-500 border border-yellow-300 shadow-sm relative overflow-hidden shrink-0">
                          <div className="absolute inset-0 bg-black/10 flex flex-wrap gap-1 p-0.5">
                            <div className="border-r border-b border-white/20 w-1/3 h-1/2"></div>
                            <div className="border-r border-b border-white/20 w-1/3 h-1/2"></div>
                            <div className="border-b border-white/20 w-1/3 h-1/2"></div>
                            <div className="border-r border-white/20 w-1/3 h-1/2"></div>
                            <div className="border-r border-white/20 w-1/3 h-1/2"></div>
                          </div>
                        </div>
                        <Wifi className="w-4 h-4 text-amber-300 animate-pulse" />
                      </div>
                    </div>

                    {/* MID SECTION: METALLIC SEAL */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full border border-[#ffe07f]/50 flex items-center justify-center bg-white/5">
                        <Trophy className="w-4 h-4 text-[#ffe07f]" />
                      </div>
                      <div>
                        <span className="text-[7px] font-mono text-slate-400 block uppercase tracking-widest">Type d'Adhésion</span>
                        <span className="text-xs font-heading font-extrabold uppercase text-[#ffe07f] tracking-tight">Elite Club Member</span>
                      </div>
                    </div>

                    {/* BOTTOM PANEL: UNIQUE DETAILS */}
                    <div className="flex justify-between items-end border-t border-white/10 pt-3">
                      <div className="space-y-0.5">
                        <span className="text-[6px] font-mono text-slate-400 block uppercase tracking-widest font-bold">Titulaire autorisé</span>
                        <h5 className="font-heading font-black text-xs uppercase tracking-wide text-slate-100">{activePreviewCard.contactName}</h5>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[6px] font-mono text-slate-400 block uppercase tracking-widest font-bold">UID Unique NFC</span>
                        <span className="font-mono text-xs font-black text-[#ffe07f]">{activePreviewCard.cardUid}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ADVANTAGES LIST CONTAINER */}
                <div className="bg-white border border-[#bec8d2]/70 rounded-xl p-5 space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Award className="w-4.5 h-4.5 text-[#00628f]" />
                    <span className="font-heading font-extrabold text-xs text-[#0c1d2b] uppercase tracking-tight">
                      Avantages Inclus dans le Statut
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#ba0a0f] shrink-0 mt-0.5" />
                      <span className="text-slate-700"><strong>Accès VIP :</strong> Entrée prioritaire à tous les événements de détection &amp; conférences de Ndembo Kin.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#ba0a0f] shrink-0 mt-0.5" />
                      <span className="text-slate-700"><strong>Réductions Partenaires :</strong> Prix réduits chez les sponsors sportifs et de logistique congolais.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#ba0a0f] shrink-0 mt-0.5" />
                      <span className="text-slate-700"><strong>Conciergerie Dédiée 24/7 :</strong> Assistance administrative complète pour les visas et booking d'essais d'athlètes.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#ba0a0f] shrink-0 mt-0.5" />
                      <span className="text-slate-700"><strong>Networking Elite :</strong> Invitation au réseau d'affaires des directeurs de clubs congolais et étrangers.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#ba0a0f] shrink-0 mt-0.5" />
                      <span className="text-slate-700"><strong>Matchs &amp; Galas :</strong> Invitations prioritaires aux tables VIP des galas annuels de bienfaisance.</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-[#bec8d2] rounded-2xl p-12 text-center text-slate-500 text-xs bg-[#f7f9ff]">
                Aucune carte de membre n'est actuellement sélectionnée pour la prévisualisation.
              </div>
            )}
          </div>

          {/* RIGHT: REGISTERED MEMBER CARDS DIRECTORY TABLE (col-span-7) */}
          <div className="lg:col-span-7 bg-white border border-[#bec8d2]/70 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-[#00628f] text-base">Membres Privilégiés Enregistrés</h3>
                <p className="text-xs text-[#6f7881]">Listing des cartes NFC de membre actif émises</p>
              </div>

              <button
                onClick={() => {
                  if (!canIssueCards) {
                    alert("Action Restreinte : Votre profil de rôle actuel ne possède pas l'habilitation requise pour émettre des cartes NFC.");
                  } else {
                    setShowIssueModal(true);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors ${
                  canIssueCards 
                    ? 'bg-[#00628f] hover:bg-[#005177] text-white' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {canIssueCards ? <Plus className="w-4.5 h-4.5" /> : <Shield className="w-4 h-4 text-slate-400" />}
                <span>Émettre Carte NFC ($100)</span>
              </button>
            </div>

            {/* Filter and search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f7881]" />
              <input
                type="text"
                placeholder="Rechercher par titulaire ou UID..."
                className="w-full pl-9 pr-3 py-1.5 border border-[#bec8d2] focus:border-[#00628f] rounded-lg text-xs bg-[#f7f9ff]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Main Cards directory table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f9ff] border-b border-[#bec8d2]/50 font-mono text-[#6f7881] font-bold">
                    <th className="p-3">UID unique</th>
                    <th className="p-3">Titulaire Membre</th>
                    <th className="p-3">Date d'émission</th>
                    <th className="p-3">Frais d'Adhésion</th>
                    <th className="p-3">Statut NFC</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#6f7881] italic">
                        Aucune carte NFC n'a été émise sous ces critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredCards.map(c => {
                      const isCurrentlyPreviewed = previewCardId === c.id;
                      return (
                        <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${isCurrentlyPreviewed ? 'bg-[#edf4ff]' : ''}`}>
                          <td className="p-3 font-mono font-bold text-[#ba0a0f]">{c.cardUid}</td>
                          <td className="p-3">
                            <span className="font-extrabold text-[#0c1d2b] block">{c.contactName}</span>
                          </td>
                          <td className="p-3 font-mono text-[#6f7881]">{c.dateIssued}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600">{formatCurrency(c.pricePaid)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                              c.status === 'Active' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setPreviewCardId(c.id)}
                              className="text-[#00628f] hover:text-[#004d70] font-bold inline-flex items-center gap-1 cursor-pointer"
                              title="Visualiser la carte"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Voir</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-[#f7f9ff] p-4 rounded-xl border border-[#bec8d2]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#6f7881] font-sans flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Chaque vente de carte génère automatiquement un encaissement direct de <strong>$100</strong> visible dans le livre de caisse.</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600">Total Encaissé : {formatCurrency(totalNfcSalesRevenue)}</span>
            </div>
          </div>

        </div>
      ) : (
        
        /* THE VIRTUAL NFC READER SCANNER COMPONENT VIEW */
        <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-heading font-extrabold text-base text-[#0c1d2b]">Simulateur de Borne NFC Privée</h3>
            <p className="text-xs text-[#6f7881]">Approchez ou simulez le tap d'une carte Elite pour lire ses privilèges VIP d'accès</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* CARDS LIST SELECTOR FOR TAP SIMULATION (col-span-5) */}
            <div className="md:col-span-5 border border-[#bec8d2]/50 rounded-xl p-4 bg-[#f7f9ff] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Sélectionner une carte physique à tester</span>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                  {cards.map(c => {
                    const isScanningThis = scanningCardId === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSimulateScan(c.id)}
                        disabled={isScanning}
                        className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition-all ${
                          isScanningThis 
                            ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400' 
                            : 'bg-white border-slate-200 hover:border-amber-300'
                        } cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <div className="space-y-0.5 truncate">
                          <span className="font-mono text-[9px] font-bold text-amber-600">{c.cardUid}</span>
                          <span className="font-heading font-extrabold text-xs text-[#0c1d2b] block truncate">{c.contactName}</span>
                        </div>
                        <div className="shrink-0 font-mono text-[10px] text-[#00628f] bg-slate-100 px-2 py-0.5 rounded border">
                          TAP CARD
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0c1d2b] text-white p-3.5 rounded-lg space-y-2">
                <span className="font-mono text-[10px] text-amber-300 font-bold block uppercase flex items-center gap-1">
                  <Pocket className="w-3.5 h-3.5 text-amber-300" />
                  <span>NFC Sandbox Emulator</span>
                </span>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Cette interface émule le protocole de communication sans contact ISO/IEC 14443 des cartes NFC Ndembo Kin Elite Club. Cliquez sur <strong>TAP CARD</strong> pour lancer la lecture par ondes radio de la borne d'accueil.
                </p>
              </div>
            </div>

            {/* VIRTUAL TERMINAL HARDWARE VISUAL (col-span-7) */}
            <div className="md:col-span-7 border border-slate-200 rounded-xl p-6 flex flex-col justify-between bg-[#112435] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00628f]/20 rounded-full blur-2xl"></div>
              
              {/* Terminal Screen Banner */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="font-mono text-[10px] text-[#cae6ff] uppercase font-bold">TERMINAL NDEMBO-VIP v1.0 • ONLINE</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">KINSHASA, GOMBE</span>
              </div>

              {/* Central Dynamic Terminal state visualizer */}
              <div className="my-8 flex flex-col items-center justify-center space-y-6">
                
                {isScanning ? (
                  /* Active scanning screen visualizer */
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-amber-400/40 border-t-amber-400 animate-spin flex items-center justify-center"></div>
                      <Wifi className="w-8 h-8 text-amber-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                    </div>
                    <div className="text-center">
                      <span className="font-mono text-xs text-amber-300 font-bold block animate-pulse">COMMUNICATION NFC EN COURS...</span>
                      <span className="text-[10px] text-slate-400 font-mono">Lecture de l'index de signature cryptographique</span>
                    </div>
                  </div>
                ) : scanSuccess && scanResult ? (
                  /* Sccessful scan screen visualizer */
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-400/30 flex items-center justify-center animate-bounce">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
                        ACCÈS AUTORISÉ • PRIVILÈGE VIP
                      </span>
                      <h4 className="font-heading font-black text-xl text-white mt-3 uppercase tracking-tight">{scanResult.contactName}</h4>
                      <span className="font-mono text-xs text-amber-300 block">{scanResult.cardUid} • Membre Elite</span>
                    </div>

                    {/* Quick validation badge parameters */}
                    <div className="grid grid-cols-2 gap-2 w-full max-w-sm pt-4 border-t border-white/5 text-[10px] font-mono">
                      <div className="bg-white/5 p-2 rounded text-left">
                        <span className="text-slate-400 block">Réseau d'Élite</span>
                        <span className="text-white font-bold">Actif • Privilégié</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded text-left">
                        <span className="text-slate-400 block">Avantage Partenaire</span>
                        <span className="text-[#ffe07f] font-bold">15% à 25% de Réduction</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Idle standard wait screen visualizer */
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                      <Wifi className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="font-mono text-xs text-slate-400 font-bold block">APPROCHEZ VOTRE CARTE NFC</span>
                      <span className="text-[10px] text-[#6f7881] font-mono max-w-xs block mx-auto mt-1 leading-relaxed">
                        Pour scanner, cliquez sur "TAP CARD" à côté d'une des cartes de membre à gauche de l'écran.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status footer with details */}
              <div className="bg-white/5 p-3 rounded-lg flex items-center gap-3 text-xs">
                <Shield className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  {scanSuccess && scanResult ? (
                    `Cette carte donne accès complet à la conciergerie 24/7 de Ndembo Kin, ainsi qu'aux galas officiels sans ticket. Membre vérifié le ${scanResult.dateIssued}.`
                  ) : (
                    "Le système est prêt. Les cartes inactives ou expirées déclencheront un signal d'alerte rouge d'accès refusé."
                  )}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ISSUE NEW NFC CARD MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-[#0c1d2b]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#bec8d2] shadow-2xl p-6 md:p-8 space-y-5 animate-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#00628f]" />
                <h3 className="font-heading font-extrabold text-base text-[#0c1d2b]">
                  Émettre une Nouvelle Carte NFC
                </h3>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="text-[#6f7881] hover:text-black font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              {/* Toggle existant / nouveau contact */}
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-heading font-extrabold" id="contact_creation_mode_toggle">
                <button
                  type="button"
                  onClick={() => setIsCreatingNewContact(false)}
                  className={`flex-1 py-2 text-center rounded-md transition-colors cursor-pointer ${
                    !isCreatingNewContact
                      ? 'bg-white text-[#00628f] shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Contact Existant
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewContact(true)}
                  className={`flex-1 py-2 text-center rounded-md transition-colors cursor-pointer ${
                    isCreatingNewContact
                      ? 'bg-white text-[#00628f] shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Nouveau Contact
                </button>
              </div>

              {!isCreatingNewContact ? (
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-1.5">
                    Associer à un contact CRM
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required={!isCreatingNewContact}
                  >
                    <option value="">-- Sélectionner un contact --</option>
                    {contacts.map(c => {
                      const alreadyHasCard = cards.some(card => card.contactId === c.id);
                      return (
                        <option 
                          key={c.id} 
                          value={c.id}
                          disabled={alreadyHasCard}
                        >
                          {c.name} ({c.type}){alreadyHasCard ? ' - Possède déjà une carte' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Seuls les contacts sans cartes actives sont listés ici.</p>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 bg-[#f7f9ff] border border-slate-200 rounded-xl" id="new_contact_quick_form">
                  <span className="block text-[10px] font-mono font-bold text-[#00628f] uppercase tracking-wider">
                    Création rapide du contact
                  </span>
                  
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="e.g. Dieumerci Mbokani"
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      required={isCreatingNewContact}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Type *
                      </label>
                      <select
                        value={newContactType}
                        onChange={(e) => setNewContactType(e.target.value)}
                        className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white"
                      >
                        <option value="Athlète">Athlète</option>
                        <option value="Particulier">Particulier</option>
                        <option value="Entreprise">Entreprise</option>
                        <option value="Sponsor">Sponsor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="+243..."
                        className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                      Adresse Email
                    </label>
                    <input
                      type="email"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full p-2 border border-[#bec8d2] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-1.5">
                  Prix de Vente Fixe de l'Adhésion
                </label>
                <div className="w-full p-2.5 bg-slate-100 border border-[#bec8d2] rounded-lg text-sm font-mono font-black text-emerald-700">
                  100 USD
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-1.5">
                  Statut initial
                </label>
                <select
                  value={cardStatus}
                  onChange={(e) => setCardStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                >
                  <option value="Active">Active (Prête pour remise en main propre)</option>
                  <option value="En attente">En attente (En cours de codage NFC)</option>
                </select>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[10px] text-amber-800 leading-relaxed">
                <strong>Attention Comptabilité :</strong> La validation de cette émission ajoutera instantanément un versement de <strong>$100</strong> dans les recettes de base de l'agence (rubrique d'Adhésion/Contract).
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-[#bec8d2] text-[#3f4850] text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00628f] hover:bg-[#005177] text-white text-xs font-heading font-extrabold rounded-lg shadow-sm cursor-pointer"
                >
                  Confirmer l'Achat ($100)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
