/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Calendar, CheckSquare, Clock, Filter, Trash2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';

interface TachesViewProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onRemoveTask: (taskId: string) => void;
}

export default function TachesView({
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onRemoveTask
}: TachesViewProps) {
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'Toutes'>('Toutes');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'Tous'>('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // Local Task create triggers
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Moyenne');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState<'Management' | 'Consulting' | 'Recrutement' | 'Contract' | 'Autre'>('Management');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: "tsk_" + Date.now(),
      projectId: "global",
      projectOptionalName: "Tâche Générale Hors-Projet",
      title,
      priority,
      startDate: new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: desc,
      category,
      status: 'À faire',
      progress: 0
    };
    onAddTask(newTask);
    setShowForm(false);
    setTitle('');
    setDesc('');
  };

  const filteredTasks = tasks.filter(t => {
    const matchesPriority = priorityFilter === 'Toutes' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'Tous' || t.status === statusFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.projectOptionalName && t.projectOptionalName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesPriority && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 md:space-y-8" id="tasks_checklist_panel">
      {/* Filtering toolbar */}
      <div className="bg-white border border-[#bec8d2]/70 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6f7881]" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
            placeholder="Rechercher tâche ou projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
          {/* Priority triggers */}
          <span className="text-[10px] uppercase font-mono font-bold text-[#6f7881] hidden lg:block">Priorité:</span>
          {(['Toutes', 'Haute', 'Moyenne', 'Basse'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                priorityFilter === p
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-white text-[#3f4850] border-[#bec8d2] hover:bg-[#edf4ff]'
              }`}
            >
              {p}
            </button>
          ))}

          {/* Status triggers */}
          <span className="text-[10px] uppercase font-mono font-bold text-[#6f7881] ml-2 hidden lg:block">Statut:</span>
          {(['Tous', 'À faire', 'En cours', 'Terminé'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-white text-[#3f4850] border-[#bec8d2] hover:bg-[#edf4ff]'
              }`}
            >
              {s}
            </button>
          ))}

          <button
            onClick={() => setShowForm(true)}
            className="bg-[#00628f] hover:bg-[#005177] text-white font-heading font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 ml-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Nouvelle Tâche</span>
          </button>
        </div>
      </div>

      {/* Task checklists Table representation */}
      <div className="bg-white border border-[#bec8d2]/70 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f9ff] border-b border-[#bec8d2]/70 text-xs font-mono font-bold text-[#6f7881]">
                <th className="p-4 uppercase tracking-wider text-center w-12">Action</th>
                <th className="p-4 uppercase tracking-wider">Tâche / Intitulé d'Action</th>
                <th className="p-4 uppercase tracking-wider">Date Limite</th>
                <th className="p-4 uppercase tracking-wider">Projet Associé</th>
                <th className="p-4 uppercase tracking-wider">Catégorie</th>
                <th className="p-4 uppercase tracking-wider text-center">Priorité</th>
                <th className="p-4 uppercase tracking-wider text-center">Statut</th>
                <th className="p-4 uppercase tracking-wider text-right">Retirer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6f7881] font-sans">
                    Aucune tâche n'est enregistrée sous cette filière.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const isChecked = task.status === 'Terminé';
                  return (
                    <tr key={task.id} className={`hover:bg-slate-50 transition-colors ${isChecked ? 'opacity-65' : ''}`}>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onUpdateTaskStatus(task.id, isChecked ? 'En cours' : 'Terminé')}
                          className="w-4.5 h-4.5 text-primary border-[#bec8d2] focus:ring-primary rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold text-on-surface block ${isChecked ? 'line-through text-[#6f7881]' : ''}`}>
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-xs text-[#6f7881] block mt-0.5 max-w-md">
                            {task.description}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs text-[#6f7881]">
                        <span className={task.status !== 'Terminé' && new Date(task.endDate) < new Date() ? 'text-[#ba0a0f] font-bold' : ''}>
                          {task.endDate}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-semibold text-[#00628f]">
                        {task.projectOptionalName || 'Tâche générale'}
                      </td>
                      <td className="p-4 text-xs font-mono">
                        <span className="bg-slate-100 text-[#3f4850] px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                          {task.category}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'Haute' ? 'bg-[#ffdad6] text-[#ba0a0f]' :
                          task.priority === 'Moyenne' ? 'bg-amber-100 text-[#725c00]' :
                          'bg-[#e2f1ff] text-[#00628f]'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${
                          task.status === 'Terminé' ? 'bg-emerald-50 text-emerald-840 border-emerald-250' :
                          task.status === 'En cours' ? 'bg-amber-50 text-amber-840 border-amber-250' :
                          'bg-slate-50 text-slate-700 border-slate-205'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onRemoveTask(task.id)}
                          className="text-[#6f7881] hover:text-[#ba0a0f] p-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0c1d2b]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#bec8d2] shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-6 h-6 text-primary" />
                <h3 className="font-heading font-extrabold text-xl text-on-surface">
                  Ajouter une Nouvelle Tâche
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-[#6f7881] hover:text-black font-semibold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Libellé de la Tâche</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Établir la convention avec la DGI"
                  className="w-full p-2.5 border border-[#bec8d2] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm bg-[#f7f9ff]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Degré de Priorité</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  >
                    <option value="Basse">Basse (Visibilité secondaire)</option>
                    <option value="Moyenne">Moyenne (Standard)</option>
                    <option value="Haute">Haute (Critique d'échéance)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Date d'Échéance</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Catégorie Métier</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                >
                  <option value="Management">Management d'athlète</option>
                  <option value="Consulting">Consulting Commercial</option>
                  <option value="Recrutement">Recrutement &amp; Scouting</option>
                  <option value="Contract">Négociation de Contrat</option>
                  <option value="Autre">Autres Divers</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-on-surface mb-2">Description d'activité</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2.5 border border-[#bec8d2] rounded-lg text-sm bg-[#f7f9ff]"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-[#bec8d2] text-[#3f4850] text-sm font-semibold rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#005177] text-white text-sm font-heading font-extrabold rounded-lg shadow-sm"
                >
                  Ajouter à la liste d'activités
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
