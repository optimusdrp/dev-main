import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Check, Plus, RefreshCw, AlertCircle, ShieldAlert, FileText, DollarSign, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Patient, ChatMessage } from '../types';
import { apiService } from '../services/api';

interface AutoTaggingWidgetProps {
  patient: Patient;
  messages: ChatMessage[];
  onApplyTags: (tags: string[]) => void;
  showToast: (msg: string) => void;
}

export interface SuggestedTagItem {
  tag: string;
  tagPt?: string;
  confidenceScore: number;
  category: string;
  reason: string;
  color: string;
}

export const AutoTaggingWidget: React.FC<AutoTaggingWidgetProps> = ({
  patient,
  messages,
  onApplyTags,
  showToast,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [primaryLabel, setPrimaryLabel] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [suggestedTags, setSuggestedTags] = useState<SuggestedTagItem[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const runAutoTagging = async () => {
    setIsAnalyzing(true);
    try {
      const result = await apiService.autoTagConversation({
        messages,
        patientName: patient.name,
        patientInsurance: patient.insurance,
      });

      if (result) {
        setPrimaryLabel(result.primaryLabel);
        setSummary(result.summary);
        setSuggestedTags(result.suggestedTags || []);
        setHasAnalyzed(true);
      }
    } catch (err) {
      console.error('[AutoTaggingWidget] Error analyzing tags:', err);
      showToast('⚠️ Erro ao analisar etiquetas por ML. Usando modo local.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Run analysis whenever patient changes
    runAutoTagging();
  }, [patient.id]);

  const currentTags = patient.tags || [];

  const handleToggleTag = (tagLabel: string) => {
    let updated: string[];
    if (currentTags.includes(tagLabel)) {
      updated = currentTags.filter((t) => t !== tagLabel);
      showToast(`🏷️ Tag '${tagLabel}' removida.`);
    } else {
      updated = [...currentTags, tagLabel];
      showToast(`🏷️ Tag '${tagLabel}' aplicada ao perfil de ${patient.name}.`);
    }
    onApplyTags(updated);
  };

  const handleApplyAllSuggestions = () => {
    const newTags = Array.from(new Set([...currentTags, ...suggestedTags.map((s) => s.tag)]));
    onApplyTags(newTags);
    showToast(`✨ ${suggestedTags.length} etiquetas sugeridas por IA aplicadas a ${patient.name}!`);
  };

  const getTagBadgeStyle = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'urgent':
      case 'urgente':
        return 'bg-rose-100 text-rose-900 border-rose-300 ring-rose-400/20';
      case 'insurance issue':
      case 'convênio':
      case 'convenio':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'routine request':
      case 'rotina':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'exam results':
      case 'exames':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'billing / financial':
      case 'financial':
      case 'financeiro':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'post-op question':
      case 'pós-operatório':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'urgent':
      case 'urgente':
        return <ShieldAlert className="w-3 h-3 text-rose-600" />;
      case 'insurance issue':
      case 'convênio':
        return <AlertCircle className="w-3 h-3 text-amber-600" />;
      case 'routine request':
      case 'rotina':
        return <Clock className="w-3 h-3 text-blue-600" />;
      case 'exam results':
      case 'exames':
        return <FileText className="w-3 h-3 text-emerald-600" />;
      case 'billing / financial':
      case 'financial':
        return <DollarSign className="w-3 h-3 text-purple-600" />;
      default:
        return <Tag className="w-3 h-3 text-slate-600" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-4 rounded-2xl border border-purple-800/80 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide text-purple-200 uppercase flex items-center gap-1.5">
              Auto-Tagging ML (NLP)
            </h4>
            <p className="text-[10px] text-purple-300/80 font-medium">
              Análise contínua do conteúdo das mensagens
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runAutoTagging}
          disabled={isAnalyzing}
          className="p-1.5 bg-purple-800/60 hover:bg-purple-700 text-purple-200 rounded-lg border border-purple-500/30 transition-all cursor-pointer disabled:opacity-50"
          title="Reanalisar conversa com IA"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Currently Applied Tags */}
      <div className="space-y-1.5 pt-1 border-t border-purple-800/50">
        <span className="text-[10px] font-bold text-slate-300 block">Etiquetas Ativas no Perfil:</span>
        <div className="flex flex-wrap gap-1.5 min-h-[26px]">
          {currentTags.length === 0 ? (
            <span className="text-[10px] text-slate-400 italic">Nenhuma tag atribuída.</span>
          ) : (
            currentTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs ${getTagBadgeStyle(tag)}`}
              >
                {getTagIcon(tag)}
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className="hover:opacity-75 cursor-pointer ml-0.5 font-bold"
                  title="Remover tag"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Suggested Tags from ML NLP */}
      <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-purple-500/20">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-purple-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Sugestões do Modelo ML:
          </span>
          {suggestedTags.length > 0 && (
            <button
              type="button"
              onClick={handleApplyAllSuggestions}
              className="text-[10px] font-black bg-purple-600 hover:bg-purple-500 text-white px-2 py-0.5 rounded-lg border border-purple-400/40 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Aplicar Todas</span>
            </button>
          )}
        </div>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-3 space-x-2 text-xs text-purple-300">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>Analisando padrões de linguagem natural...</span>
          </div>
        ) : suggestedTags.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic">
            Nenhuma tag adicional sugerida no momento.
          </p>
        ) : (
          <div className="space-y-2">
            {suggestedTags.map((st) => {
              const isAlreadyApplied = currentTags.includes(st.tag);
              return (
                <div
                  key={st.tag}
                  className="p-2 bg-purple-900/30 border border-purple-700/40 rounded-lg flex items-start justify-between gap-2 text-xs transition-all hover:border-purple-500/60"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-white text-xs flex items-center gap-1">
                        {getTagIcon(st.tag)}
                        {st.tagPt || st.tag}
                      </span>
                      <span className="text-[9px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/30 px-1.5 py-0.2 rounded">
                        {st.confidenceScore}% Confiança
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      {st.reason}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTag(st.tag)}
                    className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer border ${
                      isAlreadyApplied
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                        : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400'
                    }`}
                  >
                    {isAlreadyApplied ? (
                      <span className="flex items-center gap-0.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                        Aplicada
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <Plus className="w-3 h-3" />
                        Adicionar
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
