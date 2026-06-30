/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSignature,
  Plus,
  Search,
  Calendar,
  PenTool,
  Award,
  CheckCircle,
  Printer,
  ChevronRight,
  User,
  Shield,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Contract, ContractType, Contact, ContractStatus, Project } from '../types';
import { INITIAL_SETTINGS } from '../mockData';

interface ContratsViewProps {
  contracts: Contract[];
  contacts: Contact[];
  projects?: Project[];
  onAddContract: (contract: Contract) => void;
  onUpdateContractStatus: (id: string, status: ContractStatus) => void;
}

export default function ContratsView({ contracts, contacts, projects = [], onAddContract, onUpdateContractStatus }: ContratsViewProps) {
  const [filterType, setFilterType] = useState<ContractType | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // Creation forms states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientId, setClientId] = useState('');
  const [contractType, setContractType] = useState<ContractType>('Management');
  const [amount, setAmount] = useState(15000);
  const [durationMonths, setDurationMonths] = useState(12);
  const [sport, setSport] = useState('Football');
  const [managerRole, setManagerRole] = useState('Agent de liaison exclusif et conseiller de carrière principal');
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [paymentTerm, setPaymentTerm] = useState<Contract['paymentTerm']>('Mensuel');
  const [notes, setNotes] = useState('Enregistrement officiel de l\'acte requis auprès du comité directeur de la Linafoot RDC.');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Interactive 10-article legal wizard step & option states
  const [currentStep, setCurrentStep] = useState(1);
  const [optExclusivity, setOptExclusivity] = useState(true);
  const [optMedical, setOptMedical] = useState(true);
  const [optBonus, setOptBonus] = useState(true);
  const [optImage, setOptImage] = useState(true);
  const [optTermination, setOptTermination] = useState(true);
  const [optFifa, setOptFifa] = useState(true);

  // Preselected Stamp selector on interactive visual preview (disabled by default for clean prints)
  const [selectedStamps, setSelectedStamps] = useState<string[]>([]);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);

  // Dynamic up-to-10 detailed articles generation based on step answers and ticked options
  const getDynamicArticles = (clientName: string) => {
    const defaultName = clientName || "l'Athlète / le Client";
    const budgetStr = formatCurrency(amount);

    if (contractType === 'Management') {
      return [
        {
          title: "ARTICLE 1 : OBJET DU CONTRAT ET DESIGNATION EXCLUSIVE",
          content: `La présente convention exclusive désigne Ndembo Kin Connect SARL comme l'agent de liaison et le conseiller exclusif pour la gestion globale de la carrière sportive de ${defaultName}, couvrant le conseil, la promotion, et l'intermédiation sportive.`
        },
        {
          title: "ARTICLE 2 : DURÉE DE L'ENGAGEMENT ET VALIDATION",
          content: `La présente convention est conclue pour une durée déterminée et ferme de ${durationMonths} mois, prenant effet à la date de signature des présentes par chacune des deux parties.`
        },
        {
          title: "ARTICLE 3 : CADRE D'EXCLUSIVITÉ ET POURPARLERS",
          content: optExclusivity
            ? `L'Athlète accorde un mandat de représentation exclusif et mondial à Ndembo Kin Connect SARL. L'Athlète s'interdit formellement de négocier, de s'engager en direct, ou d'avoir recours à un intermédiaire tiers sans l'accord écrit préalable de l'Agence, sous peine d'une clause de pénalité de 20% sur tout contrat conclu.`
            : `Le présent mandat est non-exclusif. ${defaultName} conserve la faculté d'initier des discussions parallèles ou de signer des accords de représentation tiers, sous réserve d'en informer au préalable l'Agence par écrit.`
        },
        {
          title: "ARTICLE 4 : EXPLOITATION DU DROIT À L'IMAGE ET PARTENARIAT",
          content: optImage
            ? `L'Athlète concède à l'Agence le droit exclusif d'exploiter, de négocier et d'utiliser son image publique, sa voix et sa signature à des fins de sponsoring ou de merchandising commercial. Les revenus générés seront partagés à hauteur de 30% pour l'Agence et 70% pour l'Athlète.`
            : `L'Athlète conserve l'intégralité de ses droits individuels à l'image pour tout partenariat de sponsoring. Ndembo Kin Connect SARL n'interviendra qu'en qualité de facilitateur optionnel sans droit d'exploitation direct.`
        },
        {
          title: "ARTICLE 5 : INTÉRESSEMENT ET HONORAIRES DE COMMISSIONS",
          content: `En contrepartie des services exclusifs de conseil et d'intermédiation de carrière, l'Agence percevra une commission fixe d'honoraires de ${commissionPercent}% calculée sur la valeur globale brute de chaque contrat d'embauche, de transfert ou de renouvellement conclu par l'Athlète.`
        },
        {
          title: "ARTICLE 6 : BONUS DE RENDEMENT ET INCITATIONS SPORTIVES",
          content: optBonus
            ? `En cas de sélection officielle en équipe nationale (Léopards RDC ou autre sélection), de nomination dans l'équipe type de la ligue, ou d'atteinte de jalons exceptionnels de performance (meilleur buteur, MVP), l'Athlète s'engage à verser un bonus forfaitaire d'intéressement de 5 000 USD à l'Agence dans les 30 jours.`
            : `La rémunération de l'Agence est strictement limitée aux honoraires et commissions standards. Aucune prime d'intéressement ou bonus lié à des résultats sportifs individuels n'est exigible au titre du présent contrat.`
        },
        {
          title: "ARTICLE 7 : ACCOMPAGNEMENT MÉDICAL ET LOGISTIQUE D'ÉLITE",
          content: optMedical
            ? `L'Agence s'engage à financer à hauteur de 50% les frais d'accompagnement médical spécialisé de l'Athlète (physiothérapie, nutrition sportive de haut niveau, bilans corporels récurrents) et les abonnements aux installations de préparation physique agréées, dans la limite d'un plafond annuel de 10 000 USD.`
            : `L'entretien corporel, la préparation physique et la couverture médicale de l'Athlète demeurent sous sa seule et unique responsabilité financière et opérationnelle. L'Agence ne fournit aucun remboursement ou prise en charge.`
        },
        {
          title: "ARTICLE 8 : MODALITÉS DE VERSEMENT DE LA CONVENTION",
          content: paymentTerm === 'Aucun'
            ? `Aucun versement d'avance ni avance financière régulière n'est exigé de l'Athlète au titre du présent contrat. L'Agence se rémunère exclusivement via les commissions sur transferts et partenariats d'intermédiation sportive conclus.`
            : `Les versements ou règlements dus à l'Agence par ${defaultName} seront exécutés en devises USD selon les termes suivants : ${paymentTerm}. Tout retard de versement de plus de 15 jours entraînera des pénalités au taux de 1.5% par mois de retard.`
        },
        {
          title: "ARTICLE 9 : RÉSILIATION ET DISCIPLINE",
          content: optTermination
            ? `Le contrat peut être résilié unilatéralement avant son terme pour juste motif ou par rupture amiable. Un préavis écrit de 3 mois transmis par huissier ou lettre recommandée avec accusé de réception est obligatoire, accompagné d'une indemnité forfaitaire compensatrice égale à la moyenne des commissions des 6 derniers mois.`
            : `La présente convention ne peut être résiliée avant son terme échu de ${durationMonths} mois, sauf en cas de faute lourde caractérisée ou d'incapacité physique permanente de l'Athlète dûment constatée par un médecin agréé.`
        },
        {
          title: "ARTICLE 10 : LOI APPLICABLE ET RÈGLEMENT DES LITIGES",
          content: optFifa
            ? `La présente convention est régie et interprétée conformément aux lois de la République Démocratique du Congo. Tout litige relatif à sa validité ou son exécution sera soumis en premier ressort à la chambre de résolution des litiges de la FECOFA RDC et, en dernier ressort, devant le Tribunal Arbitral du Sport (TAS) à Lausanne.`
            : `La présente convention est régie par le droit commun des obligations de la République Démocratique du Congo. En cas de contestation, les tribunaux civils de Kinshasa / Gombe seront seuls compétents.`
        }
      ];
    } else if (contractType === 'Prestation services') {
      return [
        {
          title: "ARTICLE 1 : OBJET DES PRESTATIONS DE SERVICES ET LIVRABLES",
          content: `La présente convention définit les prestations de services d'ingénierie sportive, d'audit technique et d'organisation de détection fournies par Ndembo Kin Connect SARL pour le compte de ${defaultName}, ainsi que la liste des livrables associés.`
        },
        {
          title: "ARTICLE 2 : CALENDRIER ET DURÉE DES PRESTATIONS",
          content: `La mission de prestation s'étend sur une durée ferme de ${durationMonths} mois, durant laquelle les livrables techniques seront régulièrement remis et présentés au Client.`
        },
        {
          title: "ARTICLE 3 : CONFIDENTIALITÉ ET NON-DIVULGATION TECHNIQUE",
          content: optExclusivity
            ? `Les deux parties s'engagent à garder strictement confidentielles toutes les données techniques, méthodologiques et d'ingénierie sportive partagées au cours des travaux, interdisant toute fuite d'informations commerciales.`
            : `Aucun engagement de confidentialité absolue ou d'exclusivité d'informations techniques n'est exigible hors des usages professionnels régis par le droit commercial de la RDC.`
        },
        {
          title: "ARTICLE 4 : EXPLOITATION DES DONNÉES ET DROIT DE PROPRIÉTÉ",
          content: optImage
            ? `${defaultName} détient la propriété exclusive des analyses rédigées par l'Agence, mais concède à cette dernière une licence commerciale gratuite d'utilisation des métriques pour son portfolio.`
            : `L'intégralité des méthodologies, codes sources et analyses structurelles demeure la propriété intellectuelle exclusive du cabinet Ndembo Kin Connect SARL.`
        },
        {
          title: "ARTICLE 5 : VALORISATION FORFAITAIRE DE LA PRESTATION",
          content: `La valeur globale forfaitaire pour l'exécution complète des prestations de services est arrêtée d'un commun accord à ${budgetStr} USD hors taxes.`
        },
        {
          title: "ARTICLE 6 : CRITÈRES DE PERFORMANCE ET PÉNALITÉS",
          content: optBonus
            ? `En cas d'atteinte d'objectifs de performance technique exceptionnels, un bonus de réussite équivalent à 15% de la valeur forfaitaire globale sera facturé en sus par l'Agence au Client.`
            : `La tarification de la prestation est fixée de manière définitive. Aucun bonus lié aux résultats ou pénalités de rendement n'est applicable à la présente convention.`
        },
        {
          title: "ARTICLE 7 : MOYENS HUMAINS ET RECOURS LOGISTIQUE",
          content: optMedical
            ? `Ndembo Kin Connect SARL affectera des experts techniques seniors, médecins du sport certifiés et conseillers juridiques dédiés au suivi permanent et personnalisé des prestations.`
            : `L'Agence affectera son personnel général au traitement des livrables selon le calendrier standard, sans garantie de désignation d'une équipe de spécialistes dédiés.`
        },
        {
          title: "ARTICLE 8 : ÉCHÉANCES ET CONDITIONS DE RÈGLEMENT",
          content: paymentTerm === 'Aucun'
            ? `Aucune avance de fonds ni acompte de démarrage n'est requis au titre de ce contrat. Le règlement complet s'effectuera à l'achèvement complet et après réception des livrables de la mission.`
            : `Le Client s'engage à régler la somme facturée conformément aux échéances convenues, à savoir : ${paymentTerm}. Tout retard entraînera des pénalités de retard.`
        },
        {
          title: "ARTICLE 9 : RÉSILIATION OU INTERRUPTION DES SERVICES",
          content: optTermination
            ? `Le présent contrat peut être résilié par anticipation par l'une ou l'autre partie en cas de manquement grave aux obligations, avec un préavis écrit de 15 jours après mise en demeure de s'exécuter.`
            : `Le contrat est ferme et ne peut être interrompu par anticipation avant l'échéance des ${durationMonths} mois, sauf accord mutuel écrit sous forme d'avenant.`
        },
        {
          title: "ARTICLE 10 : ATTRIBUTION DE JURIDICTION ET LOI APPLICABLE",
          content: optFifa
            ? `Les litiges découlant de l'application technique des prestations seront soumis à la commission de conciliation sportive agréée par la FECOFA RDC avant toute saisine civile.`
            : `Le présent contrat est régi par le droit commun des obligations en République Démocratique du Congo. Tout différend sera de la compétence exclusive du Tribunal de Commerce de Kinshasa.`
        }
      ];
    } else {
      // Partenariat
      return [
        {
          title: "ARTICLE 1 : OBJET DE L'ACCORD DE PARTENARIAT ET PARRAINAGE",
          content: `La présente convention établit un accord-cadre de partenariat commercial et de sponsoring d'image réciproque entre Ndembo Kin Connect SARL et le Partenaire ${defaultName}.`
        },
        {
          title: "ARTICLE 2 : DURÉE DU PARTENARIAT DE VISIBILITÉ",
          content: `L'accord de partenariat commercial de visibilité est conclu pour une durée d'activation de ${durationMonths} mois fermes prenant effet dès sa signature.`
        },
        {
          title: "ARTICLE 3 : EXCLUSIVITÉ SECTORIELLE ET ASSOCIATIVE",
          content: optExclusivity
            ? `Le Partenaire s'engage à une exclusivité sectorielle absolue. Il s'interdit formellement de promouvoir ou de conclure d'autres partenariats avec des marques concurrentes directes de l'Agence.`
            : `Le présent accord est non-exclusif. Les parties conservent l'entière liberté de signer d'autres ententes de parrainage avec tout tiers de leur choix sans compensation.`
        },
        {
          title: "ARTICLE 4 : CO-BRANDING ET EXPLOITATION DE L'IMAGE DE MARQUE",
          content: optImage
            ? `Les deux parties s'accordent le droit mutuel d'utiliser, de reproduire et d'afficher leurs marques, logos et visuels corporate respectifs sur tous les canaux physiques et numériques de communication.`
            : `L'usage des marques, logos et visuels de chaque partie reste strictement encadré et soumis à une demande d'autorisation expresse préalable pour chaque campagne de communication.`
        },
        {
          title: "ARTICLE 5 : ENVELOPPE DE SPONSORING ET APPORT FINANCIER",
          content: `L'enveloppe financière totale de sponsoring allouée aux actions d'activation et de parrainage mutuel est fixée à ${budgetStr} USD.`
        },
        {
          title: "ARTICLE 6 : PRIMES DE VISIBILITÉ ET NOTORIÉTÉ MÉDIA",
          content: optBonus
            ? `En cas de franchissement de seuils d'audience ou de retour sur investissement média mesurables, des bonus de performance équivalents à 10% de l'enveloppe globale seront libérés.`
            : `Le budget alloué par le sponsor est strictement plafonné aux montants forfaitaires des présentes, excluant toute prime ou bonus de visibilité média.`
        },
        {
          title: "ARTICLE 7 : DOTATION LOGISTIQUE ET MATÉRIELS DE VISIBILITÉ",
          content: optMedical
            ? `L'Agence fournira une dotation logistique d'envergure, incluant l'affichage sur bannières de terrain, le marquage sur les maillots officiels et l'accès VIP aux événements d'intermédiation.`
            : `Chaque partie prendra à sa charge exclusive les frais de logistique et de fabrication de ses propres supports visuels de parrainage.`
        },
        {
          title: "ARTICLE 8 : MODALITÉS D'EXÉCUTION DU BUDGET",
          content: paymentTerm === 'Aucun'
            ? `Aucun versement d'avance n'est requis au titre de ce partenariat. Les dotations budgétaires seront débloquées au prorata de la réalisation des activations d'événements planifiés.`
            : `Les versements de l'enveloppe de partenariat s'effectueront conformément à l'échéancier : ${paymentTerm}.`
        },
        {
          title: "ARTICLE 9 : FORCE MAJEURE ET DESENGAGEMENT COMMERCIAL",
          content: optTermination
            ? `Une clause de désengagement anticipé pour baisse d'activité économique majeure ou force majeure est accordée, sous réserve du respect d'un préavis de 45 jours calendaires.`
            : `L'accord de partenariat commercial est ferme et irrévocable. Aucune des parties ne peut s'en désengager unilatéralement avant l'échéance des ${durationMonths} mois.`
        },
        {
          title: "ARTICLE 10 : CADRE DE CONCILIATION ET RÈGLEMENT DES DIFFÉRENDS",
          content: optFifa
            ? `Tout différend relatif à la validité ou l'interprétation de ce partenariat sera soumis à la commission d'arbitrage FECOFA / FIFA avant recours contentieux.`
            : `L'accord est régi par les lois de la RDC. En cas de contestation, le litige sera tranché par le Tribunal de Commerce compétent de Kinshasa.`
        }
      ];
    }
  };

  // Form submission
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find(c => c.id === clientId);
    if (!contact) return;

    // Generate 10 dynamic, highly-detailed articles according to selection
    const articles = getDynamicArticles(contact.name);
    const project = projects.find(p => p.id === selectedProjectId);

    const newContract: Contract = {
      id: "con_" + Date.now(),
      type: contractType,
      clientId: contact.id,
      clientName: contact.name,
      dateCreated: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      durationMonths,
      amount,
      notes,
      sport: contractType === 'Management' ? sport : undefined,
      managerRole: contractType === 'Management' ? managerRole : undefined,
      commissionPercent: contractType === 'Management' ? commissionPercent : undefined,
      paymentTerm,
      status: 'En cours',
      articles,
      projectId: project ? project.id : undefined,
      projectName: project ? project.name : undefined,
      signatures: {
        partyA: "Yannick Ndémbo (Directeur Connect)",
        partyB: contact.name,
        signed: true,
        dateSigned: new Date().toISOString().split('T')[0]
      },
      stamps: ["VALIDÉ", "HOMOLOGUÉ"]
    };

    onAddContract(newContract);
    setSelectedProjectId('');
    setShowCreateModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleStamp = (stamp: string) => {
    if (selectedStamps.includes(stamp)) {
      setSelectedStamps(selectedStamps.filter(s => s !== stamp));
    } else {
      setSelectedStamps([...selectedStamps, stamp]);
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesType = filterType === 'Tous' || c.type === filterType;
    const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 md:space-y-8" id="contracts_management_system">
      {/* Search & Actions ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#bec8d2]/70 p-4 rounded-xl shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6f7881]" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
            placeholder="Rechercher des contrats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Tous', 'Management', 'Prestation services', 'Partenariat'] as const).map(tp => (
            <button
              key={tp}
              onClick={() => setFilterType(tp as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                filterType === tp ? 'bg-primary text-white border-primary shadow-xs' : 'bg-white text-[#3f4850] border-[#bec8d2] hover:bg-[#f7f9ff]'
              }`}
            >
              {tp}
            </button>
          ))}

          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto sm:ml-2 bg-[#00628f] hover:bg-[#005177] text-white font-heading font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Nouveau Contrat</span>
          </button>
        </div>
      </div>

      {/* Contract List representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filteredContracts.map(con => (
          <div key={con.id} className="bg-white border border-[#bec8d2]/70 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex justify-between items-start gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-[#ba0a0f]">
                    <FileSignature className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-heading font-extrabold text-xs text-on-surface block leading-tight">{con.clientName}</span>
                    <span className="text-[10px] font-mono text-[#6f7881]">{con.type}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  con.status === 'En cours' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-700'
                }`}>
                  {con.status}
                </span>
              </div>

              {/* Notes or roles info */}
              <p className="text-xs text-[#3f4850] line-clamp-2">
                {con.notes || 'Contrat de carrière sportive d\'agent approuvé.'}
              </p>

              {/* Linked Project info */}
              {con.projectName && (
                <div className="flex items-center gap-1 text-xs text-primary bg-[#e6f4fc] px-2.5 py-1 rounded-lg w-max font-medium border border-[#00628f]/20">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Projet : {con.projectName}</span>
                </div>
              )}

              {/* Info chips */}
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center pt-2">
                <div className="bg-[#f7f9ff] py-1 border rounded">
                  <span className="text-[#6f7881] block">BUDGET BRUT</span>
                  <strong className="text-[#ca8a04] block">{formatCurrency(con.amount)}</strong>
                </div>
                <div className="bg-[#f7f9ff] py-1 border rounded">
                  <span className="text-[#6f7881] block">DURÉE</span>
                  <strong className="text-on-surface block">{con.durationMonths || 12} MOIS</strong>
                </div>
                <div className="bg-[#f7f9ff] py-1 border rounded">
                  <span className="text-[#6f7881] block">TERME</span>
                  <strong className="text-on-surface block truncate">{con.endDate}</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions at card bottom */}
            <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2">
              <button
                onClick={() => setPreviewContract(con)}
                className="flex-1 bg-[#edf4ff] hover:bg-[#cae6ff] text-primary py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <PenTool className="w-3.5 h-3.5 text-primary" />
                <span>Ouvrir l'Acte &amp; Signer</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CONTRAT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#0c1d2b]/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-6xl w-full border border-[#bec8d2] shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <FileSignature className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-heading font-extrabold text-[#00628f] text-lg leading-tight">
                    Assistant Intelligent de Rédaction de Contrat
                  </h3>
                  <p className="text-[11px] text-slate-500">Générez un acte d'engagement officiel de 10 articles détaillés en 4 étapes interactives</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#6f7881] hover:text-black font-semibold cursor-pointer text-sm">✕</button>
            </div>

            {/* Main Interactive Wizard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Multi-step interactive questions (cols-7) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6 border-r border-slate-100 lg:pr-8">
                
                {/* Steps Visual Progress Tracker */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-primary">
                    <span>Étape {currentStep} sur 4</span>
                    <span className="text-[#6f7881]">
                      {currentStep === 1 && "Parties & Catégorie"}
                      {currentStep === 2 && "Paramètres de Durée & Budget"}
                      {currentStep === 3 && "Clauses Contractuelles à la carte"}
                      {currentStep === 4 && "Vérification Finale & Homologation"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Form fields depending on active step */}
                <div className="flex-1 min-h-[300px] py-2">
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="bg-[#f7f9ff] border border-slate-200/50 p-4 rounded-xl space-y-1">
                        <h4 className="text-xs font-bold text-[#0c1d2b]">Étape 1 : Désignation des Parties &amp; Cadre de l'acte</h4>
                        <p className="text-[11px] text-[#6f7881] leading-relaxed">Veuillez sélectionner le contractant pour qui rédiger le contrat et la nature juridique de la prestation.</p>
                      </div>

                      {/* Select Client */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono font-bold uppercase text-on-surface">Partie contractante (Client / Athlète)</label>
                        <select
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                          className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff] font-semibold text-[#0c1d2b]"
                          required
                        >
                          <option value="">-- Sélectionnez l'Athlète / le Client --</option>
                          {contacts.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                          ))}
                        </select>
                      </div>

                      {/* Contract Type selection */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono font-bold uppercase text-on-surface">Squelette &amp; Modèle de l'Acte</label>
                        <select
                          value={contractType}
                          onChange={(e) => setContractType(e.target.value as ContractType)}
                          className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                        >
                          <option value="Management">Mandat de Représentation de Carrière Exclusive</option>
                          <option value="Prestation services">Prestation de services sportifs forfaitaires</option>
                          <option value="Partenariat">Accord-Cadre de Partenariat de sponsoring</option>
                        </select>
                      </div>

                      {/* Project Linkage selection */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono font-bold uppercase text-on-surface">Associer à un Projet (Optionnel)</label>
                        <select
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                          className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                        >
                          <option value="">-- Aucun projet associé --</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.clientName})</option>
                          ))}
                        </select>
                      </div>

                      {/* Sport selection */}
                      {contractType === 'Management' && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono font-bold uppercase text-on-surface">Discipline Sportive de Spécialisation</label>
                          <input
                            type="text"
                            value={sport}
                            onChange={(e) => setSport(e.target.value)}
                            placeholder="Ex: Football, Basketball"
                            className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="bg-[#f7f9ff] border border-slate-200/50 p-4 rounded-xl space-y-1">
                        <h4 className="text-xs font-bold text-[#0c1d2b]">Étape 2 : Modalités de Durée &amp; Valorisation Financière</h4>
                        <p className="text-[11px] text-[#6f7881] leading-relaxed">Configurez le budget de l'accord, la commission d'agence et la durée totale en mois.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Amount / Budget */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono font-bold uppercase text-on-surface">Budget Contractuel Global ($ USD)</label>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff] font-mono"
                            required
                          />
                        </div>

                        {/* Commission */}
                        {contractType === 'Management' ? (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-mono font-bold uppercase text-on-surface">Commission de l'Agence (%)</label>
                            <input
                              type="number"
                              value={commissionPercent}
                              onChange={(e) => setCommissionPercent(Number(e.target.value))}
                              className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff] font-mono text-emerald-700 font-bold"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-mono font-bold uppercase text-slate-400">Commission d'Agence (Non applicable)</label>
                            <input
                              type="text"
                              disabled
                              value="N/A"
                              className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-slate-100 text-slate-400 font-mono"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Duration */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono font-bold uppercase text-on-surface">Durée d'Engagement (Mois)</label>
                          <input
                            type="number"
                            value={durationMonths}
                            onChange={(e) => setDurationMonths(Number(e.target.value))}
                            className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                            required
                          />
                        </div>

                        {/* Payment term */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono font-bold uppercase text-on-surface">Échéancier de versement</label>
                          <select
                            value={paymentTerm}
                            onChange={(e) => setPaymentTerm(e.target.value as any)}
                            className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                          >
                            <option value="Aucun">Aucun versement d'avance / Pas d'avance</option>
                            <option value="Mensuel">Versement Mensuel récurrent</option>
                            <option value="Trimestriel">Versement Trimestriel récurrent</option>
                            <option value="Une fois">Paiement unique direct à terme</option>
                            <option value="Par contrat">Par contrat conclu (honoraires %)</option>
                            <option value="Par performance">Par performance sportive individuelle</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="bg-[#f7f9ff] border border-slate-200/50 p-4 rounded-xl space-y-1">
                        <h4 className="text-xs font-bold text-[#0c1d2b]">Étape 3 : Clauses Contractuelles de l'Acte (Cocher pour rédiger)</h4>
                        <p className="text-[11px] text-[#6f7881] leading-relaxed">Cochez ou décochez les clauses réglementaires ci-dessous pour modifier la rédaction des articles en temps réel sur la droite.</p>
                      </div>

                      {/* Interactive Toggles Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="wizard_clauses_grid">
                        
                        {/* Toggle 1: Exclusivity */}
                        <button
                          type="button"
                          onClick={() => setOptExclusivity(!optExclusivity)}
                          className={`text-left p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer bg-white ${
                            optExclusivity ? 'border-primary ring-1 ring-primary/20 bg-[#00628f]/5' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <input 
                              type="checkbox" 
                              checked={optExclusivity} 
                              onChange={() => {}} // handled by click
                              className="accent-primary" 
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-[#0c1d2b]">Exclusivité Absolue (Art. 3)</span>
                            <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">Mandat exclusif à l'agence sous peine de pénalité de 20%</span>
                          </div>
                        </button>

                        {/* Toggle 2: Image rights */}
                        <button
                          type="button"
                          onClick={() => setOptImage(!optImage)}
                          className={`text-left p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer bg-white ${
                            optImage ? 'border-primary ring-1 ring-primary/20 bg-[#00628f]/5' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <input 
                              type="checkbox" 
                              checked={optImage} 
                              onChange={() => {}} // handled by click
                              className="accent-primary" 
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-[#0c1d2b]">Droits d'Image &amp; Sponsoring (Art. 4)</span>
                            <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">Partage des revenus d'image (30% Agence / 70% Athlète)</span>
                          </div>
                        </button>

                        {/* Toggle 3: Performance bonuses */}
                        <button
                          type="button"
                          onClick={() => setOptBonus(!optBonus)}
                          className={`text-left p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer bg-white ${
                            optBonus ? 'border-primary ring-1 ring-primary/20 bg-[#00628f]/5' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <input 
                              type="checkbox" 
                              checked={optBonus} 
                              onChange={() => {}} // handled by click
                              className="accent-primary" 
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-[#0c1d2b]">Primes de Performance (Art. 6)</span>
                            <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">Bonus forfaitaire de 5 000 USD par sélection ou titre individuel</span>
                          </div>
                        </button>

                        {/* Toggle 4: Medical */}
                        <button
                          type="button"
                          onClick={() => setOptMedical(!optMedical)}
                          className={`text-left p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer bg-white ${
                            optMedical ? 'border-primary ring-1 ring-primary/20 bg-[#00628f]/5' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <input 
                              type="checkbox" 
                              checked={optMedical} 
                              onChange={() => {}} // handled by click
                              className="accent-primary" 
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-[#0c1d2b]">Accompagnement Médical d'Élite (Art. 7)</span>
                            <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">Remboursement de 50% des soins d'entraînement d'élite</span>
                          </div>
                        </button>

                        {/* Toggle 5: Termination notice */}
                        <button
                          type="button"
                          onClick={() => setOptTermination(!optTermination)}
                          className={`text-left p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer bg-white ${
                            optTermination ? 'border-primary ring-1 ring-primary/20 bg-[#00628f]/5' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <input 
                              type="checkbox" 
                              checked={optTermination} 
                              onChange={() => {}} // handled by click
                              className="accent-primary" 
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-[#0c1d2b]">Résiliation Anticipée (Art. 9)</span>
                            <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">Rupture amiable avec préavis de 3 mois et dédommagement</span>
                          </div>
                        </button>

                        {/* Toggle 6: FIFA regulation */}
                        <button
                          type="button"
                          onClick={() => setOptFifa(!optFifa)}
                          className={`text-left p-3 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer bg-white ${
                            optFifa ? 'border-primary ring-1 ring-primary/20 bg-[#00628f]/5' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <input 
                              type="checkbox" 
                              checked={optFifa} 
                              onChange={() => {}} // handled by click
                              className="accent-primary" 
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-[#0c1d2b]">Soumission FIFA &amp; FECOFA (Art. 10)</span>
                            <span className="text-[10px] text-slate-500 leading-snug block mt-0.5">Soumission formelle à la législation et résolution FECOFA / TAS</span>
                          </div>
                        </button>

                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1">
                        <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Étape 4 : Prêt pour Homologation Légale</span>
                        </h4>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">Les 10 articles de loi détaillés ont été rédigés sur mesure. Vous pouvez ajouter des consignes complémentaires ci-dessous avant d'enregistrer l'acte.</p>
                      </div>

                      {/* Summary recap table */}
                      <div className="bg-[#f7f9ff] border p-4 rounded-xl text-xs space-y-2">
                        <span className="font-mono font-bold text-[10px] text-primary uppercase block tracking-wider">Récapitulatif des paramètres de l'acte</span>
                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                          <div>• Contractant : <strong>{contacts.find(c => c.id === clientId)?.name || "Non spécifié"}</strong></div>
                          <div>• Type d'acte : <strong>{contractType}</strong></div>
                          <div>• Durée ferme : <strong>{durationMonths} Mois</strong></div>
                          <div>• Budget brut : <strong>{formatCurrency(amount)}</strong></div>
                          {contractType === 'Management' && <div>• Taux de commission : <strong>{commissionPercent}%</strong></div>}
                          <div>• Versement : <strong>{paymentTerm}</strong></div>
                        </div>
                      </div>

                      {/* Notes / Consignes */}
                      <div className="space-y-1.5">
                        <label className="block text-[#0c1d2b] text-xs font-mono font-bold uppercase">Consignes réglementaires &amp; Observations à annexer</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                          rows={2}
                          placeholder="ex: Acte officiel à archiver auprès du secrétariat FECOFA..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Buttons Navigation row */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={currentStep === 1}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-4 py-2 border border-[#bec8d2] text-[#3f4850] text-xs font-bold rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Précédent
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-[#bec8d2] text-[#3f4850] text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Annuler
                    </button>

                    {currentStep < 4 ? (
                      <button
                        type="button"
                        disabled={currentStep === 1 && !clientId}
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        className="px-5 py-2 bg-primary hover:bg-[#005177] text-white text-xs font-heading font-extrabold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Suivant
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCreateContract}
                        disabled={!clientId}
                        className="px-6 py-2 bg-[#00628f] hover:bg-[#005177] text-white text-xs font-heading font-extrabold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>Homologuer &amp; Sauvegarder</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Live drafted legal articles preview (cols-5) */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col h-[520px] shadow-inner">
                <div className="border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-[#00628f]" />
                    <span className="text-[10px] font-mono font-bold uppercase text-[#00628f] tracking-wider">
                      RÉDACTION EN DIRECT
                    </span>
                  </div>
                  <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold font-mono">
                    10 Articles
                  </span>
                </div>

                {selectedProjectId && (
                  <div className="mb-3 bg-primary/5 text-primary text-[10px] font-semibold border border-primary/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Projet lié : {projects.find(p => p.id === selectedProjectId)?.name}</span>
                  </div>
                )}

                {/* Live Articles List container */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 custom-scrollbar text-justify text-[10px]">
                  {clientId ? (
                    getDynamicArticles(contacts.find(c => c.id === clientId)?.name || "l'Athlète").map((art, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-xs space-y-1 hover:border-primary/40 transition-colors">
                        <h5 className="font-heading font-extrabold text-[10px] text-[#00628f] uppercase leading-snug">
                          {art.title}
                        </h5>
                        <p className="font-sans text-[10px] text-slate-600 leading-normal">
                          {art.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <FileText className="w-10 h-10 text-slate-300 animate-pulse" />
                      <div>
                        <h6 className="font-bold text-xs text-slate-700">Aucun client sélectionné</h6>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                          Sélectionnez une partie contractante à l'Étape 1 pour générer la convention d'engagement en direct.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PREVIEW/PRINT ACTE MODAL */}
      {previewContract && (
        <div className="fixed inset-0 bg-[#0c1d2b]/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 flex flex-col max-h-[90vh]">
            {/* Control panel header print:hidden */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-sans font-bold text-sm text-on-surface">Homologation d'acte juridique - {previewContract.id}</span>
                </div>
                {/* Visual stamps toggler */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-[#6f7881] font-bold">AJOUTER CACHETS OFFICIELS :</span>
                  {["HOMOLOGUÉ FECOFA", "VALIDÉ NDEMBO", "SCEAU ARCHIVE DGI", "COMMISSION COLYM"].map(st => {
                    const active = selectedStamps.includes(st);
                    return (
                      <button
                        key={st}
                        onClick={() => toggleStamp(st)}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border transition-all ${
                          active ? 'bg-secondary text-white border-secondary' : 'bg-white text-[#3f4850] border-slate-300'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}{st}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <button
                  onClick={handlePrint}
                  className="bg-[#00628f] hover:bg-[#005177] text-white px-3.5 py-1.5 rounded text-xs font-bold font-heading flex items-center gap-1.5 transition-transform cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  Imprimer la Convention
                </button>
                <button
                  onClick={() => setPreviewContract(null)}
                  className="bg-white hover:bg-slate-200 text-[#3f4850] px-3.5 py-1.5 rounded text-xs font-bold border border-[#bec8d2]"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* Document sheet */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar print:p-0 bg-white" id="printable_contract_document">
              <div className="border-[3px] border-double border-[#00628f] p-6 md:p-10 space-y-8 h-full rounded shadow-inner relative">
                
                {/* Document headers */}
                <div className="text-center space-y-2 border-b-2 border-slate-300 pb-6 relative">
                  {/* Absolute positioning visual stamps (hidden during printing as requested) */}
                  <div className="absolute top-0 right-4 flex flex-col gap-2 items-end print:hidden">
                    {selectedStamps.map((st, idx) => (
                      <div
                        key={st}
                        className="border-2 border-dashed border-[#ba0a0f] text-[#ba0a0f] text-[9px] font-extrabold px-3 py-1 bg-[#ffdad6]/20 rounded rotate-[-6deg] tracking-widest uppercase shrink-0"
                      >
                        ★ {st} ★
                      </div>
                    ))}
                  </div>

                  <Award className="w-10 h-10 mx-auto text-[#00628f]" />
                  <h2 className="font-heading text-xl md:text-2xl font-extrabold text-[#0c1d2b] uppercase tracking-wide">
                    CONVENTION EXECUTIVE DE CARRIÈRE SPORTIVE
                  </h2>
                  <p className="font-mono text-[10px] text-[#6f7881]">
                    RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • SECRÉTARIAT DES MANDATS NDEMBO KIN
                  </p>
                  <span className="inline-block px-3 py-0.5 bg-slate-100 text-[#3f4850] border rounded font-mono text-[9px] font-bold">
                    Réf Contrat : {previewContract.id} • Date d'établissement : {previewContract.dateCreated}
                    {previewContract.projectName && ` • Projet Associé : ${previewContract.projectName}`}
                  </span>
                </div>

                {/* Subheading parties info */}
                <div className="space-y-4 text-xs leading-relaxed font-sans">
                  <span className="font-mono text-[10px] tracking-wider text-[#6f7881] font-bold block uppercase">Entre les soussignés</span>
                  <div className="bg-[#f7f9ff] border border-[#bec8d2]/30 p-4 rounded-lg space-y-2">
                    <p>
                      <strong>1. La Partie de Liaison :</strong> L'agence d'ingénierie et de management sportif <strong>Ndembo Kin Connect SARL</strong>, établie sous le numéro d'enregistrement commercial {INITIAL_SETTINGS.rcNumber}, dont l'adresse administrative se situe au {INITIAL_SETTINGS.address}, représentée d'office par son directeur associé <strong>Yannick Ndémbo</strong>, ci-après désignée "L'Agence / Le Manager".
                    </p>
                    <p>
                      <strong>2. Le Mandant d'Appui ou Représenté :</strong> L'entité professionnelle contractante <strong>{previewContract.clientName}</strong>, dont l'identifiant de CRM s'enregistre sous la référence {previewContract.clientId}, ci-après désignée "Le Client / L'Athlète".
                    </p>
                  </div>
                  <p className="italic">
                    Les parties s'entendent et arrêtent de manière solennelle et irréversible la présente convention réglementée par les clauses figurant dans les articles d'accords définis ci-après :
                  </p>
                </div>

                {/* Articles layout listing */}
                <div className="space-y-6">
                  {previewContract.articles.map((art, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <h4 className="font-heading font-extrabold text-xs text-[#00628f] uppercase tracking-tight">
                        {art.title}
                      </h4>
                      <p className="font-sans text-xs text-[#3f4850] leading-relaxed text-justify">
                        {art.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Closing terms notes and sign panel */}
                <div className="space-y-2 pt-6 border-t border-slate-200">
                  <span className="font-mono text-[10px] tracking-wider text-[#6f7881] font-bold block uppercase">Observations Complémentaires d'Homologation</span>
                  <p className="text-[10px] text-[#6f7881] italic leading-relaxed text-justify">
                    {previewContract.notes}
                  </p>
                  <p className="text-[8px] text-[#6f7881] leading-relaxed text-justify">
                    Le présent acte est rédigé en double exemplaire original en langue française de plein droit exécutoire à Kinshasa et régi par la législation sportive fédérale congolaise de la FECOFA et de la FIFA.
                  </p>
                </div>

                {/* Signatures representations with stamp space */}
                <div className="flex justify-between items-end pt-12">
                  <div className="space-y-1.5 print:hidden">
                    <span className="font-mono text-[10px] font-bold text-[#6f7881] uppercase block">Empreinte Légale de l'Acte</span>
                    <div className="border border-slate-300 w-36 h-20 flex items-center justify-center font-mono text-[9px] text-[#6f7881] bg-slate-50 border-double border-4 rounded">
                      [ Espace Sceau Sec ]
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 w-96 text-center font-sans text-[10px]">
                    <div className="space-y-12">
                      <span className="font-semibold block border-b border-slate-300 pb-1">Le Représentant de l'Agence</span>
                      <strong className="text-primary italic block">Yannick Ndémbo <br/> Directeur Associé</strong>
                    </div>
                    <div className="space-y-12">
                      <span className="font-semibold block border-b border-slate-300 pb-1">Bon pour accord exclusif</span>
                      <strong className="text-secondary italic block">{previewContract.clientName} <br/> Le Mandant Représenté</strong>
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
