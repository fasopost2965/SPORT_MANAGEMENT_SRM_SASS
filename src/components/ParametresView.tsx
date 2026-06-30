/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Landmark,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Users,
  Lock,
  Eye,
  AlertTriangle,
  ShieldAlert,
  CheckSquare,
  Square,
  User,
  Camera,
  KeyRound,
  CheckCircle2,
  LockKeyhole,
  Plus,
  Trash2,
  Edit,
  X,
  UserPlus,
  Palette,
  Download,
  Upload
} from 'lucide-react';
import { BusinessSettings, RolePrivilege, SystemUser } from '../types';
import { hashPassword, isHashed } from '../utils/security';

interface ParametresViewProps {
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
  onResetData: () => void;
  onWipeAllData: () => void;
  rolePrivileges: RolePrivilege[];
  onSaveRolePrivileges: (rolePrivileges: RolePrivilege[]) => void;
  currentUser: { name: string; role: string; email: string; avatarUrl?: string; password?: string };
  onUpdateCurrentUser: (user: { name: string; role: string; email: string; avatarUrl?: string; password?: string }) => void;
}

// Preset luxury executive sport avatars
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", // female executive
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", // male executive
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", // scout manager
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"  // athletic director
];

export default function ParametresView({
  settings,
  onSaveSettings,
  onResetData,
  onWipeAllData,
  rolePrivileges,
  onSaveRolePrivileges,
  currentUser,
  onUpdateCurrentUser
}: ParametresViewProps) {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'agency' | 'profile' | 'users' | 'colors'>('agency');

  // System users list management
  const [usersList, setUsersList] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('ndembo_users_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'usr_1',
        name: 'Yannick Ndémbo',
        email: 'admin@ndembokin.com',
        role: 'Directeur Associé',
        password: '6f71fd1e6047cf8f4c398bc734268e31002347fa6b5fa7cf6f6bc4db392b453e' // 'admin1234' SHA-256
      },
      {
        id: 'usr_2',
        name: 'Yannick Ndémbo',
        email: 'bouakebb902@gmail.com',
        role: 'Directeur Associé',
        password: '6f71fd1e6047cf8f4c398bc734268e31002347fa6b5fa7cf6f6bc4db392b453e' // 'admin1234' SHA-256
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ndembo_users_list', JSON.stringify(usersList));
  }, [usersList]);

  // Form states for creating/editing users
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('Manager Principal');
  const [formPassword, setFormPassword] = useState('');
  const [formAvatar, setFormAvatar] = useState(AVATAR_PRESETS[0]);
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [showUserSuccess, setShowUserSuccess] = useState(false);
  const [userSuccessMessage, setUserSuccessMessage] = useState('');

  // Business settings states
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [rcNumber, setRcNumber] = useState(settings.rcNumber);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [tvaDefault, setTvaDefault] = useState(settings.tvaDefault);
  const [defaultPaymentDueDays, setDefaultPaymentDueDays] = useState(settings.defaultPaymentDueDays);
  const [isDemoRestoreLocked, setIsDemoRestoreLocked] = useState(settings.isDemoRestoreLocked || false);

  // Bank details and Signatory states
  const [bankName, setBankName] = useState(settings.bankName || "RAWBANK S.A. Kinshasa RDC");
  const [bankAccountName, setBankAccountName] = useState(settings.bankAccountName || "Ndembo Kin Connect SARL");
  const [bankAccountNumber, setBankAccountNumber] = useState(settings.bankAccountNumber || "05100-382941-8374-02 USD");
  const [bankSwift, setBankSwift] = useState(settings.bankSwift || "RAWBCD KI XXX");
  const [directorName, setDirectorName] = useState(settings.directorName || "Yannick Ndémbo");
  const [directorTitle, setDirectorTitle] = useState(settings.directorTitle || "Directeur Général");

  // Color theme manager states
  const [selectedTheme, setSelectedTheme] = useState(settings.colorTheme || 'default');
  const [customPrimary, setCustomPrimary] = useState(settings.themePrimary || '#00628f');
  const [customSecondary, setCustomSecondary] = useState(settings.themeSecondary || '#ba0a0f');
  const [customTertiary, setCustomTertiary] = useState(settings.themeTertiary || '#725c00');
  const [customOnSurface, setCustomOnSurface] = useState(settings.themeOnSurface || '#0c1d2b');
  const [showColorSuccess, setShowColorSuccess] = useState(false);

  // Notifications
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileNotification, setShowProfileNotification] = useState(false);

  // Privileges states
  const [localPrivileges, setLocalPrivileges] = useState<RolePrivilege[]>(rolePrivileges || []);
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);
  const [showPrivilegeNotification, setShowPrivilegeNotification] = useState(false);
  const [privilegeError, setPrivilegeError] = useState<string | null>(null);

  // Data recovery & security verification states
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [showWipeSuccess, setShowWipeSuccess] = useState(false);
  
  // Strict word confirmation
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [wipeConfirmText, setWipeConfirmText] = useState('');

  // Profile customization states
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatarUrl || AVATAR_PRESETS[0]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (rolePrivileges) {
      setLocalPrivileges(rolePrivileges);
    }
  }, [rolePrivileges]);

  // Sync profile values if current user changes from parent
  useEffect(() => {
    setProfileName(currentUser.name);
    setProfileEmail(currentUser.email);
    if (currentUser.avatarUrl) {
      setProfileAvatar(currentUser.avatarUrl);
    }
  }, [currentUser]);

  const AVAILABLE_VIEWS = [
    { id: 'dashboard', label: 'Tableau de bord', desc: 'Indicateurs clés de performance, alertes, alertes de contrats' },
    { id: 'devis', label: 'Devis & Offres', desc: 'Gestion et édition des devis pour clients et sponsors' },
    { id: 'factures', label: 'Factures', desc: 'Règlements, relances et conformité fiscale (TVA RDC)' },
    { id: 'projets', label: 'Projets & Suivi', desc: 'Suivi de carrière, transferts, et jalons d\'entraînement' },
    { id: 'taches', label: 'Tâches', desc: 'Rapports quotidiens et affectation de livrables opérationnels' },
    { id: 'finances', label: 'Finances & R&D', desc: 'Registre de trésorerie, flux de trésorerie de l\'agence' },
    { id: 'contrats', label: 'Générateur de Contrats', desc: 'Rédaction légale, mandats de transferts, homologations' },
    { id: 'contacts', label: 'Contacts CRM', desc: 'Annuaire athlètes, clubs partenaires, recruteurs de clubs' },
    { id: 'performances', label: 'Suivi Performances', desc: 'Fiches techniques, scores scouting radar, notes de matches' },
    { id: 'cartes', label: 'Cartes Elite NFC', desc: 'Attribution, encodage et désactivation des puces NFC' },
    { id: 'parametres', label: 'Configuration', desc: 'Identité corporative, taux de TVA de base, rôles & privilèges' },
  ];

  const handleToggleView = (viewId: string) => {
    const selectedRole = localPrivileges[selectedRoleIdx];
    if (selectedRole?.role === "Directeur Associé" && viewId === "parametres") {
      setPrivilegeError("Par sécurité, vous ne pouvez pas retirer l'accès à la Configuration pour le Directeur Associé.");
      setTimeout(() => setPrivilegeError(null), 5000);
      return;
    }

    const updated = localPrivileges.map((p, idx) => {
      if (idx !== selectedRoleIdx) return p;
      const isAllowed = p.allowedViews.includes(viewId);
      const newViews = isAllowed 
        ? p.allowedViews.filter(v => v !== viewId) 
        : [...p.allowedViews, viewId];
      return { ...p, allowedViews: newViews };
    });
    setLocalPrivileges(updated);
  };

  const handleToggleAction = (actionKey: 'canDeleteTransactions' | 'canResetDatabase' | 'canEditScoutingMetrics' | 'canGenerateContracts' | 'canIssueCards') => {
    const selectedRole = localPrivileges[selectedRoleIdx];
    if (selectedRole?.role === "Directeur Associé" && actionKey === "canResetDatabase") {
      setPrivilegeError("Le Directeur Associé doit conserver le droit de réinitialiser la base de données.");
      setTimeout(() => setPrivilegeError(null), 5000);
      return;
    }

    const updated = localPrivileges.map((p, idx) => {
      if (idx !== selectedRoleIdx) return p;
      return { ...p, [actionKey]: !p[actionKey] };
    });
    setLocalPrivileges(updated);
  };

  const handleSavePrivileges = () => {
    onSaveRolePrivileges(localPrivileges);
    setShowPrivilegeNotification(true);
    setTimeout(() => setShowPrivilegeNotification(false), 3000);
  };

  const handleSaveAgencySettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      companyName,
      rcNumber,
      address,
      phone,
      email,
      tvaDefault,
      defaultPaymentDueDays,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankSwift,
      directorName,
      directorTitle,
      isDemoRestoreLocked
    });
    
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      colorTheme: selectedTheme,
      themePrimary: customPrimary,
      themeSecondary: customSecondary,
      themeTertiary: customTertiary,
      themeOnSurface: customOnSurface
    });
    setShowColorSuccess(true);
    setTimeout(() => setShowColorSuccess(false), 3000);
  };

  // Profile customization submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    // If typing password change
    if (newPassword || confirmPassword) {
      if (newPassword.length < 4) {
        setPasswordError("Le mot de passe doit comporter au moins 4 caractères.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("Les deux mots de passe ne correspondent pas.");
        return;
      }
    }

    const hashedPassword = newPassword ? await hashPassword(newPassword) : undefined;

    const updatedUser = {
      ...currentUser,
      name: profileName,
      email: profileEmail,
      avatarUrl: profileAvatar,
      ...(hashedPassword ? { password: hashedPassword } : {})
    };

    onUpdateCurrentUser(updatedUser);

    // Sync with usersList
    setUsersList(prev => prev.map(u => {
      if (u.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) {
        return {
          ...u,
          name: profileName,
          email: profileEmail,
          avatarUrl: profileAvatar,
          ...(hashedPassword ? { password: hashedPassword } : {})
        };
      }
      return u;
    }));

    setShowProfileNotification(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setShowProfileNotification(false), 3000);
  };

  // Convert custom uploaded file to base64 string
  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // limit 1MB for localStorage safety
        alert("L'image est trop lourde. Veuillez choisir une photo de moins de 1 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Export full local database to JSON file
  const handleExportData = () => {
    try {
      const backup: Record<string, string> = {};
      const keys = [
        'ndembo_settings',
        'ndembo_contacts',
        'ndembo_projects',
        'ndembo_tasks',
        'ndembo_devis',
        'ndembo_factures',
        'ndembo_transactions',
        'ndembo_contracts',
        'ndembo_cards',
        'ndembo_role_privileges',
        'ndembo_users_list'
      ];
      keys.forEach(k => {
        const value = localStorage.getItem(k);
        if (value) {
          backup[k] = value;
        }
      });

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ndembo_kin_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erreur lors de l'exportation des données : " + err);
    }
  };

  // Import full local database from JSON file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Basic validation
        if (typeof parsed !== 'object' || parsed === null) {
          alert("Fichier de sauvegarde invalide.");
          return;
        }

        const keys = Object.keys(parsed);
        const hasNdemboKey = keys.some(k => k.startsWith('ndembo_'));
        if (!hasNdemboKey) {
          alert("Le fichier ne contient aucune donnée valide pour Ndembo Kin Connect.");
          return;
        }

        if (confirm("Êtes-vous sûr de vouloir importer ces données ? Cela remplacera TOUTES vos données actuelles (contacts, contrats, finances, paramètres, etc.).")) {
          keys.forEach(k => {
            if (k.startsWith('ndembo_')) {
              localStorage.setItem(k, parsed[k]);
            }
          });
          alert("Données importées avec succès ! L'application va se recharger.");
          window.location.reload();
        }
      } catch (err) {
        alert("Erreur lors de l'importation : " + err);
      }
    };
    reader.readAsText(file);
  };

  // User List helper methods
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormRole(rolePrivileges[1]?.role || 'Manager Principal'); // Default to second privilege role if available
    setFormPassword('');
    setFormAvatar(AVATAR_PRESETS[0]);
    setUserFormError(null);
    setIsUserFormOpen(true);
  };

  const handleOpenEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword(user.password || '');
    setFormAvatar(user.avatarUrl || AVATAR_PRESETS[0]);
    setUserFormError(null);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (userId: string, emailStr: string) => {
    if (emailStr.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) {
      alert("Erreur : Vous ne pouvez pas supprimer l'utilisateur actuellement connecté !");
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer le collaborateur ${emailStr} ?`)) {
      setUsersList(prev => prev.filter(u => u.id !== userId));
      setUserSuccessMessage("Collaborateur supprimé avec succès.");
      setShowUserSuccess(true);
      setTimeout(() => setShowUserSuccess(false), 3000);
    }
  };

  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    if (!formName.trim() || !formEmail.trim()) {
      setUserFormError("Veuillez remplir tous les champs obligatoires (Nom et Email).");
      return;
    }

    if (formPassword.length > 0 && formPassword.length < 4) {
      setUserFormError("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }

    const emailClean = formEmail.toLowerCase().trim();

    // Check if email already taken
    const duplicate = usersList.find(u => 
      u.email.toLowerCase().trim() === emailClean && 
      (!editingUser || u.id !== editingUser.id)
    );

    if (duplicate) {
      setUserFormError("Cette adresse email est déjà enregistrée pour un autre utilisateur.");
      return;
    }

    const hashedInputPassword = formPassword ? await hashPassword(formPassword) : undefined;

    if (editingUser) {
      // Edit User
      const updatedList = usersList.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formName.trim(),
            email: emailClean,
            role: formRole,
            avatarUrl: formAvatar,
            ...(hashedInputPassword ? { password: hashedInputPassword } : {})
          };
        }
        return u;
      });
      setUsersList(updatedList);
      
      // If editing currently logged in user, sync current user state too
      if (editingUser.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) {
        onUpdateCurrentUser({
          ...currentUser,
          name: formName.trim(),
          email: emailClean,
          role: formRole,
          avatarUrl: formAvatar,
          ...(hashedInputPassword ? { password: hashedInputPassword } : {})
        });
      }

      setUserSuccessMessage(`L'utilisateur ${formName} a été mis à jour.`);
    } else {
      // Add User
      const defaultPass = formPassword || 'admin1234';
      const hashedPassword = await hashPassword(defaultPass);
      const newUser: SystemUser = {
        id: 'usr_' + Date.now(),
        name: formName.trim(),
        email: emailClean,
        role: formRole,
        password: hashedPassword,
        avatarUrl: formAvatar
      };
      setUsersList([...usersList, newUser]);
      setUserSuccessMessage(`Le collaborateur ${formName} a été ajouté avec succès.`);
    }

    setShowUserSuccess(true);
    setIsUserFormOpen(false);
    setTimeout(() => setShowUserSuccess(false), 4000);
  };

  // Check role authorization for database maintenance tools
  const hasDBControlPrivilege = currentUser.role === 'Directeur Associé' || currentUser.role === 'Directeur';

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in" id="settings_view">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 gap-4 mb-2">
        <button
          type="button"
          onClick={() => setActiveTab('agency')}
          className={`pb-3 text-sm font-heading font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'agency' ? 'border-[#00628f] text-[#00628f]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Landmark className="w-4.5 h-4.5" />
          <span>🏢 Paramètres de l'Agence</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-heading font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile' ? 'border-[#00628f] text-[#00628f]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-4.5 h-4.5" />
          <span>👤 Mon Profil &amp; Sécurité</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-heading font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'users' ? 'border-[#00628f] text-[#00628f]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>👥 Collaborateurs</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={`pb-3 text-sm font-heading font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'colors' ? 'border-[#00628f] text-[#00628f]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Palette className="w-4.5 h-4.5" />
          <span>🎨 Identité Visuelle</span>
        </button>
      </div>

      {activeTab === 'agency' ? (
        <>
          {/* Agency Form tab */}
          {showNotification && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-2 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">Paramètres de l'agence Ndembo Kin sauvegardés avec succès !</span>
            </div>
          )}

          <form onSubmit={handleSaveAgencySettings} className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Settings className="w-6 h-6 text-[#00628f]" />
                <div>
                  <h3 className="font-heading font-extrabold text-on-surface text-base">Configuration des Paramètres Métier</h3>
                  <p className="text-xs text-[#6f7881]">Entête légal, taxation RDC, et configurations monétaires des impressions</p>
                </div>
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Enregistrer</span>
              </button>
            </div>

            {/* Grid 1: Basic coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Raison Sociale de l'Agence</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-3 pr-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Numéro Registre de Commerce (RC)</label>
                <input
                  type="text"
                  required
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Adresse Physique Principale (RDC)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#6f7881]" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Téléphone Commercial</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[#6f7881]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Courriel de Contact Officiel</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#6f7881]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Taux de TVA Standard (%) (RDC)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={tvaDefault}
                  onChange={(e) => setTvaDefault(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Délai d'Échéance Factures (jours)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={defaultPaymentDueDays}
                  onChange={(e) => setDefaultPaymentDueDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Bank detail sub-segment */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center gap-1.5">
                <Landmark className="w-5 h-5 text-[#00628f]" />
                <h4 className="font-heading font-extrabold text-xs text-on-surface uppercase tracking-tight">Coordonnées Bancaires de l'Agence</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Nom de la Banque émettrice</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Intitulé de Compte (Bénéficiaire)</label>
                  <input
                    type="text"
                    required
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Numéro de Compte Bancaire (IBAN/Nº)</label>
                  <input
                    type="text"
                    required
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Code SWIFT / BIC</label>
                  <input
                    type="text"
                    required
                    value={bankSwift}
                    onChange={(e) => setBankSwift(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Official signatory sub-segment */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-[#00628f]" />
                <h4 className="font-heading font-extrabold text-xs text-on-surface uppercase tracking-tight">Signataire Légal des Actes (Contrats/Devis)</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Nom complet du Signataire</label>
                  <input
                    type="text"
                    required
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Qualité / Titre du Signataire</label>
                  <input
                    type="text"
                    required
                    value={directorTitle}
                    onChange={(e) => setDirectorTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Persistence Security Switch */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center gap-1.5">
                <LockKeyhole className="w-5 h-5 text-amber-600" />
                <h4 className="font-heading font-extrabold text-xs text-on-surface uppercase tracking-tight">Verrouillage de Sécurité Production</h4>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                <input
                  type="checkbox"
                  id="isDemoRestoreLocked"
                  checked={isDemoRestoreLocked}
                  onChange={(e) => setIsDemoRestoreLocked(e.target.checked)}
                  className="mt-0.5 rounded text-[#00628f] focus:ring-[#00628f] cursor-pointer"
                />
                <label htmlFor="isDemoRestoreLocked" className="cursor-pointer font-medium select-none">
                  <strong className="block font-bold">Bloquer définitivement la restauration de démo pour la sécurité des données réelles</strong>
                  <span>Une fois cette case cochée et enregistrée, l'option de restauration de démonstration sera entièrement verrouillée. Recommandé dès que vous commencez à saisir de vrais athlètes et contrats.</span>
                </label>
              </div>
            </div>
          </form>

          {/* Roles & Privileges control panel */}
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-6 h-6 text-[#00628f]" />
                <div>
                  <h3 className="font-heading font-extrabold text-on-surface text-base">Habilitations &amp; Contrôle d'Accès par Rôle</h3>
                  <p className="text-xs text-[#6f7881]">Configurez les modules et actions critiques autorisés pour chaque profil utilisateur</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSavePrivileges}
                className="bg-primary hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer ml-auto"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Enregistrer les Habilitations</span>
              </button>
            </div>

            {showPrivilegeNotification && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3.5 rounded-r-lg flex items-center gap-2 shadow-xs">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-800">Privilèges et d'habilitations de rôles sauvegardés avec succès !</span>
              </div>
            )}

            {privilegeError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-lg flex items-center gap-2 shadow-xs">
                <Lock className="w-4.5 h-4.5 text-red-600" />
                <span className="text-[11px] font-semibold text-red-800">{privilegeError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Role Selection Column */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono font-bold text-[#6f7881] uppercase tracking-wider px-1">Sélectionner un Profil</span>
                <div className="space-y-1.5">
                  {localPrivileges.map((p, idx) => (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => setSelectedRoleIdx(idx)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        selectedRoleIdx === idx
                          ? 'bg-[#00628f]/10 border-[#00628f] text-[#00628f]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{p.role}</span>
                      {selectedRoleIdx === idx && (
                        <div className="w-1.5 h-1.5 bg-[#00628f] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right privileges mapping */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-[#f7f9ff] border border-[#bec8d2]/30 p-4 rounded-xl">
                  <span className="block text-[10px] font-mono font-bold text-[#00628f] uppercase tracking-wider mb-2">
                    ACCÈS AUX MODULES : {localPrivileges[selectedRoleIdx]?.role}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                    {AVAILABLE_VIEWS.map((view) => {
                      const isAllowed = localPrivileges[selectedRoleIdx]?.allowedViews.includes(view.id);
                      return (
                        <button
                          key={view.id}
                          type="button"
                          onClick={() => handleToggleView(view.id)}
                          className="flex items-start gap-2 text-left p-2.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg text-xs transition-colors cursor-pointer group select-none"
                        >
                          <div className="mt-0.5 shrink-0">
                            {isAllowed ? (
                              <CheckSquare className="w-4 h-4 text-[#00628f]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">{view.label}</span>
                            <span className="text-[9px] text-slate-400 leading-tight block">{view.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions Privileges Section */}
                <div className="bg-[#fffdf7] border border-amber-100 p-4 rounded-xl space-y-3">
                  <span className="block text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                    ACTIONS EXÉCUTIVES CRITIQUES : {localPrivileges[selectedRoleIdx]?.role}
                  </span>

                  <div className="space-y-3">
                    {/* Action 1: canEditScoutingMetrics */}
                    <div className="flex items-center justify-between text-xs py-1">
                      <div>
                        <span className="font-semibold text-slate-800 block">Saisie des Scores Techniques Scouting</span>
                        <span className="text-[10px] text-[#6f7881]">Droit de modifier les notes de performance des fiches athlétiques</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAction('canEditScoutingMetrics')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          localPrivileges[selectedRoleIdx]?.canEditScoutingMetrics ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          localPrivileges[selectedRoleIdx]?.canEditScoutingMetrics ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Action 2: canGenerateContracts */}
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-50">
                      <div>
                        <span className="font-semibold text-slate-800 block">Génération Légale de Contrats</span>
                        <span className="text-[10px] text-[#6f7881]">Droit de concevoir et imprimer de nouveaux contrats d'athlètes</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAction('canGenerateContracts')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          localPrivileges[selectedRoleIdx]?.canGenerateContracts ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          localPrivileges[selectedRoleIdx]?.canGenerateContracts ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Action 3: canIssueCards */}
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-50">
                      <div>
                        <span className="font-semibold text-slate-800 block">Attribution des Cartes NFC Elite</span>
                        <span className="text-[10px] text-[#6f7881]">Droit de générer des jetons et d'encoder des puces de détection</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAction('canIssueCards')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          localPrivileges[selectedRoleIdx]?.canIssueCards ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          localPrivileges[selectedRoleIdx]?.canIssueCards ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Action 4: canDeleteTransactions */}
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-50">
                      <div>
                        <span className="font-semibold text-slate-800 block">Suppression d'Écritures Comptables</span>
                        <span className="text-[10px] text-[#6f7881]">Droit de retirer des transactions financières ou des recettes</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAction('canDeleteTransactions')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          localPrivileges[selectedRoleIdx]?.canDeleteTransactions ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          localPrivileges[selectedRoleIdx]?.canDeleteTransactions ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Action 5: canResetDatabase */}
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-50">
                      <div>
                        <span className="font-semibold text-[#ba0a0f] block flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4" />
                          Réinitialisation Totale de la Base de Données
                        </span>
                        <span className="text-[10px] text-[#6f7881]">Droit d'effacer les modifications et restaurer le jeu d'essai</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAction('canResetDatabase')}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          localPrivileges[selectedRoleIdx]?.canResetDatabase ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                          localPrivileges[selectedRoleIdx]?.canResetDatabase ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Restore JSON block */}
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
            <div>
              <h4 className="font-heading font-extrabold text-sm text-on-surface uppercase tracking-tight flex items-center gap-1.5">
                <Download className="w-5 h-5 text-primary" />
                <span>Sauvegarde &amp; Restauration Manuelle</span>
              </h4>
              <p className="text-xs text-[#6f7881]">Téléchargez une copie de vos données Ndembo Kin Connect ou restaurez une sauvegarde précédente pour éviter toute perte accidentelle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Box */}
              <div className="flex flex-col justify-between p-5 rounded-xl border border-[#bec8d2]/30 bg-slate-50/50 space-y-4">
                <div className="space-y-1 text-xs">
                  <span className="font-mono font-bold text-primary flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    EXPORTER TOUTES LES DONNÉES
                  </span>
                  <p className="text-[#3f4850] leading-relaxed">
                    Générez et téléchargez un fichier de sauvegarde JSON contenant l'intégralité de vos athlètes, contrats, devis, factures, transactions financières et paramètres.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="bg-primary hover:bg-[#007cb4] text-white font-heading font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer w-full transition-transform hover:scale-[1.01]"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Exporter les données (.json)</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="flex flex-col justify-between p-5 rounded-xl border border-[#bec8d2]/30 bg-slate-50/50 space-y-4">
                <div className="space-y-1 text-xs">
                  <span className="font-mono font-bold text-primary flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    RESTAURER DEPUIS UN FICHIER
                  </span>
                  <p className="text-[#3f4850] leading-relaxed">
                    Sélectionnez un fichier de sauvegarde Ndembo Kin JSON précédemment exporté pour remplacer intégralement vos données actuelles. Attention, cette action est irréversible.
                  </p>
                </div>
                <label className="bg-slate-800 hover:bg-slate-900 text-white font-heading font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer w-full text-center transition-transform hover:scale-[1.01]">
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>Importer un fichier (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Database control sector with administrative locks and security verifications */}
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
            <div>
              <h4 className="font-heading font-extrabold text-sm text-on-surface uppercase tracking-tight flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
                <span>Outils d'Administration &amp; Maintenance Base</span>
              </h4>
              <p className="text-xs text-[#6f7881]">Maintenance système de la base de données Ndembo Kin localState et sécurité de production</p>
            </div>

            {/* Global Success Banners */}
            {showResetSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-2 shadow-xs animate-fade-in">
                <ShieldCheck className="w-5 h-5 text-emerald-600 animate-bounce" />
                <span className="text-xs font-semibold text-emerald-800">🎉 Données d'essai restaurées avec succès ! Les filtres et athlètes d'origine ont été réappliqués.</span>
              </div>
            )}

            {showWipeSuccess && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-center gap-2 shadow-xs animate-fade-in">
                <ShieldCheck className="w-5 h-5 text-blue-600 animate-bounce" />
                <span className="text-xs font-semibold text-blue-800">🎉 Base de données vidée de ses démos ! Prêt pour configurer votre Raison Sociale et ajouter vos propres athlètes.</span>
              </div>
            )}

            {!hasDBControlPrivilege ? (
              // Access Denied Banner for system tools if role is restricted
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center space-y-3">
                <Lock className="w-8 h-8 text-[#ba0a0f]" />
                <span className="font-heading font-bold text-xs text-slate-800">Accès Administration Bloqué</span>
                <p className="text-[10px] text-slate-500 max-w-md">
                  Seuls les profils d'administration (<strong>Directeur Associé</strong>, <strong>Directeur</strong>) possèdent les privilèges requis pour vider ou restaurer la base de données Ndembo Kin Connect.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Box 1: Demo reset with strict security lock */}
                <div className="flex flex-col justify-between p-5 rounded-xl border border-[#bec8d2]/30 bg-[#f7f9ff] space-y-4">
                  <div className="space-y-1 text-xs">
                    <span className="font-mono font-bold text-primary flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4" />
                      RESTAURER LES DONNÉES D'ESSAI
                    </span>
                    <p className="text-[#3f4850] leading-relaxed">
                      Efface toutes vos modifications actuelles et réapplique le jeu d'essai standard (athlètes de démonstration, fausses factures, etc.) pour vous entraîner.
                    </p>
                  </div>

                  {isDemoRestoreLocked ? (
                    // Persistent Lock Banner
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[10px] text-amber-800 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Restauration démo verrouillée pour protéger vos vraies données réelles saisies.</span>
                    </div>
                  ) : !showConfirmReset ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowConfirmReset(true);
                        setShowConfirmWipe(false);
                        setResetConfirmText('');
                      }}
                      className="bg-slate-700 hover:bg-slate-800 text-white font-heading font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer w-full transition-transform hover:scale-[1.01]"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-white" />
                      <span>Restaurer la démo</span>
                    </button>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 animate-fade-in text-xs">
                      <p className="text-[11px] font-bold text-slate-800">🔄 Saisir le mot <strong className="text-red-600">RESTAURER</strong> pour déverrouiller l'action :</p>
                      
                      <input
                        type="text"
                        placeholder="Tapez RESTAURER"
                        value={resetConfirmText}
                        onChange={(e) => setResetConfirmText(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-primary focus:outline-none uppercase font-mono"
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={resetConfirmText.trim().toUpperCase() !== 'RESTAURER'}
                          onClick={() => {
                            onResetData();
                            setShowConfirmReset(false);
                            setShowResetSuccess(true);
                            setResetConfirmText('');
                            setTimeout(() => setShowResetSuccess(false), 4000);
                          }}
                          className={`flex-1 text-[11px] font-bold py-1.5 rounded-md cursor-pointer text-center ${
                            resetConfirmText.trim().toUpperCase() === 'RESTAURER'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Oui, Restaurer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowConfirmReset(false);
                            setResetConfirmText('');
                          }}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold py-1.5 rounded-md cursor-pointer text-center"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Box 2: Clean slate production with typing lock */}
                <div className="flex flex-col justify-between p-5 rounded-xl border border-red-100 bg-red-50/50 space-y-4">
                  <div className="space-y-1 text-xs">
                    <span className="font-mono font-bold text-[#ba0a0f] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#ba0a0f]" />
                      MODE PRODUCTION : VIDER LA BASE
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Recommandé pour démarrer :</strong> Supprime définitivement toutes les données d'essai pour vous laisser un tableau de bord vide, prêt à accueillir vos propres athlètes, contrats et factures.
                    </p>
                  </div>

                  {!showConfirmWipe ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowConfirmWipe(true);
                        setShowConfirmReset(false);
                        setWipeConfirmText('');
                      }}
                      className="bg-[#ba0a0f] hover:bg-[#de2d25] text-white font-heading font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm cursor-pointer w-full transition-transform hover:scale-[1.01]"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-white" />
                      <span>Vider la base (Mode Production)</span>
                    </button>
                  ) : (
                    <div className="bg-white border border-red-100 rounded-lg p-3 space-y-2 animate-fade-in text-xs">
                      <p className="text-[11px] font-bold text-red-700">⚠️ Saisir le mot <strong className="text-red-600">VIDER</strong> pour effacer TOUTES les données :</p>
                      
                      <input
                        type="text"
                        placeholder="Tapez VIDER"
                        value={wipeConfirmText}
                        onChange={(e) => setWipeConfirmText(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-red-200 rounded focus:ring-1 focus:ring-red-500 focus:outline-none uppercase font-mono"
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={wipeConfirmText.trim().toUpperCase() !== 'VIDER'}
                          onClick={() => {
                            onWipeAllData();
                            setShowConfirmWipe(false);
                            setShowWipeSuccess(true);
                            setWipeConfirmText('');
                            setTimeout(() => setShowWipeSuccess(false), 5000);
                          }}
                          className={`flex-1 text-[11px] font-bold py-1.5 rounded-md cursor-pointer text-center ${
                            wipeConfirmText.trim().toUpperCase() === 'VIDER'
                              ? 'bg-[#ba0a0f] hover:bg-[#de2d25] text-white'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Oui, Vider la base
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowConfirmWipe(false);
                            setWipeConfirmText('');
                          }}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold py-1.5 rounded-md cursor-pointer text-center"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : activeTab === 'profile' ? (
        /* User Profile customization tab */
        <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <User className="w-6 h-6 text-[#00628f]" />
              <div>
                <h3 className="font-heading font-extrabold text-on-surface text-base">Mon Profil Utilisateur &amp; Identifiants</h3>
                <p className="text-xs text-[#6f7881]">Personnalisez votre avatar, vos informations de contact et changez votre mot de passe d'accès</p>
              </div>
            </div>
          </div>

          {showProfileNotification && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-2 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">Vos informations de profil ont été mises à jour avec succès !</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Avatar block with drag or click selector */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <img
                  src={profileAvatar}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full border-4 border-[#00628f] object-cover bg-slate-100 shadow-sm"
                />
                <label className="absolute bottom-0 right-0 bg-[#00628f] hover:bg-primary-dark text-white p-2 rounded-full cursor-pointer shadow-md transition-transform hover:scale-105" title="Télécharger une photo">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3 w-full">
                <span className="text-xs font-heading font-extrabold text-slate-700 block">Choisissez un Avatar Prédéfini ou importez votre photo :</span>
                
                {/* 4 luxurious sporty avatar presets */}
                <div className="flex gap-3">
                  {AVATAR_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setProfileAvatar(preset)}
                      className={`relative rounded-full overflow-hidden w-11 h-11 border-2 transition-all cursor-pointer ${
                        profileAvatar === preset ? 'border-[#ffe07f] ring-2 ring-[#00628f]' : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                      {profileAvatar === preset && (
                        <div className="absolute inset-0 bg-[#00628f]/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-[#ffe07f] font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400">
                  Formati acceptés : PNG, JPEG. Taille maximale conseillée : 1 Mo. Le format carré est recommandé.
                </p>
              </div>
            </div>

            {/* User identification settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Nom complet d'Utilisateur</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Courriel de connexion</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Rôle de sécurité affecté (Non modifiable)</label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-[#0c1d2b] flex items-center justify-between">
                  <span>{currentUser.role}</span>
                  <span className="text-[10px] font-mono bg-[#0c1d2b]/10 text-[#0c1d2b] px-2 py-0.5 rounded uppercase">Rôle Principal</span>
                </div>
              </div>
            </div>

            {/* Password Update Segment */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-5 h-5 text-[#00628f]" />
                <h4 className="font-heading font-extrabold text-xs text-on-surface uppercase tracking-tight">Sécurité : Modifier mon Mot de Passe</h4>
              </div>

              {passwordError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-800 font-medium">
                  {passwordError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Nouveau Mot de Passe d'Accès</label>
                  <input
                    type="password"
                    placeholder="Saisir au moins 4 caractères"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6f7881]">Confirmer le Mot de Passe</label>
                  <input
                    type="password"
                    placeholder="Saisir de nouveau"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="bg-primary hover:bg-[#005177] text-white px-5 py-2.5 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Mettre à jour mon profil</span>
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'users' ? (
        /* Users and Collaborators List View */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {showUserSuccess && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-2 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">{userSuccessMessage}</span>
            </div>
          )}

          {/* Core User List Card */}
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2.5">
                <Users className="w-6 h-6 text-[#00628f]" />
                <div>
                  <h3 className="font-heading font-extrabold text-on-surface text-base">Gestion des Collaborateurs &amp; Utilisateurs</h3>
                  <p className="text-xs text-[#6f7881]">Gérez les comptes d'accès de votre équipe et attribuez-leur des rôles de sécurité</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenAddUser}
                className="bg-[#00628f] hover:bg-[#005177] text-white px-4 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 self-start sm:self-auto shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un collaborateur</span>
              </button>
            </div>

            {/* List Table / Grid */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-mono text-[10px] text-[#6f7881] uppercase tracking-wider">
                    <th className="py-3 px-4 font-extrabold">Collaborateur</th>
                    <th className="py-3 px-4 font-extrabold">Courriel</th>
                    <th className="py-3 px-4 font-extrabold">Rôle affecté</th>
                    <th className="py-3 px-4 font-extrabold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {usersList.map((user) => {
                    const isSelf = user.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={user.avatarUrl || AVATAR_PRESETS[0]}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="block font-bold text-slate-900">{user.name}</span>
                            {isSelf && (
                              <span className="inline-block text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono uppercase font-bold mt-0.5">Vous-même</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#6f7881]">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.role === 'Directeur Associé' ? 'bg-[#ffe07f]/20 text-[#856404]' :
                            user.role === 'Manager Principal' ? 'bg-[#0083ca]/10 text-[#00628f]' :
                            user.role === 'Administrateur Finance' ? 'bg-emerald-50 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              user.role === 'Directeur Associé' ? 'bg-amber-500' :
                              user.role === 'Manager Principal' ? 'bg-blue-500' :
                              user.role === 'Administrateur Finance' ? 'bg-emerald-500' :
                              'bg-slate-400'
                            }`} />
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(user)}
                              className="p-1.5 text-slate-500 hover:text-[#00628f] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isSelf
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                              title={isSelf ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Overlay to Add/Edit Collaborator */}
          {isUserFormOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-[#bec8d2]/70 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-[#00628f] text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#ffe07f]" />
                    <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider">
                      {editingUser ? 'Modifier le Collaborateur' : 'Créer un Compte Collaborateur'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUserFormOpen(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveUserSubmit} className="p-6 space-y-4">
                  {userFormError && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-xs font-semibold rounded-r">
                      {userFormError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Nom complet du collaborateur *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Jean-Luc Kipulu"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Courriel de connexion *</label>
                      <input
                        type="email"
                        required
                        placeholder="collaborateur@ndembokin.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-mono focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Rôle de Sécurité *</label>
                      <select
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      >
                        {rolePrivileges.map((p) => (
                          <option key={p.role} value={p.role}>{p.role}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">
                        {editingUser ? 'Nouveau mot de passe d\'accès (Laissez vide pour conserver)' : 'Mot de passe d\'accès (Facultatif - Défaut: admin1234)'}
                      </label>
                      <input
                        type="password"
                        placeholder={editingUser ? "Insérer un nouveau mot de passe" : "Saisir au moins 4 caractères ou laisser vide"}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Preset Avatar choice in Add/Edit user form */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#6f7881] block">Sélectionnez une Photo d'Avatar :</span>
                    <div className="flex gap-3">
                      {AVATAR_PRESETS.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormAvatar(preset)}
                          className={`relative rounded-full overflow-hidden w-10 h-10 border-2 transition-all cursor-pointer ${
                            formAvatar === preset ? 'border-[#ffe07f] ring-2 ring-[#00628f]' : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <img src={preset} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                          {formAvatar === preset && (
                            <div className="absolute inset-0 bg-[#00628f]/20 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-[#ffe07f] font-bold" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsUserFormOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-[#00628f] hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingUser ? 'Enregistrer les modifications' : 'Créer le collaborateur'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Color Manager View */
        <div className="space-y-6 animate-in fade-in duration-200">
          {showColorSuccess && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-2 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">
                Charte graphique mise à jour avec succès ! Les modifications s'appliquent en temps réel.
              </span>
            </div>
          )}

          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Palette className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-heading font-extrabold text-on-surface text-base">Gestionnaire de Couleurs &amp; Marque Blanche</h3>
                  <p className="text-xs text-[#6f7881]">Configurez l'identité visuelle de la plateforme pour correspondre à votre marque ou à vos clients.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveTheme} className="space-y-8">
              {/* Presets Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-heading font-extrabold text-slate-800">Palettes de Couleurs Prédéfinies</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'default', name: 'Bleu Ndémbo (Défaut)', primary: '#00628f', secondary: '#ba0a0f', tertiary: '#725c00', onSurface: '#0c1d2b', description: 'Le bleu institutionnel d\'origine.' },
                    { id: 'athletic', name: 'Vert Athlétique', primary: '#0d7a5f', secondary: '#ca4110', tertiary: '#b48c00', onSurface: '#071f1a', description: 'Ambiance gazon et accents ocre.' },
                    { id: 'imperial', name: 'Rouge Impérial', primary: '#9e1015', secondary: '#1e4a7a', tertiary: '#cf9f04', onSurface: '#1c0507', description: 'Prestige et leadership d\'élite.' },
                    { id: 'carbon', name: 'Charbon FAsopot', primary: '#2f3542', secondary: '#747d8c', tertiary: '#ffa502', onSurface: '#1e2229', description: 'Le design corporate moderne signé FAsopot.' },
                    { id: 'electric', name: 'Digital Néon', primary: '#3b82f6', secondary: '#ec4899', tertiary: '#10b981', onSurface: '#0b0f19', description: 'Haute technologie et nuances néon.' },
                    { id: 'custom', name: '🎨 Sur-Mesure (Personnalisé)', primary: customPrimary, secondary: customSecondary, tertiary: customTertiary, onSurface: customOnSurface, description: 'Saisissez vos propres codes couleurs hexadécimaux ci-dessous.' }
                  ].map((themePreset) => {
                    const isSelected = selectedTheme === themePreset.id;
                    return (
                      <button
                        key={themePreset.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(themePreset.id);
                          if (themePreset.id !== 'custom') {
                            setCustomPrimary(themePreset.primary);
                            setCustomSecondary(themePreset.secondary);
                            setCustomTertiary(themePreset.tertiary);
                            setCustomOnSurface(themePreset.onSurface);
                          }
                        }}
                        className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between h-full space-y-3 ${
                          isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{themePreset.name}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal mt-1">{themePreset.description}</p>
                        </div>

                        {/* Color Blocks */}
                        <div className="flex gap-1.5 pt-1">
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: themePreset.primary }} title="Primaire" />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: themePreset.secondary }} title="Secondaire" />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: themePreset.tertiary }} title="Tertiaire" />
                          <div className="w-5 h-5 rounded" style={{ backgroundColor: themePreset.onSurface }} title="Arrière-plan" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Settings */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-heading font-extrabold text-slate-800">
                    Ajustement Précis des Couleurs {selectedTheme !== 'custom' && "(Sera configuré en 'Sur-Mesure')"}
                  </h4>
                  {selectedTheme !== 'custom' && (
                    <button
                      type="button"
                      onClick={() => setSelectedTheme('custom')}
                      className="text-[10px] bg-primary/10 text-primary font-mono font-bold px-2 py-1 rounded hover:bg-primary/20"
                    >
                      Activer le Sur-Mesure
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Primary */}
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/60">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881] block">Couleur Primaire</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customPrimary}
                        onChange={(e) => {
                          setCustomPrimary(e.target.value);
                          setSelectedTheme('custom');
                        }}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customPrimary}
                        onChange={(e) => {
                          setCustomPrimary(e.target.value);
                          setSelectedTheme('custom');
                        }}
                        className="w-full text-xs font-mono px-2 py-1 border border-slate-300 rounded focus:outline-none"
                        placeholder="#000000"
                      />
                    </div>
                    <span className="text-[9px] text-[#6f7881] block font-medium">Boutons, onglets actifs, barres de navigation latérales</span>
                  </div>

                  {/* Secondary */}
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/60">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881] block">Couleur Secondaire</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customSecondary}
                        onChange={(e) => {
                          setCustomSecondary(e.target.value);
                          setSelectedTheme('custom');
                        }}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customSecondary}
                        onChange={(e) => {
                          setCustomSecondary(e.target.value);
                          setSelectedTheme('custom');
                        }}
                        className="w-full text-xs font-mono px-2 py-1 border border-slate-300 rounded focus:outline-none"
                        placeholder="#000000"
                      />
                    </div>
                    <span className="text-[9px] text-[#6f7881] block font-medium">Bouton de raccourci, contrats, alertes et accents rouges</span>
                  </div>

                  {/* Tertiary */}
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/60">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881] block">Couleur Tertiaire</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customTertiary}
                        onChange={(e) => {
                          setCustomTertiary(e.target.value);
                          setSelectedTheme('custom');
                        }}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTertiary}
                        onChange={(e) => {
                          setCustomTertiary(e.target.value);
                          setSelectedTheme('custom');
                        }}
                        className="w-full text-xs font-mono px-2 py-1 border border-slate-300 rounded focus:outline-none"
                        placeholder="#000000"
                      />
                    </div>
                    <span className="text-[9px] text-[#6f7881] block font-medium">Étoiles d'évaluation, surbrillance d'importance, badges or</span>
                  </div>

                  {/* On Surface */}
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/60">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881] block">Texte &amp; En-Tête Foncé</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customOnSurface}
                        onChange={(e) => {
                          setCustomOnSurface(e.target.value);
                          setSelectedTheme('custom');
                        }}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customOnSurface}
                        onChange={(e) => {
                          setCustomOnSurface(e.target.value);
                          setSelectedTheme('custom');
                        }}
                        className="w-full text-xs font-mono px-2 py-1 border border-slate-300 rounded focus:outline-none"
                        placeholder="#000000"
                      />
                    </div>
                    <span className="text-[9px] text-[#6f7881] block font-medium">En-tête et titres principaux, arrières-plans sombres</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Preview Block */}
              <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
                <span className="text-xs font-heading font-extrabold text-slate-800 block">Aperçu en Direct de l'Interface</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Mock Sidebar */}
                  <div className="rounded-xl border border-slate-100 p-4 space-y-4" style={{ backgroundColor: customOnSurface, color: '#ffffff' }}>
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <div className="w-6 h-6 rounded bg-white/20" />
                      <span className="text-xs font-black italic uppercase">MOCK<span style={{ color: customTertiary }}>UP</span></span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 rounded text-[10px] font-extrabold flex justify-between items-center" style={{ backgroundColor: customPrimary }}>
                        <span>Tableau de bord</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div className="p-2 rounded text-[10px] text-white/70">
                        <span>Projets et Suivi</span>
                      </div>
                    </div>
                    <button type="button" className="w-full text-center py-2 rounded text-[10px] font-bold text-white transition-transform" style={{ backgroundColor: customSecondary }}>
                      Action Spécifique
                    </button>
                  </div>

                  {/* Mock Content area */}
                  <div className="md:col-span-2 rounded-xl border border-slate-250 bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4" style={{ color: customPrimary }} />
                        <span className="text-xs font-bold text-slate-900">Rapport d'activité</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${customPrimary}1a`, color: customPrimary }}>
                        Nouveau
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-600 leading-normal">
                        Ceci est une simulation de l'aspect général de vos widgets et boutons de navigation avec le thème actuel.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button type="button" className="px-3 py-1.5 rounded text-[10px] font-bold text-white cursor-pointer" style={{ backgroundColor: customPrimary }}>
                          Bouton Primaire
                        </button>
                        <button type="button" className="px-3 py-1.5 rounded text-[10px] font-bold text-white cursor-pointer" style={{ backgroundColor: customSecondary }}>
                          Bouton Alerte
                        </button>
                        <button type="button" className="px-3 py-1.5 rounded text-[10px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 cursor-pointer">
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-primary hover:bg-[#005177] text-white px-6 py-2.5 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer l'Identité Visuelle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
