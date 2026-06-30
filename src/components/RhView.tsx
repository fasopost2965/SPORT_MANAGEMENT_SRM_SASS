import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  FileText, 
  Calendar, 
  Plus, 
  Play, 
  Square, 
  Check, 
  X, 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  Search,
  Edit,
  Printer,
  BarChart3
} from 'lucide-react';
import { Project, HrEmployee, HrLeave, HrPayslip, TimeSession, SystemUser, Facture, Contact } from '../types';
import { INITIAL_HR_EMPLOYEES, INITIAL_HR_LEAVES, INITIAL_HR_PAYSLIPS, INITIAL_TIME_SESSIONS } from '../mockData';

interface RhViewProps {
  projects: Project[];
  currentUser: SystemUser;
  factures: Facture[];
  contacts: Contact[];
  setFactures: React.Dispatch<React.SetStateAction<Facture[]>>;
  setView: (view: any) => void;
  initialSubTab?: 'dashboard' | 'employees' | 'presence' | 'payslips';
}

export default function RhView({ 
  projects, 
  currentUser,
  factures,
  contacts,
  setFactures,
  setView,
  initialSubTab
}: RhViewProps) {
  // Nested Tabs
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'employees' | 'presence' | 'payslips'>(initialSubTab || 'dashboard');
  const [presenceSubTab, setPresenceSubTab] = useState<'tracker' | 'leaves'>('tracker');

  // Synchronize active sub-tab with parent prop changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Persistence keys
  const EMPLOYEES_KEY = 'ndembo_hr_employees';
  const LEAVES_KEY = 'ndembo_hr_leaves';
  const PAYSLIPS_KEY = 'ndembo_hr_payslips';
  const TIME_SESSIONS_KEY = 'ndembo_time_sessions';

  // State managers
  const [employees, setEmployees] = useState<HrEmployee[]>(() => {
    const saved = localStorage.getItem(EMPLOYEES_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Default mock data is loaded below in useEffect or directly
    return [];
  });

  const [leaves, setLeaves] = useState<HrLeave[]>(() => {
    const saved = localStorage.getItem(LEAVES_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [payslips, setPayslips] = useState<HrPayslip[]>(() => {
    const saved = localStorage.getItem(PAYSLIPS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [sessions, setSessions] = useState<TimeSession[]>(() => {
    const saved = localStorage.getItem(TIME_SESSIONS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Load from mock data if empty
  useEffect(() => {
    if (employees.length === 0) {
      setEmployees(INITIAL_HR_EMPLOYEES);
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(INITIAL_HR_EMPLOYEES));
    }
    if (leaves.length === 0) {
      setLeaves(INITIAL_HR_LEAVES);
      localStorage.setItem(LEAVES_KEY, JSON.stringify(INITIAL_HR_LEAVES));
    }
    if (payslips.length === 0) {
      setPayslips(INITIAL_HR_PAYSLIPS);
      localStorage.setItem(PAYSLIPS_KEY, JSON.stringify(INITIAL_HR_PAYSLIPS));
    }
    if (sessions.length === 0) {
      setSessions(INITIAL_TIME_SESSIONS);
      localStorage.setItem(TIME_SESSIONS_KEY, JSON.stringify(INITIAL_TIME_SESSIONS));
    }
  }, []);

  // Save on state change
  useEffect(() => {
    if (employees.length > 0) localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    if (leaves.length > 0) localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    if (payslips.length > 0) localStorage.setItem(PAYSLIPS_KEY, JSON.stringify(payslips));
  }, [payslips]);

  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem(TIME_SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // LIVE TRACKER ACTIVE SESSION STATE
  const [activeSession, setActiveSession] = useState<TimeSession | null>(() => {
    const savedActive = localStorage.getItem('ndembo_active_time_session');
    if (savedActive) {
      try { return JSON.parse(savedActive); } catch (e) {}
    }
    return null;
  });

  const [trackerProjectId, setTrackerProjectId] = useState<string>(projects[0]?.id || '');
  const [trackerDescription, setTrackerDescription] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Interval timer for active session
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeSession) {
      const startMs = new Date(activeSession.startTime).getTime();
      interval = setInterval(() => {
        const diffSeconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
        setElapsedSeconds(diffSeconds);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  // Save active session
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('ndembo_active_time_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('ndembo_active_time_session');
    }
  }, [activeSession]);

  // Form states Employee
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false);
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empJobTitle, setEmpJobTitle] = useState('');
  const [empDept, setEmpDept] = useState('Technique & Scouting');
  const [empHireDate, setEmpHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [empContract, setEmpContract] = useState<'CDI' | 'CDD' | 'Consultant' | 'Stagiaire'>('CDI');
  const [empSalary, setEmpSalary] = useState<number>(1500);
  const [empContractEndDate, setEmpContractEndDate] = useState('');

  // Search & Filters for Employee Directory
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('All');
  const [empContractFilter, setEmpContractFilter] = useState('All');
  const [empStatusFilter, setEmpStatusFilter] = useState('All');

  // Edit employee modal state
  const [editingEmployee, setEditingEmployee] = useState<HrEmployee | null>(null);
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpEmail, setEditEmpEmail] = useState('');
  const [editEmpPhone, setEditEmpPhone] = useState('');
  const [editEmpJobTitle, setEditEmpJobTitle] = useState('');
  const [editEmpDept, setEditEmpDept] = useState('Technique & Scouting');
  const [editEmpHireDate, setEditEmpHireDate] = useState('');
  const [editEmpContract, setEditEmpContract] = useState<'CDI' | 'CDD' | 'Consultant' | 'Stagiaire'>('CDI');
  const [editEmpSalary, setEditEmpSalary] = useState<number>(1500);
  const [editEmpStatus, setEditEmpStatus] = useState<'actif' | 'conge' | 'suspendu' | 'sorti'>('actif');
  const [editEmpContractEndDate, setEditEmpContractEndDate] = useState('');

  // States for contract renewal on the dashboard
  const [renewingEmployee, setRenewingEmployee] = useState<HrEmployee | null>(null);
  const [newContractEndDate, setNewContractEndDate] = useState('');
  const [newContractType, setNewContractType] = useState<'CDI' | 'CDD' | 'Consultant' | 'Stagiaire'>('CDD');

  // Form states Leave Request
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveEmployeeId, setLeaveEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState<'Congé Payé' | 'Maladie' | 'Maternité' | 'Sans Solde' | 'Autre'>('Congé Payé');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Form states Payslip
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipEmployeeId, setPayslipEmployeeId] = useState('');
  const [payslipPeriod, setPayslipPeriod] = useState('Juin 2026');
  const [payslipBonus, setPayslipBonus] = useState<number>(0);
  const [selectedPayslipForPdf, setSelectedPayslipForPdf] = useState<HrPayslip | null>(null);
  const [payslipCountry, setPayslipCountry] = useState<'RDC' | 'Maroc' | 'Sénégal' | 'Canada'>('RDC');
  const [selectedEmployeeForContract, setSelectedEmployeeForContract] = useState<HrEmployee | null>(null);

  // Contract Builder customize states
  const [contractSignerName, setContractSignerName] = useState("Jonathan Fula");
  const [contractSignerTitle, setContractSignerTitle] = useState("Directeur Technique");
  const [contractPlace, setContractPlace] = useState("Kinshasa");
  const [contractProbationPeriod, setContractProbationPeriod] = useState("3 mois");
  const [contractWeeklyHours, setContractWeeklyHours] = useState("45 heures");
  const [contractDuties, setContractDuties] = useState("");
  const [contractTransportBonus, setContractTransportBonus] = useState(150);
  const [contractHousingBonus, setContractHousingBonus] = useState(200);

  useEffect(() => {
    if (selectedEmployeeForContract) {
      const emp = selectedEmployeeForContract;
      setContractDuties(`Assurer les fonctions de ${emp.jobTitle} au sein du département ${emp.department}. Le collaborateur s'engage à exécuter ses tâches professionnelles de scouting, d'analyse technique ou d'encadrement sportif avec rigueur, intégrité et professionnalisme selon les orientations de la direction générale de Ndembo Agency.`);
      
      // Default probation based on type
      if (emp.contractType === 'Stagiaire') {
        setContractProbationPeriod("1 mois");
        setContractWeeklyHours("40 heures");
      } else if (emp.contractType === 'Consultant') {
        setContractProbationPeriod("Pas de période d'essai");
        setContractWeeklyHours("Flexible (selon livrables)");
      } else if (emp.contractType === 'CDD') {
        setContractProbationPeriod("1 mois");
        setContractWeeklyHours("45 heures");
      } else {
        setContractProbationPeriod("3 mois (renouvelable une fois)");
        setContractWeeklyHours("45 heures");
      }
    }
  }, [selectedEmployeeForContract?.id]);

  // Billing States
  const [billedSessionIds, setBilledSessionIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ndembo_billed_session_ids');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('ndembo_billed_session_ids', JSON.stringify(billedSessionIds));
  }, [billedSessionIds]);

  const [billingProjectId, setBillingProjectId] = useState<string>(projects[0]?.id || '');
  const [billingRate, setBillingRate] = useState<number>(75); // $75/hour standard
  const [billingTva, setBillingTva] = useState<number>(16); // 16% standard RDC
  const [billingSuccess, setBillingSuccess] = useState<{ invoiceId: string; invoiceNum: string } | null>(null);

  const handleGenerateInvoiceFromTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingProjectId) return;
    const project = projects.find(p => p.id === billingProjectId);
    if (!project) return;

    // Filter unbilled, completed sessions for this project
    const unbilledSessions = sessions.filter(
      s => s.projectId === billingProjectId && 
      s.status === 'completed' && 
      !billedSessionIds.includes(s.id)
    );

    if (unbilledSessions.length === 0) return;

    const totalMinutes = unbilledSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalHours = Math.max(0.1, Number((totalMinutes / 60).toFixed(2)));
    const totalHT = Math.round(totalHours * billingRate);
    const totalTVA = Math.round(totalHT * (billingTva / 100));
    const totalTTC = totalHT + totalTVA;

    const invoiceNum = `FAC-2026-T-${100 + factures.length + 1}`;
    const newInvoiceId = `fac_t_${Date.now()}`;

    const descriptionText = `Heures de connexion cumulées pour le projet "${project.name}" - ${totalHours}h à ${billingRate} USD/h (${unbilledSessions.length} sessions de suivi du temps)`;

    const newLineItem = {
      id: `li_${Date.now()}`,
      serviceName: `Consultance Sportive - Suivi de Temps`,
      description: descriptionText,
      qty: 1,
      unitPrice: totalHT,
      total: totalHT
    };

    const newInvoice: Facture = {
      id: newInvoiceId,
      number: invoiceNum,
      clientId: project.clientId || 'c_unknown',
      clientName: project.clientName || 'Client inconnu',
      dateCreated: new Date().toISOString().split('T')[0],
      dateDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days due
      items: [newLineItem],
      status: 'Non payée',
      tvaPercent: billingTva,
      totalHT,
      totalTVA,
      totalTTC,
      notes: `Facture émise automatiquement d'après le relevé d'activité du temps connecté du portail RH Ndembo Connect. Heures de connexion détaillées : ${totalHours} heures.`
    };

    // Update parent state
    setFactures(prev => [...prev, newInvoice]);

    // Mark sessions as billed
    const newlyBilledIds = unbilledSessions.map(s => s.id);
    setBilledSessionIds(prev => [...prev, ...newlyBilledIds]);

    // Show success notice
    setBillingSuccess({
      invoiceId: newInvoiceId,
      invoiceNum: invoiceNum
    });
  };

  // Tracker Actions
  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerProjectId) return;
    const project = projects.find(p => p.id === trackerProjectId);
    const newSession: TimeSession = {
      id: `ts_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      projectId: trackerProjectId,
      projectName: project ? project.name : 'Projet inconnu',
      startTime: new Date().toISOString(),
      description: trackerDescription,
      status: 'active'
    };
    setActiveSession(newSession);
    setTrackerDescription('');
  };

  const handleStopSession = () => {
    if (!activeSession) return;
    const end = new Date().toISOString();
    const durationMin = Math.max(1, Math.round((Date.now() - new Date(activeSession.startTime).getTime()) / 60000));
    
    const completed: TimeSession = {
      ...activeSession,
      endTime: end,
      durationMinutes: durationMin,
      status: 'completed'
    };

    setSessions([completed, ...sessions]);
    setActiveSession(null);
  };

  // Employee actions
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFirstName || !empLastName || !empEmail) return;
    const combinedName = `${empFirstName} ${empLastName}`.trim();
    const newEmp: HrEmployee = {
      id: `emp_${Date.now()}`,
      name: combinedName,
      email: empEmail,
      phone: empPhone,
      jobTitle: empJobTitle,
      department: empDept,
      hireDate: empHireDate,
      contractType: empContract,
      monthlySalary: empSalary,
      status: 'actif'
    };
    if (empContract !== 'CDI' && empContractEndDate) {
      newEmp.contractEndDate = empContractEndDate;
    }
    setEmployees([...employees, newEmp]);
    setIsEmpModalOpen(false);
    setIsAddFormExpanded(false);
    // Reset
    setEmpFirstName('');
    setEmpLastName('');
    setEmpEmail('');
    setEmpPhone('');
    setEmpJobTitle('');
    setEmpSalary(1500);
    setEmpContractEndDate('');
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Voulez-vous vraiment retirer ce collaborateur de l'effectif RH ?")) {
      const updated = employees.filter(e => e.id !== id);
      setEmployees(updated);
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
    }
  };

  const handleStartEditEmployee = (emp: HrEmployee) => {
    setEditingEmployee(emp);
    setEditEmpName(emp.name);
    setEditEmpEmail(emp.email);
    setEditEmpPhone(emp.phone || '');
    setEditEmpJobTitle(emp.jobTitle);
    setEditEmpDept(emp.department);
    setEditEmpHireDate(emp.hireDate);
    setEditEmpContract(emp.contractType);
    setEditEmpSalary(emp.monthlySalary);
    setEditEmpStatus(emp.status);
    setEditEmpContractEndDate(emp.contractEndDate || '');
  };

  const handleSaveEditEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const updated = employees.map(emp => {
      if (emp.id === editingEmployee.id) {
        const updatedEmp: HrEmployee = {
          ...emp,
          name: editEmpName,
          email: editEmpEmail,
          phone: editEmpPhone,
          jobTitle: editEmpJobTitle,
          department: editEmpDept,
          hireDate: editEmpHireDate,
          contractType: editEmpContract,
          monthlySalary: editEmpSalary,
          status: editEmpStatus
        };
        if (editEmpContract !== 'CDI' && editEmpContractEndDate) {
          updatedEmp.contractEndDate = editEmpContractEndDate;
        } else {
          delete updatedEmp.contractEndDate;
        }
        return updatedEmp;
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
    setEditingEmployee(null);
  };

  const handleRenewContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingEmployee) return;
    const updatedEmployees = employees.map(emp => {
      if (emp.id === renewingEmployee.id) {
        return {
          ...emp,
          contractType: newContractType as any,
          contractEndDate: newContractType === 'CDI' ? undefined : newContractEndDate
        };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    setRenewingEmployee(null);
    setNewContractEndDate('');
  };

  // Leave actions
  const handleRequestLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveEmployeeId || !leaveStart || !leaveEnd) return;
    const emp = employees.find(e => e.id === leaveEmployeeId);
    if (!emp) return;

    const start = new Date(leaveStart);
    const end = new Date(leaveEnd);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave: HrLeave = {
      id: `lv_${Date.now()}`,
      employeeId: leaveEmployeeId,
      employeeName: emp.name,
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      daysCount: diffDays,
      reason: leaveReason,
      status: 'En attente'
    };

    setLeaves([newLeave, ...leaves]);
    setIsLeaveModalOpen(false);
    setLeaveReason('');
  };

  const handleUpdateLeaveStatus = (id: string, newStatus: 'Approuvé' | 'Refusé') => {
    setLeaves(leaves.map(lv => {
      if (lv.id === id) {
        // Update employee status if leave is approved
        if (newStatus === 'Approuvé') {
          setEmployees(employees.map(emp => {
            if (emp.id === lv.employeeId) {
              return { ...emp, status: 'conge' };
            }
            return emp;
          }));
        }
        return { ...lv, status: newStatus };
      }
      return lv;
    }));
  };

  // Payslip actions
  const handleGeneratePayslip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payslipEmployeeId) return;
    const emp = employees.find(emp => emp.id === payslipEmployeeId);
    if (!emp) return;

    // Standard DRC Tax simulation: CNSS 4% + IPR ~15% depending on salary
    const cnssSocialSecurity = Math.round(emp.monthlySalary * 0.04);
    const iprIncomeTax = Math.round((emp.monthlySalary - cnssSocialSecurity) * 0.15);
    const totalDeductions = cnssSocialSecurity + iprIncomeTax;
    const net = emp.monthlySalary + payslipBonus - totalDeductions;

    const newPayslip: HrPayslip = {
      id: `ps_${Date.now()}`,
      employeeId: payslipEmployeeId,
      employeeName: emp.name,
      period: payslipPeriod,
      baseSalary: emp.monthlySalary,
      bonuses: payslipBonus,
      deductions: totalDeductions,
      netPay: net,
      paymentStatus: 'En attente'
    };

    setPayslips([newPayslip, ...payslips]);
    setIsPayslipModalOpen(false);
    setPayslipBonus(0);
  };

  const handleMarkPayslipPaid = (id: string) => {
    setPayslips(payslips.map(ps => {
      if (ps.id === id) {
        return {
          ...ps,
          paymentStatus: 'Payé',
          paymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return ps;
    }));
  };

  // Helper formatting session duration
  const formatSeconds = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in" id="hr_module_root">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-heading font-black text-on-surface text-xl md:text-2xl tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-primary" />
            <span>Portail RH &amp; Suivi du Temps</span>
          </h2>
          <p className="text-xs text-[#6f7881] mt-1">
            Gérez vos collaborateurs, suivez en temps réel le temps de connexion par projet, planifiez les congés et générez les fiches de paie.
          </p>
        </div>

        {/* Dynamic active session notification in header */}
        {activeSession && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <div className="text-xs">
              <span className="font-extrabold text-amber-950 block">Session active : {activeSession.projectName}</span>
              <span className="font-mono text-[11px] text-amber-800">{formatSeconds(elapsedSeconds)}</span>
            </div>
            <button 
              onClick={handleStopSession}
              className="ml-2 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase cursor-pointer"
            >
              Arrêter
            </button>
          </div>
        )}
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none pb-px">
        {[
          { id: 'dashboard', label: '📊 Tableau de Bord', desc: 'Indicateurs clés RH de l\'agence Ndembo' },
          { id: 'employees', label: '👥 Répertoire Personnel', desc: 'Gestion de la liste du personnel et contrats de l\'agence' },
          { id: 'presence', label: '⏱️ Présence Personnel', desc: 'Suivi de connexion, temps d\'activité par projet et congés/absences' },
          { id: 'payslips', label: '💵 Paie (pour les salaires)', desc: 'Calcul de l\'IPR/CNSS RDC et génération des versements de salaires' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`pb-3 text-xs md:text-sm font-heading font-extrabold border-b-2 transition-all px-4 whitespace-nowrap cursor-pointer ${
              activeSubTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            title={tab.desc}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN VIEW CONTENTS */}

      {/* Presence Navigation (only visible when presence tab is active) */}
      {activeSubTab === 'presence' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-2xs">
          <div className="flex bg-slate-200/50 p-1 rounded-xl self-start gap-1">
            <button
              onClick={() => setPresenceSubTab('tracker')}
              className={`py-2 px-4 text-xs font-heading font-extrabold rounded-lg transition-all cursor-pointer ${
                presenceSubTab === 'tracker'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-[#6f7881] hover:text-slate-850'
              }`}
            >
              ⏱️ Heures de Connexion &amp; Activités
            </button>
            <button
              onClick={() => setPresenceSubTab('leaves')}
              className={`py-2 px-4 text-xs font-heading font-extrabold rounded-lg transition-all cursor-pointer ${
                presenceSubTab === 'leaves'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-[#6f7881] hover:text-slate-850'
              }`}
            >
              📅 Congés &amp; Absences
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {presenceSubTab === 'tracker' 
              ? 'Enregistrez vos heures de présence connectée et gérez la facturation.' 
              : 'Planifiez vos congés annuels ou absences et suivez les validations RH.'}
          </p>
        </div>
      )}
      
      {/* 0. SUMMARY DASHBOARD VIEW */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-[#0c1d2b] text-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl -mr-20 -mt-20"></div>
            <div className="space-y-1 relative z-10">
              <h3 className="text-lg font-heading font-extrabold">Tableau de Bord RH - Ndembo</h3>
              <p className="text-xs text-slate-300">
                Aperçu analytique de l'effectif, suivi d'absentéisme et gestion des échéances de contrats de l'agence.
              </p>
            </div>
            <button
              onClick={() => setIsEmpModalOpen(true)}
              className="bg-primary hover:bg-[#005177] text-white px-4 py-2 rounded-xl text-xs font-heading font-extrabold flex items-center gap-2 self-start md:self-auto shadow-xs cursor-pointer relative z-10 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Embaucher un Collaborateur</span>
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Metric 1: Effectif Total */}
            <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h4 className="text-xs font-mono uppercase font-bold text-[#6f7881]">Effectif Collaborateurs</h4>
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-heading font-black text-[#0c1d2b]">
                    {employees.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">membres actifs</span>
                </div>

                {/* Sub breakdown */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Actifs à plein temps
                    </span>
                    <span className="font-bold text-[#0c1d2b]">
                      {employees.filter(e => e.status === 'actif').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      En Congé / Absence
                    </span>
                    <span className="font-bold text-[#0c1d2b]">
                      {employees.filter(e => e.status === 'conge').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                      Suspendus / Autres
                    </span>
                    <span className="font-bold text-[#0c1d2b]">
                      {employees.filter(e => e.status === 'suspendu' || e.status === 'sorti').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Department representation helper */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6f7881] block">Distribution par Département</span>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(new Set(employees.map(e => e.department))).map(dept => {
                    const count = employees.filter(e => e.department === dept).length;
                    const percent = Math.round((count / (employees.length || 1)) * 100);
                    return (
                      <div key={dept} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-700 truncate block" title={dept}>
                          {dept}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${percent}%` }}></div>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metric 2: Taux d'absentéisme mensuel */}
            <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h4 className="text-xs font-mono uppercase font-bold text-[#6f7881]">Taux d'Absentéisme</h4>
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                {(() => {
                  // Mathematical dynamic computation of absenteeism rate
                  // Total approved leave days
                  const approvedLeaves = leaves.filter(l => l.status === 'Approuvé');
                  const totalAbsenceDays = approvedLeaves.reduce((acc, curr) => acc + (curr.daysCount || 0), 0);
                  const activeEmployeesCount = employees.filter(e => e.status !== 'sorti').length || 1;
                  const theoreticalWorkingDays = activeEmployeesCount * 22; // 22 working days / month
                  const rate = Number(((totalAbsenceDays / theoreticalWorkingDays) * 100).toFixed(1));
                  
                  // Qualitative label
                  let label = 'Optimal';
                  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  let barColor = 'bg-emerald-500';
                  if (rate > 10) {
                    label = 'Critique';
                    badgeColor = 'bg-red-50 text-red-700 border-red-200';
                    barColor = 'bg-red-500';
                  } else if (rate > 5) {
                    label = 'Modéré';
                    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    barColor = 'bg-amber-500';
                  }

                  return (
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-heading font-black text-[#0c1d2b]">
                          {rate}%
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {label}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Seuil de vigilance (5%)</span>
                          <span>{rate}% / 20% max</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${Math.min(100, (rate / 20) * 100)}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Détails de la formule</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          Calculé sur <span className="font-extrabold">{totalAbsenceDays} jours</span> d'absences approuvées, divisé par le volume théorique de l'effectif actif (<span className="font-bold">{theoreticalWorkingDays}j-homme</span>/mois).
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveSubTab('presence');
                    setPresenceSubTab('leaves');
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-xs font-bold text-[#0c1d2b] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  Gérer les demandes de congés
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Metric 3: Échéances de contrats */}
            <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h4 className="text-xs font-mono uppercase font-bold text-[#6f7881]">Contrats CDD &amp; Consultants</h4>
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>

                {(() => {
                  const contractsWithExpiry = employees.filter(e => e.contractType !== 'CDI' && e.contractEndDate);
                  
                  if (contractsWithExpiry.length === 0) {
                    return (
                      <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                        Aucune échéance de contrat temporaire en cours.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-heading font-black text-[#0c1d2b]">
                          {contractsWithExpiry.length}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">temporaires suivis</span>
                      </div>

                      <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto scrollbar-none pr-1">
                        {contractsWithExpiry.map(emp => {
                          const today = new Date('2026-06-30');
                          const expiry = new Date(emp.contractEndDate!);
                          const diffTime = expiry.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                          let textStatus = `${diffDays} jours restants`;
                          let bg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          if (diffDays < 0) {
                            textStatus = 'Échu';
                            bg = 'bg-red-50 text-red-700 border-red-200';
                          } else if (diffDays <= 30) {
                            textStatus = 'Critique !';
                            bg = 'bg-red-50 text-red-700 border-red-100';
                          } else if (diffDays <= 90) {
                            textStatus = 'Attention';
                            bg = 'bg-amber-50 text-amber-700 border-amber-100';
                          }

                          return (
                            <div key={emp.id} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/50">
                              <div className="min-w-0 flex-1 pr-2">
                                <span className="text-xs font-heading font-extrabold text-[#0c1d2b] block truncate">
                                  {emp.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {emp.contractType} • {emp.contractEndDate}
                                </span>
                              </div>
                              <span className={`text-[9px] font-mono font-bold px-2 py-1 rounded-lg border ${bg} shrink-0`}>
                                {textStatus} ({diffDays}j)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveSubTab('employees')}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-xs font-bold text-[#0c1d2b] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  Voir tous les collaborateurs
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

          </div>

          {/* Section Analytique & Graphiques */}
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading font-black text-[#0c1d2b] text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Analyses de l'Effectif &amp; Recrutements</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Visualisez en temps réel la distribution de vos talents et la dynamique d'intégration des nouveaux collaborateurs.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/50 p-1.5 rounded-xl self-start sm:self-auto text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>Mise à jour en temps réel</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Répartition par Département */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase font-black text-[#6f7881] tracking-wider">
                    Répartition par Département
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {Array.from(new Set(employees.map(e => e.department))).length} Départements
                  </span>
                </div>

                {/* Graphique en barres horizontales */}
                <div className="space-y-4 pt-2">
                  {(() => {
                    const depts = Array.from(new Set(employees.map(e => e.department)));
                    const deptCounts = depts.map(dept => {
                      const count = employees.filter(e => e.department === dept).length;
                      return { dept, count };
                    });
                    
                    // Sort descending by count
                    deptCounts.sort((a, b) => b.count - a.count);
                    const maxCount = Math.max(...deptCounts.map(d => d.count), 1);

                    return deptCounts.map(({ dept, count }) => {
                      const percentage = Math.round((count / (employees.length || 1)) * 100);
                      const barWidth = `${(count / maxCount) * 100}%`;
                      
                      return (
                        <div key={dept} className="group space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-heading font-extrabold text-[#0c1d2b] group-hover:text-primary transition-colors">
                              {dept}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-500 text-[10px]">({percentage}%)</span>
                              <span className="font-bold text-[#0c1d2b] bg-slate-100 px-2 py-0.5 rounded-md min-w-[28px] text-center">
                                {count}
                              </span>
                            </div>
                          </div>
                          <div className="h-6 w-full bg-slate-50 border border-slate-100 rounded-lg overflow-hidden relative group-hover:border-slate-200 transition-colors">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-[#007cb4] rounded-r-md transition-all duration-1000 ease-out relative"
                              style={{ width: barWidth }}
                            >
                              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[shimmer_20s_linear_infinite] opacity-30"></div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Chart 2: Arrivées Récentes & Dynamique de Recrutement */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase font-black text-[#6f7881] tracking-wider">
                    Évolution des Recrutements (Arrivées)
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Nouveaux Talents
                  </span>
                </div>

                {/* Graphique en barres verticales */}
                {(() => {
                  // Group employees by hire year to show a beautiful vertical bar chart
                  const hiresByPeriod: { [key: string]: number } = {};
                  employees.forEach(emp => {
                    if (emp.hireDate) {
                      const year = emp.hireDate.substring(0, 4);
                      hiresByPeriod[year] = (hiresByPeriod[year] || 0) + 1;
                    }
                  });

                  // Ensure we show at least the years 2023, 2024, 2025, 2026
                  const targetYears = ["2023", "2024", "2025", "2026"];
                  const chartData = targetYears.map(year => ({
                    period: year,
                    count: hiresByPeriod[year] || 0
                  }));

                  const maxCount = Math.max(...chartData.map(d => d.count), 1);

                  return (
                    <div className="space-y-6 pt-2">
                      {/* Vertical Bars Container */}
                      <div className="h-44 flex items-end justify-between gap-4 px-2 pt-4 bg-slate-50/50 border border-slate-150 rounded-xl relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-x-0 top-1/4 border-t border-slate-200/40 pointer-events-none"></div>
                        <div className="absolute inset-x-0 top-2/4 border-t border-slate-200/40 pointer-events-none"></div>
                        <div className="absolute inset-x-0 top-3/4 border-t border-slate-200/40 pointer-events-none"></div>

                        {chartData.map(({ period, count }) => {
                          const heightPercent = `${(count / maxCount) * 100}%`;
                          return (
                            <div key={period} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                              <span className="text-[10px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-1.5 py-0.5 rounded absolute -top-4 pointer-events-none shadow-xs">
                                {count} {count > 1 ? 'arrivées' : 'arrivée'}
                              </span>
                              
                              {/* Actual Bar */}
                              <div 
                                className="w-full sm:w-12 bg-gradient-to-t from-[#0c1d2b] to-primary hover:to-emerald-500 rounded-t-lg transition-all duration-700 relative overflow-hidden group-hover:shadow-md cursor-pointer"
                                style={{ height: heightPercent || '4px' }}
                              >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] opacity-25"></div>
                                <span className="absolute inset-x-0 top-1 text-center font-mono font-bold text-[9px] text-white">
                                  {count > 0 ? count : ''}
                                </span>
                              </div>

                              <span className="text-[10px] font-mono font-black text-slate-500 group-hover:text-primary transition-colors mt-1">
                                {period}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Display of the last most recent hires specifically */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Les Plus Récents Arrivants</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[...employees]
                            .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
                            .slice(0, 4)
                            .map((emp) => (
                              <div key={emp.id} className="flex items-center gap-3 p-2 border border-slate-100 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="p-1.5 bg-primary/5 rounded-lg text-primary text-xs font-black">
                                  {emp.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-850 truncate block">{emp.name}</span>
                                    <span className="text-[9px] font-mono font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {new Date(emp.hireDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 block truncate">{emp.jobTitle} • {emp.department}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Bottom Row - Staggered details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Detailed contract timeline & action centre */}
            <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-heading font-extrabold text-[#0c1d2b] text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Centre de Renouvellement de Contrat</span>
              </h3>
              
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Prolongez ou convertissez les contrats temporaires (CDD et Consultants) directement pour maintenir la stabilité de l'agence.
              </p>

              {(() => {
                const candidates = employees.filter(e => e.contractType !== 'CDI' && e.contractEndDate);
                if (candidates.length === 0) {
                  return (
                    <div className="p-4 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Aucun candidat au renouvellement trouvé actuellement.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="divide-y divide-slate-100">
                      {candidates.map(emp => {
                        const expiry = new Date(emp.contractEndDate!);
                        const diffDays = Math.ceil((expiry.getTime() - new Date('2026-06-30').getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-heading font-extrabold text-[#0c1d2b]">{emp.name}</span>
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {emp.contractType}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                Échéance le <span className="font-semibold text-slate-700">{emp.contractEndDate}</span> ({diffDays} jours restants)
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                setRenewingEmployee(emp);
                                setNewContractEndDate(emp.contractEndDate || '');
                                setNewContractType(emp.contractType as any);
                              }}
                              className="bg-primary hover:bg-[#005177] text-white py-1.5 px-3 rounded-lg text-[11px] font-heading font-extrabold cursor-pointer transition-all self-start sm:self-auto shadow-2xs"
                            >
                              Gérer le contrat
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right: Absences and Leave Approvals Activity */}
            <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-heading font-extrabold text-[#0c1d2b] text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Demandes d'Absences &amp; Congés récents</span>
              </h3>
              
              {leaves.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Aucun historique de demande de congé enregistré.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto scrollbar-none pr-1">
                    {leaves.map(leave => {
                      let statusBadge = '';
                      if (leave.status === 'Approuvé') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      else if (leave.status === 'Refusé') statusBadge = 'bg-red-50 text-red-700 border-red-100';
                      else statusBadge = 'bg-amber-50 text-amber-700 border-amber-100';

                      return (
                        <div key={leave.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-heading font-extrabold text-[#0c1d2b] block">{leave.employeeName}</span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {leave.leaveType} • {leave.daysCount} jours ({leave.startDate} au {leave.endDate})
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusBadge}`}>
                              {leave.status}
                            </span>
                          </div>
                          
                          {leave.reason && (
                            <p className="text-[11px] text-slate-500 italic font-medium leading-relaxed">
                              « {leave.reason} »
                            </p>
                          )}

                          {leave.status === 'En attente' && (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => {
                                  const updated = leaves.map(l => l.id === leave.id ? { ...l, status: 'Approuvé' as const } : l);
                                  setLeaves(updated);
                                  localStorage.setItem(LEAVES_KEY, JSON.stringify(updated));
                                  // Trigger status update of employee if approved
                                  const updatedEmps = employees.map(emp => {
                                    if (emp.id === leave.employeeId) {
                                      return { ...emp, status: 'conge' as const };
                                    }
                                    return emp;
                                  });
                                  setEmployees(updatedEmps);
                                  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmps));
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-heading font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer shadow-3xs"
                              >
                                Approuver
                              </button>
                              <button
                                onClick={() => {
                                  const updated = leaves.map(l => l.id === leave.id ? { ...l, status: 'Refusé' as const } : l);
                                  setLeaves(updated);
                                  localStorage.setItem(LEAVES_KEY, JSON.stringify(updated));
                                }}
                                className="bg-slate-100 hover:bg-slate-250 text-slate-700 text-[10px] font-heading font-extrabold py-1 px-2.5 rounded-md transition-all cursor-pointer border border-slate-200"
                              >
                                Refuser
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Custom Contract Renewal Modal */}
          {renewingEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-heading font-black text-[#0c1d2b] text-base">Renouvellement de Contrat</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Pour {renewingEmployee.name}</p>
                  </div>
                  <button
                    onClick={() => setRenewingEmployee(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleRenewContract} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Poste actuel</label>
                    <input
                      type="text"
                      disabled
                      value={`${renewingEmployee.jobTitle} (${renewingEmployee.department})`}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50 text-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Nouveau type de contrat</label>
                    <select
                      value={newContractType}
                      onChange={(e) => setNewContractType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      <option value="CDD">CDD (Durée déterminée)</option>
                      <option value="Consultant">Consultant / Freelance</option>
                      <option value="CDI">CDI (Durée indéterminée)</option>
                    </select>
                  </div>

                  {newContractType !== 'CDI' && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Nouvelle date d'échéance</label>
                      <input
                        type="date"
                        value={newContractEndDate}
                        onChange={(e) => setNewContractEndDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setRenewingEmployee(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 1. TIME TRACKER VIEW */}
      {activeSubTab === 'presence' && presenceSubTab === 'tracker' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column container with Tracker and Billing Cards */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Clock-in form card */}
              <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="font-heading font-extrabold text-[#0c1d2b] text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Lancer le Compteur de Connexion</span>
                </h3>

                {!activeSession ? (
                  <form onSubmit={handleStartSession} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Sélectionner le Projet *</label>
                      <select
                        value={trackerProjectId}
                        onChange={(e) => setTrackerProjectId(e.target.value)}
                        className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Description du travail (Facultatif)</label>
                      <textarea
                        value={trackerDescription}
                        onChange={(e) => setTrackerDescription(e.target.value)}
                        placeholder="Ex: Négociation avec le secrétariat sportif du club..."
                        rows={3}
                        className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-[#005177] text-white py-3 rounded-lg text-xs font-heading font-black flex items-center justify-center gap-2 shadow-xs transition-transform hover:scale-[1.01] cursor-pointer"
                    >
                      <Play className="w-4.5 h-4.5 fill-current" />
                      <span>DÉMARRER LA SESSION</span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 text-center py-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center animate-pulse">
                      <Clock className="w-8 h-8 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-full">
                        COMPTEUR EN COURS
                      </span>
                      <h4 className="font-heading font-black text-sm text-on-surface mt-2">{activeSession.projectName}</h4>
                      <p className="text-[10px] text-slate-500 italic mt-1">"{activeSession.description || 'Aucune description'}"</p>
                    </div>

                    <div className="font-mono text-3xl font-bold text-slate-900 tracking-wider">
                      {formatSeconds(elapsedSeconds)}
                    </div>

                    <button
                      type="button"
                      onClick={handleStopSession}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-lg text-xs font-heading font-black flex items-center justify-center gap-2 shadow-xs transition-transform hover:scale-[1.01] cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>ARRÊTER LA SESSION (ENREGISTRER)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Facturer les Heures Connectées Card */}
              <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 shadow-xs space-y-4" id="billing_card">
                <h3 className="font-heading font-extrabold text-[#0c1d2b] text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Facturer les Heures Connectées</span>
                </h3>

                {billingSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl p-3.5 space-y-2.5 animate-in fade-in zoom-in-95">
                    <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600 font-extrabold" />
                      <span>Facture {billingSuccess.invoiceNum} générée !</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-normal">
                      Les heures de connexion du projet ont été consolidées avec succès dans la liste de facturation client.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setBillingSuccess(null);
                          setView('factures');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                      >
                        Consulter la Facture
                      </button>
                      <button
                        onClick={() => setBillingSuccess(null)}
                        className="border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-[10px] uppercase px-2 py-1.5 rounded-lg cursor-pointer transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleGenerateInvoiceFromTime} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Sélectionner le Projet *</label>
                    <select
                      value={billingProjectId}
                      onChange={(e) => {
                        setBillingProjectId(e.target.value);
                        setBillingSuccess(null);
                      }}
                      className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const project = projects.find(p => p.id === billingProjectId);
                    const unbilledSessions = sessions.filter(
                      s => s.projectId === billingProjectId && 
                      s.status === 'completed' && 
                      !billedSessionIds.includes(s.id)
                    );

                    const totalMinutes = unbilledSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
                    const totalHours = Math.max(0, Number((totalMinutes / 60).toFixed(2)));
                    const totalHT = Math.round(totalHours * billingRate);
                    const totalTVA = Math.round(totalHT * (billingTva / 100));
                    const totalTTC = totalHT + totalTVA;

                    return (
                      <>
                        {/* Summary metrics of the project selected */}
                        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6f7881] font-medium">Sessions non facturées</span>
                            <span className="font-bold text-slate-900">{unbilledSessions.length}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#6f7881] font-medium">Temps cumulé</span>
                            <span className="font-mono font-bold text-slate-900">{totalHours} heures</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-dashed border-slate-200 pt-2">
                            <span className="text-slate-700 font-bold">Client ciblé</span>
                            <span className="font-bold text-[#0c1d2b] truncate max-w-[120px]" title={project?.clientName}>{project?.clientName || 'Inconnu'}</span>
                          </div>
                        </div>

                        {unbilledSessions.length > 0 ? (
                          <>
                            {/* Inputs for pricing */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Tarif Horaire ($)</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={billingRate}
                                  onChange={(e) => setBillingRate(Math.max(1, Number(e.target.value)))}
                                  className="w-full px-2.5 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">TVA (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={billingTva}
                                  onChange={(e) => setBillingTva(Math.max(0, Number(e.target.value)))}
                                  className="w-full px-2.5 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            </div>

                            {/* Cost Previews */}
                            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 space-y-1.5">
                              <div className="flex justify-between text-[11px] font-medium text-emerald-800">
                                <span>Sous-total HT :</span>
                                <span className="font-mono">{totalHT.toLocaleString()} USD</span>
                              </div>
                              <div className="flex justify-between text-[11px] font-medium text-emerald-800">
                                <span>Taxe TVA ({billingTva}%) :</span>
                                <span className="font-mono">{totalTVA.toLocaleString()} USD</span>
                              </div>
                              <div className="flex justify-between text-xs font-black text-emerald-950 border-t border-emerald-200/50 pt-1.5">
                                <span>Total TTC à Facturer :</span>
                                <span className="font-mono text-emerald-700">{totalTTC.toLocaleString()} USD</span>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-heading font-black flex items-center justify-center gap-1.5 shadow-xs transition-transform hover:scale-[1.01] cursor-pointer"
                            >
                              <FileSpreadsheet className="w-4.5 h-4.5" />
                              <span>GÉNÉRER LA FACTURE CLIENT</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-[11px] text-amber-800 bg-amber-50/50 border border-amber-200 p-3 rounded-xl text-center leading-normal">
                            Aucune heure connectée en attente de facturation pour ce projet. Utilisez le compteur ci-dessus pour enregistrer de nouvelles sessions d'activité.
                          </div>
                        )}
                      </>
                    );
                  })()}
                </form>
              </div>

            </div>

            {/* Explanatory widget and summary cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-heading font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-4.5 h-4.5 text-primary" />
                    <span>Analytique du temps connecté</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    Ce module enregistre la durée exacte passée par chaque administrateur et collaborateur sur les opportunités et les transferts d'athlètes. Idéal pour optimiser les marges et facturer vos prestations de consultance sportive.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-slate-150 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Temps total enregistré</span>
                    <Clock className="w-4.5 h-4.5 text-slate-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-mono font-bold text-slate-950 block">
                      {Math.round(sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / 60)}h
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Cumulé sur {sessions.length} sessions terminées</span>
                  </div>
                </div>
              </div>

              {/* History of sessions */}
              <div className="bg-white border border-[#bec8d2]/70 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-heading font-extrabold text-slate-800">Historique des Sessions de Connexion</h3>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">{sessions.length} sessions</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-mono uppercase text-[#6f7881] border-b border-slate-100">
                        <th className="py-3 px-4">Collaborateur</th>
                        <th className="py-3 px-4">Projet ciblé</th>
                        <th className="py-3 px-4">Date de début</th>
                        <th className="py-3 px-4">Durée (Min)</th>
                        <th className="py-3 px-4">Facturation</th>
                        <th className="py-3 px-4">Tâche / Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessions.map((s) => (
                        <tr key={s.id} className="text-xs hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-semibold text-slate-900">{s.userName}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">{s.projectName}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {new Date(s.startTime).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-800 font-mono font-extrabold px-2 py-0.5 rounded text-[11px]">
                              {s.durationMinutes || 0} min
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {billedSessionIds.includes(s.id) ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Facturé</span>
                              </span>
                            ) : s.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <span className="w-1 h-1 rounded-full bg-amber-500" />
                                <span>À facturer</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <span className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
                                <span>En cours</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-[#6f7881] italic">
                            {s.description || 'Aucune description fournie'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EMPLOYEE DIRECTORY */}
      {activeSubTab === 'employees' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div>
              <span className="text-xs text-slate-600 font-medium">Liste officielle du personnel et statut légal RDC</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddFormExpanded(!isAddFormExpanded)}
                className={`px-3.5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                  isAddFormExpanded 
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                    : 'bg-primary hover:bg-[#005177] text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{isAddFormExpanded ? 'Masquer le formulaire' : 'Ajouter un employé'}</span>
              </button>
            </div>
          </div>

          {/* Formulaire Ajouter un employé */}
          {isAddFormExpanded && (
            <div className="bg-white border border-slate-250 rounded-2xl shadow-sm p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900">Ajouter un nouvel employé</h3>
                  <p className="text-[10px] text-slate-500">Saisissez les informations pour créer un nouveau profil de collaborateur.</p>
                </div>
                <button 
                  onClick={() => setIsAddFormExpanded(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 rounded hover:bg-slate-100"
                >
                  Fermer
                </button>
              </div>

              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Nom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Fula"
                      value={empLastName}
                      onChange={(e) => setEmpLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Prénom */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Prénom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jonathan"
                      value={empFirstName}
                      onChange={(e) => setEmpFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Poste */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Poste d'Embauche *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Scout Régional"
                      value={empJobTitle}
                      onChange={(e) => setEmpJobTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Adresse Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Adresse Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: j.fula@ndembokin.com"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Numéro de téléphone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Numéro de téléphone</label>
                    <input
                      type="text"
                      placeholder="Ex: +243 81 234 5678"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Département */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Département *</label>
                    <select
                      value={empDept}
                      onChange={(e) => setEmpDept(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      <option value="Technique & Scouting">Technique &amp; Scouting</option>
                      <option value="Juridique">Juridique</option>
                      <option value="Administration & Finance">Administration &amp; Finance</option>
                      <option value="Direction">Direction</option>
                    </select>
                  </div>

                  {/* Date d'embauche */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Date d'embauche *</label>
                    <input
                      type="date"
                      required
                      value={empHireDate}
                      onChange={(e) => setEmpHireDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Type de contrat */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Type de Contrat *</label>
                    <select
                      value={empContract}
                      onChange={(e) => setEmpContract(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    >
                      <option value="CDI">CDI (Durée indéterminée)</option>
                      <option value="CDD">CDD (Durée déterminée)</option>
                      <option value="Consultant">Consultant / Freelance</option>
                      <option value="Stagiaire">Stagiaire pro</option>
                    </select>
                  </div>
                </div>

                {empContract !== 'CDI' && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Date de fin de contrat *</label>
                    <input
                      type="date"
                      value={empContractEndDate}
                      onChange={(e) => setEmpContractEndDate(e.target.value)}
                      required
                      className="w-full md:w-1/3 px-3 py-2 border border-amber-350 bg-amber-50/10 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Salaire Brut */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Salaire Brut Mensuel (USD)</label>
                    <input
                      type="number"
                      placeholder="1500"
                      value={empSalary}
                      onChange={(e) => setEmpSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddFormExpanded(false);
                      // Reset fields
                      setEmpFirstName('');
                      setEmpLastName('');
                      setEmpEmail('');
                      setEmpPhone('');
                      setEmpJobTitle('');
                      setEmpSalary(1500);
                      setEmpContractEndDate('');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Créer le profil</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search and Filters bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Rechercher un nom, poste, email..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-250 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none bg-white"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={empDeptFilter}
                onChange={(e) => setEmpDeptFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">Tous les Départements</option>
                <option value="Technique & Scouting">Technique &amp; Scouting</option>
                <option value="Juridique">Juridique</option>
                <option value="Administration & Finance">Administration &amp; Finance</option>
                <option value="Direction">Direction</option>
              </select>
            </div>

            {/* Contract Filter */}
            <div>
              <select
                value={empContractFilter}
                onChange={(e) => setEmpContractFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">Tous les types de contrat</option>
                <option value="CDI">CDI (Durée indéterminée)</option>
                <option value="CDD">CDD (Durée déterminée)</option>
                <option value="Consultant">Consultant / Freelance</option>
                <option value="Stagiaire">Stagiaire pro</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={empStatusFilter}
                onChange={(e) => setEmpStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">Tous les Statuts</option>
                <option value="actif">Actif</option>
                <option value="conge">En congé</option>
                <option value="suspendu">Suspendu</option>
                <option value="sorti">Sorti</option>
              </select>
            </div>
          </div>

          {(() => {
            const filteredEmployees = employees.filter((emp) => {
              const matchesSearch = 
                emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
                emp.jobTitle.toLowerCase().includes(empSearch.toLowerCase()) ||
                emp.email.toLowerCase().includes(empSearch.toLowerCase()) ||
                (emp.phone && emp.phone.toLowerCase().includes(empSearch.toLowerCase()));
              
              const matchesDept = empDeptFilter === 'All' || emp.department === empDeptFilter;
              const matchesContract = empContractFilter === 'All' || emp.contractType === empContractFilter;
              const matchesStatus = empStatusFilter === 'All' || emp.status === empStatusFilter;

              return matchesSearch && matchesDept && matchesContract && matchesStatus;
            });

            if (filteredEmployees.length === 0) {
              return (
                <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-8 text-center text-slate-500 text-xs">
                  Aucun collaborateur ne correspond à ces critères de recherche.
                </div>
              );
            }

            return (
              <div className="bg-white border border-[#bec8d2]/70 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-mono uppercase text-[#6f7881] border-b border-slate-100">
                        <th className="py-3 px-4">Nom Complet / Contacts</th>
                        <th className="py-3 px-4">Poste &amp; Département</th>
                        <th className="py-3 px-4">Type de Contrat</th>
                        <th className="py-3 px-4">Date d'embauche</th>
                        <th className="py-3 px-4">Salaire Brut Mensuel</th>
                        <th className="py-3 px-4">Statut RH</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="text-xs hover:bg-slate-50/50">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-950 text-xs">{emp.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {emp.email} {emp.phone ? `• ${emp.phone}` : ''}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{emp.jobTitle}</div>
                            <div className="text-[10px] text-[#6f7881]">{emp.department}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="inline-flex flex-col">
                              <span className="bg-slate-100 text-slate-800 font-mono font-bold px-2 py-0.5 rounded text-[10px] self-start">
                                {emp.contractType}
                              </span>
                              {emp.contractEndDate && (
                                <span className="text-[9px] text-slate-500 font-mono mt-1">
                                  Fin: {emp.contractEndDate}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {new Date(emp.hireDate).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {emp.monthlySalary.toLocaleString()} USD
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.status === 'actif' ? 'bg-emerald-50 text-emerald-700' :
                              emp.status === 'conge' ? 'bg-blue-50 text-blue-700' :
                              emp.status === 'suspendu' ? 'bg-amber-50 text-amber-700' :
                              'bg-slate-50 text-slate-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                emp.status === 'actif' ? 'bg-emerald-500' :
                                emp.status === 'conge' ? 'bg-blue-500' :
                                emp.status === 'suspendu' ? 'bg-amber-500' :
                                'bg-slate-400'
                              }`} />
                              <span className="capitalize">{emp.status === 'conge' ? 'En congé' : emp.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button
                                onClick={() => setSelectedEmployeeForContract(emp)}
                                className="bg-sky-50 hover:bg-sky-100 text-[#006097] hover:text-[#005177] px-2.5 py-1 rounded text-[10px] font-black uppercase cursor-pointer border border-sky-150 transition-colors flex items-center gap-1"
                                title="Générer le contrat complet imprimable"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Contrat (PDF)</span>
                              </button>
                              <button
                                onClick={() => handleStartEditEmployee(emp)}
                                className="text-slate-600 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
                                title="Modifier les informations"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(emp.id)}
                                className="text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50 cursor-pointer"
                                title="Supprimer de l'effectif"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. LEAVE REQUESTS */}
      {activeSubTab === 'presence' && presenceSubTab === 'leaves' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div>
              <span className="text-xs text-slate-600 font-medium">Validation des demandes de congés annuels et absences</span>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="bg-primary hover:bg-[#005177] text-white px-3.5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Déposer une Demande de Congé</span>
            </button>
          </div>

          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-mono uppercase text-[#6f7881] border-b border-slate-100">
                    <th className="py-3 px-4">Collaborateur</th>
                    <th className="py-3 px-4">Motif de congé</th>
                    <th className="py-3 px-4">Dates planifiées</th>
                    <th className="py-3 px-4">Durée (Jours)</th>
                    <th className="py-3 px-4">Explication / Justification</th>
                    <th className="py-3 px-4">Décision RH</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaves.map((lv) => (
                    <tr key={lv.id} className="text-xs hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{lv.employeeName}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <span className="bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded text-[10px] font-bold">
                          {lv.leaveType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        Du {new Date(lv.startDate).toLocaleDateString('fr-FR')} au {new Date(lv.endDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{lv.daysCount} jours</td>
                      <td className="py-3.5 px-4 text-[#6f7881] italic max-w-xs truncate" title={lv.reason}>
                        "{lv.reason}"
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          lv.status === 'Approuvé' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          lv.status === 'Refusé' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                        }`}>
                          {lv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {lv.status === 'En attente' && (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateLeaveStatus(lv.id, 'Approuvé')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-md cursor-pointer"
                              title="Valider la demande"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateLeaveStatus(lv.id, 'Refusé')}
                              className="bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md cursor-pointer"
                              title="Rejeter la demande"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYSLIPS & SALARIES */}
      {activeSubTab === 'payslips' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div>
              <span className="text-xs text-slate-600 font-medium">Génération des fiches de paie et versement des salaires de l'agence</span>
            </div>
            <button
              onClick={() => setIsPayslipModalOpen(true)}
              className="bg-primary hover:bg-[#005177] text-white px-3.5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <DollarSign className="w-4 h-4" />
              <span>Générer une Fiche de Paie</span>
            </button>
          </div>

          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-mono uppercase text-[#6f7881] border-b border-slate-100">
                    <th className="py-3 px-4">Collaborateur</th>
                    <th className="py-3 px-4">Période de Paie</th>
                    <th className="py-3 px-4">Salaire Brut de Base</th>
                    <th className="py-3 px-4">Primes / Bonus</th>
                    <th className="py-3 px-4">Retenues RDC (CNSS + IPR)</th>
                    <th className="py-3 px-4">Salaire Net Payé</th>
                    <th className="py-3 px-4">État Versement</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payslips.map((ps) => (
                    <tr key={ps.id} className="text-xs hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{ps.employeeName}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{ps.period}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{ps.baseSalary.toLocaleString()} USD</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-semibold">+{ps.bonuses.toLocaleString()} USD</td>
                      <td className="py-3.5 px-4 font-mono text-rose-600">-{ps.deductions.toLocaleString()} USD</td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 bg-slate-50/30">
                        {ps.netPay.toLocaleString()} USD
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ps.paymentStatus === 'Payé' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'
                        }`}>
                          {ps.paymentStatus === 'Payé' ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span>Payé le {ps.paymentDate}</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-amber-500" />
                              <span>En attente de virement</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setSelectedPayslipForPdf(ps)}
                            className="bg-sky-50 hover:bg-sky-100 text-[#006097] hover:text-[#005177] px-2.5 py-1 rounded text-[10px] font-black uppercase cursor-pointer border border-sky-150 transition-colors flex items-center gap-1"
                            title="Voir et imprimer le bulletin de paie"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Bulletin (PDF)</span>
                          </button>
                          {ps.paymentStatus === 'En attente' && (
                            <button
                              onClick={() => handleMarkPayslipPaid(ps.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[10px] font-black uppercase cursor-pointer transition-transform hover:scale-105"
                            >
                              Payer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* MODALS */}

      {/* 1. Modal: Embaucher un collaborateur */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-xl animate-in zoom-in-95 duration-250">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-sm text-slate-900">Embauche d'un collaborateur</h3>
              <button onClick={() => setIsEmpModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fula"
                    value={empLastName}
                    onChange={(e) => setEmpLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jonathan"
                    value={empFirstName}
                    onChange={(e) => setEmpFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Adresse Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="j.fula@ndembokin.com"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Numéro Téléphone</label>
                  <input
                    type="text"
                    placeholder="+243 81 234 5678"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Poste d'Embauche</label>
                  <input
                    type="text"
                    placeholder="Ex: Scout Régional"
                    value={empJobTitle}
                    onChange={(e) => setEmpJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Département</label>
                  <select
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  >
                    <option value="Technique & Scouting">Technique &amp; Scouting</option>
                    <option value="Juridique">Juridique</option>
                    <option value="Administration & Finance">Administration &amp; Finance</option>
                    <option value="Direction">Direction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Type de Contrat</label>
                  <select
                    value={empContract}
                    onChange={(e) => setEmpContract(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  >
                    <option value="CDI">CDI (Durée indéterminée)</option>
                    <option value="CDD">CDD (Durée déterminée)</option>
                    <option value="Consultant">Consultant / Freelance</option>
                    <option value="Stagiaire">Stagiaire pro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Date d'entrée en fonction</label>
                  <input
                    type="date"
                    value={empHireDate}
                    onChange={(e) => setEmpHireDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {empContract !== 'CDI' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Date de fin de contrat *</label>
                  <input
                    type="date"
                    value={empContractEndDate}
                    onChange={(e) => setEmpContractEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-amber-350 bg-amber-50/10 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Salaire Brut Mensuel (USD)</label>
                <input
                  type="number"
                  placeholder="1500"
                  value={empSalary}
                  onChange={(e) => setEmpSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Embaucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Demande de Congé */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-xl animate-in zoom-in-95 duration-250">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-sm text-slate-900">Demander un Congé</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestLeave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Sélectionner le Collaborateur *</label>
                <select
                  value={leaveEmployeeId}
                  onChange={(e) => setLeaveEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">-- Choisir un collaborateur --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.jobTitle})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Type de Congé</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                >
                  <option value="Congé Payé">Congé Payé</option>
                  <option value="Maladie">Congé Maladie</option>
                  <option value="Maternité">Maternité / Paternité</option>
                  <option value="Sans Solde">Absence Sans Solde</option>
                  <option value="Autre">Autre Cas de Force Majeure</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Date de Début *</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Date de Fin *</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Explication / Justification *</label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Précisez la raison de votre congé (Ex: Voyage professionnel à Lubumbashi, urgence familiale...)"
                  rows={3}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Soumettre la Demande</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Générer Fiche de Paie */}
      {isPayslipModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-xl animate-in zoom-in-95 duration-250">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-sm text-slate-900">Générer une Fiche de Paie RDC</h3>
              <button onClick={() => setIsPayslipModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePayslip} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Sélectionner le Collaborateur *</label>
                <select
                  value={payslipEmployeeId}
                  onChange={(e) => setPayslipEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">-- Choisir un collaborateur --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.monthlySalary} USD/mois)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Période de Paie *</label>
                  <select
                    value={payslipPeriod}
                    onChange={(e) => setPayslipPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    required
                  >
                    <option value="Juin 2026">Juin 2026</option>
                    <option value="Juillet 2026">Juillet 2026</option>
                    <option value="Août 2026">Août 2026</option>
                    <option value="Septembre 2026">Septembre 2026</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Retenues Fiscales &amp; Sociales</label>
                  <div className="w-full px-3 py-2 border border-slate-100 rounded-lg text-xs bg-slate-50 text-[#6f7881] font-bold font-mono">
                    CNSS 4% + IPR 15% (Simulé)
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Primes / Bonus Exceptionnels (USD)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={payslipBonus}
                  onChange={(e) => setPayslipBonus(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsPayslipModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Calculer &amp; Émettre</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Modifier un collaborateur */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-xl animate-in zoom-in-95 duration-250">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-sm text-slate-900">Modifier le Collaborateur</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {editingEmployee.id}</p>
              </div>
              <button onClick={() => setEditingEmployee(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEmployee} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Nom Complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jonathan Fula"
                  value={editEmpName}
                  onChange={(e) => setEditEmpName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Adresse Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="j.fula@ndembokin.com"
                    value={editEmpEmail}
                    onChange={(e) => setEditEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Numéro Téléphone</label>
                  <input
                    type="text"
                    placeholder="+243 81 234 5678"
                    value={editEmpPhone}
                    onChange={(e) => setEditEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Poste d'Embauche</label>
                  <input
                    type="text"
                    placeholder="Ex: Scout Régional"
                    value={editEmpJobTitle}
                    onChange={(e) => setEditEmpJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Département</label>
                  <select
                    value={editEmpDept}
                    onChange={(e) => setEditEmpDept(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  >
                    <option value="Technique & Scouting">Technique &amp; Scouting</option>
                    <option value="Juridique">Juridique</option>
                    <option value="Administration & Finance">Administration &amp; Finance</option>
                    <option value="Direction">Direction</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Type de Contrat</label>
                  <select
                    value={editEmpContract}
                    onChange={(e) => setEditEmpContract(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  >
                    <option value="CDI">CDI (Durée indéterminée)</option>
                    <option value="CDD">CDD (Durée déterminée)</option>
                    <option value="Consultant">Consultant / Freelance</option>
                    <option value="Stagiaire">Stagiaire pro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Date d'entrée en fonction</label>
                  <input
                    type="date"
                    value={editEmpHireDate}
                    onChange={(e) => setEditEmpHireDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {editEmpContract !== 'CDI' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Date de fin de contrat *</label>
                  <input
                    type="date"
                    value={editEmpContractEndDate}
                    onChange={(e) => setEditEmpContractEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-amber-350 bg-amber-50/10 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Salaire Brut Mensuel (USD)</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={editEmpSalary}
                    onChange={(e) => setEditEmpSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-[#6f7881]">Statut RH</label>
                  <select
                    value={editEmpStatus}
                    onChange={(e) => setEditEmpStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#bec8d2] rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                  >
                    <option value="actif">Actif</option>
                    <option value="conge">En congé</option>
                    <option value="suspendu">Suspendu</option>
                    <option value="sorti">Sorti / Licencié</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Bulletin de Salaire PDF / Imprimer */}
      {selectedPayslipForPdf && (() => {
        const ps = selectedPayslipForPdf;
        const emp = employees.find(e => e.id === ps.employeeId);

        // Compute exact seniority based on employee hireDate
        const calculateSeniority = (hireDateStr?: string) => {
          if (!hireDateStr) return "N/A";
          const hireDate = new Date(hireDateStr);
          const now = new Date("2026-06-30"); // System Reference Date
          let years = now.getFullYear() - hireDate.getFullYear();
          let months = now.getMonth() - hireDate.getMonth();
          if (months < 0) {
            years--;
            months += 12;
          }
          if (years === 0) {
            return `${months} mois`;
          }
          if (months === 0) {
            return `${years} an${years > 1 ? 's' : ''}`;
          }
          return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
        };

        // Dynamic multi-country model calculations
        let modelTitle = "";
        let countryLabel = "";
        let lineItems: Array<{ label: string, rate: string, gain?: number, deduction?: number, isBold?: boolean, isTax?: boolean }> = [];
        let employerCharges: Array<{ label: string, val: number, rate: string }> = [];
        let totalGains = ps.baseSalary + ps.bonuses;
        let totalRetenues = 0;

        // Base salary gains
        lineItems.push({ label: "Salaire de base brut", rate: "100.00 %", gain: ps.baseSalary, isBold: true });
        if (ps.bonuses > 0) {
          lineItems.push({ label: "Primes, bonus et gratifications", rate: "Forfaitaire", gain: ps.bonuses, isBold: true });
        }

        if (payslipCountry === 'RDC') {
          modelTitle = "Bulletin conforme à la législation RDC (Code du Travail)";
          countryLabel = "République Démocratique du Congo (RDC)";
          
          const cnssSalariale = Math.round(ps.baseSalary * 0.04);
          const ipr = Math.round(ps.baseSalary * 0.15); // Standard flat RDC estimate
          totalRetenues = cnssSalariale + ipr;
          
          lineItems.push({ label: "Cotisation CNSS Salariale (Régime Général RDC)", rate: "4.00 %", deduction: cnssSalariale, isTax: true });
          lineItems.push({ label: "Impôt Professionnel sur le Revenu (IPR RDC)", rate: "15.00 % (Simulé)", deduction: ipr, isTax: true });
          
          employerCharges = [
            { label: "CNSS Patronale", val: Math.round(ps.baseSalary * 0.13), rate: "13.00 %" },
            { label: "INPP (Formation)", val: Math.round(ps.baseSalary * 0.03), rate: "3.00 %" },
            { label: "ONEM (Emploi)", val: Math.round(ps.baseSalary * 0.002), rate: "0.20 %" }
          ];
        } else if (payslipCountry === 'Maroc') {
          modelTitle = "Bulletin conforme à la législation du Maroc (CNSS / IR)";
          countryLabel = "Royaume du Maroc";
          
          const cnssSalariale = Math.round(ps.baseSalary * 0.0448);
          const amoSalariale = Math.round(ps.baseSalary * 0.0226);
          const irMaroc = Math.round(ps.baseSalary * 0.20); // Simulated 20% flat IR
          totalRetenues = cnssSalariale + amoSalariale + irMaroc;
          
          lineItems.push({ label: "Cotisation CNSS Salariale (Prestations)", rate: "4.48 %", deduction: cnssSalariale, isTax: true });
          lineItems.push({ label: "Assurance Maladie Obligatoire (AMO Salarial)", rate: "2.26 %", deduction: amoSalariale, isTax: true });
          lineItems.push({ label: "Impôt sur le Revenu (IR Maroc)", rate: "20.00 % (Simulé)", deduction: irMaroc, isTax: true });
          
          employerCharges = [
            { label: "CNSS Patronale (Prestations & Alloc.)", val: Math.round(ps.baseSalary * 0.2109), rate: "21.09 %" },
            { label: "AMO Patronale (Santé)", val: Math.round(ps.baseSalary * 0.0411), rate: "4.11 %" },
            { label: "Taxe de Formation Professionnelle", val: Math.round(ps.baseSalary * 0.016), rate: "1.60 %" }
          ];
        } else if (payslipCountry === 'Sénégal') {
          modelTitle = "Bulletin conforme à la législation du Sénégal (IPRES / VRS)";
          countryLabel = "République du Sénégal";
          
          const ipresSalariale = Math.round(ps.baseSalary * 0.056);
          const irSenegal = Math.round(ps.baseSalary * 0.18); // Simulated 18% flat IR
          totalRetenues = ipresSalariale + irSenegal;
          
          lineItems.push({ label: "Cotisation IPRES Salariale (Retraite)", rate: "5.60 %", deduction: ipresSalariale, isTax: true });
          lineItems.push({ label: "Impôt sur le Revenu (VRS Sénégal)", rate: "18.00 % (Simulé)", deduction: irSenegal, isTax: true });
          
          employerCharges = [
            { label: "IPRES Patronale (Retraite)", val: Math.round(ps.baseSalary * 0.084), rate: "8.40 %" },
            { label: "CSS Prestations Familiales", val: Math.round(ps.baseSalary * 0.07), rate: "7.00 %" },
            { label: "CSS Accidents du Travail", val: Math.round(ps.baseSalary * 0.03), rate: "3.00 %" }
          ];
        } else { // Canada
          modelTitle = "Bulletin conforme aux normes canadiennes (AE / RPC / RRQ)";
          countryLabel = "Canada (Fédéral + Québec)";
          
          const rpcSalarial = Math.round(ps.baseSalary * 0.0595);
          const aeSalarial = Math.round(ps.baseSalary * 0.0163);
          const irCanada = Math.round(ps.baseSalary * 0.22); // Simulated 22% IR
          totalRetenues = rpcSalarial + aeSalarial + irCanada;
          
          lineItems.push({ label: "RPC / RRQ Salarial (Régime de Pensions)", rate: "5.95 %", deduction: rpcSalarial, isTax: true });
          lineItems.push({ label: "Assurance-Emploi (AE Salarial)", rate: "1.63 %", deduction: aeSalarial, isTax: true });
          lineItems.push({ label: "Impôt sur le Revenu (Fédéral + Provincial)", rate: "22.00 % (Simulé)", deduction: irCanada, isTax: true });
          
          employerCharges = [
            { label: "RPC / RRQ Patronal", val: Math.round(ps.baseSalary * 0.0595), rate: "5.95 %" },
            { label: "Assurance-Emploi Patronale (1.4x)", val: Math.round(ps.baseSalary * 0.0163 * 1.4), rate: "2.28 %" },
            { label: "Fonds de Santé / CSST (Est.)", val: Math.round(ps.baseSalary * 0.025), rate: "2.50 %" }
          ];
        }

        const calculatedNetPay = totalGains - totalRetenues;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-payslip, #printable-payslip * {
                  visibility: visible !important;
                }
                #printable-payslip {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: white !important;
                  color: black !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>
            
            <div className="bg-slate-100 rounded-2xl max-w-3xl w-full border border-slate-200 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-250 my-8">
              {/* Top Action Bar (will not be printed) */}
              <div className="p-4 bg-white border-b border-slate-150 flex flex-wrap gap-4 items-center justify-between no-print">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-heading font-extrabold text-xs text-slate-800 uppercase tracking-wider block">
                      Aperçu de la Fiche de Salaire
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Modèle multi-pays dynamique</span>
                  </div>
                </div>

                {/* Country Config Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-mono uppercase font-black text-slate-500">Modèle Pays :</label>
                  <select
                    value={payslipCountry}
                    onChange={(e) => setPayslipCountry(e.target.value as any)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    <option value="RDC">🇨🇩 RDC (CNSS + IPR)</option>
                    <option value="Maroc">🇲🇦 Maroc (CNSS + AMO + IR)</option>
                    <option value="Sénégal">🇸🇳 Sénégal (IPRES + VRS)</option>
                    <option value="Canada">🇨🇦 Canada (AE + RPC + IR)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-primary hover:bg-[#005177] text-white px-4 py-1.5 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer transition-transform hover:scale-105"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer / Exporter PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedPayslipForPdf(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg cursor-pointer"
                    title="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The printable Sheet */}
              <div className="p-8 md:p-12 bg-white max-h-[80vh] overflow-y-auto" id="printable-payslip">
                {/* Header (Company info) */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                  <div>
                    <h1 className="font-heading font-black text-lg text-slate-900 tracking-tight uppercase">
                      NDEMBO AGENCY / SPORTS
                    </h1>
                    <p className="text-[10px] font-semibold text-slate-600 mt-1 uppercase">
                      MANAGEMENT ET PROMOTION DU SPORT EN RDC
                    </p>
                    <div className="text-[9px] font-mono text-slate-500 mt-2 space-y-0.5">
                      <p>Siège social : Avenue de la Justice, Gombe, Kinshasa, RDC</p>
                      <p>N° CNSS : 12-4098327-01 | N° Impôt (IPR) : A260630B</p>
                      <p>Téléphone : +243 81 555 9000 | Email : contact@ndembosports.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-100 px-4 py-2 rounded-lg inline-block border border-slate-200">
                      <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Période de Paie</p>
                      <p className="text-sm font-heading font-black text-slate-900 mt-0.5">{ps.period}</p>
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono mt-2">ID Bulletin: {ps.id}</p>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="text-center my-6">
                  <h2 className="font-heading font-black text-md text-slate-900 uppercase tracking-widest border-b border-slate-250 pb-2 inline-block px-10">
                    BULLETIN DE PAIE INDIVIDUEL
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 mt-2 italic">
                    {modelTitle}
                  </p>
                </div>

                {/* Employee Info Block */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-mono font-bold text-[#6f7881] uppercase">Identité du Collaborateur</p>
                    <p className="text-xs font-black text-slate-900">{ps.employeeName}</p>
                    <p className="text-[10px] text-slate-700 font-medium">Poste : <span className="font-bold">{emp?.jobTitle || "Consultant Sportif"}</span></p>
                    <p className="text-[10px] text-slate-600">Département : <span className="font-semibold">{emp?.department || "Technique & Scouting"}</span></p>
                  </div>
                  <div className="space-y-1.5 text-right font-mono text-[10px] text-slate-600">
                    <p className="text-[9px] font-bold text-[#6f7881] uppercase tracking-wider text-right">Informations administratives</p>
                    <p>ID Employé : <span className="font-bold text-slate-900">{ps.employeeId}</span></p>
                    <p>Contrat : <span className="font-bold text-slate-900">{emp?.contractType || "CDI"}</span></p>
                    <p>Date d'entrée : <span className="font-bold text-slate-900">{emp?.hireDate ? new Date(emp.hireDate).toLocaleDateString('fr-FR') : "N/A"}</span></p>
                    <p>Ancienneté : <span className="font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded">{calculateSeniority(emp?.hireDate)}</span></p>
                  </div>
                </div>

                {/* Payroll Detail Table */}
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-[9px] font-mono uppercase text-slate-700 border-b border-slate-300">
                      <th className="py-2.5 px-3 border-r border-slate-300 w-1/2">Désignation de la Rubrique</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-right">Base / Taux</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 text-right">Gains (USD)</th>
                      <th className="py-2.5 px-3 text-right">Retenues (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-mono">
                    {lineItems.map((item, index) => (
                      <tr key={index} className={item.isBold ? "font-bold bg-slate-50/20" : ""}>
                        <td className={`py-2.5 px-3 border-r border-slate-200 ${item.isTax ? "text-rose-800 font-medium" : "text-slate-800"}`}>
                          {item.label}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right text-slate-500">
                          {item.rate}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right text-slate-900">
                          {item.gain !== undefined ? item.gain.toLocaleString() : "-"}
                        </td>
                        <td className={`py-2.5 px-3 text-right ${item.deduction !== undefined ? "text-rose-700 font-semibold" : "text-slate-400"}`}>
                          {item.deduction !== undefined ? item.deduction.toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}

                    {/* Totaux intermédiaires */}
                    <tr className="bg-slate-50/50 font-bold border-t border-slate-300">
                      <td className="py-2 px-3 border-r border-slate-200">CUMULS BRUTS &amp; RETENUES</td>
                      <td className="py-2 px-3 border-r border-slate-200"></td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right text-slate-900">
                        {totalGains.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-rose-700">
                        {totalRetenues.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Part Patronale (Information) */}
                <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
                  <div className="bg-slate-100/70 px-3 py-1.5 text-[8.5px] font-mono uppercase font-bold text-slate-700 border-b border-slate-200">
                    Cotisations Patronales Obligatoires — {countryLabel} (À la charge exclusive de l'employeur)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 text-[9px] font-mono text-slate-600">
                    {employerCharges.map((charge, idx) => (
                      <div key={idx}>
                        <span className="font-bold text-slate-700">{charge.label} ({charge.rate}) :</span> {charge.val.toLocaleString()} USD
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grand Total - Net à payer */}
                <div className="mt-6 flex justify-end">
                  <div className="border-2 border-slate-900 bg-slate-950 text-white p-4 rounded-xl text-right max-w-sm w-full shadow-md">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Net À Percevoir (USD)</p>
                    <p className="text-xl font-heading font-black mt-1">
                      {calculatedNetPay.toLocaleString()} USD
                    </p>
                    <div className="text-[9px] font-mono text-slate-300 mt-2 border-t border-slate-800 pt-2 text-left">
                      Mode : Virement bancaire / USD<br />
                      Statut : {ps.paymentStatus === 'Payé' ? `PAYÉ le ${ps.paymentDate}` : 'Virement en cours'}
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 mt-12 pt-10 border-t border-dashed border-slate-300">
                  <div className="text-center space-y-6">
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Pour l'Employeur / Direction</p>
                    <div className="h-16 flex items-center justify-center relative">
                      {/* Stylized mock signature & stamp */}
                      <div className="border-2 border-primary/50 text-primary rounded-full px-4 py-1.5 text-[9px] font-mono font-black uppercase rotate-6 absolute opacity-70">
                        NDEMBO SPORTS STAMP
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 italic">Signature &amp; Sceau</span>
                    </div>
                  </div>
                  <div className="text-center space-y-6">
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Pour le Salarié</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-slate-400 italic">Mention "Lu et approuvé"</span>
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <p className="text-[8px] text-center text-slate-400 mt-12 font-mono uppercase tracking-wider">
                  Pour vous aider à faire valoir vos droits, conservez ce bulletin de paie sans limitation de durée.
                </p>
              </div>

              {/* Bottom bar inside modal (no-print) */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3 no-print">
                <button
                  onClick={() => setSelectedPayslipForPdf(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-primary hover:bg-[#005177] text-white px-5 py-2 rounded-lg text-xs font-heading font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le document</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 6. Modal: Générateur & Impression de Contrat Professionnel */}
      {selectedEmployeeForContract && (() => {
        const emp = selectedEmployeeForContract;
        const formattedSalary = emp.monthlySalary.toLocaleString();
        
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-contract, #printable-contract * {
                  visibility: visible !important;
                }
                #printable-contract {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: white !important;
                  color: black !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <div className="bg-slate-100 rounded-2xl max-w-6xl w-full border border-slate-200 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-250 my-4 flex flex-col md:flex-row h-[90vh]">
              
              {/* Form Customization Sidebar (no-print) */}
              <div className="w-full md:w-80 bg-white border-r border-slate-200 p-5 flex flex-col justify-between overflow-y-auto no-print">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span>Paramètres du Contrat</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">Personnalisez les clauses avant l'impression.</p>
                  </div>

                  {/* Signer */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Représentant Ndembo</label>
                    <input
                      type="text"
                      value={contractSignerName}
                      onChange={(e) => setContractSignerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none font-semibold text-slate-800"
                    />
                  </div>

                  {/* Signer Title */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Titre du Représentant</label>
                    <input
                      type="text"
                      value={contractSignerTitle}
                      onChange={(e) => setContractSignerTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none font-semibold text-slate-800"
                    />
                  </div>

                  {/* Place of Sign */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Lieu de signature</label>
                    <input
                      type="text"
                      value={contractPlace}
                      onChange={(e) => setContractPlace(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none text-slate-800 font-medium"
                    />
                  </div>

                  {/* Probation Period */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Période d'essai</label>
                    <input
                      type="text"
                      value={contractProbationPeriod}
                      onChange={(e) => setContractProbationPeriod(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none text-slate-800 font-medium"
                    />
                  </div>

                  {/* Weekly working hours */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Volume horaire</label>
                    <input
                      type="text"
                      value={contractWeeklyHours}
                      onChange={(e) => setContractWeeklyHours(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none text-slate-800 font-medium"
                    />
                  </div>

                  {/* Salary Bonuses (Transport & Housing) */}
                  {emp.contractType !== 'Consultant' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Transp. (USD)</label>
                        <input
                          type="number"
                          value={contractTransportBonus}
                          onChange={(e) => setContractTransportBonus(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none text-slate-800 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Logem. (USD)</label>
                        <input
                          type="number"
                          value={contractHousingBonus}
                          onChange={(e) => setContractHousingBonus(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-none text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Duties description */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase font-bold text-slate-500">Description des Tâches</label>
                    <textarea
                      value={contractDuties}
                      onChange={(e) => setContractDuties(e.target.value)}
                      rows={5}
                      className="w-full p-2 border border-slate-200 rounded text-[11px] focus:ring-1 focus:ring-primary focus:outline-none text-slate-700 leading-normal"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-primary hover:bg-[#005177] text-white py-2 rounded-lg text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer le Contrat</span>
                  </button>
                  <button
                    onClick={() => setSelectedEmployeeForContract(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold cursor-pointer text-center"
                  >
                    Fermer l'aperçu
                  </button>
                </div>
              </div>

              {/* The printable Sheet Preview */}
              <div className="flex-1 bg-white overflow-y-auto p-8 md:p-12 relative" id="printable-contract">
                {/* Official Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                  <div>
                    <h1 className="font-heading font-black text-md text-slate-900 tracking-tight uppercase">
                      NDEMBO AGENCY &amp; SPORTS
                    </h1>
                    <p className="text-[9px] font-semibold text-slate-600 uppercase mt-0.5">
                      SOCIÉTÉ DE SCOUTING, MANAGEMENT ET PROMOTION SPORTIVE
                    </p>
                    <div className="text-[8px] font-mono text-slate-500 mt-2 space-y-0.5">
                      <p>Siège social : Avenue de la Justice, Gombe, Kinshasa, République Démocratique du Congo</p>
                      <p>Régistre de Commerce : CD/KIN/RCCM/22-B-9430 | ID Nat : 01-83-N30948U</p>
                      <p>N° CNSS : 12-4098327-01 | Contact : hr@ndembosports.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-slate-900 text-white text-[9px] font-mono font-bold px-3 py-1 rounded uppercase tracking-wider">
                      CONTRAT : {emp.contractType}
                    </span>
                    <p className="text-[8px] text-slate-400 font-mono mt-2">Réf : NDEMBO-HR-{emp.id}</p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h2 className="font-heading font-black text-sm text-slate-900 uppercase tracking-widest border-b border-slate-250 pb-2 inline-block px-8">
                    {emp.contractType === 'CDI' && "CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE"}
                    {emp.contractType === 'CDD' && "CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE"}
                    {emp.contractType === 'Consultant' && "CONTRAT DE PRESTATION DE SERVICES (FREELANCE)"}
                    {emp.contractType === 'Stagiaire' && "CONVENTION DE STAGE PROFESSIONNEL"}
                  </h2>
                  <p className="text-[9px] font-mono text-slate-500 mt-2">
                    {emp.contractType !== 'Consultant' 
                      ? "Régit par la Loi N° 015/2002 portant Code du Travail de la République Démocratique du Congo"
                      : "Contrat de droit commercial régi par le Code Civil de la République Démocratique du Congo"
                    }
                  </p>
                </div>

                {/* Parties description */}
                <div className="space-y-4 text-xs text-slate-800 leading-relaxed text-justify mb-8">
                  <p className="font-bold text-slate-900">ENTRE LES SOUSSIGNÉS :</p>
                  
                  <div className="pl-4 border-l-2 border-slate-200 space-y-1">
                    <p>
                      <span className="font-bold text-slate-900">1. NDEMBO AGENCY &amp; SPORTS</span>, société établie en RDC, dont le siège social est situé à Gombe, Kinshasa, représentée aux fins des présentes par <span className="font-extrabold text-slate-900">{contractSignerName}</span> en sa qualité de <span className="font-bold text-slate-900">{contractSignerTitle}</span>.
                    </p>
                    <p className="italic text-slate-500 text-[11px]">Ci-après dénommée "L'Employeur" ou "L'Agence", d'une part ;</p>
                  </div>

                  <p className="font-bold text-slate-900">ET :</p>

                  <div className="pl-4 border-l-2 border-slate-200 space-y-1">
                    <p>
                      <span className="font-bold text-slate-900">2. M./Mme {emp.name}</span>, de nationalité congolaise, résidant au Congo RDC, né(e) et titulaire des pièces d'identité renseignées au dossier du personnel, joignable à l'adresse e-mail <span className="font-semibold text-slate-900">{emp.email}</span> ou au téléphone <span className="font-semibold text-slate-900">{emp.phone || "N/A"}</span>.
                    </p>
                    <p className="italic text-slate-500 text-[11px]">Ci-après dénommé(e) "Le Collaborateur" ou "{emp.contractType === 'Stagiaire' ? 'Le Stagiaire' : emp.contractType === 'Consultant' ? 'Le Prestataire' : 'Le Salarié'}", d'autre part ;</p>
                  </div>

                  <p className="font-semibold text-slate-900 italic mt-4">Il a été convenu et arrêté ce qui suit :</p>
                </div>

                {/* Articles */}
                <div className="space-y-6 text-xs text-slate-800 leading-relaxed text-justify">
                  
                  {/* Article 1 */}
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                      Article 1 : Objet du contrat et engagement
                    </h4>
                    <p className="mt-1">
                      {emp.contractType === 'CDI' && `L'Employeur engage le Salarié dans les liens d'un contrat de travail à durée indéterminée, conformément aux dispositions du Code du Travail de la République Démocratique du Congo. Le Salarié est recruté en tant que ${emp.jobTitle} au sein du département ${emp.department}.`}
                      {emp.contractType === 'CDD' && `L'Employeur engage le Salarié dans les liens d'un contrat de travail à durée déterminée, à compter du ${new Date(emp.hireDate).toLocaleDateString('fr-FR')} et se terminant de plein droit le ${emp.contractEndDate ? new Date(emp.contractEndDate).toLocaleDateString('fr-FR') : "N/A"}. Le Salarié est recruté en tant que ${emp.jobTitle} au sein du département ${emp.department}.`}
                      {emp.contractType === 'Consultant' && `L'Agence confie au Prestataire une mission de conseil et d'assistance technique indépendante en qualité de ${emp.jobTitle}. Le présent contrat commercial de services est conclu sans lien de subordination.`}
                      {emp.contractType === 'Stagiaire' && `L'Agence accueille le Stagiaire pour un stage d'insertion professionnelle à vocation d'apprentissage pratique dans les fonctions de ${emp.jobTitle} au sein du département ${emp.department}.`}
                    </p>
                  </div>

                  {/* Article 2 */}
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                      Article 2 : Fonctions, Devoirs et Attributions
                    </h4>
                    <p className="mt-1">
                      {contractDuties}
                    </p>
                    <p className="mt-1">
                      Le Collaborateur s'engage à observer une discrétion absolue quant aux activités de l'Agence et s'interdit d'utiliser, de copier ou de transmettre à des tiers des informations, données de scouting, profils de joueurs, ou secrets commerciaux de Ndembo Agency.
                    </p>
                  </div>

                  {/* Article 3 */}
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                      Article 3 : Période d'essai
                    </h4>
                    <p className="mt-1">
                      {emp.contractType !== 'Consultant' ? (
                        `Le présent contrat comporte une période d'essai de ${contractProbationPeriod}. Durant cette période, chacune des parties pourra résilier le contrat à tout moment, sans indemnité ni préavis particulier, conformément à la législation du travail en vigueur en RDC.`
                      ) : (
                        `S'agissant d'un contrat commercial de prestation indépendante, aucune période d'essai au sens du Code du travail n'est applicable. Cependant, les 30 premiers jours constituent une phase de validation des aptitudes mutuelles.`
                      )}
                    </p>
                  </div>

                  {/* Article 4 */}
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                      Article 4 : Lieu de travail et horaire
                    </h4>
                    <p className="mt-1">
                      Le lieu de travail principal est fixé au siège de l'Agence à Kinshasa (Gombe). Toutefois, en raison de la nature des activités liées au sport et au scouting, le Collaborateur pourra être appelé à effectuer des missions sur toute l'étendue de la République Démocratique du Congo ou à l'étranger.
                    </p>
                    <p className="mt-1">
                      L'horaire de travail hebdomadaire est fixé à <span className="font-bold">{contractWeeklyHours}</span>, réparti conformément aux besoins opérationnels et aux règlements internes de l'Agence.
                    </p>
                  </div>

                  {/* Article 5 */}
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                      Article 5 : Rémunération et Charges fiscales
                    </h4>
                    <p className="mt-1">
                      {emp.contractType !== 'Consultant' ? (
                        `En contrepartie de l'accomplissement de ses fonctions, le Collaborateur percevra une rémunération brute mensuelle de ${formattedSalary} USD (Dollars Américains). Ce montant est soumis à l'Impôt Professionnel sur le Revenu (IPR) ainsi qu'aux cotisations de la Caisse Nationale de Sécurité Sociale (CNSS RDC), qui seront retenues à la source par l'Employeur conformément à la loi.`
                      ) : (
                        `En contrepartie des prestations fournies, l'Agence versera au Prestataire des honoraires mensuels forfaitaires de ${formattedSalary} USD. Le Prestataire, agissant à titre indépendant, est seul responsable de ses déclarations fiscales d'impôt sur le revenu et des taxes applicables à son activité commerciale en RDC.`
                      )}
                    </p>
                  </div>

                  {/* Article 6 */}
                  {emp.contractType !== 'Consultant' && (
                    <div>
                      <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                        Article 6 : Indemnités et avantages sociaux
                      </h4>
                      <p className="mt-1">
                        Pour faciliter l'exercice de ses fonctions et conformément aux usages, le Salarié bénéficiera des indemnités mensuelles suivantes :
                      </p>
                      <ul className="list-disc list-inside mt-1 ml-2 space-y-1 font-medium">
                        <li>Indemnité de transport professionnel : <span className="font-bold text-slate-900">{contractTransportBonus} USD</span> / mois</li>
                        <li>Allocation forfaitaire de logement : <span className="font-bold text-slate-900">{contractHousingBonus} USD</span> / mois</li>
                      </ul>
                      <p className="mt-1">
                        Ces allocations sont payées concomitamment avec le salaire à terme échu.
                      </p>
                    </div>
                  )}

                  {/* Article 7 */}
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                      Article {emp.contractType === 'Consultant' ? '6' : '7'} : Clause de Confidentialité et Exclusivité Sportive
                    </h4>
                    <p className="mt-1">
                      Le Collaborateur s'engage à respecter une confidentialité absolue sur toutes les informations stratégiques, les bases de données de scouting, les fiches techniques des jeunes athlètes de Ndembo Agency, ainsi que sur le montant et le statut des transferts de joueurs en cours ou conclus.
                    </p>
                    <p className="mt-1">
                      {emp.contractType !== 'Consultant' ? (
                        "De plus, le Salarié s'engage à consacrer l'exclusivité de son activité professionnelle sportive à l'Agence. Toute activité connexe de consultant, agent de joueur indépendant ou recruteur pour le compte d'un tiers sans l'accord écrit préalable de la Direction est strictement interdite et constitue un motif de licenciement pour faute lourde."
                      ) : (
                        "Le Prestataire s'engage à ne pas fournir de services de scouting ou d'intermédiation sportive à des agences ou clubs concurrents sur le territoire de la RDC pendant toute la durée de sa mission sans l'accord préalable de l'Agence."
                      )}
                    </p>
                  </div>

                  {/* Article 8 */}
                  {emp.contractType !== 'Consultant' && (
                    <div>
                      <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                        Article 8 : Congés payés
                      </h4>
                      <p className="mt-1">
                        Le Salarié a droit à un congé annuel payé conformément à l'article 141 du Code du Travail de la RDC, accumulé à raison d'un jour et demi ouvrable minimum par mois entier de travail effectif. La date de prise de congé sera fixée d'un commun accord avec la Direction RH de l'Agence.
                      </p>
                    </div>
                  )}

                  {/* Article 9 */}
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                      Article {emp.contractType === 'Consultant' ? '7' : emp.contractType === 'CDI' ? '9' : '9'} : Résiliation et Fin de contrat
                    </h4>
                    <p className="mt-1">
                      {emp.contractType === 'CDI' && "Le présent contrat de travail à durée indéterminée pourra être rompu par l'une ou l'autre des parties, moyennant le respect d'un préavis écrit légal, ou immédiatement pour faute lourde au sens du Code du Travail de la RDC."}
                      {emp.contractType === 'CDD' && "Le présent contrat prend fin de plein droit à la date d'échéance stipulée à l'article 1. Toute rupture anticipée unilatérale en dehors des cas de faute lourde ou d'accord écrit mutuel ouvrira droit à des dommages et intérêts conformément à la loi."}
                      {emp.contractType === 'Consultant' && "Le présent contrat de services peut être résilié par l'une ou l'autre des parties moyennant un préavis écrit de trente (30) jours adressé par lettre recommandée ou remis en main propre contre décharge."}
                      {emp.contractType === 'Stagiaire' && "La convention de stage professionnel peut être résiliée à tout moment par l'une ou l'autre des parties avec un préavis de sept (7) jours ouvrables, ou immédiatement en cas d'inconduite ou de non-respect du règlement intérieur."}
                    </p>
                  </div>

                  {/* Article 10 */}
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-900 uppercase">
                      Article {emp.contractType === 'Consultant' ? '8' : emp.contractType === 'CDI' ? '10' : '10'} : Loi applicable et Règlement des différends
                    </h4>
                    <p className="mt-1">
                      Le présent contrat est régi par les lois en vigueur en République Démocratique du Congo. Tout différend relatif à l'interprétation ou à l'exécution du présent contrat sera soumis à une tentative de règlement à l'amiable (médiation de l'Inspection du Travail de Kinshasa). À défaut d'entente, le litige sera porté devant le Tribunal de Travail de Kinshasa / Gombe compétent.
                    </p>
                  </div>

                </div>

                {/* Signatures and Witness space */}
                <div className="mt-16 pt-8 border-t border-dashed border-slate-300">
                  <p className="text-[10px] font-mono text-slate-500 text-right">
                    Fait à <span className="font-bold text-slate-800">{contractPlace}</span>, le {new Date().toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 text-right mt-1">
                    En deux exemplaires originaux, dument paraphés et signés par chacune des parties.
                  </p>

                  <div className="grid grid-cols-2 gap-8 mt-8">
                    <div className="text-center space-y-6">
                      <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">Pour l'Employeur / L'Agence</p>
                      <div className="h-20 flex items-center justify-center relative">
                        <div className="border-2 border-primary/40 text-primary rounded-full px-4 py-2 text-[9px] font-mono font-black uppercase rotate-6 absolute opacity-60">
                          NDEMBO AGENCY STAMP
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 italic">Signature &amp; Cachet</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-800 mt-2">{contractSignerName}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{contractSignerTitle}</p>
                    </div>
                    
                    <div className="text-center space-y-6">
                      <p className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">Pour le Collaborateur / Salarié</p>
                      <div className="h-20 flex items-center justify-center">
                        <span className="text-[10px] font-mono text-slate-400 italic">Signature précédée de la mention manuscrite<br />"Lu et approuvé"</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-800 mt-2">{emp.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono">Le Collaborateur</p>
                    </div>
                  </div>
                </div>

                {/* Footnotes */}
                <p className="text-[8px] text-center text-slate-400 mt-16 font-mono uppercase tracking-widest">
                  DOCUMENT RH CONFIDENTIEL — PROPRIÉTÉ DE NDEMBO AGENCY &amp; SPORTS
                </p>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
