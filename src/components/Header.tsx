/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, HelpCircle, Search, ChevronRight, CheckCircle2, AlertTriangle, MessageSquare, Menu } from 'lucide-react';
import { ViewType } from './Sidebar';
import { Facture, Task, Contract } from '../types';

interface HeaderProps {
  currentView: ViewType;
  user: { name: string; role: string; email: string; avatarUrl?: string };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleSidebar?: () => void;
  factures?: Facture[];
  tasks?: Task[];
  contracts?: Contract[];
}

export default function Header({ currentView, user, searchQuery, setSearchQuery, onToggleSidebar, factures, tasks, contracts }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate dynamic alert notifications based on real data
  const dynamicAlerts: Array<{
    id: string;
    type: string;
    text: string;
    time: string;
    icon: any;
    color: string;
  }> = [];

  // 1. Unpaid/overdue invoices
  if (factures && factures.length > 0) {
    const unpaid = factures.filter(f => f.status === 'Non payée' || f.status === 'Échue');
    unpaid.slice(0, 2).forEach(f => {
      dynamicAlerts.push({
        id: `fact_${f.id}`,
        type: 'warning',
        text: `Facture ${f.number} de ${f.clientName} est en attente (${f.totalTTC} $)`,
        time: "Échéance: " + f.dateDue,
        icon: AlertTriangle,
        color: "text-secondary bg-[#ffdad6]"
      });
    });
  }

  // 2. Unsigned contracts
  if (contracts && contracts.length > 0) {
    const unsigned = contracts.filter(c => !c.signatures?.signed);
    unsigned.slice(0, 2).forEach(c => {
      dynamicAlerts.push({
        id: `contract_${c.id}`,
        type: 'info',
        text: `Contrat de ${c.clientName} en attente de signature (${c.amount} $)`,
        time: "Créé le: " + c.dateCreated,
        icon: CheckCircle2,
        color: "text-primary bg-[#e3efff]"
      });
    });
  }

  // 3. Pending/active tasks
  if (tasks && tasks.length > 0) {
    const activeTasks = tasks.filter(t => t.status !== 'Terminé');
    activeTasks.slice(0, 2).forEach(t => {
      dynamicAlerts.push({
        id: `task_${t.id}`,
        type: 'warning',
        text: `La tâche '${t.title}' est en cours de traitement`,
        time: "Fin prévue: " + t.endDate,
        icon: AlertTriangle,
        color: "text-tertiary bg-[#ffe07f]"
      });
    });
  }

  // Fallback if no notifications
  if (dynamicAlerts.length === 0) {
    dynamicAlerts.push({
      id: 'default_info',
      type: 'info',
      text: "Toutes vos factures, tâches et contrats sont à jour.",
      time: "Aujourd'hui",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50"
    });
  }

  const alerts = dynamicAlerts;
  const hasActiveAlerts = alerts.length > 0 && alerts[0].id !== 'default_info';

  const getViewLabel = (view: ViewType) => {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'devis': return 'Devis & Offres';
      case 'factures': return 'Facturation Pro';
      case 'projets': return 'Gestion de Projets';
      case 'taches': return 'Calendrier des Tâches';
      case 'finances': return 'Suivi Financier Ledger';
      case 'finances-reports': return 'Rapports Financiers';
      case 'contrats': return 'Générateur d\'Actes';
      case 'contacts': return 'Contacts CRM';
      case 'parametres': return 'Paramètres Agence';
      case 'rh': return 'Ressources Humaines';
      case 'rh-dashboard': return 'Tableau de Bord RH';
      case 'rh-repertoire': return 'Répertoire du Personnel';
      case 'rh-presence': return 'Présence & Congés';
      case 'rh-temps': return 'Suivi de Temps';
      case 'rh-paie': return 'Calcul de la Paie';
      default: return 'Accueil';
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 h-20 bg-white border-b border-[#bec8d2]/70 z-40 px-4 md:px-8 flex items-center justify-between">
      {/* Left side: Breadcrumb path */}
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer mr-1"
            aria-label="Ouvrir le menu"
            id="mobile_menu_toggle_btn"
          >
            <Menu className="w-5.5 h-5.5 text-[#3f4850]" />
          </button>
        )}
        <span className="text-xs font-mono font-bold text-[#6f7881] uppercase tracking-wider hidden sm:inline">
          Ndémbo Kin Connect
        </span>
        <ChevronRight className="w-4 h-4 text-[#bec8d2] hidden sm:block" />
        <h2 className="font-heading text-sm md:text-lg font-black text-on-surface truncate max-w-[150px] sm:max-w-none">
          {getViewLabel(currentView)}
        </h2>
      </div>

      {/* Right side: Search, Help, Notifications & User block */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Search bar widget */}
        <div className="relative hidden lg:block w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6f7881]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f7f9ff] border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm placeholder:text-[#6f7881]/70"
            placeholder="Rechercher des clients, devis, athlètes..."
          />
        </div>

        {/* Action icons bar */}
        <div className="flex items-center gap-2 relative">
          {/* Notifications bell with indicator */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              showNotifications ? 'bg-[#edf4ff]' : 'hover:bg-[#edf4ff]'
            }`}
            title="Notifications agence"
          >
            <Bell className="w-5 h-5 text-[#3f4850] hover:text-primary" />
            {hasActiveAlerts && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba0a0f] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Help/Instruction button */}
          <button
            className="w-10 h-10 rounded-full hidden sm:flex items-center justify-center hover:bg-[#edf4ff] transition-all"
            title="Consignes d'utilisation"
          >
            <HelpCircle className="w-5 h-5 text-[#3f4850]" />
          </button>

          {/* Notifications dropdown panel list */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-12 w-80 md:w-96 bg-white border border-[#bec8d2] rounded-lg shadow-xl py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-3 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-heading font-extrabold text-sm text-on-surface">
                    Alertes &amp; Notifications d'Agence
                  </span>
                  {hasActiveAlerts && (
                    <span className="bg-[#ba0a0f] text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      {alerts.length} Active{alerts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {alerts.map((al) => {
                    const AlertIcon = al.icon;
                    return (
                      <div key={al.id} className="p-3.5 hover:bg-slate-[#f7f9ff] flex gap-3 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${al.color}`}>
                          <AlertIcon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <p className="text-xs text-on-surface leading-normal font-sans font-medium">
                            {al.text}
                          </p>
                          <span className="text-[10px] font-mono text-[#6f7881] block">
                            {al.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-3 px-4 text-center border-t border-slate-100">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-primary text-xs font-bold hover:underline"
                  >
                    Marquer toutes comme lues
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Separator bar */}
        <div className="h-8 w-px bg-[#bec8d2] hidden sm:block" />

        {/* User profile layout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="font-semibold text-sm text-on-surface block leading-tight">
              {user.name}
            </span>
            <span className="font-mono text-[10px] tracking-tight uppercase text-[#6f7881] font-bold block">
              {user.role}
            </span>
          </div>

          {/* Authoritative Avatar based on the prompt instructions */}
          <div className="w-10 h-10 rounded-full border-2 border-[#00628f] overflow-hidden p-[2px] transition-transform hover:rotate-3">
            <div
              className="w-full h-full rounded-full bg-cover bg-center"
              style={{
                backgroundImage: `url('${user.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAJlWkFddEElFi-ESuyiltwl_9FRteJ-kv8df6RkNdAlvXZOq8Ox1BpDl51oey3hiJ0J3y6Jba-RKzI07AgQv1gUrDGltZ8jl-x4CjD0_HHq7Ov3A97J-i-Ls5bp08hg46DkPg_lFEMKQjd6GDl6jZEyV3G_vJoqi-zskFBS8IBn-teyx2XGCCM8sJgflCrU65LVNmEDulp2jTFmaXz7UAwsuoXXIqpww7J2nKPZ5s7aDZhS7uJPw_IaGqHYTZSaDVlidHxEqaYeLjl"}')`
              }}
              title={user.name}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
