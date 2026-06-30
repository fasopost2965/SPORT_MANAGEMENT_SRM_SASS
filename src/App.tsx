/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar, { ViewType } from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import DevisView from './components/DevisView';
import FacturesView from './components/FacturesView';
import ProjetsView from './components/ProjetsView';
import TachesView from './components/TachesView';
import FinancesView from './components/FinancesView';
import ContratsView from './components/ContratsView';
import ContactsView from './components/ContactsView';
import PerformancesView from './components/PerformancesView';
import ParametresView from './components/ParametresView';
import CardsView from './components/CardsView';
import RhView from './components/RhView';

// Types & Seed Data
import {
  Contact,
  Project,
  Task,
  Devis,
  Facture,
  FinanceTransaction,
  Contract,
  BusinessSettings,
  DevisStatus,
  FactureStatus,
  ProjectStatus,
  TaskStatus,
  NfcCard,
  RolePrivilege
} from './types';

import {
  INITIAL_SETTINGS,
  INITIAL_CONTACTS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_DEVIS,
  INITIAL_FACTURES,
  INITIAL_TRANSACTIONS,
  INITIAL_CONTRATS,
  INITIAL_CARDS,
  INITIAL_ROLE_PRIVILEGES
} from './mockData';

export default function App() {
  // 1. Session state authentication
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string; avatarUrl?: string; password?: string } | null>(() => {
    const saved = localStorage.getItem('ndembo_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Save session on state change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ndembo_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ndembo_current_user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // 2. Nav, Search and responsive toggles
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 3. Central tables databases
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('ndembo_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('ndembo_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ndembo_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ndembo_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [devisList, setDevisList] = useState<Devis[]>(() => {
    const saved = localStorage.getItem('ndembo_devis');
    return saved ? JSON.parse(saved) : INITIAL_DEVIS;
  });
  const [factures, setFactures] = useState<Facture[]>(() => {
    const saved = localStorage.getItem('ndembo_factures');
    return saved ? JSON.parse(saved) : INITIAL_FACTURES;
  });
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => {
    const saved = localStorage.getItem('ndembo_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem('ndembo_contracts');
    return saved ? JSON.parse(saved) : INITIAL_CONTRATS;
  });
  const [cards, setCards] = useState<NfcCard[]>(() => {
    const saved = localStorage.getItem('ndembo_cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });
  const [rolePrivileges, setRolePrivileges] = useState<RolePrivilege[]>(() => {
    const saved = localStorage.getItem('ndembo_role_privileges');
    return saved ? JSON.parse(saved) : INITIAL_ROLE_PRIVILEGES;
  });

  // Save databases on change
  useEffect(() => {
    localStorage.setItem('ndembo_settings', JSON.stringify(settings));
    
    // Apply dynamic color theme variables globally
    const activeTheme = settings.colorTheme || 'default';
    const themes: Record<string, { primary: string; secondary: string; tertiary: string; onSurface: string }> = {
      default: { primary: '#00628f', secondary: '#ba0a0f', tertiary: '#725c00', onSurface: '#0c1d2b' },
      athletic: { primary: '#0d7a5f', secondary: '#ca4110', tertiary: '#b48c00', onSurface: '#071f1a' },
      imperial: { primary: '#9e1015', secondary: '#1e4a7a', tertiary: '#cf9f04', onSurface: '#1c0507' },
      carbon: { primary: '#2f3542', secondary: '#747d8c', tertiary: '#ffa502', onSurface: '#1e2229' },
      electric: { primary: '#3b82f6', secondary: '#ec4899', tertiary: '#10b981', onSurface: '#0b0f19' },
    };

    let primary = themes.default.primary;
    let secondary = themes.default.secondary;
    let tertiary = themes.default.tertiary;
    let onSurface = themes.default.onSurface;

    if (activeTheme === 'custom') {
      primary = settings.themePrimary || themes.default.primary;
      secondary = settings.themeSecondary || themes.default.secondary;
      tertiary = settings.themeTertiary || themes.default.tertiary;
      onSurface = settings.themeOnSurface || themes.default.onSurface;
    } else {
      const selected = themes[activeTheme] || themes.default;
      primary = selected.primary;
      secondary = selected.secondary;
      tertiary = selected.tertiary;
      onSurface = selected.onSurface;
    }

    const root = document.documentElement;
    root.style.setProperty('--theme-primary', primary);
    root.style.setProperty('--theme-secondary', secondary);
    root.style.setProperty('--theme-tertiary', tertiary);
    root.style.setProperty('--theme-on-surface', onSurface);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ndembo_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('ndembo_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('ndembo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ndembo_devis', JSON.stringify(devisList));
  }, [devisList]);

  useEffect(() => {
    localStorage.setItem('ndembo_factures', JSON.stringify(factures));
  }, [factures]);

  useEffect(() => {
    localStorage.setItem('ndembo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ndembo_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('ndembo_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('ndembo_role_privileges', JSON.stringify(rolePrivileges));
  }, [rolePrivileges]);

  // Migrate existing role privileges in local storage to make sure 'rh' is included
  useEffect(() => {
    let changed = false;
    const migrated = rolePrivileges.map(priv => {
      if (['Directeur Associé', 'Manager Principal', 'Administrateur Finance'].includes(priv.role)) {
        if (!priv.allowedViews.includes('rh')) {
          changed = true;
          return { ...priv, allowedViews: [...priv.allowedViews, 'rh'] };
        }
      }
      return priv;
    });
    if (changed) {
      setRolePrivileges(migrated);
    }
  }, [rolePrivileges]);

  // 4. Synchronization effect: Recalculate automatic project progress based on average task completion
  useEffect(() => {
    const updatedProjects = projects.map(project => {
      // Find tasks belonging to this project
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      if (projectTasks.length === 0) return project;

      // Calculate aggregate average progress
      const totalProgress = projectTasks.reduce((sum, t) => sum + t.progress, 0);
      const computedProgress = Math.round(totalProgress / projectTasks.length);

      // Determine updated status as Terminé if all tasks are Terminé (100%)
      let computedStatus: ProjectStatus = project.status;
      if (computedProgress === 100) {
        computedStatus = 'Terminé';
      } else if (computedProgress > 0 && project.status === 'Planifié') {
        computedStatus = 'En cours';
      }

      return {
        ...project,
        progress: computedProgress,
        status: computedStatus
      };
    });

    // To prevent infinite react render loop, only update state if indeed progress calculation values changed
    let hasChanged = false;
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].progress !== updatedProjects[i]?.progress || projects[i].status !== updatedProjects[i]?.status) {
        hasChanged = true;
        break;
      }
    }

    if (hasChanged) {
      setProjects(updatedProjects);
    }
  }, [tasks, projects]);

  // Handle manual login simulation
  const handleLogin = (user: { name: string; role: string; email: string }) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  // Contacts CRM additions
  const handleAddContact = (contact: Contact) => {
    setContacts([contact, ...contacts]);
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  // Projects additions
  const handleAddProject = (project: Project) => {
    setProjects([project, ...projects]);
  };

  // Tasks additions
  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status,
          progress: status === 'Terminé' ? 100 : t.progress
        };
      }
      return t;
    }));
  };

  const handleUpdateTaskProgress = (taskId: string, progress: number) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          progress,
          status: progress === 100 ? 'Terminé' : 'En cours'
        };
      }
      return t;
    }));
  };

  // Devis additions and status modifications
  const handleAddDevis = (newDevis: Devis) => {
    setDevisList([newDevis, ...devisList]);
  };

  const handleUpdateDevisStatus = (id: string, status: DevisStatus) => {
    setDevisList(devisList.map(d => (d.id === id ? { ...d, status } : d)));
  };

  // Factures additions
  const handleAddFacture = (newFacture: Facture) => {
    setFactures([newFacture, ...factures]);
  };

  const handleUpdateProjectStatus = (id: string, status: ProjectStatus) => {
    setProjects(projects.map(p => (p.id === id ? { ...p, status } : p)));
  };

  // CONVERSIONS TRIGGERS
  // Devis → Facture
  const handleConvertToFacture = (devis: Devis) => {
    const newFac: Facture = {
      id: "fac_" + Date.now(),
      number: `FAC-2026-00${factures.length + 1}`,
      clientId: devis.clientId,
      clientName: devis.clientName,
      dateCreated: new Date().toISOString().split('T')[0],
      dateDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: devis.items,
      status: 'Non payée',
      tvaPercent: devis.tvaPercent,
      totalHT: devis.totalHT,
      totalTVA: devis.totalTVA,
      totalTTC: devis.totalTTC,
      notes: `Facture d'honoraires émise consécutivement à la signature du devis d'offre Nº ${devis.number}.`,
      derivedFromDevisId: devis.id
    };

    setFactures([newFac, ...factures]);
    setDevisList(devisList.map(d => (d.id === devis.id ? { ...d, status: 'Converti', convertedToFactureId: newFac.id } : d)));
    setView('factures');
  };

  // Devis → Projet
  const handleConvertToProject = (devis: Devis) => {
    const newPrj: Project = {
      id: "prj_" + Date.now(),
      name: devis.items[0]?.serviceName || `Projet - ${devis.clientName}`,
      clientId: devis.clientId,
      clientName: devis.clientName,
      budget: devis.totalHT,
      startDate: new Date().toISOString().split('T')[0],
      endDate: devis.dateExpiration,
      description: `Actes de prestations issus de la reconversion commerciale de l'offre Nº ${devis.number} : ${devis.notes}`,
      status: 'En cours',
      progress: 0
    };

    // Prepopulate tasks template for faster user onboarding
    const taskTemplate1: Task = {
      id: "tsk_" + Date.now() + "_1",
      projectId: newPrj.id,
      projectOptionalName: newPrj.name,
      title: "Cadrage initial des mandats",
      priority: "Haute",
      startDate: newPrj.startDate,
      endDate: newPrj.startDate,
      description: "Organiser la réunion d'alignement avec l'athlète et définir la feuille de route.",
      category: "Management",
      status: "À faire",
      progress: 0
    };

    const taskTemplate2: Task = {
      id: "tsk_" + Date.now() + "_2",
      projectId: newPrj.id,
      projectOptionalName: newPrj.name,
      title: "Constitution du dossier de détection",
      priority: "Moyenne",
      startDate: newPrj.startDate,
      endDate: newPrj.endDate,
      description: "Préparation des fiches athlétiques, vidéos-caps, et contacts club.",
      category: "Recrutement",
      status: "À faire",
      progress: 0
    };

    setProjects([newPrj, ...projects]);
    setTasks([...tasks, taskTemplate1, taskTemplate2]);
    setDevisList(devisList.map(d => (d.id === devis.id ? { ...d, status: 'Converti', convertedToProjectId: newPrj.id } : d)));
    setView('projets');
  };

  // Facture → Projet
  const handleFactureToProject = (facture: Facture) => {
    const newPrj: Project = {
      id: "prj_" + Date.now(),
      name: `Projet - ${facture.items[0]?.serviceName || facture.clientName}`,
      clientId: facture.clientId,
      clientName: facture.clientName,
      budget: facture.totalHT,
      startDate: new Date().toISOString().split('T')[0],
      endDate: facture.dateDue,
      description: `Coordination logistique de contrat issue de la facturation Nº ${facture.number}.`,
      status: 'En cours',
      progress: 0
    };

    setProjects([newPrj, ...projects]);
    setFactures(factures.map(f => (f.id === facture.id ? { ...f, convertedToProjectId: newPrj.id } : f)));
    setView('projets');
  };

  // Liquidation / Payée marking (Logs dynamic Financial transaction Receipt)
  const handleMarkAsPaid = (id: string) => {
    const targetFac = factures.find(f => f.id === id);
    if (!targetFac) return;

    const newTx: FinanceTransaction = {
      id: "tx_" + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: 'Recette',
      amount: targetFac.totalTTC,
      category: 'Management',
      description: `Règlement d'honoraires perçu d'après facture Nº ${targetFac.number}`,
      sourceId: targetFac.id,
      sourceNumber: targetFac.number,
      clientName: targetFac.clientName
    };

    setFactures(factures.map(f => (f.id === id ? { ...f, status: 'Payée' } : f)));
    setTransactions([newTx, ...transactions]);
  };

  // Financial write entries manually
  const handleAddTransaction = (newTx: FinanceTransaction) => {
    setTransactions([newTx, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // NFC Cards management
  const handleIssueCard = (newCard: NfcCard, newTx: FinanceTransaction) => {
    setCards([newCard, ...cards]);
    setTransactions([newTx, ...transactions]);
  };

  // Contracts edits
  const handleAddContract = (newContract: Contract) => {
    setContracts([newContract, ...contracts]);
    setView('contrats');
  };

  const handleUpdateContractStatus = (id: string, status: any) => {
    setContracts(contracts.map(c => (c.id === id ? { ...c, status } : c)));
  };

  // Fast shortcut buttons triggers
  const handleSidebarQuickAction = (action: string) => {
    if (action === 'new_contract') {
      setView('contrats');
      // Pass flag down or trigger simple timeout simulate create clicks
      setTimeout(() => {
        // Quick visual toggle clicks
        const btn = document.querySelector('button[title="Nouveau Contrat"]') as HTMLButtonElement;
        if (btn) btn.click();
      }, 100);
    } else if (action === 'new_contact') {
      setView('contacts');
      setTimeout(() => {
        const btn = document.querySelector('button[title="Ajouter un contact"]') as HTMLButtonElement;
        if (btn) btn.click();
      }, 100);
    } else if (action === 'new_devis') {
      setView('devis');
      setTimeout(() => {
        const btn = document.querySelector('button[title="Nouveau Devis"]') as HTMLButtonElement;
        if (btn) btn.click();
      }, 100);
    } else if (action === 'new_invoice') {
      setView('factures');
      setTimeout(() => {
        const btn = document.querySelector('button[title="Créer Facture"]') as HTMLButtonElement;
        if (btn) btn.click();
      }, 100);
    } else if (action === 'new_project') {
      setView('projets');
      setTimeout(() => {
        const btn = document.querySelector('button[title="Ajouter un projet"]') as HTMLButtonElement;
        if (btn) btn.click();
      }, 100);
    }
  };

  // Standard reset
  const handleResetData = () => {
    setSettings(INITIAL_SETTINGS);
    setContacts(INITIAL_CONTACTS);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setDevisList(INITIAL_DEVIS);
    setFactures(INITIAL_FACTURES);
    setTransactions(INITIAL_TRANSACTIONS);
    setContracts(INITIAL_CONTRATS);
    setCards(INITIAL_CARDS);
    setRolePrivileges(INITIAL_ROLE_PRIVILEGES);
    setView('dashboard');
  };

  // Complete clean slate wipe
  const handleWipeAllData = () => {
    setSettings({
      ...INITIAL_SETTINGS,
      companyName: "Votre Agence Sportive",
      rcNumber: "CD/KIN/RCCM/XX-X-XXXXX",
      address: "Kinshasa, RDC",
      phone: "+243 000 000 000",
      email: "contact@votreagence.com",
    });
    setContacts([]);
    setProjects([]);
    setTasks([]);
    setDevisList([]);
    setFactures([]);
    setTransactions([]);
    setContracts([]);
    setCards([]);
    setRolePrivileges(INITIAL_ROLE_PRIVILEGES);
    setView('dashboard');
  };

  // Render Login view if user not authenticated
  if (!currentUser) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginView onLogin={handleLogin} />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Render Active view components
  const renderActiveView = () => {
    // Dynamic query elements pre-checks
    const matchedContacts = contacts;
    const matchedProjects = projects;
    
    // Check view privileges
    const activePrivilege = rolePrivileges.find(p => p.role === currentUser.role);
    let viewToCheck = currentView;
    if (currentView.startsWith('rh-')) {
      viewToCheck = 'rh';
    } else if (currentView === 'finances-reports') {
      viewToCheck = 'finances';
    }
    
    if (activePrivilege && !activePrivilege.allowedViews.includes(viewToCheck as any)) {
      return (
        <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-8 max-w-xl mx-auto mt-12 text-center space-y-4 shadow-sm" id="unauthorized_view_card">
          <div className="w-12 h-12 bg-red-50 text-[#ba0a0f] rounded-full flex items-center justify-center mx-auto mb-2 ring-8 ring-red-50">
            <Lock className="w-6 h-6 text-[#ba0a0f]" />
          </div>
          <h3 className="font-heading font-extrabold text-lg text-on-surface">Accès non autorisé</h3>
          <p className="text-xs text-[#6f7881] leading-relaxed">
            Votre profil de rôle actuel (<strong className="text-[#0c1d2b]">{currentUser.role}</strong>) ne possède pas les habilitations requises pour consulter le module de navigation <strong className="text-[#0c1d2b] uppercase">{currentView}</strong>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setView('dashboard')}
              className="bg-[#00628f] hover:bg-[#005278] text-white font-heading font-extrabold text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow-xs transition-transform hover:scale-[1.01]"
            >
              Retour au Tableau de bord
            </button>
          </div>
        </div>
      );
    }
    
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            contacts={contacts}
            projects={projects}
            tasks={tasks}
            devis={devisList}
            factures={factures}
            transactions={transactions}
            contracts={contracts}
            cards={cards}
            setView={setView}
            onQuickAction={handleSidebarQuickAction}
          />
        );
      case 'devis':
        return (
          <DevisView
            devisList={devisList}
            contacts={contacts}
            onAddDevis={handleAddDevis}
            onUpdateStatus={handleUpdateDevisStatus}
            onConvertToFacture={handleConvertToFacture}
            onConvertToProject={handleConvertToProject}
            tvaDefault={settings.tvaDefault}
            settings={settings}
          />
        );
      case 'factures':
        return (
          <FacturesView
            factures={factures}
            contacts={contacts}
            onAddFacture={handleAddFacture}
            onMarkAsPaid={handleMarkAsPaid}
            onConvertToProject={handleFactureToProject}
            tvaDefault={settings.tvaDefault}
            settings={settings}
          />
        );
      case 'projets':
        return (
          <ProjetsView
            projects={projects}
            tasks={tasks}
            contacts={contacts}
            onAddProject={handleAddProject}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            onAddTaskToProject={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onUpdateTaskProgress={handleUpdateTaskProgress}
            onRemoveTask={handleRemoveTask}
          />
        );
      case 'taches':
        return (
          <TachesView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onRemoveTask={handleRemoveTask}
          />
        );
      case 'finances':
      case 'finances-reports':
        return (
          <FinancesView
            transactions={transactions}
            projects={projects}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            canDeleteTransactions={activePrivilege ? activePrivilege.canDeleteTransactions : true}
            initialTab={currentView === 'finances-reports' ? 'reports' : 'ledger'}
          />
        );
      case 'contrats':
        return (
          <ContratsView
            contracts={contracts}
            contacts={contacts}
            projects={projects}
            onAddContract={handleAddContract}
            onUpdateContractStatus={handleUpdateContractStatus}
          />
        );
      case 'contacts':
        return (
          <ContactsView
            contacts={contacts}
            projects={projects}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
          />
        );
      case 'performances':
        return (
          <PerformancesView
            contacts={contacts}
            onUpdateContact={handleUpdateContact}
            canEditScoutingMetrics={activePrivilege ? activePrivilege.canEditScoutingMetrics : true}
          />
        );
      case 'cartes':
        return (
          <CardsView
            contacts={contacts}
            cards={cards}
            onIssueCard={handleIssueCard}
            onAddContact={handleAddContact}
            canIssueCards={activePrivilege ? activePrivilege.canIssueCards : true}
          />
        );
      case 'parametres':
        return (
          <ParametresView
            settings={settings}
            onSaveSettings={setSettings}
            onResetData={handleResetData}
            onWipeAllData={handleWipeAllData}
            rolePrivileges={rolePrivileges}
            onSaveRolePrivileges={setRolePrivileges}
            currentUser={currentUser!}
            onUpdateCurrentUser={setCurrentUser}
          />
        );
      case 'rh':
      case 'rh-dashboard':
      case 'rh-repertoire':
      case 'rh-presence':
      case 'rh-temps':
      case 'rh-paie': {
        let subTab: 'dashboard' | 'employees' | 'presence' | 'payslips' = 'dashboard';
        if (currentView === 'rh-repertoire') subTab = 'employees';
        else if (currentView === 'rh-presence' || currentView === 'rh-temps') subTab = 'presence';
        else if (currentView === 'rh-paie') subTab = 'payslips';

        return (
          <RhView
            projects={projects}
            currentUser={currentUser!}
            factures={factures}
            contacts={contacts}
            setFactures={setFactures}
            setView={setView}
            initialSubTab={subTab}
          />
        );
      }
      default:
        return <div className="p-8 text-center text-[#6f7881]">Écran en cours d'élaboration...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-on-surface" id="ndembo_kin_app_shell">
      {/* Sidebar Backdrop overlay for mobile screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-45 md:hidden transition-opacity cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
          id="sidebar_backdrop"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setView={(view) => {
          setView(view);
          setIsSidebarOpen(false);
        }}
        onQuickAction={(action) => {
          handleSidebarQuickAction(action);
          setIsSidebarOpen(false);
        }}
        userRole={currentUser.role}
        rolePrivileges={rolePrivileges}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main workspace container (Push right to make space for sidebar) */}
      <div className="flex flex-col min-h-screen md:pl-72 pl-0">
        {/* Top Header bar */}
        <Header
          currentView={currentView}
          user={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Content body space */}
        <main className="flex-1 px-6 md:px-8 pt-28 pb-16 overflow-y-auto max-w-[1440px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
