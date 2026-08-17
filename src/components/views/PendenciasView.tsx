import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Filter,
  ShieldCheck,
  User,
  Settings,
  X,
  Save,
  Check
} from 'lucide-react';
import { PRIORITY_RULES, INITIAL_PATIENTS } from '../../data/mockData';
import { apiService } from '../../services/api';

interface PendenciasViewProps {
  onOpenPatientChat?: (patientId: string) => void;
}

export const PendenciasView: React.FC<PendenciasViewProps> = ({ onOpenPatientChat }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [rules, setRules] = useState(PRIORITY_RULES);
  const [toast, setToast] = useState<string | null>(null);

  // Fetch Priority Rules from backend API
  useEffect(() => {
    async function loadRules() {
      const data = await apiService.getPriorityRules();
      if (data && data.length > 0) {
        setRules(data);
      }
    }
    loadRules();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenPatient = (id: string) => {
    if (onOpenPatientChat) {
      onOpenPatientChat(id);
    } else {
      showToast(`Abrindo atendimento para paciente ${id}...`);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    const target = rules.find((r) => r.id === ruleId);
    if (!target) return;
    const newActive = !target.active;

    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, active: newActive } : r))
    );

    await apiService.updatePriorityRule(ruleId, { active: newActive });
    showToast(`Regra de prioridade ${newActive ? 'ativada' : 'desativada'}!`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#f8f9fc] min-h-screen relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-700 flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
      {/* Top Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
          Central de pendências
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Terça-feira, 5 de agosto
        </p>
      </div>

      {/* Prioridade por contexto Subheader */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
        <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
          PRIORIDADE POR CONTEXTO
        </span>
        <h2 className="text-base font-bold text-slate-900">
          O que precisa de ação agora
        </h2>
        <p className="text-xs text-slate-500">
          A fila diferencia quem deve agir, o motivo da espera e o prazo correto para cada demanda.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'responder' ? 'todos' : 'responder')}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
            selectedFilter === 'responder'
              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-md'
              : 'bg-white border-rose-200/80 hover:bg-rose-50/50 shadow-2xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
            !
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">5</p>
            <p className="text-xs font-semibold text-rose-700">Clínica deve responder</p>
          </div>
        </button>

        {/* Card 2 */}
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'internas' ? 'todos' : 'internas')}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
            selectedFilter === 'internas'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
              : 'bg-white border-amber-200/80 hover:bg-amber-50/50 shadow-2xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
            ⏰
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">8</p>
            <p className="text-xs font-semibold text-amber-700">Ações internas</p>
          </div>
        </button>

        {/* Card 3 */}
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'comerciais' ? 'todos' : 'comerciais')}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
            selectedFilter === 'comerciais'
              ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 shadow-md'
              : 'bg-white border-purple-200/80 hover:bg-purple-50/50 shadow-2xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
            📍
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">4</p>
            <p className="text-xs font-semibold text-purple-700">Follow-ups comerciais</p>
          </div>
        </button>

        {/* Card 4 */}
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'resolvidas' ? 'todos' : 'resolvidas')}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
            selectedFilter === 'resolvidas'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-white border-emerald-200/80 hover:bg-emerald-50/50 shadow-2xs'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
            ✓
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">12</p>
            <p className="text-xs font-semibold text-emerald-700">Resolvidas hoje</p>
          </div>
        </button>
      </div>

      {/* Main Grid Layout: Regras vs Lista de Ação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Regras de prioridade */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Regras de prioridade
            </h3>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Configurar
            </button>
          </div>

          <div className="space-y-2.5">
            {PRIORITY_RULES.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-3 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-200 text-purple-900 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{rule.title}</p>
                    <p className="text-[10px] text-slate-400">{rule.slaLimit}</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                  {rule.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Clínica deve responder list (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Clínica deve responder</h3>
              <p className="text-xs text-slate-400">
                5 pacientes em ordem de criticidade
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Ordenar:</span>
              <select className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-purple-900">
                <option>Mais urgente</option>
                <option>Menos urgente</option>
                <option>Por convênio</option>
              </select>
            </div>
          </div>

          {/* List of Urgent Items */}
          <div className="space-y-3">
            {/* Item 1 */}
            <div className="p-4 bg-slate-50/80 hover:bg-purple-50/40 rounded-2xl border border-slate-200/80 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-900 font-bold text-xs flex items-center justify-center shrink-0">
                    AL
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Ana Luíza Vasconcelos</p>
                    <p className="text-[10px] text-slate-500">
                      Dúvida sobre cobertura • Bradesco Saúde
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-rose-600 font-bold text-[11px] bg-rose-100 px-2 py-0.5 rounded">
                    Vencida há 1h15
                  </span>
                  <span className="text-slate-400 text-[11px]">Camila</span>
                  <button
                    onClick={() => onOpenPatientChat && onOpenPatientChat('p1')}
                    className="bg-white border border-slate-300 hover:border-purple-600 hover:text-purple-700 text-slate-800 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <span>Abrir atendimento</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                "Qual o valor do ecocardiograma caso o meu convênio não cubra totalmente?"
              </p>
            </div>

            {/* Item 2 */}
            <div className="p-4 bg-slate-50/80 hover:bg-purple-50/40 rounded-2xl border border-slate-200/80 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                    CE
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Carlos Eduardo Mendes</p>
                    <p className="text-[10px] text-slate-500">
                      Negociação de orçamento • Particular
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-amber-700 font-bold text-[11px] bg-amber-100 px-2 py-0.5 rounded">
                    Restam 12min
                  </span>
                  <span className="text-slate-400 text-[11px]">Mariana</span>
                  <button
                    onClick={() => onOpenPatientChat && onOpenPatientChat('p2')}
                    className="bg-white border border-slate-300 hover:border-purple-600 hover:text-purple-700 text-slate-800 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <span>Abrir atendimento</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                "Vocês parcelam em quantas vezes sem juros para implante dentário?"
              </p>
            </div>

            {/* Item 3 */}
            <div className="p-4 bg-slate-50/80 hover:bg-purple-50/40 rounded-2xl border border-slate-200/80 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-200 text-indigo-900 font-bold text-xs flex items-center justify-center shrink-0">
                    FL
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Fernanda Lima Rocha</p>
                    <p className="text-[10px] text-slate-500">
                      Autorização de guia • SulAmérica
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-amber-700 font-bold text-[11px] bg-amber-100 px-2 py-0.5 rounded">
                    Restam 12min
                  </span>
                  <span className="text-slate-400 text-[11px]">Fernanda</span>
                  <button
                    onClick={() => onOpenPatientChat && onOpenPatientChat('p3')}
                    className="bg-white border border-slate-300 hover:border-purple-600 hover:text-purple-700 text-slate-800 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <span>Abrir atendimento</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                "Guia de ressonância ainda não foi autorizada pelo convênio?"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Config Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Configuração das Regras de SLA e Priorização
              </h3>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {rules.map((rule, idx) => (
                <div key={rule.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{rule.title}</span>
                    <span className="text-[10px] text-purple-700 font-bold font-mono">{rule.slaLimit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={rule.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRules(rules.map(r => r.id === rule.id ? { ...r, title: val } : r));
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      defaultValue={rule.slaLimit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRules(rules.map(r => r.id === rule.id ? { ...r, slaLimit: val } : r));
                      }}
                      className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsConfigOpen(false);
                showToast('Regras de SLA salvas com sucesso!');
              }}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Regras de SLA</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
