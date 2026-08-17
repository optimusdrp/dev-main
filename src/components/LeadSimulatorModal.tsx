import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Zap,
  TrendingUp,
  UserCheck,
  DollarSign,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Flame,
  Award,
  Star,
  Target,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { LeadScoreData, Patient } from '../types';
import { apiService } from '../services/api';
import { getTierColor } from './LeadQualifierWidget';

interface LeadSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: (newPatient: Patient) => void;
}

const PRESET_SCENARIOS = [
  {
    title: '✨ VIP Estética - Implantes & Facetas (Alto Ticket)',
    name: 'Guilherme Siqueira',
    phone: '(11) 98877-6655',
    insurance: 'Particular',
    specialty: 'Odontologia / Harmonização',
    message: 'Olá, gostaria de saber se vocês realizam protocolo de implantes importados e facetas em porcelana. Qual o valor médio e parcelam no cartão?'
  },
  {
    title: '⭐ Particular Alta Urgência - Check-up & Eco',
    name: 'Renata Albuquerque',
    phone: '(11) 97766-5544',
    insurance: 'Particular',
    specialty: 'Cardiologia',
    message: 'Preciso fazer um ecocardiograma com urgência ainda esta semana com laudo rápido. Quanto fica no particular?'
  },
  {
    title: '🛡️ Convênio TISS - Cirurgia & Ressonância',
    name: 'Marcelo Pires',
    phone: '(11) 96655-4433',
    insurance: 'Bradesco Saúde',
    specialty: 'Cirurgia Geral',
    message: 'Olá, tenho pedido de cirurgia com o Dr. Roberto pela Bradesco Saúde. Vocês ajudam com a autorização da guia?'
  },
  {
    title: '📋 Dúvida Administrativa - Rotina',
    name: 'Carla Nogueira',
    phone: '(11) 95544-3322',
    insurance: 'Amil',
    specialty: 'Dermatologia',
    message: 'Boa tarde, qual o endereço da unidade Jardins e até que horas vocês atendem hoje?'
  }
];

export const LeadSimulatorModal: React.FC<LeadSimulatorModalProps> = ({
  isOpen,
  onClose,
  onLeadCreated
}) => {
  const [name, setName] = useState('Guilherme Siqueira');
  const [phone, setPhone] = useState('(11) 98877-6655');
  const [insurance, setInsurance] = useState('Particular');
  const [specialty, setSpecialty] = useState('Odontologia / Harmonização');
  const [message, setMessage] = useState('Olá, gostaria de saber se vocês realizam protocolo de implantes importados e facetas em porcelana. Qual o valor médio e parcelam no cartão?');
  const [isLoading, setIsLoading] = useState(false);
  const [qualification, setQualification] = useState<LeadScoreData | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setName(preset.name);
    setPhone(preset.phone);
    setInsurance(preset.insurance);
    setSpecialty(preset.specialty);
    setMessage(preset.message);
    setQualification(null);
  };

  const handleRunSimulation = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      const res = await apiService.qualifyLead({
        patientName: name,
        patientPhone: phone,
        declaredInsurance: insurance,
        specialty,
        messageText: message
      });
      if (res) {
        setQualification(res);
      }
    } catch (err) {
      console.error('Erro na simulação do qualificador:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePatientFromLead = () => {
    if (!qualification) return;
    const newId = 'p_' + Date.now();
    const newPatient: Patient = {
      id: newId,
      name,
      phone,
      insurance,
      specialty,
      status: 'atendimento',
      stage: 'triagem',
      urgency: qualification.score >= 80 ? 'alta' : 'media',
      lastMessage: message,
      lastMessageTime: 'Agora',
      unreadCount: 1,
      assignedTo: qualification.smartRouting.recommendedAttendant.split(' ')[0] || 'Camila',
      channel: 'WhatsApp',
      nextAction: 'Executar pitch de conversão sugerido pela IA',
      checklist: [
        { id: 'c1', label: 'Lead qualificado por IA', completed: true },
        { id: 'c2', label: 'Roteamento humanizado executado', completed: true },
        { id: 'c3', label: 'Apresentação de proposta/agenda', completed: false }
      ],
      internalNotes: [
        `Lead qualificado automaticamente: Score ${qualification.score}/100 (${qualification.tier}).`,
        `Roteado para: ${qualification.smartRouting.recommendedAttendant}`
      ],
      tags: qualification.score >= 85 ? ['VIP Lead', 'High Ticket'] : ['Qualificado IA'],
      sentiment: 'satisfied',
      ehrSynced: false,
      leadScore: qualification
    };

    if (onLeadCreated) {
      onLeadCreated(newPatient);
      onClose();
    }
  };

  const tierStyle = qualification ? getTierColor(qualification.tier) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-md text-slate-950 font-black">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Simulador de Qualificação de Leads & Intenção por IA</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Gemini Flash + Heurística
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Avalie em tempo real o Lead Score, propensão financeira e roteamento para os melhores atendentes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Cenários de Teste Rápidos
              </label>
              <div className="space-y-1.5">
                {PRESET_SCENARIOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/50 text-xs font-semibold text-slate-800 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{preset.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nome do Lead</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Telefone WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Convênio / Tipo</label>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="Particular">Particular (Sem Convênio)</option>
                    <option value="Bradesco Saúde">Bradesco Saúde</option>
                    <option value="SulAmérica">SulAmérica</option>
                    <option value="Unimed">Unimed</option>
                    <option value="Amil">Amil</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Especialidade</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Mensagem Recebida (WhatsApp / Chat)
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite a mensagem do paciente para a IA analisar..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white leading-relaxed resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isLoading || !message.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processando Qualificação por IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Executar Qualificação em Tempo Real
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Results & Smart Routing (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50 rounded-xl border border-slate-200 p-4.5 flex flex-col justify-between">
            {qualification && tierStyle ? (
              <div className="space-y-4 animate-fadeIn">
                {/* Score Header Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md ${tierStyle.bg}`}>
                        {qualification.score}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 uppercase">
                            {qualification.tier}
                          </h4>
                          {qualification.score >= 85 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-600" />
                              Alto Ticket
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Probabilidade de Conversão: <strong className="text-slate-800">{qualification.conversionProbability}%</strong> • Urgência: <strong className="text-slate-800">{qualification.urgencyLevel}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Disposição Financeira</span>
                      <strong className="text-slate-800">{qualification.financialCategory}</strong>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Ticket Estimado</span>
                      <strong className="text-emerald-700">{qualification.estimatedValueRange}</strong>
                    </div>
                  </div>
                </div>

                {/* Smart Routing Callout */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-700" />
                      <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                        Roteamento Inteligente Recomendado
                      </span>
                    </div>
                    {qualification.smartRouting.priorityQueue && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                        ⚡ Fila Prioritária
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {qualification.smartRouting.recommendedAttendant}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {qualification.smartRouting.conversionRate}% taxa de conversão
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {qualification.smartRouting.routingReason}
                  </p>
                </div>

                {/* Signals & Pitch */}
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Sinais de Compra Identificados:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {qualification.keyBuyingSignals.map((sig, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3">
                    <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Pitch Recomendado para o Atendente:
                    </span>
                    <p className="text-xs text-slate-700 italic bg-white/90 p-2.5 rounded border border-amber-200/60 leading-relaxed">
                      "{qualification.recommendedSalesPitch}"
                    </p>
                  </div>
                </div>

                {/* Action button to create patient */}
                <div className="pt-2">
                  <button
                    onClick={handleCreatePatientFromLead}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Iniciar Atendimento com este Lead no CRM
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">Aguardando Execução do Teste</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Selecione um cenário predefinido à esquerda ou digite uma mensagem real do WhatsApp para ver a IA calcular o Lead Score instantâneo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
