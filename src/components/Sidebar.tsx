/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutGrid,
  FileText,
  Receipt,
  FolderKanban,
  ClipboardList,
  TrendingUp,
  FileSignature,
  Users2,
  Settings,
  PlusCircle,
  Trophy,
  Menu,
  ChevronRight,
  CreditCard,
  Lock,
  LogOut,
  X,
  UserCheck,
  Clock,
  DollarSign,
  FileSpreadsheet,
  Users
} from 'lucide-react';
import { INITIAL_CONTRATS } from '../mockData';
import NdemboKinLogo from './NdemboKinLogo';
import { RolePrivilege } from '../types';

export type ViewType = 
  | 'dashboard' 
  | 'devis' 
  | 'factures' 
  | 'projets' 
  | 'taches' 
  | 'finances' 
  | 'finances-reports'
  | 'contrats' 
  | 'contacts' 
  | 'performances'
  | 'cartes'
  | 'parametres'
  | 'rh'
  | 'rh-dashboard'
  | 'rh-repertoire'
  | 'rh-presence'
  | 'rh-temps'
  | 'rh-paie';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onQuickAction: (action: string) => void;
  userRole: string;
  rolePrivileges: RolePrivilege[];
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  currentView,
  setView,
  onQuickAction,
  userRole,
  rolePrivileges,
  onLogout,
  isOpen = false,
  onClose
}: SidebarProps) {
  // Find active privilege for userRole
  const activePrivilege = rolePrivileges?.find(p => p.role === userRole);
  
  // Navigation mapping organized by conceptual categories
  const categories = [
    {
      title: 'Gestion Sportive',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'projets', label: 'Projets & Suivi', icon: FolderKanban },
        { id: 'performances', label: 'Suivi Performances', icon: Trophy },
        { id: 'contacts', label: 'Contacts CRM', icon: Users2 },
      ] as const
    },
    {
      title: 'Administration & Finances',
      items: [
        { id: 'devis', label: 'Devis & Offres', icon: FileText },
        { id: 'factures', label: 'Factures', icon: Receipt },
        { id: 'finances', label: 'Finances & R&D', icon: TrendingUp },
        { id: 'finances-reports', label: 'Rapports Financiers', icon: FileSpreadsheet },
        { id: 'taches', label: 'Tâches', icon: ClipboardList },
      ] as const
    },
    {
      title: 'Ressources Humaines',
      items: [
        { id: 'rh-dashboard', label: 'Dashboard RH', icon: LayoutGrid },
        { id: 'rh-repertoire', label: 'Répertoire Personnel', icon: Users },
        { id: 'rh-presence', label: 'Présence & Congés', icon: UserCheck },
        { id: 'rh-temps', label: 'Suivi de Temps', icon: Clock },
        { id: 'rh-paie', label: 'Paie & Bulletins', icon: DollarSign },
      ] as const
    },
    {
      title: 'Juridique & Accès',
      items: [
        { id: 'contrats', label: 'Générateur de Contrats', icon: FileSignature },
        { id: 'cartes', label: 'Cartes Elite NFC', icon: CreditCard },
        { id: 'parametres', label: 'Configuration', icon: Settings },
      ] as const
    }
  ];

  const canGenerateContracts = activePrivilege ? activePrivilege.canGenerateContracts : true;

  return (
    <aside className={`w-64 md:w-72 bg-[#0c1d2b] text-white border-r border-[#6f7881]/60 h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      {/* Brand Identity / Header logo */}
      <div className="p-5 border-b border-[#6f7881]/30 flex flex-col items-center text-center space-y-3 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <NdemboKinLogo size="md" showText={false} className="transform hover:scale-105 transition-transform" />
        <div>
          <h1 className="font-heading font-black text-[#edf4ff] text-2xl leading-none tracking-tight italic uppercase">
            NDEMBO<span className="text-[#ffe07f]">KIN</span>
          </h1>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#ffe07f] font-extrabold block mt-2">
            SPORT MANAGEMENT
          </span>
          <p className="text-[10px] text-[#ffe07f]/90 leading-normal font-sans font-medium mt-1.5 opacity-90 max-w-[220px]">
            Plateforme de gestion interne Ndembo Kin
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto custom-scrollbar">
        {categories.map((cat) => {
          // Filter items based on user privileges
          const allowedItems = cat.items.filter(item => {
            if (!activePrivilege) return true;
            let checkId: string = item.id;
            if (item.id.startsWith('rh-')) {
              checkId = 'rh';
            } else if (item.id === 'finances-reports') {
              checkId = 'finances';
            }
            return activePrivilege.allowedViews.includes(checkId as any);
          });

          if (allowedItems.length === 0) return null;

          return (
            <div key={cat.title} className="space-y-1">
              <span className="block text-[9px] font-mono font-bold text-[#6f7881] uppercase tracking-wider px-3 mb-1">
                {cat.title}
              </span>
              {allowedItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-all duration-150 relative group cursor-pointer ${
                      isActive
                        ? 'bg-[#00628f] text-white font-extrabold shadow-sm'
                        : 'text-white/80 hover:bg-[#00628f]/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6f7881] group-hover:text-white'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 bg-[#ffe07f] rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Separator before session control */}
        <div className="border-t border-[#6f7881]/20 pt-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all cursor-pointer font-bold"
            title="Se déconnecter de la plateforme"
          >
            <LogOut className="w-4 h-4 text-red-400 shrink-0" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </nav>

      {/* Sidebar Footer CTA Action */}
      <div className="p-4 border-t border-[#6f7881]/30 bg-[#0c1d2b]">
        {canGenerateContracts ? (
          <button
            onClick={() => onQuickAction('new_contract')}
            className="w-full flex items-center justify-center gap-2 bg-[#ba0a0f] hover:bg-[#a0080c] text-white py-3 px-4 rounded-lg font-heading font-extrabold text-sm shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5 text-white" />
            <span>Générer un Contrat</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => alert("Génération de contrats désactivée : Votre profil ne possède pas le privilège requis.")}
            className="w-full flex items-center justify-center gap-2 bg-[#4c566a] text-[#bec8d2] py-3 px-4 rounded-lg font-heading font-extrabold text-sm shadow-sm cursor-not-allowed opacity-75"
          >
            <Lock className="w-4 h-4 text-[#bec8d2]" />
            <span>Contrats Restreints</span>
          </button>
        )}
        <div className="mt-3 text-center space-y-1.5">
          <span className="text-[10px] font-mono text-[#6f7881] tracking-tight uppercase block bg-[#0c1d2b] border border-[#6f7881]/30 py-1 rounded">
            Version 1.0.0 • Licencié
          </span>
          <span className="text-[9px] font-mono text-[#ffe07f] block">
            Support : FASOPOST Design (+212777346787)
          </span>
        </div>
      </div>
    </aside>
  );
}
