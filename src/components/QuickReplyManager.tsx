import React, { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  RotateCcw,
  Check,
  X,
  Code,
  Sparkles,
  Info,
  UserCheck,
  Tag,
  Save,
  MessageSquare
} from 'lucide-react';
import { ResponseTemplate } from '../types';
import { DEFAULT_RESPONSE_TEMPLATES } from '../data/mockData';

export const VARIABLE_TOKENS = [
  { token: '{{patient_name}}', label: 'Nome do Paciente', example: 'Mariana Costa' },
  { token: '{{doctor_name}}', label: 'Médico Responsável', example: 'Dr. Roberto Andrade' },
  { token: '{{clinic_name}}', label: 'Nome da Clínica', example: 'Clínica Santa Helena' },
  { token: '{{insurance}}', label: 'Convênio / Plano', example: 'Bradesco Saúde' },
  { token: '{{appointment_date}}', label: 'Data da Consulta', example: '14/08/2026' },
  { token: '{{appointment_time}}', label: 'Horário da Consulta', example: '14:30' },
  { token: '{{specialty}}', label: 'Especialidade Médica', example: 'Cardiologia' },
];

export const interpolateTemplate = (content: string, sampleData?: { name?: string; insurance?: string; doctor?: string; specialty?: string }): string => {
  if (!content) return '';
  const patName = sampleData?.name || 'Mariana Costa';
  const patInsurance = sampleData?.insurance || 'Bradesco Saúde';
  const docName = sampleData?.doctor || 'Dr. Roberto Andrade';
  const clinicName = 'Clínica Santa Helena';
  const apptDate = '14/08/2026';
  const apptTime = '14:30';
  const spec = sampleData?.specialty || 'Cardiologia';

  return content
    .replace(/\{\{patient_name\}\}/gi, patName)
    .replace(/\{nome_paciente\}/gi, patName)
    .replace(/\{\{insurance\}\}/gi, patInsurance)
    .replace(/\{convenio\}/gi, patInsurance)
    .replace(/\{\{doctor_name\}\}/gi, docName)
    .replace(/\{medico_responsavel\}/gi, docName)
    .replace(/\{medico\}/gi, docName)
    .replace(/\{\{clinic_name\}\}/gi, clinicName)
    .replace(/\{clinica\}/gi, clinicName)
    .replace(/\{\{appointment_date\}\}/gi, apptDate)
    .replace(/\{data_consulta\}/gi, apptDate)
    .replace(/\{\{appointment_time\}\}/gi, apptTime)
    .replace(/\{horario\}/gi, apptTime)
    .replace(/\{\{specialty\}\}/gi, spec)
    .replace(/\{especialidade\}/gi, spec);
};

interface QuickReplyManagerProps {
  onClose?: () => void;
  showToast?: (msg: string) => void;
  isModal?: boolean;
}

export const QuickReplyManager: React.FC<QuickReplyManagerProps> = ({
  onClose,
  showToast,
  isModal = false
}) => {
  const [templates, setTemplates] = useState<ResponseTemplate[]>(() => {
    const saved = localStorage.getItem('mediflux_response_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_RESPONSE_TEMPLATES;
      }
    }
    return DEFAULT_RESPONSE_TEMPLATES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedRole, setSelectedRole] = useState<string>('Todos');

  // Form state for Create / Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ResponseTemplate['category']>('Informações Gerais');
  const [formShortcut, setFormShortcut] = useState('');
  const [formTargetRole, setFormTargetRole] = useState<'Todos' | 'Médicos' | 'Recepção'>('Todos');
  const [formContent, setFormContent] = useState('');

  // Save changes to localStorage and dispatch custom event
  const saveTemplatesToStorage = (updated: ResponseTemplate[]) => {
    setTemplates(updated);
    localStorage.setItem('mediflux_response_templates', JSON.stringify(updated));
    window.dispatchEvent(new Event('mediflux_templates_updated'));
  };

  const handleOpenCreateForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormTitle('');
    setFormCategory('Informações Gerais');
    setFormShortcut('/novo');
    setFormTargetRole('Todos');
    setFormContent('Olá, {{patient_name}}! ');
  };

  const handleOpenEditForm = (tpl: ResponseTemplate) => {
    setIsEditing(true);
    setEditingId(tpl.id);
    setFormTitle(tpl.title);
    setFormCategory(tpl.category);
    setFormShortcut(tpl.shortcut || '/tpl');
    setFormTargetRole(tpl.targetRole || 'Todos');
    setFormContent(tpl.content);
  };

  const handleInsertVariable = (token: string) => {
    setFormContent((prev) => `${prev}${token}`);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      if (showToast) showToast('⚠️ Preencha o título e o conteúdo do modelo.');
      return;
    }

    let formattedShortcut = formShortcut.trim();
    if (!formattedShortcut.startsWith('/')) {
      formattedShortcut = `/${formattedShortcut}`;
    }
    formattedShortcut = formattedShortcut.toLowerCase().replace(/\s+/g, '');

    if (editingId) {
      // Edit existing
      const updated = templates.map((t) =>
        t.id === editingId
          ? {
              ...t,
              title: formTitle,
              category: formCategory,
              shortcut: formattedShortcut,
              targetRole: formTargetRole,
              content: formContent,
              updatedAt: new Date().toLocaleDateString('pt-BR'),
            }
          : t
      );
      saveTemplatesToStorage(updated);
      if (showToast) showToast(`✅ Modelo "${formTitle}" atualizado com sucesso!`);
    } else {
      // Create new
      const newTpl: ResponseTemplate = {
        id: `tpl-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        shortcut: formattedShortcut,
        targetRole: formTargetRole,
        content: formContent,
        usageCount: 0,
        createdByName: 'Usuário Ativo',
        updatedAt: new Date().toLocaleDateString('pt-BR'),
      };
      const updated = [newTpl, ...templates];
      saveTemplatesToStorage(updated);
      if (showToast) showToast(`✅ Novo modelo "${formTitle}" criado com sucesso!`);
    }

    setIsEditing(false);
    setEditingId(null);
  };

  const handleDeleteTemplate = (id: string, title: string) => {
    if (confirm(`Deseja realmente excluir o modelo de resposta "${title}"?`)) {
      const updated = templates.filter((t) => t.id !== id);
      saveTemplatesToStorage(updated);
      if (showToast) showToast(`🗑️ Modelo "${title}" excluído.`);
    }
  };

  const handleDuplicateTemplate = (tpl: ResponseTemplate) => {
    const dup: ResponseTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      title: `${tpl.title} (Cópia)`,
      shortcut: `${tpl.shortcut || '/tpl'}_copia`,
      usageCount: 0,
      updatedAt: new Date().toLocaleDateString('pt-BR'),
    };
    const updated = [dup, ...templates];
    saveTemplatesToStorage(updated);
    if (showToast) showToast(`📋 Modelo "${tpl.title}" duplicado com sucesso!`);
  };

  const handleRestoreDefaults = () => {
    if (confirm('Deseja restaurar todos os modelos de resposta rápida para o padrão do sistema?')) {
      saveTemplatesToStorage(DEFAULT_RESPONSE_TEMPLATES);
      if (showToast) showToast('🔄 Modelos de resposta rápida restaurados para os padrões médicos!');
    }
  };

  const categories = [
    'Todas',
    'Preparo de Exames',
    'Agendamento',
    'Pós-Operatório',
    'Convênios & Guias',
    'Orientação Médica',
    'Informações Gerais',
  ];

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = selectedCategory === 'Todas' || tpl.category === selectedCategory;
    const matchesRole = selectedRole === 'Todos os Perfis' || selectedRole === 'Todos' || tpl.targetRole === selectedRole;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tpl.title.toLowerCase().includes(q) ||
      tpl.content.toLowerCase().includes(q) ||
      (tpl.shortcut && tpl.shortcut.toLowerCase().includes(q));

    return matchesCategory && matchesRole && matchesSearch;
  });

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 lg:p-6 space-y-6 ${isModal ? 'max-w-4xl w-full max-h-[90vh] overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Repositório de Respostas Rápidas (Quick Replies)</span>
                <span className="text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-full">
                  {templates.length} Modelos
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Crie respostas padronizadas com variáveis como <code className="bg-slate-100 px-1 py-0.2 rounded text-purple-800 font-mono">&#123;&#123;patient_name&#125;&#125;</code> e acione via comando de barra (<code className="bg-amber-100 text-amber-900 font-mono px-1 rounded font-bold">/</code>) no chat.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            title="Restaurar padrões do sistema"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Padrões</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateForm}
            className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Modelo</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Variables Cheatsheet Banner */}
      <div className="p-3.5 bg-gradient-to-r from-purple-50 via-slate-50 to-purple-50/50 rounded-2xl border border-purple-200/80 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-purple-950 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-purple-700" />
            Variáveis Dinâmicas Suportadas no Autocompletar:
          </span>
          <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
            Substituição Automática
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VARIABLE_TOKENS.map((v) => (
            <span
              key={v.token}
              className="inline-flex items-center gap-1 bg-white text-purple-950 font-mono text-[11px] font-bold px-2 py-1 rounded-lg border border-purple-200 shadow-2xs"
              title={`Exemplo: ${v.example}`}
            >
              <span className="text-purple-700">{v.token}</span>
              <span className="text-[9px] font-sans font-normal text-slate-500">({v.label})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Create / Edit Form Drawer/Modal Panel */}
      {isEditing && (
        <form onSubmit={handleSaveForm} className="p-4 bg-purple-900 text-white rounded-3xl space-y-4 border border-purple-700 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-purple-800 pb-2">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{editingId ? 'Editar Modelo de Resposta Rápidas' : 'Cadastrar Novo Modelo de Resposta Rápida'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-purple-300 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-purple-200 font-bold mb-1">Título do Modelo</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Confirmação de Agendamento com Endereço"
                className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3 py-2 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            {/* Shortcut */}
            <div>
              <label className="block text-purple-200 font-bold mb-1 flex items-center justify-between">
                <span>Atalho de Barra (/)</span>
                <span className="text-[10px] text-amber-300 font-bold">Comando /</span>
              </label>
              <input
                type="text"
                value={formShortcut}
                onChange={(e) => setFormShortcut(e.target.value)}
                placeholder="/agendar"
                className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-purple-200 font-bold mb-1">Categoria</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
              >
                <option value="Preparo de Exames">Preparo de Exames</option>
                <option value="Agendamento">Agendamento</option>
                <option value="Pós-Operatório">Pós-Operatório</option>
                <option value="Convênios & Guias">Convênios & Guias</option>
                <option value="Orientação Médica">Orientação Médica</option>
                <option value="Informações Gerais">Informações Gerais</option>
              </select>
            </div>
          </div>

          {/* Target Role & Quick Variable Insertion Chips */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-purple-200 font-bold text-xs flex items-center gap-1">
                <span>Clique na variável para inserir no texto:</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-purple-300 font-semibold">Perfil Alvo:</span>
                <select
                  value={formTargetRole}
                  onChange={(e) => setFormTargetRole(e.target.value as any)}
                  className="bg-purple-950 border border-purple-700 rounded-lg px-2 py-1 text-[11px] text-white font-bold cursor-pointer"
                >
                  <option value="Todos">Todos da Equipe</option>
                  <option value="Médicos">Apenas Médicos</option>
                  <option value="Recepção">Apenas Recepção</option>
                </select>
              </div>
            </div>

            {/* Variable Insertion Chips */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-purple-950/80 rounded-xl border border-purple-800">
              {VARIABLE_TOKENS.map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => handleInsertVariable(v.token)}
                  className="px-2 py-1 bg-purple-800 hover:bg-purple-700 text-amber-300 font-mono text-[11px] font-extrabold rounded-lg border border-purple-600 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-102"
                  title={`Inserir ${v.label} (${v.example})`}
                >
                  <span>+</span>
                  <span>{v.token}</span>
                </button>
              ))}
            </div>

            {/* Content Textarea */}
            <div>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={3}
                placeholder="Digite a mensagem do modelo com variáveis. Ex: Olá {{patient_name}}, sua consulta foi confirmada para {{appointment_date}} às {{appointment_time}} com {{doctor_name}}."
                className="w-full bg-purple-950/90 border border-purple-700 rounded-xl p-3 text-xs text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 leading-relaxed font-sans"
                required
              />
            </div>

            {/* Live Sample Preview Card */}
            <div className="p-3 bg-white text-slate-900 rounded-2xl border border-purple-200 text-xs space-y-1">
              <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider block">
                👀 Pré-visualização com dados reais de exemplo (Mariana Costa):
              </span>
              <p className="text-slate-800 font-medium italic leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                "{interpolateTemplate(formContent) || '...'}"
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-purple-200 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-102"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Modelo</span>
            </button>
          </div>
        </form>
      )}

      {/* Search & Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, atalho (/jejum) ou conteúdo..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 no-scrollbar font-bold">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl shrink-0 cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-sm">Nenhum modelo de resposta encontrado.</p>
            <p className="text-xs text-slate-400">Tente ajustar a busca ou crie um novo modelo personalizado.</p>
            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="px-4 py-2 bg-purple-800 text-white font-bold text-xs rounded-xl shadow-2xs mt-2"
            >
              + Criar Novo Modelo
            </button>
          </div>
        ) : (
          filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 bg-slate-50/80 hover:bg-purple-50/40 rounded-2xl border border-slate-200/80 transition-all space-y-3 flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold text-sm text-slate-900 truncate">{tpl.title}</span>
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 shrink-0">
                      {tpl.shortcut || '/tpl'}
                    </span>
                  </div>

                  <span className="text-[10px] font-extrabold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full shrink-0">
                    {tpl.targetRole || 'Todos'}
                  </span>
                </div>

                {/* Content with Variable Highlighting */}
                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-white p-3 rounded-xl border border-slate-200 line-clamp-3 italic">
                  "{tpl.content}"
                </p>

                {/* Live Interpolated Preview snippet */}
                <div className="text-[11px] text-slate-500 bg-purple-50/60 p-2 rounded-lg border border-purple-100/80 flex items-start gap-1.5">
                  <span className="font-bold text-purple-900 shrink-0">Exemplo real:</span>
                  <span className="line-clamp-2 text-slate-700">{interpolateTemplate(tpl.content)}</span>
                </div>
              </div>

              {/* Footer info & actions */}
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                    {tpl.category}
                  </span>
                  <span>Usado {tpl.usageCount || 0}x</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDuplicateTemplate(tpl)}
                    className="p-1.5 text-slate-500 hover:text-purple-800 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors"
                    title="Duplicar modelo"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditForm(tpl)}
                    className="p-1.5 text-slate-500 hover:text-purple-800 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors"
                    title="Editar modelo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    title="Excluir modelo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
