import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Phone,
  MoreVertical,
  AlertTriangle,
  Send,
  Paperclip,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  Plus,
  FileText,
  ShieldCheck,
  User,
  Activity,
  Bot,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  X,
  Info,
  Check,
  SlidersHorizontal,
  Stethoscope,
  RotateCcw,
  AlertCircle,
  Wifi,
  WifiOff,
  HardDrive,
  Clock,
  Edit3,
  Save,
  Zap,
  Edit2,
  Trash2,
  Bookmark,
  Command,
  CornerDownLeft,
  BookOpen,
  MessageSquarePlus,
  Copy,
  Tag,
  Settings,
  SendHorizontal,
  Code,
  UserCheck,
  BellRing,
  HelpCircle,
  Layers,
  Flame,
  Star,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { INITIAL_PATIENTS, INITIAL_CHAT_MESSAGES, DEFAULT_RESPONSE_TEMPLATES } from '../../data/mockData';
import { Patient, ChatMessage, ResponseTemplate, LeadScoreData } from '../../types';
import { AnaliseInteligente } from './AnaliseInteligente';
import { AutoTaggingWidget } from '../AutoTaggingWidget';
import { QuickReplyManager } from '../QuickReplyManager';
import { LeadQualifierWidget, getTierColor } from '../LeadQualifierWidget';
import { LeadSimulatorModal } from '../LeadSimulatorModal';
import { apiService } from '../../services/api';
import { useFilterPreferences } from '../../context/FilterPreferencesContext';

export const getSentimentDetails = (sentiment?: 'frustrated' | 'anxious' | 'neutral' | 'satisfied') => {
  switch (sentiment) {
    case 'frustrated':
      return {
        emoji: '🤬',
        label: 'Frustrado / Insatisfeito',
        shortLabel: 'Frustrado',
        badgeBg: 'bg-rose-100 text-rose-950 border-rose-300 ring-2 ring-rose-400/30 font-black',
        barBg: 'bg-rose-600',
        cardBorder: 'border-l-4 border-l-rose-600 bg-rose-50/40',
        dotBg: 'bg-rose-600 text-white',
        iconColor: 'text-rose-600',
      };
    case 'anxious':
      return {
        emoji: '😟',
        label: 'Ansioso / Inquieto',
        shortLabel: 'Ansioso',
        badgeBg: 'bg-amber-100 text-amber-950 border-amber-300 font-black',
        barBg: 'bg-amber-500',
        cardBorder: 'border-l-4 border-l-amber-500 bg-amber-50/30',
        dotBg: 'bg-amber-500 text-white',
        iconColor: 'text-amber-600',
      };
    case 'satisfied':
      return {
        emoji: '😊',
        label: 'Satisfeito / Tranquilo',
        shortLabel: 'Satisfeito',
        badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold',
        barBg: 'bg-emerald-500',
        cardBorder: '',
        dotBg: 'bg-emerald-500 text-white',
        iconColor: 'text-emerald-600',
      };
    default:
      return {
        emoji: '😐',
        label: 'Sentimento Neutro',
        shortLabel: 'Neutro',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-200 font-semibold',
        barBg: 'bg-slate-400',
        cardBorder: '',
        dotBg: 'bg-slate-400 text-white',
        iconColor: 'text-slate-500',
      };
  }
};

export const AtendimentosView: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('p1');
  
  // Session Global Filter Preferences
  const {
    selectedSpecialty,
    setSelectedSpecialty,
    selectedUrgency,
    setSelectedUrgency,
    filterMode,
    setFilterMode,
    searchQuery,
    setSearchQuery,
    activeFiltersCount,
    resetFilters,
  } = useFilterPreferences();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<'todos' | 'frustrated' | 'anxious' | 'satisfied' | 'neutral'>('todos');
  const [selectedLeadTierFilter, setSelectedLeadTierFilter] = useState<'todos' | 'vip' | 'ouro' | 'prata' | 'bronze' | 'particular' | 'convenio'>('todos');
  const [showLeadSimulatorModal, setShowLeadSimulatorModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const cached = localStorage.getItem('mediflux_offline_chat_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return INITIAL_CHAT_MESSAGES;
      }
    }
    return INITIAL_CHAT_MESSAGES;
  });

  // Local Drafts per Patient
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('mediflux_message_drafts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  // Offline Pending Messages Queue
  const [pendingQueue, setPendingQueue] = useState<Array<{ id: string; patientId: string; message: Partial<ChatMessage>; createdAt: string }>>(() => {
    const saved = localStorage.getItem('mediflux_pending_queue');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  const [isSyncingQueue, setIsSyncingQueue] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [rhsTab, setRhsTab] = useState<'triagem' | 'leadScore' | 'pendencias' | 'dados' | 'historico'>('triagem');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [mobileShowInfo, setMobileShowInfo] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);

  // Response Templates State & Controls
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
  const [showTemplatePopover, setShowTemplatePopover] = useState(false);
  const [showManageTemplatesModal, setShowManageTemplatesModal] = useState(false);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('Todas');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync templates from localStorage & custom events
  useEffect(() => {
    const handleTemplatesSync = () => {
      const saved = localStorage.getItem('mediflux_response_templates');
      if (saved) {
        try {
          setTemplates(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener('mediflux_templates_updated', handleTemplatesSync);
    window.addEventListener('storage', handleTemplatesSync);
    return () => {
      window.removeEventListener('mediflux_templates_updated', handleTemplatesSync);
      window.removeEventListener('storage', handleTemplatesSync);
    };
  }, []);

  // Slash Command (/) Auto-Complete State
  const [slashAutocompleteOpen, setSlashAutocompleteOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  const interpolateTemplate = (tplContent: string, patient?: Patient) => {
    if (!tplContent) return '';
    const patName = patient?.name || 'Mariana Costa';
    const patInsurance = patient?.insurance || 'Bradesco Saúde';
    const docName = patient?.assignedTo
      ? (patient.assignedTo.startsWith('Dr') ? patient.assignedTo : `Dr. ${patient.assignedTo}`)
      : 'Dr. Roberto Andrade';
    const clinicName = 'Clínica Santa Helena';
    const apptDate = patient?.appointmentDate || '14/08/2026';
    const apptTime = patient?.appointmentTime || '14:30';
    const spec = patient?.specialty || 'Cardiologia';

    return tplContent
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

  // Filter templates matching slash command
  const matchingSlashTemplates = templates.filter((tpl) => {
    if (!slashQuery) return true;
    const q = slashQuery.toLowerCase();
    const shortcutMatch = tpl.shortcut ? tpl.shortcut.toLowerCase().replace('/', '').includes(q) : false;
    const titleMatch = tpl.title.toLowerCase().includes(q);
    const catMatch = tpl.category.toLowerCase().includes(q);
    const contentMatch = tpl.content.toLowerCase().includes(q);
    return shortcutMatch || titleMatch || catMatch || contentMatch;
  });

  const handleApplyTemplate = (template: ResponseTemplate, autoSend = false) => {
    const activePat = patients.find((p) => p.id === selectedPatientId) || patients[0];
    const interpolated = interpolateTemplate(template.content, activePat);
    setInputText(interpolated);
    setShowTemplatePopover(false);
    setSlashAutocompleteOpen(false);

    // Increment usage count & save to storage
    const updated = templates.map((t) =>
      t.id === template.id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
    );
    setTemplates(updated);
    localStorage.setItem('mediflux_response_templates', JSON.stringify(updated));

    showToast(`⚡ Resposta rápida "${template.title}" inserida com variáveis preenchidas!`);

    if (autoSend) {
      setTimeout(() => {
        handleSendMessage();
      }, 150);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!slashAutocompleteOpen || matchingSlashTemplates.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSlashSelectedIndex((prev) => (prev + 1) % matchingSlashTemplates.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSlashSelectedIndex((prev) => (prev - 1 + matchingSlashTemplates.length) % matchingSlashTemplates.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (matchingSlashTemplates.length > 0) {
        e.preventDefault();
        const selectedTpl = matchingSlashTemplates[slashSelectedIndex] || matchingSlashTemplates[0];
        if (selectedTpl) {
          handleApplyTemplate(selectedTpl, false);
        }
      }
    } else if (e.key === 'Escape') {
      setSlashAutocompleteOpen(false);
    }
  };

  // Filter templates for popover
  const filteredPopoverTemplates = templates.filter((tpl) => {
    const matchesCat = selectedTemplateCategory === 'Todas' || tpl.category === selectedTemplateCategory;
    const q = templateSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tpl.title.toLowerCase().includes(q) ||
      tpl.content.toLowerCase().includes(q) ||
      (tpl.shortcut && tpl.shortcut.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });


  // Service Worker & Offline Network State with Auto-Sync Queue
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(!navigator.onLine);

  const syncPendingQueue = useCallback(async (isManualTrigger = false) => {
    const rawQueue = localStorage.getItem('mediflux_pending_queue');
    if (!rawQueue) return;

    // Check offline sync policy
    const policy = localStorage.getItem('mediflux_draft_sync_policy') || 'realtime';
    if (!isManualTrigger && policy === 'ondemand') {
      return; // Skip auto sync when policy is set to on-demand
    }

    if (!isManualTrigger && policy === 'wifi_only') {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn && (conn.type === 'cellular' || conn.saveData)) {
        showToast('📶 Sincronização pendente aguardando Wi-Fi (Política Wi-Fi Ativa).');
        return;
      }
    }

    try {
      const queue = JSON.parse(rawQueue);
      if (!queue || queue.length === 0 || !navigator.onLine) return;

      setIsSyncingQueue(true);
      let successCount = 0;
      const remaining: typeof pendingQueue = [];

      for (const item of queue) {
        try {
          const res = await apiService.sendChatMessage(item.patientId, item.message);
          if (res) {
            successCount++;
            setChatMessages((prev) => {
              const list = prev[item.patientId] || [];
              const updatedList = list.map((m) =>
                m.id === item.id ? { ...res, isPendingSync: false } : m
              );
              const newCache = { ...prev, [item.patientId]: updatedList };
              localStorage.setItem('mediflux_offline_chat_cache', JSON.stringify(newCache));
              return newCache;
            });
          } else {
            remaining.push(item);
          }
        } catch (e) {
          remaining.push(item);
        }
      }

      setPendingQueue(remaining);
      localStorage.setItem('mediflux_pending_queue', JSON.stringify(remaining));
      setIsSyncingQueue(false);

      if (successCount > 0) {
        showToast(`✅ ${successCount} mensagem(ns) enviada(s) offline sincronizada(s) com sucesso!`);
      }
    } catch (err) {
      setIsSyncingQueue(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      showToast('🌐 Conexão reestabelecida! Sincronizando rascunhos e mensagens enviadas offline...');
      syncPendingQueue();
    };
    const handleOffline = () => {
      setIsOfflineMode(true);
      showToast('⚡ Conexão perdida. Modo Offline ativado (Mensagens serão salvas na fila local)');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine && pendingQueue.length > 0) {
      syncPendingQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingQueue, pendingQueue.length]);

  // Load draft when switching active patient
  useEffect(() => {
    if (selectedPatientId) {
      const savedDraft = drafts[selectedPatientId] || '';
      setInputText(savedDraft);
    }
  }, [selectedPatientId]);

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (selectedPatientId) {
      const updated = { ...drafts, [selectedPatientId]: val };
      setDrafts(updated);
      localStorage.setItem('mediflux_message_drafts', JSON.stringify(updated));
    }

    // Trigger Slash Command Auto-complete when starting with '/' or typing a slash shortcut
    if (val.startsWith('/')) {
      setSlashAutocompleteOpen(true);
      setSlashQuery(val.slice(1).trim());
      setSlashSelectedIndex(0);
    } else {
      setSlashAutocompleteOpen(false);
      setSlashQuery('');
    }
  };

  // Fetch Patients from backend API (with Cache Fallback)
  useEffect(() => {
    async function loadPatients() {
      const data = await apiService.getPatients();
      if (data && data.length > 0) {
        setPatients(data);
      }
    }
    loadPatients();
  }, []);

  // Fetch Chat Messages for selected patient from backend API
  useEffect(() => {
    async function loadChat() {
      if (!selectedPatientId) return;
      const msgs = await apiService.getChatMessages(selectedPatientId);
      if (msgs && msgs.length > 0) {
        setChatMessages((prev) => ({
          ...prev,
          [selectedPatientId]: msgs,
        }));
      }
    }
    loadChat();
  }, [selectedPatientId]);

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const activeMessages = chatMessages[activePatient?.id] || INITIAL_CHAT_MESSAGES[activePatient?.id] || [];

  // Filter patients using persistent session global state
  const filteredPatients = patients.filter((p) => {
    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesPhone = p.phone.includes(q);
      const matchesInsurance = p.insurance.toLowerCase().includes(q);
      const matchesSpecialty = (p.specialty || '').toLowerCase().includes(q);
      const matchesMsg = p.lastMessage.toLowerCase().includes(q);
      if (!matchesName && !matchesPhone && !matchesInsurance && !matchesSpecialty && !matchesMsg) {
        return false;
      }
    }

    // 2. Filter Mode (Action vs Waiting vs All)
    if (filterMode === 'mustAct' && !(p.urgency === 'alta' || p.urgency === 'media')) {
      return false;
    }
    if (filterMode === 'waiting' && p.status !== 'atendimento') {
      return false;
    }

    // 3. Medical Specialty filter
    if (selectedSpecialty !== 'todas') {
      if (p.specialty !== selectedSpecialty) {
        return false;
      }
    }

    // 4. Urgency Status filter
    if (selectedUrgency !== 'todas') {
      if (p.urgency !== selectedUrgency) {
        return false;
      }
    }

    // 5. Patient Sentiment filter
    if (selectedSentimentFilter !== 'todos') {
      if ((p.sentiment || 'neutral') !== selectedSentimentFilter) {
        return false;
      }
    }

    // 6. Lead Tier / Financial Intent filter
    if (selectedLeadTierFilter !== 'todos') {
      const tierLower = p.leadScore?.tier?.toLowerCase() || '';
      const finLower = p.leadScore?.financialCategory?.toLowerCase() || '';

      if (selectedLeadTierFilter === 'vip' && !tierLower.includes('vip')) return false;
      if (selectedLeadTierFilter === 'ouro' && !tierLower.includes('ouro')) return false;
      if (selectedLeadTierFilter === 'prata' && !tierLower.includes('prata')) return false;
      if (selectedLeadTierFilter === 'bronze' && !tierLower.includes('bronze')) return false;
      if (selectedLeadTierFilter === 'particular' && !finLower.includes('particular')) return false;
      if (selectedLeadTierFilter === 'convenio' && !finLower.includes('convênio') && !finLower.includes('convenio')) return false;
    }

    return true;
  });

  const handleUpdateLeadScore = async (patientId: string, leadScore: LeadScoreData) => {
    const assignedAttendant = leadScore.smartRouting?.recommendedAttendant;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            leadScore,
            assignedTo: assignedAttendant || p.assignedTo,
          };
        }
        return p;
      })
    );
    await apiService.updatePatient(patientId, {
      leadScore,
      ...(assignedAttendant ? { assignedTo: assignedAttendant } : {}),
    });
    showToast(`🎯 Lead Score atualizado (${leadScore.score}/100 - ${leadScore.tier}) com roteamento para ${assignedAttendant || 'atendente'}.`);
  };

  const handleInsertPitchToChat = (pitchText: string) => {
    setInputText(pitchText);
    showToast('💬 Argumento de fechamento inserido no chat para envio!');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const messageText = inputText;
    const isOffline = isOfflineMode || !navigator.onLine;

    const newMessage: Partial<ChatMessage> = {
      sender: isInternalComment ? 'system' : 'attendant',
      senderName: isInternalComment ? 'Comentário Interno' : 'Camila Santos',
      text: messageText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isInternalComment,
      isPendingSync: isOffline
    };

    if (isOffline) {
      const offlineMsgId = `offline-${Date.now()}`;
      const fullMsg: ChatMessage = {
        id: offlineMsgId,
        ...(newMessage as any)
      };

      setChatMessages((prev) => {
        const list = prev[activePatient.id] || [];
        const updatedList = [...list, fullMsg];
        const newCache = { ...prev, [activePatient.id]: updatedList };
        localStorage.setItem('mediflux_offline_chat_cache', JSON.stringify(newCache));
        return newCache;
      });

      const queueItem = {
        id: offlineMsgId,
        patientId: activePatient.id,
        message: newMessage,
        createdAt: new Date().toISOString()
      };
      const updatedQueue = [...pendingQueue, queueItem];
      setPendingQueue(updatedQueue);
      localStorage.setItem('mediflux_pending_queue', JSON.stringify(updatedQueue));

      showToast('⚡ Mensagem salva offline na fila! Será enviada automaticamente ao conectar.');
    } else {
      const created = await apiService.sendChatMessage(activePatient.id, newMessage);
      const finalMsg = created || (newMessage as ChatMessage);

      setChatMessages((prev) => {
        const list = prev[activePatient.id] || [];
        const updatedList = [...list, finalMsg];
        const newCache = { ...prev, [activePatient.id]: updatedList };
        localStorage.setItem('mediflux_offline_chat_cache', JSON.stringify(newCache));
        return newCache;
      });
    }

    // Update local patient last message
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, lastMessage: messageText, lastMessageTime: 'Agora' } : p))
    );

    // Clear draft for this patient
    const updatedDrafts = { ...drafts, [activePatient.id]: '' };
    setDrafts(updatedDrafts);
    localStorage.setItem('mediflux_message_drafts', JSON.stringify(updatedDrafts));

    setInputText('');
  };

  const handleApplyAiSuggestion = (suggestionText: string) => {
    setInputText(suggestionText);
  };

  const handleToggleChecklist = async (checkId: string) => {
    const updatedChecklist = activePatient.checklist.map((item) =>
      item.id === checkId ? { ...item, completed: !item.completed } : item
    );

    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, checklist: updatedChecklist } : p))
    );

    await apiService.updatePatient(activePatient.id, { checklist: updatedChecklist });
  };

  const handleUpdatePatientTags = async (patientId: string, newTags: string[]) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, tags: newTags } : p))
    );
    await apiService.updatePatient(patientId, { tags: newTags });
  };

  const handleUpdatePatientSentiment = async (
    patientId: string,
    newSentiment: 'frustrated' | 'anxious' | 'neutral' | 'satisfied'
  ) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, sentiment: newSentiment } : p))
    );
    const sent = getSentimentDetails(newSentiment);
    showToast(`🎭 Sentimento de ${patients.find(p=>p.id===patientId)?.name || 'Paciente'} definido como "${sent.label}".`);
    await apiService.updatePatient(patientId, { sentiment: newSentiment });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-[#f8f9fc] overflow-hidden">
      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Inbox list (320px) */}
        <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Inbox Search & Filter Header */}
          <div className="p-3 border-b border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Caixa de Entrada
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="text-[9px] bg-purple-700 text-white font-bold px-1.5 py-0.2 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowLeadSimulatorModal(true)}
                  className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold text-[10px] rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Simular e qualificar novos leads de WhatsApp por IA"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-200" />
                  <span>Simular Lead</span>
                </button>
                <span className="text-[10px] text-slate-400 font-medium">
                  {filteredPatients.length}
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar paciente, telefone, convênio..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Mode & Toggle Advanced Button */}
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setFilterMode('mustAct')}
                  className={`px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
                    filterMode === 'mustAct'
                      ? 'bg-purple-100 text-purple-900 font-bold border border-purple-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span>Ação Urgente</span>
                </button>
                <button
                  onClick={() => setFilterMode('waiting')}
                  className={`px-2 py-1 rounded-full transition-colors ${
                    filterMode === 'waiting'
                      ? 'bg-purple-100 text-purple-900 font-bold border border-purple-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Aguardando
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2 py-1 rounded-full transition-colors ${
                    filterMode === 'all'
                      ? 'bg-purple-100 text-purple-900 font-bold border border-purple-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Todos
                </button>
              </div>

              <button
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                  showAdvancedFilters || selectedSpecialty !== 'todas' || selectedUrgency !== 'todas' || selectedLeadTierFilter !== 'todos'
                    ? 'bg-purple-50 text-purple-800 border-purple-300 font-bold'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
                title="Filtros avançados por Especialidade, Urgência e Lead Score IA"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-700" />
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-purple-700" />
                    Filtros Avançados
                  </span>
                  {(activeFiltersCount > 0 || selectedLeadTierFilter !== 'todos') && (
                    <button
                      onClick={() => {
                        resetFilters();
                        setSelectedLeadTierFilter('todos');
                      }}
                      className="text-[10px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Limpar
                    </button>
                  )}
                </div>

                {/* Dropdown Lead Score / Qualificação IA */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3 text-amber-600" />
                    Qualificação Lead Score (IA)
                  </label>
                  <select
                    value={selectedLeadTierFilter}
                    onChange={(e) => setSelectedLeadTierFilter(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="todos">Todos os Leads</option>
                    <option value="vip">🔥 Leads VIP (Score ≥ 85 • Alto Valor)</option>
                    <option value="ouro">⭐ Leads Ouro (Score ≥ 70 • Alta Intenção)</option>
                    <option value="prata">🥈 Leads Prata (Score ≥ 50 • Médio)</option>
                    <option value="bronze">🥉 Leads Bronze (Score &lt; 50)</option>
                    <option value="particular">💎 Disposição: Particular</option>
                    <option value="convenio">🏥 Disposição: Convênio</option>
                  </select>
                </div>

                {/* Dropdown Especialidade Médica */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3 text-purple-600" />
                    Especialidade Médica
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="todas">Todas as Especialidades</option>
                    <option value="Cardiologia">Cardiologia</option>
                    <option value="Odontologia / Ortodontia">Odontologia / Ortodontia</option>
                    <option value="Dermatologia">Dermatologia</option>
                    <option value="Ginecologia">Ginecologia</option>
                    <option value="Cirurgia Geral">Cirurgia Geral</option>
                    <option value="Clínica Geral">Clínica Geral</option>
                  </select>
                </div>

                {/* Dropdown Status de Urgência */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Status de Urgência
                  </label>
                  <select
                    value={selectedUrgency}
                    onChange={(e) => setSelectedUrgency(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="todas">Todas as Urgências</option>
                    <option value="alta">🚨 Alta Urgência (Pós-Op / Sintomas)</option>
                    <option value="media">⚠️ Média Urgência (Dúvidas / Guias)</option>
                    <option value="baixa">🟢 Baixa Urgência (Rotina / Agendamento)</option>
                  </select>
                </div>

                {/* Dropdown Sentimento do Paciente */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span>🎭 Sentimento do Paciente</span>
                  </label>
                  <select
                    value={selectedSentimentFilter}
                    onChange={(e) => setSelectedSentimentFilter(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="todos">Todos os Sentimentos</option>
                    <option value="frustrated">🤬 Frustrado / Insatisfeito (Prioridade Alta)</option>
                    <option value="anxious">😟 Ansioso / Inquieto</option>
                    <option value="satisfied">😊 Satisfeito / Tranquilo</option>
                    <option value="neutral">😐 Neutro</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active Filter Chips Bar */}
            {(selectedSpecialty !== 'todas' || selectedUrgency !== 'todas' || selectedSentimentFilter !== 'todos' || selectedLeadTierFilter !== 'todos' || searchQuery) && (
              <div className="flex flex-wrap items-center gap-1 pt-1">
                {selectedLeadTierFilter !== 'todos' && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                    Lead: {selectedLeadTierFilter.toUpperCase()}
                    <button
                      onClick={() => setSelectedLeadTierFilter('todos')}
                      className="hover:text-amber-950 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedSpecialty !== 'todas' && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                    Esp: {selectedSpecialty}
                    <button
                      onClick={() => setSelectedSpecialty('todas')}
                      className="hover:text-purple-950 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedUrgency !== 'todas' && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    Urgência: {selectedUrgency.toUpperCase()}
                    <button
                      onClick={() => setSelectedUrgency('todas')}
                      className="hover:text-amber-950 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedSentimentFilter !== 'todos' && (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                    Sentimento: {getSentimentDetails(selectedSentimentFilter).shortLabel}
                    <button
                      onClick={() => setSelectedSentimentFilter('todos')}
                      className="hover:text-rose-950 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={() => {
                    resetFilters();
                    setSelectedLeadTierFilter('todos');
                  }}
                  className="text-[10px] text-slate-500 hover:text-purple-700 underline underline-offset-2 font-medium ml-auto cursor-pointer"
                >
                  Resetar
                </button>
              </div>
            )}
          </div>

          {/* Patients List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredPatients.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Nenhum paciente encontrado com os filtros selecionados.
                </p>
                <p className="text-[11px] text-slate-400">
                  Tente alterar a especialidade médica ou o status de urgência.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar Filtros da Sessão
                </button>
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = patient.id === activePatient.id;
                const sent = getSentimentDetails(patient.sentiment);

                return (
                  <div
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setIsMobileChatOpen(true);
                    }}
                    className={`p-3 cursor-pointer transition-all relative ${sent.cardBorder} ${
                      isSelected ? 'bg-purple-50/90 border-l-4 border-purple-700' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-900 font-bold text-xs flex items-center justify-center">
                            {patient.name.substring(0, 2).toUpperCase()}
                          </div>
                          {/* Visual Sentiment Avatar Badge Dot */}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center text-[9px] shadow-2xs ${sent.dotBg}`}
                            title={`Sentimento do paciente: ${sent.label}`}
                          >
                            {sent.emoji}
                          </span>
                        </div>

                        <div className="truncate min-w-0">
                          <div className="flex items-center gap-1.5 truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {patient.name}
                            </p>

                            {/* Visual Sentiment Indicator Badge/Pill next to Name */}
                            <span
                              className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full border shrink-0 ${sent.badgeBg}`}
                              title={`Prioridade por Sentimento: ${sent.label}`}
                            >
                              <span>{sent.emoji}</span>
                              <span className="hidden sm:inline font-black">{sent.shortLabel}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 truncate text-[10px] text-slate-500 mt-0.5">
                            <span className="font-medium truncate">{patient.insurance}</span>
                            <span>•</span>
                            <span className="bg-purple-50 text-purple-700 font-bold px-1.5 py-0.2 rounded border border-purple-200/60 shrink-0">
                              {patient.specialty || 'Geral'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                        {patient.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-1.5">
                      {patient.lastMessage}
                    </p>

                    {/* ML Tags Badges */}
                    {patient.tags && patient.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {patient.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                              tag.toLowerCase().includes('urgent')
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : tag.toLowerCase().includes('insurance') || tag.toLowerCase().includes('convênio')
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : tag.toLowerCase().includes('exam') || tag.toLowerCase().includes('exame')
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : tag.toLowerCase().includes('billing') || tag.toLowerCase().includes('financial')
                                ? 'bg-purple-100 text-purple-900 border-purple-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            🏷️ {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI Lead Score & Smart Routing Badge */}
                    {patient.leadScore && (() => {
                      const tierStyle = getTierColor(patient.leadScore.tier);
                      const isVip = patient.leadScore.tier?.includes('VIP');
                      const isOuro = patient.leadScore.tier?.includes('Ouro');

                      return (
                        <div className="mt-1.5 flex items-center justify-between gap-1 flex-wrap">
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded border flex items-center gap-1 shadow-2xs ${tierStyle.badge}`}
                            title={`Lead Score: ${patient.leadScore.score}/100 • Intenção: ${patient.leadScore.treatmentIntent} • Disposição: ${patient.leadScore.financialCategory}`}
                          >
                            {isVip ? (
                              <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500 animate-pulse" />
                            ) : isOuro ? (
                              <Star className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                            ) : (
                              <Target className="w-2.5 h-2.5 text-slate-500" />
                            )}
                            <span>Score {patient.leadScore.score}</span>
                            <span>•</span>
                            <span>{patient.leadScore.tier?.split(' ')[0]}</span>
                            <span>•</span>
                            <span className="truncate max-w-[80px]">{patient.leadScore.financialCategory?.split(' ')[0]}</span>
                          </span>

                          {patient.leadScore.smartRouting && (
                            <span
                              className="text-[8px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/70 flex items-center gap-0.5 truncate"
                              title={`Direcionado por IA para ${patient.leadScore.smartRouting.recommendedAttendant} (Taxa de Conversão: ${patient.leadScore.smartRouting.conversionRate}%)`}
                            >
                              <span>⚡</span>
                              <span className="truncate">{patient.leadScore.smartRouting.recommendedAttendant}</span>
                              <span className="text-purple-500 font-normal">({patient.leadScore.smartRouting.conversionRate}%)</span>
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    <div className="mt-2 flex items-center justify-between">
                      {patient.urgency === 'alta' ? (
                        <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          🚨 Alta Urgência
                        </span>
                      ) : patient.urgency === 'media' ? (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          ⚠️ Média Urgência
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-medium px-1.5 py-0.5 rounded border border-emerald-200/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          🟢 Baixa Urgência
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        {drafts[patient.id] && drafts[patient.id].trim().length > 0 && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Edit3 className="w-2.5 h-2.5 text-amber-700" />
                            Rascunho
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {patient.assignedTo}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Chat Feed (Flex-1) */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-50 border-r border-slate-200 min-w-0">
          {/* Chat Header */}
          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-900 font-bold text-sm flex items-center justify-center shrink-0">
                {activePatient.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {activePatient.name}
                  </p>

                  {/* Active Patient Visual Sentiment Indicator Badge & Selector */}
                  {(() => {
                    const activeSent = getSentimentDetails(activePatient.sentiment);
                    return (
                      <div className="flex items-center space-x-1 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border shadow-2xs ${activeSent.badgeBg}`}
                          title={`Sentimento do paciente: ${activeSent.label}`}
                        >
                          <span className="text-xs">{activeSent.emoji}</span>
                          <span>{activeSent.shortLabel}</span>
                        </span>

                        <select
                          value={activePatient.sentiment || 'neutral'}
                          onChange={(e) => handleUpdatePatientSentiment(activePatient.id, e.target.value as any)}
                          className="text-[10px] font-black bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-slate-800 cursor-pointer focus:outline-none hover:border-purple-400 shadow-2xs"
                          title="Alterar prioridade/sentimento do paciente"
                        >
                          <option value="frustrated">🤬 Frustrado / Insatisfeito</option>
                          <option value="anxious">😟 Ansioso / Inquieto</option>
                          <option value="neutral">😐 Neutro</option>
                          <option value="satisfied">😊 Satisfeito</option>
                        </select>
                      </div>
                    );
                  })()}

                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    online
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isOfflineMode;
                      setIsOfflineMode(next);
                      showToast(next ? '⚡ Modo Offline ativado manualmente (Cache SW ativo)' : '🌐 Modo Online ativado');
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                      isOfflineMode
                        ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                        : 'bg-purple-100 text-purple-800 border-purple-200'
                    }`}
                    title="Alternar simulação de modo offline com Service Worker & Cache"
                  >
                    {isOfflineMode ? (
                      <>
                        <WifiOff className="w-3 h-3 text-amber-700" />
                        SW Offline
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3 h-3 text-purple-600" />
                        SW Cache Ativo
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {activePatient.channel} - {activePatient.insurance} ({activePatient.phone})
                </p>
                {/* Chat Header Tags */}
                {activePatient.tags && activePatient.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    {activePatient.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setRhsTab('triagem')}
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${
                          tag.toLowerCase().includes('urgent')
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : tag.toLowerCase().includes('insurance') || tag.toLowerCase().includes('convênio')
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : tag.toLowerCase().includes('exam') || tag.toLowerCase().includes('exame')
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : tag.toLowerCase().includes('billing') || tag.toLowerCase().includes('financial')
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                        title="Clique para gerenciar etiquetas com Auto-Tagging ML"
                      >
                        ✨ {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRhsTab('triagem')}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Abrir Triagem Inteligente com Gemini IA"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Triagem IA</span>
              </button>
              <button
                title="Ligar para o paciente"
                className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-slate-100 rounded-lg"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-slate-100 rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SLA Pending Alert Banner */}
          {activePatient.slaWarning && (
            <div className="bg-rose-500 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-xs shrink-0">
              <div className="flex items-center space-x-2 truncate">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                <span className="truncate">{activePatient.slaWarning}</span>
              </div>
              <button className="underline text-[11px] hover:text-rose-100 shrink-0 ml-2">
                Ver regra
              </button>
            </div>
          )}

          {/* E2EE Security Bar */}
          <div className="bg-purple-900 text-purple-100 px-4 py-1 text-[11px] flex items-center justify-between border-b border-purple-800 shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3 h-3 text-emerald-400" />
              Criptografia Ponta-a-Ponta Ativa (E2EE) • LGPD Compliant
            </span>
            <span className="text-[10px] text-purple-300 hidden sm:inline">
              Auditoria de acesso registrada
            </span>
          </div>

          {/* Service Worker Offline Banner */}
          {isOfflineMode && (
            <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between border-b border-amber-600 shrink-0 shadow-2xs">
              <div className="flex items-center space-x-2">
                <WifiOff className="w-4 h-4 text-amber-950 shrink-0 animate-pulse" />
                <span>
                  Modo Offline Ativo: Histórico de atendimento recarregado pelo Service Worker & Cache Local
                </span>
              </div>
              <span className="text-[10px] bg-amber-900 text-amber-100 px-2 py-0.5 rounded font-mono shrink-0">
                sw-cache
              </span>
            </div>
          )}

          {/* Pending Offline Queue Sync Banner */}
          {pendingQueue.length > 0 && (
            <div className="bg-purple-900 text-purple-100 px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-purple-800 shrink-0 shadow-xs">
              <div className="flex items-center space-x-2">
                <RotateCcw className={`w-4 h-4 text-amber-300 shrink-0 ${isSyncingQueue ? 'animate-spin' : ''}`} />
                <span>
                  {pendingQueue.length} mensagem(ns) pendente(s) na fila offline aguardando sincronização
                </span>
              </div>
              <button
                type="button"
                onClick={() => syncPendingQueue(true)}
                disabled={isSyncingQueue || isOfflineMode}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-amber-950 font-black rounded-lg text-[10px] cursor-pointer shadow-2xs transition-colors"
              >
                {isSyncingQueue ? 'Sincronizando...' : 'Sincronizar Agora'}
              </button>
            </div>
          )}

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeMessages.map((msg) => {
              if (msg.sender === 'ai') {
                return (
                  <div key={msg.id} className="bg-purple-50 border border-purple-200 rounded-2xl p-4 my-2 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-700 text-white flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-purple-900">
                          {msg.senderName}
                        </span>
                      </div>
                      <span className="text-[10px] text-purple-600 font-medium">
                        Revisar antes de enviar
                      </span>
                    </div>

                    <p className="text-xs text-purple-950 font-medium leading-relaxed bg-white p-3 rounded-xl border border-purple-100">
                      "{msg.text}"
                    </p>

                    <div className="mt-3 flex items-center justify-end space-x-2">
                      <button className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 bg-white">
                        Descartar
                      </button>
                      <button
                        onClick={() => handleApplyAiSuggestion(msg.text)}
                        className="text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                      >
                        Usar resposta
                      </button>
                    </div>
                  </div>
                );
              }

              const isPatient = msg.sender === 'patient';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isPatient ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isPatient
                        ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200'
                        : msg.isInternalComment
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 rounded-tr-xs'
                        : 'bg-purple-700 text-white rounded-tr-xs'
                    }`}
                  >
                    {msg.senderName && !isPatient && (
                      <p className={`text-[10px] font-bold mb-1 ${msg.isInternalComment ? 'text-amber-800' : 'text-purple-200'}`}>
                        {msg.senderName}
                      </p>
                    )}

                    <p>{msg.text}</p>

                    {/* Attachment preview if card identified */}
                    {msg.attachment && (
                      <div className="mt-2 bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 text-[11px] flex items-center justify-between">
                        <div>
                          <p className="font-bold text-amber-300 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            {msg.attachment.title}
                          </p>
                          <p className="text-slate-300 text-[10px] mt-0.5">
                            {msg.attachment.subtitle}
                          </p>
                        </div>
                        <button className="text-[10px] underline text-purple-300 hover:text-white shrink-0 ml-2">
                          Ver dados
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-1">
                      {msg.isPendingSync && (
                        <span className="text-[9px] font-bold text-amber-300 flex items-center gap-1 bg-amber-950/60 px-1.5 py-0.2 rounded shrink-0">
                          <Clock className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                          Pendente Offline
                        </span>
                      )}
                      <span
                        className={`text-[9px] block ml-auto ${
                          isPatient ? 'text-slate-400' : 'text-purple-200'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0 relative">
            {/* Quick Response Templates Chips Bar */}
            <div className="flex items-center gap-1.5 pb-2 overflow-x-auto text-[11px] no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1 pr-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Atalhos:
              </span>
              {templates.slice(0, 5).map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/90 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-2xs hover:scale-102"
                  title={`Clique para inserir modelo: ${tpl.title}`}
                >
                  <span className="text-[9px] font-mono text-purple-700 bg-purple-200/70 px-1 py-0.2 rounded font-bold">
                    {tpl.shortcut || '/tpl'}
                  </span>
                  <span className="truncate max-w-[130px]">{tpl.title}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowTemplatePopover((prev) => !prev)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer text-[10px]"
              >
                <span>+ Ver Todos ({templates.length})</span>
              </button>
            </div>

            {/* Toggle internal comment & Template Actions Bar */}
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternalComment}
                  onChange={(e) => setIsInternalComment(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className={isInternalComment ? 'font-bold text-amber-800' : ''}>
                  Comentário interno (Invisível ao paciente)
                </span>
              </label>

              <div className="flex items-center space-x-2 relative">
                {/* Button to toggle Template Popover */}
                <button
                  type="button"
                  onClick={() => setShowTemplatePopover((prev) => !prev)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    showTemplatePopover
                      ? 'bg-purple-700 text-white border-purple-800 shadow-md'
                      : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Templates de Resposta</span>
                  <span className="text-[9px] bg-purple-200 text-purple-950 font-black px-1.5 py-0.2 rounded-full">
                    {templates.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyAiSuggestion('Olá! Recebemos sua mensagem e já verificamos no sistema da clínica.')}
                  className="text-[11px] text-purple-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Gerar com IA
                </button>

                {/* TEMPLATES POPOVER OVERLAY */}
                {showTemplatePopover && (
                  <div className="absolute bottom-11 right-0 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-purple-200 p-3.5 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Templates de Resposta Customizados
                        </h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowTemplatePopover(false);
                            setShowManageTemplatesModal(true);
                          }}
                          className="p-1 text-purple-700 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                          title="Gerenciar e Criar Novos Templates"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTemplatePopover(false)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Search & Category Filter inside Popover */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={templateSearchQuery}
                          onChange={(e) => setTemplateSearchQuery(e.target.value)}
                          placeholder="Buscar por título, atalho (ex: /jejum) ou texto..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold no-scrollbar">
                        {['Todas', 'Preparo de Exames', 'Agendamento', 'Pós-Operatório', 'Convênios & Guias', 'Orientação Médica', 'Informações Gerais'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedTemplateCategory(cat)}
                            className={`px-2 py-0.5 rounded-full shrink-0 cursor-pointer transition-colors ${
                              selectedTemplateCategory === cat
                                ? 'bg-purple-800 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* List of Templates in Popover */}
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {filteredPopoverTemplates.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 space-y-2">
                          <p className="text-xs font-semibold">Nenhum template encontrado.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowTemplatePopover(false);
                              setShowManageTemplatesModal(true);
                            }}
                            className="text-[11px] text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                          >
                            + Gerenciar / Criar Resposta Rápida
                          </button>
                        </div>
                      ) : (
                        filteredPopoverTemplates.map((tpl) => (
                          <div
                            key={tpl.id}
                            className="p-2.5 bg-slate-50 hover:bg-purple-50/60 rounded-xl border border-slate-200/80 transition-all space-y-1.5 text-xs group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 text-xs">{tpl.title}</span>
                                <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded border border-purple-200">
                                  {tpl.shortcut || '/tpl'}
                                </span>
                              </div>
                              <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                                {tpl.targetRole}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 italic">
                              "{interpolateTemplate(tpl.content, activePatient)}"
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[9px] text-slate-400">
                                Usado {tpl.usageCount || 0}x • {tpl.category}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleApplyTemplate(tpl, false)}
                                  className="px-2.5 py-1 bg-white border border-purple-300 text-purple-900 font-bold text-[10px] rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                                >
                                  Inserir Texto
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyTemplate(tpl, true)}
                                  className="px-2.5 py-1 bg-purple-800 text-white font-bold text-[10px] rounded-lg hover:bg-purple-900 transition-colors flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Send className="w-2.5 h-2.5" />
                                  <span>Enviar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Variáveis: &#123;nome_paciente&#125;, &#123;convenio&#125;</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTemplatePopover(false);
                          setShowManageTemplatesModal(true);
                        }}
                        className="text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                      >
                        ⚙️ Central de Templates
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* SLASH COMMAND AUTO-COMPLETE FLOATING MENU */}
            {slashAutocompleteOpen && (
              <div className="relative mb-2">
                <div className="bg-white rounded-2xl border-2 border-purple-400 shadow-2xl overflow-hidden animate-fadeIn">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-400 text-purple-950 flex items-center justify-center font-black text-xs">
                        /
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs">Auto-Completar Respostas Rápidas</span>
                          {slashQuery && (
                            <span className="bg-purple-700/80 text-amber-300 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-purple-600">
                              /{slashQuery}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-purple-200">
                          Use as setas ↑ ↓ para navegar • ↵ ou Tab para inserir • Esc para fechar
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-purple-700/60 px-2 py-0.5 rounded-full text-purple-200 font-bold">
                        {matchingSlashTemplates.length} modelo(s)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSlashAutocompleteOpen(false);
                          setShowManageTemplatesModal(true);
                        }}
                        className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                        <span>Gerenciar / Variáveis</span>
                      </button>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-1">
                    {matchingSlashTemplates.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 space-y-1">
                        <p className="text-xs font-bold text-slate-700">Nenhum modelo encontrado para "/{slashQuery}"</p>
                        <p className="text-[11px] text-slate-400">
                          Cadastre este comando no repositório de respostas rápidas das configurações.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSlashAutocompleteOpen(false);
                            setShowManageTemplatesModal(true);
                          }}
                          className="mt-2 text-xs text-purple-700 hover:text-purple-900 font-bold underline cursor-pointer"
                        >
                          + Criar modelo com atalho /{slashQuery || 'atalho'}
                        </button>
                      </div>
                    ) : (
                      matchingSlashTemplates.map((tpl, idx) => {
                        const isSelected = idx === slashSelectedIndex;
                        const interpolatedPreview = interpolateTemplate(tpl.content, activePatient);

                        return (
                          <div
                            key={tpl.id}
                            onClick={() => handleApplyTemplate(tpl, false)}
                            className={`p-3 rounded-xl transition-all cursor-pointer space-y-1.5 text-xs ${
                              isSelected
                                ? 'bg-purple-100/80 border border-purple-300 ring-1 ring-purple-400'
                                : 'hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs bg-purple-900 text-amber-300 px-2 py-0.5 rounded-md shadow-2xs">
                                  {tpl.shortcut || '/atalho'}
                                </span>
                                <span className="font-extrabold text-slate-900 text-xs">
                                  {tpl.title}
                                </span>
                                <span className="text-[9px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.2 rounded-full">
                                  {tpl.category}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 hidden sm:inline">
                                  Usado {tpl.usageCount || 0}x
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyTemplate(tpl, false);
                                  }}
                                  className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <CornerDownLeft className="w-2.5 h-2.5" />
                                  <span>Inserir</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyTemplate(tpl, true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-0.5 shadow-2xs cursor-pointer"
                                >
                                  <Send className="w-2.5 h-2.5" />
                                  <span>Enviar</span>
                                </button>
                              </div>
                            </div>

                            {/* Interpolated Preview */}
                            <div className="bg-white/80 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-700 leading-snug font-sans">
                              <span className="text-[9px] font-bold uppercase text-purple-700 mr-1.5 tracking-wider">
                                Prévia com {activePatient.name}:
                              </span>
                              "{interpolatedPreview}"
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Variable Pills Footer */}
                  <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-slate-500 font-bold">Variáveis dinâmicas ativas:</span>
                      {[
                        '{{patient_name}}',
                        '{{doctor_name}}',
                        '{{insurance}}',
                        '{{clinic_name}}',
                        '{{appointment_date}}',
                        '{{appointment_time}}',
                        '{{specialty}}'
                      ].map((v) => (
                        <span key={v} className="bg-purple-100 text-purple-900 font-mono px-1.5 py-0.2 rounded border border-purple-200 font-medium">
                          {v}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSlashAutocompleteOpen(false)}
                      className="text-slate-400 hover:text-slate-700 font-bold text-[10px] underline cursor-pointer"
                    >
                      Fechar (Esc)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Draft Saved Badge Indicator */}
            {drafts[activePatient.id] && drafts[activePatient.id].trim().length > 0 && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-xl text-[10px] font-bold mb-2 animate-fadeIn">
                <span className="flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rascunho auto-salvo em cache local ({drafts[activePatient.id].length} caracteres)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleInputChange('')}
                  className="text-amber-800 hover:text-amber-950 underline font-extrabold cursor-pointer"
                >
                  Descartar Rascunho
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={
                  isInternalComment
                    ? 'Digite uma nota interna para a equipe...'
                    : `Digite / para respostas rápidas ou mensagem para ${activePatient.name}...`
                }
                className="flex-1 py-2 px-3 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Patient RHS Panel & EHR Integration (380px) */}
        <div className="hidden lg:flex w-96 bg-white border-l border-slate-200 flex-col shrink-0 overflow-y-auto">
          {/* Patient Header */}
          <div className="p-3.5 border-b border-slate-100 text-center bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-purple-200 text-purple-900 font-extrabold text-base flex items-center justify-center mx-auto mb-1.5 ring-4 ring-purple-100">
              {activePatient.name.substring(0, 2).toUpperCase()}
            </div>
            <h3 className="text-sm font-bold text-slate-900">{activePatient.name}</h3>
            <p className="text-[11px] text-slate-500">{activePatient.phone}</p>
            <span className="inline-block text-[10px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full mt-1">
              {activePatient.insurance} • {activePatient.planType || 'Plano Básico'}
            </span>
          </div>

          {/* RHS Sub-tabs */}
          <div className="flex border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-white">
            <button
              onClick={() => setRhsTab('triagem')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1 ${
                rhsTab === 'triagem'
                  ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                  : 'border-transparent hover:bg-slate-50 text-slate-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Triagem</span>
            </button>
            <button
              onClick={() => setRhsTab('leadScore')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors flex items-center justify-center gap-1 ${
                rhsTab === 'leadScore'
                  ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                  : 'border-transparent hover:bg-slate-50 text-slate-500'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-500" />
              <span>Lead Score</span>
            </button>
            <button
              onClick={() => setRhsTab('pendencias')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                rhsTab === 'pendencias'
                  ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                  : 'border-transparent hover:bg-slate-50 text-slate-500'
              }`}
            >
              Pendências
            </button>
            <button
              onClick={() => setRhsTab('dados')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                rhsTab === 'dados'
                  ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                  : 'border-transparent hover:bg-slate-50 text-slate-500'
              }`}
            >
              Dados
            </button>
            <button
              onClick={() => setRhsTab('historico')}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                rhsTab === 'historico'
                  ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                  : 'border-transparent hover:bg-slate-50 text-slate-500'
              }`}
            >
              PEP
            </button>
          </div>

          {/* Tab 0: Triagem Inteligente IA & Auto-Tagging ML */}
          {rhsTab === 'triagem' && (
            <div className="p-3 space-y-3">
              <LeadQualifierWidget
                patient={activePatient}
                onUpdateLeadScore={(patientId, leadScore) => handleUpdateLeadScore(patientId, leadScore)}
                onInsertPitchToChat={handleInsertPitchToChat}
                onOpenSimulator={() => setShowLeadSimulatorModal(true)}
              />
              <AutoTaggingWidget
                patient={activePatient}
                messages={activeMessages}
                onApplyTags={(tags) => handleUpdatePatientTags(activePatient.id, tags)}
                showToast={showToast}
              />
              <AnaliseInteligente
                compact
                patientName={activePatient.name}
                patientInsurance={activePatient.insurance}
                patientHistory={activeMessages.slice(-5).map((m) => `${m.senderName || m.sender}: ${m.text}`).join(' | ')}
                initialMessage={activePatient.lastMessage}
                onApplyReply={(suggestedText) => {
                  setInputText(suggestedText);
                }}
              />
            </div>
          )}

          {/* Tab 0.5: Qualificador de Lead Dedicado */}
          {rhsTab === 'leadScore' && (
            <div className="p-3 space-y-3">
              <LeadQualifierWidget
                patient={activePatient}
                onUpdateLeadScore={(patientId, leadScore) => handleUpdateLeadScore(patientId, leadScore)}
                onInsertPitchToChat={handleInsertPitchToChat}
                onOpenSimulator={() => setShowLeadSimulatorModal(true)}
              />
            </div>
          )}

          {/* Tab 1: Pendências */}
          {rhsTab === 'pendencias' && (
            <div className="p-4 space-y-4">
              {/* Próxima Ação */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Próxima ação
                  </span>
                  <button className="text-[10px] text-purple-700 font-semibold hover:underline">
                    Editar
                  </button>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    {activePatient.nextAction || 'Responder dúvida de cobertura'}
                  </p>
                  <p className="text-[10px] text-rose-700 mt-1">
                    Responsável: {activePatient.assignedTo}
                  </p>
                  <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                    Vencida há 1h15
                  </span>
                </div>
              </div>

              {/* Jornada atual */}
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Jornada atual
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-[10px]">
                      ✓
                    </div>
                    <span>Triagem concluída (Hoje, 10:12)</span>
                  </div>

                  <div className="flex items-center space-x-2 text-purple-900 font-bold bg-purple-50 p-2 rounded-lg border border-purple-200">
                    <div className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px]">
                      2
                    </div>
                    <span>Horários e proposta (Etapa atual)</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-400">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
                      3
                    </div>
                    <span>Agendado</span>
                  </div>
                </div>

                <button className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <span>Avançar etapa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Checklist Obrigatório */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Checklist obrigatório
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activePatient.checklist?.filter((c) => c.completed).length || 0} de{' '}
                    {activePatient.checklist?.length || 0}
                  </span>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {activePatient.checklist?.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className={item.completed ? 'line-through text-slate-400' : 'font-medium'}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notas Internas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notas internas
                  </span>
                  <button className="text-[10px] text-purple-700 font-semibold hover:underline">
                    + Adicionar
                  </button>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  {activePatient.internalNotes?.map((note, idx) => (
                    <p key={idx} className="leading-snug">
                      • {note}
                    </p>
                  )) || <p className="text-slate-400 italic">Nenhuma nota registrada.</p>}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Dados */}
          {rhsTab === 'dados' && (
            <div className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">CPF</span>
                <p className="font-mono font-bold text-slate-800">
                  {activePatient.cpf || '321.654.987-00'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Data de Nascimento</span>
                <p className="font-bold text-slate-800">
                  {activePatient.birthDate || '14/05/1988'} (37 anos)
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Convênio / Carteirinha</span>
                <p className="font-bold text-purple-900">
                  {activePatient.insurance} ({activePatient.planType || 'Plano Padrão'})
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Nº 982.112.445-01 (Válido até 12/2027)
                </p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Endereço</span>
                <p className="text-slate-700">
                  Alameda Santos, 1200 - Apto 82, Jardins - São Paulo/SP
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Prontuário (PEP Integration) */}
          {rhsTab === 'historico' && (
            <div className="p-4 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  EHR
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Sincronizado com {activePatient.ehrSystem || 'iClinic'}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-mono">
                    ID: {activePatient.ehrRecordId || 'PEP-2025-0892'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Histórico de Atendimentos no Prontuário
                </span>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-[10px] font-bold text-purple-900 mb-1">
                      <span>Cardiologia • Retorno</span>
                      <span>15/01/2025</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Apresentou ecocardiograma sem alterações. Pressão 120x80 mmHg. Mantida medicação.
                    </p>
                    <a
                      href="#ehr"
                      className="text-[10px] font-bold text-purple-700 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      Abrir PDF no Prontuário Eletrônico <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-900 text-purple-100 rounded-xl text-[10px] space-y-1">
                <p className="font-bold text-amber-300">
                  🔒 Auditoria de Acesso a Dados Sensíveis
                </p>
                <p className="text-purple-200">
                  Acesso ao prontuário médico registrado no Log de Conformidade LGPD por Camila Santos.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE CHAT MODAL */}
      {isMobileChatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col md:hidden animate-fadeIn">
          <div className="flex-1 bg-[#f8f9fc] flex flex-col overflow-hidden">
            {/* Mobile Chat Header */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                <button
                  onClick={() => setIsMobileChatOpen(false)}
                  className="p-1.5 -ml-1 text-slate-600 hover:text-purple-700 hover:bg-slate-100 rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-900 font-bold text-xs flex items-center justify-center shrink-0">
                  {activePatient.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {activePatient.name}
                    </p>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.2 rounded-full flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      online
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    {activePatient.channel} • {activePatient.insurance}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => setMobileShowInfo(!mobileShowInfo)}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                    mobileShowInfo
                      ? 'bg-purple-700 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Ficha do paciente"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMobileChatOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile View Toggle Content: Either RHS Patient Info OR Chat Feed */}
            {mobileShowInfo ? (
              <div className="flex-1 overflow-y-auto bg-white p-4 space-y-4">
                {/* Header info */}
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-center">
                  <h3 className="text-sm font-bold text-purple-950">{activePatient.name}</h3>
                  <p className="text-xs text-purple-700">{activePatient.phone}</p>
                  <p className="text-[11px] font-semibold text-purple-900 mt-0.5">
                    {activePatient.insurance} • {activePatient.planType || 'Plano Padrão'}
                  </p>
                </div>

                {/* Sub-tabs inside mobile info */}
                <div className="flex border-b border-slate-200 text-xs font-bold text-slate-600 bg-white">
                  <button
                    onClick={() => setRhsTab('pendencias')}
                    className={`flex-1 py-2 text-center border-b-2 ${
                      rhsTab === 'pendencias'
                        ? 'border-purple-700 text-purple-900'
                        : 'border-transparent text-slate-400'
                    }`}
                  >
                    Pendências
                  </button>
                  <button
                    onClick={() => setRhsTab('dados')}
                    className={`flex-1 py-2 text-center border-b-2 ${
                      rhsTab === 'dados'
                        ? 'border-purple-700 text-purple-900'
                        : 'border-transparent text-slate-400'
                    }`}
                  >
                    Dados
                  </button>
                  <button
                    onClick={() => setRhsTab('historico')}
                    className={`flex-1 py-2 text-center border-b-2 ${
                      rhsTab === 'historico'
                        ? 'border-purple-700 text-purple-900'
                        : 'border-transparent text-slate-400'
                    }`}
                  >
                    Prontuário PEP
                  </button>
                </div>

                {/* Tab content inside mobile info */}
                {rhsTab === 'pendencias' && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                      <p className="font-bold text-rose-900 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        {activePatient.nextAction || 'Responder dúvida de cobertura'}
                      </p>
                      <p className="text-[10px] text-rose-700 mt-1">
                        Responsável: {activePatient.assignedTo}
                      </p>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="font-bold text-slate-900 mb-1">Checklist Obrigatório</p>
                      {activePatient.checklist?.map((item) => (
                        <label key={item.id} className="flex items-center space-x-2 text-slate-700">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklist(item.id)}
                            className="rounded text-purple-600"
                          />
                          <span className={item.completed ? 'line-through text-slate-400' : ''}>
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {rhsTab === 'dados' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">CPF</span>
                      <p className="font-mono font-bold text-slate-800">{activePatient.cpf || '321.654.987-00'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Convênio / Carteirinha</span>
                      <p className="font-bold text-purple-900">{activePatient.insurance}</p>
                    </div>
                  </div>
                )}

                {rhsTab === 'historico' && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="font-bold text-emerald-950">Sincronizado com {activePatient.ehrSystem || 'iClinic'}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setMobileShowInfo(false)}
                  className="w-full bg-purple-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs"
                >
                  Voltar para as mensagens
                </button>
              </div>
            ) : (
              <>
                {/* SLA Warning Banner */}
                {activePatient.slaWarning && (
                  <div className="bg-rose-500 text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold shrink-0">
                    <div className="flex items-center space-x-1.5 truncate">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{activePatient.slaWarning}</span>
                    </div>
                  </div>
                )}

                {/* E2EE Security Bar */}
                <div className="bg-purple-900 text-purple-100 px-3 py-1 text-[10px] flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    Criptografia E2EE Ativa
                  </span>
                  <span className="text-purple-300">Auditoria LGPD</span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {activeMessages.map((msg) => {
                    if (msg.sender === 'ai') {
                      return (
                        <div key={msg.id} className="bg-purple-50 border border-purple-200 rounded-2xl p-3 shadow-2xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center space-x-1.5">
                              <div className="w-5 h-5 rounded bg-purple-700 text-white flex items-center justify-center">
                                <Sparkles className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-purple-900">
                                {msg.senderName}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-purple-950 leading-snug bg-white p-2.5 rounded-xl border border-purple-100">
                            "{msg.text}"
                          </p>
                          <div className="mt-2 flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApplyAiSuggestion(msg.text)}
                              className="text-xs font-bold bg-purple-700 text-white px-2.5 py-1 rounded-lg"
                            >
                              Usar resposta
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const isPatient = msg.sender === 'patient';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isPatient ? 'items-start' : 'items-end'}`}>
                        <div
                          className={`max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed ${
                            isPatient
                              ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200 shadow-2xs'
                              : msg.isInternalComment
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 rounded-tr-xs'
                              : 'bg-purple-700 text-white rounded-tr-xs'
                          }`}
                        >
                          {msg.senderName && !isPatient && (
                            <p className={`text-[10px] font-bold mb-0.5 ${msg.isInternalComment ? 'text-amber-800' : 'text-purple-200'}`}>
                              {msg.senderName}
                            </p>
                          )}
                          <p>{msg.text}</p>
                          <span className={`text-[9px] block text-right mt-1 ${isPatient ? 'text-slate-400' : 'text-purple-200'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Input Bar */}
                <div className="p-2.5 bg-white border-t border-slate-200 shrink-0">
                  {/* Mobile Quick Chips */}
                  <div className="flex items-center gap-1 pb-1.5 overflow-x-auto text-[10px] no-scrollbar">
                    {templates.slice(0, 3).map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className="px-2 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-md font-bold shrink-0 truncate max-w-[110px]"
                      >
                        ⚡ {tpl.shortcut || tpl.title}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowManageTemplatesModal(true)}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold shrink-0"
                    >
                      + Todos
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center space-x-1.5 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded text-purple-600"
                      />
                      <span className={isInternalComment ? 'font-bold text-amber-800' : ''}>
                        Nota interna
                      </span>
                    </label>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setShowManageTemplatesModal(true)}
                        className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-bold flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                        Templates
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyAiSuggestion('Olá! Recebemos sua mensagem e já estamos verificando com a equipe médica.')}
                        className="text-[10px] text-purple-700 font-bold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        IA
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={isInternalComment ? 'Nota interna...' : 'Digite sua mensagem...'}
                      className="flex-1 py-2 px-3 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                    <button
                      type="submit"
                      className="bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-xl"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* TOAST FLOATING NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MANAGE QUICK REPLIES FULL REPOSITORY MODAL */}
      {showManageTemplatesModal && (
        <QuickReplyManager
          onClose={() => setShowManageTemplatesModal(false)}
          showToast={showToast}
          isModal={true}
        />
      )}

      {/* LEAD QUALIFIER & APPOINTMENT INTENTION SIMULATOR MODAL */}
      <LeadSimulatorModal
        isOpen={showLeadSimulatorModal}
        onClose={() => setShowLeadSimulatorModal(false)}
        onLeadCreated={(newPatient) => {
          setPatients((prev) => [newPatient, ...prev]);
          setSelectedPatientId(newPatient.id);
          showToast(`🔥 Lead ${newPatient.name} (Score ${newPatient.leadScore?.score}) adicionado e atribuído a ${newPatient.assignedTo}!`);
        }}
      />
    </div>
  );
};

