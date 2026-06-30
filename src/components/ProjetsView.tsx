/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle,
  Activity,
  Layers,
  ArrowRight,
  ChevronLeft,
  ArrowRightLeft,
  ChevronRight,
  Clock,
  PlayCircle,
  ListTodo,
  TrendingUp,
  AlertTriangle,
  User,
  PlusCircle,
  Trash2,
  CheckSquare
} from 'lucide-react';
import { Project, Task, Contact, ProjectStatus, TaskStatus, TaskPriority } from '../types';

interface ProjetsViewProps {
  projects: Project[];
  tasks: Task[];
  contacts: Contact[];
  onAddProject: (project: Project) => void;
  onUpdateProjectStatus: (id: string, status: ProjectStatus) => void;
  onAddTaskToProject: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onUpdateTaskProgress: (taskId: string, progress: number) => void;
  onRemoveTask: (taskId: string) => void;
}

export default function ProjetsView({
  projects,
  tasks,
  contacts,
  onAddProject,
  onUpdateProjectStatus,
  onAddTaskToProject,
  onUpdateTaskStatus,
  onUpdateTaskProgress,
  onRemoveTask
}: ProjetsViewProps) {
  // Navigation & selection
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // Creation forms
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClientId, setNewProjectClientId] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState(0);
  const [newProjectStartDate, setNewProjectStartDate] = useState('');
  const [newProjectEndDate, setNewProjectEndDate] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Task inline modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Moyenne');
  const [newTaskStartDate, setNewTaskStartDate] = useState('');
  const [newTaskEndDate, setNewTaskEndDate] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Management' | 'Consulting' | 'Recrutement' | 'Contract' | 'Autre'>('Management');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Active Selected Project and its specific tasks
  const activeProject = projects.find(p => p.id === selectedProjectId);
  const activeTasks = tasks.filter(t => t.projectId === selectedProjectId);

  // Form handlers
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find(c => c.id === newProjectClientId);
    if (!contact) return;

    const newPrj: Project = {
      id: "prj_" + Date.now(),
      name: newProjectName,
      clientId: contact.id,
      clientName: contact.name,
      budget: Number(newProjectBudget),
      startDate: newProjectStartDate,
      endDate: newProjectEndDate,
      description: newProjectDesc,
      status: 'Planifié',
      progress: 0
    };

    onAddProject(newPrj);
    setShowCreateProjectModal(false);
    setSelectedProjectId(newPrj.id);
    // Reset
    setNewProjectName('');
    setNewProjectClientId('');
    setNewProjectBudget(0);
    setNewProjectStartDate('');
    setNewProjectEndDate('');
    setNewProjectDesc('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const newTsk: Task = {
      id: "tsk_" + Date.now(),
      projectId: selectedProjectId,
      projectOptionalName: activeProject?.name,
      title: newTaskTitle,
      priority: newTaskPriority,
      startDate: newTaskStartDate || new Date().toISOString().split('T')[0],
      endDate: newTaskEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: newTaskDesc,
      category: newTaskCategory,
      status: 'À faire',
      progress: 0
    };

    onAddTaskToProject(newTsk);
    setShowAddTaskModal(false);
    // Reset
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  // Move task status via click buttons (Simulating dnd board shifts)
  const shiftTaskStatus = (taskId: string, currentStatus: TaskStatus, direction: 'forward' | 'backward') => {
    let nextStatus: TaskStatus = currentStatus;
    if (currentStatus === 'À faire' && direction === 'forward') {
      nextStatus = 'En cours';
    } else if (currentStatus === 'En cours' && direction === 'forward') {
      nextStatus = 'Terminé';
    } else if (currentStatus === 'En cours' && direction === 'backward') {
      nextStatus = 'À faire';
    } else if (currentStatus === 'Terminé' && direction === 'backward') {
      nextStatus = 'En cours';
    }

    onUpdateTaskStatus(taskId, nextStatus);

    // Auto-update task progress percentage
    if (nextStatus === 'Terminé') {
      onUpdateTaskProgress(taskId, 100);
    } else if (nextStatus === 'À faire') {
      onUpdateTaskProgress(taskId, 0);
    } else if (nextStatus === 'En cours' && currentStatus === 'À faire') {
      onUpdateTaskProgress(taskId, 25);
    }
  };

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Filter project cards list
  const filteredProjects = projects.filter(prj => {
    const matchesStatus = filterStatus === 'Tous' || prj.status === filterStatus;
    const matchesSearch = prj.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prj.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start" id="projects_timelines_workspace">
      {/* LEFT AREA PANEL: PROJECTS CARDS SELECTOR LIST (col-span-4) */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-white border border-[#bec8d2]/70 p-4 rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-heading font-extrabold text-sm text-on-surface uppercase tracking-tight">Projets de l'Agence</span>
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="bg-primary hover:bg-[#005177] text-white p-1.5 rounded transition-transform hover:scale-105 cursor-pointer"
              title="Ajouter un projet"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            className="w-full px-3 py-1.5 border border-[#bec8d2] rounded-lg text-xs bg-[#f7f9ff]"
            placeholder="Rechercher projets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Status filters selection row */}
          <div className="flex flex-wrap gap-1">
            {(['Tous', 'Planifié', 'En cours', 'Terminé'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st as any)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md border transition-all ${
                  filterStatus === st ? 'bg-[#00628f] text-white border-[#00628f]' : 'bg-[#f7f9ff] text-slate-600 border-slate-205'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards stack */}
        <div className="space-y-3.5 max-h-[64vh] overflow-y-auto custom-scrollbar pr-1">
          {filteredProjects.length === 0 ? (
            <p className="text-center text-xs text-[#6f7881] py-4 bg-white rounded border border-[#bec8d2]/40">Aucun projet trouvé</p>
          ) : (
            filteredProjects.map(prj => {
              const isSelected = selectedProjectId === prj.id;
              return (
                <div
                  key={prj.id}
                  onClick={() => setSelectedProjectId(prj.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-3 ${
                    isSelected
                      ? 'bg-white border-primary shadow-md ring-1 ring-primary'
                      : 'bg-white border-[#bec8d2]/70 hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-heading font-extrabold text-xs text-on-surface line-clamp-1 hover:text-primary">
                      {prj.name}
                    </h4>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                      prj.status === 'Terminé' ? 'bg-emerald-50 text-emerald-800' :
                      prj.status === 'En cours' ? 'bg-indigo-50 text-[#00628f]' :
                      prj.status === 'En retard' ? 'bg-red-50 text-[#ba0a0f]' :
                      'bg-slate-50 text-slate-700'
                    }`}>
                      {prj.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#6f7881]">
                      <span>Client : {prj.clientName}</span>
                      <span className="font-bold text-on-surface">{prj.progress}%</span>
                    </div>
                    {/* Tiny visual progress bar */}
                    <div className="w-full bg-[#f1f3f6] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${prj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#6f7881] pt-1 border-t border-slate-100">
                    <span>{formatCurrency(prj.budget)}</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3 text-[#6f7881]" />
                      {prj.endDate}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT WORKBENCH: GANTT CHART & KANBAN COLUMN BOARDS (col-span-8) */}
      <div className="xl:col-span-8 space-y-6">
        {activeProject ? (
          <div className="space-y-6">
            {/* Active Project Card details */}
            <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold bg-[#edf4ff] text-[#00628f] px-2 py-0.5 rounded">
                      Fiche Projet Active
                    </span>
                    <span className="text-xs font-mono text-[#6f7881]">ID: {activeProject.id}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-[#00628f] text-lg">
                    {activeProject.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateProjectStatus(activeProject.id, 'Terminé')}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    Mettre en Terminé
                  </button>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="bg-[#ba0a0f] hover:bg-[#97060a] text-white px-3 py-1 rounded text-xs font-heading font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    Ajouter Tâche
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm font-sans text-[#3f4850] leading-relaxed">
                {activeProject.description}
              </p>

              {/* Grid detail indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-xs">
                <div className="bg-[#f7f9ff] p-3 rounded-lg border border-[#bec8d2]/30">
                  <span className="text-[#6f7881] block">Client d'Appui</span>
                  <span className="font-bold text-on-surface block truncate">{activeProject.clientName}</span>
                </div>
                <div className="bg-[#f7f9ff] p-3 rounded-lg border border-[#bec8d2]/30">
                  <span className="text-[#6f7881] block">Budget Global</span>
                  <span className="font-mono font-bold text-primary block">{formatCurrency(activeProject.budget)}</span>
                </div>
                <div className="bg-[#f7f9ff] p-3 rounded-lg border border-[#bec8d2]/30">
                  <span className="text-[#6f7881] block">Plage de Dates</span>
                  <span className="font-mono font-semibold text-on-surface block">{activeProject.startDate} au {activeProject.endDate}</span>
                </div>
                <div className="bg-[#f7f9ff] p-3 rounded-lg border border-[#bec8d2]/30 text-center">
                  <span className="text-[#6f7881] block">Progression Annuelle</span>
                  <span className="font-heading font-extrabold text-base text-primary block">{activeProject.progress}%</span>
                </div>
              </div>
            </div>

            {/* HIGH FIDELITY MODULE 1: INTERACTIVE GANTT TIMELINE */}
            <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-heading font-extrabold text-sm text-on-surface uppercase tracking-tight">Timeline / Gantt des Tâches</h4>
                <p className="text-xs text-[#6f7881]">Chronologie d'exécution des chantiers sportifs</p>
              </div>

              {activeTasks.length === 0 ? (
                <p className="text-center text-xs text-[#6f7881] py-4 italic">Aucune tâche planifiée pour ce projet. Veuillez cliquer sur "Ajouter Tâche" pour l'initialiser.</p>
              ) : (
                <div className="space-y-4 overflow-x-auto custom-scrollbar">
                  {/* Calendar scale header represent */}
                  <div className="min-w-[600px] grid grid-cols-12 border-b border-slate-100 pb-1 text-[10px] font-mono text-[#6f7881]">
                    <div className="col-span-4 font-bold">Activité / Livrable</div>
                    <div className="col-span-8 grid grid-cols-3 text-center border-l border-slate-100">
                      <div>Juin 2026</div>
                      <div className="border-x border-slate-100">Juillet 2026</div>
                      <div>Août 2026</div>
                    </div>
                  </div>

                  {/* Gantt bar items */}
                  <div className="space-y-3 min-w-[600px]">
                    {activeTasks.map((task) => {
                      // Determine estimated margin widths based on mock positions
                      let startOffsetClass = "ml-[10%]";
                      let widthClass = "w-[50%]";

                      if (task.title.includes("visa")) {
                        startOffsetClass = "ml-[5%]";
                        widthClass = "w-[30%]";
                      } else if (task.title.includes("fiches")) {
                        startOffsetClass = "ml-[0%]";
                        widthClass = "w-[35%]";
                      } else if (task.title.includes("hôtelière")) {
                        startOffsetClass = "ml-[30%]";
                        widthClass = "w-[40%]";
                      } else if (task.title.includes("proposition")) {
                        startOffsetClass = "ml-[2%]";
                        widthClass = "w-[25%]";
                      } else if (task.title.includes("FECOFA")) {
                        startOffsetClass = "ml-[20%]";
                        widthClass = "w-[30%]";
                      } else if (task.title.includes("presse")) {
                        startOffsetClass = "ml-[25%]";
                        widthClass = "w-[60%]";
                      }

                      return (
                        <div key={task.id} className="grid grid-cols-12 items-center hover:bg-slate-50 py-1 rounded">
                          <div className="col-span-4 pr-3">
                            <span className="font-semibold text-xs text-on-surface block truncate" title={task.title}>{task.title}</span>
                            <span className="text-[9px] font-mono text-[#6f7881]">{task.startDate} au {task.endDate}</span>
                          </div>
                          <div className="col-span-8 bg-slate-150 h-6 rounded-lg relative flex items-center bg-slate-100/50">
                            <div
                              className={`h-full rounded-lg ${startOffsetClass} ${widthClass} relative flex items-center justify-between px-2 text-[9px] font-mono font-bold text-white shadow-xs ${
                                task.status === 'Terminé'
                                  ? 'bg-emerald-600'
                                  : task.priority === 'Haute' ? 'bg-[#00628f]' : 'bg-[#ba0a0f]'
                              }`}
                            >
                              <span className="truncate pr-1">{task.progress}%</span>
                              <span className="shrink-0 font-extrabold">{task.priority}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* HIGH FIDELITY MODULE 2: INTERACTIVE COLUMN-BASED KANBAN BOARD */}
            <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-on-surface uppercase tracking-tight">Tableau Kanban d'Agence</h4>
                  <p className="text-xs text-[#6f7881]">Cliquez sur les flèches pour déplacer les cartes de tâches d'une colonne à une autre</p>
                </div>
                <span className="font-mono text-[10px] text-[#6f7881] border px-2 py-0.5 rounded">AUTO-RECOMPUTING PROGRESS ACTIF</span>
              </div>

              {/* Three Column Boards layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="kanban_blocks">
                {/* Column "À faire" */}
                <div className="bg-[#f7f9ff] rounded-xl p-3 border border-[#bec8d2]/40 min-h-[300px]">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <span className="font-heading text-xs font-extrabold text-[#3a444a] uppercase">À faire</span>
                    <span className="bg-slate-200 text-[#3f4850] text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {activeTasks.filter(t => t.status === 'À faire').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activeTasks.filter(t => t.status === 'À faire').map(task => (
                      <div key={task.id} className="bg-white p-3 rounded-lg border border-[#bec8d2]/40 shadow-xs space-y-2.5">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] font-mono font-bold bg-[#e3efff] text-primary px-1.5 py-0.2 rounded">
                            {task.category}
                          </span>
                          <button
                            onClick={() => onRemoveTask(task.id)}
                            className="text-[#6f7881] hover:text-[#ba0a0f] transition-colors"
                            title="Supprimer tâche"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <h5 className="font-semibold text-xs text-on-surface font-sans leading-tight">{task.title}</h5>
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-mono font-bold px-1 rounded uppercase ${
                            task.priority === 'Haute' ? 'bg-[#ffdad6] text-[#ba0a0f]' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => shiftTaskStatus(task.id, task.status, 'forward')}
                            className="bg-primary text-white p-1 rounded-full hover:scale-105"
                            title="Déplacer vers 'En cours'"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column "En cours" */}
                <div className="bg-[#f7f9ff] rounded-xl p-3 border border-amber-200/50 min-h-[300px]">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-200">
                    <span className="font-heading text-xs font-extrabold text-[#725c00] uppercase">En cours</span>
                    <span className="bg-amber-100 text-[#725c00] text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {activeTasks.filter(t => t.status === 'En cours').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activeTasks.filter(t => t.status === 'En cours').map(task => (
                      <div key={task.id} className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs space-y-2.5 relative">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] font-mono font-bold bg-amber-50 text-[#725c00] px-1.5 py-0.2 rounded">
                            {task.category}
                          </span>
                          <button
                            onClick={() => onRemoveTask(task.id)}
                            className="text-[#6f7881] hover:text-[#ba0a0f]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <h5 className="font-semibold text-xs text-on-surface font-sans leading-tight">{task.title}</h5>
                        
                        {/* Interactive progress control handle slide */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span>Progression</span>
                            <span>{task.progress}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            step="10"
                            value={task.progress}
                            onChange={(e) => onUpdateTaskProgress(task.id, Number(e.target.value))}
                            className="w-full accent-primary h-1 rounded-lg"
                          />
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          <button
                            onClick={() => shiftTaskStatus(task.id, task.status, 'backward')}
                            className="bg-slate-100 text-[#3f4850] p-1 rounded-full"
                            title="Reculer vers 'À faire'"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className={`text-[9px] font-mono font-bold px-1 rounded uppercase ${
                            task.priority === 'Haute' ? 'bg-[#ffdad6] text-[#ba0a0f]' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => shiftTaskStatus(task.id, task.status, 'forward')}
                            className="bg-primary text-white p-1 rounded-full"
                            title="Avancer vers 'Terminé'"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column "Terminé" */}
                <div className="bg-[#f7f9ff] rounded-xl p-3 border border-emerald-200 min-h-[300px]">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-300">
                    <span className="font-heading text-xs font-extrabold text-emerald-800 uppercase">Terminé</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {activeTasks.filter(t => t.status === 'Terminé').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activeTasks.filter(t => t.status === 'Terminé').map(task => (
                      <div key={task.id} className="bg-white p-3 rounded-lg border border-emerald-200 shadow-xs space-y-2.5">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded">
                            {task.category}
                          </span>
                          <button
                            onClick={() => onRemoveTask(task.id)}
                            className="text-[#6f7881] hover:text-[#ba0a0f]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <h5 className="font-semibold text-xs text-on-surface font-sans leading-tight line-through opacity-70">{task.title}</h5>
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => shiftTaskStatus(task.id, task.status, 'backward')}
                            className="bg-[#f1f3f6] text-[#3f4850] p-1 rounded-full"
                            title="Reculer vers 'En cours'"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[9px] font-mono text-emerald-700 font-bold flex items-center gap-0.5">
                            <CheckSquare className="w-3 h-3 text-emerald-700" />
                            100%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#bec8d2]/70 rounded-2xl p-12 text-center text-[#6f7881] shadow-xs">
            Veuillez créer ou sélectionner un projet sportif dans la colonne de gauche de votre espace pour afficher la chronologie Gantt et le tableau de suivi Kanban.
          </div>
        )}
      </div>

      {/* MODAL: ADD TASK (INLINE TO PROJECT) */}
      {showAddTaskModal && activeProject && (
        <div className="fixed inset-0 bg-[#0c1d2b]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#bec8d2] shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-6 h-6 text-[#ba0a0f]" />
                <h3 className="font-heading font-extrabold text-base text-on-surface">
                  Ajouter Tâche au Projet Saisonnier
                </h3>
              </div>
              <button onClick={() => setShowAddTaskModal(false)} className="text-[#6f7881] hover:text-black font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Libellé d'action / Titre</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Contracter un visa de transit international"
                  className="w-full p-2.5 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Priorité</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  >
                    <option value="Basse">Basse (Visibilité secondaire)</option>
                    <option value="Moyenne">Moyenne (Standard)</option>
                    <option value="Haute">Haute (Critique d'échéance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Catégorie</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  >
                    <option value="Management">Management d'athlète</option>
                    <option value="Consulting">Consulting Commercial</option>
                    <option value="Recrutement">Recrutement &amp; Scouting</option>
                    <option value="Contract">Négociation de Contrat</option>
                    <option value="Autre">Autres Divers</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Date de Début</label>
                  <input
                    type="date"
                    value={newTaskStartDate}
                    onChange={(e) => setNewTaskStartDate(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Date d'Échéance</label>
                  <input
                    type="date"
                    value={newTaskEndDate}
                    onChange={(e) => setNewTaskEndDate(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Notice prescriptive d'activité</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  placeholder="Consignes détaillées pour le recruteur..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 border border-[#bec8d2] text-[#3f4850] text-sm font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ba0a0f] hover:bg-[#97060a] text-white text-sm font-heading font-extrabold rounded-lg shadow-sm"
                >
                  Ajouter au Tableau Kanban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-[#0c1d2b]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#bec8d2] shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-6 h-6 text-primary" />
                <h3 className="font-heading font-extrabold text-[#00628f] text-xl">
                  Créer un Nouveau Projet Accord
                </h3>
              </div>
              <button onClick={() => setShowCreateProjectModal(false)} className="text-[#6f7881] hover:text-black font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Intitulé du Projet</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Ex: Tournée d'essais techniques Europe, Football"
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Client Participant</label>
                  <select
                    value={newProjectClientId}
                    onChange={(e) => setNewProjectClientId(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  >
                    <option value="">-- Sélectionnez --</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Budget d'Opération (USD)</label>
                  <input
                    type="number"
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Date de Lancement</label>
                  <input
                    type="date"
                    value={newProjectStartDate}
                    onChange={(e) => setNewProjectStartDate(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Terme Prévu</label>
                  <input
                    type="date"
                    value={newProjectEndDate}
                    onChange={(e) => setNewProjectEndDate(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Cahier des charges indicatif</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  rows={3}
                  placeholder="Spécifications détaillées d'accord..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateProjectModal(false)}
                  className="px-4 py-2 border border-[#bec8d2] text-[#3f4850] text-sm font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#005177] text-white text-sm font-heading font-extrabold rounded-lg shadow-sm"
                >
                  Initialiser le Projet &amp; Ouvrir l'Espace Gantt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
