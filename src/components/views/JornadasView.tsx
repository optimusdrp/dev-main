import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Clock, ShieldCheck, User, Search, Filter, ChevronRight, X, Check, Save } from 'lucide-react';
import { Patient } from '../../types';
import { INITIAL_PATIENTS } from '../../data/mockData';
import { apiService } from '../../services/api';

interface JornadasViewProps {
  onOpenPatientChat?: (patientId: string) => void;
}

export const JornadasView: React.FC<JornadasViewProps> = ({ onOpenPatientChat }) => {
  const [activeSubTab, setActiveSubTab] = useState('Atendimento inicial');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [isNewJornadaOpen, setIsNewJornadaOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedColForPatient, setSelectedColForPatient] = useState<string>('triagem');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientInsurance, setNewPatientInsurance] = useState('Particular');
  const [toast, setToast] = useState<string | null>(null);

  // Fetch patients from API
  useEffect(() => {
    async function loadPatients() {
      const data = await apiService.getPatients();
      if (data && data.length > 0) {
        setPatients(data);
      }
    }
    loadPatients();
  }, []);

  const handleCardClick = (patientId: string) => {
    if (onOpenPatientChat) {
      onOpenPatientChat(patientId);
    } else {
      showToast('Abrindo atendimento do paciente...');
    }
  };

  const subTabs = [
    'Atendimento inicial',
    'Comercial',
    'Exames e guias',
    'Pós-atendimento',
    'Recall'
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const columns = [
    {
      id: 'triagem',
      title: 'Nova triagem',
      count: patients.filter((p) => p.stage === 'triagem').length || 8,
      subtitle: 'Entrada e identificação da demanda',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'documentos',
      title: 'Documentos e convênio',
      count: patients.filter((p) => p.stage === 'documentos').length || 5,
      subtitle: 'Etapa acompanhada pela equipe',
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'proposta',
      title: 'Horários e proposta',
      count: patients.filter((p) => p.stage === 'proposta').length || 7,
      subtitle: 'Etapa acompanhada pela equipe',
      color: 'bg-cyan-100 text-cyan-800'
    },
    {
      id: 'agendado',
      title: 'Agendado',
      count: patients.filter((p) => p.stage === 'agendado').length || 12,
      subtitle: 'Registro confirmado na agenda',
      color: 'bg-emerald-100 text-emerald-800'
    }
  ];

  const handleAddPatient = async () => {
    if (!newPatientName.trim()) return;

    const newPat = await apiService.createPatient({
      name: newPatientName,
      insurance: newPatientInsurance,
      stage: selectedColForPatient,
      status: 'atendimento',
      urgency: 'media',
      lastMessage: 'Atendimento e jornada iniciados via CRM.',
      lastMessageTime: 'Agora',
      assignedTo: 'Camila',
    });

    if (newPat) {
      setPatients((prev) => [...prev, newPat]);
      showToast(`Paciente ${newPatientName} adicionado à etapa!`);
    } else {
      showToast(`Aviso: Paciente adicionado localmente.`);
      setPatients((prev) => [
        ...prev,
        {
          id: `p-${Date.now()}`,
          name: newPatientName,
          phone: '(11) 98888-7777',
          insurance: newPatientInsurance,
          status: 'atendimento',
          stage: selectedColForPatient,
          urgency: 'media',
          lastMessage: 'Atendimento e jornada iniciados.',
          lastMessageTime: 'Agora',
          unreadCount: 0,
          assignedTo: 'Camila',
          channel: 'WhatsApp',
          checklist: [],
          internalNotes: []
        }
      ]);
    }

    setNewPatientName('');
    setIsAddPatientOpen(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
            Jornadas do paciente
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Terça-feira, 5 de agosto
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsNewJornadaOpen(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar jornada</span>
          </button>
        </div>
      </div>

      {/* Subheader description */}
      <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
            JORNADA CONFIGURÁVEL
          </span>
          <h2 className="text-sm font-bold text-purple-950">Atendimento inicial</h2>
          <p className="text-xs text-purple-800">
            Cada paciente avança com regras, responsáveis e checklists próprios.
          </p>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSubTab === tab
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {columns.map((col) => (
          <div key={col.id} className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200/80 flex flex-col min-h-[500px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <h3 className="text-xs font-bold text-slate-900">{col.title}</h3>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${col.color}`}>
                  {col.count}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">{col.subtitle}</p>

            {/* Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {/* Sample cards strictly matching screenshot 3 */}
              {col.id === 'triagem' && (
                <>
                  {/* Card 1 */}
                  <div
                    onClick={() => handleCardClick('p1')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Beatriz Alves</p>
                        <p className="text-[10px] text-slate-500">Unimed</p>
                      </div>
                      <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                        Ação pendente
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Camila</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 1h20
                      </span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div
                    onClick={() => handleCardClick('p2')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Paulo Nogueira</p>
                        <p className="text-[10px] text-slate-500">Particular</p>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        No prazo
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Mariana</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 28min
                      </span>
                    </div>
                  </div>
                </>
              )}

              {col.id === 'documentos' && (
                <>
                  <div
                    onClick={() => handleCardClick('p3')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Ana Luíza Vasconcelos</p>
                        <p className="text-[10px] text-slate-500">Bradesco Saúde</p>
                      </div>
                      <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                        Ação pendente
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Camila</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 1h45
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => handleCardClick('p4')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Marta Silva</p>
                        <p className="text-[10px] text-slate-500">Amil</p>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        No prazo
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Mariana</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 28min
                      </span>
                    </div>
                  </div>
                </>
              )}

              {col.id === 'proposta' && (
                <>
                  <div
                    onClick={() => handleCardClick('p1')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Carlos Eduardo Mendes</p>
                        <p className="text-[10px] text-slate-500">Particular</p>
                      </div>
                      <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                        Ação pendente
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Camila</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 38min
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => handleCardClick('p2')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Roberto Lima</p>
                        <p className="text-[10px] text-slate-500">SulAmérica</p>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        No prazo
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Mariana</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 28min
                      </span>
                    </div>
                  </div>
                </>
              )}

              {col.id === 'agendado' && (
                <>
                  <div
                    onClick={() => handleCardClick('p3')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Carla Souza</p>
                        <p className="text-[10px] text-slate-500">Particular</p>
                      </div>
                      <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                        Ação pendente
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Camila</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 1h20
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => handleCardClick('p4')}
                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer hover:border-purple-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">João Viana</p>
                        <p className="text-[10px] text-slate-500">Bradesco Saúde</p>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        No prazo
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Mariana</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 28min
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Add Patient to Column */}
            <button
              onClick={() => {
                setSelectedColForPatient(col.id);
                setIsAddPatientOpen(true);
              }}
              className="w-full mt-3 py-2 border-2 border-dashed border-slate-300 hover:border-purple-500 text-slate-500 hover:text-purple-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 bg-white/50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar paciente</span>
            </button>
          </div>
        ))}
      </div>

      {/* New Jornada Modal */}
      {isNewJornadaOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Criar Nova Jornada Personalizada
              </h3>
              <button
                onClick={() => setIsNewJornadaOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nome da Jornada
                </label>
                <input
                  type="text"
                  placeholder="Ex: Atendimento Estético Especializado"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Unidade Responsável
                </label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                  <option>Todas as unidades</option>
                  <option>Unidade Jardins</option>
                  <option>Unidade Moema</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setIsNewJornadaOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setIsNewJornadaOpen(false);
                  showToast('Nova jornada criada e adicionada!');
                }}
                className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Criar Jornada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Adicionar Paciente na Etapa
              </h3>
              <button
                onClick={() => setIsAddPatientOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nome do Paciente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Roberto Alencar"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Convênio / Categoria
                </label>
                <select
                  value={newPatientInsurance}
                  onChange={(e) => setNewPatientInsurance(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option>Particular</option>
                  <option>Unimed</option>
                  <option>Bradesco Saúde</option>
                  <option>SulAmérica</option>
                  <option>Amil</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setIsAddPatientOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPatient}
                className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Salvar Paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
