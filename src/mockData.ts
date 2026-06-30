/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contact, Project, Task, Devis, Facture, FinanceTransaction, Contract, BusinessSettings, NfcCard, RolePrivilege, HrEmployee, HrLeave, HrPayslip, TimeSession } from './types';

export const INITIAL_SETTINGS: BusinessSettings = {
  companyName: "Ndembo Kin Connect SARL",
  rcNumber: "CD/KIN/RCCM/22-B-10352",
  address: "24 Avenue de la Justice, Commune de la Gombe, Kinshasa, RDC",
  phone: "+243 81 234 5678",
  email: "contact@ndembokinconnect.com",
  logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuihIYiCA8QrjHMtGSEDZi0rkxFtEXlVVfGzMM9TYWUUMvA6uhdPFtmuReuehEbKuIzNx6RRdiggfFOfy8UC0mxpVpJ-HSg377WjMylMd7uXKz5FBnInLfL0xNayynJvd9PBvSdLP2VmOWHRK7XzU9GJsU9EqE3jbaKZ294Wq7YR6FsmpAn6hlDSNhcLS8H_tDDS1nXxNxq5VxlUn7NyQDo3FziZVnvQ84I-zOEoyf4kGfXOL5i1g6EJ5ahXJx-j1ACh2f52res2bb",
  tvaDefault: 16, // DRC standardized tax rate is commonly 16%
  nextQuoteNum: 3,
  nextInvoiceNum: 3,
  defaultPaymentDueDays: 30,
  bankName: "RAWBANK S.A. Kinshasa RDC",
  bankAccountName: "Ndembo Kin Connect SARL",
  bankAccountNumber: "05100-382941-8374-02 USD",
  bankSwift: "RAWBCD KI XXX",
  directorName: "Yannick Ndémbo",
  directorTitle: "Directeur Général"
};

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: "cnt_1",
    name: "Jean-Pierre Kalala",
    type: "Athlète",
    email: "j.kalala@ndembo.kin",
    phone: "+243 812 345 678",
    address: "Avenue des Sports 12, Lubumbashi, RDC",
    level: "Pro",
    sport: "Football",
    currentTeam: "TP Mazembe",
    notes: "Attaquant vedette. Plusieurs touches avec des clubs de Ligue 1 en France et de Jupiler Pro League en Belgique. Contrat avec TP Mazembe valide jusqu'à juin 2026.",
    dateCreated: "2026-01-15",
    scoutMetrics: { vitesse: 91, technique: 85, physique: 78, tactique: 82, mental: 88, regularite: 80 },
    biometrics: {
      taille: 184,
      poids: 79,
      piedFort: "Droit",
      poste: "Avant-centre"
    },
    injuryStatus: "Disponible",
    marketValue: 250000,
    marketValueHistory: [
      { date: "2025-06", value: 120000 },
      { date: "2025-12", value: 180000 },
      { date: "2026-06", value: 250000 }
    ],
    performanceHistory: [
      { id: "p_1", date: "24-05-2026", matchName: "TP Mazembe vs AS Vita Club", note: 8.5, goals: 2, assists: 0, minutesPlayed: 90, comment: "Doublé décisif. Un jeu de tête chirurgical et de superbes appels en profondeur." },
      { id: "p_2", date: "10-06-2026", matchName: "TP Mazembe vs Lupopo", note: 7.0, goals: 0, assists: 1, minutesPlayed: 78, comment: "Bonne déviation sur le but. Grosse présence physique face aux défenseurs." },
      { id: "p_3", date: "18-06-2026", matchName: "RDC vs Congo (Eliminatoires)", note: 9.0, goals: 1, assists: 1, minutesPlayed: 90, comment: "Homme du match. A porté l'attaque nationale." }
    ]
  },
  {
    id: "cnt_2",
    name: "Marc Ngoma",
    type: "Athlète",
    email: "marc.ngoma@gmail.com",
    phone: "+243 999 888 777",
    address: "Commune de Bandalungwa, Kinshasa, RDC",
    level: "Elite",
    sport: "Basketball",
    currentTeam: "BC Mazembe",
    notes: "Meneur arrière ultra rapide, capitaine de l'équipe nationale locale. Intérêt de la part de clubs en Basketball Africa League (BAL).",
    dateCreated: "2026-02-10",
    scoutMetrics: { vitesse: 94, technique: 88, physique: 70, tactique: 86, mental: 85, regularite: 78 },
    biometrics: {
      taille: 188,
      poids: 81,
      piedFort: "Droit",
      poste: "Meneur"
    },
    injuryStatus: "En réhabilitation",
    marketValue: 95000,
    marketValueHistory: [
      { date: "2025-06", value: 50000 },
      { date: "2025-12", value: 75000 },
      { date: "2026-06", value: 95000 }
    ],
    performanceHistory: [
      { id: "p_4", date: "15-05-2026", matchName: "BC Mazembe vs Oilers (BAL)", note: 9.2, goals: 28, assists: 12, minutesPlayed: 32, comment: "Record personnel de points en BAL. Double-double exceptionnel." },
      { id: "p_5", date: "28-05-2026", matchName: "BC Mazembe vs US Monastir", note: 8.0, goals: 18, assists: 7, minutesPlayed: 28, comment: "Légère torsion de cheville en fin de match, mais gestion du tempo impériale." }
    ]
  },
  {
    id: "cnt_3",
    name: "Sarah Mwamba",
    type: "Athlète",
    email: "sarah.mwamba@gmail.com",
    phone: "+243 850 112 334",
    address: "Avenue du Stade, Commune de Kalamu, Kinshasa",
    level: "Avancé",
    sport: "Athlétisme",
    currentTeam: "Équipe Nationale RDC",
    notes: "Sprinteuse sur 100m et 200m. Qualifications pour les championnats d'Afrique.",
    dateCreated: "2026-03-01",
    scoutMetrics: { vitesse: 98, technique: 70, physique: 84, tactique: 65, mental: 92, regularite: 86 },
    biometrics: {
      taille: 172,
      poids: 58,
      piedFort: "Droit",
      poste: "Sprinteuse 100m/200m"
    },
    injuryStatus: "Disponible",
    marketValue: 45000,
    marketValueHistory: [
      { date: "2025-06", value: 20000 },
      { date: "2025-12", value: 30000 },
      { date: "2026-06", value: 45000 }
    ],
    performanceHistory: [
      { id: "p_6", date: "05-05-2026", matchName: "Meeting de Kinshasa - 100m", note: 9.5, goals: 0, assists: 0, minutesPlayed: 0, comment: "Temps canon de 11.42s sur 100m. Record personnel pulvérisé." },
      { id: "p_7", date: "22-05-2026", matchName: "Championships Centrafrique - 200m", note: 8.8, goals: 0, assists: 0, minutesPlayed: 0, comment: "Deuxième place avec 23.85s. Excellente transition de courbe." }
    ]
  },
  {
    id: "cnt_4",
    name: "Vodac Business Kinshasa",
    type: "Entreprise",
    email: "corporate.kin@vodac.cd",
    phone: "+243 81 555 1000",
    address: "Place de la Gare, Boulevard du 30 Juin, Gombe, Kinshasa",
    RC_SIRET: "CD/KIN/RCCM/14-B-3241",
    sector: "Télécom & Sponsors",
    notes: "Partenaire majeur pour le sponsoring des événements de détection 'Ndembo Kin Connect Camp'.",
    dateCreated: "2025-11-20"
  },
  {
    id: "cnt_5",
    name: "Fédération Congolaise de Football (FECOFA)",
    type: "Agence partenaire",
    email: "contact@fecofa.cd",
    phone: "+243 82 444 3322",
    address: "Avenue de la Justice, Gombe, Kinshasa",
    sector: "Institutionnel Sportif",
    notes: "Fédération régulatrice. Collaboration pour l'enregistrement officiel des contrats d'athlètes.",
    dateCreated: "2025-08-05"
  },
  {
    id: "cnt_6",
    name: "Katanga Mining Sponsoring",
    type: "Sponsor",
    email: "sponsorship@katangamining.cd",
    phone: "+243 97 123 4500",
    address: "Zone Industrielle, Kolwezi, RDC",
    RC_SIRET: "CD/KOL/RCCM/18-C-9902",
    sector: "Exploitation & Sponsoring",
    budgetRange: "100K € - 500K €",
    notes: "Sponsor principal pour le développement des compétitions régionales dans le Lualaba.",
    dateCreated: "2025-12-01"
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "prj_1",
    name: "Tournée Européenne Kalala 2026",
    clientId: "cnt_1",
    clientName: "Jean-Pierre Kalala",
    budget: 45000,
    startDate: "2026-06-01",
    endDate: "2026-08-15",
    description: "Planification, logistique et représentation de Jean-Pierre Kalala pour des essais techniques et séminaires de détection en Belgique et en France auprès de recruteurs de clubs professionnels de Ligue 1 et Division 1A.",
    status: "En cours",
    progress: 60
  },
  {
    id: "prj_2",
    name: "Négociation Sponsor Vodac Camp V1",
    clientId: "cnt_4",
    clientName: "Vodac Business Kinshasa",
    budget: 85000,
    startDate: "2026-05-15",
    endDate: "2026-07-30",
    description: "Établissement du devis de sponsoring et négociation pour l'organisation de la première édition du tournoi de football de détection 'Ndembo Kin Connect Youth Camp' à Kinshasa.",
    status: "En cours",
    progress: 75
  },
  {
    id: "prj_3",
    name: "Contrat Management Élite Marc Ngoma",
    clientId: "cnt_2",
    clientName: "Marc Ngoma",
    budget: 15000,
    startDate: "2026-07-01",
    endDate: "2026-10-30",
    description: "Mise en place de l'agence sur le développement de l'image de marque et négociation des droits de sponsoring personnel pour Marc Ngoma avec des équipementiers sportifs.",
    status: "Planifié",
    progress: 10
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "tsk_1",
    projectId: "prj_1",
    projectOptionalName: "Tournée Européenne Kalala 2026",
    title: "Obtention du visa Schengen Athlète",
    priority: "Haute",
    startDate: "2026-06-01",
    endDate: "2026-06-25",
    description: "Constituer le dossier de demande de visa athlète de court séjour auprès de l'Ambassade de Belgique à Kinshasa. Dépôt des empreintes et lettre d'invitation officielle du club partenaire.",
    category: "Management",
    status: "En cours",
    progress: 80
  },
  {
    id: "tsk_2",
    projectId: "prj_1",
    projectOptionalName: "Tournée Européenne Kalala 2026",
    title: "Élaboration des fiches athlétique et vidéo clips",
    priority: "Haute",
    startDate: "2026-06-05",
    endDate: "2026-06-18",
    description: "Montage vidéo haute-fidélité des 15 derniers matches officiels avec la Linafoot et rédaction du profil physique/statistique certifié Ndembo Kin.",
    category: "Recrutement",
    status: "Terminé",
    progress: 100
  },
  {
    id: "tsk_3",
    projectId: "prj_1",
    projectOptionalName: "Tournée Européenne Kalala 2026",
    title: "Planification hôtelière Brussels & Paris",
    priority: "Basse",
    startDate: "2026-06-20",
    endDate: "2026-07-05",
    description: "Réservation hôtelière sécurisée à proximité des centres d'entraînement partenaires et organisation des transferts ferroviaires (Thalys).",
    category: "Logistique" as any, // category fallback
    status: "À faire",
    progress: 0
  },
  {
    id: "tsk_4",
    projectId: "prj_2",
    projectOptionalName: "Négociation Sponsor Vodac Camp V1",
    title: "Rédaction de la proposition commerciale finale",
    priority: "Haute",
    startDate: "2026-05-15",
    endDate: "2026-05-30",
    description: "Terminer la rédaction de l'offre commerciale détaillant les visibilités de la marque d'un budget estimé de 85K € (maillots, bannières, diffusion TV).",
    category: "Consulting",
    status: "Terminé",
    progress: 100
  },
  {
    id: "tsk_5",
    projectId: "prj_2",
    projectOptionalName: "Négociation Sponsor Vodac Camp V1",
    title: "Validation juridique de la FECOFA",
    priority: "Moyenne",
    startDate: "2026-06-01",
    endDate: "2026-06-15",
    description: "Signature d'un accord-cadre réglementaire d'homologation avec la direction juridique de la Fédération.",
    category: "Contract",
    status: "Terminé",
    progress: 100
  },
  {
    id: "tsk_6",
    projectId: "prj_2",
    projectOptionalName: "Négociation Sponsor Vodac Camp V1",
    title: "Lancement des campagnes de presse radio",
    priority: "Moyenne",
    startDate: "2026-06-10",
    endDate: "2026-07-20",
    description: "Coordination et programmation d'interviews de l'agence sur Top Congo FM et radiodiffusion locale pour susciter la prospection des jeunes athlètes de Kinshasa.",
    category: "Autre",
    status: "En cours",
    progress: 25
  }
];

export const INITIAL_DEVIS: Devis[] = [
  {
    id: "dev_1",
    number: "DEV-2026-001",
    clientId: "cnt_1",
    clientName: "Jean-Pierre Kalala",
    dateCreated: "2026-05-02",
    dateExpiration: "2026-06-02",
    tvaPercent: 16,
    items: [
      {
        id: "line_1",
        serviceName: "Management Sportif Mandat d'Évaluation",
        description: "Services de représentation d'athlète, établissement de fiches techniques et de montages audiovisuels.",
        qty: 1,
        unitPrice: 15000,
        total: 15000
      },
      {
        id: "line_2",
        serviceName: "Logistique & Booking d'essais en Europe",
        description: "Coordination logistique, transferts, logements dans les centres d'entraînement partenaires de D1 en Europe.",
        qty: 1,
        unitPrice: 20000,
        total: 20000
      }
    ],
    status: "Converti",
    totalHT: 35000,
    totalTVA: 5600,
    totalTTC: 40600,
    notes: "Paiement requis à 50% à la signature du mandat d'essais. Solde payable à l'obtention de la lettre d'accréditation du club de destination.",
    convertedToFactureId: "fac_1",
    convertedToProjectId: "prj_1"
  },
  {
    id: "dev_2",
    number: "DEV-2026-002",
    clientId: "cnt_4",
    clientName: "Vodac Business Kinshasa",
    dateCreated: "2026-06-10",
    dateExpiration: "2026-07-10",
    tvaPercent: 16,
    items: [
      {
        id: "line_3",
        serviceName: "Consulting en Sponsoring Ndembo Youth Camp",
        description: "Conception, coordination et livraison du rapport de visibilité événementielle pour la marque Vodac.",
        qty: 1,
        unitPrice: 50000,
        total: 50000
      },
      {
        id: "line_4",
        serviceName: "Production Médias & Réseaux Sociaux",
        description: "Diffusion live Facebook/YouTube des demi-finales et de la finale, conception d'affiches publicitaires.",
        qty: 1,
        unitPrice: 25000,
        total: 25000
      }
    ],
    status: "En attente",
    totalHT: 75000,
    totalTVA: 12000,
    totalTTC: 87000,
    notes: "Proposition de sponsoring valide pour une durée de 30 jours à réception de ce document."
  }
];

export const INITIAL_FACTURES: Facture[] = [
  {
    id: "fac_1",
    number: "FAC-2026-001",
    clientId: "cnt_1",
    clientName: "Jean-Pierre Kalala",
    dateCreated: "2026-05-10",
    dateDue: "2026-06-10",
    tvaPercent: 16,
    items: [
      {
        id: "line_1",
        serviceName: "Management Sportif Mandat d'Évaluation",
        description: "Services de représentation d'athlète, établissement de fiches techniques et de montages audiovisuels.",
        qty: 1,
        unitPrice: 15000,
        total: 15000
      },
      {
        id: "line_2",
        serviceName: "Logistique & Booking d'essais en Europe",
        description: "Coordination logistique, transferts, logements dans les centres d'entraînement partenaires de D1 en Europe.",
        qty: 1,
        unitPrice: 20000,
        total: 20000
      }
    ],
    status: "Payée",
    totalHT: 35000,
    totalTVA: 5600,
    totalTTC: 40600,
    notes: "Facture liquidée le 20 mai 2026 par virement bancaire RAW BANK. Devis d'origine: DEV-2026-001.",
    derivedFromDevisId: "dev_1",
    convertedToProjectId: "prj_1"
  },
  {
    id: "fac_2",
    number: "FAC-2026-002",
    clientId: "cnt_4",
    clientName: "Vodac Business Kinshasa",
    dateCreated: "2026-06-18",
    dateDue: "2026-07-18",
    tvaPercent: 16,
    items: [
      {
        id: "line_5",
        serviceName: "Acompte 50% Sponsoring Ndembo Camp",
        description: "Premier paiement à la validation d'accord-cadre pour entamer les réservations logistiques matérielles.",
        qty: 1,
        unitPrice: 37500,
        total: 37500
      }
    ],
    status: "Non payée",
    totalHT: 37500,
    totalTVA: 6000,
    totalTTC: 43500,
    notes: "Échéance fixée au 18 juillet 2026. Tout paiement en retard entraînera des pénalités de 5% par mois de retard."
  }
];

export const INITIAL_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: "tx_nfc_init_1",
    date: "2026-05-15",
    type: "Recette",
    amount: 100,
    category: "Contract",
    description: "Achat d'adhésion Elite Club - Carte NFC unique #NK-NFC-7482",
    clientName: "Jean-Pierre Kalala"
  },
  {
    id: "tx_nfc_init_2",
    date: "2026-06-01",
    type: "Recette",
    amount: 100,
    category: "Contract",
    description: "Achat d'adhésion Elite Club - Carte NFC unique #NK-NFC-8193",
    clientName: "Marc Ngoma"
  },
  {
    id: "tx_1",
    date: "2026-05-20",
    type: "Recette",
    amount: 40600,
    category: "Management",
    description: "Virement bancaire Rawbank pour la facture d'acompte de Jean-Pierre Kalala.",
    projectId: "prj_1",
    projectName: "Tournée Européenne Kalala 2026",
    sourceId: "fac_1",
    sourceNumber: "FAC-2026-001",
    clientName: "Jean-Pierre Kalala"
  },
  {
    id: "tx_2",
    date: "2026-06-02",
    type: "Dépense",
    amount: 5000,
    category: "Salaires",
    description: "Paiement honoraires des deux recruteurs sportifs locaux pour la sélection provinciale Katanga.",
    projectId: "prj_1",
    projectName: "Tournée Européenne Kalala 2026"
  },
  {
    id: "tx_3",
    date: "2026-06-10",
    type: "Dépense",
    amount: 2500,
    category: "Logistique",
    description: "Frais de déplacement et réservation terrains municipaux de Kalamu pour l'organisation des camps d'essais.",
    projectId: "prj_2",
    projectName: "Négociation Sponsor Vodac Camp V1"
  },
  {
    id: "tx_4",
    date: "2026-06-15",
    type: "Dépense",
    amount: 1500,
    category: "Marketing",
    description: "Conception de bannières publicitaires et supports de communication imprimés (T-shirts imprimés).",
    projectId: "prj_2",
    projectName: "Négociation Sponsor Vodac Camp V1"
  },
  {
    id: "tx_5",
    date: "2026-06-21",
    type: "Recette",
    amount: 25000,
    category: "Consulting",
    description: "Versement partiel sponsor Katanga Sponsoring pour la promotion locale et couverture médiatique.",
    clientName: "Katanga Mining Sponsoring"
  }
];

export const INITIAL_CONTRATS: Contract[] = [
  {
    id: "con_1",
    type: "Prestation services",
    clientId: "cnt_4",
    clientName: "Vodac Business Kinshasa",
    dateCreated: "2026-06-01",
    startDate: "2026-06-01",
    endDate: "2026-09-01",
    durationMonths: 3,
    amount: 85000,
    notes: "Contrat de partenariat exclusif pour la visibilité officielle de la marque Vodac sur l'édition V1 du Ndembo Youth Camp.",
    paymentTerm: "Mensuel",
    servicesText: "Conception, gestion technique, et diffusion en direct sur les plateformes numériques de Ndembo Kin SARL avec apposition exclusive du logo Vodac sur tous les maillots.",
    status: "En cours",
    articles: [
      {
        title: "ARTICLE 1 : OBJET DU CONTRAT",
        content: "Le présent contrat a pour objet la prestation de services de promotion sportive par Ndembo Kin Connect SARL pour le compte du client Vodac Business Kinshasa."
      },
      {
        title: "ARTICLE 2 : DURÉE",
        content: "Le contrat est conclu pour une durée ferme de 3 mois, débutant le 2026-06-01 et prenant fin de plein droit le 2026-09-01."
      },
      {
        title: "ARTICLE 3 : OBLIGATIONS DU PRESTATAIRE",
        content: "Ndembo Kin Connect SARL s'engage à assurer une visibilité maximale pour le client à travers : l'affichage du logo sur l'ensemble des équipements des joueurs, la mention officielle du partenaire lors des déclarations de presse, et la diffusion en direct HD des rencontres."
      },
      {
        title: "ARTICLE 4 : OBLIGATIONS DU CLIENT",
        content: "Le client s'engage à collaborer activement et à verser au prestataire les sommes convenues selon l'échéancier mensuel prévu à l'Article 5."
      },
      {
        title: "ARTICLE 5 : PRIX ET PAIEMENT",
        content: "Le montant total brut de ce contrat est fixé à 85000 € payables sous la forme de 3 mensualités. Échéance directe sous 10 jours après réception de la facture à terme."
      },
      {
        title: "ARTICLE 6 : CONFIDENTIALITÉ",
        content: "Les deux parties conviennent de tenir strictement confidentielles toutes les informations commerciales révélées durant l'exécution de cet accord."
      }
    ],
    signatures: {
      partyA: "Yannick Ndémbo (Ndembo Kin Connect SARL)",
      partyB: "Représentant Vodac Business",
      signed: true,
      dateSigned: "2026-06-01"
    },
    stamps: ["HOMOLOGUÉ", "OFFICIAL", "VALIDÉ"]
  },
  {
    id: "con_2",
    type: "Management",
    clientId: "cnt_1",
    clientName: "Jean-Pierre Kalala",
    dateCreated: "2026-01-15",
    startDate: "2026-01-20",
    endDate: "2028-01-20",
    durationYears: 2,
    amount: 15000,
    notes: "Contrat de représentation de carrière d'athlète exclusif pour toutes négociations sportives en Afrique et en Europe.",
    sport: "Football",
    managerRole: "Agent de liaison principal et conseil juridique exclusif pour négociations de transferts et signatures d'image de marque.",
    commissionPercent: 12,
    minAmount: 10000,
    paymentTerm: "Par contrat",
    status: "En cours",
    articles: [
      {
        title: "ARTICLE 1 : OBJET DU CONTRAT",
        content: "Ndembo Kin Connect SARL est mandaté de manière strictement exclusive pour agir comme manager et représentant sportif de l'athlète Jean-Pierre Kalala pour son activité de Football."
      },
      {
        title: "ARTICLE 2 : DURÉE",
        content: "Le contrat est conclu pour deux années civiles entières, du 2026-01-20 au 2028-01-20, renouvelables par accord tacite exprès."
      },
      {
        title: "ARTICLE 3 : RÔLES DU MANAGER",
        content: "Le manager s'engage à : représenter au mieux les intérêts sportifs et financiers de l'athlète, lui procurer des touches et invitations à des essais professionnels auprès de clubs de haut rang, et assurer la gestion de son image publique en RDC."
      },
      {
        title: "ARTICLE 4 : OBLIGATIONS DE L'ATHLÈTE",
        content: "L'athlète s'engage à : coopérer pleinement dans toutes les démarches du manager, maintenir une condition athlétique professionnelle optimale, et s'interdire de donner de mandat de représentation à un tiers sans accord écrit de l'agence."
      },
      {
        title: "ARTICLE 5 : COMMISSION ET RÉMUNÉRATION",
        content: "Ndembo Kin Connect SARL percevra une commission d'honoraires de de 12% hors taxes sur le revenu brut annuel de tous les contrats négociés pour le compte de l'athlète."
      }
    ],
    signatures: {
      partyA: "Yannick Ndémbo (Ndembo Kin Connect)",
      partyB: "Jean-Pierre Kalala",
      signed: true,
      dateSigned: "2026-01-15"
    },
    stamps: ["VALIDÉ", "HOMOLOGUÉ"]
  }
];

export const INITIAL_CARDS: NfcCard[] = [
  {
    id: "card_1",
    cardUid: "NK-NFC-7482",
    contactId: "cnt_1",
    contactName: "Jean-Pierre Kalala",
    dateIssued: "2026-05-15",
    status: "Active",
    pricePaid: 100
  },
  {
    id: "card_2",
    cardUid: "NK-NFC-8193",
    contactId: "cnt_2",
    contactName: "Marc Ngoma",
    dateIssued: "2026-06-01",
    status: "Active",
    pricePaid: 100
  }
];

export const INITIAL_ROLE_PRIVILEGES: RolePrivilege[] = [
  {
    role: "Directeur Associé",
    description: "Yannick Ndémbo - Direction générale et sportive de l'agence. Accès total sans restrictions.",
    allowedViews: ['dashboard', 'devis', 'factures', 'projets', 'taches', 'finances', 'contrats', 'contacts', 'performances', 'cartes', 'parametres', 'rh'],
    canDeleteTransactions: true,
    canResetDatabase: true,
    canEditScoutingMetrics: true,
    canGenerateContracts: true,
    canIssueCards: true
  },
  {
    role: "Manager Principal",
    description: "Gestion opérationnelle de la carrière, des matches et des négociations d'athlètes.",
    allowedViews: ['dashboard', 'projets', 'taches', 'contrats', 'contacts', 'performances', 'cartes', 'parametres', 'rh'],
    canDeleteTransactions: false,
    canResetDatabase: false,
    canEditScoutingMetrics: true,
    canGenerateContracts: true,
    canIssueCards: true
  },
  {
    role: "Administrateur Finance",
    description: "Responsable de la facturation, encaissement, devis, R&D et conformité légale de l'agence.",
    allowedViews: ['dashboard', 'devis', 'factures', 'finances', 'contacts', 'parametres', 'rh'],
    canDeleteTransactions: true,
    canResetDatabase: false,
    canEditScoutingMetrics: false,
    canGenerateContracts: false,
    canIssueCards: false
  },
  {
    role: "Recruteur Chef",
    description: "Détection de talents (scouting), rapports d'évaluation terrain et cartes d'accès NFC.",
    allowedViews: ['dashboard', 'contacts', 'performances', 'cartes'],
    canDeleteTransactions: false,
    canResetDatabase: false,
    canEditScoutingMetrics: true,
    canGenerateContracts: false,
    canIssueCards: true
  }
];

export const INITIAL_HR_EMPLOYEES: HrEmployee[] = [
  {
    id: "emp_1",
    name: "Cédric Bakambu",
    email: "c.bakambu@ndembokin.com",
    phone: "+243 82 489 1234",
    jobTitle: "Directeur Technique RDC",
    department: "Technique & Scouting",
    hireDate: "2024-01-15",
    contractType: "CDI",
    monthlySalary: 3500,
    status: "actif"
  },
  {
    id: "emp_2",
    name: "Priscilla Mpasi",
    email: "p.mpasi@ndembokin.com",
    phone: "+243 85 918 4321",
    jobTitle: "Responsable Juridique & Licences",
    department: "Juridique",
    hireDate: "2024-06-01",
    contractType: "CDD",
    monthlySalary: 2800,
    status: "actif",
    contractEndDate: "2026-08-31"
  },
  {
    id: "emp_3",
    name: "Alain Mutambayi",
    email: "a.mutambayi@ndembokin.com",
    phone: "+243 89 231 9876",
    jobTitle: "Scout Principal Province",
    department: "Technique & Scouting",
    hireDate: "2025-02-10",
    contractType: "Consultant",
    monthlySalary: 1800,
    status: "conge",
    contractEndDate: "2026-10-15"
  },
  {
    id: "emp_4",
    name: "Therese Kabedi",
    email: "t.kabedi@ndembokin.com",
    phone: "+243 81 554 9901",
    jobTitle: "Comptable Administrative",
    department: "Administration & Finance",
    hireDate: "2023-09-01",
    contractType: "CDI",
    monthlySalary: 2400,
    status: "actif"
  }
];

export const INITIAL_HR_LEAVES: HrLeave[] = [
  {
    id: "lv_1",
    employeeId: "emp_3",
    employeeName: "Alain Mutambayi",
    leaveType: "Congé Payé",
    startDate: "2026-06-20",
    endDate: "2026-07-05",
    daysCount: 15,
    reason: "Congé annuel de récupération après session de scouting de masse.",
    status: "Approuvé"
  },
  {
    id: "lv_2",
    employeeId: "emp_2",
    employeeName: "Priscilla Mpasi",
    leaveType: "Maladie",
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    daysCount: 3,
    reason: "Rendez-vous dentaire et convalescence.",
    status: "En attente"
  }
];

export const INITIAL_HR_PAYSLIPS: HrPayslip[] = [
  {
    id: "ps_1",
    employeeId: "emp_1",
    employeeName: "Cédric Bakambu",
    period: "Mai 2026",
    baseSalary: 3500,
    bonuses: 300,
    deductions: 560,
    netPay: 3240,
    paymentStatus: "Payé",
    paymentDate: "2026-05-30"
  },
  {
    id: "ps_2",
    employeeId: "emp_4",
    employeeName: "Therese Kabedi",
    period: "Mai 2026",
    baseSalary: 2400,
    bonuses: 0,
    deductions: 384,
    netPay: 2016,
    paymentStatus: "Payé",
    paymentDate: "2026-05-30"
  }
];

export const INITIAL_TIME_SESSIONS: TimeSession[] = [
  {
    id: "ts_1",
    userId: "usr_1",
    userName: "Yannick Ndémbo",
    projectId: "prj_1",
    projectName: "Transfert Elite AS Vita Club",
    startTime: "2026-06-28T09:00:00.000Z",
    endTime: "2026-06-28T12:30:00.000Z",
    durationMinutes: 210,
    description: "Négociation des clauses contractuelles et indemnités de transfert.",
    status: "completed"
  },
  {
    id: "ts_2",
    userId: "usr_1",
    userName: "Yannick Ndémbo",
    projectId: "prj_2",
    projectName: "Scouting Tour Kinshasa Ouest",
    startTime: "2026-06-29T14:15:00.000Z",
    endTime: "2026-06-29T17:45:00.000Z",
    durationMinutes: 210,
    description: "Évaluation des jeunes athlètes sur le terrain de Bandalungwa.",
    status: "completed"
  }
];
