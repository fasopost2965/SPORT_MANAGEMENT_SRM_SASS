/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ScoutMetrics {
  vitesse: number; // 0-100
  technique: number; // 0-100
  physique: number; // 0-100
  tactique: number; // 0-100
  mental: number; // 0-100
  regularite: number; // 0-100
}

export type ContactType = 'Athlète' | 'Particulier' | 'Entreprise' | 'Agence partenaire' | 'Sponsor';

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email: string;
  phone: string;
  address: string;
  level?: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Pro' | 'Elite' | 'Senior' | 'Junior'; // for athletes
  sport?: string; // for athletes
  currentTeam?: string; // for athletes
  budgetRange?: string; // for sponsors/corporates
  RC_SIRET?: string; // for enterprises
  sector?: string; // for enterprises
  notes?: string;
  dateCreated: string;
  scoutMetrics?: ScoutMetrics; // sports scouting evaluations
  // Sports performance extensions
  biometrics?: {
    taille?: number; // in cm
    poids?: number; // in kg
    piedFort?: string; // Gauche, Droit, Ambidextre
    poste?: string; // Position (Ailier, Pivot, Sprinteur...)
  };
  performanceHistory?: Array<{
    id: string;
    date: string;
    matchName: string;
    note: number; // 0-10
    goals?: number;
    assists?: number;
    minutesPlayed: number;
    comment: string;
  }>;
  injuryStatus?: 'Disponible' | 'Blessé' | 'En réhabilitation';
  marketValue?: number; // Current valuation in EUR
  marketValueHistory?: Array<{
    date: string;
    value: number;
  }>;
}

export type TaskPriority = 'Haute' | 'Moyenne' | 'Basse';
export type TaskStatus = 'À faire' | 'En cours' | 'Terminé';
export type TaskCategory = 'Management' | 'Consulting' | 'Recrutement' | 'Contract' | 'Autre';

export interface Task {
  id: string;
  projectId: string;
  projectOptionalName?: string;
  title: string;
  priority: TaskPriority;
  startDate: string;
  endDate: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  progress: number; // percentage (0-100)
}

export type ProjectStatus = 'Planifié' | 'En cours' | 'Terminé' | 'En retard';

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  budget: number;
  startDate: string;
  endDate: string;
  description: string;
  status: ProjectStatus;
  progress: number; // percentage, automatically computed from tasks progress
}

export interface DevisLineItem {
  id: string;
  serviceName: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export type DevisStatus = 'En attente' | 'Validé' | 'Refusé' | 'Converti';

export interface Devis {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  dateCreated: string;
  dateExpiration: string;
  items: DevisLineItem[];
  status: DevisStatus;
  tvaPercent: number; // e.g. 0, 10, 20
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  notes: string;
  convertedToFactureId?: string;
  convertedToProjectId?: string;
}

export type FactureStatus = 'Non payée' | 'En cours' | 'Payée' | 'Échue';

export interface Facture {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  dateCreated: string;
  dateDue: string;
  items: DevisLineItem[];
  status: FactureStatus;
  tvaPercent: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  notes: string;
  derivedFromDevisId?: string;
  convertedToProjectId?: string;
}

export type TransactionType = 'Recette' | 'Dépense';
export type ExpenseCategory = 'Salaires' | 'Logistique' | 'Marketing' | 'Travel' | 'Autre';
export type RevenueCategory = 'Management' | 'Consulting' | 'Recrutement' | 'Contract' | 'Autre';

export interface FinanceTransaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | RevenueCategory;
  description: string;
  projectId?: string;
  projectName?: string;
  sourceId?: string; // Quote or Invoice ID if relevant
  sourceNumber?: string; // Bill or Quote number
  clientName?: string;
}

export type ContractType = 'Prestation services' | 'Management' | 'Partenariat';
export type ContractStatus = 'En cours' | 'Terminé' | 'Résilié';

export interface ContractArticle {
  title: string;
  content: string;
}

export interface Contract {
  id: string;
  type: ContractType;
  clientId: string;
  clientName: string;
  dateCreated: string;
  startDate: string;
  endDate: string;
  durationMonths?: number;
  durationYears?: number;
  amount: number;
  notes: string;
  // Sport management fields
  sport?: string;
  managerRole?: string;
  commissionPercent?: number;
  minAmount?: number;
  paymentTerm: 'Aucun' | 'Une fois' | 'Mensuel' | 'Trimestriel' | 'Par contrat' | 'Par performance';
  // Services description
  servicesText?: string;
  status: ContractStatus;
  articles: ContractArticle[];
  projectId?: string;
  projectName?: string;
  signatures: {
    partyA: string; // Agency representative
    partyB: string; // Client representative
    signed: boolean;
    dateSigned?: string;
  };
  stamps: string[];
}

export interface BusinessSettings {
  companyName: string;
  rcNumber: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  tvaDefault: number;
  nextQuoteNum: number;
  nextInvoiceNum: number;
  defaultPaymentDueDays: number;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankSwift?: string;
  directorName?: string;
  directorTitle?: string;
  isDemoRestoreLocked?: boolean;
  colorTheme?: string;
  themePrimary?: string;
  themeSecondary?: string;
  themeTertiary?: string;
  themeOnSurface?: string;
}

export interface RolePrivilege {
  role: string;
  description: string;
  allowedViews: string[]; // list of view ids e.g. ['dashboard', 'devis', 'factures'...]
  canDeleteTransactions: boolean;
  canResetDatabase: boolean;
  canEditScoutingMetrics: boolean;
  canGenerateContracts: boolean;
  canIssueCards: boolean;
}

export interface NfcCard {
  id: string;
  cardUid: string; // e.g. NK-NFC-7392
  contactId: string;
  contactName: string;
  dateIssued: string;
  status: 'Active' | 'En attente' | 'Désactivée';
  pricePaid: number; // 100
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  password?: string;
}

export interface TimeSession {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  durationMinutes?: number;
  description?: string;
  status: 'active' | 'completed';
}

export interface HrEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  hireDate: string;
  contractType: 'CDI' | 'CDD' | 'Consultant' | 'Stagiaire';
  monthlySalary: number;
  status: 'actif' | 'conge' | 'suspendu' | 'sorti';
  contractEndDate?: string;
}

export interface HrLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Congé Payé' | 'Maladie' | 'Maternité' | 'Sans Solde' | 'Autre';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'En attente' | 'Approuvé' | 'Refusé';
}

export interface HrPayslip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g. "Juin 2026"
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  paymentStatus: 'Payé' | 'En attente' | 'Bloqué';
  paymentDate?: string;
}


