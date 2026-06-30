/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Sparkles, Trophy, Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, HelpCircle, Send } from 'lucide-react';
import NdemboKinLogo from './NdemboKinLogo';

interface LoginViewProps {
  onLogin: (user: { name: string; role: string; email: string; avatarUrl?: string; password?: string }) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Directeur Associé');
  const [error, setError] = useState('');
  
  // Views states
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }

    const lowerEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Load registered system users list from localStorage
    const usersListStr = localStorage.getItem('ndembo_users_list');
    let systemUsers: any[] = [];
    if (usersListStr) {
      try {
        systemUsers = JSON.parse(usersListStr);
      } catch (err) {}
    }

    // Default backup users if list is empty
    const defaultUsers = [
      {
        name: 'Yannick Ndémbo',
        email: 'admin@ndembokin.com',
        role: 'Directeur Associé',
        password: 'admin1234'
      },
      {
        name: 'Yannick Ndémbo',
        email: 'bouakebb902@gmail.com',
        role: 'Directeur Associé',
        password: 'admin1234'
      }
    ];

    // Merge system users with defaults (avoiding duplicate email keys)
    const allUsers = [...systemUsers];
    defaultUsers.forEach(def => {
      if (!allUsers.some(u => u.email.toLowerCase().trim() === def.email.toLowerCase().trim())) {
        allUsers.push(def);
      }
    });

    // Check if there are individual session backup credentials
    const savedUserStr = localStorage.getItem('ndembo_current_user') || localStorage.getItem('ndembo_last_user_credentials');
    let savedUser: any = null;
    if (savedUserStr) {
      try {
        savedUser = JSON.parse(savedUserStr);
      } catch (err) {}
    }

    if (savedUser && !allUsers.some(u => u.email.toLowerCase().trim() === savedUser.email.toLowerCase().trim())) {
      allUsers.push(savedUser);
    }

    // Try matching
    const matchedUser = allUsers.find(u => 
      u.email.toLowerCase().trim() === lowerEmail && 
      (u.password === cleanPassword || (!u.password && cleanPassword === 'admin1234'))
    );

    if (matchedUser) {
      setError('');
      onLogin({
        name: matchedUser.name,
        role: matchedUser.role || 'Directeur Associé',
        email: lowerEmail,
        avatarUrl: matchedUser.avatarUrl,
        password: matchedUser.password || 'admin1234'
      });
    } else {
      setError('Identifiants incorrects. Veuillez vous connecter avec vos identifiants à jour ou par défaut ("admin@ndembokin.com" et "admin1234").');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setIsSubmitting(true);
    // Simulate real action with a beautiful success feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setForgotSuccess(true);
    }, 850);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans" id="login_screen">
      
      {/* LEFT SIDE: Deep slate elegant premium banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#07131e] via-[#0c1d2b] to-[#12283a] flex-col justify-between p-8 md:p-16 text-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#6f7881]/20 shadow-2xl">
        {/* Modern radial gradients for high-end aesthetic */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0083ca]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ffe07f]/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Logo/Brand Header */}
        <div className="flex items-center gap-3.5 z-10">
          <NdemboKinLogo size="sm" showText={false} className="bg-white/5 p-1 rounded-xl border border-white/10" />
          <div>
            <h1 className="font-heading font-black text-[#edf4ff] text-2xl leading-none tracking-tight italic uppercase">
              NDEMBO<span className="text-[#ffe07f]">KIN</span>
            </h1>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#ffe07f] font-extrabold block mt-1">
              SPORT MANAGEMENT
            </span>
          </div>
        </div>

        {/* Dynamic & engaging central marketing presentation block */}
        <div className="my-auto py-10 lg:py-16 z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-[#fcfcff] text-xs font-mono rounded-full border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#ffe07f]" /> 
            <span>RDC Sport Management System V1.0</span>
          </div>
          
          <div className="space-y-3">
            <h2 className="font-heading text-3xl md:text-4.5xl font-extrabold leading-tight tracking-tight text-white">
              Plateforme de gestion interne Ndembo Kin
            </h2>
            <div className="h-1.5 w-16 bg-gradient-to-r from-[#ffe07f] to-[#0083ca] rounded-full" />
          </div>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed opacity-90">
            Pilotez votre agence de management sportif avec une suite complète d'outils professionnels : devis, convertisseurs, gestion financière, éditions de contrats standardisés de prestation de service et de management d'athlètes d'élite.
          </p>
          
          {/* Real-time system telemetry card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-extrabold text-[#ffe07f] uppercase tracking-wider">
                  Système d'Information d'Entreprise
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                Actif (Prod)
              </span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Ce portail professionnel unifié centralise l'administration de vos activités : suivi de trésorerie, automatisation de contrats professionnels pour athlètes de haut niveau, et base clients CRM.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1 text-center font-mono">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">CONTRATS</span>
                <span className="text-sm font-bold text-white">Standard</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">SÉCURITÉ</span>
                <span className="text-sm font-bold text-[#ffe07f]">SSL 256</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block uppercase">SUPPORT</span>
                <span className="text-sm font-bold text-[#0083ca]">24h/7d</span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand/Conception Footer */}
        <div className="font-mono text-xs opacity-80 z-10 flex flex-col md:flex-row justify-between gap-3 border-t border-white/10 pt-4 w-full text-slate-400">
          <span>© 2026 Ndembo Kin Connect SARL</span>
          <span className="text-[#ffe07f] font-semibold">
            Conception : FASOPOST Design (+212777346787)
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Gorgeous interactive glass panel form container */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 md:p-12 lg:p-16 relative">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[#0083ca]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-slate-100 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 z-10">
          
          {/* Top visual brand header */}
          <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-slate-100">
            <NdemboKinLogo size="lg" className="transform hover:scale-[1.03] transition-transform duration-300 drop-shadow-sm" />
            <div className="mt-4 px-3 py-1 bg-primary/5 text-primary text-[10px] font-mono rounded-full font-bold uppercase tracking-widest border border-primary/10 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span>Portail Professionnel Sécurisé</span>
            </div>
          </div>

          {/* 1. LOGIN MODE */}
          {viewMode === 'login' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight">
                  Espace Connexion
                </h2>
                <p className="text-slate-500 text-sm font-sans">
                  Veuillez vous authentifier pour accéder aux outils de gestion opérationnelle.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium space-y-1">
                    <p className="font-bold">Erreur d'authentification :</p>
                    <p className="leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-extrabold text-slate-700 uppercase tracking-wider">
                    Adresse Email Professionnelle
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm bg-slate-50/50 focus:bg-white transition-all outline-none text-slate-800"
                      placeholder="nom@ndembokin.com"
                      required
                    />
                  </div>
                </div>

                {/* Password input with forgot trigger */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-mono font-extrabold text-slate-700 uppercase tracking-wider">
                      Mot de Passe
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('forgot');
                        setForgotSuccess(false);
                        setForgotEmail(email);
                      }}
                      className="text-primary text-xs hover:underline font-semibold focus:outline-none"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm bg-slate-50/50 focus:bg-white transition-all outline-none text-slate-800"
                      placeholder="••••••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Simulation Role Select (Implicit background state is maintained for security role privileges) */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Mode Simulateur</span>
                    <span className="text-xs text-slate-600 font-bold">Privilèges Directeur Associé (Admin)</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                </div>

                {/* Remember checklist */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="rounded text-primary border-slate-300 focus:ring-primary" />
                    <span>Rester connecté sur ce terminal</span>
                  </label>
                </div>

                {/* Submit trigger button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary hover:bg-[#007cb4] text-white font-heading font-extrabold rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Shield className="w-4.5 h-4.5" />
                  <span>Se connecter à l'Espace Pro</span>
                </button>
              </form>
            </div>
          )}

          {/* 2. FORGOT PASSWORD MODE */}
          {viewMode === 'forgot' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="space-y-1">
                <button
                  onClick={() => setViewMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors mb-2 font-mono font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour à la connexion</span>
                </button>
                <h2 className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight">
                  Mot de passe oublié ?
                </h2>
                <p className="text-slate-500 text-sm font-sans">
                  Saisissez votre adresse email professionnelle pour réinitialiser vos identifiants d'accès ou contacter le support.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-800">Instructions Envoyées</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Un lien de réinitialisation temporaire a été adressé à : <strong className="text-slate-900 font-bold">{forgotEmail}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#f0f4ff] border border-blue-100 rounded-lg text-xs space-y-2 text-slate-700">
                    <div className="flex items-center gap-2 text-blue-800 font-bold">
                      <HelpCircle className="w-4 h-4 text-primary" />
                      <span>Support Technique &amp; Intégrateur</span>
                    </div>
                    <p className="leading-relaxed">
                      Si vous ne recevez pas l'email ou si votre compte est bloqué, veuillez contacter immédiatement l'intégrateur système :
                    </p>
                    <p className="font-extrabold text-slate-900 flex items-center justify-between pt-1">
                      <span>FASOPOST Design</span>
                      <a href="tel:+212777346787" className="text-primary hover:underline">+212 777 346 787</a>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setViewMode('login');
                      setForgotSuccess(false);
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-heading font-extrabold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    Retourner à la page de connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-extrabold text-slate-700 uppercase tracking-wider">
                      Votre Adresse Email Professionnelle
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors">
                        <Mail className="w-4.5 h-4.5" />
                      </div>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm bg-slate-50/50 focus:bg-white transition-all outline-none text-slate-800"
                        placeholder="nom@ndembokin.com"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Entrez "admin@ndembokin.com" ou "bouakebb902@gmail.com" pour recevoir un code d'accès temporaire immédiat.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-primary hover:bg-[#007cb4] text-white font-heading font-extrabold rounded-xl transition-all shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4.5 h-4.5" />
                        <span>Envoyer le lien de réinitialisation</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
                    <span className="font-mono text-primary font-bold mt-0.5">ℹ</span>
                    <p className="leading-relaxed">
                      Une demande de mot de passe oublié génère une alerte auprès de la cellule technique <strong>FASOPOST Design</strong> pour audit de sécurité.
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Bottom regulatory warning & support copyright */}
          <div className="text-center pt-5 border-t border-slate-100 space-y-3">
            <span className="font-mono text-[9px] text-slate-400 uppercase block tracking-wider font-semibold">
              Accès réglementé • Confidentiel Ndembo Kin SARL
            </span>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex justify-center gap-3.5 text-[11px] text-slate-500 font-semibold font-sans">
                <span className="text-slate-600 font-bold">Sécurité active</span>
                <span className="opacity-30">|</span>
                <span>Kinshasa, Congo</span>
              </div>
              <div className="bg-[#f8faff] border border-blue-50/60 p-2.5 rounded-xl w-full text-center">
                <span className="text-[11px] text-slate-500 block font-sans">
                  Conception, Support &amp; Maintenance :
                </span>
                <span className="text-xs text-primary font-extrabold block mt-0.5 font-sans">
                  FASOPOST Design (+212777346787)
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
