import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  ArrowRight, 
  UserCheck, 
  TrendingUp, 
  Calendar, 
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
  timestamp?: number;
}

const ROLES = [
  {
    id: 'general',
    label: 'Assistant Général',
    icon: Sparkles,
    systemInstruction: "Tu es l'assistant IA officiel de l'agence de management sportif Ndembo Kin Connect. Tu as un ton professionnel, encourageant et concis. Tu as pour but d'aider les administrateurs et collaborateurs de l'agence dans leurs tâches quotidiennes.",
    color: 'from-blue-600 to-indigo-600',
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'Support général'
  },
  {
    id: 'rh',
    label: 'Expert RH & Droit',
    icon: UserCheck,
    systemInstruction: "Tu es l'expert juridique et RH officiel de Ndembo Kin Connect. Tu aides à rédiger des contrats d'engagement de type CDD/CDI, à évaluer l'ancienneté, ou à formuler des réponses aux demandes de congé, conformément au Code du Travail de la République Démocratique du Congo (RDC).",
    color: 'from-emerald-600 to-teal-600',
    bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: 'Contrats & Effectifs'
  },
  {
    id: 'finance',
    label: 'Analyste Financier',
    icon: TrendingUp,
    systemInstruction: "Tu es l'analyste financier en chef de Ndembo Kin Connect. Tu aides à interpréter les indicateurs financiers, à structurer des factures et des devis, ou à formuler des analyses de rentabilité basées sur des flux de trésorerie.",
    color: 'from-amber-600 to-orange-600',
    bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: 'Comptabilité & Cash'
  },
  {
    id: 'scouting',
    label: 'Agent & Recruteur',
    icon: BrainCircuit,
    systemInstruction: "Tu es l'agent sportif et recruteur en chef de Ndembo Kin Connect. Tu aides à analyser les statistiques de scouting des joueurs, à rédiger des fiches d'évaluation de talents sportifs, et à préparer des argumentaires de négociation de contrats de transfert.",
    color: 'from-purple-600 to-pink-600',
    bgColor: 'bg-purple-50 text-purple-700 border-purple-200',
    desc: 'Scouting & Mercato'
  }
];

const MODELS = [
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', desc: 'Général & Rapide', isPaid: false },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Lite', desc: 'Ultra-rapide', isPaid: false },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', desc: 'Raisonnement complexe (Premium)', isPaid: true }
];

const QUICK_PROMPTS: { [key: string]: string[] } = {
  general: [
    "Présente-moi les points forts de l'agence Ndembo Kin Connect.",
    "Rédige un message d'accueil pour la newsletter de l'agence.",
    "Comment structurer le suivi de projets de scouting ?"
  ],
  rh: [
    "Aide-moi à rédiger une clause de non-concurrence pour un joueur CDD.",
    "Quelle est la durée maximale légale d'un CDD en RDC ?",
    "Modèle de lettre d'acceptation d'un congé de maternité."
  ],
  finance: [
    "Explique comment analyser l'évolution trimestrielle de la trésorerie.",
    "Quels éléments obligatoires doivent figurer sur une facture ?",
    "Propose un plan d'optimisation budgétaire pour un tournoi de détection."
  ],
  scouting: [
    "Rédige un profil type pour un avant-centre prometteur de 18 ans.",
    "Comment évaluer le potentiel d'impact d'un gardien moderne ?",
    "Prépare un argumentaire de transfert pour un club de ligue européenne."
  ]
};

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(ROLES[0]);
  const [activeModel, setActiveModel] = useState(MODELS[0].id);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem(`ndembo_chat_history_${activeRole.id}`);
    if (savedChat) {
      try {
        setHistory(JSON.parse(savedChat));
      } catch (e) {
        setHistory([]);
      }
    } else {
      // Default welcome message
      setHistory([
        {
          role: 'model',
          parts: [{ text: `Bonjour ! Je suis votre **${activeRole.label}**. Comment puis-je vous accompagner aujourd'hui dans la gestion de l'agence ?` }]
        }
      ]);
    }
  }, [activeRole]);

  // Save history on change
  const saveHistory = (newHistory: ChatMessage[]) => {
    setHistory(newHistory);
    localStorage.setItem(`ndembo_chat_history_${activeRole.id}`, JSON.stringify(newHistory));
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleClearHistory = () => {
    if (confirm("Voulez-vous effacer l'historique de cette conversation ?")) {
      const resetHistory: ChatMessage[] = [
        {
          role: 'model',
          parts: [{ text: `Bonjour ! Je suis votre **${activeRole.label}**. Comment puis-je vous accompagner aujourd'hui dans la gestion de l'agence ?` }]
        }
      ];
      saveHistory(resetHistory);
      setError(null);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      parts: [{ text: textToSend }]
    };

    // Optimistic UI update
    const updatedHistory = [...history, userMsg];
    setHistory(updatedHistory);
    setMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          // Exclude first message if it was just welcome model text to avoid sending empty/unnecessary turns
          history: history.slice(1),
          model: activeModel,
          systemInstruction: activeRole.systemInstruction
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Une erreur s'est produite lors de la génération.");
      }

      const data = await response.json();
      
      // Preserve the initial welcome message, then append user message + model reply
      const finalHistory = [
        history[0],
        ...data.history
      ];
      saveHistory(finalHistory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de joindre l'Assistant IA. Vérifiez que votre GEMINI_API_KEY est configurée.");
      // Rollback last unsaved user message if needed, or keep it but mark error
    } finally {
      setIsLoading(false);
    }
  };

  const parseMarkdown = (text: string) => {
    // Simple inline formatter for bold (**text**)
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#0c1d2b]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="font-mono bg-slate-100 text-primary px-1 rounded">$1</code>');
    
    // Split by newlines to make paragraph blocks
    return html.split('\n').map((para, i) => {
      if (para.startsWith('- ') || para.startsWith('* ')) {
        return <li key={i} className="ml-4 list-disc text-xs text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: para.substring(2) }} />;
      }
      return para.trim() ? (
        <p key={i} className="text-xs text-slate-700 leading-relaxed mb-1.5" dangerouslySetInnerHTML={{ __html: para }} />
      ) : <div key={i} className="h-1.5" />;
    });
  };

  return (
    <div id="ai_assistant_global_container">
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary to-[#007cb4] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group ring-4 ring-primary/20"
        id="ai_assistant_trigger"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-28 transition-all duration-300 ease-out font-heading font-black text-xs uppercase tracking-wider whitespace-nowrap">
          Ndembo Assistant
        </span>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>
      </button>

      {/* Slide-over Panel (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-45"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-[#bec8d2]/70 h-full overflow-hidden"
              id="ai_assistant_drawer_panel"
            >
              {/* Header */}
              <div className="bg-[#0c1d2b] text-white p-5 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-gradient-to-tr from-primary to-[#007cb4] p-1.5 rounded-xl shadow-inner">
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                      <h2 className="font-heading font-black text-sm tracking-wide uppercase">
                        Ndembo AI Assistant
                      </h2>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Alimenté par Google Gemini
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleClearHistory}
                      title="Effacer la conversation"
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Model and Role Switches */}
                <div className="space-y-2 z-10">
                  {/* Select Role */}
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Expert Conseil :</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ROLES.map((role) => {
                        const IconComponent = role.icon;
                        const isSelected = activeRole.id === role.id;
                        return (
                          <button
                            key={role.id}
                            onClick={() => setActiveRole(role)}
                            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-primary border-primary text-white font-bold' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] block truncate leading-none">{role.label}</span>
                              <span className={`text-[8px] block opacity-80 truncate mt-0.5 leading-none`}>{role.desc}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Model */}
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Modèle d'IA :</label>
                    <div className="flex gap-1">
                      {MODELS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setActiveModel(m.id)}
                          className={`flex-1 text-center py-1 rounded-md text-[9px] font-semibold border transition-all cursor-pointer ${
                            activeModel === m.id
                              ? 'bg-gradient-to-r from-primary to-[#007cb4] border-primary text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {m.label.split(' ').slice(2).join(' ') || m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Thread Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                {history.map((msg, idx) => {
                  const isModel = msg.role === 'model';
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${isModel ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-[10px] shadow-xs ${
                        isModel 
                          ? `bg-gradient-to-tr ${activeRole.color}`
                          : 'bg-slate-800'
                      }`}>
                        {isModel ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      {/* Bubble */}
                      <div className={`p-3 rounded-2xl border text-xs shadow-3xs ${
                        isModel 
                          ? 'bg-white border-slate-200/60 rounded-tl-none text-slate-800'
                          : 'bg-[#e2f0fe] border-blue-200/60 text-[#0c1d2b] rounded-tr-none'
                      }`}>
                        <div className="space-y-1.5">
                          {parseMarkdown(msg.parts[0].text)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading state / thinking animation */}
                {isLoading && (
                  <div className="flex gap-3 max-w-[80%] mr-auto">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white bg-gradient-to-tr ${activeRole.color} shadow-xs`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200/60 p-3 rounded-2xl rounded-tl-none shadow-3xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[10px] text-slate-400 font-semibold italic ml-1">L'expert réfléchit...</span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1.5">
                    <div className="font-extrabold flex items-center gap-1.5 text-red-900">
                      <X className="w-4 h-4" />
                      <span>Erreur d'intégration</span>
                    </div>
                    <p className="leading-relaxed opacity-90">{error}</p>
                    <p className="text-[10px] text-slate-500">Note : Assurez-vous d'avoir saisi la clé API Gemini dans le panneau Settings.</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Panel */}
              <div className="px-4 py-2 border-t border-slate-100 bg-white">
                <span className="text-[9px] font-mono uppercase font-black text-slate-400 block mb-1.5">Suggestions d'exploration :</span>
                <div className="flex flex-col gap-1">
                  {QUICK_PROMPTS[activeRole.id].map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left py-1 px-2.5 rounded bg-slate-50 hover:bg-primary/5 hover:text-primary transition-colors text-[10px] text-slate-600 font-medium truncate flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">{prompt}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-primary flex-shrink-0 ml-2 transform group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Field */}
              <div className="p-4 border-t border-slate-200/70 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(message);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Demander à l'${activeRole.label}...`}
                    disabled={isLoading}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="bg-primary hover:bg-[#005278] text-white p-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
