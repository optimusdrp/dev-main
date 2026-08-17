import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Plus,
  MoreHorizontal,
  ShieldAlert,
  CheckCircle2,
  Lock,
  X,
  Save,
  Check,
  Trash2,
  Webhook,
  Globe,
  Activity,
  Code2,
  Terminal,
  Send,
  AlertTriangle,
  RefreshCw,
  Copy,
  Key,
  FileText,
  MessageSquare,
  UserCheck,
  Calendar,
  ShieldCheck,
  Eye,
  Edit2,
  ExternalLink,
  Zap,
  ListFilter,
  CheckCheck,
  Stethoscope,
  Play,
  RotateCcw,
  ArrowUpRight,
  Filter,
  Clock,
  Layers
} from 'lucide-react';
import { AUTOMATION_RULES } from '../../data/mockData';
import { apiService } from '../../services/api';
import { WebhookConfig, WebhookLog, WebhookEvent } from '../../types';
import { AnaliseInteligente } from './AnaliseInteligente';

const PRESET_PAYLOADS: Record<WebhookEvent, object> = {
  'triage.completed': {
    event: 'triage.completed',
    timestamp: '2026-08-13T10:00:00Z',
    source: 'MediFlux AI Engine (Gemini 3.6 Flash)',
    patient: {
      id: 'p1',
      name: 'Ana Luíza Vasconcelos',
      phone: '(11) 98765-4321',
      insurance: 'Bradesco Saúde',
      specialty: 'Cardiologia',
    },
    triage: {
      urgency: 'alta',
      manchester_protocol: 'Vermelho - Emergência',
      ai_confidence: 0.98,
      symptoms: ['Dor torácica atípica', 'Falta de ar'],
      action_required: 'Alerta Plantão Médico + Fila Prioritária',
      suggested_response:
        'Olá Ana, registramos seus sintomas de emergência. Nosso médico de plantão está ciente e entraremos em contato em menos de 5 minutos.',
    },
  },
  'patient.stage_changed': {
    event: 'patient.stage_changed',
    timestamp: '2026-08-13T10:05:00Z',
    source: 'MediFlux CRM Pipeline',
    patient: {
      id: 'p3',
      name: 'Fernanda Lima Rocha',
      previousStage: 'triagem',
      newStage: 'documentos',
      insurance: 'SulAmérica',
      specialty: 'Cirurgia Geral',
    },
    executor: 'Atendente Priscila (IA Copilot)',
  },
  'chat.message_received': {
    event: 'chat.message_received',
    timestamp: '2026-08-13T10:10:00Z',
    source: 'WhatsApp Business API (Z-API / Evolution)',
    sender: {
      phone: '5511971238844',
      name: 'Carlos Eduardo Mendes',
    },
    message: {
      id: 'wamid.HBgLNTUxMTk3MTIzODg0N...',
      text: 'Boa tarde, gostaria de confirmar o horário da minha consulta amanhã com o ortopedista.',
      channel: 'WhatsApp',
    },
  },
  'ehr.synced': {
    event: 'ehr.synced',
    timestamp: '2026-08-13T10:15:00Z',
    source: 'MediFlux EHR Connector',
    system: 'iClinic / Feegow Integration',
    sync: {
      patientId: 'p2',
      recordNumber: 'EHR-2026-8819',
      status: 'COMPLETED',
      syncedFields: ['Anamnese', 'Atestado Médico', 'Receituário'],
    },
  },
  'patient.created': {
    event: 'patient.created',
    timestamp: '2026-08-13T10:20:00Z',
    source: 'MediFlux AI CRM Platform',
    patient: {
      id: 'p_new',
      name: 'João Victor Silva',
      phone: '(11) 95544-3322',
      insurance: 'Unimed',
      stage: 'triagem',
    },
  },
  'appointment.scheduled': {
    event: 'appointment.scheduled',
    timestamp: '2026-08-13T10:25:00Z',
    source: 'MediFlux Calendar Engine',
    appointment: {
      id: 'apt_9921',
      patientName: 'Juliana Rocha',
      specialty: 'Ginecologia',
      date: '2026-08-18',
      time: '14:30',
      doctor: 'Dra. Patricia Medeiros',
    },
  },
  'triage.accuracy_alert': {
    event: 'triage.accuracy_alert',
    timestamp: '2026-08-13T10:30:00Z',
    source: 'MediFlux AI Quality Monitor (Gemini 3.6 Flash)',
    metric: 'Taxa de Precisão da Triagem Médica',
    current_accuracy: 92.4,
    threshold_limit: 95.0,
    status: 'ALERT_TRIGGERED',
    evaluation_window: 'Últimas 24 horas (100 triagens)',
    message: 'Atenção: A taxa de precisão da triagem da IA (92.4%) caiu abaixo do limite crítico de 95.0%.',
    recommendation: 'Revisar divergências no protocolo de Manchester e recalibrar sensibilidade médica.',
  },
};

export const AutomacoesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agent' | 'triage' | 'webhooks'>('agent');
  const [simPatientName, setSimPatientName] = useState('Mariana Oliveira');
  const [simInsurance, setSimInsurance] = useState('Bradesco Saúde Top');
  const [simHistory, setSimHistory] = useState('02/08/2026: Cirurgia de colecistectomia videolaparoscópica sem intercorrências. | 05/08/2026: Retorno telefônico confirmando boa evolução sem dor.');
  const [simMessage, setSimMessage] = useState('Olá doutor! Operei faz 3 dias e hoje comecei a sentir uma dor muito forte no abdômen, acompanhada de febre de 38,4°C e enjoo. O que devo fazer?');

  // IA Agent & Rules State
  const [toggles, setToggles] = useState({
    sugerirRespostas: true,
    lerCarteirinhas: true,
    moverEventos: true,
    negociarValores: false,
  });

  // Configuração de Alerta de Métricas de Sucesso da IA (Triagem)
  const [aiAccuracyAlertEnabled, setAiAccuracyAlertEnabled] = useState(true);
  const [aiAccuracyThreshold, setAiAccuracyThreshold] = useState(95); // 95%
  const [aiAccuracyWebhookId, setAiAccuracyWebhookId] = useState<string>('wh1');
  const [aiAccuracyEvaluationWindow, setAiAccuracyEvaluationWindow] = useState('Últimas 24h (ou 100 triagens)');
  const [currentAiAccuracyRate, setCurrentAiAccuracyRate] = useState(98.6);
  const [isSimulatingAccuracyAlert, setIsSimulatingAccuracyAlert] = useState(false);

  const [automations, setAutomations] = useState(AUTOMATION_RULES);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState('Novo contato via WhatsApp');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Webhook State
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);

  // Form state for Webhook Modal
  const [whName, setWhName] = useState('');
  const [whUrl, setWhUrl] = useState('');
  const [whSecret, setWhSecret] = useState('');
  const [whEvents, setWhEvents] = useState<WebhookEvent[]>([
    'patient.created',
    'patient.stage_changed',
  ]);
  const [whStatus, setWhStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  // Test Inspector & Logs Modals
  const [inspectingLog, setInspectingLog] = useState<WebhookLog | null>(null);
  const [isLogsHistoryOpen, setIsLogsHistoryOpen] = useState(false);
  const [isTestingWebhookId, setIsTestingWebhookId] = useState<string | null>(null);

  // Interactive Webhook Tester Panel State
  const [testWebhookId, setTestWebhookId] = useState<string>('');
  const [testEvent, setTestEvent] = useState<WebhookEvent>('triage.completed');
  const [testPayloadJson, setTestPayloadJson] = useState<string>(
    JSON.stringify(PRESET_PAYLOADS['triage.completed'], null, 2)
  );
  const [isDispatchingTest, setIsDispatchingTest] = useState<boolean>(false);
  const [lastTestResult, setLastTestResult] = useState<WebhookLog | null>(null);
  const [logFilterStatus, setLogFilterStatus] = useState<'all' | 'success' | 'error'>('all');

  const [toast, setToast] = useState<string | null>(null);
  const [searchWebhookQuery, setSearchWebhookQuery] = useState('');

  // Fetch Automations & Webhooks from API
  useEffect(() => {
    async function loadData() {
      const [autoData, whData, logData] = await Promise.all([
        apiService.getAutomations(),
        apiService.getWebhooks(),
        apiService.getWebhookLogs(),
      ]);

      if (autoData && autoData.length > 0) setAutomations(autoData);
      if (whData && whData.length > 0) {
        setWebhooks(whData);
        setTestWebhookId(whData[0].id);
      }
      if (logData && logData.length > 0) setWebhookLogs(logData);
    }
    loadData();
  }, []);

  const loadPresetPayload = (evt: WebhookEvent) => {
    setTestEvent(evt);
    const preset = PRESET_PAYLOADS[evt] || PRESET_PAYLOADS['triage.completed'];
    setTestPayloadJson(JSON.stringify(preset, null, 2));
    showToast(`Template de payload para "${evt}" carregado!`);
  };

  const handleRunPanelTest = async () => {
    const selectedWh = webhooks.find((w) => w.id === testWebhookId) || webhooks[0];
    if (!selectedWh) {
      showToast('Nenhum webhook cadastrado para testar. Crie um webhook primeiro.');
      return;
    }

    let parsedPayloadObj: any;
    try {
      parsedPayloadObj = JSON.parse(testPayloadJson);
    } catch (e) {
      showToast('❌ O Payload JSON informado possui erros de sintaxe!');
      return;
    }

    setIsDispatchingTest(true);
    const result = await apiService.testWebhook(selectedWh.id, testEvent);
    setIsDispatchingTest(false);

    if (result) {
      const customLog: WebhookLog = {
        ...result.log,
        requestPayload: JSON.stringify(parsedPayloadObj, null, 2),
      };

      setLastTestResult(customLog);
      setWebhookLogs((prev) => [customLog, ...prev]);
      setWebhooks((prev) => prev.map((w) => (w.id === result.webhook.id ? result.webhook : w)));
      showToast(`⚡ Teste disparado com sucesso! Status HTTP ${result.log.statusCode}`);
    } else {
      showToast('Erro ao realizar disparo do webhook');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado para a área de transferência!`);
  };

  // AI ACCURACY ALERT TRIGGER HANDLERS
  const handleSaveAiAccuracyAlertConfig = () => {
    const targetWh = webhooks.find((w) => w.id === aiAccuracyWebhookId) || webhooks[0];
    showToast(
      `✅ Configuração salva! Notificar via "${targetWh?.name || 'Webhook'}" se a taxa de precisão da IA cair abaixo de ${aiAccuracyThreshold}%.`
    );
  };

  const handleTestAiAccuracyAlertWebhook = async () => {
    const targetWh = webhooks.find((w) => w.id === aiAccuracyWebhookId) || webhooks[0];
    if (!targetWh) {
      showToast('⚠️ Nenhum webhook cadastrado para receber o alerta. Crie um webhook primeiro.');
      return;
    }

    setIsSimulatingAccuracyAlert(true);
    const simulatedDropRate = currentAiAccuracyRate < aiAccuracyThreshold ? currentAiAccuracyRate : (aiAccuracyThreshold - 2.6).toFixed(1);

    const alertPayload = {
      event: 'triage.accuracy_alert',
      timestamp: new Date().toISOString(),
      source: 'MediFlux AI Quality Engine (Gemini 3.6 Flash)',
      metric: 'Taxa de Precisão / Assertividade da Triagem Médica',
      current_accuracy: parseFloat(simulatedDropRate as string),
      threshold_limit: aiAccuracyThreshold,
      status: 'ALERT_TRIGGERED',
      evaluation_window: aiAccuracyEvaluationWindow,
      message: `🚨 ALERTA DE QUEDA DE DESEMPENHO DA IA: A taxa de precisão da triagem (${simulatedDropRate}%) caiu abaixo do limite de ${aiAccuracyThreshold}%.`,
      action_recommended: 'Revisar divergências no protocolo de Manchester e recalibrar sensibilidade do prompt.',
    };

    const result = await apiService.testWebhook(targetWh.id, 'triage.accuracy_alert');
    setIsSimulatingAccuracyAlert(false);

    if (result) {
      const customLog: WebhookLog = {
        ...result.log,
        event: 'triage.accuracy_alert',
        requestPayload: JSON.stringify(alertPayload, null, 2),
      };
      setLastTestResult(customLog);
      setWebhookLogs((prev) => [customLog, ...prev]);
      showToast(`🚨 Disparo de teste de Alerta de Precisão enviado para "${targetWh.name}" (Status HTTP ${result.log.statusCode})!`);
    } else {
      showToast('⚠️ Erro ao disparar alerta via webhook.');
    }
  };

  // AUTOMATION RULES HANDLERS
  const toggleAutomation = async (id: string) => {
    const target = automations.find((a) => a.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Ativa' ? 'Pausada' : 'Ativa';

    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );

    await apiService.updateAutomation(id, { status: nextStatus });
    showToast('Status da automação alterado');
  };

  const handleAddAutomation = async () => {
    if (!newRuleName.trim()) return;

    const created = await apiService.createAutomation({
      name: newRuleName,
      trigger: newRuleTrigger,
      status: 'Ativa',
      successRate: '100% (0 execuções)',
    });

    if (created) {
      setAutomations([created, ...automations]);
      showToast(`Automação "${created.name}" criada com sucesso!`);
    } else {
      const fallbackRule = {
        id: `a${Date.now()}`,
        name: newRuleName,
        trigger: newRuleTrigger,
        status: 'Ativa',
        successRate: '100% (0 execuções)',
      };
      setAutomations([fallbackRule, ...automations]);
      showToast(`Automação "${fallbackRule.name}" criada!`);
    }

    setNewRuleName('');
    setIsNewModalOpen(false);
  };

  const handleDeleteAutomation = (id: string) => {
    setAutomations(automations.filter((a) => a.id !== id));
    setActiveMenuId(null);
    showToast('Automação excluída');
  };

  // WEBHOOK HANDLERS
  const handleOpenNewWebhookModal = () => {
    setEditingWebhook(null);
    setWhName('');
    setWhUrl('https://n8n.mediflux.com.br/webhook/');
    setWhSecret(`whsec_${Math.random().toString(36).substring(2, 12)}`);
    setWhEvents(['patient.created', 'patient.stage_changed', 'ehr.synced']);
    setWhStatus('Ativo');
    setIsWebhookModalOpen(true);
  };

  const handleOpenEditWebhookModal = (wh: WebhookConfig) => {
    setEditingWebhook(wh);
    setWhName(wh.name);
    setWhUrl(wh.url);
    setWhSecret(wh.secret);
    setWhEvents(wh.events || []);
    setWhStatus(wh.status);
    setIsWebhookModalOpen(true);
  };

  const handleSaveWebhook = async () => {
    if (!whName.trim() || !whUrl.trim()) {
      showToast('Preencha o nome e a URL de destino do webhook');
      return;
    }

    if (whEvents.length === 0) {
      showToast('Selecione ao menos um evento de assinatura');
      return;
    }

    if (editingWebhook) {
      // Update existing webhook
      const updated = await apiService.updateWebhook(editingWebhook.id, {
        name: whName,
        url: whUrl,
        secret: whSecret,
        events: whEvents,
        status: whStatus,
      });

      if (updated) {
        setWebhooks((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
        showToast(`Webhook "${whName}" atualizado com sucesso!`);
      } else {
        setWebhooks((prev) =>
          prev.map((w) =>
            w.id === editingWebhook.id
              ? { ...w, name: whName, url: whUrl, secret: whSecret, events: whEvents, status: whStatus }
              : w
          )
        );
        showToast('Webhook atualizado!');
      }
    } else {
      // Create new webhook
      const created = await apiService.createWebhook({
        name: whName,
        url: whUrl,
        secret: whSecret,
        events: whEvents,
        status: whStatus,
      });

      if (created) {
        setWebhooks([created, ...webhooks]);
        showToast(`Webhook "${created.name}" registrado com sucesso!`);
      } else {
        const fallback: WebhookConfig = {
          id: `wh_${Date.now()}`,
          name: whName,
          url: whUrl,
          secret: whSecret,
          events: whEvents,
          status: whStatus,
          lastTriggered: 'Nunca',
          failureCount: 0,
          createdAt: new Date().toLocaleString('pt-BR'),
        };
        setWebhooks([fallback, ...webhooks]);
        showToast('Webhook registrado com sucesso!');
      }
    }

    setIsWebhookModalOpen(false);
  };

  const toggleWebhookStatus = async (wh: WebhookConfig) => {
    const nextStatus = wh.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setWebhooks((prev) =>
      prev.map((w) => (w.id === wh.id ? { ...w, status: nextStatus } : w))
    );
    await apiService.updateWebhook(wh.id, { status: nextStatus });
    showToast(`Webhook "${wh.name}" está agora ${nextStatus}`);
  };

  const handleDeleteWebhook = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o webhook "${name}"?`)) return;
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    await apiService.deleteWebhook(id);
    showToast('Webhook removido com sucesso!');
  };

  const handleTestWebhook = async (wh: WebhookConfig) => {
    setIsTestingWebhookId(wh.id);
    const result = await apiService.testWebhook(wh.id);
    setIsTestingWebhookId(null);

    if (result) {
      setWebhooks((prev) => prev.map((w) => (w.id === result.webhook.id ? result.webhook : w)));
      setInspectingLog(result.log);
      setWebhookLogs((prev) => [result.log, ...prev]);
      showToast(`⚡ Teste enviado com sucesso para ${wh.name}!`);
    } else {
      showToast('Erro ao realizar disparo de teste');
    }
  };

  const toggleEventSelection = (event: WebhookEvent) => {
    if (whEvents.includes(event)) {
      setWhEvents(whEvents.filter((e) => e !== event));
    } else {
      setWhEvents([...whEvents, event]);
    }
  };

  const filteredWebhooks = webhooks.filter(
    (w) =>
      w.name.toLowerCase().includes(searchWebhookQuery.toLowerCase()) ||
      w.url.toLowerCase().includes(searchWebhookQuery.toLowerCase()) ||
      w.events.some((e) => e.toLowerCase().includes(searchWebhookQuery.toLowerCase()))
  );

  return (
    <div className="p-4 lg:p-6 space-y-6 bg-[#f8f9fc] min-h-screen relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-purple-700 flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header & Main Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Automações & Webhooks
            </h1>
            <span className="text-[10px] font-extrabold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
              MediFlux Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie o Agente IA autônomo e configure webhooks REST para integrar prontuários (PEP) e WhatsApp.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex flex-wrap items-center gap-1 border border-slate-300/50 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'agent'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-700" />
            <span>Agente IA & Regras</span>
          </button>

          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'triage'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-700 animate-pulse" />
            <span>Módulo de Triagem IA</span>
            <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-amber-200">
              Gemini 3.6
            </span>
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'webhooks'
                ? 'bg-white text-purple-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Webhook className="w-4 h-4 text-purple-700" />
            <span>Gerenciador de Webhooks</span>
            <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {webhooks.filter((w) => w.status === 'Ativo').length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: IA AGENT & AUTOMATION RULES */}
      {activeTab === 'agent' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Subheader Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
              CONTROLE E SEGURANÇA
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Agente de Inteligência Artificial MediFlux
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhe as sugestões clínicas em tempo real, execuções autônomas e defina travas operacionais.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Agente IA Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900">Agente IA em Produção</h3>

              {/* Status Box */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      Operando normalmente
                    </p>
                    <p className="text-[10px] text-emerald-700">
                      Modelo: Gemini 3.6 Flash Active
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              </div>

              {/* 3 Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <p className="text-xl font-black text-slate-900">23</p>
                  <p className="text-[9px] font-semibold text-slate-500">Sugestões hoje</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <p className="text-xl font-black text-slate-900">14</p>
                  <p className="text-[9px] font-semibold text-slate-500">Ações automáticas</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <p className="text-xl font-black text-slate-900">2</p>
                  <p className="text-[9px] font-semibold text-slate-500">Aguardando aprovação</p>
                </div>
              </div>

              {/* Limites de Atuação Toggles */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900">Limites de atuação</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Sugerir respostas</p>
                      <p className="text-[10px] text-slate-400">Permitido via Copilot</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={toggles.sugerirRespostas}
                      onChange={(e) =>
                        setToggles({ ...toggles, sugerirRespostas: e.target.checked })
                      }
                      className="w-10 h-5 accent-purple-700 rounded-full cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Ler carteirinhas OCR</p>
                      <p className="text-[10px] text-slate-400">Extração de guia TISS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={toggles.lerCarteirinhas}
                      onChange={(e) =>
                        setToggles({ ...toggles, lerCarteirinhas: e.target.checked })
                      }
                      className="w-10 h-5 accent-purple-700 rounded-full cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Mover por evento objetivo</p>
                      <p className="text-[10px] text-slate-400">Mudança de etapa no funil</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={toggles.moverEventos}
                      onChange={(e) =>
                        setToggles({ ...toggles, moverEventos: e.target.checked })
                      }
                      className="w-10 h-5 accent-purple-700 rounded-full cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80">
                    <div>
                      <p className="text-xs font-bold text-amber-950">Negociar valores</p>
                      <p className="text-[10px] text-amber-800 font-medium">Exige aprovação humana</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={toggles.negociarValores}
                      onChange={(e) =>
                        setToggles({ ...toggles, negociarValores: e.target.checked })
                      }
                      className="w-10 h-5 accent-amber-600 rounded-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Automações Ativas List */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Automações de Atendimento</h3>
                  <p className="text-xs text-slate-400">
                    Gatilhos de mensagem, lembretes e pós-atendimento
                  </p>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova automação</span>
                </button>
              </div>

              <div className="space-y-3">
                {automations.map((auto) => (
                  <div
                    key={auto.id}
                    className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{auto.name}</p>
                        <p className="text-[10px] text-slate-500">{auto.trigger}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-slate-500 font-mono text-[11px]">
                        {auto.successRate}
                      </span>
                      <button
                        onClick={() => toggleAutomation(auto.id)}
                        className={`font-extrabold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                          auto.status === 'Ativa'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {auto.status}
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === auto.id ? null : auto.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {activeMenuId === auto.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                            <button
                              onClick={() => {
                                toggleAutomation(auto.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                              <span>Pausar/Ativar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAutomation(auto.id)}
                              className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-700 font-semibold flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MÓDULO DE TRIAGEM COM IA (GEMINI API) */}
      {activeTab === 'triage' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white p-6 rounded-3xl shadow-xl border border-purple-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-amber-400 text-purple-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Gemini 3.6 Flash Engine
                  </span>
                  <span className="text-[10px] font-bold bg-purple-800/80 text-purple-200 px-2 py-0.5 rounded-full">
                    Protocolo de Manchester Adaptado
                  </span>
                </div>
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-amber-300" />
                  Módulo de Triagem Inicial Autônoma com IA
                </h2>
                <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">
                  Analise mensagens recebidas via WhatsApp, determine a urgência clínica em tempo real, gere protocolos de atendimento imediato e receba sugestões de respostas personalizadas baseadas no histórico do paciente.
                </p>
              </div>

              {/* Triage Stats */}
              <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center shrink-0">
                <div>
                  <p className="text-lg font-black text-amber-300">184</p>
                  <p className="text-[9px] text-purple-200 font-semibold uppercase">Triagens/mês</p>
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-300">98.6%</p>
                  <p className="text-[9px] text-purple-200 font-semibold uppercase">Assertividade</p>
                </div>
                <div>
                  <p className="text-lg font-black text-cyan-300">1.2s</p>
                  <p className="text-[9px] text-purple-200 font-semibold uppercase">Tempo resposta</p>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="pt-2 border-t border-purple-800/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-purple-200 mr-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Testar casos de exemplo:
              </span>
              <button
                onClick={() => {
                  setSimPatientName('Mariana Oliveira');
                  setSimInsurance('Bradesco Saúde Top');
                  setSimHistory('02/08/2026: Cirurgia de colecistectomia laparoscópica. | 05/08/2026: Boa evolução inicial sem queixas.');
                  setSimMessage('Olá! Operei faz 3 dias e hoje comecei a sentir uma dor abdominal muito forte e febre de 38,4°C. O que devo fazer?');
                  showToast('Caso de emergência carregado para simulação!');
                }}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                🚨 Caso 1: Urgência Pós-Cirúrgica
              </button>

              <button
                onClick={() => {
                  setSimPatientName('Carlos Eduardo Santos');
                  setSimInsurance('Unimed Nacional');
                  setSimHistory('10/08/2026: Consulta dermatológica. Prescrito Amoxicilina 500mg de 8h em 8h por 7 dias. Alergia prévia a Sulfa.');
                  setSimMessage('Boa tarde! Estou tomando o remédio que o médico passou, mas estou com dúvida se posso tomar após o almoço porque me deu um pouco de enjoo.');
                  showToast('Caso de dúvida médica carregado para simulação!');
                }}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                ⚠️ Caso 2: Dúvida de Medicação
              </button>

              <button
                onClick={() => {
                  setSimPatientName('Fernanda Lima');
                  setSimInsurance('SulAmérica Especial');
                  setSimHistory('15/07/2026: Exame de check-up de rotina. Orientada a agendar retorno em 30 dias com resultados de sangue.');
                  setSimMessage('Olá meninas da recepção! Gostaria de agendar minha consulta de retorno para a próxima terça-feira à tarde, por favor.');
                  showToast('Caso de rotina carregado para simulação!');
                }}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                ✅ Caso 3: Agendamento Rotina
              </button>
            </div>
          </div>

          {/* AI SUCCESS METRICS ALERT TRIGGER CONFIGURATION CARD */}
          <div id="secao-gatilhos-alerta-ia" className="bg-white p-5 lg:p-6 rounded-3xl border border-purple-200 shadow-md space-y-5 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black bg-purple-900 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-300" />
                    Monitoramento de Qualidade & SLA de IA
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                    currentAiAccuracyRate >= aiAccuracyThreshold
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                  }`}>
                    {currentAiAccuracyRate >= aiAccuracyThreshold ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Status: Normal ({currentAiAccuracyRate}% de Precisão)
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Status: Alerta Ativado ({currentAiAccuracyRate}% &lt; {aiAccuracyThreshold}%)
                      </>
                    )}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-700" />
                  Gatilho de Alerta por Métricas de Sucesso da IA (Notificação via Webhook)
                </h3>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Configure alertas automáticos baseados nas métricas de desempenho do modelo Gemini. Se a taxa de precisão da triagem médica cair abaixo do limite estabelecido, o sistema notificará instantaneamente seus endpoints de integração REST (N8N, Zapier, Make).
                </p>
              </div>

              {/* Toggle Enable/Disable Switch */}
              <div className="flex items-center gap-3 bg-purple-50/80 p-3 rounded-2xl border border-purple-100 shrink-0">
                <div>
                  <p className="text-xs font-extrabold text-purple-950">Gatilho de Alerta</p>
                  <p className="text-[10px] text-purple-700 font-semibold">
                    {aiAccuracyAlertEnabled ? 'Ativado em Tempo Real' : 'Pausado'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAiAccuracyAlertEnabled(!aiAccuracyAlertEnabled);
                    showToast(`Gatilho de alerta ${!aiAccuracyAlertEnabled ? 'ativado' : 'pausado'}.`);
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    aiAccuracyAlertEnabled ? 'bg-purple-700' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-xs ${
                      aiAccuracyAlertEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Threshold Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Box 1: Threshold Range Slider & Value */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Limite Mínimo Tolerado (Threshold)
                  </label>
                  <span className="text-sm font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-lg border border-purple-200 font-mono">
                    {aiAccuracyThreshold}%
                  </span>
                </div>

                <input
                  type="range"
                  min={70}
                  max={99}
                  step={1}
                  value={aiAccuracyThreshold}
                  onChange={(e) => setAiAccuracyThreshold(Number(e.target.value))}
                  className="w-full accent-purple-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <p className="text-[11px] text-slate-500 leading-tight">
                  Se a taxa de assertividade da triagem cair para menos de <strong className="text-purple-900">{aiAccuracyThreshold}%</strong>, um evento REST será disparado imediatamente.
                </p>
              </div>

              {/* Box 2: Target Webhook Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                  <Webhook className="w-4 h-4 text-purple-700" />
                  Webhook de Destino do Alerta
                </label>

                <select
                  value={aiAccuracyWebhookId}
                  onChange={(e) => setAiAccuracyWebhookId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  {webhooks.length === 0 ? (
                    <option value="wh1">N8N - Notificação de Mudança de Etapa em Prontuários</option>
                  ) : (
                    webhooks.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.status})
                      </option>
                    ))
                  )}
                </select>

                <p className="text-[11px] text-slate-500 leading-tight">
                  Evento transmitido: <code className="bg-purple-100 text-purple-900 font-mono px-1 rounded text-[10px]">triage.accuracy_alert</code>
                </p>
              </div>

              {/* Box 3: Evaluation Window & Simulation Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <label className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Janela de Avaliação das Métricas
                </label>

                <select
                  value={aiAccuracyEvaluationWindow}
                  onChange={(e) => setAiAccuracyEvaluationWindow(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="Últimas 24h (ou 100 triagens)">Últimas 24 horas (ou 100 triagens)</option>
                  <option value="Média móvel de 12 horas">Média móvel de 12 horas</option>
                  <option value="Últimas 50 triagens concluídas">Últimas 50 triagens concluídas</option>
                  <option value="Em tempo real (Qualquer divergência crítica)">Em tempo real (Qualquer divergência crítica)</option>
                </select>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                  <span>Assertividade Atual: <strong className="text-slate-900 font-bold">{currentAiAccuracyRate}%</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentAiAccuracyRate >= aiAccuracyThreshold) {
                        setCurrentAiAccuracyRate(92.4); // simulate drop below threshold
                        showToast(`⚠️ Taxa de precisão da IA simulada em 92.4% (Abaixo do limite de ${aiAccuracyThreshold}%)!`);
                      } else {
                        setCurrentAiAccuracyRate(98.6); // restore normal
                        showToast(`🟢 Taxa de precisão da IA restaurada para 98.6% (Normal).`);
                      }
                    }}
                    className="text-[10px] font-extrabold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                  >
                    {currentAiAccuracyRate >= aiAccuracyThreshold ? 'Simular Queda (< Limite)' : 'Restaurar Normal (98.6%)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Event Payload Preview & Action Bar */}
            <div className="bg-purple-950/90 text-purple-100 p-4 rounded-2xl border border-purple-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Code2 className="w-4 h-4" />
                  Estrutura do Payload REST Enviado via Webhook quando o Gatilho Dispara
                </span>
                <span className="text-[10px] text-purple-300 font-mono">
                  HTTP POST • Content-Type: application/json
                </span>
              </div>

              <pre className="bg-slate-950 p-3 rounded-xl border border-purple-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-36 scrollbar-thin">
                {JSON.stringify(
                  {
                    event: 'triage.accuracy_alert',
                    timestamp: new Date().toISOString(),
                    source: 'MediFlux AI Quality Monitor (Gemini 3.6 Flash)',
                    metric: 'Taxa de Precisão da Triagem Médica',
                    current_accuracy: currentAiAccuracyRate < aiAccuracyThreshold ? currentAiAccuracyRate : 92.4,
                    threshold_limit: aiAccuracyThreshold,
                    status: 'ALERT_TRIGGERED',
                    evaluation_window: aiAccuracyEvaluationWindow,
                    webhook_target_id: aiAccuracyWebhookId,
                    message: `Atenção: A taxa de precisão da triagem (${currentAiAccuracyRate < aiAccuracyThreshold ? currentAiAccuracyRate : 92.4}%) caiu abaixo do limite de ${aiAccuracyThreshold}%.`,
                    recommendation: 'Revisar divergências no protocolo de Manchester e recalibrar sensibilidade do prompt.',
                  },
                  null,
                  2
                )}
              </pre>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-purple-800/60">
                <div className="text-[11px] text-purple-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Validação com assinatura digital HMAC SHA-256 no cabeçalho <code className="text-amber-300 font-mono">X-MediFlux-Signature</code>.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isSimulatingAccuracyAlert}
                    onClick={handleTestAiAccuracyAlertWebhook}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSimulatingAccuracyAlert ? 'animate-spin' : ''}`} />
                    <span>{isSimulatingAccuracyAlert ? 'Disparando...' : 'Testar Disparo de Alerta via Webhook'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAiAccuracyAlertConfig}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Configuração de Alerta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Context Setup & Patient Data */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Contexto do Paciente</h3>
                  <p className="text-[10px] text-slate-400">Histórico para fundamentar a IA</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nome do Paciente
                  </label>
                  <input
                    type="text"
                    value={simPatientName}
                    onChange={(e) => setSimPatientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Convênio / Plano de Saúde
                  </label>
                  <input
                    type="text"
                    value={simInsurance}
                    onChange={(e) => setSimInsurance(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Histórico Clínico e Consultas Anteriores
                  </label>
                  <textarea
                    rows={4}
                    value={simHistory}
                    onChange={(e) => setSimHistory(e.target.value)}
                    placeholder="Ex: 02/08: Cirurgia. 05/08: Retorno sem dor..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                  />
                </div>
              </div>

              {/* Threshold Rules Card */}
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 space-y-3 pt-3">
                <p className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  Regras de Automação por Grau
                </p>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-rose-200 text-rose-900">
                    <span className="font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      Alta Urgência
                    </span>
                    <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded font-extrabold">
                      Alerta Plantão Médico
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-200 text-amber-900">
                    <span className="font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Média Urgência
                    </span>
                    <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded font-bold">
                      Fila Prioritária
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-emerald-200 text-emerald-900">
                    <span className="font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Baixa Urgência
                    </span>
                    <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded font-bold">
                      Resposta Autônoma OK
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Gemini Triage Simulator Component */}
            <div className="lg:col-span-2 space-y-4">
              <AnaliseInteligente
                patientName={simPatientName}
                patientInsurance={simInsurance}
                patientHistory={simHistory}
                initialMessage={simMessage}
                onApplyReply={(suggestedReply) => {
                  showToast(`Resposta copiada! Pronta para envio ao WhatsApp de ${simPatientName}`);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GERENCIADOR DE WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Endpoints Ativos</p>
                <p className="text-xl font-black text-slate-900">
                  {webhooks.filter((w) => w.status === 'Ativo').length} / {webhooks.length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Eventos Monitorados</p>
                <p className="text-sm font-bold text-slate-900">Prontuários & WhatsApp</p>
                <p className="text-[10px] text-slate-500">Notificações em tempo real</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Segurança de Assinatura</p>
                <p className="text-sm font-bold text-slate-900">HMAC SHA-256 Enabled</p>
                <p className="text-[10px] text-slate-500">Header: X-MediFlux-Signature</p>
              </div>
            </div>
          </div>

          {/* INTERACTIVE WEBHOOK TESTING & AI DEBUGGING PANEL */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-purple-800/60 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-800/80 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-amber-400 text-purple-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Ambiente de Testes & Live Inspection
                  </span>
                  <span className="text-[10px] font-bold bg-purple-800/80 text-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    Debugger de Integração de IA
                  </span>
                </div>
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Painel de Testes de Webhooks e Logs em Tempo Real
                </h2>
                <p className="text-xs text-purple-200/90 max-w-2xl leading-relaxed">
                  Dispare payloads customizados de eventos de IA (triagem, prontuários, mensagens) para validar seus endpoints HTTP POST e inspecionar os logs de resposta (Status Code, Latência e Body).
                </p>
              </div>

              {/* Status Code Legend */}
              <div className="flex items-center gap-2 bg-purple-900/60 p-2.5 rounded-2xl border border-purple-700/50 text-[11px] shrink-0">
                <span className="flex items-center gap-1 text-emerald-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  2xx OK
                </span>
                <span className="text-purple-400">•</span>
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  4xx Erro
                </span>
                <span className="text-purple-400">•</span>
                <span className="flex items-center gap-1 text-rose-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  5xx Falha
                </span>
              </div>
            </div>

            {/* Panel Grid: Test Dispatcher (Left) & Request Logs Feed (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Dispatcher Form & Payload Editor (7 cols) */}
              <div className="lg:col-span-7 bg-white/5 p-4 md:p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-amber-400" />
                    1. Configurar Disparo de Teste
                  </span>
                  <span className="text-[10px] text-purple-300">Formato: JSON Standard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Select Target Webhook */}
                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Endpoint de Webhook Alvo
                    </label>
                    <select
                      value={testWebhookId}
                      onChange={(e) => setTestWebhookId(e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 border border-purple-700/60 rounded-xl p-2 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    >
                      {webhooks.length === 0 ? (
                        <option value="">Nenhum webhook cadastrado</option>
                      ) : (
                        webhooks.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.status})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Select Event */}
                  <div>
                    <label className="block text-[11px] font-bold text-purple-200 mb-1">
                      Evento de IA Notificado
                    </label>
                    <select
                      value={testEvent}
                      onChange={(e) => loadPresetPayload(e.target.value as WebhookEvent)}
                      className="w-full bg-slate-800 text-slate-100 border border-purple-700/60 rounded-xl p-2 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    >
                      <option value="triage.completed">🤖 triage.completed (Triagem IA)</option>
                      <option value="triage.accuracy_alert">🚨 triage.accuracy_alert (Alerta Precisão IA)</option>
                      <option value="patient.stage_changed">📋 patient.stage_changed (Jornada)</option>
                      <option value="chat.message_received">💬 chat.message_received (WhatsApp)</option>
                      <option value="ehr.synced">📂 ehr.synced (Prontuário Sync)</option>
                      <option value="patient.created">👤 patient.created (Novo Paciente)</option>
                      <option value="appointment.scheduled">📅 appointment.scheduled (Consulta)</option>
                    </select>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-purple-200">
                    Carregar Template de Payload Rápido:
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => loadPresetPayload('triage.accuracy_alert')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        testEvent === 'triage.accuracy_alert'
                          ? 'bg-rose-400 text-purple-950 border-rose-300 shadow-xs font-black'
                          : 'bg-purple-900/50 text-rose-200 border-purple-700/50 hover:bg-purple-800/60'
                      }`}
                    >
                      🚨 Alerta Precisão IA
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPresetPayload('triage.completed')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        testEvent === 'triage.completed'
                          ? 'bg-amber-400 text-purple-950 border-amber-300 shadow-xs'
                          : 'bg-purple-900/50 text-purple-200 border-purple-700/50 hover:bg-purple-800/60'
                      }`}
                    >
                      🤖 Triagem IA
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPresetPayload('patient.stage_changed')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        testEvent === 'patient.stage_changed'
                          ? 'bg-amber-400 text-purple-950 border-amber-300 shadow-xs'
                          : 'bg-purple-900/50 text-purple-200 border-purple-700/50 hover:bg-purple-800/60'
                      }`}
                    >
                      📋 Mudança de Etapa
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPresetPayload('chat.message_received')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        testEvent === 'chat.message_received'
                          ? 'bg-amber-400 text-purple-950 border-amber-300 shadow-xs'
                          : 'bg-purple-900/50 text-purple-200 border-purple-700/50 hover:bg-purple-800/60'
                      }`}
                    >
                      💬 Msg WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPresetPayload('ehr.synced')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        testEvent === 'ehr.synced'
                          ? 'bg-amber-400 text-purple-950 border-amber-300 shadow-xs'
                          : 'bg-purple-900/50 text-purple-200 border-purple-700/50 hover:bg-purple-800/60'
                      }`}
                    >
                      📂 Prontuário Sync
                    </button>
                  </div>
                </div>

                {/* JSON Payload Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-purple-200 flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      Payload JSON de Requisição HTTP
                    </label>
                    <button
                      type="button"
                      onClick={() => loadPresetPayload(testEvent)}
                      className="text-[10px] text-purple-300 hover:text-amber-300 underline font-medium"
                    >
                      Restaurar Padrão
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={testPayloadJson}
                    onChange={(e) => setTestPayloadJson(e.target.value)}
                    className="w-full bg-slate-950 text-emerald-400 border border-purple-800/80 rounded-xl p-3 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-y"
                    placeholder="Cole seu payload em formato JSON..."
                  />
                </div>

                {/* Dispatch Button */}
                <button
                  type="button"
                  onClick={handleRunPanelTest}
                  disabled={isDispatchingTest || webhooks.length === 0}
                  className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-black text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDispatchingTest ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Disparando Requisição HTTP POST...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Disparar Teste de Webhook Agora</span>
                    </>
                  )}
                </button>

                {/* Immediate Live Result Card */}
                {lastTestResult && (
                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-purple-700/80 space-y-2 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                            lastTestResult.statusCode >= 200 && lastTestResult.statusCode < 300
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          HTTP {lastTestResult.statusCode}
                        </span>
                        <span className="font-bold text-white text-[11px]">
                          {lastTestResult.webhookName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300">
                        ⚡ {lastTestResult.latencyMs}ms • {lastTestResult.timestamp}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-purple-900 text-[11px] font-mono text-slate-300 max-h-24 overflow-y-auto">
                      <p className="text-[10px] font-bold text-purple-400 mb-0.5">RESPOSTA DO SERVIDOR:</p>
                      <code>{lastTestResult.responseBody}</code>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Request Logs Feed (5 cols) */}
              <div className="lg:col-span-5 bg-white/5 p-4 md:p-5 rounded-2xl border border-white/10 space-y-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-purple-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Logs de Requisições Recentes
                    </span>
                    <span className="text-[9px] font-black bg-purple-800 text-purple-200 px-1.5 py-0.2 rounded-full">
                      {webhookLogs.length}
                    </span>
                  </div>

                  {/* Filter Status Code */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setLogFilterStatus('all')}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        logFilterStatus === 'all'
                          ? 'bg-purple-700 text-white'
                          : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/60'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setLogFilterStatus('success')}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        logFilterStatus === 'success'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/60'
                      }`}
                    >
                      2xx
                    </button>
                    <button
                      onClick={() => setLogFilterStatus('error')}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        logFilterStatus === 'error'
                          ? 'bg-rose-600 text-white'
                          : 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/60'
                      }`}
                    >
                      Erros
                    </button>
                  </div>
                </div>

                {/* Logs Feed List */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 flex-1">
                  {webhookLogs.length === 0 ? (
                    <div className="text-center py-12 text-purple-300 space-y-2">
                      <Clock className="w-8 h-8 text-purple-400/50 mx-auto" />
                      <p className="text-xs font-semibold">Nenhum log registrado ainda.</p>
                      <p className="text-[10px] text-purple-400">
                        Clique no botão ao lado para executar o primeiro teste de webhook.
                      </p>
                    </div>
                  ) : (
                    webhookLogs
                      .filter((log) => {
                        if (logFilterStatus === 'success') return log.statusCode >= 200 && log.statusCode < 300;
                        if (logFilterStatus === 'error') return log.statusCode >= 400 || !log.success;
                        return true;
                      })
                      .map((log) => (
                        <div
                          key={log.id}
                          className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-purple-800/60 rounded-xl space-y-2 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${
                                log.statusCode >= 200 && log.statusCode < 300
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              HTTP {log.statusCode}
                            </span>

                            <span className="text-[10px] font-mono text-purple-300">
                              {log.timestamp}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-white truncate">
                              {log.webhookName}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-purple-300 mt-0.5">
                              <span className="font-mono text-emerald-300 font-bold">{log.event}</span>
                              <span className="font-mono text-cyan-300">{log.latencyMs}ms</span>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-purple-900/80 flex items-center justify-between">
                            <button
                              onClick={() => setInspectingLog(log)}
                              className="text-[10px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspecionar JSON</span>
                            </button>

                            <button
                              onClick={() => {
                                setTestEvent(log.event as WebhookEvent);
                                setTestPayloadJson(log.requestPayload);
                                setTestWebhookId(log.webhookId || webhooks[0]?.id || '');
                                showToast('Payload e evento carregados para reenvio!');
                              }}
                              className="text-[10px] text-purple-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reutilizar Payload</span>
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Header & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar webhook por nome, URL ou evento..."
                value={searchWebhookQuery}
                onChange={(e) => setSearchWebhookQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsLogsHistoryOpen(true)}
                className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-purple-700" />
                <span>Logs de Disparo ({webhookLogs.length})</span>
              </button>

              <button
                onClick={handleOpenNewWebhookModal}
                className="flex-1 sm:flex-none bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Webhook</span>
              </button>
            </div>
          </div>

          {/* Webhooks Cards List */}
          <div className="space-y-4">
            {filteredWebhooks.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200/80 space-y-2">
                <Webhook className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nenhum webhook encontrado</p>
                <p className="text-xs text-slate-400">
                  Clique em "Novo Webhook" acima para cadastrar seu primeiro endpoint de notificação.
                </p>
              </div>
            ) : (
              filteredWebhooks.map((wh) => (
                <div
                  key={wh.id}
                  className={`bg-white p-5 rounded-2xl border transition-all space-y-4 ${
                    wh.status === 'Ativo'
                      ? 'border-slate-200/90 hover:border-purple-300 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 opacity-75'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            wh.status === 'Ativo' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <h3 className="text-sm font-bold text-slate-900">{wh.name}</h3>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            wh.status === 'Ativo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {wh.status}
                        </span>
                      </div>

                      {/* Endpoint URL & Secret Key */}
                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-mono text-[11px] border border-slate-200/70">
                          <Globe className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span className="truncate max-w-xs md:max-w-md">{wh.url}</span>
                          <button
                            onClick={() => copyToClipboard(wh.url, 'URL Endpoint')}
                            className="text-slate-400 hover:text-purple-700 p-0.5"
                            title="Copiar URL"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-mono text-[11px] border border-slate-200/70">
                          <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Secret: {wh.secret.substring(0, 10)}•••</span>
                          <button
                            onClick={() => copyToClipboard(wh.secret, 'Segredo HMAC')}
                            className="text-slate-400 hover:text-amber-600 p-0.5"
                            title="Copiar Segredo HMAC"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status & Last Execution */}
                    <div className="flex items-center gap-3 self-end lg:self-center">
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-slate-400">Último disparo</p>
                        <p className="text-xs font-bold text-slate-700">
                          {wh.lastTriggered || 'Nunca'}
                        </p>
                      </div>

                      {wh.lastStatusCode ? (
                        <span
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 border ${
                            wh.lastStatusCode >= 200 && wh.lastStatusCode < 300
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <span>HTTP {wh.lastStatusCode}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Subscribed Events Chips */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
                        Eventos Assinados:
                      </span>
                      {wh.events.map((evt) => (
                        <span
                          key={evt}
                          className="text-[10px] font-bold bg-purple-50 text-purple-900 border border-purple-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1"
                        >
                          {evt === 'patient.created' && <UserCheck className="w-3 h-3 text-purple-600" />}
                          {evt === 'patient.stage_changed' && <Activity className="w-3 h-3 text-indigo-600" />}
                          {evt === 'ehr.synced' && <FileText className="w-3 h-3 text-emerald-600" />}
                          {evt === 'chat.message_received' && <MessageSquare className="w-3 h-3 text-cyan-600" />}
                          {evt === 'triage.completed' && <Bot className="w-3 h-3 text-amber-600" />}
                          {evt === 'appointment.scheduled' && <Calendar className="w-3 h-3 text-rose-600" />}
                          <span>{evt}</span>
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleWebhookStatus(wh)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                          wh.status === 'Ativo'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {wh.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        onClick={() => handleTestWebhook(wh)}
                        disabled={isTestingWebhookId === wh.id}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Enviar payload de teste para este endpoint"
                      >
                        {isTestingWebhookId === wh.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>Testar Disparo</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditWebhookModal(wh)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                        title="Editar Webhook"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteWebhook(wh.id, wh.name)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* NEW/EDIT WEBHOOK MODAL */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Webhook className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingWebhook ? 'Editar Endpoint de Webhook' : 'Novo Endpoint de Webhook'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Notificações REST em tempo real para automações
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWebhookModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nome do Webhook / Integrador
                </label>
                <input
                  type="text"
                  placeholder="Ex: N8N - Notificação de Etapa em Prontuário"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  URL de Destino (Endpoint HTTP POST)
                </label>
                <input
                  type="url"
                  placeholder="https://n8n.suaclinica.com.br/webhook/patient-event"
                  value={whUrl}
                  onChange={(e) => setWhUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Segredo de Assinatura (HMAC Secret Key)
                  </label>
                  <button
                    type="button"
                    onClick={() => setWhSecret(`whsec_${Math.random().toString(36).substring(2, 12)}`)}
                    className="text-[10px] font-bold text-purple-700 hover:underline"
                  >
                    Gerar novo segredo
                  </button>
                </div>
                <input
                  type="text"
                  value={whSecret}
                  onChange={(e) => setWhSecret(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              {/* Event Subscriptions Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Eventos Assinados para Disparo
                </label>

                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 max-h-48 overflow-y-auto">
                  <p className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">
                    📁 Eventos de Prontuário & Atendimento
                  </p>

                  <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whEvents.includes('patient.created')}
                      onChange={() => toggleEventSelection('patient.created')}
                      className="mt-0.5 accent-purple-700 rounded"
                    />
                    <div>
                      <span className="font-bold">patient.created</span>
                      <p className="text-[10px] text-slate-500">Novo paciente cadastrado ou iniciado no CRM</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whEvents.includes('patient.stage_changed')}
                      onChange={() => toggleEventSelection('patient.stage_changed')}
                      className="mt-0.5 accent-purple-700 rounded"
                    />
                    <div>
                      <span className="font-bold">patient.stage_changed</span>
                      <p className="text-[10px] text-slate-500">Avanço de etapa na Jornada (Triagem ➔ Documentos ➔ Agendado)</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whEvents.includes('ehr.synced')}
                      onChange={() => toggleEventSelection('ehr.synced')}
                      className="mt-0.5 accent-purple-700 rounded"
                    />
                    <div>
                      <span className="font-bold">ehr.synced</span>
                      <p className="text-[10px] text-slate-500">Sincronização de Prontuário Eletrônico (iClinic / Feegow)</p>
                    </div>
                  </label>

                  <p className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mt-3 mb-1">
                    💬 Interações & Agendamentos
                  </p>

                  <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whEvents.includes('chat.message_received')}
                      onChange={() => toggleEventSelection('chat.message_received')}
                      className="mt-0.5 accent-purple-700 rounded"
                    />
                    <div>
                      <span className="font-bold">chat.message_received</span>
                      <p className="text-[10px] text-slate-500">Nova mensagem recebida via WhatsApp ou Telegram</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whEvents.includes('triage.completed')}
                      onChange={() => toggleEventSelection('triage.completed')}
                      className="mt-0.5 accent-purple-700 rounded"
                    />
                    <div>
                      <span className="font-bold">triage.completed</span>
                      <p className="text-[10px] text-slate-500">Triagem médica de IA finalizada com cálculo de urgência</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whEvents.includes('triage.accuracy_alert')}
                      onChange={() => toggleEventSelection('triage.accuracy_alert')}
                      className="mt-0.5 accent-purple-700 rounded"
                    />
                    <div>
                      <span className="font-bold text-rose-700">triage.accuracy_alert</span>
                      <p className="text-[10px] text-slate-500">Alerta se a taxa de precisão da triagem cair abaixo do limite definido</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whEvents.includes('appointment.scheduled')}
                      onChange={() => toggleEventSelection('appointment.scheduled')}
                      className="mt-0.5 accent-purple-700 rounded"
                    />
                    <div>
                      <span className="font-bold">appointment.scheduled</span>
                      <p className="text-[10px] text-slate-500">Consulta médica confirmada no sistema de agenda</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-800">Status Inicial</span>
                <button
                  type="button"
                  onClick={() => setWhStatus(whStatus === 'Ativo' ? 'Inativo' : 'Ativo')}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                    whStatus === 'Ativo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {whStatus}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsWebhookModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveWebhook}
                className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-xs"
              >
                {editingWebhook ? 'Salvar Alterações' : 'Criar Webhook'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT LOG / TEST RESULT MODAL */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    inspectingLog.success
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  HTTP {inspectingLog.statusCode}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Inspeção de Payload & Resposta HTTP
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {inspectingLog.webhookName} • Latência: {inspectingLog.latencyMs}ms
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">EVENTO DISPARADO</span>
                  <span className="font-mono font-bold text-purple-800">{inspectingLog.event}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">DATA E HORA</span>
                  <span className="font-semibold text-slate-700">{inspectingLog.timestamp}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>Request Payload (Enviado em JSON)</span>
                </p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-44 border border-slate-800">
                  {inspectingLog.requestPayload}
                </pre>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Response Body (Retorno do Servidor)</span>
                </p>
                <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 border border-slate-800">
                  {inspectingLog.responseBody}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectingLog(null)}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGS HISTORY MODAL */}
      {isLogsHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Histórico de Execução de Webhooks
                </h3>
              </div>
              <button
                onClick={() => setIsLogsHistoryOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {webhookLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Nenhum log de disparo registrado até o momento.
                </p>
              ) : (
                webhookLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setInspectingLog(log)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md font-mono ${
                            log.statusCode >= 200 && log.statusCode < 300
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          HTTP {log.statusCode}
                        </span>
                        <p className="text-xs font-bold text-slate-900">{log.webhookName}</p>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Evento: <span className="font-mono text-purple-700">{log.event}</span> • Data: {log.timestamp}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{log.latencyMs}ms</span>
                      <Eye className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsLogsHistoryOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW AUTOMATION RULE MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Criar Nova Automação de Atendimento
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nome da Automação
                </label>
                <input
                  type="text"
                  placeholder="Ex: Confirmação de consulta 24h antes"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Gatilho de Disparo
                </label>
                <select
                  value={newRuleTrigger}
                  onChange={(e) => setNewRuleTrigger(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <option>Novo contato via WhatsApp</option>
                  <option>Mudança de etapa para Proposta</option>
                  <option>Envio de comprovante de pagamento</option>
                  <option>Ausência de resposta por 24h</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAutomation}
                className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Criar Automação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
