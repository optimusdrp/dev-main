import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  RefreshCw,
  Award,
  Flame,
  Star,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Target,
  ArrowRight
} from 'lucide-react';
import { Patient, LeadScoreData, LeadTier } from '../types';
import { apiService } from '../services/api';

interface LeadQualifierWidgetProps {
  patient: Patient;
  onUpdateLeadScore?: (patientId: string, newScore: LeadScoreData) => void;
  onInsertPitchToChat?: (text: string) => void;
  onOpenSimulator?: () => void;
}

export const getTierColor = (tier?: LeadTier) => {
  switch (tier) {
    case 'VIP / Alto Valor':
      return {
        bg: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white',
        lightBg: 'bg-amber-50 border-amber-200 text-amber-900',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        ring: 'ring-amber-400',
        icon: Flame,
        accentText: 'text-amber-700',
        progressColor: 'bg-amber-500',
      };
    case 'Ouro (Alta Conversão)':
      return {
        bg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white',
        lightBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        ring: 'ring-emerald-400',
        icon: Star,
        accentText: 'text-emerald-700',
        progressColor: 'bg-emerald-500',
      };
    case 'Prata (Padrão)':
      return {
        bg: 'bg-slate-700 text-white',
        lightBg: 'bg-slate-50 border-slate-200 text-slate-900',
        badge: 'bg-slate-100 text-slate-800 border-slate-300',
        ring: 'ring-slate-400',
        icon: Award,
        accentText: 'text-slate-700',
        progressColor: 'bg-slate-500',
      };
    default:
      return {
        bg: 'bg-zinc-600 text-white',
        lightBg: 'bg-zinc-50 border-zinc-200 text-zinc-800',
        badge: 'bg-zinc-100 text-zinc-700 border-zinc-300',
        ring: 'ring-zinc-300',
        icon: Target,
        accentText: 'text-zinc-600',
        progressColor: 'bg-zinc-400',
      };
  }
};

export const LeadQualifierWidget: React.FC<LeadQualifierWidgetProps> = ({
  patient,
  onUpdateLeadScore,
  onInsertPitchToChat,
  onOpenSimulator
}) => {
  const [isQualifying, setIsQualifying] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const lead = patient.leadScore;
  const tierStyle = getTierColor(lead?.tier);
  const TierIcon = tierStyle.icon;

  const handleRequalify = async () => {
    setIsQualifying(true);
    try {
      const result = await apiService.qualifyLead({
        patientName: patient.name,
        patientPhone: patient.phone,
        declaredInsurance: patient.insurance,
        specialty: patient.specialty,
        messageText: patient.lastMessage || 'Gostaria de agendar consulta e verificar valores de procedimento.'
      });

      if (result && onUpdateLeadScore) {
        onUpdateLeadScore(patient.id, result);
        setSuccessToast('Lead re-analisado e qualificado com sucesso!');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error('Erro ao requalificar lead:', err);
    } finally {
      setIsQualifying(false);
    }
  };

  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  if (!lead) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Qualificador de Leads por IA</h4>
              <p className="text-xs text-slate-500">Avalie a urgência e disposição financeira</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleRequalify}
          disabled={isQualifying}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {isQualifying ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Analisando mensagens com IA...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Executar Qualificação Automática
            </>
          )}
        </button>
      </div>
    );
  }

  const isHighValue = lead.score >= 75;

  return (
    <div className={`rounded-xl border transition-all duration-200 ${isHighValue ? 'bg-gradient-to-b from-amber-50/50 via-white to-white border-amber-200/90 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}>
      {/* Toast */}
      {successToast && (
        <div className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-t-xl flex items-center justify-between animate-fadeIn font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {successToast}
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-3.5 pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs ${tierStyle.bg}`}>
              <TierIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Lead Score IA
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  Qualificado
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{lead.tier}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Score Ring / Pill */}
            <div className={`flex items-baseline gap-0.5 px-3 py-1 rounded-full font-black text-sm border shadow-xs ${
              lead.score >= 85
                ? 'bg-amber-100 border-amber-300 text-amber-950'
                : lead.score >= 70
                ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <span className="text-base font-extrabold">{lead.score}</span>
              <span className="text-[10px] text-slate-500 font-normal">/100</span>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title={isExpanded ? 'Recolher' : 'Expandir'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${tierStyle.progressColor}`}
            style={{ width: `${Math.min(lead.score, 100)}%` }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="px-3.5 pb-3.5 space-y-3 pt-1 border-t border-slate-100">
          {/* Key Classification Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                Disposição Financeira
              </span>
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{lead.financialCategory}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                Ticket Estimado
              </span>
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{lead.estimatedValueRange}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 col-span-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                Intenção de Tratamento
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{lead.treatmentIntent}</span>
                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {lead.conversionProbability}% conv.
                </span>
              </div>
            </div>
          </div>

          {/* Smart Attendant Routing Box */}
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider">
                  Roteamento Inteligente
                </span>
              </div>
              {lead.smartRouting.priorityQueue && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                  <Zap className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                  Fila Prioritária
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-900">
                {lead.smartRouting.recommendedAttendant}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200">
                {lead.smartRouting.conversionRate}% de conversão
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {lead.smartRouting.routingReason}
            </p>
          </div>

          {/* Key Buying Signals */}
          {lead.keyBuyingSignals && lead.keyBuyingSignals.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Sinais de Intenção & Compra Detectados
              </span>
              <div className="flex flex-wrap gap-1.5">
                {lead.keyBuyingSignals.map((signal, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Sales Pitch & Executive Briefing */}
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Script / Pitch Sugerido para Fechamento
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopyPitch(lead.recommendedSalesPitch)}
                  className="px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                  title="Copiar texto"
                >
                  {copiedPitch ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      Copiar
                    </>
                  )}
                </button>

                {onInsertPitchToChat && (
                  <button
                    onClick={() => onInsertPitchToChat(lead.recommendedSalesPitch)}
                    className="px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    title="Inserir direto no chat"
                  >
                    <Send className="w-2.5 h-2.5" />
                    Usar no Chat
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-700 italic bg-white/80 p-2 rounded border border-amber-100/80 leading-relaxed">
              "{lead.recommendedSalesPitch}"
            </p>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleRequalify}
              disabled={isQualifying}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isQualifying ? 'animate-spin' : ''}`} />
              {isQualifying ? 'Re-analisando...' : 'Reavaliar com IA'}
            </button>

            {onOpenSimulator && (
              <button
                onClick={onOpenSimulator}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 hover:underline"
              >
                <span>Simulador de Leads</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
